import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { CarsController } from './cars.controller';
import { CarStoreController } from './car-store.controller';
import { CarImagesController } from './car-images.controller';
import { PublicViewController } from './public-view.controller';
import { PublicController } from './public.controller';
import { CarsService } from './cars.service';
import { S3Service } from './s3.service';
import { Car } from '../entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Car]),
    AuthModule,
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  ],
  controllers: [
    CarsController,
    CarStoreController,
    CarImagesController,
    PublicViewController,
    PublicController,
  ],
  providers: [CarsService, S3Service],
  exports: [CarsService, S3Service],
})
export class CarsModule {}
