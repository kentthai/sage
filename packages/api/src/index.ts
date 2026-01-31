import { app } from './app.js';
import { verifyDatabaseConnection, closeDatabase } from './db/index.js';

const PORT = process.env.PORT ?? 3000;

// Server instance for graceful shutdown
let server: ReturnType<typeof app.listen>;

/**
 * Start the server with database verification.
 */
async function start(): Promise<void> {
  try {
    // Verify database connection before accepting requests
    console.log('Verifying database connection...');
    await verifyDatabaseConnection();
    console.log('Database connection verified.');

    server = app.listen(PORT, () => {
      console.log(`Sage API server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Gracefully shutdown the server and database connections.
 */
async function shutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
    });
  }

  // Close database connections
  try {
    await closeDatabase();
    console.log('Database connections closed.');
  } catch (error) {
    console.error('Error closing database:', error);
  }

  process.exit(0);
}

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the server
start();

export { app };
