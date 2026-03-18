import { Router } from 'express';
import { pool } from '../config/database';
import { logger } from '../config/logger';

const router = Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database connection
    const dbStart = Date.now();
    const dbResult = await pool.query('SELECT 1 as health');
    const dbResponseTime = Date.now() - dbStart;
    
    // Check Redis connection (placeholder - would need Redis connection)
    const redisStart = Date.now();
    const redisHealth = true; // Placeholder - would check Redis connection
    const redisResponseTime = Date.now() - redisStart;
    
    // Check queue status (placeholder - would need queue monitoring)
    const queueStart = Date.now();
    const queueStatus = true; // Placeholder - would check queue status
    const queueResponseTime = Date.now() - queueStart;
    
    const totalResponseTime = Date.now() - startTime;
    
    const healthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: totalResponseTime,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      checks: {
        database: {
          status: dbResult.rows.length > 0 ? 'ok' : 'error',
          responseTime: dbResponseTime
        },
        redis: {
          status: redisHealth ? 'ok' : 'error',
          responseTime: redisResponseTime
        },
        queue: {
          status: queueStatus ? 'ok' : 'error',
          responseTime: queueResponseTime
        }
      }
    };

    logger.info('Health check completed', { 
      status: 'ok', 
      responseTime: totalResponseTime,
      checks: healthCheck.checks 
    });

    res.status(200).json(healthCheck);
  } catch (error) {
    const healthCheck = {
      status: 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        database: { status: 'error' },
        redis: { status: 'error' },
        queue: { status: 'error' }
      }
    };

    logger.error('Health check failed', { 
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(503).json(healthCheck);
  }
});

// Readiness probe endpoint (for Kubernetes)
router.get('/ready', async (req, res) => {
  try {
    // Check if all critical services are ready
    const dbResult = await pool.query('SELECT 1 as ready');
    const redisHealth = true; // Placeholder - would check Redis connection
    
    if (dbResult.rows.length > 0 && redisHealth) {
      res.status(200).json({ 
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({ 
        status: 'not ready',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({ 
      status: 'not ready',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness probe endpoint (for Kubernetes)
router.get('/live', (req, res) => {
  res.status(200).json({ 
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid,
    uptime: process.uptime()
  });
});

// Metrics endpoint for Prometheus
router.get('/metrics', async (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const metrics = {
      // Memory metrics
      memory_heap_used: memUsage.heapUsed,
      memory_heap_total: memUsage.heapTotal,
      memory_external: memUsage.external,
      memory_rss: memUsage.rss,
      
      // CPU metrics
      cpu_user: cpuUsage.user,
      cpu_system: cpuUsage.system,
      
      // Process metrics
      process_uptime: process.uptime(),
      process_pid: process.pid,
      
      // System metrics
      system_platform: process.platform,
      system_arch: process.arch,
      node_version: process.version,
      
      // Database metrics (if available)
      db_connections: pool.totalCount,
      db_idle: pool.idleCount,
      db_waiting: pool.waitingCount
    };

    // Return as Prometheus format
    const prometheusMetrics = Object.entries(metrics)
      .map(([key, value]) => `node_${key} ${value}`)
      .join('\n');

    res.set('Content-Type', 'text/plain');
    res.send(prometheusMetrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
});

export default router;