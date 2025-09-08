# 🚗 Car Dealership Frontend - Complete API Specification

## 📋 Overview
This document provides a comprehensive specification of all API endpoints, data formats, and interactions expected by the frontend application. Every single frontend functionality, button, toggle, and action has been analyzed and documented.

---

## 🔧 Base Configuration

### API Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All protected endpoints require JWT Bearer token:
```
Authorization: Bearer <jwt_token>
```

### Content Types
- **JSON**: `application/json`
- **Form Data**: `multipart/form-data`
- **URL Encoded**: `application/x-www-form-urlencoded`

---

## 🔐 Authentication Endpoints

### 1. Unified Login
**Endpoint:** `POST /auth/login`
**Purpose:** Auto-detects user type (Admin/Staff/Master)

**Request Body:**
```json
{
  "email": "master@dealership.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "user": {
    "adminId": "MASTER",           // User identifier (not role)
    "name": "Master Admin",
    "email": "master@dealership.com",
    "phone": "+60123456789",
    "branch": "KL"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "MASTER"                 // REQUIRED: Separate role field
}
```

### 2. Admin Login
**Endpoint:** `POST /auth/admin/login`
**Purpose:** Admin-specific login

**Request Body:**
```json
{
  "email": "admin@dealership.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "user": {
    "adminId": "ADMIN001",
    "name": "Admin User",
    "email": "admin@dealership.com",
    "phone": "+60123456789",
    "branch": "KL"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "ADMIN"
}
```

### 3. Staff Login
**Endpoint:** `POST /auth/staff/login`
**Purpose:** Staff-specific login

**Request Body:**
```json
{
  "email": "staff@dealership.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "user": {
    "staffId": "STAFF001",
    "name": "Staff User",
    "email": "staff@dealership.com",
    "phone": "+60123456789",
    "branch": "KL"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "STAFF"
}
```

### 4. Get Current User
**Endpoint:** `GET /auth/me`
**Purpose:** Get current authenticated user info

**Expected Response:**
```json
{
  "user": {
    "adminId": "MASTER",
    "name": "Master Admin",
    "email": "master@dealership.com",
    "phone": "+60123456789",
    "branch": "KL"
  },
  "role": "MASTER"
}
```

### 5. Get User Profile
**Endpoint:** `GET /auth/profile`
**Purpose:** Get detailed user profile

**Expected Response:**
```json
{
  "user": {
    "adminId": "MASTER",
    "name": "Master Admin",
    "email": "master@dealership.com",
    "phone": "+60123456789",
    "branch": "KL"
  },
  "role": "MASTER"
}
```

### 6. Logout
**Endpoint:** `POST /auth/logout`
**Purpose:** Logout current user

**Expected Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## 🚗 Car Management Endpoints

### 1. Dashboard Car Listing (Inventory Table)
**Endpoint:** `GET /cars/listing`
**Purpose:** Fetch paginated car inventory for dashboard table
**Authentication:** Required (Admin/Master only)

**Query Parameters:**
- `search` (string, optional): Text search across brand, model, variant, chassisNo, color
- `status[eq]` (string, optional): Filter by status
- `condition[eq]` (string, optional): Filter by condition
- `sortBy` (string, optional): Sort field (year, price, created_at, chassisNo)
- `sortOrder` (string, optional): Sort direction (asc, desc)
- `page` (number, optional): Page number (default: 1)
- `perPage` (number, optional): Items per page (default: 10)

**Example Request:**
```
GET /cars/listing?search=toyota&status[eq]=In Stock&sortBy=price&sortOrder=desc&page=1&perPage=25
```

**Expected Response:**
```json
{
  "data": [
    {
      "chassisNo": "ABC123",
      "brand": "Toyota",
      "model": "Camry",
      "variant": "2.5L Hybrid",
      "year": 2023,
      "price": 150000,
      "color": "White",
      "transmission": "Automatic",
      "fuelType": "Hybrid",
      "mileage": 5000,
      "grade": "A",
      "status": "In Stock",
      "condition": "New",
      "features": ["Leather Seats", "Navigation", "Bluetooth"],
      "image": ["https://example.com/image1.jpg"],
      "remarks": "Excellent condition",
      "branch": "KL",
      "created_at": "2025-01-07T10:30:00.000Z",
      "updated_at": "2025-01-07T10:30:00.000Z",
      "public": "yes",
      "soldBy": null,
      "soldAt": null
    }
  ],
  "currentPage": 1,
  "lastPage": 5,
  "total": 125
}
```

