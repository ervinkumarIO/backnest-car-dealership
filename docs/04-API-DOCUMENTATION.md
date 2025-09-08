# 📡 API Documentation - Car Dealership Backend

## Base URL
```
Development: http://localhost:3000/api/v1
Production: https://your-domain.com/api/v1
```

## 🔐 Authentication

All protected endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### **POST** `/auth/admin/login`
Login for Admin and Master users.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin",
    "branch": "HQ",
    "is_active": true
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "admin"
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "timestamp": "2024-12-19T10:30:00.000Z",
  "path": "/auth/admin/login"
}
```

#### **POST** `/auth/staff/login`
Login for Staff users.

**Request Body:**
```json
{
  "email": "staff@example.com", 
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 2,
    "email": "staff@example.com",
    "name": "Staff User",
    "role": "sales",
    "department": "sales",
    "branch": "Branch1",
    "is_active": true
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "staff"
}
```

#### **GET** `/auth/profile`
Get current authenticated user profile.

**Headers Required:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": 1,
  "email": "admin@example.com",
  "name": "Admin User", 
  "role": "admin",
  "branch": "HQ",
  "userType": "admin"
}
```

## 👥 Admin Management (Master Only)

All admin management endpoints require **Master** role access.

#### **GET** `/admin/admins`
List all admin users with pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin", 
      "branch": "HQ",
      "is_active": true,
      "phone": "+1234567890",
      "created_at": "2024-12-19T10:30:00.000Z",
      "updated_at": "2024-12-19T10:30:00.000Z"
    }
  ],
  "total": 5,
  "currentPage": 1,
  "lastPage": 1
}
```

#### **POST** `/admin/admins`
Create a new admin user.

**Request Body:**
```json
{
  "email": "newadmin@example.com",
  "password": "securepassword123",
  "name": "New Admin",
  "role": "admin",
  "branch": "Branch2",
  "phone": "+1234567890"
}
```

**Validation Rules:**
- `email`: Valid email format, unique
- `password`: Minimum 6 characters
- `name`: Required string
- `role`: "admin" or "master"
- `branch`: Required string
- `phone`: Optional string

**Response (201):**
```json
{
  "id": 6,
  "email": "newadmin@example.com",
  "name": "New Admin",
  "role": "admin",
  "branch": "Branch2",
  "is_active": true,
  "phone": "+1234567890",
  "created_at": "2024-12-19T10:30:00.000Z",
  "updated_at": "2024-12-19T10:30:00.000Z"
}
```

#### **GET** `/admin/admins/:id`
Get specific admin by ID.

**Response:**
```json
{
  "id": 1,
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "admin",
  "branch": "HQ",
  "is_active": true,
  "phone": "+1234567890",
  "created_at": "2024-12-19T10:30:00.000Z",
  "updated_at": "2024-12-19T10:30:00.000Z"
}
```

#### **PATCH** `/admin/admins/:id`
Update admin user.

**Request Body (partial update):**
```json
{
  "name": "Updated Admin Name",
  "phone": "+0987654321",
  "is_active": false
}
```

#### **DELETE** `/admin/admins/:id`
Delete admin user.

**Response:**
```json
{
  "message": "Admin deleted successfully! Deleted details below:",
  "data": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User"
  }
}
```

## 👨‍💼 Staff Management (Admin+ Access)

Staff management with branch-based filtering.

#### **GET** `/admin/staff`
List staff users (branch-filtered for Admins).

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Branch Filtering Logic:**
- **Master users**: See all staff from all branches
- **Admin users**: See only staff from same branch

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "email": "staff@example.com",
      "name": "Staff User",
      "role": "sales",
      "department": "sales", 
      "branch": "Branch1",
      "is_active": true,
      "phone": "+1234567890",
      "created_at": "2024-12-19T10:30:00.000Z"
    }
  ],
  "total": 3,
  "currentPage": 1,
  "lastPage": 1
}
```

#### **POST** `/admin/staff`
Create new staff member.

