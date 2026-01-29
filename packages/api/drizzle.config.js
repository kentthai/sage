/** @type {import('drizzle-kit').Config} */
export default {
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    database: process.env.DB_NAME ?? 'sage',
    user: process.env.DB_USER ?? 'sage',
    password: process.env.DB_PASSWORD ?? 'sage_dev',
  },
};
