# Car Dealership Backend API Documentation

## Overview
This Laravel-based car dealership backend provides a comprehensive API for managing cars, staff, and administrators with a hierarchical permission system. The API supports three user roles: **Master**, **Admin**, and **Staff**.

## User Hierarchy & Permissions

### 🔑 Master (adminId: 'MASTER')
- **Highest level access** - can manage all admins across all branches
- **Full system control** - access to all features and data
- **Admin management** - create, read, update, delete administrators
- **Cross-branch access** - can view and manage data from all branches

### 👨‍💼 Admin
- **Branch-level management** - can manage staff and cars within their assigned branch
- **Staff management** - create, read, update, delete staff members in their branch
- **Car management** - full CRUD operations on cars
- **Limited scope** - restricted to their assigned branch (except Master)

### 👨‍💻 Staff
- **Read-only access** - can view cars and basic information
- **Limited functionality** - primarily for viewing and basic operations
- **Branch-restricted** - can only access data from their assigned branch

---

## Base URL
```
http://your-domain.com/v1
```

## Authentication
The API uses session-based authentication with Laravel Sanctum. All protected endpoints require authentication.

### Authentication Endpoints

#### Login
```http
POST /v1/login
```
**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password"
}
```
**Response:**
```json
{
    "message": "Admin logged in" | "Staff logged in",
    "role": "master" | "admin" | "staff",
    "user": {
        "adminId": "MASTER" | "ADMIN001",
        "name": "John Doe",
        "email": "admin@example.com",
        "branch": "KL"
    }
}
```

#### Logout
```http
POST /v1/logout
```
**Headers:** `Authorization: Bearer {token}` (if using tokens)
**Response:**
```json
{
    "message": "Successfully logged out"
}
```

#### Get Current User
```http
GET /v1/me
```
**Headers:** `Authorization: Bearer {token}` (if using tokens)
**Response:**
```json
{
    "role": "master" | "admin" | "staff",
    "user": {
        "adminId": "MASTER",
        "name": "John Doe",
        "email": "admin@example.com",
        "branch": "KL"
    }
}
```

#### CSRF Cookie
```http
GET /sanctum/csrf-cookie
```
**Response:**
```json
{
    "message": "CSRF cookie set"
}
```

---

## Public Endpoints (No Authentication Required)

### Car Viewing (Public)
These endpoints are accessible without authentication for public car browsing.

#### Get Public Car Facets
```http
GET /public/facet-counts
```
**Query Parameters:**
- `q` - Search term
- `brand[eq]` - Filter by brand
- `model[eq]` - Filter by model
- `year[eq]` - Filter by year
- `color[eq]` - Filter by color
- `transmission[eq]` - Filter by transmission
- `fuelType[eq]` - Filter by fuel type
- `grade[eq]` - Filter by grade
- `condition[eq]` - Filter by condition

**Response:**
```json
{
    "chassis_numbers": ["ABC123", "DEF456"],
    "facets": {
        "brand": {
            "Toyota": 15,
            "Honda": 12
        },
        "year": {
            "2023": 8,
            "2022": 10
        }
    }
}
```

#### Public Car Search
```http
GET /public/search
```
**Query Parameters:**
- `search` - Search term for brand, model, or chassis number

**Response:**
```json
{
    "count": 5,
    "results": [
        {
            "chassisNo": "ABC123",
            "brand": "Toyota",
            "model": "Camry",
            "price": 150000,
            "year": 2023
        }
    ]
}
```

#### Public Car View
```http
GET /public/view
```
**Query Parameters:**
- `search` - Search term
- `sortBy` - Sort field (year, price, mileage)
- `sortOrder` - Sort order (asc, desc)
- `brand[eq]` - Filter by brand
- `model[eq]` - Filter by model
- `year[eq]` - Filter by year
- `color[eq]` - Filter by color
- `transmission[eq]` - Filter by transmission
- `fuelType[eq]` - Filter by fuel type
- `grade[eq]` - Filter by grade
- `condition[eq]` - Filter by condition

**Response:**
```json
{
    "data": [
        {
            "chassisNo": "ABC123",
            "brand": "Toyota",
            "model": "Camry",
            "variant": "2.5L",
            "price": 150000,
            "year": 2023,
            "color": "White",
            "transmission": "Automatic",
            "fuelType": "Petrol",
            "mileage": 5000,
            "grade": "G",
            "condition": "Excellent",
            "features": ["GPS", "Bluetooth"],
            "image": ["url1", "url2"],
            "public": "yes"
        }
    ],
    "currentPage": 1,
    "lastPage": 5,
    "total": 100
}
```

#### Get Best Cars
```http
GET /public/best-cars
```
**Response:**
```json
{
    "data": [
        {
            "chassisNo": "ABC123",
            "brand": "Toyota",
            "model": "Camry",
            "price": 200000,
            "year": 2023,
            "image": ["url1", "url2"]
        }
    ]
}
```

#### Get Customer Car Details
```http
GET /public/customer/{chassisNo}
```
**Response:**
```json
{
    "chassisNo": "ABC123",
    "brand": "Toyota",
    "model": "Camry",
    "variant": "2.5L",
    "price": 150000,
    "year": 2023,
    "color": "White",
    "transmission": "Automatic",
    "fuelType": "Petrol",
    "mileage": 5000,
    "grade": "G",
    "condition": "Excellent",
    "features": ["GPS", "Bluetooth"],
    "image": ["url1", "url2"],
    "remarks": "Well maintained",
    "public": "yes"
}
```

---

## Protected Endpoints

### Image Upload (No Authentication Required)

#### Upload Car Images
```http
POST /v1/upload-car-image
```
**Request:** Multipart form data
- `car_image[]` - Array of image files (jpeg, png, jpg, webp, pdf, max 5MB each)

**Response:**
```json
{
    "message": "Images uploaded and linked to cars successfully!",
    "data": {
        "ABC123": [
            "https://s3.amazonaws.com/bucket/image1.jpg",
            "https://s3.amazonaws.com/bucket/image2.jpg"
        ]
    }
}
```

#### Generate Presigned URLs
```http
POST /v1/generate-presigned-urls
```
**Request Body:**
```json
{
    "files": [
        {
            "fileName": "image1.jpg",
            "contentType": "image/jpeg"
        }
    ]
}
```
**Response:**
```json
{
    "message": "Presigned URLs generated successfully",
    "data": {
        "urls": [
            {
                "fileName": "image1.jpg",
                "key": "car-images/unique_id_image1.jpg",
                "presignedUrl": "https://s3.amazonaws.com/..."
            }
        ],
        "expiresIn": "15 minutes",
        "region": "us-east-1"
    }
}
```

---

## Admin & Staff Shared Endpoints

### Car Management

#### Get All Cars
```http
GET /v1/cars
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Query Parameters:**
- `search` - Search term
- `sortBy` - Sort field (year, price, mileage)
- `sortOrder` - Sort order (asc, desc)
- `perPage` - Items per page (default: 21)
- `brand[eq]` - Filter by brand
- `model[eq]` - Filter by model
- `year[eq]` - Filter by year
- `color[eq]` - Filter by color
- `transmission[eq]` - Filter by transmission
- `fuelType[eq]` - Filter by fuel type
- `grade[eq]` - Filter by grade
- `condition[eq]` - Filter by condition
- `status[eq]` - Filter by status
- `branch[eq]` - Filter by branch

