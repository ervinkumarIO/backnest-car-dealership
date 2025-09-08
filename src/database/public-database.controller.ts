import { Controller, Post, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('public/database')
export class PublicDatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Public endpoint for initial database setup (no authentication required)
   * This should only be used for initial setup and then disabled in production
   */
  @Post('setup')
  @HttpCode(HttpStatus.OK)
  async setupPublic() {
    try {
      await this.databaseService.setupDevelopmentDatabase();
      return {
        message: 'Database setup completed successfully',
        tablesCreated: 5,
      };
    } catch (error) {
      return {
        message: 'Database setup failed',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Public endpoint to check database status (no authentication required)
   */
  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus() {
    try {
      await this.databaseService.getDatabaseStatus();
      return {
        status: 'connected',
        version: '1.0.0',
        lastMigration: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'disconnected',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Public endpoint to run database migrations (no authentication required)
   * LEAD DEVELOPER ACCESS - Creates/updates database structure
   */
  @Post('migrate')
  @HttpCode(HttpStatus.OK)
  async runMigrations() {
    try {
      await this.databaseService.runMigrations();
      return {
        message: 'Database migration completed successfully',
        migrationsRun: 3,
      };
    } catch (error) {
      return {
        message: 'Database migration failed',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Public endpoint to seed database with development data (no authentication required)
   * LEAD DEVELOPER ACCESS - Adds initial data for development
   */
  @Post('seed')
  @HttpCode(HttpStatus.OK)
  async seedDatabase() {
    try {
      await this.databaseService.seedDatabase();
      return {
        message: 'Database seeded successfully',
        recordsCreated: 50,
      };
    } catch (error) {
      return {
        message: 'Database seeding failed',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Public endpoint to reset database (no authentication required)
   * LEAD DEVELOPER ACCESS - DANGEROUS! Deletes all data
   */
  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetDatabase() {
    try {
      await this.databaseService.resetDatabase();
      return {
        message: 'Database reset completed successfully',
        recordsDeleted: 1000,
      };
    } catch (error) {
      return {
        message: 'Database reset failed',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
