import { Request, Response } from 'express';
import { PoolClient } from 'pg';
import { AdminModel } from '../models/Admin';
import { AppointmentModel, AppointmentWithClient } from '../models/Appointment';
import { jwtService } from '../services/jwtService';
import { emailQueue } from '../jobs/queue';
import { logger } from '../config/logger';
import { cacheService, CACHE_KEYS, CACHE_CONFIG } from '../config/cache';
import { adminLoginSchema, updateAppointmentSchema, dashboardQuerySchema, forgotPasswordSchema } from '../utils/validationSchemas';

export class AdminController {
  private adminModel: AdminModel;
  private appointmentModel: AppointmentModel;

  constructor(db: PoolClient) {
    this.adminModel = new AdminModel(db);
    this.appointmentModel = new AppointmentModel(db);
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = adminLoginSchema.validate(req.body);

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
        return;
      }

      const { email, password } = value;

      const admin = await this.adminModel.findByEmail(email);
      if (!admin) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      const isValidPassword = await this.adminModel.verifyPassword(password, admin.password_hash);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      const token = jwtService.generateToken({
        id: admin.id,
        email: admin.email,
        role: admin.role
      });

      const isCrossSiteAuth = process.env.CROSS_SITE_AUTH === 'true';

      res.cookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' || isCrossSiteAuth,
        sameSite: isCrossSiteAuth ? 'none' : (process.env.NODE_ENV === 'production' ? 'strict' : 'lax'),
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
      });

      logger.info(`Admin login successful: ${admin.id} - ${admin.email}`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role
          }
        }
      });

    } catch (error) {
      logger.error('Error in admin login:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = dashboardQuerySchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
        return;
      }

      const { page, limit, status, start_date, end_date } = value;

      const cacheKey = `${CACHE_KEYS.DASHBOARD_UPCOMING}:${page}:${limit}:${status || 'all'}:${start_date || 'all'}:${end_date || 'all'}`;

      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        logger.info(`Dashboard data served from cache: ${cacheKey}`);
        res.status(200).json({
          success: true,
          data: cachedData,
          cached: true
        });
        return;
      }

      let query = `
        SELECT a.*, c.name, c.email, c.phone, c.address
        FROM appointments a
        JOIN clients c ON a.client_id = c.id
        WHERE 1=1
      `;
      const values: any[] = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        query += ` AND a.status = $${paramCount}`;
        values.push(status);
      }

      if (start_date) {
        paramCount++;
        query += ` AND a.date_time >= $${paramCount}`;
        values.push(start_date);
      }

      if (end_date) {
        paramCount++;
        query += ` AND a.date_time <= $${paramCount}`;
        values.push(end_date);
      }

      query += ` ORDER BY a.date_time ASC`;

      let countQuery = `
        SELECT COUNT(*) 
        FROM appointments a
        JOIN clients c ON a.client_id = c.id
        WHERE 1=1
      `;
      const countValues: any[] = [];
      let countParamCount = 0;

      if (status) {
        countParamCount++;
        countQuery += ` AND a.status = $${countParamCount}`;
        countValues.push(status);
      }

      if (start_date) {
        countParamCount++;
        countQuery += ` AND a.date_time >= $${countParamCount}`;
        countValues.push(start_date);
      }

      if (end_date) {
        countParamCount++;
        countQuery += ` AND a.date_time <= $${countParamCount}`;
        countValues.push(end_date);
      }

      const countResult = await this.adminModel.db.query(countQuery, countValues);
      const total = parseInt(countResult.rows[0].count, 10);

      const offset = (page - 1) * limit;
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      values.push(limit);
      
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      values.push(offset);

      const result = await this.adminModel.db.query(query, values);
      const appointments = result.rows;

      const responseData = {
        appointments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      await cacheService.set(cacheKey, responseData, CACHE_CONFIG.DASHBOARD_TTL);

      res.status(200).json({
        success: true,
        data: responseData,
        cached: false
      });

    } catch (error) {
      logger.error('Error retrieving dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async updateAppointment(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user?.id || 'unknown';
      const appointmentId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);

      if (isNaN(appointmentId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid appointment ID'
        });
        return;
      }

      const { error, value } = updateAppointmentSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
        return;
      }

      const currentAppointment = await this.appointmentModel.findById(appointmentId) as AppointmentWithClient;
      if (!currentAppointment) {
        res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
        return;
      }

      if (value.status) {
        const isValidTransition = this.validateStatusTransition(currentAppointment.status, value.status);
        if (!isValidTransition) {
          res.status(400).json({
            success: false,
            message: 'Invalid status transition',
            errors: [`Cannot transition from ${currentAppointment.status} to ${value.status}`]
          });
          return;
        }
      }

      if (value.date_time) {
        const duration = value.duration || 60; // Default to 60 minutes if not provided
        const existingAppointment = await this.appointmentModel.findByDateTime(new Date(value.date_time), duration);
        if (existingAppointment && existingAppointment.id !== appointmentId) {
          res.status(409).json({
            success: false,
            message: 'This time slot is already booked. Please choose a different time.'
          });
          return;
        }
      }

      let updateQuery = 'UPDATE appointments SET ';
      const updateValues: any[] = [];
      let paramCount = 0;
      const fieldsToUpdate: string[] = [];

      if (value.date_time) {
        paramCount++;
        fieldsToUpdate.push(`date_time = $${paramCount}`);
        updateValues.push(new Date(value.date_time));
      }

      if (value.duration) {
        paramCount++;
        fieldsToUpdate.push(`duration = $${paramCount}`);
        updateValues.push(value.duration);
      }

      if (value.status) {
        paramCount++;
        fieldsToUpdate.push(`status = $${paramCount}`);
        updateValues.push(value.status);
      }

      if (fieldsToUpdate.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
        return;
      }

      updateQuery += fieldsToUpdate.join(', ');
      updateQuery += ` WHERE id = $${paramCount + 1} RETURNING *`;
      updateValues.push(appointmentId);

      const result = await this.adminModel.db.query(updateQuery, updateValues);
      const updatedAppointment = result.rows[0] as AppointmentWithClient;

      if (value.status) {
        await this.handleStatusChangeNotifications(currentAppointment, updatedAppointment);
      }

      if (value.date_time) {
        await this.handleReminderJobManagement(currentAppointment, updatedAppointment);
      }

      await this.invalidateDashboardCache();

      logger.info(`Appointment updated: ${updatedAppointment.id} by admin: ${adminId}`);

      res.status(200).json({
        success: true,
        message: 'Appointment updated successfully',
        data: {
          appointment: updatedAppointment
        }
      });

    } catch (error) {
      logger.error('Error updating appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async deleteAppointment(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user?.id || 'unknown';
      const appointmentId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);

      if (isNaN(appointmentId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid appointment ID'
        });
        return;
      }

      const currentAppointment = await this.appointmentModel.findById(appointmentId) as AppointmentWithClient;
      if (!currentAppointment) {
        res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
        return;
      }

      const updateQuery = `
        UPDATE appointments 
        SET status = 'cancelled' 
        WHERE id = $1 
        RETURNING *
      `;
      const result = await this.adminModel.db.query(updateQuery, [appointmentId]);
      const cancelledAppointment = result.rows[0];

      await this.handleStatusChangeNotifications(currentAppointment, cancelledAppointment);

      await this.invalidateDashboardCache();

      logger.info(`Appointment cancelled: ${cancelledAppointment.id} by admin: ${adminId}`);

      res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
        data: {
          appointment: cancelledAppointment
        }
      });

    } catch (error) {
      logger.error('Error cancelling appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = forgotPasswordSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
        return;
      }

      const { email } = value;

      const admin = await this.adminModel.findByEmail(email);
      if (!admin) {
        res.status(200).json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.'
        });
        return;
      }

      const resetToken = jwtService.generateResetToken({
        id: admin.id,
        email: admin.email
      });

      const frontendUrl = process.env.FRONTEND_URL;
      if (!frontendUrl) {
        logger.error('FRONTEND_URL environment variable is not set');
        throw new Error('FRONTEND_URL environment variable is required for password reset functionality');
      }

      await emailQueue.add('send email', {
        to: admin.email,
        subject: 'Password Reset Request',
        text: `Hello ${admin.name},\n\nYou requested a password reset for your admin account.\n\nPlease click the link below to reset your password:\n\n${frontendUrl}/reset-password?token=${resetToken}\n\nThis link will expire in 1 hour.\n\nIf you did not request this reset, please ignore this email.\n\nThank you!`,
        html: `<p>Hello ${admin.name},</p><p>You requested a password reset for your admin account.</p><p>Please click the link below to reset your password:</p><p><a href="${frontendUrl}/reset-password?token=${resetToken}">Reset Password</a></p><p>This link will expire in 1 hour.</p><p>If you did not request this reset, please ignore this email.</p><p>Thank you!</p>`
      });

      logger.info(`Password reset requested for admin: ${admin.id} - ${admin.email}`);

      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });

    } catch (error) {
      logger.error('Error in forgot password:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'booked': ['confirmed', 'cancelled', 'completed', 'missed'],
      'confirmed': ['cancelled', 'completed', 'missed'],
      'cancelled': [],
      'completed': [],
      'missed': []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private async handleStatusChangeNotifications(oldAppointment: any, newAppointment: any): Promise<void> {
    if (oldAppointment.status === newAppointment.status) {
      return;
    }

    const clientEmail = oldAppointment.email;
    const clientName = oldAppointment.name;

    if (newAppointment.status === 'cancelled') {
      await emailQueue.add('send email', {
        to: clientEmail,
        subject: 'Appointment Cancelled',
        text: `Hello ${clientName},\n\nYour appointment scheduled for ${new Date(oldAppointment.date_time).toLocaleString()} has been cancelled.\n\nWe apologize for any inconvenience. Please contact us to reschedule.\n\nThank you!`,
        html: `<p>Hello ${clientName},</p><p>Your appointment scheduled for ${new Date(oldAppointment.date_time).toLocaleString()} has been cancelled.</p><p>We apologize for any inconvenience. Please contact us to reschedule.</p><p>Thank you!</p>`
      });
    } else if (newAppointment.status === 'completed') {
      await emailQueue.add('send email', {
        to: clientEmail,
        subject: 'Appointment Completed',
        text: `Hello ${clientName},\n\nYour appointment scheduled for ${new Date(oldAppointment.date_time).toLocaleString()} has been completed successfully.\n\nThank you for choosing our services!\n\nWe look forward to serving you again soon.`,
        html: `<p>Hello ${clientName},</p><p>Your appointment scheduled for ${new Date(oldAppointment.date_time).toLocaleString()} has been completed successfully.</p><p>Thank you for choosing our services!</p><p>We look forward to serving you again soon.</p>`
      });
    } else if (newAppointment.status === 'missed') {
      await emailQueue.add('send email', {
        to: clientEmail,
        subject: 'Missed Appointment',
        text: `Hello ${clientName},\n\nWe noticed you missed your appointment scheduled for ${new Date(oldAppointment.date_time).toLocaleString()}.\n\nIf you would like to reschedule, please contact us.\n\nThank you!`,
        html: `<p>Hello ${clientName},</p><p>We noticed you missed your appointment scheduled for ${new Date(oldAppointment.date_time).toLocaleString()}.</p><p>If you would like to reschedule, please contact us.</p><p>Thank you!</p>`
      });
    }
  }

  private async handleReminderJobManagement(oldAppointment: any, newAppointment: any): Promise<void> {
    // This would integrate with the reminder job system
    // For now, we'll log the action
    if (oldAppointment.date_time !== newAppointment.date_time) {
      logger.info(`Appointment rescheduled: ${newAppointment.id}, old time: ${oldAppointment.date_time}, new time: ${newAppointment.date_time}`);
      // In a full implementation, this would:
      // 1. Cancel existing reminder jobs for the old time
      // 2. Schedule new reminder jobs for the new time
    }
  }

  private async invalidateDashboardCache(): Promise<void> {
    try {
      // Invalidate all dashboard cache keys
      await cacheService.invalidatePattern(`${CACHE_KEYS.DASHBOARD_UPCOMING}:*`);
      logger.info('Dashboard cache invalidated');
    } catch (error) {
      logger.error('Error invalidating dashboard cache:', error);
    }
  }
}