**Response:**
```json
{
    "data": [
        {
            "chassisNo": "ABC123",
            "brand": "Toyota",
            "model": "Camry",
            "variant": "2.5L",
            "price": 150000,
            "year": 2023,
            "color": "White",
            "transmission": "Automatic",
            "fuelType": "Petrol",
            "mileage": 5000,
            "grade": "G",
            "status": "In Stock",
            "condition": "Excellent",
            "features": ["GPS", "Bluetooth"],
            "image": ["url1", "url2"],
            "remarks": "Well maintained",
            "branch": "KL",
            "soldBy": null,
            "soldAt": null,
            "public": "yes",
            "created_at": "2023-01-01T00:00:00.000000Z",
            "updated_at": "2023-01-01T00:00:00.000000Z"
        }
    ],
    "currentPage": 1,
    "lastPage": 5,
    "perPage": 21,
    "total": 100
}
```

#### Get Car by Chassis Number
```http
GET /v1/cars/{chassisNo}
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Response:**
```json
{
    "chassisNo": "ABC123",
    "brand": "Toyota",
    "model": "Camry",
    "variant": "2.5L",
    "price": 150000,
    "year": 2023,
    "color": "White",
    "transmission": "Automatic",
    "fuelType": "Petrol",
    "mileage": 5000,
    "grade": "G",
    "status": "In Stock",
    "condition": "Excellent",
    "features": ["GPS", "Bluetooth"],
    "image": ["url1", "url2"],
    "remarks": "Well maintained",
    "branch": "KL",
    "soldBy": null,
    "soldAt": null,
    "public": "yes",
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z"
}
```

#### Get Car Statistics
```http
GET /v1/stats
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Response:**
```json
{
    "totalCars": 500,
    "totalSoldCars": 200,
    "totalAvailableCars": 300
}
```

