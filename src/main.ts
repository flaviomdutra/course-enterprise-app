import { NestFactory } from '@nestjs/core';
import { LoggerFactory } from '@sharedModules/logger/util/logger.factory';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = LoggerFactory('application-main');
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(logger);
  await app.listen(3000);
}
bootstrap();
