import 'dotenv/config';
import { env } from './config/env';
import app from './app';
import { prisma } from './config/database';
import { logger } from './config/logger';

async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Database connection established');

    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received – shutting down gracefully`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection', { reason });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

bootstrap();
