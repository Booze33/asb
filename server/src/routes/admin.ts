import { Router } from 'express';
import { PoolClient } from 'pg';
import { AdminController } from '../controllers/adminController';
import pool from '../config/database';
import { authenticateAdmin, requireAdminRole, AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../config/logger';
import { validateInput } from '../middleware/validation';
import { authRateLimit } from '../middleware/rateLimit';
import { adminLoginSchema, dashboardQuerySchema, updateAppointmentSchema, forgotPasswordSchema } from '../utils/validationSchemas';

const router = Router();

router.post('/login', authRateLimit, async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const controller = new AdminController(client);
    await controller.login(req, res);
  } catch (error) {
    logger.error('Error in admin login route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    if (client) client.release();
  }
});

router.get('/dashboard', authenticateAdmin, requireAdminRole, async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const controller = new AdminController(client);
    await controller.getDashboard(req, res);
  } catch (error) {
    logger.error('Error in admin dashboard route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    if (client) client.release();
  }
});

router.put('/appointments/:id', authenticateAdmin, requireAdminRole, async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const controller = new AdminController(client);
    await controller.updateAppointment(req, res);
  } catch (error) {
    logger.error('Error in update appointment route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    if (client) client.release();
  }
});

router.delete('/appointments/:id', authenticateAdmin, requireAdminRole, async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const controller = new AdminController(client);
    await controller.deleteAppointment(req, res);
  } catch (error) {
    logger.error('Error in cancel appointment route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    if (client) client.release();
  }
});

router.post('/forgot-password', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const controller = new AdminController(client);
    await controller.forgotPassword(req, res);
  } catch (error) {
    logger.error('Error in forgot password route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    if (client) client.release();
  }
});

router.post('/logout', authenticateAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    // For cookie-based sessions, the server would typically clear the session
    // Since we're using JWT tokens stored in cookies, we can just clear the cookie
    res.clearCookie('admin_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    });
    
    logger.info(`Admin logout: ${req.user?.id} - ${req.user?.email}`);
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Error in logout route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
