import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { logger, httpLogger } from './config/logger';
import pool from './config/database';
import healthRoutes from './routes/health';
import appointmentRoutes from './routes/appointment';
import adminRoutes from './routes/admin';
import cacheRoutes from './routes/cache';
import { queueMonitoring } from './jobs/monitoring';
import { requestIdMiddleware } from './middleware/requestId';
import { corsMiddleware, corsErrorHandler } from './middleware/cors';
import { publicRateLimit, adminRateLimit, cacheRateLimit } from './middleware/rateLimit';

const app = express();

app.use(requestIdMiddleware);

app.use(helmet());

app.use(corsMiddleware);

app.use(httpLogger);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());


app.use('/health', publicRateLimit, healthRoutes);
app.use('/api/appointments', publicRateLimit, appointmentRoutes);
app.use('/api/admin', adminRateLimit, adminRoutes);
app.use('/api/cache', cacheRateLimit, cacheRoutes);
app.use('/bull-board', queueMonitoring.getRouter());

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;