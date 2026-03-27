import app from './app';
import { logger } from './config/logger';
import pool from './config/database';
import { emailQueue, whatsappQueue } from './jobs/queue';
import { ReminderScheduler } from './jobs/reminderScheduler';
import { queueMonitoring } from './jobs/monitoring';
import { cacheService } from './config/cache';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    await pool.connect();
    logger.info('Database connected successfully');

    // Test Redis connection
    logger.info('Connecting to Redis...');
    const redisStats = await cacheService.getStats();
    if (redisStats.connected) {
      logger.info('Redis connected successfully', { 
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        keyCount: redisStats.keyCount 
      });
    } else {
      logger.error('Redis connection failed');
      throw new Error('Redis connection failed');
    }

    // Start background jobs
    logger.info('Starting background job processors...');
    

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

    const scheduler = await ReminderScheduler.create();

    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Queue monitoring available at: http://localhost:${PORT}/bull-board`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully');
      await scheduler.shutdown();
      server.close(() => {
        pool.end(() => {
          logger.info('Process terminated');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
