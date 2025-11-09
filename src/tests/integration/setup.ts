import { Pool } from 'pg';

let pool: Pool;
let savepoint = 0;

export async function setupTestDatabase() {
  const connectionString = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/invoiceme_test';
  
  pool = new Pool({ connectionString });
  
  // Start a transaction for all tests
  await pool.query('BEGIN');
}

export async function teardownTestDatabase() {
  // Rollback all changes made during tests
  await pool.query('ROLLBACK');
  await pool.end();
}

export async function startTestTransaction() {
  savepoint++;
  await pool.query(`SAVEPOINT test_savepoint_${savepoint}`);
}

export async function rollbackTestTransaction() {
  await pool.query(`ROLLBACK TO SAVEPOINT test_savepoint_${savepoint}`);
  savepoint--;
}

export function getTestDatabasePool(): Pool {
  return pool;
}

// Global setup for Jest
beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

// Per-test transaction management
beforeEach(async () => {
  await startTestTransaction();
});

afterEach(async () => {
  await rollbackTestTransaction();
});