**Request Body:**
```json
{
  "email": "newstaff@example.com",
  "password": "password123",
  "name": "New Staff",
  "role": "sales",
  "department": "sales",
  "branch": "Branch1",
  "phone": "+1234567890"
}
```

**Role Options:**
- `manager`: Department manager
- `sales`: Sales representative  
- `support`: Customer support

**Department Options:**
- `sales`: Sales department
- `marketing`: Marketing department
- `finance`: Finance department
- `support`: Support department

#### **GET** `/admin/staff/sold-by-selector`
Get staff IDs and branches for dropdown selectors.

**Response:**
```json
{
  "data": {
    "staffIds": ["1", "2", "3", "4"],
    "branches": ["JB", "SLGR", "KL", "PPG", "SBH"]
  }
}
```

#### **GET** `/admin/staff/:id`
Get specific staff member (branch authorization applied).

#### **PATCH** `/admin/staff/:id`
Update staff member (branch authorization applied).

#### **DELETE** `/admin/staff/:id`
Delete staff member (branch authorization applied).

## 🚗 Car Management (Admin+ Access)

Comprehensive car inventory management.

#### **GET** `/cars`
List all cars with advanced filtering and pagination.

**Query Parameters:**
- `search` (string): Search brand, model, variant, chassisNo
- `sortBy` (string): Sort field (year, price, mileage)
- `sortOrder` (string): Sort order (asc, desc)
- `perPage` (number): Items per page (default: 21)
- `page` (number): Page number (default: 1)
- Dynamic filters: `brand=Toyota`, `status=In Stock`, etc.

**Response:**
```json
{
  "data": [
    {
      "chassisNo": "ABC123456789",
      "brand": "Toyota",
      "model": "Camry",
      "variant": "2.5L Hybrid",
      "price": 35000,
      "year": 2024,
      "color": "Silver",
      "transmission": "Automatic",
      "fuelType": "Hybrid",
      "mileage": 15000,
      "grade": "A",
      "status": "In Stock",
      "condition": "Used",
      "features": ["ABS", "Airbags", "GPS"],
      "remarks": "Excellent condition",
      "branch": "HQ",
      "soldBy": null,
      "soldAt": null,
      "image": ["https://bucket.s3.amazonaws.com/image1.jpg"],
      "public": "yes",
      "created_at": "2024-12-19T10:30:00.000Z",
      "updated_at": "2024-12-19T10:30:00.000Z"
    }
  ],
  "currentPage": 1,
  "lastPage": 5,
  "perPage": 21,
  "total": 100
}
```

#### **GET** `/cars/listing` 
Simplified car listing (admin dashboard view).

