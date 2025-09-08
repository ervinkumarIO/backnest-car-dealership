import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateStaffDto {
  @IsString({ message: 'Staff ID must be a string' })
  @IsNotEmpty({ message: 'Staff ID is required' })
  staffId: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString({ message: 'Branch must be a string' })
  @IsNotEmpty({ message: 'Branch is required' })
  branch: string;

  @IsString({ message: 'Phone must be a string' })
  @IsOptional()
  phone?: string;
}
