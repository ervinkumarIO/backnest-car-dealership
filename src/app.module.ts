import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Admin, Staff, Car } from './entities';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { StaffModule } from './staff/staff.module';
import { CarsModule } from './cars/cars.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    // Environment Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: 60000,
          limit: configService.get('NODE_ENV') === 'production' ? 100 : 1000,
        },
      ],
      inject: [ConfigService],
    }),

    // Database Configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '5432')),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_DATABASE', 'car_dealership'),
        entities: [Admin, Staff, Car],
        synchronize:
          configService.get('NODE_ENV', 'development') === 'development',
        logging: configService.get('NODE_ENV', 'development') === 'development',
        autoLoadEntities: true,
        ssl:
          configService.get('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
        extra: {
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
      inject: [ConfigService],
    }),

    // Feature Modules
    AuthModule,
    AdminModule,
    StaffModule,
    CarsModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
