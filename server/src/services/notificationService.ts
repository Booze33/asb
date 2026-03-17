import { PoolClient } from 'pg';
import { sendEmail } from './emailService';
import { sendWhatsAppMessage } from './whatsappService';
import { logger } from '../config/logger';

export interface NotificationData {
  appointmentId: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  appointmentTime: Date;
  duration: number;
  type: 'confirmation' | 'reminder' | 'cancellation' | 'completed' | 'missed';
  channel: 'email' | 'whatsapp';
}

export interface NotificationResult {
  success: boolean;
  channel: string;
  recipient: string;
  template: string;
  error?: string;
}

export class NotificationService {
  private db: PoolClient;

  constructor(db: PoolClient) {
    this.db = db;
  }

  async sendNotification(data: NotificationData): Promise<NotificationResult> {
    try {
      const template = this.getTemplate(data.type, data.channel);
      const message = this.renderTemplate(template, data);

      let success = false;
      let error: string | undefined;

      if (data.channel === 'email') {
        success = await this.sendEmailNotification(data, message);
      } else if (data.channel === 'whatsapp') {
        success = await this.sendWhatsAppNotification(data, message);
      }

      if (success) {
        await this.logNotification(data, 'success', template);
        logger.info(`Notification sent successfully: ${data.channel} to ${data.clientEmail || data.clientPhone}`);
      } else {
        error = 'Failed to send notification';
        await this.logNotification(data, 'failed', template, error);
        logger.error(`Notification failed: ${data.channel} to ${data.clientEmail || data.clientPhone}`);
      }

      return {
        success,
        channel: data.channel,
        recipient: data.clientEmail || (data.clientPhone as string),
        template: data.type,
        error
      };

    } catch (error) {
      logger.error('Error sending notification:', error);
      await this.logNotification(data, 'error', data.type, error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        channel: data.channel,
        recipient: data.clientEmail || (data.clientPhone as string),
        template: data.type,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async sendEmailNotification(data: NotificationData, message: { subject: string; text: string; html: string }): Promise<boolean> {
    try {
      const result = await sendEmail(data.clientEmail, message.subject, message.text, message.html);
      return result.success;
    } catch (error) {
      logger.error('Email sending failed:', error);
      return false;
    }
  }

  private async sendWhatsAppNotification(data: NotificationData, message: { body: string }): Promise<boolean> {
    if (!data.clientPhone) {
      logger.warn('No phone number provided for WhatsApp notification');
      return false;
    }

    try {
      const result = await sendWhatsAppMessage(data.clientPhone, message.body);
      return result.success;
    } catch (error) {
      logger.error('WhatsApp sending failed:', error);
      return false;
    }
  }

  private getTemplate(type: 'confirmation' | 'reminder' | 'cancellation' | 'completed' | 'missed', channel: 'email' | 'whatsapp'): any {
    const emailTemplates = {
      confirmation: {
        subject: 'Appointment Confirmation - {{businessName}}',
        text: `Hello {{clientName}},

Thank you for booking your appointment with {{businessName}}!

Your appointment details:
- Date & Time: {{appointmentDateTime}}
- Duration: {{duration}} minutes
- Location: {{businessAddress}}

We look forward to seeing you!

Best regards,
{{businessName}} Team`,
        html: `<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
    .content { padding: 20px; }
    .details { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .footer { margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Appointment Confirmation</h2>
      <p>{{businessName}}</p>
    </div>
    <div class="content">
      <p>Hello {{clientName}},</p>
      <p>Thank you for booking your appointment with <strong>{{businessName}}</strong>!</p>
      
      <div class="details">
        <h3>Appointment Details</h3>
        <p><strong>Date & Time:</strong> {{appointmentDateTime}}</p>
        <p><strong>Duration:</strong> {{duration}} minutes</p>
        <p><strong>Location:</strong> {{businessAddress}}</p>
      </div>
      
      <p>We look forward to seeing you!</p>
      
      <p>Best regards,<br>
      <strong>{{businessName}} Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`
      },
      reminder: {
        subject: 'Reminder: Your Appointment is Coming Up - {{businessName}}',
        text: `Hello {{clientName}},

This is a friendly reminder about your upcoming appointment with {{businessName}}.

Appointment details:
- Date & Time: {{appointmentDateTime}}
- Duration: {{duration}} minutes

We look forward to seeing you!

Best regards,
{{businessName}} Team`,
        html: `<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #fff3cd; padding: 20px; text-align: center; border-radius: 5px; border: 1px solid #ffeaa7; }
    .content { padding: 20px; }
    .details { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .footer { margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>⏰ Appointment Reminder</h2>
      <p>{{businessName}}</p>
    </div>
    <div class="content">
      <p>Hello {{clientName}},</p>
      <p>This is a friendly reminder about your upcoming appointment with <strong>{{businessName}}</strong>.</p>
      
      <div class="details">
        <h3>Appointment Details</h3>
        <p><strong>Date & Time:</strong> {{appointmentDateTime}}</p>
        <p><strong>Duration:</strong> {{duration}} minutes</p>
      </div>
      
      <p>We look forward to seeing you!</p>
      
      <p>Best regards,<br>
      <strong>{{businessName}} Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`
      },
      cancellation: {
        subject: 'Appointment Cancelled - {{businessName}}',
        text: `Hello {{clientName}},

We regret to inform you that your appointment with {{businessName}} has been cancelled.

Cancelled appointment details:
- Date & Time: {{appointmentDateTime}}
- Duration: {{duration}} minutes

We apologize for any inconvenience. Please contact us to reschedule.

Thank you,
{{businessName}} Team`,
        html: `<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f8d7da; padding: 20px; text-align: center; border-radius: 5px; border: 1px solid #f5c6cb; color: #721c24; }
    .content { padding: 20px; }
    .details { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .footer { margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>❌ Appointment Cancelled</h2>
      <p>{{businessName}}</p>
    </div>
    <div class="content">
      <p>Hello {{clientName}},</p>
      <p>We regret to inform you that your appointment with <strong>{{businessName}}</strong> has been cancelled.</p>
      
      <div class="details">
        <h3>Cancelled Appointment Details</h3>
        <p><strong>Date & Time:</strong> {{appointmentDateTime}}</p>
        <p><strong>Duration:</strong> {{duration}} minutes</p>
      </div>
      
      <p>We apologize for any inconvenience. Please contact us to reschedule.</p>
      
      <p>Thank you,<br>
      <strong>{{businessName}} Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`
      },
      completed: {
        subject: 'Thank You! Your Appointment is Complete - {{businessName}}',
        text: `Hello {{clientName}},

Thank you for visiting {{businessName}}! Your appointment has been completed successfully.

Appointment details:
- Date & Time: {{appointmentDateTime}}
- Duration: {{duration}} minutes

We hope you had a great experience. We look forward to serving you again soon!

Thank you,
{{businessName}} Team`,
        html: `<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #d4edda; padding: 20px; text-align: center; border-radius: 5px; border: 1px solid #c3e6cb; color: #155724; }
    .content { padding: 20px; }
    .details { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .footer { margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>✅ Appointment Completed</h2>
      <p>{{businessName}}</p>
    </div>
    <div class="content">
      <p>Hello {{clientName}},</p>
      <p>Thank you for visiting <strong>{{businessName}}</strong>! Your appointment has been completed successfully.</p>
      
      <div class="details">
        <h3>Appointment Details</h3>
        <p><strong>Date & Time:</strong> {{appointmentDateTime}}</p>
        <p><strong>Duration:</strong> {{duration}} minutes</p>
      </div>
      
      <p>We hope you had a great experience. We look forward to serving you again soon!</p>
      
      <p>Thank you,<br>
      <strong>{{businessName}} Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`
      },
      missed: {
        subject: 'Missed Appointment - {{businessName}}',
        text: `Hello {{clientName}},

We noticed you missed your appointment with {{businessName}}.

Missed appointment details:
- Date & Time: {{appointmentDateTime}}
- Duration: {{duration}} minutes

If you would like to reschedule, please contact us.

Thank you,
{{businessName}} Team`,
        html: `<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #fff3cd; padding: 20px; text-align: center; border-radius: 5px; border: 1px solid #ffeaa7; }
    .content { padding: 20px; }
    .details { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .footer { margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>⏰ Missed Appointment</h2>
      <p>{{businessName}}</p>
    </div>
    <div class="content">
      <p>Hello {{clientName}},</p>
      <p>We noticed you missed your appointment with <strong>{{businessName}}</strong>.</p>
      
      <div class="details">
        <h3>Missed Appointment Details</h3>
        <p><strong>Date & Time:</strong> {{appointmentDateTime}}</p>
        <p><strong>Duration:</strong> {{duration}} minutes</p>
      </div>
      
      <p>If you would like to reschedule, please contact us.</p>
      
      <p>Thank you,<br>
      <strong>{{businessName}} Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`
      }
    };

    const whatsappTemplates = {
      confirmation: `Hello {{clientName}},

Thank you for booking your appointment with {{businessName}}!

📅 Date & Time: {{appointmentDateTime}}
⏱️ Duration: {{duration}} minutes
📍 Location: {{businessAddress}}

We look forward to seeing you!

Best regards,
{{businessName}} Team`,
      reminder: `Hello {{clientName}},

This is a friendly reminder about your upcoming appointment with {{businessName}}.

📅 Date & Time: {{appointmentDateTime}}
⏱️ Duration: {{duration}} minutes

We look forward to seeing you!

Best regards,
{{businessName}} Team`,
      cancellation: `Hello {{clientName}},

We regret to inform you that your appointment with {{businessName}} has been cancelled.

📅 Date & Time: {{appointmentDateTime}}
⏱️ Duration: {{duration}} minutes

We apologize for any inconvenience. Please contact us to reschedule.

Thank you,
{{businessName}} Team`,
      completed: `Hello {{clientName}},

Thank you for visiting {{businessName}}! Your appointment has been completed successfully.

📅 Date & Time: {{appointmentDateTime}}
⏱️ Duration: {{duration}} minutes

We hope you had a great experience. We look forward to serving you again soon!

Thank you,
{{businessName}} Team`,
      missed: `Hello {{clientName}},

We noticed you missed your appointment with {{businessName}}.

📅 Date & Time: {{appointmentDateTime}}
⏱️ Duration: {{duration}} minutes

If you would like to reschedule, please contact us.

Thank you,
{{businessName}} Team`
    };

    if (channel === 'email') {
      return emailTemplates[type];
    } else {
      return whatsappTemplates[type];
    }
  }

  private renderTemplate(template: any, data: NotificationData): any {
    const appointmentDateTime = new Date(data.appointmentTime).toLocaleString();
    const businessName = process.env.BUSINESS_NAME || 'Salon';
    const businessAddress = process.env.BUSINESS_ADDRESS || '123 Salon Street';
    
    if (typeof template === 'string') {
      // WhatsApp template (plain text)
      return template
        .replace(/{{clientName}}/g, data.clientName)
        .replace(/{{businessName}}/g, businessName)
        .replace(/{{appointmentDateTime}}/g, appointmentDateTime)
        .replace(/{{duration}}/g, data.duration.toString())
        .replace(/{{businessAddress}}/g, businessAddress);
    } else {
      // Email template (object with subject, text, html)
      return {
        subject: template.subject
          .replace(/{{clientName}}/g, data.clientName)
          .replace(/{{businessName}}/g, businessName)
          .replace(/{{appointmentDateTime}}/g, appointmentDateTime)
          .replace(/{{duration}}/g, data.duration.toString())
          .replace(/{{businessAddress}}/g, businessAddress),
        text: template.text
          .replace(/{{clientName}}/g, data.clientName)
          .replace(/{{businessName}}/g, businessName)
          .replace(/{{appointmentDateTime}}/g, appointmentDateTime)
          .replace(/{{duration}}/g, data.duration.toString())
          .replace(/{{businessAddress}}/g, businessAddress),
        html: template.html
          .replace(/{{clientName}}/g, data.clientName)
          .replace(/{{businessName}}/g, businessName)
          .replace(/{{appointmentDateTime}}/g, appointmentDateTime)
          .replace(/{{duration}}/g, data.duration.toString())
          .replace(/{{businessAddress}}/g, businessAddress)
      };
    }
  }

  private async logNotification(data: NotificationData, status: string, template: string, error?: string): Promise<void> {
    try {
      const query = `
        INSERT INTO notification_logs (
          appointment_id, 
          client_id, 
          channel, 
          notification_type, 
          status, 
          template_used, 
          error_message, 
          sent_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `;
      
      await this.db.query(query, [
        data.appointmentId,
        data.clientId,
        data.channel,
        data.type,
        status,
        template,
        error || null
      ]);
    } catch (error) {
      logger.error('Failed to log notification:', error);
    }
  }

  async sendBatchNotifications(appointmentIds: number[], type: string, channels: string[]): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    for (const appointmentId of appointmentIds) {
      for (const channel of channels) {
        try {
          // Fetch appointment and client details
          const appointmentQuery = `
            SELECT a.*, c.name as client_name, c.email as client_email, c.phone as client_phone
            FROM appointments a
            JOIN clients c ON a.client_id = c.id
            WHERE a.id = $1
          `;
          const appointmentResult = await this.db.query(appointmentQuery, [appointmentId]);

          if (appointmentResult.rows.length === 0) {
            results.push({
              success: false,
              channel,
              recipient: 'unknown',
              template: type,
              error: 'Appointment not found'
            });
            continue;
          }

          const appointment = appointmentResult.rows[0];
          const notificationData: NotificationData = {
            appointmentId: appointment.id,
            clientId: appointment.client_id,
            clientName: appointment.client_name,
            clientEmail: appointment.client_email,
            clientPhone: appointment.client_phone,
            appointmentTime: appointment.date_time,
            duration: appointment.duration,
            type: type as any,
            channel: channel as any
          };

          const result = await this.sendNotification(notificationData);
          results.push(result);

        } catch (error) {
          results.push({
            success: false,
            channel,
            recipient: 'unknown',
            template: type,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    return results;
  }
}