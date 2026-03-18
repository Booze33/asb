// @ts-nocheck
import { PoolClient } from 'pg';
import { NotificationService, NotificationData, NotificationResult } from '../src/services/notificationService';
import { sendEmail } from '../src/services/emailService';
import { sendWhatsAppMessage } from '../src/services/whatsappService';
import { logger } from '../src/config/logger';

// Mock the email and WhatsApp services
jest.mock('../src/services/emailService');
jest.mock('../src/services/whatsappService');
jest.mock('../src/config/logger');

const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;
const mockSendWhatsAppMessage = sendWhatsAppMessage as jest.MockedFunction<typeof sendWhatsAppMessage>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockDb: jest.Mocked<PoolClient>;

  const baseNotificationData: any = {
    appointmentId: 1,
    clientId: 1,
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    clientPhone: '+1234567890',
    appointmentTime: new Date('2024-01-15T10:00:00'),
    duration: 60,
    type: 'confirmation',
    channel: 'email'
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock database client
    mockDb = {
      query: jest.fn(),
      release: jest.fn(),
    } as any;

    notificationService = new NotificationService(mockDb);

    // Set up default mock implementations
    mockSendEmail.mockResolvedValue({ success: true, message: 'Email sent successfully' });
    mockSendWhatsAppMessage.mockResolvedValue({ success: true, message: 'WhatsApp message sent successfully', sid: 'SM123456789' });
    mockLogger.info = jest.fn();
    mockLogger.error = jest.fn();
    mockLogger.warn = jest.fn();
  });

  describe('sendNotification', () => {
    const baseNotificationData: NotificationData = {
      appointmentId: 1,
      clientId: 1,
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      clientPhone: '+1234567890',
      appointmentTime: new Date('2024-01-15T10:00:00'),
      duration: 60,
      type: 'confirmation',
      channel: 'email'
    };

    it('should send email notification successfully', async () => {
      const result = await notificationService.sendNotification(baseNotificationData);

      expect(result).toEqual({
        success: true,
        channel: 'email',
        recipient: 'john@example.com',
        template: 'confirmation',
        error: undefined
      });

      expect(mockSendEmail).toHaveBeenCalledWith(
        'john@example.com',
        expect.stringContaining('Appointment Confirmation'),
        expect.stringContaining('Hello John Doe'),
        expect.stringContaining('<html>')
      );

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO notification_logs'),
        expect.arrayContaining([
          1, // appointmentId
          1, // clientId
          'email',
          'confirmation',
          'success',
          expect.any(String),
          null
        ])
      );
    });

    it('should send WhatsApp notification successfully', async () => {
      const whatsappData: NotificationData = {
        ...baseNotificationData,
        channel: 'whatsapp'
      };

      const result = await notificationService.sendNotification(whatsappData);

      expect(result).toEqual({
        success: true,
        channel: 'whatsapp',
        recipient: '+1234567890',
        template: 'confirmation',
        error: undefined
      });

      expect(mockSendWhatsAppMessage).toHaveBeenCalledWith(
        '+1234567890',
        expect.stringContaining('Hello John Doe')
      );

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO notification_logs'),
        expect.arrayContaining([
          1, // appointmentId
          1, // clientId
          'whatsapp',
          'confirmation',
          'success',
          expect.any(String),
          null
        ])
      );
    });

    it('should handle email sending failure', async () => {
      mockSendEmail.mockResolvedValue({ success: false, message: 'Failed to send email' });

      const result = await notificationService.sendNotification(baseNotificationData);

      expect(result).toEqual({
        success: false,
        channel: 'email',
        recipient: 'john@example.com',
        template: 'confirmation',
        error: 'Failed to send notification'
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO notification_logs'),
        expect.arrayContaining([
          1, // appointmentId
          1, // clientId
          'email',
          'confirmation',
          'failed',
          expect.any(String),
          'Failed to send notification'
        ])
      );
    });

    it('should handle WhatsApp notification without phone number', async () => {
      const whatsappData: NotificationData = {
        ...baseNotificationData,
        channel: 'whatsapp',
        clientPhone: undefined
      };

      const result = await notificationService.sendNotification(whatsappData);

      expect(result).toEqual({
        success: false,
        channel: 'whatsapp',
        recipient: 'undefined',
        template: 'confirmation',
        error: undefined
      });

      expect(mockSendWhatsAppMessage).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith('No phone number provided for WhatsApp notification');
    });

    it('should handle service errors gracefully', async () => {
      mockSendEmail.mockRejectedValue(new Error('Email service unavailable'));

      const result = await notificationService.sendNotification(baseNotificationData);

      expect(result).toEqual({
        success: false,
        channel: 'email',
        recipient: 'john@example.com',
        template: 'confirmation',
        error: 'Email service unavailable'
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO notification_logs'),
        expect.arrayContaining([
          1, // appointmentId
          1, // clientId
          'email',
          'confirmation',
          'error',
          expect.any(String),
          'Email service unavailable'
        ])
      );
    });

    it('should use correct templates for different notification types', async () => {
      const testCases = [
        { type: 'confirmation', expectedSubject: 'Appointment Confirmation' },
        { type: 'reminder', expectedSubject: 'Reminder: Your Appointment is Coming Up' },
        { type: 'cancellation', expectedSubject: 'Appointment Cancelled' },
        { type: 'completed', expectedSubject: 'Thank You! Your Appointment is Complete' },
        { type: 'missed', expectedSubject: 'Missed Appointment' }
      ];

      for (const testCase of testCases) {
        const notificationData: NotificationData = {
          ...baseNotificationData,
          type: testCase.type as any
        };

        await notificationService.sendNotification(notificationData);

        expect(mockSendEmail).toHaveBeenCalledWith(
          expect.any(String),
          expect.stringContaining(testCase.expectedSubject),
          expect.any(String),
          expect.any(String)
        );
      }
    });

    it('should render templates with correct data', async () => {
      await notificationService.sendNotification(baseNotificationData);

      const emailCall = mockSendEmail.mock.calls[0];
      const subject = emailCall[1];
      const text = emailCall[2];
      const html = emailCall[3];

      expect(subject).toContain('John Doe');
      expect(subject).toContain('Salon');
      expect(text).toContain('Hello John Doe');
      expect(text).toContain('2024-01-15');
      expect(text).toContain('60 minutes');
      expect(html).toContain('Hello John Doe');
      expect(html).toContain('2024-01-15');
      expect(html).toContain('60 minutes');
    });

    it('should use environment variables for business info', async () => {
      // Set environment variables
      process.env.BUSINESS_NAME = 'Test Salon';
      process.env.BUSINESS_ADDRESS = '123 Test Street';

      await notificationService.sendNotification(baseNotificationData);

      const emailCall = mockSendEmail.mock.calls[0];
      const subject = emailCall[1];
      const text = emailCall[2];
      const html = emailCall[3];

      expect(subject).toContain('Test Salon');
      expect(text).toContain('Test Salon');
      expect(text).toContain('123 Test Street');
      expect(html).toContain('Test Salon');
      expect(html).toContain('123 Test Street');

      // Clean up
      delete process.env.BUSINESS_NAME;
      delete process.env.BUSINESS_ADDRESS;
    });
  });

  describe('sendBatchNotifications', () => {
    it('should send multiple notifications successfully', async () => {
      const results = await notificationService.sendBatchNotifications(
        [1, 2],
        'reminder',
        ['email', 'whatsapp']
      );

      expect(results).toHaveLength(4); // 2 appointments × 2 channels

      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.template).toBe('reminder');
      });

      expect(mockSendEmail).toHaveBeenCalledTimes(2);
      expect(mockSendWhatsAppMessage).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed success and failure scenarios', async () => {
      // Mock one successful and one failed email
      mockSendEmail
        .mockResolvedValueOnce({ success: true, message: 'Email sent successfully' })
        .mockResolvedValueOnce({ success: false, message: 'Failed to send email' });

      const results = await notificationService.sendBatchNotifications(
        [1],
        'confirmation',
        ['email', 'whatsapp']
      );

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true); // WhatsApp should still succeed
    });

    it('should handle appointment not found', async () => {
      // Mock database query to return empty result
      mockDb.query.mockResolvedValueOnce({ rows: [] } as any);

      const results = await notificationService.sendBatchNotifications(
        [999], // Non-existent appointment
        'confirmation',
        ['email']
      );

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        success: false,
        channel: 'email',
        recipient: 'unknown',
        template: 'confirmation',
        error: 'Appointment not found'
      });
    });
  });

  describe('template rendering', () => {
    it('should render WhatsApp templates correctly', async () => {
      const whatsappData: NotificationData = {
        ...baseNotificationData,
        channel: 'whatsapp'
      };

      await notificationService.sendNotification(whatsappData);

      expect(mockSendWhatsAppMessage).toHaveBeenCalledWith(
        '+1234567890',
        expect.stringContaining('Hello John Doe')
      );
      expect(mockSendWhatsAppMessage).toHaveBeenCalledWith(
        '+1234567890',
        expect.stringContaining('Test Salon')
      );
      expect(mockSendWhatsAppMessage).toHaveBeenCalledWith(
        '+1234567890',
        expect.stringContaining('2024-01-15')
      );
      expect(mockSendWhatsAppMessage).toHaveBeenCalledWith(
        '+1234567890',
        expect.stringContaining('60 minutes')
      );
    });

    it('should handle different appointment times correctly', async () => {
      const differentTimeData: NotificationData = {
        ...baseNotificationData,
        appointmentTime: new Date('2024-12-25T14:30:00')
      };

      await notificationService.sendNotification(differentTimeData);

      const emailCall = mockSendEmail.mock.calls[0];
      const text = emailCall[2];
      const html = emailCall[3];

      expect(text).toContain('2024-12-25');
      expect(html).toContain('2024-12-25');
    });
  });
});