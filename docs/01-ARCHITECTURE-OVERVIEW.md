# 🏗️ Architecture Overview - Car Dealership Backend

## System Architecture

This NestJS application follows a **modular monolithic architecture** with clear separation of concerns and role-based access control.

### 🎯 Core Design Principles

1. **Modular Design**: Each business domain (Auth, Admin, Staff, Cars) is encapsulated in its own module
2. **Role-Based Access Control**: Master → Admin → Staff hierarchy with proper authorization
3. **Entity-First Approach**: Database entities drive the application structure
4. **Security-First**: Multiple layers of authentication and authorization
5. **Scalability**: Stateless design with JWT tokens and database-driven sessions

## 📊 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                       │
│           (Admin Dashboard, Staff Panel, Public Site)       │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/HTTPS Requests
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway Layer                         │
│              (CORS, Rate Limiting, Validation)             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 Authentication Layer                        │
│         (JWT Strategy, Local Strategy, Guards)             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Application Modules                        │
│    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│    │   Auth   │ │  Admin   │ │  Staff   │ │   Cars   │    │
│    │  Module  │ │  Module  │ │  Module  │ │  Module  │    │
│    └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Access Layer                          │
│                    (TypeORM)                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   MySQL Database                            │
│        (Admins, Staff, Cars, Car Images)                   │
└─────────────────────────────────────────────────────────────┘
```

## 🏛️ Module Architecture

### 1. **Core Application Module** (`src/app.module.ts`)
- **Purpose**: Root module that orchestrates all feature modules
- **Dependencies**: TypeORM, Config, Throttler
- **Key Features**:
  - Database connection configuration
  - Environment variable management
  - Rate limiting setup
  - Global module imports

### 2. **Authentication Module** (`src/auth/`)
- **Purpose**: Handles user authentication and authorization
- **Components**:
  - `AuthService`: User validation and JWT token generation
  - `AuthController`: Login endpoints for different user types
  - `JwtStrategy`: JWT token validation strategy
  - `LocalStrategy`: Username/password validation
  - `SessionSerializer`: Session management for persistent auth
- **Security Features**:
  - Password hashing with bcrypt
  - JWT token generation and validation
  - Session serialization/deserialization
  - Multi-guard authentication (JWT + Session)

### 3. **Admin Management Module** (`src/admin/`)
- **Purpose**: Master-only admin user management
- **Access Control**: Only Master users can access
- **Features**:
  - CRUD operations for admin users
  - Password hashing
  - Branch assignment
  - Role management (Master/Admin)

### 4. **Staff Management Module** (`src/staff/`)
- **Purpose**: Admin+ staff user management with branch filtering
- **Access Control**: Admin and Master users
- **Key Logic**:
  - **Branch Filtering**: Masters see all staff, Admins see only same branch
  - **Role Management**: Manager, Sales, Support roles
  - **Department Assignment**: Sales, Marketing, Finance, Support
  - **Sold-By Selector**: API for dropdown lists

### 5. **Cars Management Module** (`src/cars/`)
- **Purpose**: Complete car inventory management system
- **Components**:
  - `CarsController`: Main CRUD and bulk operations
  - `CarStoreController`: New car creation endpoint
  - `CarImagesController`: Image upload and management
  - `PublicViewController`: Public-facing car viewing
  - `CarsService`: Business logic for car operations
  - `S3Service`: AWS S3 integration for image storage

## 🔐 Security Architecture

### Authentication Flow
```
1. User Login Request → Auth Controller
2. Credentials Validation → Auth Service
3. Password Verification → bcrypt comparison
4. JWT Token Generation → JWT Service
5. User Information → Session Storage
6. Response → Access Token + User Data
```

### Authorization Flow
```
1. API Request with JWT → Guards
2. Token Validation → JWT Strategy
3. User Retrieval → Auth Service
4. Role Checking → Role Guards
5. Branch Checking → Business Logic
6. Permission Granted/Denied
```

### Role Hierarchy
```
Master (Full System Access)
  ├── Can manage Admins
  ├── Can manage Staff (all branches)
  ├── Can manage Cars (all operations)
  └── Can access all data

Admin (Branch-Limited Access)
  ├── Cannot manage Admins
  ├── Can manage Staff (same branch only)
  ├── Can manage Cars
  └── Branch-filtered data access

Staff (Basic Access)
  ├── Cannot manage users
  ├── Limited car access (if implemented)
  └── Own profile management
```

## 📊 Data Flow Architecture

### 1. **Request Processing Flow**
```
HTTP Request → Middleware Stack → Guards → Controller → Service → Repository → Database
```

### 2. **Middleware Stack**
1. **Helmet**: Security headers
2. **CORS**: Cross-origin resource sharing
3. **Compression**: Response compression
4. **Cookie Parser**: Cookie handling
5. **Validation Pipe**: Request validation
6. **Exception Filter**: Error handling

### 3. **Guard Stack**
1. **AuthGuard('jwt')**: JWT token validation
2. **RolesGuard**: Role-based access control
3. **BranchGuard**: Branch-based filtering (where applicable)

## 🗃️ Database Architecture

### Entity Relationships
```
Admin (1) ←→ (N) Cars [created_by]
Staff (1) ←→ (N) Cars [assigned_to]
Car (1) ←→ (N) CarImages [car_id]
```

### Key Design Decisions
1. **Chassis Number as Primary Key**: Cars use chassisNo instead of auto-increment ID
2. **Soft Deletes**: BaseEntity includes deleted_at for soft deletion
3. **JSON Storage**: Features and images stored as JSON for flexibility
4. **Branch Filtering**: Both Admin and Staff have branch field for organization
5. **Role Enums**: TypeScript enums ensure data consistency

## 🔧 Configuration Architecture

### Environment-Based Configuration
- **Development**: Local database, verbose logging, relaxed CORS
- **Production**: Remote database, minimal logging, strict security
- **Configuration Service**: Centralized config management with fallbacks

### Module Configuration
- **Database**: TypeORM async configuration with environment variables
- **JWT**: Configurable secret and expiration times
- **File Upload**: Configurable size limits and destinations
- **AWS S3**: Environment-based credential management

## 🚀 Deployment Architecture

### Development Setup
```
Developer Machine → Local MySQL → Local File Storage → Development API
```

### Production Setup
```
Load Balancer → NestJS App → RDS MySQL → S3 Storage → CDN
```

This architecture ensures:
- **Scalability**: Stateless design allows horizontal scaling
- **Security**: Multiple authentication layers and role-based access
- **Maintainability**: Clear module separation and dependency injection
- **Flexibility**: Environment-based configuration and plugin architecture
- **Performance**: Efficient database queries and file storage 