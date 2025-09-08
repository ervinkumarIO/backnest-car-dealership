import { PartialType } from '@nestjs/mapped-types';
import { CreateCarDto } from './create-car.dto';
import { IsArray, IsString } from 'class-validator';

export class UpdateCarDto extends PartialType(CreateCarDto) {}

export class UpdateCarImagesDto {
  @IsArray({ message: 'Keys must be an array' })
  @IsString({ each: true, message: 'Each key must be a string' })
  keys: string[];
}