#### Get Car Facets
```http
GET /v1/facet-counts
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Query Parameters:** Same as public facets endpoint
**Response:** Same format as public facets but includes all cars (not just public ones)

---

## Admin-Only Endpoints

### Car Management (Admin)

#### Create New Car
```http
POST /v1/cars/create
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Request Body:**
```json
{
    "chassisNo": "ABC123",
    "brand": "Toyota",
    "model": "Camry",
    "variant": "2.5L",
    "price": 150000,
    "year": 2023,
    "color": "White",
    "transmission": "Automatic",
    "fuelType": "Petrol",
    "mileage": 5000,
    "grade": "G",
    "status": "In Stock",
    "condition": "Excellent",
    "features": ["GPS", "Bluetooth"],
    "remarks": "Well maintained",
    "branch": "KL",
    "public": "yes"
}
```
**Response:**
```json
{
    "chassisNo": "ABC123",
    "brand": "Toyota",
    "model": "Camry",
    "variant": "2.5L",
    "price": 150000,
    "year": 2023,
    "color": "White",
    "transmission": "Automatic",
    "fuelType": "Petrol",
    "mileage": 5000,
    "grade": "G",
    "status": "In Stock",
    "condition": "Excellent",
    "features": ["GPS", "Bluetooth"],
    "image": [],
    "remarks": "Well maintained",
    "branch": "KL",
    "soldBy": null,
    "soldAt": null,
    "public": "yes",
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z"
}
```

#### Update Car
```http
PATCH /v1/update/{chassisNo}
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Request Body:** Same as create car (partial updates allowed)
**Response:** Updated car object

#### Delete Car
```http
DELETE /v1/cars/delete/{car}
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Response:**
```json
{
    "message": "Car deleted successfully! Deleted details below:",
    "data": {
        "chassisNo": "ABC123",
        "brand": "Toyota",
        "model": "Camry"
    }
}
```

#### Car Listing (Admin View)
```http
GET /v1/listing
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Query Parameters:**
- `search` - Search term
- `sortBy` - Sort field (year, price, created_at)
- `sortOrder` - Sort order (asc, desc)
- `perPage` - Items per page (default: 10)
- All filter parameters from car endpoints

**Response:**
```json
{
    "data": [
        {
            "chassisNo": "ABC123",
            "brand": "Toyota",
            "model": "Camry",
            "variant": "2.5L",
            "price": 150000,
            "year": 2023,
            "status": "In Stock",
            "condition": "Excellent",
            "created_at": "2023-01-01T00:00:00.000000Z",
            "soldBy": null,
            "public": "yes"
        }
    ],
    "currentPage": 1,
    "lastPage": 10,
    "perPage": 10,
    "total": 100
}
```

#### Bulk Update Car Prices
```http
POST /v1/cars/bulk-update-price
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Request Body:**
```json
{
    "action": "increase" | "decrease",
    "amount": 10000,
    "chassisNo": ["ABC123", "DEF456", "GHI789"]
}
```
**Response:**
```json
{
    "message": "Cars updated successfully",
    "updated_cars_count": 3
}
```

