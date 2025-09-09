# 🚀 Car Dealership Backend - Production API Documentation

## 📍 **Base URL**
```
https://car-dealership-app-lxxmj.ondigitalocean.app
```

## 🔧 **API Endpoints Structure**

All API endpoints follow this pattern:
```
https://car-dealership-app-lxxmj.ondigitalocean.app/api/v1/{endpoint}
```

---

## 📋 **Table of Contents**
1. [System Routes](#system-routes)
2. [Public Routes (No Authentication)](#public-routes-no-authentication)
3. [Authentication Routes](#authentication-routes)
4. [Protected Routes (JWT Required)](#protected-routes-jwt-required)
5. [Authentication Headers](#authentication-headers)
6. [Sample Payloads](#sample-payloads)
7. [Error Responses](#error-responses)

---

## 🔍 **System Routes**

### Root Information
- **GET** `/`
- **GET** `/api/v1`
- **Description**: Get API information and available endpoints
- **Authentication**: None
- **Response**:
```json
{
  "message": "Car Dealership Backend API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "api": "/api/v1",
    "health": "/api/v1/health",
    "database": "/api/v1/public/database/status",
    "auth": "/api/v1/auth/login",
    "cars": "/api/v1/cars",
    "public": "/api/v1/public/cars"
  }
}
```

### Health Check
- **GET** `/api/v1/health`
- **GET** `/health`
- **Description**: Check API health status
- **Authentication**: None
- **Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-09-08T20:45:24.153Z",
  "uptime": 221.656013695
}
```

### Test Route
- **GET** `/api/v1/test`
- **Description**: Simple test endpoint
- **Authentication**: None
- **Response**:
```json
{
  "message": "Test route working",
  "timestamp": "2025-09-08T20:45:25.065Z"
}
```

---

## 🌍 **Public Routes (No Authentication)**

### Database Management

#### Database Status
- **GET** `/api/v1/public/database/status`
- **Description**: Check database connection status
- **Response**:
```json
{
  "message": "Database connection successful",
  "timestamp": "2025-09-08T20:45:24.153Z"
}
```

#### Database Setup
- **POST** `/api/v1/public/database/setup`
- **Description**: Initialize database with sample data (run once)
- **Response**:
```json
{
  "message": "Database setup completed successfully",
  "timestamp": "2025-09-08T20:45:24.153Z"
}
```

#### Database Migration
- **POST** `/api/v1/public/database/migrate`
- **Description**: Run database migrations
- **Response**:
```json
{
  "message": "Database migration completed successfully",
  "timestamp": "2025-09-08T20:45:24.153Z"
}
```

### Public Car Listings

#### Get Best Cars
- **GET** `/api/v1/public/cars/best`
- **Description**: Get top 4 cars by price for homepage
- **Response**:
```json
{
  "data": [
    {
      "chassisNo": "ABC123",
      "brand": "Toyota",
      "model": "Camry",
      "variant": "2.5L Hybrid",
      "price": 150000,
      "year": 2023,
      "color": "White",
      "transmission": "Automatic",
      "fuelType": "Hybrid",
      "mileage": 5000,
      "image": []
    }
  ]
}
```

#### Get All Public Cars
- **GET** `/api/v1/public/cars`
- **Query Parameters**:
  - `search` (optional): Search term
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
- **Example**: `/api/v1/public/cars?search=toyota&page=1&limit=10`
- **Response**:
```json
{
  "data": [...],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

#### Public Car Search
- **GET** `/api/v1/public/cars/search`
- **Query Parameters**: `search` (required)
- **Description**: Search public cars
- **Example**: `/api/v1/public/cars/search?search=toyota`

#### Get Public Facets
- **GET** `/api/v1/public/cars/facets`
- **Description**: Get filtering facets for public cars
- **Response**:
```json
{
  "chassis_numbers": ["ABC123", "DEF456"],
  "facets": {
    "brands": ["Toyota", "Honda"],
    "models": ["Camry", "Civic"],
    "years": [2023, 2022],
    "colors": ["White", "Black"]
  }
}
```

#### Get Single Public Car
- **GET** `/api/v1/public/cars/{chassisNo}`
- **Description**: Get detailed car information (only public cars)
- **Example**: `/api/v1/public/cars/ABC123`

---

## 🔐 **Authentication Routes**

### Login
- **POST** `/api/v1/auth/login`
- **Description**: Single login endpoint for both admin and staff (automatically detects user type)
- **Request Body**:
```json
{
  "email": "master@dealership.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "user": {
    "adminId": "MASTER",
    "name": "Master Admin",
    "email": "master@dealership.com",
    "branch": "KL"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "MASTER"
}
```

### User Profile
- **GET** `/api/v1/auth/profile`
- **Description**: Get current user profile (works for both admin and staff)
- **Authentication**: JWT Required
- **Headers**: `Authorization: Bearer {token}`

### Current User Info
- **GET** `/api/v1/auth/me`
- **Description**: Get current user info in frontend-compatible format
- **Authentication**: JWT Required
- **Response**:
```json
{
  "role": "MASTER",
  "user": {
    "adminId": "MASTER",
    "staffId": null,
    "name": "Master Admin",
    "email": "master@dealership.com",
    "phone": "+60123456789",
    "branch": "KL"
  }
}
```

### Logout
- **POST** `/api/v1/auth/logout`
- **Description**: Logout current user (client-side token removal)
- **Authentication**: JWT Required

---

## 🔒 **Protected Routes (JWT Required)**

### Car Management

#### Get Car Listing (Admin View)
- **GET** `/api/v1/cars/listing`
- **Query Parameters**:
  - `search` (optional): Search term
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
- **Authentication**: JWT Required
- **Roles**: Admin, Staff

#### Get All Cars (Full Data)
- **GET** `/api/v1/cars`
- **Query Parameters**: Same as listing
- **Authentication**: JWT Required (Admin Only)

#### Get Car Statistics
- **GET** `/api/v1/cars/stats`
- **Authentication**: JWT Required (Admin Only)
- **Response**:
```json
{
  "total": 150,
  "inStock": 120,
  "sold": 30,
  "averagePrice": 125000
}
```

#### Create New Car
- **POST** `/api/v1/cars/store-new`
- **POST** `/api/v1/cars/create`
- **Authentication**: JWT Required (Admin Only)
- **Request Body**:
```json
{
  "chassisNo": "XYZ789",
  "brand": "Honda",
  "model": "Civic",
  "variant": "1.5L Turbo",
  "price": 120000,
  "year": 2023,
  "color": "Black",
  "transmission": "CVT",
  "fuelType": "Petrol",
  "mileage": 15000,
  "grade": "A",
  "status": "In Stock",
  "condition": "Excellent",
  "features": ["GPS", "Bluetooth", "Backup Camera"],
  "remarks": "Well maintained",
  "branch": "KL",
  "public": "yes"
}
```

#### Get Single Car (Admin View)
- **GET** `/api/v1/cars/{chassisNo}`
- **Authentication**: JWT Required

#### Update Car
- **PATCH** `/api/v1/cars/{chassisNo}`
- **Authentication**: JWT Required (Admin Only)

#### Delete Car
- **DELETE** `/api/v1/cars/{chassisNo}`
- **Authentication**: JWT Required (Admin Only)

#### Search Cars (Admin)
- **GET** `/api/v1/cars/search`
- **Query Parameters**: `search`, `page`, `limit`
- **Authentication**: JWT Required

#### Bulk Operations
- **PATCH** `/api/v1/cars/bulk-update-price`
- **PATCH** `/api/v1/cars/bulk-update-status`
- **PATCH** `/api/v1/cars/bulk-update-public`
- **DELETE** `/api/v1/cars/bulk-delete`
- **Authentication**: JWT Required (Admin Only)

### Car Images

#### Upload Car Images
- **POST** `/api/v1/cars/images/{chassisNo}/upload`
- **Content-Type**: `multipart/form-data`
- **Authentication**: JWT Required (Admin Only)
- **Form Data**: `images` (multiple files)

#### Delete Car Image
- **DELETE** `/api/v1/cars/images/{chassisNo}/{imageIndex}`
- **Authentication**: JWT Required (Admin Only)

### Staff Management

#### Get All Staff
- **GET** `/api/v1/staff`
- **Query Parameters**: `page`, `limit`
- **Authentication**: JWT Required (Admin Only)

#### Create Staff
- **POST** `/api/v1/staff`
- **Authentication**: JWT Required (Admin Only)
- **Request Body**:
```json
{
  "staffId": "STF005",
  "name": "John Doe",
  "email": "john@dealership.com",
  "phone": "+60123456789",
  "branch": "KL",
  "password": "password123"
}
```

#### Get Single Staff
- **GET** `/api/v1/staff/{staffId}`
- **Authentication**: JWT Required (Admin Only)

#### Update Staff
- **PATCH** `/api/v1/staff/{staffId}`
- **Authentication**: JWT Required (Admin Only)

#### Delete Staff
- **DELETE** `/api/v1/staff/{staffId}`
- **Authentication**: JWT Required (Admin Only)

#### Get Sold By Selector
- **GET** `/api/v1/staff/sold-by-selector`
- **Description**: Get staff list for dropdown/selector
- **Authentication**: JWT Required (Admin Only)

### Admin Management

#### Get All Admins
- **GET** `/api/v1/admin/admins`
- **Query Parameters**: `page`, `limit`
- **Authentication**: JWT Required (Master Only)

#### Create Admin
- **POST** `/api/v1/admin/admins`
- **Authentication**: JWT Required (Master Only)
- **Request Body**:
```json
{
  "adminId": "ADM005",
  "name": "Jane Admin",
  "email": "jane@dealership.com",
  "phone": "+60123456789",
  "branch": "KL",
  "password": "password123"
}
```

#### Get Single Admin
- **GET** `/api/v1/admin/admins/{adminId}`
- **Authentication**: JWT Required (Master Only)

#### Update Admin
- **PATCH** `/api/v1/admin/admins/{adminId}`
- **Authentication**: JWT Required (Master Only)

#### Delete Admin
- **DELETE** `/api/v1/admin/admins/{adminId}`
- **Authentication**: JWT Required (Master Only)

---

## 🔑 **Authentication Headers**

For all protected routes, include the JWT token in the request headers:

```javascript
headers: {
  'Authorization': 'Bearer ' + token,
  'Content-Type': 'application/json'
}
```

---

## 📝 **Sample Payloads**

### Login Credentials (Seeded Data)
```json
{
  "master": {
    "email": "master@dealership.com",
    "password": "password123"
  },
  "admin": {
    "email": "admin.kl@dealership.com",
    "password": "password123"
  },
  "staff": {
    "email": "john.sales@dealership.com",
    "password": "password123"
  }
}
```

### Create Car Payload
```json
{
  "chassisNo": "ABC123",
  "brand": "Toyota",
  "model": "Camry",
  "variant": "2.5L Hybrid",
  "price": 150000,
  "year": 2023,
  "color": "White",
  "transmission": "Automatic",
  "fuelType": "Hybrid",
  "mileage": 5000,
  "grade": "A",
  "status": "In Stock",
  "condition": "Excellent",
  "features": ["GPS", "Bluetooth", "Sunroof"],
  "remarks": "Well maintained, single owner",
  "branch": "KL",
  "public": "yes"
}
```

### Update Car Payload
```json
{
  "price": 140000,
  "mileage": 6000,
  "condition": "Good",
  "remarks": "Price reduced"
}
```

### Bulk Update Price Payload
```json
{
  "chassisNos": ["ABC123", "DEF456"],
  "price": 130000
}
```

### Bulk Update Status Payload
```json
{
  "chassisNos": ["ABC123", "DEF456"],
  "status": "Sold"
}
```

### Bulk Update Public Payload
```json
{
  "chassisNos": ["ABC123", "DEF456"],
  "public": "no"
}
```

### Bulk Delete Payload
```json
{
  "chassisNos": ["ABC123", "DEF456"]
}
```

---

## ❌ **Error Responses**

### 400 Bad Request
```json
{
  "statusCode": 400,
  "timestamp": "2025-09-08T20:45:24.153Z",
  "path": "/api/v1/cars",
  "method": "POST",
  "message": "Validation failed",
  "errors": [
    "chassisNo should not be empty",
    "price must be a positive number"
  ]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "timestamp": "2025-09-08T20:45:24.153Z",
  "path": "/api/v1/cars",
  "method": "GET",
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "timestamp": "2025-09-08T20:45:24.153Z",
  "path": "/api/v1/admin/admins",
  "method": "GET",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "timestamp": "2025-09-08T20:45:24.153Z",
  "path": "/api/v1/cars/INVALID123",
  "method": "GET",
  "message": "Car not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "timestamp": "2025-09-08T20:45:24.153Z",
  "path": "/api/v1/cars",
  "method": "GET",
  "message": "Internal server error"
}
```

---

## 🔐 **Role-Based Access Control**

### Master Admin
- Full access to all endpoints
- Can manage admins, staff, and cars
- Can perform all CRUD operations

### Admin
- Can manage staff and cars
- Cannot manage other admins
- Can perform most CRUD operations

### Staff
- Limited access to car listings
- Can view assigned cars
- Cannot perform administrative functions

---

## 📊 **Response Pagination**

For paginated endpoints, responses follow this structure:

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

---

## 🚀 **Getting Started**

### 1. Initialize Database (First Time Only)
```bash
POST https://car-dealership-app-lxxmj.ondigitalocean.app/api/v1/public/database/setup
```

### 2. Login as Master Admin
```bash
POST https://car-dealership-app-lxxmj.ondigitalocean.app/api/v1/auth/login
Content-Type: application/json

{
  "email": "master@dealership.com",
  "password": "password123"
}
```

### 3. Use JWT Token for Protected Routes
```bash
GET https://car-dealership-app-lxxmj.ondigitalocean.app/api/v1/cars/listing
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## 📱 **Frontend Integration Notes**

### Environment Variables
```javascript
// .env
VITE_API_BASE_URL=https://car-dealership-app-lxxmj.ondigitalocean.app
VITE_API_VERSION=v1
```

### API Service Example
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Login
const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return response.json();
};

// Get public cars
const getPublicCars = async () => {
  const response = await fetch(`${API_BASE_URL}/api/v1/public/cars`);
  return response.json();
};

// Authenticated API call
const getCarListing = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/cars/listing`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

---

## ✅ **Testing Checklist**

- [ ] Database setup endpoint works
- [ ] Login with email/password returns JWT token
- [ ] Public car listings accessible without auth
- [ ] Protected routes require valid JWT
- [ ] Car CRUD operations work for admins
- [ ] Staff management works for admins
- [ ] Image upload functionality works
- [ ] Search and pagination work correctly
- [ ] Error handling returns proper status codes

---

**🎉 Your Car Dealership Backend API is now live and ready for frontend integration!**

Base URL: `https://car-dealership-app-lxxmj.ondigitalocean.app`