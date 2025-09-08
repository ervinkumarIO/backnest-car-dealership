import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
    return {
      message: 'Car Dealership Backend API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/api/v1',
        database: '/api/v1/public/database/status',
        auth: '/api/v1/auth/admin/login',
        cars: '/api/v1/cars',
        public: '/api/v1/public/cars'
      }
    };
  }

  @Get('health')
  getHealth(): any {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
}
