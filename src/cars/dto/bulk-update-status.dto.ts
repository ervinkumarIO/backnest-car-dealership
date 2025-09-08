import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class BulkUpdateStatusDto {
  @IsString({ message: 'Status must be a string' })
  @IsNotEmpty({ message: 'Status is required' })
  status: string;

  @IsArray({ message: 'ChassisNumbers must be an array' })
  @IsString({ each: true, message: 'Each chassis number must be a string' })
  chassisNumbers: string[];
}