### 2. Dashboard Statistics
**Endpoint:** `GET /cars/stats`
**Purpose:** Get dashboard summary statistics
**Authentication:** Required (Admin/Master only)

**Expected Response:**
```json
{
  "totalCars": 125,
  "totalSoldCars": 45,
  "totalAvailableCars": 80
}
```

### 3. Get All Cars (Full Data)
**Endpoint:** `GET /cars`
**Purpose:** Get all cars with full data (Admin only)
**Authentication:** Required (Admin/Master only)

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `search` (string, optional): Search term
- `status` (string, optional): Filter by status
- `public` (string, optional): Filter by public visibility

**Expected Response:**
```json
{
  "data": [...],
  "currentPage": 1,
  "lastPage": 5,
  "total": 125
}
```

### 4. Search Cars
**Endpoint:** `GET /cars/search`
**Purpose:** Search cars by term
**Authentication:** Required (Admin/Master only)

**Query Parameters:**
- `q` (string, required): Search term

**Expected Response:**
```json
{
  "data": [...],
  "total": 10
}
```

### 5. Get Car Facets
**Endpoint:** `GET /cars/facets`
**Purpose:** Get filter options for car listings
**Authentication:** Required (Admin/Master only)

**Query Parameters:** Same as car listing filters

**Expected Response:**
```json
{
  "facets": {
    "brand": {
      "Toyota": 25,
      "Honda": 20,
      "Nissan": 15
    },
    "status": {
      "In Stock": 80,
      "Sold": 45
    },
    "condition": {
      "New": 30,
      "Used": 50,
      "Recon": 20
    }
  }
}
```

### 6. Get Single Car Details
**Endpoint:** `GET /cars/{chassisNo}`
**Purpose:** Get detailed information for a specific car
**Authentication:** Required (Admin/Master only)

**Expected Response:**
```json
{
  "chassisNo": "ABC123",
  "brand": "Toyota",
  "model": "Camry",
  "variant": "2.5L Hybrid",
  "year": 2023,
  "price": 150000,
  "color": "White",
  "transmission": "Automatic",
  "fuelType": "Hybrid",
  "mileage": 5000,
  "grade": "A",
  "status": "In Stock",
  "condition": "New",
  "features": ["Leather Seats", "Navigation", "Bluetooth"],
  "image": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "remarks": "Excellent condition",
  "branch": "KL",
  "created_at": "2025-01-07T10:30:00.000Z",
  "updated_at": "2025-01-07T10:30:00.000Z",
  "public": "yes",
  "soldBy": null,
  "soldAt": null
}
```

### 7. Create New Car
**Endpoint:** `POST /cars/create`
**Purpose:** Create a new car entry
**Authentication:** Required (Admin/Master only)

**Request Body:**
```json
{
  "chassisNo": "ABC123",
  "brand": "Toyota",
  "model": "Camry",
  "variant": "2.5L Hybrid",
  "year": 2023,
  "price": 150000,
  "color": "White",
  "transmission": "Automatic",
  "fuelType": "Hybrid",
  "mileage": 5000,
  "grade": "A",
  "status": "In Stock",
  "condition": "New",
  "features": ["Leather Seats", "Navigation"],
  "remarks": "Excellent condition",
  "branch": "KL",
  "public": "yes"
}
```

**Expected Response:**
```json
{
  "message": "Car created successfully",
  "data": {
    "chassisNo": "ABC123",
    // ... car data
  }
}
```

### 8. Create New Car (Alternative)
**Endpoint:** `POST /cars/store-new`
**Purpose:** Alternative car creation endpoint
**Authentication:** Required (Admin/Master only)

**Request Body:**
```json
{
  "chassisNo": "ABC123",
  "make": "Toyota",        // Note: 'make' instead of 'brand'
  "model": "Camry",
  "year": 2023,
  "price": 150000,
  "status": "In Stock",
  "public": "yes"
}
```