#### Bulk Update Car Status
```http
POST /v1/cars/bulk-update-status
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Request Body:**
```json
{
    "status": "In Transit" | "In Stock" | "Sold" | "Maintenance",
    "chassisNo": ["ABC123", "DEF456", "GHI789"]
}
```
**Response:**
```json
{
    "message": "Cars status updated successfully",
    "updated_cars_count": 3
}
```

#### Bulk Update Car Public Visibility
```http
POST /v1/bulk-update-public
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Request Body:**
```json
{
    "public": "yes" | "no",
    "chassisNo": ["ABC123", "DEF456", "GHI789"]
}
```
**Response:**
```json
{
    "message": "Cars public view updated successfully",
    "updated_cars_count": 3
}
```

#### Bulk Delete Cars
```http
POST /v1/cars/bulk-delete
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Request Body:**
```json
{
    "chassisNo": ["ABC123", "DEF456", "GHI789"]
}
```
**Response:**
```json
{
    "message": "Cars deleted successfully",
    "deleted_cars_count": 3
}
```

### Car Image Management (Admin)

#### Delete Car Images
```http
DELETE /v1/delete-images/{chassisNo}
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Request Body:**
```json
{
    "imageUrls": [
        "https://s3.amazonaws.com/bucket/image1.jpg",
        "https://s3.amazonaws.com/bucket/image2.jpg"
    ]
}
```
**Response:**
```json
{
    "message": "Images deleted successfully.",
    "remaining_images": [
        "https://s3.amazonaws.com/bucket/image3.jpg"
    ]
}
```

#### Add Images to Car
```http
POST /v1/add-images/{chassisNo}
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Request:** Multipart form data
- `car_image[]` - Array of image files

**Response:**
```json
{
    "message": "Images added successfully!",
    "data": {
        "chassisNo": "ABC123",
        "new_images": [
            "https://s3.amazonaws.com/bucket/new_image1.jpg"
        ],
        "all_images": [
            "https://s3.amazonaws.com/bucket/existing_image1.jpg",
            "https://s3.amazonaws.com/bucket/new_image1.jpg"
        ]
    }
}
```

#### Update Car Images (After Presigned Upload)
```http
POST /v1/update-car-images
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Request Body:**
```json
{
    "chassisNo": "ABC123",
    "keys": [
        "cars/ABC123/image1.jpg",
        "cars/ABC123/image2.jpg"
    ]
}
```
**Response:**
```json
{
    "message": "Car images updated successfully",
    "data": {
        "chassisNo": "ABC123",
        "images": [
            "https://s3.amazonaws.com/bucket/cars/ABC123/image1.jpg",
            "https://s3.amazonaws.com/bucket/cars/ABC123/image2.jpg"
        ]
    }
}
```

#### Generate Car Image Presigned URLs
```http
POST /v1/generate-car-image-presigned-urls
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Request Body:**
```json
{
    "chassisNo": "ABC123",
    "files": [
        {
            "fileName": "image1.jpg",
            "contentType": "image/jpeg"
        }
    ]
}
```
**Response:**
```json
{
    "message": "Presigned URLs generated successfully",
    "data": {
        "chassisNo": "ABC123",
        "urls": [
            {
                "fileName": "image1.jpg",
                "key": "cars/ABC123/image1.jpg",
                "presignedUrl": "https://s3.amazonaws.com/..."
            }
        ],
        "expiresIn": "15 minutes",
        "region": "us-east-1"
    }
}
```

#### Migrate Problematic Images
```http
POST /v1/migrate-problematic-images
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Request Body:**
```json
{
    "chassisNo": "ABC#123",
    "dryRun": true
}
```
**Response:**
```json
{
    "message": "Migration preview completed",
    "chassisNo": "ABC#123",
    "sanitizedChassisNo": "ABCHASH123",
    "migrations": [
        {
            "from": "cars/ABC#123/image1.jpg",
            "to": "cars/ABCHASH123/image1.jpg"
        }
    ],
    "errors": [],
    "dryRun": true
}
```

### Staff Management (Admin)

