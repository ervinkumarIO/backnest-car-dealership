# Frontend API Integration Guide

## 🚨 Important Notes for Frontend Team

This document outlines the API endpoints and any changes from the original Laravel implementation that the frontend team needs to be aware of.

## 🔐 Authentication Changes

### **JWT-Based Authentication (Not Session-Based)**
- **Change**: The NestJS implementation uses JWT tokens instead of Laravel's session-based authentication
- **Impact**: Frontend needs to store and send JWT tokens in Authorization headers
- **Headers Required**: `Authorization: Bearer <jwt_token>`

### **Authentication Endpoints**

#### Login Endpoints
```typescript
// Admin/Master Login
POST /api/v1/auth/admin/login
Body: { email: string, password: string }
Response: { user: Admin, access_token: string, type: 'admin' }

// Staff Login  
POST /api/v1/auth/staff/login
Body: { email: string, password: string }
Response: { user: Staff, access_token: string, type: 'staff' }
```

#### User Management Endpoints
```typescript
// Get current user (replaces Laravel's /v1/me)
GET /api/v1/auth/me
Headers: Authorization: Bearer <token>
Response: { role: string, user: { adminId?: string, staffId?: string, name: string, email: string, branch: string } }

// Logout (client-side token removal)
POST /api/v1/auth/logout
Headers: Authorization: Bearer <token>
Response: { message: 'Successfully logged out' }

// Profile endpoint (alternative)
GET /api/v1/auth/profile
Headers: Authorization: Bearer <token>
Response: User object
```

## 🏗️ API Base URL Changes

### **Base URL Structure**
- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://your-domain.com/api/v1`
- **Note**: All endpoints are prefixed with `/api/v1` (not just `/v1`)

## 🚗 Car Management Endpoints

### **Core Car Operations**
```typescript
// List all cars (with filtering)
GET /api/v1/cars?search=term&sortBy=price&sortOrder=desc&perPage=21
GET /api/v1/cars?brand[eq]=Toyota&year[eq]=2023

// Get car by chassis number
GET /api/v1/cars/{chassisNo}

// Create new car
POST /api/v1/cars/create
POST /api/v1/cars/store-new  // Alternative endpoint

// Update car
PATCH /api/v1/cars/{chassisNo}

// Delete car
DELETE /api/v1/cars/{chassisNo}
```

### **Bulk Operations**
```typescript
// Bulk create cars
POST /api/v1/cars/bulk
Body: CreateCarDto[]

// Bulk update prices
PATCH /api/v1/cars/bulk/price
Body: { action: 'increase'|'decrease', amount: number, chassisNo: string[] }

// Bulk update status
PATCH /api/v1/cars/bulk/status
Body: { status: string, chassisNo: string[] }

// Bulk update public visibility
PATCH /api/v1/cars/bulk/public
Body: { public: 'yes'|'no', chassisNo: string[] }

// Bulk delete cars
DELETE /api/v1/cars/bulk
Body: { chassisNo: string[] }
```

### **Car Statistics & Search**
```typescript
// Get car statistics
GET /api/v1/cars/stats
GET /api/v1/cars/statistics  // Alternative endpoint

// Search cars
GET /api/v1/cars/search?q=searchTerm

// Get filter facets
GET /api/v1/cars/facets

// Car listing view (simplified)
GET /api/v1/cars/listing
```

## 🖼️ Image Management Endpoints

### **Image Upload & Management**
```typescript
// Upload images directly
POST /api/v1/cars/images/upload
Body: FormData with 'car_image' files

// Generate presigned URLs
POST /api/v1/cars/images/presigned-urls
Body: { files: [{ fileName: string, contentType?: string }] }

// Generate car-specific presigned URLs
POST /api/v1/cars/images/car-presigned-urls
Body: { chassisNo: string, files: [{ fileName: string, contentType?: string }] }

// Update car images after upload
POST /api/v1/cars/images/update-car-images
Body: { chassisNo: string, keys: string[] }

// Delete car images
DELETE /api/v1/cars/images/{chassisNo}/images
Body: { imageUrls: string[] }

// Add images to car
POST /api/v1/cars/images/{chassisNo}/add
Body: FormData with 'car_image' files

// Migrate problematic images
POST /api/v1/cars/images/migrate-problematic-images
Body: { chassisNo: string, dryRun?: boolean }
```

## 👥 Admin Management Endpoints

### **Admin CRUD (Master Only)**
```typescript
// List all admins
GET /api/v1/admin/admins?page=1&limit=10

// Create admin
POST /api/v1/admin/admins
Body: CreateAdminDto

// Get admin by ID
GET /api/v1/admin/admins/{id}

// Update admin
PATCH /api/v1/admin/admins/{id}
Body: UpdateAdminDto

// Delete admin
DELETE /api/v1/admin/admins/{id}
```

## 👨‍💼 Staff Management Endpoints

