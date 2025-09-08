import { IsArray, IsString } from 'class-validator';

export class BulkDeleteDto {
  @IsArray({ message: 'ChassisNumbers must be an array' })
  @IsString({ each: true, message: 'Each chassis number must be a string' })
  chassisNumbers: string[];
}
