import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { logger } from '../config/logger';

export interface ValidationOptions {
  body?: ObjectSchema;
  params?: ObjectSchema;
  query?: ObjectSchema;
  headers?: ObjectSchema;
}

/**
 * Input validation middleware using Joi schemas
 */
export const validateInput = (schemas: ValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    // Validate request body
    if (schemas.body) {
      const { error } = schemas.body.validate(req.body);
      if (error) {
        errors.push(`Body: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    // Validate request parameters
    if (schemas.params) {
      const { error } = schemas.params.validate(req.params);
      if (error) {
        errors.push(`Params: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    // Validate query parameters
    if (schemas.query) {
      const { error } = schemas.query.validate(req.query);
      if (error) {
        errors.push(`Query: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    // Validate headers
    if (schemas.headers) {
      const { error } = schemas.headers.validate(req.headers);
      if (error) {
        errors.push(`Headers: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    // If there are validation errors, return 400 Bad Request
    if (errors.length > 0) {
      logger.warn(`Validation error for ${req.method} ${req.path}: ${errors.join('; ')}`);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
      return;
    }

    next();
  };
};

/**
 * Validation middleware for appointment creation
 */
export const validateAppointmentCreation = validateInput({
  body: require('../utils/validationSchemas').createAppointmentSchema
});

/**
 * Validation middleware for appointment retrieval
 */
export const validateAppointmentRetrieval = validateInput({
  params: require('../utils/validationSchemas').getAppointmentSchema.extract('id'),
  query: require('../utils/validationSchemas').getAppointmentSchema.extract('email')
});

/**
 * Validation middleware for admin login
 */
export const validateAdminLogin = validateInput({
  body: require('../utils/validationSchemas').adminLoginSchema
});

/**
 * Validation middleware for admin dashboard queries
 */
export const validateDashboardQuery = validateInput({
  query: require('../utils/validationSchemas').dashboardQuerySchema
});

/**
 * Validation middleware for appointment updates
 */
export const validateAppointmentUpdate = validateInput({
  params: require('../utils/validationSchemas').updateAppointmentSchema.extract('id'),
  body: require('../utils/validationSchemas').updateAppointmentSchema
});

/**
 * Validation middleware for cache operations
 */
export const validateCacheOperation = validateInput({
  body: require('../utils/validationSchemas').cacheOperationSchema
});

/**
 * Generic validation middleware for any schema
 */
export const createValidationMiddleware = (schema: ObjectSchema, location: 'body' | 'params' | 'query' | 'headers' = 'body') => {
  const schemas: ValidationOptions = {};
  schemas[location] = schema;
  
  return validateInput(schemas);
};

/**
 * Validation schema for cache operations
 */
export const cacheOperationSchema = require('joi').object({
  pattern: require('joi').string().pattern(/^[\w:*]+$/).required().messages({
    'string.pattern.base': 'Pattern must contain only letters, numbers, colons, and asterisks'
  })
});