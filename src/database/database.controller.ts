import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DatabaseService } from './database.service';
import { RolesGuard } from '../common';

@Controller('api/v1/dev/database')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get database status and statistics
   * Available to all authenticated users for monitoring
   * Note: For direct access without authentication, use /public/database/status
   */
  @Get('status')
  async getStatus() {
    const status = await this.databaseService.getDatabaseStatus();
    return {
      status: 'connected',
      tables: {
        cars: status.cars,
        admins: status.admins,
        staff: status.staff,
      },
      lastBackup: new Date().toISOString(),
    };
  }
}
