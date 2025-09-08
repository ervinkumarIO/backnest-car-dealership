# 🗄️ Database Design - Car Dealership Backend

## Database Schema Overview

The application uses **MySQL** with **TypeORM** as the Object-Relational Mapping (ORM) tool. The database follows a normalized design with clear entity relationships.

## 🏗️ Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     Admin       │         │     Staff       │         │     Car         │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ id (PK)         │────┬────│ id (PK)         │────┬────│ chassisNo (PK)  │
│ email (UNIQUE)  │    │    │ email (UNIQUE)  │    │    │ brand           │
│ password        │    │    │ password        │    │    │ model           │
│ name            │    │    │ name            │    │    │ variant         │
│ role (ENUM)     │    │    │ role (ENUM)     │    │    │ price           │
│ branch          │    │    │ department      │    │    │ year            │
│ is_active       │    │    │ branch          │    │    │ color           │
│ phone           │    │    │ is_active       │    │    │ transmission    │
│ created_at      │    │    │ phone           │    │    │ fuelType        │
│ updated_at      │    │    │ created_at      │    │    │ mileage         │
│ deleted_at      │    │    │ updated_at      │    │    │ grade           │
└─────────────────┘    │    │ deleted_at      │    │    │ status          │
                       │    └─────────────────┘    │    │ condition       │
                       │                           │    │ features (JSON) │
                       │    ┌─────────────────────────────│ remarks         │
                       │    │                       │    │ branch          │
                       │    │                       │    │ soldBy          │
                       │    │                       │    │ soldAt          │
                       │    ▼                       │    │ image (JSON)    │
                       │ created_by                 │    │ public          │
                       │                            │    │ created_at      │
                       │                            │    │ updated_at      │
                       │                            │    └─────────────────┘
                       │                            │
                       │                            ▼
                       │                         assigned_to
                       │
                       └────► (1:N Relationship - Admin creates Cars)
                            (1:N Relationship - Staff assigned to Cars)
```

## 📋 Entity Specifications

### 1. **BaseEntity** (`src/entities/base.entity.ts`)

**Purpose**: Abstract base class providing common fields for all entities.

```typescript
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;                    // Auto-increment primary key

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;              // Automatic creation timestamp

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;              // Automatic update timestamp

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date;              // Soft delete timestamp
}
```

**Key Features**:
- **Soft Deletes**: Records are marked as deleted, not physically removed
- **Audit Trail**: Automatic timestamp tracking
- **Consistency**: All entities inherit common structure

### 2. **Admin Entity** (`src/entities/admin.entity.ts`)

**Purpose**: Manages administrative users with Master/Admin roles.

```sql
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('master', 'admin') DEFAULT 'admin',
  branch VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  phone VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

**Field Details**:
- `id`: Auto-increment primary key
- `email`: Unique identifier for login
- `password`: bcrypt hashed password (12 salt rounds)
- `name`: Display name
- `role`: 'master' (full access) or 'admin' (limited access)
- `branch`: Organization branch (HQ, Branch1, etc.)
- `is_active`: Account status (active/deactivated)
- `phone`: Optional contact number

**Business Rules**:
- Only one Master user recommended
- Email must be unique across system
- Master users can manage all Admins
- Admins can only manage Staff in same branch

### 3. **Staff Entity** (`src/entities/staff.entity.ts`)

**Purpose**: Manages staff users with role and department classifications.

