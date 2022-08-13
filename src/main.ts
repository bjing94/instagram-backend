import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3001',
    methods: ['POST', 'GET', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'PUT'],
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
