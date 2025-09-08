import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCarDto {
  @IsString({ message: 'Chassis number must be a string' })
  @IsNotEmpty({ message: 'Chassis number is required' })
  chassisNo: string;

  @IsString({ message: 'Brand must be a string' })
  @IsNotEmpty({ message: 'Brand is required' })
  brand: string;

  @IsString({ message: 'Model must be a string' })
  @IsNotEmpty({ message: 'Model is required' })
  model: string;

  @IsString({ message: 'Variant must be a string' })
  @IsNotEmpty({ message: 'Variant is required' })
  variant: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @Type(() => Number)
  @Min(0, { message: 'Price must be positive' })
  price: number;

  @IsNumber({}, { message: 'Year must be a number' })
  @Type(() => Number)
  @Min(1900, { message: 'Year must be after 1900' })
  @Max(new Date().getFullYear() + 1, { message: 'Year cannot be in future' })
  year: number;

  @IsString({ message: 'Color must be a string' })
  @IsNotEmpty({ message: 'Color is required' })
  color: string;

  @IsString({ message: 'Transmission must be a string' })
  @IsNotEmpty({ message: 'Transmission is required' })
  transmission: string;

  @IsString({ message: 'Fuel type must be a string' })
  @IsNotEmpty({ message: 'Fuel type is required' })
  fuelType: string;

  @IsNumber({}, { message: 'Mileage must be a number' })
  @Type(() => Number)
  @Min(0, { message: 'Mileage must be positive' })
  mileage: number;

  @IsString({ message: 'Grade must be a string' })
  @IsNotEmpty({ message: 'Grade is required' })
  grade: string;

  @IsString({ message: 'Status must be a string' })
  @IsNotEmpty({ message: 'Status is required' })
  status: string;

  @IsString({ message: 'Condition must be a string' })
  @IsNotEmpty({ message: 'Condition is required' })
  condition: string;

  @IsArray({ message: 'Features must be an array' })
  features: any[];

  @IsString({ message: 'Remarks must be a string' })
  @IsOptional()
  remarks?: string;

  @IsString({ message: 'Branch must be a string' })
  @IsNotEmpty({ message: 'Branch is required' })
  branch: string;

  @IsString({ message: 'SoldBy must be a string' })
  @IsOptional()
  soldBy?: string;

  @IsString({ message: 'SoldAt must be a string' })
  @IsOptional()
  soldAt?: string;

  @IsArray({ message: 'Image must be an array' })
  @IsOptional()
  image?: any[];

  @IsIn(['yes', 'no'], { message: 'Public must be either "yes" or "no"' })
  @IsOptional()
  public?: string = 'no';
}