**Response includes selected fields only:**
```json
{
  "data": [
    {
      "chassisNo": "ABC123456789",
      "brand": "Toyota",
      "model": "Camry",
      "variant": "2.5L Hybrid", 
      "price": 35000,
      "year": 2024,
      "status": "In Stock",
      "condition": "Used",
      "created_at": "2024-12-19T10:30:00.000Z",
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

#### **GET** `/cars/stats`
Car inventory statistics.

**Response:**
```json
{
  "totalCars": 150,
  "totalSoldCars": 45,
  "totalAvailableCars": 105
}
```

#### **GET** `/cars/search?q=toyota`
Quick car search (limited to 20 results).

**Response:**
```json
{
  "count": 5,
  "results": [
    {
      "chassisNo": "ABC123456789",
      "brand": "Toyota",
      "model": "Camry", 
      "variant": "2.5L Hybrid",
      "price": 35000
    }
  ]
}
```

#### **GET** `/cars/facets`
Get filtering facets for advanced search.

**Response:**
```json
{
  "chassis_numbers": ["ABC123", "DEF456", "GHI789"],
  "facets": {
    "brand": {
      "Toyota": 25,
      "Honda": 20,
      "Ford": 15
    },
    "model": {
      "Camry": 12,
      "Accord": 10,
      "Focus": 8
    },
    "condition": {
      "Used": 45,
      "New": 30,
      "Certified": 25
    }
  }
}
```

#### **POST** `/cars/store-new`
Create new car entry.

**Request Body:**
```json
{
  "chassisNo": "NEW123456789",
  "brand": "Toyota",
  "model": "Camry",
  "variant": "2.5L Hybrid",
  "price": 35000,
  "year": 2024,
  "color": "Silver",
  "transmission": "Automatic",
  "fuelType": "Hybrid",
  "mileage": 0,
  "grade": "A",
  "status": "In Stock",
  "condition": "New",
  "features": ["ABS", "Airbags", "GPS"],
  "remarks": "Brand new vehicle",
  "branch": "HQ",
  "public": "no"
}
```

**Validation Rules:**
- `chassisNo`: Required, unique
- `price`: Positive number
- `year`: 1900 to current year + 1
- `mileage`: Non-negative number
- `public`: "yes" or "no"

#### **GET** `/cars/:chassisNo`
Get specific car by chassis number.

#### **PATCH** `/cars/:chassisNo`
Update car information.

#### **DELETE** `/cars/:chassisNo`
Delete car from inventory.

## 🔄 Bulk Operations

#### **POST** `/cars/bulk`
Bulk create multiple cars.

**Request Body:**
```json
[
  {
    "chassisNo": "BULK001",
    "brand": "Toyota",
    "model": "Corolla",
    "variant": "1.8L",
    "price": 25000,
    "year": 2024,
    "color": "White",
    "transmission": "Manual",
    "fuelType": "Petrol",
    "mileage": 0,
    "grade": "B",
    "status": "In Stock", 
    "condition": "New",
    "features": ["ABS"],
    "branch": "HQ"
  }
]
```

#### **PATCH** `/cars/bulk/price`
Bulk update car prices.

**Request Body:**
```json
{
  "action": "increase",
  "amount": 5000,
  "chassisNo": ["ABC123", "DEF456", "GHI789"]
}
```

**Actions:**
- `increase`: Add amount to current price
- `decrease`: Subtract amount from current price (minimum 0)

#### **PATCH** `/cars/bulk/status`
Bulk update car status.

**Request Body:**
```json
{
  "status": "Sold",
  "chassisNo": ["ABC123", "DEF456"]
}
```

#### **PATCH** `/cars/bulk/public`
Bulk update public visibility.

**Request Body:**
```json
{
  "public": "yes",
  "chassisNo": ["ABC123", "DEF456"]
}
```

#### **DELETE** `/cars/bulk`
Bulk delete cars.

**Request Body:**
```json
{
  "chassisNo": ["ABC123", "DEF456", "GHI789"]
}
```

## 📸 Car Image Management

#### **POST** `/cars/images/upload`
Upload car images (grouped by chassis number from filename).

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `car_image`
- File naming: `{chassisNo}_{description}.jpg`

**Example files:**
- `ABC123_front.jpg`
- `ABC123_interior.jpg`

**Response:**
```json
{
  "message": "Images uploaded and linked to cars successfully!",
  "data": {
    "ABC123": [
      "https://bucket.s3.amazonaws.com/car-images/1234567890_ABC123_front.jpg",
      "https://bucket.s3.amazonaws.com/car-images/1234567890_ABC123_interior.jpg"
    ]
  }
}
```

#### **POST** `/cars/images/presigned-urls`
Generate presigned URLs for direct S3 upload.

**Request Body:**
```json
{
  "files": [
    {
      "fileName": "car_image.jpg",
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
        "fileName": "car_image.jpg",
        "key": "car-images/1234567890_car_image.jpg",
        "presignedUrl": "https://bucket.s3.amazonaws.com/..."
      }
    ],
    "expiresIn": "15 minutes",
    "region": "us-west-2"
  }
}
```

#### **POST** `/cars/images/car-presigned-urls`
Generate presigned URLs with chassis number organization.

**Request Body:**
```json
{
  "chassisNo": "ABC123",
  "files": [
    {
      "fileName": "front_view.jpg",
      "contentType": "image/jpeg"
    }
  ]
}
```

#### **POST** `/cars/images/update-car-images`
Update car's image URLs after successful upload.

**Request Body:**
```json
{
  "chassisNo": "ABC123",
  "keys": ["cars/ABC123/front_view.jpg", "cars/ABC123/interior.jpg"]
}
```

#### **DELETE** `/cars/images/:chassisNo/images`
Delete specific images from a car.

**Request Body:**
```json
{
  "imageUrls": [
    "https://bucket.s3.amazonaws.com/car-images/image1.jpg",
    "https://bucket.s3.amazonaws.com/car-images/image2.jpg"
  ]
}
```

#### **POST** `/cars/images/:chassisNo/add`
Add new images to existing car.

**Request:**
- Content-Type: `multipart/form-data`  
- Field name: `car_image`

## 🌐 Public API (No Authentication)

Public-facing endpoints for website visitors.

#### **GET** `/public/cars`
Browse public cars (public=yes, status=In Stock).

**Query Parameters:**
- `search` (string): Search term
- `sortBy` (string): year, price, mileage
- `sortOrder` (string): asc, desc
- `perPage` (number): Items per page (default: 21)
- `page` (number): Page number
- Filter parameters: `brand`, `model`, `condition`, etc.

**Response:**
```json
{
  "data": [
    {
      "chassisNo": "PUB123456789",
      "brand": "Toyota", 
      "model": "Camry",
      "variant": "2.5L Hybrid",
      "price": 35000,
      "year": 2024,
      "color": "Silver",
      "transmission": "Automatic",
      "fuelType": "Hybrid",
      "mileage": 15000,
      "condition": "Used",
      "features": ["ABS", "Airbags", "GPS"],
      "image": ["https://bucket.s3.amazonaws.com/image1.jpg"],
      "created_at": "2024-12-19T10:30:00.000Z"
    }
  ],
  "currentPage": 1,
  "lastPage": 5,
  "total": 45
}
```

#### **GET** `/public/cars/best`
Get best cars (top 4 by price).

**Response:**
```json
{
  "data": [
    {
      "chassisNo": "BEST123456789",
      "brand": "Mercedes",
      "model": "S-Class", 
      "price": 85000,
      "year": 2024,
      "image": ["https://bucket.s3.amazonaws.com/luxury_car.jpg"]
    }
  ]
}
```

#### **GET** `/public/cars/search?search=toyota`
Search public cars.

**Response:**
```json
{
  "count": 8,
  "results": [
    {
      "chassisNo": "TOY123456789",
      "brand": "Toyota",
      "model": "Camry",
      "price": 35000
    }
  ]
}
```

#### **GET** `/public/cars/facets`
Get public car facets (only public cars).

#### **GET** `/public/cars/:chassisNo`
Get specific public car details.

**Returns 404 if:**
- Car doesn't exist
- Car is not public (public !== 'yes')
- Car is not in stock (status !== 'In Stock')

## 📝 Error Responses

### Standard Error Format
```json
{
  "statusCode": 400,
  "timestamp": "2024-12-19T10:30:00.000Z",
  "path": "/api/v1/cars",
  "method": "POST",
  "message": "Validation failed"
}
```

### Common HTTP Status Codes

- **200 OK**: Successful GET, PATCH requests
- **201 Created**: Successful POST requests
- **400 Bad Request**: Validation errors, malformed requests
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **422 Unprocessable Entity**: Business logic validation errors
- **429 Too Many Requests**: Rate limiting exceeded
- **500 Internal Server Error**: Server-side errors

### Validation Error Example
```json
{
  "statusCode": 400,
  "message": [
    "Email must be a valid email address",
    "Password must be at least 6 characters long"
  ],
  "timestamp": "2024-12-19T10:30:00.000Z",
  "path": "/auth/admin/login"
}
```

This API provides comprehensive functionality for managing a car dealership with proper authentication, authorization, and data validation. 