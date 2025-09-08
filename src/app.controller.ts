import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  getRoot(): any {
    return {
      message: 'Car Dealership Backend API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        api: '/api/v1',
        health: '/api/v1/health',
        database: '/api/v1/public/database/status',
        auth: '/api/v1/auth/admin/login',
        cars: '/api/v1/cars',
        public: '/api/v1/public/cars'
      }
    };
  }

  @Get()
  getApi(): any {
    return {
      message: 'Car Dealership Backend API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/api/v1/health',
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
