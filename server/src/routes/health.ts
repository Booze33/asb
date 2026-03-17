import { Router } from 'express';
import { logger } from '../config/logger';

const router = Router();

router.get('/health', (req, res) => {
  logger.info('Health check endpoint called');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;