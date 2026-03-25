import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { logger } from '../config/logger';

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Define allowed origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [
          'https://asb-8xh8.vercel.app',
          'https://asb-henna.vercel.app'
        ];

    if (allowedOrigins.includes(origin)) {
      logger.info(`CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      logger.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID'
  ],
  exposedHeaders: ['X-Request-ID'],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  maxAge: 86400 // 24 hours preflight cache
};

/**
 * CORS middleware configuration
 */
export const corsMiddleware = cors(corsOptions);

/**
 * Custom CORS middleware for specific endpoints
 */
export const createCorsMiddleware = (options: any) => {
  return cors(options);
};

/**
 * Strict CORS middleware for admin endpoints
 */
export const adminCorsMiddleware = cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);

    // More restrictive origins for admin endpoints
    const allowedOrigins = process.env.ADMIN_ALLOWED_ORIGINS 
      ? process.env.ADMIN_ALLOWED_ORIGINS.split(',')
      : [
          'https://asb-8xh8.vercel.app',
          'https://asb-henna.vercel.app'
        ];

    if (allowedOrigins.includes(origin)) {
      logger.info(`Admin CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      logger.warn(`Admin CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID'
  ],
  exposedHeaders: ['X-Request-ID'],
  optionsSuccessStatus: 200,
  maxAge: 3600 // 1 hour preflight cache for admin endpoints
});

/**
 * CORS middleware for cache endpoints
 */
export const cacheCorsMiddleware = cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);

    // Only allow specific origins for cache operations
    const allowedOrigins = process.env.CACHE_ALLOWED_ORIGINS 
      ? process.env.CACHE_ALLOWED_ORIGINS.split(',')
      : [
          'https://asb-8xh8.vercel.app'
        ];

    if (allowedOrigins.includes(origin)) {
      logger.info(`Cache CORS allowed for origin: ${origin}`);
      callback(null, true);
    } else {
      logger.warn(`Cache CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID'
  ],
  exposedHeaders: ['X-Request-ID'],
  optionsSuccessStatus: 200,
  maxAge: 1800 // 30 minutes preflight cache for cache endpoints
});

/**
 * CORS error handler
 */
export const corsErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  if (err && err.message && err.message.includes('CORS')) {
    logger.error(`CORS error: ${err.message}`);
    res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      error: err.message
    });
  } else {
    next(err);
  }
};