```sql
CREATE TABLE staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('manager', 'sales', 'support') DEFAULT 'sales',
  department ENUM('sales', 'marketing', 'finance', 'support') DEFAULT 'sales',
  branch VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  phone VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

**Field Details**:
- `role`: Job function (manager, sales, support)
- `department`: Organizational department
- `branch`: Must match admin's branch for access control

**Business Rules**:
- Masters see all staff regardless of branch
- Admins only see staff from same branch
- Staff cannot manage other users

### 4. **Car Entity** (`src/entities/car.entity.ts`)

**Purpose**: Core business entity representing car inventory.

```sql
CREATE TABLE cars (
  chassisNo VARCHAR(255) PRIMARY KEY,
  brand VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  variant VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  year YEAR NOT NULL,
  color VARCHAR(255) NOT NULL,
  transmission VARCHAR(255) NOT NULL,
  fuelType VARCHAR(255) NOT NULL,
  mileage INT NOT NULL,
  grade VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL,
  condition VARCHAR(255) NOT NULL,
  features JSON NOT NULL,
  remarks TEXT NULL,
  branch VARCHAR(255) NOT NULL,
  soldBy VARCHAR(255) NULL,
  soldAt VARCHAR(255) NULL,
  image JSON NOT NULL,
  public ENUM('yes', 'no') DEFAULT 'no',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Key Design Decisions**:
- **chassisNo as Primary Key**: Business requirement (unique vehicle identifier)
- **JSON Fields**: 
  - `features`: Array of car features for flexibility
  - `image`: Array of image URLs for multiple photos
- **No BaseEntity**: Custom timestamp fields without soft delete
- **String Enums**: Status and condition stored as strings for flexibility

**Business Logic Fields**:
- `public`: Controls visibility on public website ('yes'/'no')
- `soldBy`: Reference to staff member who sold the car
- `soldAt`: Location/branch where car was sold
- `status`: 'In Stock', 'Sold', 'Reserved', etc.
- `condition`: 'New', 'Used', 'Certified'

## 🔄 Database Relationships

### 1. **Admin → Car Relationship** (One-to-Many)
```typescript
// In Admin Entity
@OneToMany('Car', 'created_by')
created_cars: any[];

// In Car Entity  
@ManyToOne('Admin')
@JoinColumn({ name: 'created_by_id' })
created_by: any;
```

**Purpose**: Track which admin created each car record.

### 2. **Staff → Car Relationship** (One-to-Many)
```typescript
// In Staff Entity
@OneToMany('Car', 'assigned_to') 
assigned_cars: any[];

// In Car Entity
@ManyToOne('Staff', { nullable: true })
@JoinColumn({ name: 'assigned_to_id' })
assigned_to: any;
```

**Purpose**: Assign cars to specific staff members for management.

## 🗂️ Indexing Strategy

### Primary Indexes
- `admins.id` (Primary Key, Auto-increment)
- `staff.id` (Primary Key, Auto-increment)  
- `cars.chassisNo` (Primary Key, Business Key)

### Unique Indexes
- `admins.email` (Unique constraint for login)
- `staff.email` (Unique constraint for login)

### Performance Indexes (Recommended)
```sql
-- Search and filtering performance
CREATE INDEX idx_cars_brand ON cars(brand);
CREATE INDEX idx_cars_model ON cars(brand, model);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_public ON cars(public);
CREATE INDEX idx_cars_branch ON cars(branch);

-- User management performance
CREATE INDEX idx_admins_branch ON admins(branch);
CREATE INDEX idx_staff_branch ON staff(branch);
CREATE INDEX idx_staff_role ON staff(role);

-- Authentication performance
CREATE INDEX idx_admins_email_active ON admins(email, is_active);
CREATE INDEX idx_staff_email_active ON staff(email, is_active);
```

## 🔄 Migration Strategy

### Initial Setup
1. **Create Database**: `CREATE DATABASE car_dealership;`
2. **Run Application**: TypeORM will auto-create tables in development
3. **Seed Master User**: Insert initial master admin

### Production Migrations
```typescript
// TypeORM Configuration
synchronize: false,  // Disable auto-sync in production
migrationsRun: true, // Run migrations on startup
migrations: ['dist/migrations/*.js']
```

## 📊 Data Validation Rules

### Entity-Level Validations
```typescript
// Email validation
@IsEmail({}, { message: 'Please provide a valid email address' })
email: string;

// Password requirements  
@MinLength(6, { message: 'Password must be at least 6 characters long' })
password: string;

// Price validation
@Min(0, { message: 'Price must be positive' })
price: number;

// Year validation
@Min(1900, { message: 'Year must be after 1900' })
@Max(new Date().getFullYear() + 1, { message: 'Year cannot be in future' })
year: number;
```

### Database Constraints
- **NOT NULL**: Essential fields cannot be empty
- **UNIQUE**: Email addresses must be unique
- **ENUM**: Predefined values for roles and statuses
- **JSON**: Structured data validation at application level

## 🔐 Security Considerations

### Password Security
- **bcrypt**: 12 salt rounds for password hashing
- **No Plain Text**: Passwords never stored in readable format

### Data Access Security
- **Soft Deletes**: Data recovery possible
- **Branch Isolation**: Admins cannot access other branches
- **Role-Based Access**: Different permissions by user role

### Audit Trail
- **Timestamps**: All create/update operations tracked
- **User Tracking**: Car creation/assignment tracked to users

This database design ensures data integrity, security, and scalability while supporting all business requirements of the car dealership system. 