### **Staff CRUD (Admin+ Access)**
```typescript
// List staff (filtered by branch)
GET /api/v1/admin/staff?page=1&limit=10

// Create staff
POST /api/v1/admin/staff
Body: CreateStaffDto

// Get staff by ID
GET /api/v1/admin/staff/{id}

// Update staff
PATCH /api/v1/admin/staff/{id}
Body: UpdateStaffDto

// Delete staff
DELETE /api/v1/admin/staff/{id}

// Get sold-by selector data
GET /api/v1/admin/staff/sold-by-selector
```

## 🌐 Public Endpoints (No Authentication)

### **Public Car Viewing**
```typescript
// Get public cars with filters
GET /api/v1/public/cars?search=term&brand[eq]=Toyota

// Public car search
GET /api/v1/public/cars/search?search=term

// Get public facets
GET /api/v1/public/cars/facets

// Get best cars
GET /api/v1/public/cars/best

// Get specific public car
GET /api/v1/public/cars/{chassisNo}
```

## 🛠️ Development Endpoints

### **Database Management (Master Only)**
```typescript
// Get database status
GET /api/v1/dev/database/status

// Run migrations
POST /api/v1/dev/database/migrate

// Seed database
POST /api/v1/dev/database/seed

// Setup development database
POST /api/v1/dev/database/setup

// Reset database (WARNING: Deletes all data!)
POST /api/v1/dev/database/reset
```

## 🔒 Role-Based Access Control

### **Role Hierarchy**
1. **Master** (`master`) - Full system access, can manage all admins
2. **Admin** (`admin`) - Branch-level management, can manage staff and cars
3. **Staff** (`manager`, `sales`, `support`) - Limited access, read-only for most operations

### **Access Control Decorators**
- `@MasterOnly()` - Only Master users
- `@AdminOnly()` - Admin and Master users
- `@StaffOnly()` - All staff roles
- `@AllRoles()` - All authenticated users

## 📝 Data Models

### **Car Model**
```typescript
interface Car {
  chassisNo: string;        // Primary key
  brand: string;
  model: string;
  variant: string;
  price: number;
  year: number;
  color: string;
  transmission: string;
  fuelType: string;
  mileage: number;
  grade: string;
  status: string;           // 'In Stock', 'Sold', 'In Transit', 'Maintenance'
  condition: string;
  features: string[];       // JSON array
  remarks?: string;
  branch: string;
  soldBy?: string;          // Staff ID
  soldAt?: string;          // Date string
  image: string[];          // JSON array of URLs
  public: string;           // 'yes' or 'no'
  created_at: Date;
  updated_at: Date;
}
```

### **Admin Model**
```typescript
interface Admin {
  id: number;
  adminId: string;          // String ID (e.g., 'ADM001', 'MASTER')
  email: string;
  password: string;         // Hashed
  name: string;
  role: 'master' | 'admin';
  is_active: boolean;
  phone?: string;
  branch: string;
  created_at: Date;
  updated_at: Date;
}
```

### **Staff Model**
```typescript
interface Staff {
  id: number;
  staffId: string;          // String ID (e.g., 'STF001')
  email: string;
  password: string;         // Hashed
  name: string;
  role: 'manager' | 'sales' | 'support';
  department: 'sales' | 'marketing' | 'finance' | 'support';
  is_active: boolean;
  phone?: string;
  branch: string;
  created_at: Date;
  updated_at: Date;
}
```

## 🚨 Breaking Changes from Laravel

### **1. Authentication Method**
- **Laravel**: Session-based with CSRF tokens
- **NestJS**: JWT-based with Bearer tokens
- **Action Required**: Update frontend to use JWT tokens

### **2. API Prefix**
- **Laravel**: `/v1/`
- **NestJS**: `/api/v1/`
- **Action Required**: Update all API calls to include `/api` prefix

### **3. Response Formats**
- **Laravel**: Some endpoints return different response structures
- **NestJS**: Standardized JSON responses
- **Action Required**: Review and update response handling

### **4. Entity IDs**
- **Laravel**: String-based IDs (adminId, staffId)
- **NestJS**: Now includes both numeric ID and string ID fields
- **Action Required**: Use string IDs for frontend display

## 🔧 Error Handling

### **Standard Error Response**
```typescript
interface ErrorResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}
```

### **Common HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## 📋 Migration Checklist for Frontend

- [ ] Update API base URL to include `/api` prefix
- [ ] Implement JWT token storage and management
- [ ] Update authentication flow to use JWT instead of sessions
- [ ] Update all API calls to include `Authorization: Bearer <token>` header
- [ ] Review and update response handling for standardized formats
- [ ] Update entity ID handling to use string IDs where applicable
- [ ] Test all endpoints with new authentication system
- [ ] Update error handling for new error response format

## 🆘 Support

If you encounter any issues during the migration or need clarification on any endpoints, please refer to:
1. This documentation
2. The API documentation in `/docs/04-API-DOCUMENTATION.md`
3. The source code in the respective controller files
4. Contact the backend development team

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Compatibility**: NestJS Backend v1.0
