# 📦 Dependencies & Libraries Documentation

## 🏗️ Dependency Categories

The application uses carefully selected libraries organized into logical categories for maintainability and security.

## 🚀 Core Framework Dependencies

### **@nestjs/common** (^11.0.1)
- **Purpose**: Core NestJS decorators, pipes, guards, and utilities
- **Key Features**:
  - HTTP decorators (`@Get`, `@Post`, `@Body`, etc.)
  - Validation pipes (`ValidationPipe`)
  - Exception handling (`HttpException`, `BadRequestException`)
  - Dependency injection decorators (`@Injectable`)
- **Usage Example**:
```typescript
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
```

### **@nestjs/core** (^11.0.1)
- **Purpose**: NestJS core framework functionality
- **Key Features**:
  - Application factory (`NestFactory`)
  - Module system
  - Dependency injection container
  - Request lifecycle management
- **Usage**: Bootstrap application in `main.ts`

### **@nestjs/platform-express** (^11.0.1)
- **Purpose**: Express.js adapter for NestJS
- **Key Features**:
  - HTTP server implementation
  - Express middleware compatibility
  - File upload support (Multer integration)
  - Request/Response object access
- **Why Express**: Mature ecosystem, extensive middleware library

## 🗄️ Database & ORM Dependencies

### **@nestjs/typeorm** (^11.0.0)
- **Purpose**: TypeORM integration for NestJS
- **Key Features**:
  - Dependency injection for repositories
  - Configuration module integration
  - Transaction support
  - Connection management
- **Usage**:
```typescript
@InjectRepository(Car)
private carRepository: Repository<Car>
```

### **typeorm** (^0.3.25)
- **Purpose**: Object-Relational Mapping (ORM) library
- **Key Features**:
  - Entity definitions with decorators
  - Query builder for complex queries
  - Migration system
  - Connection pooling
  - Relationship management
- **Entities Example**:
```typescript
@Entity('cars')
export class Car {
  @PrimaryColumn()
  chassisNo: string;
}
```

### **mysql2** (^3.14.2)
- **Purpose**: MySQL database driver
- **Key Features**:
  - Promise-based API
  - Connection pooling
  - Prepared statements
  - SSL support
- **Why mysql2**: Better performance than mysql, Promise support, active maintenance

## 🔐 Authentication & Security Dependencies

### **@nestjs/passport** (^11.0.5)
- **Purpose**: Passport.js integration for NestJS
- **Key Features**:
  - Strategy-based authentication
  - Guard integration
  - Session support
  - Multiple authentication methods
- **Usage**:
```typescript
@UseGuards(AuthGuard('jwt'))
```

### **@nestjs/jwt** (^11.0.0)
- **Purpose**: JWT token handling for NestJS
- **Key Features**:
  - Token generation and validation
  - Configuration module integration
  - Async configuration support
- **Configuration**:
```typescript
JwtModule.registerAsync({
  useFactory: (config: ConfigService) => ({
    secret: config.get('JWT_SECRET'),
    signOptions: { expiresIn: '24h' },
  }),
})
```

### **passport** (^0.7.0)
- **Purpose**: Authentication middleware for Node.js
- **Key Features**:
  - 500+ authentication strategies
  - Session management
  - OAuth integration ready
- **Strategies Used**: Local (username/password), JWT

### **passport-local** (^1.0.0)
- **Purpose**: Username/password authentication strategy
- **Usage**: Session-based login for web applications

### **passport-jwt** (^4.0.1)
- **Purpose**: JWT authentication strategy
- **Key Features**:
  - Bearer token extraction
  - Configurable token validation
  - Custom payload validation
- **Configuration**:
```typescript
ExtractJwt.fromAuthHeaderAsBearerToken()
```

### **bcryptjs** (^3.0.2)
- **Purpose**: Password hashing library
- **Key Features**:
  - Salt-based hashing
  - Configurable rounds (using 12 for high security)
  - Constant-time comparison
- **Usage**:
```typescript
const hashedPassword = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(password, hashedPassword);
```

