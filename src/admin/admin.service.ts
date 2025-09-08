import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../entities';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private authService: AuthService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Admin[];
    total: number;
    currentPage: number;
    lastPage: number;
  }> {
    const skip = (page - 1) * limit;

    const [admins, total] = await this.adminRepository.findAndCount({
      skip,
      take: limit,
    });

    return {
      data: admins,
      total,
      currentPage: page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(adminId: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  async create(
    createAdminDto: CreateAdminDto,
  ): Promise<{ message: string; data: Admin }> {
    const hashedPassword = await this.authService.hashPassword(
      createAdminDto.password,
    );

    const admin = this.adminRepository.create({
      ...createAdminDto,
      password: hashedPassword,
    });

    const savedAdmin = await this.adminRepository.save(admin);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...adminWithoutPassword } = savedAdmin;

    return {
      message: 'Admin created successfully',
      data: adminWithoutPassword as Admin,
    };
  }

  async update(
    adminId: string,
    updateAdminDto: UpdateAdminDto,
  ): Promise<{ message: string; data: Admin }> {
    const admin = await this.findOne(adminId);

    if (updateAdminDto.password) {
      updateAdminDto.password = await this.authService.hashPassword(
        updateAdminDto.password,
      );
    }

    Object.assign(admin, updateAdminDto);
    const updatedAdmin = await this.adminRepository.save(admin);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...adminWithoutPassword } = updatedAdmin;

    return {
      message: 'Admin updated successfully',
      data: adminWithoutPassword as Admin,
    };
  }

  async remove(adminId: string): Promise<{ message: string }> {
    const admin = await this.findOne(adminId);
    await this.adminRepository.remove(admin);
    return { message: 'Admin deleted successfully' };
  }
}
