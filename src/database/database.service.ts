import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// Type definitions for database query results
interface DatabaseStatus {
  admins: number;
  staff: number;
  cars: number;
  database: string;
  type: string;
}

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  /**
   * Run database migrations from SQL files
   * This is useful for development and initial setup
   */
  async runMigrations(): Promise<void> {
    try {
      this.logger.log('Running database migrations...');

      // Use process.cwd() to get the project root, then navigate to src/database/migrations
      const migrationsPath = path.join(
        process.cwd(),
        'src',
        'database',
        'migrations',
      );
      const migrationFiles = fs
        .readdirSync(migrationsPath)
        .filter((file) => file.endsWith('.sql'))
        .sort();

      for (const file of migrationFiles) {
        const filePath = path.join(migrationsPath, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        this.logger.log(`Executing migration: ${file}`);

        // Split SQL into individual statements and execute them one by one
        const statements = sql
          .split(';')
          .map((stmt) => stmt.trim())
          .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
          if (statement.trim()) {
            await this.dataSource.query(statement);
          }
        }
      }

      this.logger.log('Database migrations completed successfully');
    } catch (error) {
      this.logger.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Seed database with initial development data
   * Only runs if tables are empty (safe for development)
   */
  async seedDatabase(): Promise<void> {
    try {
      this.logger.log('Seeding database...');

      // Check if data already exists
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const adminCount = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM admins',
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.log(`Current admin count: ${adminCount[0].count}`);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (adminCount[0].count > 0) {
        this.logger.log('Database already seeded, skipping...');
        return;
      }

      const seedersPath = path.join(
        process.cwd(),
        'src',
        'database',
        'seeders',
      );
      this.logger.log(`Seeders path: ${seedersPath}`);

      const seederFiles = fs
        .readdirSync(seedersPath)
        .filter((file) => file.endsWith('.sql'))
        .sort();

      this.logger.log(`Found seeder files: ${seederFiles.join(', ')}`);

      for (const file of seederFiles) {
        const filePath = path.join(seedersPath, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        this.logger.log(`Executing seeder: ${file}`);
        this.logger.log(`SQL content length: ${sql.length} characters`);

        // Split SQL into individual statements and execute them one by one
        // Handle multi-line statements and comments properly
        const statements = sql
          .split(';')
          .map((stmt) => stmt.trim())
          .filter((stmt) => stmt.length > 0)
          .map((stmt) => {
            // Remove comment lines but keep the actual SQL
            const lines = stmt.split('\n');
            const sqlLines = lines.filter((line) => {
              const trimmed = line.trim();
              return trimmed.length > 0 && !trimmed.startsWith('--');
            });
            return sqlLines.join(' ').replace(/\s+/g, ' ').trim();
          })
          .filter((stmt) => stmt.length > 0);

        this.logger.log(`Found ${statements.length} SQL statements to execute`);

        // Log all statements for debugging
        statements.forEach((stmt, index) => {
          this.logger.log(`Statement ${index + 1}: "${stmt}"`);
        });

        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i];
          if (statement.trim()) {
            this.logger.log(
              `Executing statement ${i + 1}: ${statement.substring(0, 100)}...`,
            );
            this.logger.log(`Full statement ${i + 1}: ${statement}`);
            try {
              const result = (await this.dataSource.query(
                statement,
              )) as unknown;
              this.logger.log(
                `Statement ${i + 1} executed successfully. Result:`,
                result,
              );
            } catch (stmtError) {
              this.logger.error(`Statement ${i + 1} failed:`, stmtError);
              this.logger.error(`Failed statement: ${statement}`);
              throw stmtError;
            }
          } else {
            this.logger.log(`Skipping empty statement ${i + 1}`);
          }
        }
      }

      // Verify data was inserted
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const finalAdminCount = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM admins',
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const finalStaffCount = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM staff',
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const finalCarCount = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM cars',
      );

      this.logger.log(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Final counts - Admins: ${finalAdminCount[0].count}, Staff: ${finalStaffCount[0].count}, Cars: ${finalCarCount[0].count}`,
      );
      this.logger.log('Database seeding completed successfully');
    } catch (error) {
      this.logger.error('Seeding failed:', error);
      throw error;
    }
  }

  /**
   * Reset database (drop and recreate all tables)
   * WARNING: This will delete all data!
   */
  async resetDatabase(): Promise<void> {
    try {
      this.logger.warn('Resetting database - ALL DATA WILL BE LOST!');

      // Drop all tables
      await this.dataSource.dropDatabase();

      // Recreate database
      await this.dataSource.synchronize();

      this.logger.log('Database reset completed');
    } catch (error) {
      this.logger.error('Database reset failed:', error);
      throw error;
    }
  }

  /**
   * Setup database for development (migrations + seeding)
   */
  async setupDevelopmentDatabase(): Promise<void> {
    try {
      this.logger.log('Setting up development database...');

      // Run migrations first
      await this.runMigrations();

      // Then seed with data
      await this.seedDatabase();

      this.logger.log('Development database setup completed');
    } catch (error) {
      this.logger.error('Development database setup failed:', error);
      throw error;
    }
  }

  /**
   * Get database status and statistics
   */
  async getDatabaseStatus(): Promise<DatabaseStatus> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const adminCount = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM admins',
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const staffCount = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM staff',
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const carCount = await this.dataSource.query(
        'SELECT COUNT(*) as count FROM cars',
      );

      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        admins: adminCount[0].count,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        staff: staffCount[0].count,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        cars: carCount[0].count,
        database: this.dataSource.options.database as string,
        type: this.dataSource.options.type as string,
      };
    } catch (error) {
      this.logger.error('Failed to get database status:', error);
      throw error;
    }
  }
}
