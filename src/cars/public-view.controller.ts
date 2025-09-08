import { Controller, Get, Query, Param } from '@nestjs/common';
import { CarsService } from './cars.service';

@Controller('api/v1/public/cars')
export class PublicViewController {
  constructor(private readonly carsService: CarsService) {}

  // Get best cars (top 4 by price)
  @Get('best')
  async getBestCars() {
    return this.carsService.getBestCars();
  }

  // Public car view with filters
  @Get()
  async getPublicCars(@Query() query: Record<string, string>) {
    return this.carsService.getPublicCars(query);
  }

  // Public car search
  @Get('search')
  async publicCarSearch(@Query('search') search: string) {
    const cars = await this.carsService.getPublicCars({ search });
    return {
      data: cars.data,
      total: cars.data.length,
    };
  }

  // Get public facets for filtering
  @Get('facets')
  async getPublicFacets(@Query() query: Record<string, string>) {
    // Filter only public cars for facets
    const publicQuery = { ...query, public: 'yes', status: 'In Stock' };
    const result = await this.carsService.getFacets(publicQuery);

    return {
      chassis_numbers: result.chassis_numbers,
      facets: result.facets,
    };
  }

  // Get specific car for customer view
  @Get(':chassisNo')
  async getPublicCar(@Param('chassisNo') chassisNo: string) {
    const car = await this.carsService.findOne(chassisNo);

    // Only return if car is public and in stock
    if (car.public !== 'yes' || car.status !== 'In Stock') {
      throw new Error('Car not found');
    }

    return car;
  }
}
