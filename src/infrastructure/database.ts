import { Pool } from 'pg';
import { config } from '../config/env';

let poolInstance: Pool | null = null;

export const pool = (): Pool => {
  if (!poolInstance) {
    poolInstance = new Pool({
  connectionString: config.DATABASE_URL,
});
  }
  return poolInstance;
};

export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool().connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

