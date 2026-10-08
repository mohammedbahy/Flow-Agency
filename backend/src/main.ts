import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global API prefix: all routes live under /api
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  // CORS (permissive for local university development; tighten in production)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation: DTOs are validated automatically (Sprint 1 will add auth DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Basic error handling
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Agency Management System API')
    .setDescription(
      'University Software Engineering project — technical foundation (Sprint 0). Business endpoints arrive in Sprint 1+.',
    )
    .setVersion('0.1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT ?? process.env.BACKEND_PORT ?? 3000);
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}/api`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
void bootstrap();
