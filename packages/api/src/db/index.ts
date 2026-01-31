import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index.js';

const { Pool } = pg;

// Database configuration from environment
const dbConfig = {
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  database: process.env.DB_NAME ?? 'sage',
  user: process.env.DB_USER ?? 'sage',
  password: process.env.DB_PASSWORD ?? 'sage_dev',
  // Connection pool settings
  max: parseInt(process.env.DB_POOL_MAX ?? '20', 10),
  min: parseInt(process.env.DB_POOL_MIN ?? '2', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT ?? '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT ?? '5000', 10),
};

const pool = new Pool(dbConfig);

// Log pool errors (don't crash the process)
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

// Create Drizzle instance with schema for relational queries
export const db = drizzle(pool, { schema });

// Export pool for direct access if needed
export { pool };

/**
 * Verify database connectivity by executing a simple query.
 * Call this during application startup to ensure the database is reachable.
 */
export async function verifyDatabaseConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
}

/**
 * Get current pool statistics for monitoring.
 */
export function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

/**
 * Gracefully close all database connections.
 * Call this during application shutdown.
 */
export async function closeDatabase(): Promise<void> {
  await pool.end();
}

// Export schema for use in repositories
export * from './schema/index.js';
