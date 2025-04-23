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
const RECONNECT_DELAY_MS = 5000;

// Define global io with proper typing
declare global {
  var io: Server;
}
let httpServer: http.Server;
let socketServer: Server;
let isShuttingDown = false;

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
function gracefulShutdown(signal: string, shouldExit = true): Promise<void> {
  return new Promise((resolve) => {
    if (isShuttingDown) {
      logger.info(colors.yellow('Shutdown already in progress...'));
      return resolve();
    }
    
    isShuttingDown = true;
    logger.info(colors.blue(`${signal} received. Shutting down gracefully...`));

    const shutdownPromises: Promise<void>[] = [];

    // Close HTTP server if it exists
    if (httpServer?.listening) {
      shutdownPromises.push(
        new Promise<void>((resolveHttp) => {
          httpServer.close(() => {
            logger.info(colors.green('HTTP server closed'));
            resolveHttp();
          });
        })
      );
    }

    // Close Socket.io server if it exists
    if (global.io) {
      shutdownPromises.push(
        new Promise<void>((resolveSocket) => {
          global.io.close(() => {
            logger.info(colors.green('Socket.io server closed'));
            resolveSocket();
          });
        })
      );
    }

    // Close database connection
    shutdownPromises.push(
      new Promise<void>((resolveDb) => {
        if (mongoose.connection.readyState !== 0) {
          mongoose.connection
            .close(false)
            .then(() => {
              logger.info(colors.green('Database connection closed'));
              resolveDb();
            })
            .catch((err) => {
              errorLogger.error(
                colors.red('Error closing database connection'),
                err
              );
              resolveDb();
            });
        } else {
          resolveDb();
        }
      })
    );

    // Wait for all services to shut down or timeout
    const timeoutPromise = new Promise<void>((resolveTimeout) => {
      setTimeout(() => {
        logger.warn(
          colors.yellow(`Shutdown timed out after ${SHUTDOWN_TIMEOUT_MS}ms`)
        );
        resolveTimeout();
      }, SHUTDOWN_TIMEOUT_MS);
    });

    Promise.race([Promise.all(shutdownPromises), timeoutPromise])
      .then(() => {
        isShuttingDown = false;
        if (shouldExit) {
          process.exit(0);
        }
        resolve();
      })
      .catch((err) => {
        errorLogger.error(colors.red('Error during shutdown:'), err);
        isShuttingDown = false;
        if (shouldExit) {
          process.exit(1);
        }
        resolve();
      });
  });
}

// Set up MongoDB connection listeners
function setupMongooseListeners(): void {
  mongoose.connection.on('error', (err) => {
    errorLogger.error(colors.red('MongoDB connection error:'), err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn(
      colors.yellow('MongoDB disconnected. Attempting to reconnect...')
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

// Connect to MongoDB with retry mechanism
async function connectToDatabase(retryAttempt = 1): Promise<void> {
  try {
    await mongoose.connect(config.database_url as string, {
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    logger.info(colors.green('🚀 Database connected successfully'));
  } catch (error: any) {
    errorLogger.error(
      colors.red(`Database connection failed (attempt ${retryAttempt}):`)
    );
    
    if (retryAttempt < 5) {
      logger.info(colors.yellow(`Reconnection attempt ${retryAttempt}...`));
      await new Promise(resolve => setTimeout(resolve, RECONNECT_DELAY_MS));
      return connectToDatabase(retryAttempt + 1);
    } else {
      throw new Error('Failed to connect to database after multiple attempts');
    }
  }
}

// Start the server
async function startServer() {
  try {
    validateConfig();
    await connectToDatabase();
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
    await new Promise<void>((resolve, reject) => {
      httpServer.listen(httpPort, config.ip_address as string, () => {
        logger.info(
          colors.yellow(
            `♻️  Application listening on http://${config.ip_address}:${httpPort}`
          )
        );
        resolve();
      });
      
      httpServer.on('error', (error) => {
        reject(error);
      });
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
        `♻️  Socket is listening on ${config.ip_address}:${socketPort}`
      )
    );

    // Return successfully started server
    return { httpServer, socketServer };
  } catch (error: any) {
    errorLogger.error(colors.red('🤢 Failed to start server'), {
      message: error.message,
      stack: error.stack,
    });
    
    // Wait a moment and try to restart the server
    logger.info(colors.yellow(`Attempting to restart server in ${RECONNECT_DELAY_MS/1000} seconds...`));
    await new Promise(resolve => setTimeout(resolve, RECONNECT_DELAY_MS));
    return startServer();
  }
}

// Set up process event handlers with recovery mechanism
function setupProcessHandlers(): void {
  process.on('uncaughtException', async (error) => {
    errorLogger.error(colors.red('Uncaught Exception:'), error);
    
    try {
      // Shut down current services
      await gracefulShutdown('uncaughtException', false);
      
      // Wait a moment before restarting
      logger.info(colors.yellow(`Attempting to restart server in ${RECONNECT_DELAY_MS/1000} seconds...`));
      await new Promise(resolve => setTimeout(resolve, RECONNECT_DELAY_MS));
      
      // Restart server
      await startServer();
      logger.info(colors.green('Server successfully restarted after uncaught exception'));
    } catch (restartError: any) {
      errorLogger.error(colors.red('Failed to restart server:'), restartError);
      process.exit(1);
    }
  });

  process.on('unhandledRejection', async (reason, promise) => {
    errorLogger.error(
      colors.red('Unhandled Rejection at:'),
      promise,
      'reason:',
      reason
    );
    
    try {
      // Shut down current services
      await gracefulShutdown('unhandledRejection', false);
      
      // Wait a moment before restarting
      logger.info(colors.yellow(`Attempting to restart server in ${RECONNECT_DELAY_MS/1000} seconds...`));
      await new Promise(resolve => setTimeout(resolve, RECONNECT_DELAY_MS));
      
      // Restart server
      await startServer();
      logger.info(colors.green('Server successfully restarted after unhandled rejection'));
    } catch (restartError: any) {
      errorLogger.error(colors.red('Failed to restart server:'), restartError);
      process.exit(1);
    }
  });

  // Still listen for termination signals
  process.on('SIGINT', () => {
    gracefulShutdown('SIGINT', true);
  });

  process.on('SIGTERM', () => {
    gracefulShutdown('SIGTERM', true);
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