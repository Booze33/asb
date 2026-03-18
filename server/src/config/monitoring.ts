import { logger } from './logger';

// Custom metrics tracking
export class MetricsTracker {
  private static instance: MetricsTracker;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): MetricsTracker {
    if (!MetricsTracker.instance) {
      MetricsTracker.instance = new MetricsTracker();
    }
    return MetricsTracker.instance;
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 values to prevent memory leaks
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    for (const [name, values] of this.metrics.entries()) {
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        result[name] = {
          avg: sum / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
    }
    
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Performance monitoring wrapper
export function monitorPerformance<T extends (...args: any[]) => any>(
  fn: T, 
  operationName: string
): T {
  return ((...args: Parameters<T>) => {
    const startTime = Date.now();
    
    try {
      const result = fn(...args);
      
      // Handle both sync and async functions
      if (result instanceof Promise) {
        return result
          .then((value) => {
            const duration = Date.now() - startTime;
            logger.info(`Performance: ${operationName}`, { duration });
            return value;
          })
          .catch((error) => {
            const duration = Date.now() - startTime;
            logger.error(`Performance: ${operationName} failed`, { 
              duration, 
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
          });
      } else {
        const duration = Date.now() - startTime;
        logger.info(`Performance: ${operationName}`, { duration });
        return result;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Performance: ${operationName} failed`, { 
        duration, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }) as T;
}

// Health check metrics
export function recordHealthCheck(status: 'ok' | 'error', responseTime: number): void {
  const tracker = MetricsTracker.getInstance();
  tracker.recordMetric('health_check_response_time', responseTime);
  tracker.recordMetric(`health_check_${status}`, 1);
}

// Database query metrics
export function recordQueryMetrics(operation: string, duration: number, success: boolean): void {
  const tracker = MetricsTracker.getInstance();
  tracker.recordMetric(`db_query_${operation}_duration`, duration);
  tracker.recordMetric(`db_query_${operation}_${success ? 'success' : 'error'}`, 1);
}

// Queue metrics
export function recordQueueMetrics(operation: string, count: number): void {
  const tracker = MetricsTracker.getInstance();
  tracker.recordMetric(`queue_${operation}`, count);
}

// Cache metrics
export function recordCacheMetrics(operation: string, hit: boolean): void {
  const tracker = MetricsTracker.getInstance();
  tracker.recordMetric(`cache_${operation}_${hit ? 'hit' : 'miss'}`, 1);
}

// Error tracking (basic implementation)
export function trackError(error: Error, context?: Record<string, any>): void {
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    context
  });
}

// Request tracking
export function trackRequest(method: string, path: string, duration: number, statusCode: number): void {
  const tracker = MetricsTracker.getInstance();
  tracker.recordMetric(`http_${method.toLowerCase()}_${statusCode}`, 1);
  tracker.recordMetric(`http_${method.toLowerCase()}_duration`, duration);
  
  logger.info('HTTP request', {
    method,
    path,
    duration,
    statusCode
  });
}

// Export default monitoring functions
export const metricsTracker = MetricsTracker.getInstance();