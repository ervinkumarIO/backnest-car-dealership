import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CarsService } from './cars.service';
import { AdminOnly, RolesGuard } from '../common';
import { S3Service } from './s3.service';

@Controller('cars/images')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CarImagesController {
  constructor(
    private readonly carsService: CarsService,
    private readonly s3Service: S3Service,
  ) {}

  // Upload car images directly
  @Post('upload')
  @AdminOnly()
  @UseInterceptors(
    FilesInterceptor('car_image', 10, {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/webp',
          'application/pdf',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Invalid file type. Only JPEG, PNG, JPG, WebP, and PDF files are allowed.',
            ),
            false,
          );
        }
      },
    }),
  )
  async upload(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    return this.s3Service.uploadCarImages(files);
  }

  // Generate presigned URLs for multiple files
  @Post('presigned-urls')
  @AdminOnly()
  generatePresignedUrls(
    @Body() body: { files: Array<{ fileName: string; contentType?: string }> },
  ) {
    return this.s3Service.generatePresignedUrls(body.files);
  }

  // Generate presigned URLs for specific car
  @Post('car-presigned-urls')
  @AdminOnly()
  generateCarImagePresignedUrls(
    @Body()
    body: {
      chassisNo: string;
      files: Array<{ fileName: string; contentType?: string }>;
    },
  ) {
    return this.s3Service.generateCarImagePresignedUrls(
      body.chassisNo,
      body.files,
    );
  }

  // Laravel equivalent route for frontend compatibility
  @Post('generate-car-image-presigned-urls')
  @AdminOnly()
  generateCarImagePresignedUrlsLegacy(
    @Body()
    body: {
      chassisNo: string;
      files: Array<{ fileName: string; contentType?: string }>;
    },
  ) {
    return this.s3Service.generateCarImagePresignedUrls(
      body.chassisNo,
      body.files,
    );
  }

  // Update car's image URLs after successful frontend upload
  @Post('update-car-images')
  @AdminOnly()
  async updateCarImages(@Body() body: { chassisNo: string; keys: string[] }) {
    return this.carsService.updateCarImages(body.chassisNo, body.keys);
  }

  // Delete specific images from a car
  @Delete(':chassisNo/images')
  @AdminOnly()
  async deleteImages(
    @Param('chassisNo') chassisNo: string,
    @Body() body: { imageUrls: string[] },
  ) {
    return this.s3Service.deleteCarImages(chassisNo, body.imageUrls);
  }

  // Delete specific image by index (Frontend compatible)
  @Delete(':chassisNo/:imageIndex')
  @AdminOnly()
  async deleteImageByIndex(
    @Param('chassisNo') chassisNo: string,
    @Param('imageIndex') imageIndex: string,
  ) {
    const index = parseInt(imageIndex, 10);
    if (isNaN(index) || index < 0) {
      throw new BadRequestException('Invalid image index');
    }
    return await this.s3Service.deleteCarImageByIndex(chassisNo, index);
  }

  // Add images to specific car (Laravel equivalent route)
  @Post('add-images/:chassisNo')
  @AdminOnly()
  @UseInterceptors(
    FilesInterceptor('car_image', 10, {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/webp',
          'application/pdf',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Invalid file type. Only JPEG, PNG, JPG, WebP, and PDF files are allowed.',
            ),
            false,
          );
        }
      },
    }),
  )
  async addImageDirect(
    @Param('chassisNo') chassisNo: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    return this.s3Service.addCarImages(chassisNo, files);
  }

  // Add images to specific car (alternative route)
  @Post(':chassisNo/add')
  @AdminOnly()
  @UseInterceptors(
    FilesInterceptor('car_image', 10, {
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/webp',
          'application/pdf',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Invalid file type. Only JPEG, PNG, JPG, WebP, and PDF files are allowed.',
            ),
            false,
          );
        }
      },
    }),
  )
  async addImage(
    @Param('chassisNo') chassisNo: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    return this.s3Service.addCarImages(chassisNo, files);
  }

  // Migrate problematic images (e.g., special characters in chassis numbers)
  @Post('migrate-problematic-images')
  @AdminOnly()
  async migrateProblematicImages(
    @Body() body: { chassisNo: string; dryRun?: boolean },
  ) {
    return this.s3Service.migrateProblematicImages(
      body.chassisNo,
      body.dryRun ?? true,
    );
  }
}
