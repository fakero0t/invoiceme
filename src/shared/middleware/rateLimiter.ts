import rateLimit from 'express-rate-limit';
import { config } from '../../config/env';

let limiterInstance: ReturnType<typeof rateLimit> | null = null;

export const getLimiter = () => {
  if (!limiterInstance) {
    limiterInstance = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
  }
  return limiterInstance;
};