#### Get All Staff
```http
GET /v1/staff
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Query Parameters:**
- `staffId[eq]` - Filter by staff ID
- `name[eq]` - Filter by name
- `email[eq]` - Filter by email
- `branch[eq]` - Filter by branch
- `page` - Page number

**Response:**
```json
{
    "data": [
        {
            "staffId": "STF001",
            "name": "John Smith",
            "email": "john@example.com",
            "phone": "+60123456789",
            "branch": "KL",
            "image": "profile_image_url",
            "created_at": "2023-01-01T00:00:00.000000Z",
            "updated_at": "2023-01-01T00:00:00.000000Z"
        }
    ],
    "currentPage": 1,
    "lastPage": 5
}
```

#### Get Staff by ID
```http
GET /v1/staff/{staff}
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Response:**
```json
{
    "staffId": "STF001",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+60123456789",
    "branch": "KL",
    "image": "profile_image_url",
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z"
}
```

#### Create Staff
```http
POST /v1/staff/register
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Request Body:**
```json
{
    "staffId": "STF001",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+60123456789",
    "branch": "KL",
    "image": "profile_image_url",
    "password": "password123"
}
```
**Response:**
```json
{
    "staffId": "STF001",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+60123456789",
    "branch": "KL",
    "image": "profile_image_url",
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z"
}
```

#### Update Staff
```http
PATCH /v1/staff/update/{staff}
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Request Body:** Same as create staff (partial updates allowed)
**Response:** Updated staff object

#### Delete Staff
```http
DELETE /v1/staff/delete/{staff}
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Response:**
```json
{
    "message": "Staff deleted successfully! Deleted details below:",
    "data": {
        "staffId": "STF001",
        "name": "John Smith",
        "email": "john@example.com"
    }
}
```

#### Get Sold By Selector
```http
GET /v1/sold-selector
```
**Headers:** `Authorization: Bearer {token}` or session-based auth
**Response:**
```json
{
    "data": {
        "staffIds": ["STF001", "STF002", "STF003"],
        "branches": ["JB", "SLGR", "KL", "PPG", "SBH"]
    }
}
```

---

## Master Key Only Endpoints

### Admin Management (Master Only)

#### Get All Admins
```http
GET /v1/admin
```
**Headers:** `Authorization: Bearer {token}` or session-based auth + Master key middleware
**Query Parameters:**
- `adminId[eq]` - Filter by admin ID
- `name[eq]` - Filter by name
- `email[eq]` - Filter by email
- `branch[eq]` - Filter by branch
- `includeCars` - Include related cars
- `page` - Page number

**Response:**
```json
{
    "data": [
        {
            "adminId": "ADM001",
            "name": "Admin User",
            "phone": "+60123456789",
            "email": "admin@example.com",
            "branch": "KL",
            "created_at": "2023-01-01T00:00:00.000000Z",
            "updated_at": "2023-01-01T00:00:00.000000Z"
        }
    ],
    "currentPage": 1,
    "lastPage": 3
}
```

#### Get Admin by ID
```http
GET /v1/admin/{admin}
```
**Headers:** `Authorization: Bearer {token}` or session-based auth + Master key middleware
**Response:**
```json
{
    "adminId": "ADM001",
    "name": "Admin User",
    "phone": "+60123456789",
    "email": "admin@example.com",
    "branch": "KL",
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z"
}
```

#### Create Admin
```http
POST /v1/admin/register
```
**Headers:** `Authorization: Bearer {token}` or session-based auth + Master key middleware
**Request Body:**
```json
{
    "adminId": "ADM001",
    "name": "Admin User",
    "phone": "+60123456789",
    "email": "admin@example.com",
    "branch": "KL",
    "password": "password123"
}
```
**Response:**
```json
{
    "adminId": "ADM001",
    "name": "Admin User",
    "phone": "+60123456789",
    "email": "admin@example.com",
    "branch": "KL",
    "created_at": "2023-01-01T00:00:00.000000Z",
    "updated_at": "2023-01-01T00:00:00.000000Z"
}
```

#### Update Admin
```http
PATCH /v1/admin/update/{admin}
```
**Headers:** `Authorization: Bearer {token}` or session-based auth + Master key middleware
**Request Body:** Same as create admin (partial updates allowed)
**Response:** Updated admin object

#### Delete Admin
```http
DELETE /v1/admin/delete/{adminId}
```
**Headers:** `Authorization: Bearer {token}` or session-based auth + Master key middleware
**Response:**
```json
{
    "message": "Admin deleted successfully! Deleted details below:",
    "data": {
        "adminId": "ADM001",
        "name": "Admin User",
        "email": "admin@example.com"
    }
}
```

**Note:** The MASTER admin account cannot be deleted.

---

## Data Models

### Car Model
```json
{
    "chassisNo": "string (primary key)",
    "brand": "string",
    "model": "string",
    "variant": "string",
    "price": "number",
    "year": "integer",
    "color": "string",
    "transmission": "string",
    "fuelType": "string",
    "mileage": "number",
    "grade": "string",
    "status": "string (In Stock, Sold, In Transit, Maintenance)",
    "condition": "string",
    "features": "array",
    "remarks": "string",
    "branch": "string",
    "soldBy": "string (staffId)",
    "soldAt": "datetime",
    "image": "array (URLs)",
    "public": "string (yes, no)",
    "created_at": "datetime",
    "updated_at": "datetime"
}
```

### Admin Model
```json
{
    "adminId": "string (primary key)",
    "name": "string",
    "phone": "string",
    "email": "string (unique)",
    "branch": "string",
    "password": "string (hashed)",
    "created_at": "datetime",
    "updated_at": "datetime"
}
```

### Staff Model
```json
{
    "staffId": "string (primary key)",
    "name": "string",
    "email": "string (unique)",
    "phone": "string",
    "branch": "string",
    "image": "string (URL)",
    "password": "string (hashed)",
    "created_at": "datetime",
    "updated_at": "datetime"
}
```

---

## Error Responses

### Authentication Errors
```json
{
    "message": "Invalid credentials"
}
```
**Status Code:** 401

### Authorization Errors
```json
{
    "message": "Forbidden. Admins only."
}
```
**Status Code:** 403

### Validation Errors
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "chassisNo": ["The chassis no field is required."],
        "email": ["The email must be a valid email address."]
    }
}
```
**Status Code:** 422

