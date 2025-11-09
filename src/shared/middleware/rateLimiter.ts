import rateLimit from 'express-rate-limit';

let limiterInstance: ReturnType<typeof rateLimit> | null = null;

export const getLimiter = () => {
  if (!limiterInstance) {
    // Import config lazily to avoid circular dependency
    const { config } = require('../../config/env');
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

