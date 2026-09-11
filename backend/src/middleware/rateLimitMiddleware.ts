import { rateLimit } from 'express-rate-limit';

export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: 'Too many requests from this IP. Please try again later.'
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: 'Too many login/signup attempts. Please try again later.'
});