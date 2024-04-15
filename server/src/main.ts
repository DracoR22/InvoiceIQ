import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { VersioningType } from '@nestjs/common/enums';
import { ValidationPipe } from '@nestjs/common/pipes';
import { ApiKeyAuthGuard } from './modules/auth/guards/api-key-auth.guard';
import { ISOLogger } from './modules/logger/services/iso-logger.service';

async function bootstrap() {
  // USE LOGGER
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  app.useLogger(await app.resolve(ISOLogger))

  // Security
  app.useGlobalGuards(new ApiKeyAuthGuard())
  app.enableCors()
  app.use(helmet())

  app.enableVersioning({
    type: VersioningType.URI
  })

  // OpenApi swagger documentation
  const config = new DocumentBuilder()
   .setTitle('InvoiceIQ API')
   .setContact('Draco R', 'https://github.com/DracoR22', 'rdraco039@gmail.com')
   .setDescription('InvoiceIQ is an API that allows you to organize your data in a way that is easy to use and understand with the power of large language models')
   .setVersion('1.0')
   .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header', description: 'The API key to use for authentication' }, 'apiKey')
   .addTag('invoiceiq')
   .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe())

  await app.listen(3001);
}
bootstrap();
