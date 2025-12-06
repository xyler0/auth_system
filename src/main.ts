import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
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
  
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Auth API System')
    .setDescription(
      `A comprehensive authentication system with JWT and API Key support.
      `,
    )
   
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'Enter your API key',
      },
      'Api-Key',
    )
    .addTag('Authentication', 'User signup and login endpoints')
    .addTag('Protected', 'Example protected endpoints')
    .addTag('API Keys', 'API key management for service authentication')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Auth API - Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
      .swagger-ui .scheme-container { margin: 20px 0 }
      .swagger-ui .filter-container { display: none }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list', 
      filter: false, 
      showRequestDuration: true,
      tagsSorter: (a, b) => {
        const order = ['Authentication', 'Protected', 'API Keys'];
        return order.indexOf(a) - order.indexOf(b);
      },
      operationsSorter: 'undefined',
    },
  });

  // Start the application
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
  Application is running on: http://localhost:${port}
   Swagger Documentation: http://localhost:${port}/api
  
  `);
}
bootstrap();