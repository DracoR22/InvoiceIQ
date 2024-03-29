import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ParsersModule } from './modules/parsers/parsers.module';
import configuration from './config/configuration';
import { OrganizedDataModule } from './modules/organized-data/organized-data.module';
import { LoggerModule } from './modules/logger/logger.module';
import { LoggerMiddleware } from './modules/logger/middlewares/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      cache: true,
      load: [configuration],
     }),
    ThrottlerModule.forRoot([{
      ttl: 30,
      limit: 200,
    }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule to access ConfigService
      inject: [ConfigService], // Inject ConfigService
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    ParsersModule,
    OrganizedDataModule,
    LoggerModule
  ],
})
export class AppModule {
  // USE LOGGER MIDDLEWARE
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
