import cron from 'node-cron';
import { PoolClient } from 'pg';
import { emailQueue, whatsappQueue, notificationQueue } from './queue';
import { logger } from '../config/logger';
import pool from '../config/database';

interface Appointment {
  id: number;
  client_id: number;
  date: Date;
  duration: number;
  status: string;
  reminder_sent_at: Date | null;
  created_at: Date;
  updated_at: Date;
  client_name: string;
  client_email: string;
  client_phone: string;
}

export class ReminderScheduler {
  private db!: PoolClient;

  constructor() {
    this.initializeDatabase();
    this.scheduleReminderJobs();
    this.scheduleCleanupJob();
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
    // Run every minute
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
    // Run daily at 2 AM
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

    // Find appointments in the next hour that haven't had reminders sent
    const query = `
      SELECT a.*, c.name as client_name, c.email as client_email, c.phone as client_phone
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      WHERE a.status = 'booked' 
        AND a.date BETWEEN $1 AND $2
        AND (a.reminder_sent_at IS NULL OR a.reminder_sent_at < $3)
      ORDER BY a.date
    `;

    const result = await this.db.query(query, [now, oneHourFromNow, new Date(now.getTime() - 24 * 60 * 60 * 1000)]);

    if (result.rows.length === 0) {
      logger.info('No upcoming appointments found for reminder scheduling');
      return;
    }

    logger.info(`Found ${result.rows.length} appointments for reminder scheduling`);

    for (const appointment of result.rows) {
      await this.scheduleReminderJobsForAppointment(appointment);
      
      // Mark reminders as scheduled
      await this.markRemindersScheduled(appointment.id);
    }
  }

  private async scheduleReminderJobsForAppointment(appointment: Appointment): Promise<void> {
    const appointmentTime = new Date(appointment.date);
    
    // Schedule 1-hour reminder
    const oneHourBefore = new Date(appointmentTime.getTime() - 60 * 60 * 1000);
    if (oneHourBefore > new Date()) {
      await this.scheduleReminderJob(appointment, '1-hour', oneHourBefore);
    }

    // Schedule 30-minute reminder
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
      appointmentTime: appointment.date,
      duration: appointment.duration,
      type: type
    };

    // Schedule email reminder
    await emailQueue.add('send reminder', jobData, {
      delay: scheduledTime.getTime() - Date.now(),
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    // Schedule WhatsApp reminder (if phone number exists)
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
      SET reminder_sent_at = NOW() 
      WHERE id = $1
    `;
    await this.db.query(updateQuery, [appointmentId]);
  }

  private async cleanupOldAppointments(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 14); // 14 days ago

    const query = `
      DELETE FROM appointments 
      WHERE status IN ('completed', 'missed', 'cancelled')
        AND updated_at < $1
    `;

    const result = await this.db.query(query, [cutoffDate]);
    
    if (result.rowCount && result.rowCount > 0) {
      logger.info(`Cleaned up ${result.rowCount} old appointments`);
    } else {
      logger.info('No old appointments found for cleanup');
    }
  }

  public async shutdown(): Promise<void> {
    if (this.db) {
      this.db.release();
      logger.info('Reminder scheduler database connection closed');
    }
  }
}

// Export singleton instance
export const reminderScheduler = new ReminderScheduler();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await reminderScheduler.shutdown();
});

process.on('SIGINT', async () => {
  await reminderScheduler.shutdown();
});