### **express-session** (^1.18.2)
- **Purpose**: Session middleware for Express
- **Key Features**:
  - Session storage
  - Cookie configuration
  - Security options
- **Configuration**: Secure cookies in production

## ✅ Validation & Transformation Dependencies

### **class-validator** (^0.14.2)
- **Purpose**: Decorator-based validation for TypeScript classes
- **Key Features**:
  - Email validation (`@IsEmail`)
  - String length validation (`@MinLength`, `@MaxLength`)
  - Number validation (`@Min`, `@Max`)
  - Custom validation rules
- **Usage**:
```typescript
@IsEmail({}, { message: 'Please provide a valid email address' })
email: string;
```

### **class-transformer** (^0.5.1)
- **Purpose**: Object transformation and serialization
- **Key Features**:
  - Type conversion (`@Type(() => Number)`)
  - Property exposure control
  - Nested object transformation
- **Usage**:
```typescript
@Type(() => Number)
@Min(0, { message: 'Price must be positive' })
price: number;
```

## 🔧 Configuration & Environment Dependencies

### **@nestjs/config** (^4.0.2)
- **Purpose**: Configuration management for NestJS
- **Key Features**:
  - Environment variable loading
  - Type-safe configuration
  - Validation schemas
  - Hierarchical configuration
- **Usage**:
```typescript
configService.get('JWT_SECRET', 'fallback-value')
```

## 🛡️ Security & Middleware Dependencies

### **@nestjs/throttler** (^6.4.0)
- **Purpose**: Rate limiting for NestJS applications
- **Key Features**:
  - Request rate limiting
  - IP-based throttling
  - Configurable time windows
  - Guard integration
- **Configuration**:
```typescript
ThrottlerModule.forRoot([{
  ttl: 60000,
  limit: 100,
}])
```

### **helmet** (^8.1.0)
- **Purpose**: Security headers middleware
- **Key Features**:
  - Content Security Policy
  - XSS protection
  - MIME type sniffing prevention
  - Clickjacking protection
- **Usage**:
```typescript
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
```

### **compression** (^1.8.1)
- **Purpose**: Response compression middleware
- **Key Features**:
  - Gzip compression
  - Deflate compression
  - Configurable compression levels
- **Benefits**: Reduced bandwidth usage, faster response times

### **cookie-parser** (^1.4.7)
- **Purpose**: Cookie parsing middleware
- **Key Features**:
  - Signed cookies
  - JSON cookie parsing
  - Security options
- **Usage**: Session cookie handling

## 📁 File Handling Dependencies

### **@nestjs/serve-static** (^5.0.3)
- **Purpose**: Static file serving for NestJS
- **Key Features**:
  - Static asset serving
  - Path configuration
  - Cache headers
- **Usage**: Serve uploaded files or static assets

### **multer** (^2.0.2)
- **Purpose**: Multipart form data handling (file uploads)
- **Key Features**:
  - File size limits
  - File type filtering
  - Memory/disk storage options
- **Integration**: NestJS platform-express includes Multer support

### **aws-sdk** (^2.1692.0)
- **Purpose**: AWS services integration
- **Key Features**:
  - S3 file storage
  - Presigned URL generation
  - IAM integration
  - SDK for all AWS services
- **Usage**:
```typescript
const s3 = new AWS.S3({
  accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
  secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
  region: config.get('AWS_REGION'),
});
```

## 🧪 Development Dependencies

### **@nestjs/cli** (^11.0.0)
- **Purpose**: NestJS command-line interface
- **Key Features**:
  - Project scaffolding
  - Code generation
  - Build and development servers
- **Commands**: `nest generate`, `nest build`, `nest start`

### **@nestjs/schematics** (^11.0.0)
- **Purpose**: Code generation templates
- **Key Features**:
  - Module generation
  - Controller/Service generation
  - Consistent code structure

### **@nestjs/testing** (^11.0.1)
- **Purpose**: Testing utilities for NestJS
- **Key Features**:
  - TestingModule creation
  - Dependency injection for tests
  - Mock utilities
