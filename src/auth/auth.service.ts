import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Admin, Staff } from '../entities';
import { LoginDto } from './dto/login.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  type: 'admin' | 'staff';
  name: string;
  role: 'ADMIN' | 'STAFF' | 'MASTER';
}

export interface AuthResult {
  user: Admin | Staff;
  access_token: string;
  role: 'ADMIN' | 'STAFF' | 'MASTER';
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    userType: 'admin' | 'staff' = 'admin',
  ): Promise<Admin | Staff | null> {
    let user: Admin | Staff | null = null;

    if (userType === 'admin') {
      user = await this.adminRepository.findOne({ where: { email } });
    } else {
      user = await this.staffRepository.findOne({ where: { email } });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(
    loginDto: LoginDto,
    userType: 'admin' | 'staff' = 'admin',
  ): Promise<AuthResult> {
    const user = await this.validateUser(
      loginDto.email,
      loginDto.password,
      userType,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Determine role
    let role: 'ADMIN' | 'STAFF' | 'MASTER' =
      userType === 'admin' ? 'ADMIN' : 'STAFF';
    if (userType === 'admin' && (user as Admin).adminId === 'MASTER') {
      role = 'MASTER';
    }

    const payload: JwtPayload = {
      sub:
        userType === 'admin'
          ? (user as Admin).adminId
          : (user as Staff).staffId,
      email: user.email,
      type: userType,
      name: user.name,
      role,
    };

    return {
      user,
      access_token: this.jwtService.sign(payload),
      role,
    };
  }

  async unifiedLogin(loginDto: LoginDto): Promise<AuthResult> {
    // Try to find user in admin table first
    let user: Admin | Staff | null = await this.adminRepository.findOne({
      where: { email: loginDto.email },
    });
    let userType: 'admin' | 'staff' = 'admin';
    let role: 'ADMIN' | 'STAFF' | 'MASTER' = 'ADMIN';

    if (!user) {
      // If not found in admin, try staff table
      user = await this.staffRepository.findOne({
        where: { email: loginDto.email },
      });
      userType = 'staff';
      role = 'STAFF';
    } else {
      // Check if admin is MASTER
      if (user.adminId === 'MASTER') {
        role = 'MASTER';
      }
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub:
        userType === 'admin'
          ? (user as Admin).adminId
          : (user as Staff).staffId,
      email: user.email,
      type: userType,
      name: user.name,
      role,
    };

    return {
      user,
      access_token: this.jwtService.sign(payload),
      role,
    };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async findAdminById(adminId: string): Promise<Admin | null> {
    return this.adminRepository.findOne({ where: { adminId } });
  }

  async findStaffById(staffId: string): Promise<Staff | null> {
    return this.staffRepository.findOne({ where: { staffId } });
  }

  async findUserById(
    id: string,
    type: 'admin' | 'staff',
  ): Promise<Admin | Staff | null> {
    if (type === 'admin') {
      return this.findAdminById(id);
    }
    return this.findStaffById(id);
  }
}
