import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from '../entities';
import { DataSource } from 'typeorm';

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private bucketName: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Car)
    private carRepository: Repository<Car>,
    private dataSource: DataSource,
  ) {
    // Initialize S3 client
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION', 'us-west-2'),
    });

    this.bucketName = this.configService.get(
      'AWS_S3_BUCKET',
      'car-dealership-images',
    );
  }

  /**
   * Sanitize chassis number for use in file paths
   * Replaces problematic characters that can cause URL issues
   */
  private sanitizeChassisNoForPath(chassisNo: string): string {
    // Replace problematic characters with safe alternatives
    const sanitized = chassisNo
      .replace(/#/g, 'HASH')
      .replace(/%/g, 'PCT')
      .replace(/\?/g, 'Q')
      .replace(/&/g, 'AND')
      .replace(/\+/g, 'PLUS')
      .replace(/ /g, '-');

    // Remove any other potentially problematic characters
    return sanitized.replace(/[^a-zA-Z0-9\-_.]/g, '');
  }

  /**
   * Clean URL by removing backslashes and normalizing forward slashes
   */
  private cleanUrl(url: string): string {
    return url.replace(/[\\]/g, '/').replace(/\/+/g, '/');
  }

  // Upload car images and group by chassis number (Laravel equivalent)
  async uploadCarImages(files: Express.Multer.File[]) {
    const groupedImages: Record<string, string[]> = {};

    for (const file of files) {
      // Extract filename (e.g. SDF1234_1.jpg)
      const originalName = file.originalname;

      // Remove all spaces from filename to prevent URL encoding issues
      const sanitizedOriginalName = originalName.replace(/ /g, '');

      // Get chassisNo from filename
      const chassisNo = sanitizedOriginalName.split('_')[0];

      // Create a unique filename to avoid overwriting
      const s3FileName = `${Date.now()}_${sanitizedOriginalName}`;

      // Remove any accidental leading slash
      const cleanFileName = s3FileName.replace(/^\//, '');
      try {
        const uploadResult = await this.s3
          .upload({
            Bucket: this.bucketName,
            Key: cleanFileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
          })
          .promise();

        const imageUrl = this.cleanUrl(uploadResult.Location);

        // Group URLs by chassisNo
        if (!groupedImages[chassisNo]) {
          groupedImages[chassisNo] = [];
        }
        groupedImages[chassisNo].push(imageUrl);
      } catch (error) {
        console.error('S3 upload failed for', {
          file: sanitizedOriginalName,
          error: String(error),
        });
        throw new BadRequestException(
          `Failed to upload ${sanitizedOriginalName}`,
        );
      }
    }

    // Insert image URLs to DB for each car
    for (const [chassisNo, urls] of Object.entries(groupedImages)) {
      const car = await this.carRepository.findOne({ where: { chassisNo } });
      if (car) {
        // Get existing images and ensure they're clean
        const existingImages = Array.isArray(car.image)
          ? (car.image as string[])
          : [];

        // Clean existing URLs if they have escaped slashes
        const cleanedExistingImages = existingImages.map((url) =>
          url.replace(/\//g, '/'),
        );

        const combinedImages = [...cleanedExistingImages, ...urls];
        car.image = combinedImages;
        await this.carRepository.save(car);
      } else {
        console.warn('Car not found for chassisNo', { chassisNo });
      }
    }

    return {
      message: 'Images uploaded and linked to cars successfully!',
      data: groupedImages,
    };
  }

  // Generate presigned URLs for multiple files
  generatePresignedUrls(
    files: Array<{ fileName: string; contentType?: string }>,
  ) {
    const urls: Array<{ fileName: string; key: string; presignedUrl: string }> =
      [];

    for (const file of files) {
      const uniqueName = `${Date.now()}_${file.fileName}`;
      const key = `car-images/${uniqueName}`;

      const params = {
        Bucket: this.bucketName,
        Key: key,
        ContentType: file.contentType || 'image/jpeg',
        ACL: 'public-read',
        Expires: 900, // 15 minutes
      };

      const presignedUrl = this.s3.getSignedUrl('putObject', params);

      urls.push({
        fileName: file.fileName,
        key,
        presignedUrl,
      });
    }

    return {
      message: 'Presigned URLs generated successfully',
      data: {
        urls,
        expiresIn: '15 minutes',
        region: this.configService.get<string>('AWS_REGION') || 'us-west-2',
      },
    };
  }

  // Generate presigned URLs for car images with folder structure (Laravel equivalent)
  generateCarImagePresignedUrls(
    chassisNo: string,
    files: Array<{ fileName: string; contentType?: string }>,
  ) {
    const urls: Array<{ fileName: string; key: string; presignedUrl: string }> =
      [];
    const region = this.configService.get<string>('AWS_REGION') || 'us-west-2';
    const sanitizedChassisNo = this.sanitizeChassisNoForPath(chassisNo);

    for (const file of files) {
      // Create key with sanitized chassisNo folder structure
      const key = `cars/${sanitizedChassisNo}/${file.fileName}`;

      const params = {
        Bucket: this.bucketName,
        Key: key,
        ContentType: file.contentType || 'image/jpeg',
        ACL: 'public-read',
        Expires: 900, // 15 minutes
      };

      const presignedUrl = this.s3.getSignedUrl('putObject', params);

      urls.push({
        fileName: file.fileName,
        key,
        presignedUrl,
      });
    }

    return {
      message: 'Presigned URLs generated successfully',
      data: {
        chassisNo,
        urls,
        expiresIn: '15 minutes',
        region,
      },
    };
  }

  // Delete car images from S3 and database (Laravel equivalent)
  async deleteCarImages(chassisNo: string, imageUrls: string[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const car = await queryRunner.manager.findOne(Car, {
        where: { chassisNo },
      });
      if (!car) {
        throw new BadRequestException('Car not found');
      }

      // Ensure images field is an array
      const currentImages = Array.isArray(car.image)
        ? (car.image as string[])
        : [];

      // Remove selected images
      const remainingImages = currentImages.filter(
        (url) => !imageUrls.includes(url),
      );

      // Delete from S3
      for (const imageUrl of imageUrls) {
        try {
          const path = new URL(imageUrl).pathname; // e.g. /car-images/filename.jpg
          const filename = path.substring(1); // car-images/filename.jpg

          // Handle URL encoding issues (%20 vs + for spaces)
          const decodedFilename = decodeURIComponent(filename);
          // Create variations of the filename to try
          const filenamesToTry = [
            filename, // Original
            decodedFilename, // URL decoded
            filename.replace(/%20/g, '+'), // %20 -> +
            filename.replace(/\+/g, '%20'), // + -> %20
            decodedFilename.replace(/ /g, '+'), // spaces -> +
            decodedFilename.replace(/ /g, '%20'), // spaces -> %20
          ];

          // Remove duplicates and try each variation
          const uniqueFilenames = [...new Set(filenamesToTry)];
          let deleted = false;

          for (const tryFilename of uniqueFilenames) {
            try {
              await this.s3
                .deleteObject({
                  Bucket: this.bucketName,
                  Key: tryFilename,
                })
                .promise();

              deleted = true;
              console.log('S3 deletion successful', {
                original_url: imageUrl,
                successful_filename: tryFilename,
              });
              break;
            } catch {
              // Continue to next variation
            }
          }
          if (!deleted) {
            console.warn('S3 deletion failed for all filename variations', {
              original_url: imageUrl,
              attempted_filenames: uniqueFilenames,
            });
          }
        } catch (error: any) {
          console.error('S3 deletion failed', {
            url: imageUrl,
            error: (error as Error)?.message || 'Unknown error',
          });
        }
      }

      // Update database
      car.image = remainingImages;
      await queryRunner.manager.save(car);

      await queryRunner.commitTransaction();

      return {
        message: 'Images deleted successfully.',
        remaining_images: car.image as string[],
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        `Error deleting images: ${(error as Error)?.message || 'Unknown error'}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // Add images to specific car (Laravel equivalent)
  async addCarImages(chassisNo: string, files: Express.Multer.File[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const uploadedUrls: string[] = [];

    try {
      const car = await queryRunner.manager.findOne(Car, {
        where: { chassisNo },
      });
      if (!car) {
        throw new BadRequestException('Car not found');
      }

      for (const file of files) {
        // Create a unique filename
        const s3FileName = `${Date.now()}_${file.originalname}`;
        const cleanFileName = s3FileName.replace(/^\//, '');

        try {
          // Upload to S3
          const uploadResult = await this.s3
            .upload({
              Bucket: this.bucketName,
              Key: cleanFileName,
              Body: file.buffer,
              ContentType: file.mimetype,
              ACL: 'public-read',
            })
            .promise();

          // Get the URL and clean it
          const url = this.cleanUrl(uploadResult.Location);
          uploadedUrls.push(url);
        } catch (error: any) {
          throw new BadRequestException(
            `Error uploading image: ${(error as Error)?.message || 'Unknown error'}`,
          );
        }
      }

      // Get existing images and ensure they're clean
      const existingImages = Array.isArray(car.image)
        ? (car.image as string[])
        : [];
      const cleanedExistingImages = existingImages.map((url) =>
        url.replace(/\//g, '/'),
      );

      // Combine existing and new images
      const combinedImages = [...cleanedExistingImages, ...uploadedUrls];

      // Update car with new image URLs
      car.image = combinedImages;
      await queryRunner.manager.save(car);

      await queryRunner.commitTransaction();

      return {
        message: 'Images added successfully!',
        data: {
          chassisNo,
          new_images: uploadedUrls,
          all_images: car.image as string[],
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Clean up any uploaded files if there's an error
      if (uploadedUrls && uploadedUrls.length > 0) {
        for (const url of uploadedUrls) {
          try {
            const filename = url.split('/').pop();
            if (filename) {
              await this.s3
                .deleteObject({
                  Bucket: this.bucketName,
                  Key: filename,
                })
                .promise();
            }
          } catch (cleanupError) {
            console.error('Failed to cleanup uploaded file:', cleanupError);
          }
        }
      }

      throw new BadRequestException(
        `Error adding images: ${(error as Error)?.message || 'Unknown error'}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // Migrate problematic images (e.g., with special characters in chassis numbers)
  async migrateProblematicImages(chassisNo: string, dryRun: boolean = true) {
    const car = await this.carRepository.findOne({ where: { chassisNo } });
    if (!car) {
      throw new BadRequestException('Car not found');
    }

    // Sanitize chassis number for URL safety
    const sanitizedChassisNo = chassisNo.replace(/[^a-zA-Z0-9]/g, 'HASH');

    const migrations: Array<{ from: string; to: string }> = [];
    const errors: Array<{ imageUrl: string; error: string }> = [];
    const currentImages = Array.isArray(car.image)
      ? (car.image as string[])
      : [];

    for (const imageUrl of currentImages) {
      try {
        const oldKey = this.extractKeyFromUrl(imageUrl);
        const fileName = oldKey.split('/').pop();
        const newKey = `cars/${sanitizedChassisNo}/${fileName}`;

        migrations.push({
          from: oldKey,
          to: newKey,
        });

        if (!dryRun) {
          // Copy object to new location
          await this.s3
            .copyObject({
              Bucket: this.bucketName,
              CopySource: `${this.bucketName}/${oldKey}`,
              Key: newKey,
              ACL: 'public-read',
            })
            .promise();

          // Delete old object
          await this.s3
            .deleteObject({
              Bucket: this.bucketName,
              Key: oldKey,
            })
            .promise();
        }
      } catch (error: any) {
        errors.push({
          imageUrl,
          error: (error as Error)?.message || 'Unknown error',
        });
      }
    }

    if (!dryRun && migrations.length > 0) {
      // Update car's image URLs
      const newImageUrls = currentImages.map((url: string) => {
        const fileName = url.split('/').pop() || 'unknown';
        return `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION', 'us-west-2')}.amazonaws.com/cars/${sanitizedChassisNo}/${fileName}`;
      });

      car.image = newImageUrls;
      await this.carRepository.save(car);
    }

    return {
      message: dryRun ? 'Migration preview completed' : 'Migration completed',
      chassisNo,
      sanitizedChassisNo,
      migrations,
      errors,
      dryRun,
    };
  }

  private extractKeyFromUrl(url: string): string {
    // Extract S3 key from full URL
    const urlParts = url.split('/');
    return urlParts.slice(-2).join('/'); // Get last two parts (folder/filename)
  }

  // Update car's image URLs after successful frontend upload (Laravel equivalent)
  async updateCarImages(chassisNo: string, keys: string[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const car = await queryRunner.manager.findOne(Car, {
        where: { chassisNo },
      });
      if (!car) {
        throw new BadRequestException('Car not found');
      }

      // Generate URLs for the uploaded keys
      const newImageUrls = keys.map((key) => {
        // Remove any backslashes and ensure forward slashes
        const cleanKey = key.replace(/\\/g, '/');
        // Remove 'car-images/' if it exists in the key
        const finalKey = cleanKey.replace('car-images/', '');
        return `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION', 'us-west-2')}.amazonaws.com/${finalKey}`;
      });

      // Get existing images and ensure they're clean
      const existingImages = Array.isArray(car.image)
        ? (car.image as string[])
        : [];
      const cleanedExistingImages = existingImages.map((url) => {
        // Clean up any backslashes and remove car-images segment
        const cleanUrl = url.replace(/\\/g, '/');
        return cleanUrl.replace('car-images/', '');
      });

      // Combine existing and new images
      const combinedImages = [...cleanedExistingImages, ...newImageUrls];

      // Update car with new image URLs
      car.image = combinedImages;
      await queryRunner.manager.save(car);

      await queryRunner.commitTransaction();

      return {
        message: 'Car images updated successfully',
        data: {
          chassisNo,
          images: car.image as string[],
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        `Error updating car images: ${(error as Error)?.message || 'Unknown error'}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // Delete car image by index (Frontend compatible)
  async deleteCarImageByIndex(chassisNo: string, imageIndex: number) {
    console.log('🔍 DeleteCarImageByIndex called:', { chassisNo, imageIndex });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const car = await queryRunner.manager.findOne(Car, {
        where: { chassisNo },
      });

      console.log('🚗 Car found:', car ? 'Yes' : 'No');

      if (!car) {
        console.log('❌ Car not found for chassis:', chassisNo);
        throw new BadRequestException('Car not found');
      }

      // Get current images
      const currentImages = Array.isArray(car.image)
        ? (car.image as string[])
        : [];

      console.log('📸 Current images:', {
        isArray: Array.isArray(car.image),
        imageCount: currentImages.length,
        imageIndex,
        images: currentImages,
      });

      if (imageIndex >= currentImages.length) {
        console.log('❌ Image index out of range:', {
          requestedIndex: imageIndex,
          availableImages: currentImages.length,
        });
        throw new BadRequestException(
          `Image index ${imageIndex} out of range. Car has ${currentImages.length} images.`,
        );
      }

      // Get the image URL to delete
      const imageUrlToDelete = currentImages[imageIndex];

      // Remove the image at the specified index
      const updatedImages = currentImages.filter(
        (_, index) => index !== imageIndex,
      );

      // Delete from S3
      try {
        const path = new URL(imageUrlToDelete).pathname; // e.g. /car-images/filename.jpg
        const filename = path.substring(1); // car-images/filename.jpg

        // Handle URL encoding issues (%20 vs + for spaces)
        const decodedFilename = decodeURIComponent(filename);
        // Create variations of the filename to try
        const filenamesToTry = [
          filename, // Original
          decodedFilename, // URL decoded
          filename.replace(/%20/g, '+'), // %20 -> +
          filename.replace(/\+/g, '%20'), // + -> %20
          decodedFilename.replace(/ /g, '+'), // spaces -> +
          decodedFilename.replace(/ /g, '%20'), // spaces -> %20
        ];

        // Remove duplicates and try each variation
        const uniqueFilenames = [...new Set(filenamesToTry)];
        let deleted = false;

        for (const tryFilename of uniqueFilenames) {
          try {
            await this.s3
              .deleteObject({
                Bucket: this.bucketName,
                Key: tryFilename,
              })
              .promise();

            deleted = true;
            console.log('S3 deletion successful', {
              chassisNo,
              imageIndex,
              original_url: imageUrlToDelete,
              successful_filename: tryFilename,
            });
            break;
          } catch {
            // Continue to next variation
          }
        }
        if (!deleted) {
          console.warn('S3 deletion failed for all filename variations', {
            chassisNo,
            imageIndex,
            original_url: imageUrlToDelete,
            attempted_filenames: uniqueFilenames,
          });
        }
      } catch (error: any) {
        console.error('S3 deletion failed', {
          chassisNo,
          imageIndex,
          url: imageUrlToDelete,
          error: (error as Error)?.message || 'Unknown error',
        });
      }

      // Update database with remaining images
      car.image = updatedImages;
      await queryRunner.manager.save(car);

      await queryRunner.commitTransaction();

      return {
        message: 'Image deleted successfully',
        data: {
          chassisNo,
          deletedImageIndex: imageIndex,
          deletedImageUrl: imageUrlToDelete,
          remainingImages: updatedImages,
          imageCount: updatedImages.length,
        },
      };
    } catch (error) {
      console.error('❌ Error in deleteCarImageByIndex:', {
        chassisNo,
        imageIndex,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        `Error deleting image: ${(error as Error)?.message || 'Unknown error'}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // Bulk delete car images by indices (Recommended approach)
  async bulkDeleteCarImagesByIndices(chassisNo: string, indices: number[]) {
    console.log('🗑️ BulkDeleteCarImagesByIndices called:', {
      chassisNo,
      indices,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const car = await queryRunner.manager.findOne(Car, {
        where: { chassisNo },
      });

      if (!car) {
        console.log('❌ Car not found for chassis:', chassisNo);
        throw new BadRequestException('Car not found');
      }

      // Get current images
      const currentImages = Array.isArray(car.image)
        ? (car.image as string[])
        : [];

      console.log('📸 Current images:', {
        imageCount: currentImages.length,
        requestedIndices: indices,
        images: currentImages,
      });

      // Validate all indices are within bounds
      const invalidIndices = indices.filter(
        (index) => index >= currentImages.length,
      );
      if (invalidIndices.length > 0) {
        throw new BadRequestException(
          `Invalid indices: [${invalidIndices.join(', ')}]. Car has ${currentImages.length} images (valid indices: 0-${currentImages.length - 1}).`,
        );
      }

      // Check for duplicate indices
      const uniqueIndices = [...new Set(indices)];
      if (uniqueIndices.length !== indices.length) {
        console.log(
          '⚠️ Duplicate indices detected, using unique set:',
          uniqueIndices,
        );
      }

      // Sort indices in descending order to avoid reindexing issues during deletion
      const sortedIndices = uniqueIndices.sort((a, b) => b - a);
      console.log('🔢 Sorted indices (desc):', sortedIndices);

      // Get URLs of images to delete
      const imagesToDelete = sortedIndices.map((index) => ({
        index,
        url: currentImages[index],
      }));

      console.log('🎯 Images to delete:', imagesToDelete);

      // Delete from S3
      const deletionResults: Array<{
        index: number;
        url: string;
        s3Deleted: boolean;
        attemptedFilenames?: string[];
        error?: string;
      }> = [];
      for (const { index, url } of imagesToDelete) {
        try {
          const path = new URL(url).pathname;
          const filename = path.substring(1);

          // Handle URL encoding variations
          const decodedFilename = decodeURIComponent(filename);
          const filenamesToTry = [
            filename,
            decodedFilename,
            filename.replace(/%20/g, '+'),
            filename.replace(/\+/g, '%20'),
            decodedFilename.replace(/ /g, '+'),
            decodedFilename.replace(/ /g, '%20'),
          ];

          const uniqueFilenames = [...new Set(filenamesToTry)];
          let deleted = false;

          for (const tryFilename of uniqueFilenames) {
            try {
              await this.s3
                .deleteObject({
                  Bucket: this.bucketName,
                  Key: tryFilename,
                })
                .promise();

              deleted = true;
              console.log('✅ S3 deletion successful:', {
                index,
                url,
                filename: tryFilename,
              });
              break;
            } catch {
              // Continue to next variation
            }
          }

          deletionResults.push({
            index,
            url,
            s3Deleted: deleted,
            attemptedFilenames: uniqueFilenames,
          });

          if (!deleted) {
            console.warn('⚠️ S3 deletion failed for all variations:', {
              index,
              url,
              attemptedFilenames: uniqueFilenames,
            });
          }
        } catch (error) {
          console.error('❌ Error processing image deletion:', {
            index,
            url,
            error: error instanceof Error ? error.message : String(error),
          });
          deletionResults.push({
            index,
            url,
            s3Deleted: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Remove images from array (in descending order to avoid index shifting)
      const updatedImages = [...currentImages];
      for (const index of sortedIndices) {
        updatedImages.splice(index, 1);
      }

      console.log('📸 Updated images array:', {
        originalCount: currentImages.length,
        deletedCount: sortedIndices.length,
        remainingCount: updatedImages.length,
        remaining: updatedImages,
      });

      // Update database
      car.image = updatedImages;
      await queryRunner.manager.save(car);

      await queryRunner.commitTransaction();

      return {
        message: 'Images deleted successfully',
        data: {
          chassisNo,
          deletedIndices: sortedIndices,
          deletedImages: imagesToDelete.map((img) => img.url),
          remainingImages: updatedImages,
          imageCount: updatedImages.length,
          deletionResults,
          summary: {
            requested: indices.length,
            processed: uniqueIndices.length,
            successful: deletionResults.filter((r) => r.s3Deleted).length,
            failed: deletionResults.filter((r) => !r.s3Deleted).length,
          },
        },
      };
    } catch (error) {
      console.error('❌ Error in bulkDeleteCarImagesByIndices:', {
        chassisNo,
        indices,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        `Error deleting images: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