### 9. Update Car
**Endpoint:** `PATCH /cars/{chassisNo}`
**Purpose:** Update existing car information
**Authentication:** Required (Admin/Master only)

**Request Body:**
```json
{
  "chassisNo": "ABC123",
  "brand": "Toyota",
  "model": "Camry",
  "variant": "2.5L Hybrid",
  "year": 2023,
  "price": 160000,
  "color": "White",
  "transmission": "Automatic",
  "fuelType": "Hybrid",
  "mileage": 5000,
  "grade": "A",
  "status": "Sold",
  "condition": "New",
  "features": ["Leather Seats", "Navigation"],
  "remarks": "Excellent condition",
  "branch": "KL",
  "soldBy": "STAFF001",
  "soldAt": "2025-01-07T10:30:00.000Z",
  "public": "yes"
}
```

**Expected Response:**
```json
{
  "message": "Car updated successfully",
  "data": {
    "chassisNo": "ABC123",
    // ... updated car data
  }
}
```

### 10. Delete Car
**Endpoint:** `DELETE /cars/{chassisNo}`
**Purpose:** Delete a specific car
**Authentication:** Required (Admin/Master only)

**Expected Response:**
```json
{
  "message": "Car deleted successfully"
}
```

---

## ⚡ Bulk Operations Endpoints

### 1. Bulk Status Update
**Endpoint:** `PATCH /cars/bulk/status`
**Purpose:** Update status for multiple cars
**Authentication:** Required (Admin/Master only)

**Request Body:**
```json
{
  "chassisNumbers": ["ABC123", "DEF456", "GHI789"],
  "status": "In Stock"
}
```

**Status Options:**
- `"In Stock"` - Car is available for sale
- `"Sold"` - Car has been sold
- `"On Order"` - Car is on order
- `"In Transit"` - Car is being transported
- `"Reserved"` - Car is reserved for a customer

**Expected Response:**
```json
{
  "message": "Status updated successfully",
  "updatedCount": 3
}
```

### 2. Bulk Price Update
**Endpoint:** `PATCH /cars/bulk/price`
**Purpose:** Adjust prices for multiple cars
**Authentication:** Required (Admin/Master only)

**Request Body:**
```json
{
  "chassisNumbers": ["ABC123", "DEF456", "GHI789"],
  "price": 5000
}
```

**Price Adjustment Logic:**
- **Positive value**: Increases price by the specified amount
- **Negative value**: Decreases price by the specified amount

**Expected Response:**
```json
{
  "message": "Prices updated successfully",
  "updatedCount": 3
}
```

### 3. Bulk Public Visibility Update
**Endpoint:** `PATCH /cars/bulk/public`
**Purpose:** Update public visibility for multiple cars
**Authentication:** Required (Admin/Master only)

**Request Body:**
```json
{
  "chassisNumbers": ["ABC123", "DEF456", "GHI789"],
  "public": "yes"
}
```

**Public Visibility Options:**
- `"yes"` - Car is visible to public customers
- `"no"` - Car is only visible to internal staff

**Expected Response:**
```json
{
  "message": "Public visibility updated successfully",
  "updatedCount": 3
}
```

### 4. Bulk Delete Cars
**Endpoint:** `DELETE /cars/bulk`
**Purpose:** Delete multiple cars
**Authentication:** Required (Admin/Master only)

**Request Body:**
```json
{
  "chassisNumbers": ["ABC123", "DEF456", "GHI789"]
}
```

**Expected Response:**
```json
{
  "message": "Cars deleted successfully",
  "deletedCount": 3
}
```

### 5. Bulk Store Cars
**Endpoint:** `POST /cars/bulk`
**Purpose:** Create multiple cars at once
**Authentication:** Required (Admin/Master only)

**Request Body:**
```json
{
  "cars": [
    {
      "chassisNo": "ABC123",
      "brand": "Toyota",
      "model": "Camry",
      "variant": "2.5L Hybrid",
      "year": 2023,
      "price": 150000,
      "color": "White",
      "transmission": "Automatic",
      "fuelType": "Hybrid",
      "mileage": 5000,
      "grade": "A",
      "status": "In Stock",
      "condition": "New",
      "features": ["Leather Seats", "Navigation"],
      "remarks": "Excellent condition",
      "branch": "KL",
      "public": "yes"
    }
  ]
}
```

