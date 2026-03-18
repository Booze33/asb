import Joi from 'joi';

export const createAppointmentSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
  phone: Joi.string().pattern(/^[0-9+\-\s()]{7,15}$/).required().messages({
    'string.empty': 'Phone number is required',
    'string.pattern.base': 'Please provide a valid phone number',
  }),
  address: Joi.string().max(200).required().messages({
    'string.empty': 'Address is required',
    'string.max': 'Address cannot exceed 200 characters',
  }),
  date_time: Joi.date().iso().greater('now').required().messages({
    'date.base': 'Please provide a valid date and time',
    'date.greater': 'Appointment date must be in the future',
  }),
  duration: Joi.number().integer().min(15).max(240).required().messages({
    'number.base': 'Duration must be a number',
    'number.integer': 'Duration must be a whole number',
    'number.min': 'Duration must be at least 15 minutes',
    'number.max': 'Duration cannot exceed 240 minutes',
  }),
});

export const clientSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
  phone: Joi.string().pattern(/^[0-9+\-\s()]{7,15}$/).required().messages({
    'string.empty': 'Phone number is required',
    'string.pattern.base': 'Please provide a valid phone number',
  }),
  address: Joi.string().max(200).required().messages({
    'string.empty': 'Address is required',
    'string.max': 'Address cannot exceed 200 characters',
  }),
});

export const getAppointmentSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Appointment ID must be a number',
    'number.integer': 'Appointment ID must be a whole number',
    'number.positive': 'Appointment ID must be positive',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
});

export const adminLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters long',
  }),
});

export const updateAppointmentSchema = Joi.object({
  date_time: Joi.date().iso().greater('now').optional().messages({
    'date.base': 'Please provide a valid date and time',
    'date.greater': 'Appointment date must be in the future',
  }),
  duration: Joi.number().integer().min(15).max(240).optional().messages({
    'number.base': 'Duration must be a number',
    'number.integer': 'Duration must be a whole number',
    'number.min': 'Duration must be at least 15 minutes',
    'number.max': 'Duration cannot exceed 240 minutes',
  }),
  status: Joi.string().valid('booked', 'confirmed', 'cancelled', 'completed', 'missed').optional().messages({
    'any.only': 'Status must be one of: booked, confirmed, cancelled, completed, missed',
  }),
});

export const dashboardQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be a whole number',
    'number.min': 'Page must be at least 1',
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be a whole number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100',
  }),
  status: Joi.string().valid('booked', 'confirmed', 'cancelled', 'completed', 'missed').optional().messages({
    'any.only': 'Status must be one of: booked, confirmed, cancelled, completed, missed',
  }),
  start_date: Joi.date().iso().optional().messages({
    'date.base': 'Please provide a valid start date',
  }),
  end_date: Joi.date().iso().greater(Joi.ref('start_date')).optional().messages({
    'date.base': 'Please provide a valid end date',
    'date.greater': 'End date must be after start date',
  }),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
});
