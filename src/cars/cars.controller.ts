import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CarsService } from './cars.service';
import {
  CreateCarDto,
  UpdateCarDto,
  BulkUpdatePriceDto,
  BulkUpdateStatusDto,
  BulkUpdatePublicDto,
  BulkDeleteDto,
} from './dto';
import { AdminOnly, RolesGuard } from '../common';

@Controller('cars')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  // Car listing endpoint (simplified for admin listing view)
  @Get('listing')
  @AdminOnly()
  async getCarListing(@Query() query: Record<string, string>) {
    // Parse query parameters according to dashboard specification

    const parsedQuery = {
      search: query?.search,
      status: query?.status || query?.['status[eq]'],
      condition: query?.condition || query?.['condition[eq]'],
      sortBy: query?.sortBy || 'chassisNo',
      sortOrder: (query?.sortOrder || 'asc') as 'asc' | 'desc',
      page: parseInt(query?.page) || 1,
      perPage: parseInt(query?.perPage) || 10,
    };

    console.log('Car listing query:', parsedQuery);
    const result = await this.carsService.getCarListing(parsedQuery);
    console.log('Car listing result count:', result.data?.length || 0);
    return result;
  }

  // Main car index with full data
  @Get()
  @AdminOnly()
  async findAll(@Query() query: Record<string, string>) {
    return this.carsService.findAll(query);
  }

  // Car statistics
  @Get('stats')
  @AdminOnly()
  async getCarStats() {
    console.log('Fetching car statistics...');
    const stats = await this.carsService.getCarStats();
    console.log('Car statistics:', stats);
    return stats;
  }

  // Alternative stats endpoint path
  @Get('statistics')
  @AdminOnly()
  async getStatistics() {
    return this.carsService.getCarStats();
  }

  // Search cars
  @Get('search')
  @AdminOnly()
  async searchCars(@Query('q') searchTerm: string) {
    return this.carsService.searchCars(searchTerm);
  }

  // Get facets for filtering
  @Get('facets')
  @AdminOnly()
  async getFacets(@Query() query: any) {
    return this.carsService.getFacets(query);
  }

  // Bulk store cars
  @Post('bulk')
  @AdminOnly()
  async bulkStore(@Body() body: { cars: CreateCarDto[] }) {
    return this.carsService.bulkStore(body.cars);
  }

  // Bulk update car prices
  @Patch('bulk/price')
  @AdminOnly()
  async bulkUpdatePrice(@Body() bulkUpdatePriceDto: BulkUpdatePriceDto) {
    return this.carsService.bulkUpdatePrice(bulkUpdatePriceDto);
  }

  // Bulk update car status
  @Patch('bulk/status')
  @AdminOnly()
  async bulkUpdateStatus(@Body() bulkUpdateStatusDto: BulkUpdateStatusDto) {
    return this.carsService.bulkUpdateStatus(bulkUpdateStatusDto);
  }

  // Bulk update public visibility
  @Patch('bulk/public')
  @AdminOnly()
  async bulkUpdatePublic(@Body() bulkUpdatePublicDto: BulkUpdatePublicDto) {
    return this.carsService.bulkUpdatePublic(bulkUpdatePublicDto);
  }

  // Bulk delete cars
  @Delete('bulk')
  @AdminOnly()
  async bulkDelete(@Body() bulkDeleteDto: BulkDeleteDto) {
    return this.carsService.bulkDelete(bulkDeleteDto);
  }

  // Get single car by chassis number
  @Get(':chassisNo')
  @AdminOnly()
  async findOne(@Param('chassisNo') chassisNo: string) {
    return this.carsService.findOne(chassisNo);
  }

  // Update car
  @Patch(':chassisNo')
  @AdminOnly()
  async update(
    @Param('chassisNo') chassisNo: string,
    @Body() updateCarDto: UpdateCarDto,
  ) {
    return this.carsService.update(chassisNo, updateCarDto);
  }

  // Delete single car
  @Delete(':chassisNo')
  @AdminOnly()
  async remove(@Param('chassisNo') chassisNo: string) {
    return this.carsService.remove(chassisNo);
  }
}
