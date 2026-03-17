import { Router } from 'express';
import { PoolClient } from 'pg';
import { AdminController } from '../controllers/adminController';
import { authenticateAdmin } from '../middleware/auth';
import { cacheService } from '../config/cache';
import { logger } from '../config/logger';
import { cacheRateLimit } from '../middleware/rateLimit';
import { validateInput } from '../middleware/validation';
import { cacheOperationSchema } from '../middleware/validation';

const router = Router();

/**
 * GET /api/cache/stats
 * Get cache statistics and health information
 */
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const stats = await cacheService.getStats();
    
    res.status(200).json({
      success: true,
      data: {
        cache: stats,
        config: {
          defaultTTL: 60,
          dashboardTTL: 60,
          clientTTL: 300,
          appointmentTTL: 120
        }
      }
    });
  } catch (error) {
    logger.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache statistics'
    });
  }
});

/**
 * POST /api/cache/clear
 * Clear all cache (admin only)
 */
router.post('/clear', authenticateAdmin, async (req, res) => {
  try {
    // Check if user is admin (you might want to add role checking)
    await cacheService.clear();
    
    logger.info(`Cache cleared by admin: ${(req as any).user?.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    logger.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache'
    });
  }
});

/**
 * POST /api/cache/invalidate
 * Invalidate cache by pattern
 */
router.post('/invalidate', authenticateAdmin, async (req, res) => {
  try {
    const { pattern } = req.body;
    
    if (!pattern) {
      res.status(400).json({
        success: false,
        message: 'Pattern is required'
      });
      return;
    }

    await cacheService.invalidatePattern(pattern);
    
    logger.info(`Cache invalidated by pattern "${pattern}" by admin: ${(req as any).user?.id}`);
    
    res.status(200).json({
      success: true,
      message: `Cache invalidated for pattern: ${pattern}`
    });
  } catch (error) {
    logger.error('Error invalidating cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to invalidate cache'
    });
  }
});

/**
 * GET /api/cache/health
 * Health check for cache service
 */
router.get('/health', async (req, res) => {
  try {
    const stats = await cacheService.getStats();
    
    const health = {
      status: stats.connected ? 'healthy' : 'unhealthy',
      connected: stats.connected,
      keyCount: stats.keyCount,
      memoryUsage: stats.memoryUsage,
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      data: health
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error checking cache health:', error);
    res.status(500).json({
      success: false,
      data: {
        status: 'unhealthy',
        connected: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }
    });
  }
});

export default router;