- **Usage**:
```typescript
const module: TestingModule = await Test.createTestingModule({
  controllers: [CarController],
  providers: [CarService],
}).compile();
```

## 📝 Code Quality Dependencies

### **eslint** (^9.18.0)
- **Purpose**: JavaScript/TypeScript linting
- **Key Features**:
  - Code style enforcement
  - Error detection
  - Automatic fixing
- **Configuration**: Custom rules for NestJS patterns

### **prettier** (^3.4.2)
- **Purpose**: Code formatting
- **Key Features**:
  - Consistent code style
  - Automatic formatting
  - IDE integration
- **Configuration**: Team-wide formatting standards

### **typescript-eslint** (^8.20.0)
- **Purpose**: TypeScript-specific linting rules
- **Key Features**:
  - Type-aware linting
  - TypeScript best practices
  - Compatibility with ESLint

## 🏗️ Build & Compilation Dependencies

### **typescript** (^5.7.3)
- **Purpose**: TypeScript compiler
- **Key Features**:
  - Static type checking
  - Modern JavaScript features
  - Decorator support
- **Configuration**: Strict type checking enabled

### **@swc/core** (^1.10.7) & **@swc/cli** (^0.6.0)
- **Purpose**: Fast TypeScript/JavaScript compiler
- **Key Features**:
  - Faster compilation than tsc
  - Rust-based implementation
  - Decorator support
- **Usage**: Alternative to TypeScript compiler for better performance

### **ts-node** (^10.9.2)
- **Purpose**: Direct TypeScript execution
- **Key Features**:
  - Development mode execution
  - REPL support
  - Path mapping support
- **Usage**: Development server (`npm run start:dev`)

### **ts-loader** (^9.5.2)
- **Purpose**: TypeScript loader for Webpack
- **Key Features**:
  - Webpack integration
  - Incremental compilation
  - Type checking
- **Usage**: Build process optimization

## 🧪 Testing Dependencies

### **jest** (^29.7.0)
- **Purpose**: JavaScript testing framework
- **Key Features**:
  - Test runner
  - Assertion library
  - Mocking utilities
  - Code coverage reports
- **Configuration**: NestJS-optimized Jest setup

### **ts-jest** (^29.2.5)
- **Purpose**: TypeScript support for Jest
- **Key Features**:
  - TypeScript compilation for tests
  - Source map support
  - Type checking in tests

### **supertest** (^7.0.0)
- **Purpose**: HTTP assertion library for testing
- **Key Features**:
  - API endpoint testing
  - Request/response validation
  - Integration testing
- **Usage**:
```typescript
return request(app.getHttpServer())
  .get('/cars')
  .expect(200);
```

## 🔍 Type Definition Dependencies

### **@types/*** packages
- **Purpose**: TypeScript type definitions for JavaScript libraries
- **Included Types**:
  - `@types/express`: Express.js types
  - `@types/bcryptjs`: bcrypt types
  - `@types/passport-local`: Passport Local Strategy types
  - `@types/passport-jwt`: Passport JWT Strategy types
  - `@types/express-session`: Express Session types
  - `@types/multer`: Multer file upload types
  - `@types/cookie-parser`: Cookie Parser types

## 📊 Dependency Management Strategy

### Version Strategy
- **Major Versions**: Pinned to prevent breaking changes
- **Minor/Patch**: Caret ranges (^) for security updates
- **Security Updates**: Regular dependency auditing

### Bundle Size Optimization
- **Tree Shaking**: Unused code elimination
- **Selective Imports**: Import only needed functions
- **Analysis**: Regular bundle size monitoring

### Security Considerations
- **Regular Audits**: `npm audit` integration
- **Vulnerability Scanning**: Automated security checks
- **Update Strategy**: Prompt security patch application

### Performance Impact
- **Lazy Loading**: On-demand module loading
- **Compilation**: SWC for faster builds
- **Runtime**: Optimized dependency selection

This dependency architecture ensures security, performance, and maintainability while providing comprehensive functionality for the car dealership management system. 