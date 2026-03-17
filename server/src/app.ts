import express from 'express';
import helmet from 'helmet';
import { logger, httpLogger } from './config/logger';
import pool from './config/database';
import healthRoutes from './routes/health';
import appointmentRoutes from './routes/appointment';
import adminRoutes from './routes/admin';
import cacheRoutes from './routes/cache';
import { queueMonitoring } from './jobs/monitoring';
import { requestIdMiddleware } from './middleware/requestId';
import { corsMiddleware, corsErrorHandler } from './middleware/cors';
import { publicRateLimit, adminRateLimit, authRateLimit, cacheRateLimit } from './middleware/rateLimit';
import { validateInput } from './middleware/validation';

const app = express();

// Request ID middleware (first for tracing)
app.use(requestIdMiddleware);

// Security middleware
app.use(helmet());

// CORS middleware
app.use(corsMiddleware);

// Rate limiting for public endpoints
app.use(publicRateLimit);

// Logging middleware
app.use(httpLogger);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.use('/health', healthRoutes);

// Appointment routes
app.use('/', appointmentRoutes);

// Admin routes
app.use('/', adminRoutes);

// Cache routes
app.use('/api/cache', cacheRoutes);

// Queue monitoring (Bull Board)
app.use('/bull-board', queueMonitoring.getRouter());

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;