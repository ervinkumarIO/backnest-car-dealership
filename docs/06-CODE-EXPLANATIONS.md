# 💻 Code Explanations & Business Logic

## 🔧 Core Business Logic

### Authentication & Authorization System

The system implements a **hierarchical role-based access control** system:

```typescript
// Role hierarchy: Master > Admin > Staff
// Masters can manage Admins and all Staff
// Admins can only manage Staff from same branch  
// Staff have basic access only

@Injectable()
export class StaffService {
  async findAll(user: any, paginationDto: PaginationDto) {
    // Branch filtering logic
    if (user.role === 'master') {
      // Master sees all staff
      return this.staffRepository.find();
    } else {
      // Admin sees only same branch staff
      return this.staffRepository.find({ 
        where: { branch: user.branch } 
      });
    }
  }
}
```

### Car Management System

The car entity uses **chassisNo as primary key** (business requirement):

```typescript
@Entity('cars')
export class Car {
  @PrimaryColumn()
  chassisNo: string; // Business key, not auto-increment

  @Column('json')
  features: string[]; // Flexible feature storage

  @Column('json') 
  image: string[]; // Multiple image URLs
}
```

**Key Business Rules**:
- Public cars: `public='yes'` AND `status='In Stock'`
- Soft deletes not used (cars are permanently deleted)
- JSON fields for flexibility (features, images)

### Bulk Operations Logic

```typescript
async bulkUpdatePrice(dto: BulkUpdatePriceDto) {
  const { action, amount, chassisNo } = dto;
  
  for (const chassis of chassisNo) {
    const car = await this.carRepository.findOne({ where: { chassisNo: chassis } });
    if (car) {
      if (action === 'increase') {
        car.price += amount;
      } else {
        car.price = Math.max(0, car.price - amount); // Prevent negative prices
      }
      await this.carRepository.save(car);
    }
  }
}
```

## 🔐 Security Implementation

### Password Hashing Strategy

```typescript
// High-security 12-round bcrypt hashing
async hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Computationally expensive but secure
  return bcrypt.hash(password, saltRounds);
}

// Constant-time comparison prevents timing attacks
async validateUser(email: string, password: string) {
  const user = await this.findByEmail(email);
  if (user && await bcrypt.compare(password, user.password)) {
    return user;
  }
  return null;
}
```

### JWT Token Structure & Validation

```typescript
// JWT Payload includes role for authorization
const payload: JwtPayload = {
  sub: user.id,      // Standard JWT subject
  email: user.email,
  role: user.role,   // For role-based access control
  type: userType,    // admin/staff distinction
  name: user.name
};

// Token validation ensures user still exists and is active
async validate(payload: JwtPayload) {
  const user = await this.authService.findUserById(payload.sub, payload.type);
  if (!user || !user.is_active) {
    throw new UnauthorizedException();
  }
  return user;
}
```

## 🗃️ Database Query Optimization

### Advanced Car Search with Query Builder

```typescript
async findAll(filters: any, pagination: any) {
  const queryBuilder = this.carRepository.createQueryBuilder('car');
  
  // Dynamic filtering
  if (filters.search) {
    queryBuilder.andWhere(
      '(car.brand LIKE :search OR car.model LIKE :search OR car.chassisNo LIKE :search)',
      { search: `%${filters.search}%` }
    );
  }
  
  // Dynamic field filtering
  Object.keys(filters).forEach(key => {
    if (key !== 'search' && filters[key]) {
      queryBuilder.andWhere(`car.${key} = :${key}`, { [key]: filters[key] });
    }
  });
  
  // Sorting
  if (filters.sortBy) {
    queryBuilder.orderBy(`car.${filters.sortBy}`, filters.sortOrder || 'ASC');
  }
  
  // Pagination
  queryBuilder
    .skip((pagination.page - 1) * pagination.perPage)
    .take(pagination.perPage);
    
  return queryBuilder.getManyAndCount();
}
```

### Faceted Search Implementation

