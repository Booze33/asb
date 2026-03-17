import Redis from 'ioredis';
import { logger } from './logger';

// Create a separate Redis client for caching (different from Bull's Redis connection)
const cacheClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_CACHE_DB || '1'), // Use different DB for caching
  lazyConnect: true,
  keyPrefix: 'cache:',
});

// Handle Redis connection events
cacheClient.on('connect', () => {
  logger.info('Cache Redis client connected successfully');
});

cacheClient.on('error', (error) => {
  logger.error('Cache Redis client error:', error);
});

cacheClient.on('close', () => {
  logger.warn('Cache Redis client connection closed');
});

cacheClient.on('reconnecting', () => {
  logger.info('Cache Redis client reconnecting...');
});

cacheClient.on('end', () => {
  logger.warn('Cache Redis client connection ended');
});

// Cache configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 60, // 1 minute in seconds
  DASHBOARD_TTL: 60, // 1 minute for dashboard data
  CLIENT_TTL: 300, // 5 minutes for client details
  APPOINTMENT_TTL: 120, // 2 minutes for appointment details
};

// Cache key patterns
export const CACHE_KEYS = {
  DASHBOARD_UPCOMING: 'dashboard:upcoming',
  DASHBOARD_STATS: 'dashboard:stats',
  CLIENT_BY_EMAIL: (email: string) => `client:email:${email}`,
  CLIENT_BY_PHONE: (phone: string) => `client:phone:${phone}`,
  CLIENT_BY_ID: (id: number) => `client:id:${id}`,
  APPOINTMENT_BY_ID: (id: number) => `appointment:id:${id}`,
  APPOINTMENTS_BY_CLIENT: (clientId: number) => `appointments:client:${clientId}`,
};

/**
 * Cache service for managing Redis cache operations
 */
export class CacheService {
  private client: Redis;

  constructor() {
    this.client = cacheClient;
  }

  /**
   * Get a value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a value in cache with TTL
   */
  async set(key: string, value: any, ttl: number = CACHE_CONFIG.DEFAULT_TTL): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setex(key, ttl, serializedValue);
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete a key from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys from cache
   */
  async delMultiple(keys: string[]): Promise<void> {
    try {
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      logger.error('Cache delete multiple error:', error);
    }
  }

  /**
   * Check if a key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get multiple values from cache
   */
  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.client.mget(...keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      logger.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple values in cache
   */
  async mset(keyValuePairs: { key: string; value: any; ttl?: number }[]): Promise<void> {
    try {
      const pipeline = this.client.pipeline();
      
      for (const { key, value, ttl = CACHE_CONFIG.DEFAULT_TTL } of keyValuePairs) {
        const serializedValue = JSON.stringify(value);
        pipeline.setex(key, ttl, serializedValue);
      }
      
      await pipeline.exec();
    } catch (error) {
      logger.error('Cache mset error:', error);
    }
  }

  /**
   * Invalidate cache keys matching a pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      logger.error(`Cache invalidate pattern error for pattern ${pattern}:`, error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ connected: boolean; keyCount: number; memoryUsage: string }> {
    try {
      const info = await this.client.info('memory');
      const keyCount = await this.client.dbsize();
      
      // Parse memory info
      const memoryMatch = info.match(/used_memory_human:(\d+\.\d+\w+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1] : 'unknown';

      return {
        connected: this.client.status === 'ready',
        keyCount,
        memoryUsage
      };
    } catch (error) {
      logger.error('Cache stats error:', error);
      return {
        connected: false,
        keyCount: 0,
        memoryUsage: 'unknown'
      };
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  async clear(): Promise<void> {
    try {
      await this.client.flushdb();
      logger.info('Cache cleared successfully');
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      logger.info('Cache Redis client disconnected');
    } catch (error) {
      logger.error('Cache disconnect error:', error);
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await cacheService.disconnect();
});

process.on('SIGINT', async () => {
  await cacheService.disconnect();
});

export default cacheService;