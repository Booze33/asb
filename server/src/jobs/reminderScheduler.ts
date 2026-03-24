import cron from 'node-cron';
import { PoolClient } from 'pg';
import { emailQueue, whatsappQueue, notificationQueue } from './queue';
import { logger } from '../config/logger';
import pool from '../config/database';

interface Appointment {
  id: number;
  client_id: number;
  date_time: Date;
  duration: number;
  status: string;
  reminder_scheduled_at: Date | null;
  created_at: Date;
  updated_at: Date;
  client_name: string;
  client_email: string;
  client_phone: string;
}

export class ReminderScheduler {
  private db!: PoolClient;

  private constructor() {}

  public static async create(): Promise<ReminderScheduler> {
    const scheduler = new ReminderScheduler();
    await scheduler.initializeDatabase();
    scheduler.scheduleReminderJobs();
    scheduler.scheduleCleanupJob();
    return scheduler;
  }

  private async initializeDatabase(): Promise<void> {
    try {
      this.db = await pool.connect();
      logger.info('Reminder scheduler database connection established');
    } catch (error) {
      logger.error('Failed to connect to database for reminder scheduler:', error);
      throw error;
    }
  }

  private scheduleReminderJobs(): void {
    cron.schedule('* * * * *', async () => {
      try {
        logger.info('Running reminder scheduler...');
        await this.processUpcomingAppointments();
      } catch (error) {
        logger.error('Error in reminder scheduler:', error);
      }
    });

    logger.info('Reminder scheduler configured to run every minute');
  }

  private scheduleCleanupJob(): void {
    cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('Running daily cleanup job...');
        await this.cleanupOldAppointments();
      } catch (error) {
        logger.error('Error in cleanup job:', error);
      }
    });

    logger.info('Cleanup job configured to run daily at 2 AM');
  }

  private async processUpcomingAppointments(): Promise<void> {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

    const query = `
      SELECT a.*, c.name as client_name, c.email as client_email, c.phone as client_phone
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      WHERE a.status = 'booked' 
        AND a.date_time BETWEEN $1 AND $2
        AND (a.reminder_scheduled_at IS NULL OR a.reminder_scheduled_at < $3)
      ORDER BY a.date_time
    `;

    const result = await this.db.query(query, [now, oneHourFromNow, new Date(now.getTime() - 24 * 60 * 60 * 1000)]);

    if (result.rows.length === 0) {
      logger.info('No upcoming appointments found for reminder scheduling');
      return;
    }

    logger.info(`Found ${result.rows.length} appointments for reminder scheduling`);

    for (const appointment of result.rows) {
      await this.scheduleReminderJobsForAppointment(appointment);

      await this.markRemindersScheduled(appointment.id);
    }
  }

  private async scheduleReminderJobsForAppointment(appointment: Appointment): Promise<void> {
    const appointmentTime = new Date(appointment.date_time);

    const oneHourBefore = new Date(appointmentTime.getTime() - 60 * 60 * 1000);
    if (oneHourBefore > new Date()) {
      await this.scheduleReminderJob(appointment, '1-hour', oneHourBefore);
    }

    const thirtyMinutesBefore = new Date(appointmentTime.getTime() - 30 * 60 * 1000);
    if (thirtyMinutesBefore > new Date()) {
      await this.scheduleReminderJob(appointment, '30-minutes', thirtyMinutesBefore);
    }
  }

  private async scheduleReminderJob(appointment: Appointment, type: string, scheduledTime: Date): Promise<void> {
    const jobData = {
      appointmentId: appointment.id,
      clientId: appointment.client_id,
      clientName: appointment.client_name,
      clientEmail: appointment.client_email,
      clientPhone: appointment.client_phone,
      appointmentTime: appointment.date_time,
      duration: appointment.duration,
      type: type
    };

    await emailQueue.add('send reminder', jobData, {
      delay: scheduledTime.getTime() - Date.now(),
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    if (appointment.client_phone) {
      await whatsappQueue.add('send reminder', jobData, {
        delay: scheduledTime.getTime() - Date.now(),
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      });
    }

    logger.info(`Scheduled ${type} reminder for appointment ${appointment.id} at ${scheduledTime.toISOString()}`);
  }

  private async markRemindersScheduled(appointmentId: number): Promise<void> {
    const updateQuery = `
      UPDATE appointments 
      SET reminder_scheduled_at = NOW() 
      WHERE id = $1
    `;
    await this.db.query(updateQuery, [appointmentId]);
  }

  private async cleanupOldAppointments(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 14); // 14 days ago

    try {
      // Start a transaction to ensure atomicity
      await this.db.query('BEGIN');

      // Step 1: Archive notification logs before deleting appointments
      const archiveQuery = `
        INSERT INTO archived_notification_logs (
          original_id, appointment_id, client_id, channel, notification_type, 
          status, template_used, error_message, sent_at, created_at, archive_reason
        )
        SELECT 
          id, appointment_id, client_id, channel, notification_type,
          status, template_used, error_message, sent_at, created_at, 'appointment_cleanup'
        FROM notification_logs 
        WHERE appointment_id IN (
          SELECT id FROM appointments 
          WHERE status IN ('completed', 'missed', 'cancelled')
            AND updated_at < $1
        )
      `;

      const archiveResult = await this.db.query(archiveQuery, [cutoffDate]);
      const archivedCount = archiveResult.rowCount || 0;

      if (archivedCount > 0) {
        logger.info(`Archived ${archivedCount} notification logs before appointment cleanup`);
      }

      // Step 2: Delete old appointments (notification_logs.appointment_id will be set to NULL due to ON DELETE SET NULL)
      const deleteQuery = `
        DELETE FROM appointments 
        WHERE status IN ('completed', 'missed', 'cancelled')
          AND updated_at < $1
      `;

      const deleteResult = await this.db.query(deleteQuery, [cutoffDate]);
      const deletedCount = deleteResult.rowCount || 0;

      // Step 3: Clean up orphaned notification logs (those with NULL appointment_id that are old)
      const cleanupOrphansQuery = `
        DELETE FROM notification_logs 
        WHERE appointment_id IS NULL 
          AND created_at < $1
      `;

      const orphanResult = await this.db.query(cleanupOrphansQuery, [cutoffDate]);
      const orphanCount = orphanResult.rowCount || 0;

      // Commit the transaction
      await this.db.query('COMMIT');

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} old appointments`);
      } else {
        logger.info('No old appointments found for cleanup');
      }

      if (orphanCount > 0) {
        logger.info(`Cleaned up ${orphanCount} orphaned notification logs`);
      }

    } catch (error) {
      // Rollback the transaction if anything fails
      await this.db.query('ROLLBACK');
      logger.error('Error in cleanup job - transaction rolled back:', error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    if (this.db) {
      this.db.release();
      logger.info('Reminder scheduler database connection closed');
    }
  }
}

