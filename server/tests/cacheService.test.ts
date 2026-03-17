import { CacheService, CACHE_CONFIG, CACHE_KEYS } from '../src/config/cache';
import { logger } from '../src/config/logger';

// Mock the logger
jest.mock('../src/config/logger');

const mockLogger = logger as jest.Mocked<typeof logger>;

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a new instance for each test
    cacheService = new CacheService();
  });

  describe('get', () => {
    it('should return null for non-existent key', async () => {
      // Mock the Redis client to return null immediately
      const mockClient = (cacheService as any).client;
      mockClient.get = jest.fn().mockResolvedValue(null);
      
      const result = await cacheService.get('non-existent-key');
      expect(result).toBeNull();
      expect(mockClient.get).toHaveBeenCalledWith('non-existent-key');
    });

    it('should return parsed JSON value for existing key', async () => {
      const testKey = 'test-key';
      const testValue = { id: 1, name: 'Test' };
      
      // Set up the mock to return a JSON string
      const mockClient = (cacheService as any).client;
      mockClient.get = jest.fn().mockResolvedValue(JSON.stringify(testValue));

      const result = await cacheService.get(testKey);
      expect(result).toEqual(testValue);
      expect(mockClient.get).toHaveBeenCalledWith(testKey);
    });

    it('should handle JSON parsing errors gracefully', async () => {
      const testKey = 'test-key';
      
      // Set up the mock to return invalid JSON
      const mockClient = (cacheService as any).client;
      mockClient.get = jest.fn().mockResolvedValue('invalid-json');

      const result = await cacheService.get(testKey);
      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Cache get error for key'),
        expect.any(Error)
      );
    });
  });

  describe('set', () => {
    it('should set value with default TTL', async () => {
      const testKey = 'test-key';
      const testValue = { id: 1, name: 'Test' };
      
      const mockClient = (cacheService as any).client;
      mockClient.setex = jest.fn().mockResolvedValue('OK');

      await cacheService.set(testKey, testValue);

      expect(mockClient.setex).toHaveBeenCalledWith(
        testKey,
        CACHE_CONFIG.DEFAULT_TTL,
        JSON.stringify(testValue)
      );
    });

    it('should set value with custom TTL', async () => {
      const testKey = 'test-key';
      const testValue = { id: 1, name: 'Test' };
      const customTTL = 300;
      
      const mockClient = (cacheService as any).client;
      mockClient.setex = jest.fn().mockResolvedValue('OK');

      await cacheService.set(testKey, testValue, customTTL);

      expect(mockClient.setex).toHaveBeenCalledWith(
        testKey,
        customTTL,
        JSON.stringify(testValue)
      );
    });

    it('should handle set errors gracefully', async () => {
      const testKey = 'test-key';
      const testValue = { id: 1, name: 'Test' };
      
      const mockClient = (cacheService as any).client;
      mockClient.setex = jest.fn().mockRejectedValue(new Error('Redis error'));

      await cacheService.set(testKey, testValue);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Cache set error for key'),
        expect.any(Error)
      );
    });
  });

  describe('del', () => {
    it('should delete existing key', async () => {
      const testKey = 'test-key';
      
      const mockClient = (cacheService as any).client;
      mockClient.del = jest.fn().mockResolvedValue(1);

      await cacheService.del(testKey);

      expect(mockClient.del).toHaveBeenCalledWith(testKey);
    });

    it('should handle delete errors gracefully', async () => {
      const testKey = 'test-key';
      
      const mockClient = (cacheService as any).client;
      mockClient.del = jest.fn().mockRejectedValue(new Error('Redis error'));

      await cacheService.del(testKey);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Cache delete error for key'),
        expect.any(Error)
      );
    });
  });

  describe('delMultiple', () => {
    it('should delete multiple keys', async () => {
      const testKeys = ['key1', 'key2', 'key3'];
      
      const mockClient = (cacheService as any).client;
      mockClient.del = jest.fn().mockResolvedValue(3);

      await cacheService.delMultiple(testKeys);

      expect(mockClient.del).toHaveBeenCalledWith(...testKeys);
    });

    it('should handle empty keys array', async () => {
      const mockClient = (cacheService as any).client;
      mockClient.del = jest.fn();

      await cacheService.delMultiple([]);

      expect(mockClient.del).not.toHaveBeenCalled();
    });

    it('should handle delete multiple errors gracefully', async () => {
      const testKeys = ['key1', 'key2'];
      
      const mockClient = (cacheService as any).client;
      mockClient.del = jest.fn().mockRejectedValue(new Error('Redis error'));

      await cacheService.delMultiple(testKeys);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cache delete multiple error:',
        expect.any(Error)
      );
    });
  });

  describe('exists', () => {
    it('should return true for existing key', async () => {
      const testKey = 'test-key';
      
      const mockClient = (cacheService as any).client;
      mockClient.exists = jest.fn().mockResolvedValue(1);

      const result = await cacheService.exists(testKey);

      expect(result).toBe(true);
      expect(mockClient.exists).toHaveBeenCalledWith(testKey);
    });

    it('should return false for non-existent key', async () => {
      const testKey = 'test-key';
      
      const mockClient = (cacheService as any).client;
      mockClient.exists = jest.fn().mockResolvedValue(0);

      const result = await cacheService.exists(testKey);

      expect(result).toBe(false);
      expect(mockClient.exists).toHaveBeenCalledWith(testKey);
    });

    it('should handle exists errors gracefully', async () => {
      const testKey = 'test-key';
      
      const mockClient = (cacheService as any).client;
      mockClient.exists = jest.fn().mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.exists(testKey);

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Cache exists error for key'),
        expect.any(Error)
      );
    });
  });

  describe('mget', () => {
    it('should return multiple values', async () => {
      const testKeys = ['key1', 'key2', 'key3'];
      const testValues = [
        JSON.stringify({ id: 1 }),
        JSON.stringify({ id: 2 }),
        null
      ];
      
      const mockClient = (cacheService as any).client;
      mockClient.mget = jest.fn().mockResolvedValue(testValues);

      const result = await cacheService.mget(testKeys);

      expect(result).toEqual([
        { id: 1 },
        { id: 2 },
        null
      ]);
      expect(mockClient.mget).toHaveBeenCalledWith(...testKeys);
    });

    it('should handle mget errors gracefully', async () => {
      const testKeys = ['key1', 'key2'];
      
      const mockClient = (cacheService as any).client;
      mockClient.mget = jest.fn().mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.mget(testKeys);

      expect(result).toEqual([null, null]);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cache mget error:',
        expect.any(Error)
      );
    });
  });

  describe('mset', () => {
    it('should set multiple values with default TTL', async () => {
      const keyValuePairs = [
        { key: 'key1', value: { id: 1 } },
        { key: 'key2', value: { id: 2 } }
      ];
      
      const mockClient = (cacheService as any).client;
      mockClient.pipeline = jest.fn().mockReturnValue({
        setex: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([['OK'], ['OK']])
      });

      await cacheService.mset(keyValuePairs);

      const pipeline = mockClient.pipeline();
      expect(pipeline.setex).toHaveBeenCalledTimes(2);
      expect(pipeline.exec).toHaveBeenCalled();
    });

    it('should set multiple values with custom TTL', async () => {
      const keyValuePairs = [
        { key: 'key1', value: { id: 1 }, ttl: 300 },
        { key: 'key2', value: { id: 2 }, ttl: 600 }
      ];
      
      const mockClient = (cacheService as any).client;
      mockClient.pipeline = jest.fn().mockReturnValue({
        setex: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([['OK'], ['OK']])
      });

      await cacheService.mset(keyValuePairs);

      const pipeline = mockClient.pipeline();
      expect(pipeline.setex).toHaveBeenCalledWith(
        'key1',
        300,
        JSON.stringify({ id: 1 })
      );
      expect(pipeline.setex).toHaveBeenCalledWith(
        'key2',
        600,
        JSON.stringify({ id: 2 })
      );
    });

    it('should handle mset errors gracefully', async () => {
      const keyValuePairs = [
        { key: 'key1', value: { id: 1 } }
      ];
      
      const mockClient = (cacheService as any).client;
      mockClient.pipeline = jest.fn().mockReturnValue({
        setex: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('Redis error'))
      });

      await cacheService.mset(keyValuePairs);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cache mset error:',
        expect.any(Error)
      );
    });
  });

  describe('invalidatePattern', () => {
    it('should invalidate keys matching pattern', async () => {
      const pattern = 'test:*';
      const matchingKeys = ['test:key1', 'test:key2'];
      
      const mockClient = (cacheService as any).client;
      mockClient.keys = jest.fn().mockResolvedValue(matchingKeys);
      mockClient.del = jest.fn().mockResolvedValue(2);

      await cacheService.invalidatePattern(pattern);

      expect(mockClient.keys).toHaveBeenCalledWith(pattern);
      expect(mockClient.del).toHaveBeenCalledWith('test:key1', 'test:key2');
    });

    it('should handle no matching keys', async () => {
      const pattern = 'test:*';
      
      const mockClient = (cacheService as any).client;
      mockClient.keys = jest.fn().mockResolvedValue([]);
      mockClient.del = jest.fn();

      await cacheService.invalidatePattern(pattern);

      expect(mockClient.keys).toHaveBeenCalledWith(pattern);
      expect(mockClient.del).not.toHaveBeenCalled();
    });

    it('should handle invalidate pattern errors gracefully', async () => {
      const pattern = 'test:*';
      
      const mockClient = (cacheService as any).client;
      mockClient.keys = jest.fn().mockRejectedValue(new Error('Redis error'));

      await cacheService.invalidatePattern(pattern);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Cache invalidate pattern error for pattern'),
        expect.any(Error)
      );
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      const mockInfo = `
        # Memory
        used_memory:123456
        used_memory_human:120.5K
        used_memory_peak:234567
        used_memory_peak_human:229.1K
      `;
      
      const mockClient = (cacheService as any).client;
      mockClient.info = jest.fn().mockResolvedValue(mockInfo);
      mockClient.dbsize = jest.fn().mockResolvedValue(100);
      mockClient.status = 'ready';

      const result = await cacheService.getStats();

      expect(result).toEqual({
        connected: true,
        keyCount: 100,
        memoryUsage: '120.5K'
      });
      expect(mockClient.info).toHaveBeenCalledWith('memory');
      expect(mockClient.dbsize).toHaveBeenCalled();
    });

    it('should handle getStats errors gracefully', async () => {
      const mockClient = (cacheService as any).client;
      mockClient.info = jest.fn().mockRejectedValue(new Error('Redis error'));
      mockClient.dbsize = jest.fn();
      mockClient.status = 'ready';

      const result = await cacheService.getStats();

      expect(result).toEqual({
        connected: false,
        keyCount: 0,
        memoryUsage: 'unknown'
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cache stats error:',
        expect.any(Error)
      );
    });
  });

  describe('clear', () => {
    it('should clear all cache', async () => {
      const mockClient = (cacheService as any).client;
      mockClient.flushdb = jest.fn().mockResolvedValue('OK');

      await cacheService.clear();

      expect(mockClient.flushdb).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Cache cleared successfully');
    });

    it('should handle clear errors gracefully', async () => {
      const mockClient = (cacheService as any).client;
      mockClient.flushdb = jest.fn().mockRejectedValue(new Error('Redis error'));

      await cacheService.clear();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cache clear error:',
        expect.any(Error)
      );
    });
  });

  describe('disconnect', () => {
    it('should disconnect from Redis', async () => {
      const mockClient = (cacheService as any).client;
      mockClient.quit = jest.fn().mockResolvedValue('OK');

      await cacheService.disconnect();

      expect(mockClient.quit).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Cache Redis client disconnected');
    });

    it('should handle disconnect errors gracefully', async () => {
      const mockClient = (cacheService as any).client;
      mockClient.quit = jest.fn().mockRejectedValue(new Error('Redis error'));

      await cacheService.disconnect();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cache disconnect error:',
        expect.any(Error)
      );
    });
  });

  describe('Cache Key Patterns', () => {
    it('should generate correct dashboard cache keys', () => {
      const key = CACHE_KEYS.DASHBOARD_UPCOMING;
      expect(key).toBe('dashboard:upcoming');
    });

    it('should generate correct client cache keys', () => {
      const emailKey = CACHE_KEYS.CLIENT_BY_EMAIL('test@example.com');
      const phoneKey = CACHE_KEYS.CLIENT_BY_PHONE('+1234567890');
      const idKey = CACHE_KEYS.CLIENT_BY_ID(123);

      expect(emailKey).toBe('client:email:test@example.com');
      expect(phoneKey).toBe('client:phone:+1234567890');
      expect(idKey).toBe('client:id:123');
    });

    it('should generate correct appointment cache keys', () => {
      const idKey = CACHE_KEYS.APPOINTMENT_BY_ID(123);
      const clientKey = CACHE_KEYS.APPOINTMENTS_BY_CLIENT(456);

      expect(idKey).toBe('appointment:id:123');
      expect(clientKey).toBe('appointments:client:456');
    });
  });

  describe('Cache Configuration', () => {
    it('should have correct TTL values', () => {
      expect(CACHE_CONFIG.DEFAULT_TTL).toBe(60);
      expect(CACHE_CONFIG.DASHBOARD_TTL).toBe(60);
      expect(CACHE_CONFIG.CLIENT_TTL).toBe(300);
      expect(CACHE_CONFIG.APPOINTMENT_TTL).toBe(120);
    });
  });
});