**Expected Response:**
```json
{
  "message": "Cars created successfully",
  "createdCount": 1
}
```

---

## 📸 Image Management Endpoints

### 1. Direct Upload (Multiple Cars)
**Endpoint:** `POST /cars/images/upload`
**Purpose:** Upload images for multiple cars
**Authentication:** Required (Admin/Master only)
**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**
- `car_image`: Multiple image files named like "ABC123_1.jpg"

**Expected Response:**
```json
{
  "message": "Images uploaded successfully",
  "uploadedCount": 5
}
```

### 2. Add Images to Specific Car
**Endpoint:** `POST /cars/images/add-images/{chassisNo}`
**Purpose:** Add images to a specific car
**Authentication:** Required (Admin/Master only)
**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**
- `car_image`: Image files

**Expected Response:**
```json
{
  "message": "Images added successfully",
  "chassisNo": "ABC123",
  "imageCount": 3
}
```

### 3. Add Images to Car (Alternative)
**Endpoint:** `POST /cars/images/{chassisNo}/add`
**Purpose:** Alternative endpoint for adding images
**Authentication:** Required (Admin/Master only)
**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**
- `car_image`: Image files

### 4. Generate Car-Specific Presigned URLs
**Endpoint:** `POST /cars/images/generate-car-image-presigned-urls`
**Purpose:** Generate S3 presigned URLs for car images
**Authentication:** Required (Admin/Master only)

**Request Body:**
```json
{
  "chassisNo": "ABC123",
  "files": [
    {
      "fileName": "car-front.jpg",
      "contentType": "image/jpeg"
    },
    {
      "fileName": "car-back.jpg",
      "contentType": "image/jpeg"
    }
  ]
}
```

**Expected Response:**
```json
{
  "data": {
    "chassisNo": "ABC123",
    "urls": [
      {
        "fileName": "car-front.jpg",
        "presignedUrl": "https://bucket.s3.region.amazonaws.com/cars/ABC123/car-front.jpg?signature=...",
        "key": "cars/ABC123/car-front.jpg"
      }
    ],
    "expiresIn": 3600,
    "region": "us-east-1"
  }
}
```

### 5. Update Car Images (After S3 Upload)
**Endpoint:** `POST /cars/images/update-car-images`
**Purpose:** Notify backend of uploaded images
**Authentication:** Required (Admin/Master only)

**Request Body:**
```json
{
  "chassisNo": "ABC123",
  "keys": [
    "cars/ABC123/car-front.jpg",
    "cars/ABC123/car-back.jpg"
  ]
}
```

**Expected Response:**
```json
{
  "data": {
    "chassisNo": "ABC123",
    "images": [
      "https://bucket.s3.region.amazonaws.com/cars/ABC123/car-front.jpg",
      "https://bucket.s3.region.amazonaws.com/cars/ABC123/car-back.jpg"
    ]
  }
}
```

### 6. Generate Generic Presigned URLs
**Endpoint:** `POST /cars/images/presigned-urls`
**Purpose:** Generate generic presigned URLs
**Authentication:** Required (Admin/Master only)

**Request Body:**
```json
{
  "files": [
    {
      "fileName": "test-image.jpg",
      "contentType": "image/jpeg"
    }
  ]
}
```

**Expected Response:**
```json
{
  "data": {
    "urls": [
      {
        "fileName": "test-image.jpg",
        "presignedUrl": "https://bucket.s3.region.amazonaws.com/test-image.jpg?signature=...",
        "key": "test-image.jpg"
      }
    ],
    "expiresIn": 3600,
    "region": "us-east-1"
  }
}
```

### 7. Delete Car Images
**Endpoint:** `DELETE /cars/images/{chassisNo}/images`
**Purpose:** Delete specific car images
**Authentication:** Required (Admin/Master only)

**Request Body:**
```json
{
  "imageUrls": [
    "https://bucket.s3.region.amazonaws.com/cars/ABC123/car-front.jpg"
  ]
}
```

**Expected Response:**
```json
{
  "message": "Images deleted successfully",
  "deletedCount": 1
}
```

### 8. Migrate Problematic Images
**Endpoint:** `POST /cars/images/migrate-problematic-images`
**Purpose:** Migrate problematic images
**Authentication:** Required (Admin/Master only)

