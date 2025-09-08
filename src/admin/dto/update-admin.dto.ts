import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminDto } from './create-admin.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @IsBoolean({ message: 'is_active must be a boolean' })
  @IsOptional()
  is_active?: boolean;
}
