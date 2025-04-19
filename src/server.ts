import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app';
import config from './config';
import { socketHelper } from './helpers/socketHelper';
import { errorLogger, logger } from './shared/logger';
import colors from 'colors';
import http from 'http';
import compression from 'compression';
import { createServer } from 'http';

// Constants
const SHUTDOWN_TIMEOUT_MS = 30000;
// Define global io with proper typing
declare global {
  var io: Server;
}
let httpServer: http.Server;
let socketServer: Server;

// Validate configuration
function validateConfig(): void {
  const requiredConfigs = ['database_url', 'port', 'socket_port', 'ip_address'];
  const missingConfigs = requiredConfigs.filter(
    (key) => !config[key as keyof typeof config],
  );

  if (missingConfigs.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingConfigs.join(', ')}`,
    );
  }
}

// Gracefully shut down the server
function gracefulShutdown(signal: string): void {
  logger.info(colors.blue(`${signal} received. Shutting down gracefully...`));

  if (httpServer) {
    httpServer.close(() => {
      logger.info(colors.green('HTTP server closed'));

      // Close database connection
      mongoose.connection
        .close(false)
        .then(() => {
          logger.info(colors.green('Database connection closed'));
          process.exit(0);
        })
        .catch((err) => {
          errorLogger.error(
            colors.red('Error closing database connection'),
            err,
          );
          process.exit(1);
        });
    });

    if (global.io) {
      global.io.close(() => {
        logger.info(colors.green('Socket.io server closed'));
      });
    }

    // Force shutdown after timeout if graceful shutdown fails
    setTimeout(() => {
      errorLogger.error(
        colors.red(`Forcing shutdown after ${SHUTDOWN_TIMEOUT_MS}ms timeout`),
      );
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
  } else {
    process.exit(0);
  }
}

// Set up MongoDB connection listeners
function setupMongooseListeners(): void {
  mongoose.connection.on('error', (err) => {
    errorLogger.error(colors.red('MongoDB connection error:'), err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn(
      colors.yellow('MongoDB disconnected. Attempting to reconnect...'),
    );
  });
  mongoose.connection.on('reconnected', () => {
    logger.info(colors.green('MongoDB reconnected successfully'));
  });
}

// Setup HTTP compression
function setupCompression() {
  app.use(compression());
}

// Start the server
async function startServer() {
  try {
    validateConfig();
    // Connect to MongoDB with improved options
    await mongoose.connect(config.database_url as string, {
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    logger.info(colors.green('🚀 Database connected successfully'));
    setupMongooseListeners();
    // Create HTTP server
    httpServer = createServer(app);

    // Parse ports properly
    const httpPort =
      typeof config.port === 'number' ? config.port : Number(config.port);
    const socketPort =
      typeof config.socket_port === 'number'
        ? config.socket_port
        : Number(config.socket_port);

    // Start HTTP server with proper error handling
    httpServer.listen(httpPort, config.ip_address as string, () => {
      logger.info(
        colors.yellow(
          `♻️  Application listening on http://${config.ip_address}:${httpPort}`,
        ),
      );
    });

    // Initialize Socket.io on a separate port
    socketServer = new Server({
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
    });

    // Listen on the socket port
    socketServer.listen(socketPort);

    socketHelper.socket(socketServer);
    global.io = socketServer;

    logger.info(colors.yellow(`♻️  Socket.io initialized on separate port`));
    logger.info(
      colors.yellow(
        `♻️  Socket is listening on ${config.ip_address}:${socketPort}`,
      ),
    );

    // Return successfully started server
    return { httpServer, socketServer };
  } catch (error: any) {
    errorLogger.error(colors.red('🤢 Failed to start server'), {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Set up process event handlers for graceful shutdown
function setupProcessHandlers(): void {
  process.on('uncaughtException', (error) => {
    errorLogger.error(colors.red('Uncaught Exception:'), error);
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    errorLogger.error(
      colors.red('Unhandled Rejection at:'),
      promise,
      'reason:',
      reason,
    );
    gracefulShutdown('unhandledRejection');
  });

  process.on('SIGINT', () => {
    gracefulShutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    gracefulShutdown('SIGTERM');
  });
}

// Bootstrap the application
(async function bootstrap() {
  setupProcessHandlers();
  setupCompression();

  try {
    await startServer();
  } catch (error: any) {
    errorLogger.error(colors.red('Failed to start server:'), error);
    process.exit(1);
  }
})();