**Request Body:**
```json
{
  "chassisNo": "ABC123",
  "dryRun": true
}
```

**Expected Response:**
```json
{
  "data": {
    "chassisNo": "ABC123",
    "migratedCount": 3,
    "dryRun": true
  }
}
```

---

## 🌐 Public Endpoints (No Authentication Required)

### 1. Get Best Cars
**Endpoint:** `GET /public/cars/best`
**Purpose:** Get top 4 best cars for homepage

**Expected Response:**
```json
{
  "data": [
    {
      "chassisNo": "ABC123",
      "brand": "Toyota",
      "model": "Camry",
      "variant": "2.5L Hybrid",
      "year": 2023,
      "price": 150000,
      "color": "White",
      "transmission": "Automatic",
      "fuelType": "Hybrid",
      "mileage": 5000,
      "grade": "A",
      "status": "In Stock",
      "condition": "New",
      "features": ["Leather Seats", "Navigation"],
      "image": ["https://example.com/image1.jpg"],
      "remarks": "Excellent condition",
      "branch": "KL",
      "public": "yes"
    }
  ]
}
```

### 2. Get Public Cars with Filters
**Endpoint:** `GET /public/cars`
**Purpose:** Get public cars with filtering options

**Query Parameters:**
- `search` (string, optional): Search term
- `make` (string, optional): Car make/brand
- `year` (string, optional): Manufacturing year
- `price_min` (number, optional): Minimum price
- `price_max` (number, optional): Maximum price

**Expected Response:**
```json
{
  "data": [...],
  "currentPage": 1,
  "lastPage": 5,
  "total": 50
}
```

### 3. Search Public Cars
**Endpoint:** `GET /public/cars/search`
**Purpose:** Search public cars

**Query Parameters:**
- `search` (string, required): Search term

**Expected Response:**
```json
{
  "data": [...],
  "total": 10
}
```

### 4. Get Public Car Facets
**Endpoint:** `GET /public/cars/facets`
**Purpose:** Get filter options for public car listings

**Expected Response:**
```json
{
  "facets": {
    "brand": {
      "Toyota": 25,
      "Honda": 20,
      "Nissan": 15
    },
    "condition": {
      "New": 30,
      "Used": 50,
      "Recon": 20
    }
  }
}
```

### 5. Get Public Car Details
**Endpoint:** `GET /public/cars/{chassisNo}`
**Purpose:** Get detailed information for a public car

**Expected Response:**
```json
{
  "chassisNo": "ABC123",
  "brand": "Toyota",
  "model": "Camry",
  "variant": "2.5L Hybrid",
  "year": 2023,
  "price": 150000,
  "color": "White",
  "transmission": "Automatic",
  "fuelType": "Hybrid",
  "mileage": 5000,
  "grade": "A",
  "status": "In Stock",
  "condition": "New",
  "features": ["Leather Seats", "Navigation"],
  "image": ["https://example.com/image1.jpg"],
  "remarks": "Excellent condition",
  "branch": "KL",
  "public": "yes"
}
```

---

## 👥 Admin Management Endpoints

### 1. Get All Admins
**Endpoint:** `GET /admin/admins`
**Purpose:** Get paginated list of admin users
**Authentication:** Required (Master only)

**Query Parameters:**
- `page` (number, optional): Page number
- `perPage` (number, optional): Items per page

**Expected Response:**
```json
{
  "data": [
    {
      "adminId": "ADMIN001",
      "name": "Admin User",
      "email": "admin@dealership.com",
      "phone": "+60123456789",
      "branch": "KL"
    }
  ],
  "currentPage": 1,
  "lastPage": 1
}
```

### 2. Create New Admin
**Endpoint:** `POST /admin/admins`
**Purpose:** Create a new admin user
**Authentication:** Required (Master only)

**Request Body:**
```json
{
  "adminId": "ADMIN002",
  "name": "New Admin",
  "email": "newadmin@dealership.com",
  "password": "password123",
  "phone": "+60123456789",
  "branch": "KL"
}
```

**Expected Response:**
```json
{
  "message": "Admin created successfully",
  "data": {
    "adminId": "ADMIN002",
    "name": "New Admin",
    "email": "newadmin@dealership.com",
    "phone": "+60123456789",
    "branch": "KL"
  }
}
```

