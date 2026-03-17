import app from './app';
import { logger } from './config/logger';
import pool from './config/database';
import { emailQueue, whatsappQueue } from './jobs/queue';
import { reminderScheduler } from './jobs/reminderScheduler';
import { queueMonitoring } from './jobs/monitoring';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    await pool.connect();
    logger.info('Database connected successfully');

    // Start background jobs
    logger.info('Starting background job processors...');
    
    // Process email queue
    emailQueue.process('send email', async (job) => {
      const { to, subject, text, html } = job.data;
      const { sendEmail } = await import('./services/emailService');
      return await sendEmail(to, subject, text, html);
    });

    // Process WhatsApp queue
    whatsappQueue.process('send whatsapp', async (job) => {
      const { to, body } = job.data;
      const { sendWhatsAppMessage } = await import('./services/whatsappService');
      return await sendWhatsAppMessage(to, body);
    });

    // Process reminder queue
    emailQueue.process('send reminder', async (job) => {
      const { appointmentId, clientName, clientEmail, appointmentTime, duration, type } = job.data;
      const { sendEmail } = await import('./services/emailService');
      
      const subject = `Appointment Reminder - ${type}`;
      const text = `Hello ${clientName},\n\nThis is a reminder for your appointment scheduled for ${new Date(appointmentTime).toLocaleString()} with a duration of ${duration} minutes.\n\nWe look forward to seeing you!\n\nThank you!`;
      const html = `<p>Hello ${clientName},</p><p>This is a reminder for your appointment scheduled for ${new Date(appointmentTime).toLocaleString()} with a duration of ${duration} minutes.</p><p>We look forward to seeing you!</p><p>Thank you!</p>`;
      
      return await sendEmail(clientEmail, subject, text, html);
    });

    whatsappQueue.process('send reminder', async (job) => {
      const { appointmentId, clientName, clientPhone, appointmentTime, duration, type } = job.data;
      const { sendWhatsAppMessage } = await import('./services/whatsappService');
      
      const body = `Hello ${clientName}, this is a reminder for your appointment scheduled for ${new Date(appointmentTime).toLocaleString()} with a duration of ${duration} minutes. We look forward to seeing you!`;
      
      return await sendWhatsAppMessage(clientPhone, body);
    });

    // Set up job event listeners for monitoring
    emailQueue.on('completed', (job) => {
      logger.info(`Email job ${job.id} completed`);
    });

    emailQueue.on('failed', (job, err) => {
      logger.error(`Email job ${job.id} failed:`, err);
    });

    whatsappQueue.on('completed', (job) => {
      logger.info(`WhatsApp job ${job.id} completed`);
    });

    whatsappQueue.on('failed', (job, err) => {
      logger.error(`WhatsApp job ${job.id} failed:`, err);
    });

    logger.info('Background job processors started successfully');

    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Queue monitoring available at: http://localhost:${PORT}/bull-board`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      await reminderScheduler.shutdown();
      server.close(() => {
        pool.end(() => {
          logger.info('Process terminated');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully');
      await reminderScheduler.shutdown();
      server.close(() => {
        pool.end(() => {
          logger.info('Process terminated');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
