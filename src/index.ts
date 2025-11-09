console.log('🚀 Starting backend application...');
console.log('📦 Loading dependencies...');

import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { validateEnv } from './config/env';

// These will be imported after validateEnv() runs to avoid circular dependency issues
let getSwaggerSpec: any;
let authRouter: any;
let getLimiter: any;
let pool: any;
let configureDependencies: any;
let container: any;
let errorHandler: any;
let createCustomerRoutes: any;
let createInvoiceRoutes: any;
let createPaymentRoutes: any;
let createDashboardRoutes: any;
let authMiddleware: any;

// Global error handlers (must be at the top)
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Load environment variables
dotenv.config();

// Validate environment variables on startup
try {
  console.log('🔍 Validating environment variables...');
  validateEnv();
  console.log('✅ Environment variables validated');
} catch (error) {
  console.error('❌ Environment validation failed:', error);
  process.exit(1);
}

// Import config after validation (lazy import to avoid circular dependency)
const { config } = require('./config/env');

// Now import all application modules that might use config
console.log('📦 Loading application modules...');
getSwaggerSpec = require('./config/swagger').getSwaggerSpec;
authRouter = require('./features/auth/authRouter').default;
getLimiter = require('./shared/middleware/rateLimiter').getLimiter;
pool = require('./infrastructure/database').pool;
const diModule = require('./infrastructure/configuration/DependencyContainer');
configureDependencies = diModule.configureDependencies;
container = diModule.container;
errorHandler = require('./presentation/middleware/ErrorHandlerMiddleware').errorHandler;
createCustomerRoutes = require('./presentation/routes/customerRoutes').createCustomerRoutes;
createInvoiceRoutes = require('./presentation/routes/invoiceRoutes').createInvoiceRoutes;
createPaymentRoutes = require('./presentation/routes/paymentRoutes').createPaymentRoutes;
createDashboardRoutes = require('./presentation/routes/dashboardRoutes').createDashboardRoutes;
authMiddleware = require('./shared/middleware/auth').authMiddleware;
console.log('✅ Application modules loaded');

// Initialize dependency injection container
try {
  console.log('🔧 Initializing dependency injection container...');
  configureDependencies(pool());
  console.log('✅ Dependency injection container initialized');
} catch (error) {
  console.error('❌ Dependency injection initialization failed:', error);
  process.exit(1);
}

const app: Application = express();
const PORT = config.PORT;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// Compression middleware
app.use(compression());

// CORS middleware
app.use(cors({ 
  origin: config.CORS_ORIGIN,
  credentials: true, // Allow cookies
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting middleware
app.use(getLimiter());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Documentation
try {
  console.log('📚 Initializing API documentation...');
  const swaggerSpec = getSwaggerSpec();
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('✅ API documentation initialized');
} catch (error) {
  console.error('⚠️  Failed to initialize API documentation:', error);
  // Don't exit - API docs are optional
}

// API Routes
console.log('🚀 Registering CQRS architecture routes...');
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/customers', authMiddleware, createCustomerRoutes(container));
app.use('/api/v1/invoices', authMiddleware, createInvoiceRoutes(container));
app.use('/api/v1/payments', authMiddleware, createPaymentRoutes(container));
app.use('/api/v1/dashboard', authMiddleware, createDashboardRoutes(container));
console.log('✅ Routes registered successfully');

// Error handler middleware (MUST BE LAST)
app.use(errorHandler);

// Start server
try {
  console.log('🚀 Starting server...');
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${config.NODE_ENV}`);
    console.log(`📚 API Docs available at http://localhost:${PORT}/api/docs`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
    } else {
      console.error('❌ Server error:', error);
    }
    process.exit(1);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('🛑 Received shutdown signal, closing server gracefully...');
  
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
