import { Request, Response } from 'express';
import { PoolClient } from 'pg';
import { ClientModel } from '../models/Client';
import { AppointmentModel } from '../models/Appointment';
import { emailQueue, notificationQueue } from '../jobs/queue';
import { logger } from '../config/logger';
import { cacheService, CACHE_KEYS, CACHE_CONFIG } from '../config/cache';
import { createAppointmentSchema, getAppointmentSchema } from '../utils/validationSchemas';

export class AppointmentController {
  private clientModel: ClientModel;
  private appointmentModel: AppointmentModel;

  constructor(db: PoolClient) {
    this.clientModel = new ClientModel(db);
    this.appointmentModel = new AppointmentModel(db);
  }

  async createAppointment(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const { error, value } = createAppointmentSchema.validate(req.body);
      console.log('Received appointment data error:', error);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
        return;
      }

      const { name, email, phone, address, date_time, duration, service } = value;

      // Check for double booking
      const existingAppointment = await this.appointmentModel.findByDateTime(new Date(date_time));
      if (existingAppointment) {
        res.status(409).json({
          success: false,
          message: 'This time slot is already booked. Please choose a different time.'
        });
        return;
      }

      // Check if client exists with caching
      let client = null;
      
      // Try to get client from cache first
      try {
        if (email) {
          const cachedClient = await cacheService.get(CACHE_KEYS.CLIENT_BY_EMAIL(email));
          if (cachedClient) {
            client = cachedClient;
            logger.info(`Client found in cache: ${client.id} - ${client.name}`);
          }
        }

        if (!client && phone) {
          const cachedClient = await cacheService.get(CACHE_KEYS.CLIENT_BY_PHONE(phone));
          if (cachedClient) {
            client = cachedClient;
            logger.info(`Client found in cache: ${client.id} - ${client.name}`);
          }
        }
      } catch (cacheError) {
        logger.warn('Cache lookup failed, proceeding without cache:', cacheError);
      }

      if (!client) {
        // Check database
        client = await this.clientModel.findByEmailOrPhone(email, phone);

        if (client) {
          // Try to cache the found client
          try {
            await this.cacheClient(client);
            logger.info(`Client found in database and cached: ${client.id} - ${client.name}`);
          } catch (cacheError) {
            logger.warn(`Failed to cache client ${client.id}:`, cacheError);
          }
        }
      }

      if (!client) {
        // Create new client
        client = await this.clientModel.create({
          name,
          email,
          phone,
          address
        });
        
        // Try to cache the new client
        try {
          await this.cacheClient(client);
          logger.info(`Created new client and cached: ${client.id} - ${client.name}`);
        } catch (cacheError) {
          logger.warn(`Failed to cache new client ${client.id}:`, cacheError);
        }
      }

      // Create appointment
      const appointment = await this.appointmentModel.create({
        client_id: client.id,
        service: service || 'General Appointment',
        date_time: new Date(date_time),
        duration,
        status: 'booked'
      });

      // Try to enqueue confirmation notification using unified notification service
      try {
        await notificationQueue.add('send notification', {
          appointmentId: appointment.id,
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          clientPhone: client.phone,
          appointmentTime: appointment.date_time,
          duration: appointment.duration,
          type: 'confirmation',
          channel: 'email'
        });

        // Also send WhatsApp notification if phone number exists
        if (client.phone) {
          await notificationQueue.add('send notification', {
            appointmentId: appointment.id,
            clientId: client.id,
            clientName: client.name,
            clientEmail: client.email,
            clientPhone: client.phone,
            appointmentTime: appointment.date_time,
            duration: appointment.duration,
            type: 'confirmation',
            channel: 'whatsapp'
          });
        }
        logger.info(`Notification jobs enqueued for appointment: ${appointment.id}`);
      } catch (notificationError) {
        logger.warn(`Failed to enqueue notification for appointment ${appointment.id}:`, notificationError);
        // Continue with the appointment creation even if notifications fail
      }

      logger.info(`Created appointment: ${appointment.id} for client: ${client.id}`);

      res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: {
          appointment: {
            id: appointment.id,
            date_time: appointment.date_time,
            duration: appointment.duration,
            status: appointment.status,
            client: {
              id: client.id,
              name: client.name,
              email: client.email,
              phone: client.phone,
              address: client.address
            }
          }
        }
      });

    } catch (error) {
      logger.error('Error creating appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getAppointment(req: Request, res: Response): Promise<void> {
    try {
      const rawEmail = req.query.email;

      if (!rawEmail || Array.isArray(rawEmail)) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: ['email must be a single string query parameter']
        });
        return;
      }

      const email = rawEmail as string;
      const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: ['Appointment ID must be a valid number']
        });
        return;
      }

      // Validate input
      const { error, value } = getAppointmentSchema.validate({ id, email });

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
        return;
      }

      const appointment = await this.appointmentModel.findById(id);

      if (!appointment) {
        res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
        return;
      }

      // Verify client owns this appointment
      if (appointment.email !== email) {
        res.status(403).json({
          success: false,
          message: 'Access denied: This appointment does not belong to the provided email'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          appointment: {
            id: appointment.id,
            date_time: appointment.date_time,
            duration: appointment.duration,
            status: appointment.status,
            client: {
              id: appointment.client_id,
              name: appointment.name,
              email: appointment.email,
              phone: appointment.phone,
              address: appointment.address
            }
          }
        }
      });

    } catch (error) {
      logger.error('Error retrieving appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  /**
   * Cache client details for frequent lookups
   */
  private async cacheClient(client: any): Promise<void> {
    try {
      const clientData = {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address
      };

      // Cache by email if available
      if (client.email) {
        await cacheService.set(CACHE_KEYS.CLIENT_BY_EMAIL(client.email), clientData, CACHE_CONFIG.CLIENT_TTL);
      }

      // Cache by phone if available
      if (client.phone) {
        await cacheService.set(CACHE_KEYS.CLIENT_BY_PHONE(client.phone), clientData, CACHE_CONFIG.CLIENT_TTL);
      }

      // Cache by ID
      await cacheService.set(CACHE_KEYS.CLIENT_BY_ID(client.id), clientData, CACHE_CONFIG.CLIENT_TTL);

      logger.info(`Client cached: ${client.id} - ${client.name}`);
    } catch (error) {
      logger.error('Error caching client:', error);
    }
  }
}