### Not Found Errors
```json
{
    "message": "Car not found"
}
```
**Status Code:** 404

### Server Errors
```json
{
    "message": "Error creating car: Database connection failed"
}
```
**Status Code:** 500

---

## Branch System

The system supports multiple branches:
- **JB** - Johor Bahru
- **SLGR** - Selangor
- **KL** - Kuala Lumpur
- **PPG** - Penang
- **SBH** - Sabah

### Branch Access Rules:
- **Master**: Can access all branches
- **Admin**: Can only access their assigned branch
- **Staff**: Can only access their assigned branch

---

## File Upload Guidelines

### Supported File Types:
- **Images**: JPEG, PNG, JPG, WEBP
- **Documents**: PDF
- **Maximum Size**: 5MB per file

### S3 Storage:
- Images are stored in AWS S3
- URLs are automatically generated
- Images are organized by chassis number in folders
- Special characters in chassis numbers are sanitized for URL safety

---

## Rate Limiting & Security

### CSRF Protection:
- All state-changing operations require CSRF tokens
- Use `/sanctum/csrf-cookie` endpoint to get CSRF cookie

### Session Management:
- Session-based authentication
- Automatic session regeneration on login
- Session invalidation on logout

### Input Validation:
- All inputs are validated using Laravel Form Requests
- File uploads have size and type restrictions
- SQL injection protection through Eloquent ORM

---

## API Versioning

Current API version: **v1**
- All endpoints are prefixed with `/v1/`
- Public endpoints use `/public/` prefix
- Future versions will use `/v2/`, `/v3/`, etc.

---

## Development Notes

### Database:
- Uses SQLite for development
- Primary keys are strings (not auto-incrementing integers)
- Relationships are properly defined between models

### Middleware Stack:
1. **CORS** - Cross-origin resource sharing
2. **CSRF** - Cross-site request forgery protection
3. **Authentication** - Session-based auth
4. **Authorization** - Role-based access control

### Response Format:
- Consistent JSON responses
- Pagination for list endpoints
- Proper HTTP status codes
- Error messages in English

---

This documentation covers all available endpoints and their usage patterns. For additional support or clarification, please refer to the source code or contact the development team.
