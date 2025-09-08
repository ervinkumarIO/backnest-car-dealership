import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { DatabaseController } from './database.controller';
import { PublicDatabaseController } from './public-database.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([]), // No entities needed for raw SQL operations
  ],
  providers: [DatabaseService],
  controllers: [DatabaseController, PublicDatabaseController],
  exports: [DatabaseService],
})
export class DatabaseModule {}
