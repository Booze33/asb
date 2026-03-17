import { Router } from 'express';
import { PoolClient } from 'pg';
import { AppointmentController } from '../controllers/appointmentController';
import { createAppointmentSchema, getAppointmentSchema } from '../utils/validationSchemas';
import { logger } from '../config/logger';
import { validateInput } from '../middleware/validation';
import { authRateLimit } from '../middleware/rateLimit';
import pool from '../config/database';

const router = Router();

// Create appointment controller with database connection
let appointmentController: AppointmentController;

async function getAppointmentController(): Promise<AppointmentController> {
  if (!appointmentController) {
    const client = await pool.connect();
    appointmentController = new AppointmentController(client);
  }
  return appointmentController;
}

// POST /api/appointments - Create a new appointment
router.post('/api/appointments', async (req, res) => {
  try {
    const controller = await getAppointmentController();
    await controller.createAppointment(req, res);
  } catch (error) {
    logger.error('Error in createAppointment route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/appointments/:id - Retrieve appointment details
router.get('/api/appointments/:id', async (req, res) => {
  try {
    const controller = await getAppointmentController();
    await controller.getAppointment(req, res);
  } catch (error) {
    logger.error('Error in getAppointment route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;