### 3. Get Single Admin
**Endpoint:** `GET /admin/admins/{adminId}`
**Purpose:** Get details of a specific admin
**Authentication:** Required (Master only)

**Expected Response:**
```json
{
  "adminId": "ADMIN001",
  "name": "Admin User",
  "email": "admin@dealership.com",
  "phone": "+60123456789",
  "branch": "KL"
}
```

### 4. Update Admin
**Endpoint:** `PATCH /admin/admins/{adminId}`
**Purpose:** Update admin information
**Authentication:** Required (Master only)

**Request Body:**
```json
{
  "name": "Updated Admin Name",
  "email": "updated@dealership.com",
  "phone": "+60123456789",
  "branch": "KL"
}
```

**Expected Response:**
```json
{
  "message": "Admin updated successfully",
  "data": {
    "adminId": "ADMIN001",
    "name": "Updated Admin Name",
    "email": "updated@dealership.com",
    "phone": "+60123456789",
    "branch": "KL"
  }
}
```

### 5. Delete Admin
**Endpoint:** `DELETE /admin/admins/{adminId}`
**Purpose:** Delete an admin user
**Authentication:** Required (Master only)

**Expected Response:**
```json
{
  "message": "Admin deleted successfully"
}
```

---

## 👨‍💼 Staff Management Endpoints

### 1. Get All Staff
**Endpoint:** `GET /staff`
**Purpose:** Get paginated list of staff users
**Authentication:** Required (Admin/Master only)

**Query Parameters:**
- `page` (number, optional): Page number
- `perPage` (number, optional): Items per page

**Expected Response:**
```json
{
  "data": [
    {
      "staffId": "STAFF001",
      "name": "Staff User",
      "email": "staff@dealership.com",
      "phone": "+60123456789",
      "branch": "KL"
    }
  ],
  "currentPage": 1,
  "lastPage": 1
}
```

### 2. Create New Staff
**Endpoint:** `POST /staff`
**Purpose:** Create a new staff user
**Authentication:** Required (Admin/Master only)

**Request Body:**
```json
{
  "staffId": "STAFF002",
  "name": "New Staff",
  "email": "newstaff@dealership.com",
  "password": "password123",
  "phone": "+60123456789",
  "branch": "KL"
}
```

**Expected Response:**
```json
{
  "message": "Staff created successfully",
  "data": {
    "staffId": "STAFF002",
    "name": "New Staff",
    "email": "newstaff@dealership.com",
    "phone": "+60123456789",
    "branch": "KL"
  }
}
```

### 3. Get Staff Sold By Selector
**Endpoint:** `GET /staff/sold-by-selector`
**Purpose:** Get staff and branch lists for dropdowns
**Authentication:** Required (Admin/Master only)

**Expected Response:**
```json
{
  "data": {
    "staffIds": ["STAFF001", "STAFF002", "STAFF003"],
    "branches": ["KL", "Penang", "Johor"]
  }
}
```

### 4. Get Single Staff
**Endpoint:** `GET /staff/{staffId}`
**Purpose:** Get details of a specific staff member
**Authentication:** Required (Admin/Master only)

**Expected Response:**
```json
{
  "staffId": "STAFF001",
  "name": "Staff User",
  "email": "staff@dealership.com",
  "phone": "+60123456789",
  "branch": "KL"
}
```

### 5. Update Staff
**Endpoint:** `PATCH /staff/{staffId}`
**Purpose:** Update staff information
**Authentication:** Required (Admin/Master only)

**Request Body:**
```json
{
  "name": "Updated Staff Name",
  "email": "updated@dealership.com",
  "phone": "+60123456789",
  "branch": "KL"
}
```

**Expected Response:**
```json
{
  "message": "Staff updated successfully",
  "data": {
    "staffId": "STAFF001",
    "name": "Updated Staff Name",
    "email": "updated@dealership.com",
    "phone": "+60123456789",
    "branch": "KL"
  }
}
```

### 6. Delete Staff
**Endpoint:** `DELETE /staff/{staffId}`
**Purpose:** Delete a staff user
**Authentication:** Required (Admin/Master only)

