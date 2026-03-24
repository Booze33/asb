import Queue from 'bull';
import pool from '../config/database';
import { NotificationService } from '../services/notificationService';
import { logger } from '../config/logger';

// Create a new Bull queue for emails
const emailQueue = new Queue('email queue', process.env.REDIS_URL || 'redis://default:your_strong_redis_password_here@redis:6379');

// Create a new Bull queue for WhatsApp
const whatsappQueue = new Queue('whatsapp queue', process.env.REDIS_URL || 'redis://default:your_strong_redis_password_here@redis:6379');

// Create a unified notification queue
const notificationQueue = new Queue('notification queue', process.env.REDIS_URL || 'redis://default:your_strong_redis_password_here@redis:6379');


// Process notification jobs (new unified system)
notificationQueue.process('send notification', async (job) => {
  const { appointmentId, clientId, clientName, clientEmail, clientPhone, appointmentTime, duration, type, channel } = job.data;
  
  try {
    // Get database connection
    const db = await pool.connect();
    
    // Create notification service
    const notificationService = new NotificationService(db);
    
    // Prepare notification data
    const notificationData = {
      appointmentId,
      clientId,
      clientName,
      clientEmail,
      clientPhone,
      appointmentTime: new Date(appointmentTime),
      duration,
      type,
      channel
    };
    
    // Send notification
    const result = await notificationService.sendNotification(notificationData);
    
    // Release database connection
    db.release();
    
    return result;
    
  } catch (error) {
    logger.error('Notification job failed:', error);
    throw error;
  }
});

// Process email jobs (for admin operations like password reset, cancellations, etc.)
emailQueue.process('send email', async (job) => {
  const { to, subject, text, html } = job.data;
  
  // Import the email service
  const { sendEmail } = await import('../services/emailService');
  
  const result = await sendEmail(to, subject, text, html);
  return result;
});

// Process reminder jobs (legacy support - will be replaced by notification queue)
emailQueue.process('send reminder', async (job) => {
  const { appointmentId, clientName, clientEmail, appointmentTime, duration, type } = job.data;
  
  // Import the email service
  const { sendEmail } = await import('../services/emailService');
  
  const subject = `Appointment Reminder - ${type}`;
  const text = `Hello ${clientName},\n\nThis is a reminder for your appointment scheduled for ${new Date(appointmentTime).toLocaleString()} with a duration of ${duration} minutes.\n\nWe look forward to seeing you!\n\nThank you!`;
  const html = `<p>Hello ${clientName},</p><p>This is a reminder for your appointment scheduled for ${new Date(appointmentTime).toLocaleString()} with a duration of ${duration} minutes.</p><p>We look forward to seeing you!</p><p>Thank you!</p>`;
  
  const result = await sendEmail(clientEmail, subject, text, html);
  return result;
});

whatsappQueue.process('send reminder', async (job) => {
  const { appointmentId, clientName, clientPhone, appointmentTime, duration, type } = job.data;
  
  // Import the WhatsApp service
  const { sendWhatsAppMessage } = await import('../services/whatsappService');
  
  const body = `Hello ${clientName}, this is a reminder for your appointment scheduled for ${new Date(appointmentTime).toLocaleString()} with a duration of ${duration} minutes. We look forward to seeing you!`;
  
  const result = await sendWhatsAppMessage(clientPhone, body);
  return result;
});

export { emailQueue, whatsappQueue, notificationQueue };
