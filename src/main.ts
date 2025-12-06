import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS if needed
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true, 
      transform: true, 
      transformOptions: {
        enableImplicitConversion: true, 
      },
    }),
  );

  // Global exception filters
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`
  Application is running on: http://localhost:${port}
  API Documentation:
     - POST   /auth/signup        - Create new user account
     - POST   /auth/login         - Login and get JWT token
     - POST   /keys/create        - Create API key (requires JWT)
     - GET    /keys               - List your API keys (requires JWT)
     - POST   /keys/:id/revoke    - Revoke API key (requires JWT)
     - DELETE /keys/:id           - Delete API key (requires JWT)
     - GET    /protected/*        - Protected endpoints (JWT or API key)
  `);
}
bootstrap();
