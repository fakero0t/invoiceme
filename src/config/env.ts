import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // AWS General
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),

  // AWS Cognito
  AWS_COGNITO_USER_POOL_ID: z.string().regex(/^[a-z]+-[a-z]+-\d+_[a-zA-Z0-9]+$/),
  AWS_COGNITO_CLIENT_ID: z.string().min(1),
  AWS_COGNITO_CLIENT_SECRET: z.string().min(1).optional(),

  // AWS S3
  AWS_S3_BUCKET_NAME: z.string().min(1),

  // Invoice Generator
  INVOICE_GENERATOR_API_KEY: z.string().min(1),
  INVOICE_GENERATOR_API_URL: z.string().url(),

  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .regex(/^\d+$/)
    .default('3000')
    .transform(Number),
  CORS_ORIGIN: z.string().url(),

  // Rate Limiting
  RATE_LIMIT_MAX: z
    .string()
    .regex(/^\d+$/)
    .default('100')
    .transform(Number),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .regex(/^\d+$/)
    .default('60000')
    .transform(Number),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Config = z.infer<typeof envSchema>;

let parsedConfig: Config;

export const validateEnv = (): void => {
  try {
    parsedConfig = envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const config: Config = new Proxy({} as Config, {
  get(_target, prop: string) {
    if (!parsedConfig) {
      throw new Error('Config not initialized. Call validateEnv() first.');
    }
    return parsedConfig[prop as keyof Config];
  },
});
