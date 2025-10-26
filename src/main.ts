import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { env } from './env/env';

async function bootstrap() {
  const port = env.PORT ?? 3000
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Principia Test Backend API')
    .setDescription('Routes especifications')
    .setVersion('1.0')
    .build();
  const swaggerDocumentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDocumentFactory, {jsonDocumentUrl: 'swagger/json'});
  await app.listen(port);
  console.log(`Server listening on port: ${port}`)
}
bootstrap();
