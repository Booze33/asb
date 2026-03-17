import { Router } from 'express';
import { PoolClient } from 'pg';
import { AdminController } from '../controllers/adminController';
import pool from '../config/database';
import { authenticateAdmin, requireAdminRole } from '../middleware/auth';
import { logger } from '../config/logger';
import { validateInput } from '../middleware/validation';
import { authRateLimit, adminRateLimit } from '../middleware/rateLimit';
import { adminLoginSchema, dashboardQuerySchema, updateAppointmentSchema } from '../utils/validationSchemas';

const router = Router();

// Create admin controller with database connection
let adminController: AdminController;

async function getAdminController(): Promise<AdminController> {
  if (!adminController) {
    const client = await pool.connect();
    adminController = new AdminController(client);
  }
  return adminController;
}

// POST /api/admin/login - Admin login
router.post('/api/admin/login', async (req, res) => {
  try {
    const controller = await getAdminController();
    await controller.login(req, res);
  } catch (error) {
    logger.error('Error in admin login route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/admin/dashboard - Admin dashboard with upcoming appointments
router.get('/api/admin/dashboard', authenticateAdmin, requireAdminRole, async (req, res) => {
  try {
    const controller = await getAdminController();
    await controller.getDashboard(req, res);
  } catch (error) {
    logger.error('Error in admin dashboard route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/admin/appointments/:id - Update appointment
router.put('/api/admin/appointments/:id', authenticateAdmin, requireAdminRole, async (req, res) => {
  try {
    const controller = await getAdminController();
    await controller.updateAppointment(req, res);
  } catch (error) {
    logger.error('Error in update appointment route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/admin/appointments/:id - Cancel appointment
router.delete('/api/admin/appointments/:id', authenticateAdmin, requireAdminRole, async (req, res) => {
  try {
    const controller = await getAdminController();
    await controller.deleteAppointment(req, res);
  } catch (error) {
    logger.error('Error in cancel appointment route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;