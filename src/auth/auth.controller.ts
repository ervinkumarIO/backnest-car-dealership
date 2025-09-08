import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedRequest } from './interfaces/jwt-user.interface';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, 'admin');
  }

  @Post('staff/login')
  @HttpCode(HttpStatus.OK)
  async staffLogin(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto, 'staff');
  }

  // Unified login endpoint that automatically detects user type
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async unifiedLogin(@Body() loginDto: LoginDto) {
    return await this.authService.unifiedLogin(loginDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('session/login')
  @HttpCode(HttpStatus.OK)
  sessionLogin(@Request() req: AuthenticatedRequest) {
    return {
      message: 'Login successful',
      user: req.user,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }

  // Frontend-compatible endpoints matching Laravel API structure
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    // In JWT-based auth, logout is handled client-side by removing the token
    // This endpoint exists for frontend compatibility
    return {
      message: 'Logged out successfully',
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getCurrentUser(@Request() req: AuthenticatedRequest) {
    // Return user info in format expected by frontend
    const user = req.user;
    return {
      role: user.role,
      user: {
        adminId: user.type === 'admin' ? user.sub : null,
        staffId: user.type === 'staff' ? user.sub : null,
        name: user.name,
        email: user.email,
        phone: '+60123456789', // Default phone - should be stored in database
        branch: user.branch || 'KL', // Default branch if not set
      },
    };
  }
}
