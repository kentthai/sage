import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index.js';

const { Pool } = pg;

// Database configuration from environment
const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  database: process.env.DB_NAME ?? 'sage',
  user: process.env.DB_USER ?? 'sage',
  password: process.env.DB_PASSWORD ?? 'sage_dev',
});

// Create Drizzle instance with schema for relational queries
export const db = drizzle(pool, { schema });

// Export pool for direct access if needed
export { pool };

// Export schema for use in repositories
export * from './schema/index.js';
