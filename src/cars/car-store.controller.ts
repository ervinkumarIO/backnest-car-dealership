import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto';
import { AdminOnly, RolesGuard } from '../common';

@Controller('api/v1/cars')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CarStoreController {
  constructor(private readonly carsService: CarsService) {}

  @Post('store-new')
  @AdminOnly()
  async storeNew(@Body() createCarDto: CreateCarDto) {
    return this.carsService.create(createCarDto);
  }

  // Alternative endpoint path for frontend compatibility
  @Post('create')
  @AdminOnly()
  async create(@Body() createCarDto: CreateCarDto) {
    return this.carsService.create(createCarDto);
  }
}
