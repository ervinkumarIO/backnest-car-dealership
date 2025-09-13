import { Controller, Get, Query } from '@nestjs/common';
import { CarsService } from './cars.service';

@Controller('public')
export class PublicController {
  constructor(private readonly carsService: CarsService) {}

  // Get best cars (top 4 by price) - matches frontend expectation
  @Get('best-cars')
  async getBestCars() {
    return this.carsService.getBestCars();
  }

  // Get public facets for filtering - matches frontend expectation
  @Get('facet-counts')
  async getFacetCounts(@Query() query: Record<string, string>) {
    // Filter only public cars for facets
    const publicQuery = { ...query, public: 'yes', status: 'In Stock' };
    const result = await this.carsService.getFacets(publicQuery);

    return {
      chassis_numbers: result.chassis_numbers,
      facets: result.facets,
    };
  }

  // Public car view with filters - matches frontend expectation
  @Get('view')
  async getPublicView(@Query() query: Record<string, string>) {
    return this.carsService.getPublicCars(query);
  }
}
