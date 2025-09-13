import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Car } from '../entities';
import {
  CreateCarDto,
  UpdateCarDto,
  BulkUpdatePriceDto,
  BulkUpdateStatusDto,
  BulkUpdatePublicDto,
  BulkDeleteDto,
} from './dto';
import { S3Service } from './s3.service';

export interface CarListingQuery {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  perPage?: number;
  page?: number;
  [key: string]: any; // For dynamic filters
}

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private carRepository: Repository<Car>,
    private s3Service: S3Service,
  ) {}

  // Car listing with search, sort, and pagination
  async getCarListing(query: CarListingQuery) {
    const {
      search,
      sortBy = 'chassisNo',
      sortOrder = 'asc',
      perPage = 10,
      page = 1,
      ...filters
    } = query;

    const queryBuilder = this.carRepository
      .createQueryBuilder('car')
      .select([
        'car.chassisNo',
        'car.brand',
        'car.model',
        'car.variant',
        'car.price',
        'car.year',
        'car.color',
        'car.transmission',
        'car.fuelType',
        'car.mileage',
        'car.grade',
        'car.status',
        'car.condition',
        'car.features',
        'car.image',
        'car.remarks',
        'car.branch',
        'car.created_at',
        'car.updated_at',
        'car.soldBy',
        'car.soldAt',
        'car.public',
      ]);

    // Apply search (case-insensitive)
    if (search) {
      queryBuilder.where(
        '(LOWER(car.brand) LIKE LOWER(:search) OR LOWER(car.model) LIKE LOWER(:search) OR LOWER(car.variant) LIKE LOWER(:search) OR LOWER(car.chassisNo) LIKE LOWER(:search) OR LOWER(car.color) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Apply filters
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] &&
        key !== 'search' &&
        key !== 'sortBy' &&
        key !== 'sortOrder' &&
        key !== 'perPage' &&
        key !== 'page'
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        queryBuilder.andWhere(`car.${key} = :${key}`, { [key]: filters[key] });
      }
    });

    // Apply sorting
    const allowedSortFields = ['year', 'price', 'created_at', 'chassisNo'];
    if (allowedSortFields.includes(sortBy)) {
      queryBuilder.orderBy(
        `car.${sortBy}`,
        sortOrder.toUpperCase() as 'ASC' | 'DESC',
      );
      if (sortBy !== 'chassisNo') {
        queryBuilder.addOrderBy('car.chassisNo', 'ASC');
      }
    } else {
      queryBuilder.orderBy('car.chassisNo', 'ASC');
    }

    // Apply pagination
    const skip = (page - 1) * perPage;
    queryBuilder.skip(skip).take(perPage);

    const [cars, total] = await queryBuilder.getManyAndCount();

    return {
      data: cars,
      currentPage: page,
      lastPage: Math.ceil(total / perPage),
      perPage,
      total,
    };
  }

  // Full car index with all fields
  async findAll(query: CarListingQuery) {
    const {
      search,
      sortBy = 'chassisNo',
      sortOrder = 'asc',
      perPage = 21,
      page = 1,
      ...filters
    } = query;

    const queryBuilder = this.carRepository.createQueryBuilder('car');

    // Apply search
    if (search) {
      queryBuilder.where(
        '(car.brand LIKE :search OR car.model LIKE :search OR car.variant LIKE :search OR car.chassisNo LIKE :search)',
        { search: `${search}%` },
      );
    }

    // Apply filters
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] &&
        key !== 'search' &&
        key !== 'sortBy' &&
        key !== 'sortOrder' &&
        key !== 'perPage' &&
        key !== 'page'
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        queryBuilder.andWhere(`car.${key} = :${key}`, { [key]: filters[key] });
      }
    });

    // Apply sorting
    const allowedSortFields = ['year', 'price', 'mileage'];
    if (allowedSortFields.includes(sortBy)) {
      queryBuilder.orderBy(
        `car.${sortBy}`,
        sortOrder.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    // Apply pagination
    const skip = (page - 1) * perPage;
    queryBuilder.skip(skip).take(perPage);

    const [cars, total] = await queryBuilder.getManyAndCount();

    return {
      data: cars,
      currentPage: page,
      lastPage: Math.ceil(total / perPage),
      perPage,
      total,
    };
  }

  // Car statistics
  async getCarStats() {
    const totalCars = await this.carRepository.count();
    const totalSoldCars = await this.carRepository.count({
      where: { status: 'Sold' },
    });
    const totalAvailableCars = await this.carRepository.count({
      where: { status: 'In Stock' },
    });

    return {
      totalCars,
      totalSoldCars,
      totalAvailableCars,
    };
  }

  // Search cars with limit (case-insensitive)
  async searchCars(searchTerm: string) {
    const queryBuilder = this.carRepository
      .createQueryBuilder('car')
      .where(
        '(LOWER(car.brand) LIKE LOWER(:search) OR LOWER(car.model) LIKE LOWER(:search) OR LOWER(car.variant) LIKE LOWER(:search) OR LOWER(car.chassisNo) LIKE LOWER(:search))',
        { search: `${searchTerm}%` },
      )
      .take(20);

    const cars = await queryBuilder.getMany();

    return {
      data: cars,
      total: cars.length,
    };
  }

  // Bulk store cars
  async bulkStore(cars: CreateCarDto[]) {
    await this.carRepository.insert(cars);

    return {
      message: 'Cars created successfully',
      createdCount: cars.length,
    };
  }

  // Find single car by chassis number
  async findOne(chassisNo: string): Promise<Car> {
    const car = await this.carRepository.findOne({ where: { chassisNo } });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    return car;
  }

  // Create single car
  async create(
    createCarDto: CreateCarDto,
  ): Promise<{ message: string; data: Car }> {
    const car = this.carRepository.create({
      ...createCarDto,
      image: createCarDto.image || [],
    });

    const savedCar = await this.carRepository.save(car);

    return {
      message: 'Car created successfully',
      data: savedCar,
    };
  }

  // Update car
  async update(
    chassisNo: string,
    updateCarDto: UpdateCarDto,
  ): Promise<{ message: string; data: Car }> {
    const car = await this.findOne(chassisNo);

    Object.assign(car, updateCarDto);
    const updatedCar = await this.carRepository.save(car);

    return {
      message: 'Car updated successfully',
      data: updatedCar,
    };
  }

  // Bulk update car prices
  async bulkUpdatePrice(bulkUpdatePriceDto: BulkUpdatePriceDto) {
    const { price, chassisNumbers } = bulkUpdatePriceDto;

    const cars = await this.carRepository.find({
      where: { chassisNo: In(chassisNumbers) },
    });

    for (const car of cars) {
      car.price += price; // Positive value increases, negative value decreases
    }

    await this.carRepository.save(cars);

    return {
      message: 'Prices updated successfully',
      updatedCount: cars.length,
    };
  }

  // Bulk update car status
  async bulkUpdateStatus(bulkUpdateStatusDto: BulkUpdateStatusDto) {
    const { status, chassisNumbers } = bulkUpdateStatusDto;

    const result = await this.carRepository.update(
      { chassisNo: In(chassisNumbers) },
      { status },
    );

    return {
      message: 'Status updated successfully',
      updatedCount: result.affected || 0,
    };
  }

  // Bulk update public visibility
  async bulkUpdatePublic(bulkUpdatePublicDto: BulkUpdatePublicDto) {
    const { public: publicValue, chassisNumbers } = bulkUpdatePublicDto;

    const result = await this.carRepository.update(
      { chassisNo: In(chassisNumbers) },
      { public: publicValue },
    );

    return {
      message: 'Public visibility updated successfully',
      updatedCount: result.affected || 0,
    };
  }

  // Delete single car
  async remove(chassisNo: string): Promise<{ message: string }> {
    const car = await this.findOne(chassisNo);
    await this.carRepository.remove(car);
    return { message: 'Car deleted successfully' };
  }

  // Bulk delete cars
  async bulkDelete(bulkDeleteDto: BulkDeleteDto) {
    const { chassisNumbers } = bulkDeleteDto;

    const result = await this.carRepository.delete({
      chassisNo: In(chassisNumbers),
    });

    return {
      message: 'Cars deleted successfully',
      deletedCount: result.affected || 0,
    };
  }

  // Get facets for filtering with progressive filtering support
  async getFacets(query: CarListingQuery) {
    const { search, ...filters } = query;

    // Build the same query as getCarListing but without pagination
    const queryBuilder = this.carRepository
      .createQueryBuilder('car')
      .select([
        'car.chassisNo',
        'car.brand',
        'car.model',
        'car.variant',
        'car.price',
        'car.year',
        'car.color',
        'car.transmission',
        'car.fuelType',
        'car.mileage',
        'car.grade',
        'car.status',
        'car.condition',
        'car.features',
        'car.image',
        'car.remarks',
        'car.branch',
        'car.created_at',
        'car.updated_at',
        'car.soldBy',
        'car.soldAt',
        'car.public',
      ]);

    // Apply search (case-insensitive)
    if (search) {
      queryBuilder.where(
        '(LOWER(car.brand) LIKE LOWER(:search) OR LOWER(car.model) LIKE LOWER(:search) OR LOWER(car.variant) LIKE LOWER(:search) OR LOWER(car.chassisNo) LIKE LOWER(:search) OR LOWER(car.color) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Apply filters (same logic as getCarListing)
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] &&
        key !== 'search' &&
        key !== 'sortBy' &&
        key !== 'sortOrder' &&
        key !== 'perPage' &&
        key !== 'page'
      ) {
        // Handle price range filtering
        if (key === 'price_min') {
          const priceMin = Number(filters[key]);
          if (!isNaN(priceMin)) {
            queryBuilder.andWhere('car.price >= :price_min', {
              price_min: priceMin,
            });
          }
        } else if (key === 'price_max') {
          const priceMax = Number(filters[key]);
          if (!isNaN(priceMax)) {
            queryBuilder.andWhere('car.price <= :price_max', {
              price_max: priceMax,
            });
          }
        } else {
          // Regular field filtering
          queryBuilder.andWhere(`car.${key} = :${key}`, {
            [key]: String(filters[key]),
          });
        }
      }
    });

    // Get filtered cars (no pagination for facets)
    const cars = await queryBuilder.getMany();

    const facets = {};
    const chassisNumbers = cars.map((car) => car.chassisNo);

    // Build facets for each field based on filtered results
    const fields = [
      'brand',
      'model',
      'variant',
      'year',
      'color',
      'transmission',
      'fuelType',
      'grade',
      'condition',
    ];

    fields.forEach((field) => {
      const fieldValues = cars.reduce(
        (acc: Record<string, number>, car) => {
          const value = (car as unknown as Record<string, unknown>)[
            field
          ] as string;
          if (value) {
            acc[value] = (acc[value] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>,
      );

      if (Object.keys(fieldValues).length > 0) {
        facets[field] = fieldValues;
      }
    });

    // Add price range facets
    if (cars.length > 0) {
      const prices = cars
        .map((car) => car.price)
        .filter((price) => price != null);
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        facets['price_range'] = {
          min: minPrice,
          max: maxPrice,
          count: cars.length,
        };
      }
    }

    return {
      chassis_numbers: chassisNumbers,
      facets,
    };
  }

  // Public car view (only public and in stock)
  async getPublicCars(query: CarListingQuery) {
    const {
      search,
      sortBy = 'chassisNo',
      sortOrder = 'asc',
      perPage = 21,
      page = 1,
      ...filters
    } = query;

    const queryBuilder = this.carRepository
      .createQueryBuilder('car')
      .where('car.public = :public', { public: 'yes' })
      .andWhere('car.status = :status', { status: 'In Stock' });

    // Apply search (case-insensitive)
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(car.brand) LIKE LOWER(:search) OR LOWER(car.model) LIKE LOWER(:search) OR LOWER(car.variant) LIKE LOWER(:search) OR LOWER(car.chassisNo) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Apply additional filters
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] &&
        key !== 'search' &&
        key !== 'sortBy' &&
        key !== 'sortOrder' &&
        key !== 'perPage' &&
        key !== 'page'
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        queryBuilder.andWhere(`car.${key} = :${key}`, { [key]: filters[key] });
      }
    });

    // Apply sorting
    const allowedSortFields = ['year', 'price', 'mileage'];
    if (allowedSortFields.includes(sortBy)) {
      queryBuilder.orderBy(
        `car.${sortBy}`,
        sortOrder.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    // Apply pagination
    const skip = (page - 1) * perPage;
    queryBuilder.skip(skip).take(perPage);

    const [cars, total] = await queryBuilder.getManyAndCount();

    return {
      data: cars,
      currentPage: page,
      lastPage: Math.ceil(total / perPage),
      total,
    };
  }

  // Get best cars for public (top 4 by price)
  async getBestCars() {
    const cars = await this.carRepository.find({
      where: {
        public: 'yes',
        status: 'In Stock',
      },
      order: { price: 'DESC' },
      take: 4,
    });

    return { data: cars };
  }

  // Update car images
  async updateCarImages(chassisNo: string, keys: string[]) {
    // Delegate to S3Service for proper implementation
    return this.s3Service.updateCarImages(chassisNo, keys);
  }
}
