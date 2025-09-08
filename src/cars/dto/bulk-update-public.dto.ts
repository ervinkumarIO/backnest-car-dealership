import { IsIn, IsArray, IsString } from 'class-validator';

export class BulkUpdatePublicDto {
  @IsIn(['yes', 'no'], { message: 'Public must be either "yes" or "no"' })
  public: 'yes' | 'no';

  @IsArray({ message: 'ChassisNumbers must be an array' })
  @IsString({ each: true, message: 'Each chassis number must be a string' })
  chassisNumbers: string[];
}