**Expected Response:**
```json
{
  "message": "Staff deleted successfully"
}
```

---

## 🗄️ Database Management Endpoints

### 1. Get Database Status
**Endpoint:** `GET /database/status`
**Purpose:** Get database status information
**Authentication:** Required (Admin/Master only)

**Expected Response:**
```json
{
  "status": "connected",
  "tables": {
    "cars": 125,
    "admins": 3,
    "staff": 10
  },
  "lastBackup": "2025-01-07T10:30:00.000Z"
}
```

### 2. Setup Database (Public)
**Endpoint:** `POST /public/database/setup`
**Purpose:** Setup database tables and structure
**Authentication:** None required

**Expected Response:**
```json
{
  "message": "Database setup completed successfully",
  "tablesCreated": 5
}
```

### 3. Get Public Database Status
**Endpoint:** `GET /public/database/status`
**Purpose:** Get public database status
**Authentication:** None required

**Expected Response:**
```json
{
  "status": "connected",
  "version": "1.0.0",
  "lastMigration": "2025-01-07T10:30:00.000Z"
}
```

### 4. Migrate Database (Public)
**Endpoint:** `POST /public/database/migrate`
**Purpose:** Run database migrations
**Authentication:** None required

**Expected Response:**
```json
{
  "message": "Database migration completed successfully",
  "migrationsRun": 3
}
```

### 5. Seed Database (Public)
**Endpoint:** `POST /public/database/seed`
**Purpose:** Seed database with initial data
**Authentication:** None required

**Expected Response:**
```json
{
  "message": "Database seeded successfully",
  "recordsCreated": 50
}
```

### 6. Reset Database (Public)
**Endpoint:** `POST /public/database/reset`
**Purpose:** Reset database (DANGEROUS!)
**Authentication:** None required

**Expected Response:**
```json
{
  "message": "Database reset completed successfully",
  "recordsDeleted": 1000
}
```

---

## 📊 Data Types and Structures

### Car Object Structure
```typescript
interface Car {
  chassisNo: string;        // Unique identifier
  brand: string;            // Car brand
  model: string;            // Car model
  variant: string;          // Car variant
  year: number;             // Manufacturing year
  price: number;            // Price in MYR
  color: string;            // Car color
  transmission: string;     // Transmission type
  fuelType: string;         // Fuel type
  mileage: number;          // Mileage in km
  grade: string;            // Car grade
  status: CarStatus;        // Car status
  condition: CarCondition;  // Car condition
  features: string[];       // Array of features
  image: string[];          // Array of image URLs
  remarks: string | null;   // Additional remarks
  branch: string;           // Branch location
  created_at: string;       // Creation timestamp
  updated_at: string;       // Last update timestamp
  public: string;           // "yes" | "no" - public visibility
  soldBy?: string;          // Only for sold cars
  soldAt?: string;          // Only for sold cars
}
```

### Car Status Types
```typescript
type CarStatus = "In Stock" | "Sold" | "On Order" | "In Transit" | "Reserved";
```

### Car Condition Types
```typescript
type CarCondition = "New" | "Used" | "Certified Pre-Owned" | "Recon";
```

### User Types
```typescript
interface Admin {
  adminId: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  password?: string;
}

interface Staff {
  staffId: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  password?: string;
}

interface Master {
  master_id: string;
  name: string;
  email: string;
  phone: string;
}

type User = Admin | Staff | Master;
type Role = 'admin' | 'staff' | 'master' | 'ADMIN' | 'STAFF' | 'MASTER';
```

---

## 🎯 Frontend UI Components and Their API Requirements

### 1. Dashboard Page (`/`)
**Components:** Dashboard cards, Inventory table, Bulk actions
**API Calls:**
- `GET /cars/stats` - Dashboard statistics
- `GET /cars/listing` - Inventory table data
- `PATCH /cars/bulk/status` - Bulk status updates
- `PATCH /cars/bulk/price` - Bulk price updates
- `PATCH /cars/bulk/public` - Bulk public visibility updates
- `DELETE /cars/bulk` - Bulk delete cars

