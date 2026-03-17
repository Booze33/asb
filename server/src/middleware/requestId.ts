import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithId extends Request {
  requestId?: string;
}

/**
 * Request ID middleware for tracing requests across the application
 */
export const requestIdMiddleware = (req: RequestWithId, res: Response, next: NextFunction): void => {
  // Generate or extract request ID
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  
  // Add request ID to request object
  req.requestId = requestId;
  
  // Add request ID to response headers for client visibility
  res.setHeader('X-Request-ID', requestId);
  
  // Add request ID to response locals for logging
  res.locals.requestId = requestId;
  
  next();
};