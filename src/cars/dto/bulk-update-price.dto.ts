import { IsNumber, IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkUpdatePriceDto {
  @IsNumber({}, { message: 'Price must be a number' })
  @Type(() => Number)
  price: number;

  @IsArray({ message: 'ChassisNumbers must be an array' })
  @IsString({ each: true, message: 'Each chassis number must be a string' })
  chassisNumbers: string[];
}
