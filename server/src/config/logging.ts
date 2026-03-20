import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each log level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports (where logs are output)
const transports = [
  // Console transport for development
  new winston.transports.Console({
    format,
    level: process.env.LOG_LEVEL || 'info'
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // Daily rotate file transport for production
  new DailyRotateFile({
    filename: path.join(process.cwd(), 'logs', 'application-%DATE%.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d'
  })
];

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false,
});

// Add request ID to logs
export function addRequestId(req: any, res: any, next: any): void {
  const requestId = req.headers['x-request-id'] || 
                   req.headers['x-correlation-id'] || 
                   generateRequestId();
  
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  // Add request ID to logger context
  req.logger = logger.child({ requestId });
  
  next();
}

// Generate unique request ID
function generateRequestId(): string {
  return 'req_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// Structured logging functions
export const structuredLogger = {
  error: (message: string, meta?: any) => {
    logger.error(message, meta);
  },
  
  warn: (message: string, meta?: any) => {
    logger.warn(message, meta);
  },
  
  info: (message: string, meta?: any) => {
    logger.info(message, meta);
  },
  
  http: (message: string, meta?: any) => {
    logger.http(message, meta);
  },
  
  debug: (message: string, meta?: any) => {
    logger.debug(message, meta);
  }
};

// Request logging middleware
export function requestLogger(req: any, res: any, next: any): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      requestId: req.requestId
    };
    
    if (res.statusCode >= 400) {
      structuredLogger.error('HTTP Request', logData);
    } else {
      structuredLogger.info('HTTP Request', logData);
    }
  });
  
  next();
}

// Error logging middleware
export function errorLogger(err: Error, req: any, res: any, next: any): void {
  const logData = {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      requestId: req.requestId
    },
    user: req.user || null
  };
  
  structuredLogger.error('Application Error', logData);
  next(err);
}

// Performance logging
export function logPerformance(operation: string, duration: number, meta?: any): void {
  structuredLogger.info(`Performance: ${operation}`, {
    duration,
    ...meta
  });
}

// Security event logging
export function logSecurityEvent(event: string, details: any): void {
  structuredLogger.warn(`Security Event: ${event}`, details);
}

// Business logic logging
export function logBusinessEvent(event: string, data: any): void {
  structuredLogger.info(`Business Event: ${event}`, data);
}

// Export default logger
export default logger;