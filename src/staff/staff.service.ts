import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff, Admin } from '../entities';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    private authService: AuthService,
  ) {}

  async findAll(
    user: Admin,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Staff[];
    total: number;
    currentPage: number;
    lastPage: number;
  }> {
    const skip = (page - 1) * limit;

    const whereClause: { branch?: string } = {};

    // Branch filtering logic - only show staff from same branch unless MASTER
    if (user.adminId !== 'MASTER') {
      whereClause.branch = user.branch;
    }

    const [staff, total] = await this.staffRepository.findAndCount({
      where: whereClause,
      skip,
      take: limit,
    });

    return {
      data: staff,
      total,
      currentPage: page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(staffId: string, user: Admin): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { staffId },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    // Branch authorization check
    if (user.adminId !== 'MASTER' && staff.branch !== user.branch) {
      throw new ForbiddenException('Unauthorized - different branch');
    }

    return staff;
  }

  async create(
    createStaffDto: CreateStaffDto,
  ): Promise<{ message: string; data: Staff }> {
    const hashedPassword = await this.authService.hashPassword(
      createStaffDto.password,
    );

    const staff = this.staffRepository.create({
      ...createStaffDto,
      password: hashedPassword,
    });

    const savedStaff = await this.staffRepository.save(staff);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...staffWithoutPassword } = savedStaff;

    return {
      message: 'Staff created successfully',
      data: staffWithoutPassword as Staff,
    };
  }

  async update(
    staffId: string,
    updateStaffDto: UpdateStaffDto,
    user: Admin,
  ): Promise<{ message: string; data: Staff }> {
    const staff = await this.findOne(staffId, user); // This includes branch check

    if (updateStaffDto.password) {
      updateStaffDto.password = await this.authService.hashPassword(
        updateStaffDto.password,
      );
    }

    Object.assign(staff, updateStaffDto);
    const updatedStaff = await this.staffRepository.save(staff);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...staffWithoutPassword } = updatedStaff;

    return {
      message: 'Staff updated successfully',
      data: staffWithoutPassword as Staff,
    };
  }

  async remove(staffId: string, user: Admin): Promise<{ message: string }> {
    const staff = await this.findOne(staffId, user); // This includes branch check
    await this.staffRepository.remove(staff);
    return { message: 'Staff deleted successfully' };
  }

  // For soldBy selector functionality
  async getSoldBySelector(): Promise<{
    staffIds: string[];
    branches: string[];
  }> {
    const staffIds = await this.staffRepository
      .createQueryBuilder('staff')
      .select('staff.staffId')
      .getRawMany();

    const branches = ['JB', 'SLGR', 'KL', 'PPG', 'SBH']; // Static branches from Laravel

    return {
      staffIds: staffIds.map((s: { staff_staffId: string }) => s.staff_staffId),
      branches,
    };
  }
}
