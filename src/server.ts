import colors from 'colors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app';
import config from './config';
import { seedSuperAdmin } from './DB/seedAdmin';
import { socketHelper } from './helpers/socketHelper';
import { errorLogger, logger } from './shared/logger';

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  errorLogger.error('UnhandleException Detected', error);
  process.exit(1);
});

let server: any;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    logger.info(colors.green('🚀 Database connected successfully'));

    // Seed Super Admin after database connection is successful
    await seedSuperAdmin();

    const port =
      typeof config.port === 'number' ? config.port : Number(config.port);

    server = app.listen(port, config.ip_address as string, () => {
      logger.info(
        colors.yellow(
          `♻️  Application listening on http://${config.ip_address}:${config.port}`,
        ),
      );
    });

    // Initialize Socket server after app starts
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    });

    socketHelper.socket(io);

    //@ts-ignore
    global.io = io;

    logger.info(
      colors.yellow(
        `♻️  Socket is listening on ${config.ip_address}:${config.socket_port}`,
      ),
    );
  } catch (error) {
    errorLogger.error(colors.red('🤢 Failed to connect Database'), error);
    process.exit(1); // Exit after db failure
  }

  // Handle unhandled rejection
  process.on('unhandledRejection', (error) => {
    if (server) {
      server.close(() => {
        errorLogger.error('UnhandleRejection Detected', error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });

  // Handle SIGTERM and SIGINT for graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    if (server) {
      server.close(() => {
        logger.info('Server closed gracefully');
        process.exit(0);
      });
    }
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    if (server) {
      server.close(() => {
        logger.info('Server closed gracefully');
        process.exit(0);
      });
    }
  });
}

main();
