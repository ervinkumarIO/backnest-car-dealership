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
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { Admin } from '../entities';
import { AuthGuard } from '@nestjs/passport';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { AdminOnly } from '../common';
import { RolesGuard } from '../common';

@Controller('api/v1/staff')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @AdminOnly()
  async findAll(
    @Request() req: { user: Admin },
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.staffService.findAll(req.user, page, limit);
  }

  @Post()
  @AdminOnly()
  async create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  @Get('sold-by-selector')
  @AdminOnly()
  async getSoldBySelector() {
    const result = await this.staffService.getSoldBySelector();
    return {
      data: result,
    };
  }

  @Get(':id')
  @AdminOnly()
  async findOne(@Param('id') id: string, @Request() req: { user: Admin }) {
    return this.staffService.findOne(id, req.user);
  }

  @Patch(':id')
  @AdminOnly()
  async update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @Request() req: { user: Admin },
  ) {
    return this.staffService.update(id, updateStaffDto, req.user);
  }

  @Delete(':id')
  @AdminOnly()
  async remove(@Param('id') id: string, @Request() req: { user: Admin }) {
    return this.staffService.remove(id, req.user);
  }
}
