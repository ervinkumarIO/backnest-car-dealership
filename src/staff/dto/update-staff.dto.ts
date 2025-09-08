import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffDto } from './create-staff.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateStaffDto extends PartialType(CreateStaffDto) {
  @IsBoolean({ message: 'is_active must be a boolean' })
  @IsOptional()
  is_active?: boolean;
}