```typescript
async getFacets() {
  // Get all chassis numbers for autocomplete
  const chassisNumbers = await this.carRepository
    .createQueryBuilder('car')
    .select('car.chassisNo')
    .getRawMany();

  // Build facet counts for filtering
  const facets = {};
  const fields = ['brand', 'model', 'condition', 'status'];
  
  for (const field of fields) {
    const counts = await this.carRepository
      .createQueryBuilder('car')
      .select(`car.${field}`, 'value')
      .addSelect('COUNT(*)', 'count')
      .groupBy(`car.${field}`)
      .getRawMany();
      
    facets[field] = counts.reduce((acc, item) => {
      acc[item.value] = parseInt(item.count);
      return acc;
    }, {});
  }
  
  return { chassis_numbers: chassisNumbers, facets };
}
```

## 📁 File Upload & S3 Integration

### Presigned URL Generation

```typescript
async generatePresignedUrls(files: any[]) {
  const urls = [];
  
  for (const file of files) {
    const key = `car-images/${Date.now()}_${file.fileName}`;
    const presignedUrl = this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: key,
      ContentType: file.contentType,
      Expires: 900, // 15 minutes
    });
    
    urls.push({
      fileName: file.fileName,
      key,
      presignedUrl,
    });
  }
  
  return urls;
}
```

### Image Upload Processing

```typescript
async uploadCarImages(files: Express.Multer.File[]) {
  const uploadPromises = files.map(async (file) => {
    // Extract chassis number from filename
    const chassisNo = file.originalname.split('_')[0];
    
    // Upload to S3
    const key = `car-images/${Date.now()}_${file.originalname}`;
    await this.s3.upload({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();
    
    // Update car's image array
    const car = await this.carRepository.findOne({ where: { chassisNo } });
    if (car) {
      const imageUrl = `https://${this.bucketName}.s3.amazonaws.com/${key}`;
      car.image = [...car.image, imageUrl];
      await this.carRepository.save(car);
    }
  });
  
  await Promise.all(uploadPromises);
}
```

## 🛡️ Validation & Error Handling

### DTO Validation Strategy

```typescript
export class CreateCarDto {
  @IsString()
  @IsNotEmpty()
  chassisNo: string;

  @IsNumber()
  @Min(0, { message: 'Price must be positive' })
  @Type(() => Number)
  price: number;

  @IsNumber()
  @Min(1900, { message: 'Year must be after 1900' })
  @Max(new Date().getFullYear() + 1, { message: 'Year cannot be in future' })
  @Type(() => Number)
  year: number;

  @IsEnum(['yes', 'no'])
  public: string;
}
```

### Global Exception Filter

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    const status = exception instanceof HttpException 
      ? exception.getStatus() 
      : 500;
      
    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    });
  }
}
```

## 🔄 Middleware & Guards Chain

### Request Processing Pipeline

```typescript
// main.ts - Global middleware setup
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(cookieParser());
app.enableCors({ origin: process.env.CORS_ORIGIN, credentials: true });
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
app.useGlobalFilters(new AllExceptionsFilter());
```

### Role-Based Guard Logic

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.role === role);
  }
}

// Usage with decorators
@Get('admin-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'master')
async adminOnlyFunction() { }
```

## 📊 Performance Optimizations

### Database Connection Configuration

```typescript
// app.module.ts - Optimized TypeORM config
TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get('DB_HOST', 'localhost'),
    // Connection pooling for performance
    extra: {
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
    },
    // Logging in development only
    logging: configService.get('NODE_ENV') === 'development',
    synchronize: configService.get('NODE_ENV') === 'development',
  }),
}),
```

### Caching Strategy (Ready for Implementation)

```typescript
// Ready for Redis implementation
@Injectable()
export class CarsService {
  // Cache frequently accessed data
  async getCarStats() {
    // TODO: Implement Redis caching
    // const cached = await this.redis.get('car:stats');
    // if (cached) return JSON.parse(cached);
    
    const stats = await this.calculateStats();
    
    // TODO: Cache for 5 minutes
    // await this.redis.setex('car:stats', 300, JSON.stringify(stats));
    
    return stats;
  }
}
```

This code architecture provides enterprise-level functionality with proper security, validation, error handling, and performance considerations for the car dealership management system. 