### 2. Car Upload Page (`/upload`)
**Components:** Car form, Image upload, Staff/Branch selectors
**API Calls:**
- `POST /cars/create` - Create new car
- `PATCH /cars/{chassisNo}` - Update existing car
- `GET /cars/{chassisNo}` - Fetch car details for editing
- `GET /staff/sold-by-selector` - Get staff and branch lists
- `POST /cars/images/add-images/{chassisNo}` - Upload images
- `POST /cars/images/generate-car-image-presigned-urls` - S3 presigned URLs
- `POST /cars/images/update-car-images` - Notify backend of uploaded images

### 3. Car Details Page (`/cars/{chassisNo}`)
**Components:** Car details display, Image carousel
**API Calls:**
- `GET /cars/{chassisNo}` - Get car details

### 4. Car Listing Page (`/cars`)
**Components:** Car grid, Filters, Search, Pagination
**API Calls:**
- `GET /cars` - Get cars with filters
- `GET /cars/facets` - Get filter options

### 5. Admin Management Page (`/admin`)
**Components:** Admin table, Add/Edit/Delete dialogs
**API Calls:**
- `GET /admin/admins` - Get admin list
- `POST /admin/admins` - Create admin
- `GET /admin/admins/{adminId}` - Get admin details
- `PATCH /admin/admins/{adminId}` - Update admin
- `DELETE /admin/admins/{adminId}` - Delete admin

### 6. Staff Management Page (`/staff`)
**Components:** Staff table, Add/Edit/Delete dialogs
**API Calls:**
- `GET /staff` - Get staff list
- `POST /staff` - Create staff
- `GET /staff/{staffId}` - Get staff details
- `PATCH /staff/{staffId}` - Update staff
- `DELETE /staff/{staffId}` - Delete staff

### 7. Sign In Page (`/sign-in`)
**Components:** Login form
**API Calls:**
- `POST /auth/login` - Unified login
- `POST /auth/admin/login` - Admin login
- `POST /auth/staff/login` - Staff login

---

## 🔄 Error Response Format

### Standard Error Response
```json
{
  "statusCode": 400,
  "timestamp": "2025-01-07T10:30:00.000Z",
  "path": "/cars/listing",
  "method": "GET",
  "message": "Invalid query parameters"
}
```

### Success Response Format
```json
{
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

---

## 📝 Implementation Notes

### 1. Authentication Flow
1. User submits login form
2. Frontend calls appropriate login endpoint
3. Backend returns user data, token, and role
4. Frontend stores token in localStorage
5. Frontend sets user and role in context
6. All subsequent API calls include Bearer token

### 2. Role-Based Access Control
- **Master**: Full access to all endpoints
- **Admin**: Access to cars, staff, images (no admin management)
- **Staff**: Limited access to cars and images

### 3. File Upload Workflow
1. **Direct Upload**: Use `multipart/form-data` with FormData
2. **S3 Upload**: 
   - Request presigned URLs
   - Upload files directly to S3
   - Notify backend of uploaded files

### 4. Bulk Operations
- All bulk operations expect `chassisNumbers` array
- Operations return `updatedCount` or `deletedCount`
- Frontend implements optimistic updates with rollback

### 5. Pagination
- All list endpoints support pagination
- Response includes `currentPage`, `lastPage`, `total`
- Frontend handles page navigation and size selection

### 6. Search and Filtering
- Search is debounced (500ms) to avoid excessive API calls
- Filters support multiple formats: `status[eq]` and `status`
- Facets provide available filter options

---

## 🚨 Critical Requirements

### 1. Role Field Requirement
**CRITICAL**: The login response MUST include a separate `role` field:
```json
{
  "user": { ... },
  "access_token": "...",
  "role": "MASTER"  // ← REQUIRED: This field determines permissions
}
```

### 2. Case Sensitivity
- Frontend converts roles to lowercase for comparison
- Backend can return uppercase or lowercase roles
- Frontend handles both cases

### 3. Data Type Consistency
- All numeric fields (price, year, mileage) must be numbers
- All date fields must be ISO 8601 strings
- All arrays must be proper JSON arrays
- All boolean-like fields use "yes"/"no" strings

### 4. Error Handling
- All API calls must return consistent error format
- Frontend implements proper error boundaries
- User feedback for all operations (success/error toasts)

---

*This specification covers every single API endpoint, data format, and frontend functionality. All buttons, toggles, forms, and interactions have been analyzed and documented.*
