# 🚗 Car Dealership Backend API Reference

## Base URL
```
http://localhost:3000/api/v1
```

## 🚀 Quick Reference (Most Used Endpoints)

### Dashboard Table (Primary Frontend Integration)
```http
# Load dashboard data
GET /cars/listing?page=1&perPage=25

# Load dashboard statistics  
GET /cars/stats

# Search & filter
GET /cars/listing?search=toyota&status[eq]=In Stock&sortBy=price&sortOrder=desc

# Bulk operations
PATCH /cars/bulk/status
PATCH /cars/bulk/price  
DELETE /cars/bulk
```

### Authentication
```http
# Unified login (auto-detects Admin/Staff/MASTER)
POST /auth/login
```

### Image Management
```http
# Direct upload
POST /cars/images/add-images/{chassisNo}

# S3 presigned workflow
POST /cars/images/generate-car-image-presigned-urls
POST /cars/images/update-car-images
```

## Authentication
All protected endpoints require a JWT Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Default Test Credentials
```json
{
  "master": {
    "email": "master@dealership.com",
    "password": "password123"
  },
  "admin": {
    "email": "admin@dealership.com", 
    "password": "password123"
  },
  "staff": {
    "email": "staff@dealership.com",
    "password": "password123"
  }
}
```

---

## 🔐 Authentication Endpoints

### Unified Login (Auto-detects Admin/Staff/MASTER)
```http
POST /auth/login
Content-Type: application/json

{
  "email": "master@dealership.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "adminId": "MASTER",
    "email": "master@dealership.com",
    "name": "Master Admin",
    "role": "MASTER"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "admin"
}
```

### Login (Admin Only)
```http
POST /auth/admin/login
Content-Type: application/json

{
  "email": "admin@dealership.com",
  "password": "password123"
}
```

### Login (Staff Only)
```http
POST /auth/staff/login
Content-Type: application/json

{
  "email": "staff@dealership.com",
  "password": "password123"
}
```

### Get Current User Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Get Current User Info
```http
GET /auth/me
Authorization: Bearer <token>
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

---

## 🚗 Car Management Endpoints

### 📊 Dashboard Car Listing (Enhanced)
```http
GET /cars/listing
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `search` - Text search across brand, model, variant, chassisNo, color
- `status[eq]` or `status` - Filter by status (In Stock, Sold, On Order, In Transit, Reserved)
- `condition[eq]` or `condition` - Filter by condition (New, Used, Certified Pre-Owned, Recon)
- `sortBy` - Sort field (year, price, created_at, chassisNo)
- `sortOrder` - Sort direction (asc, desc)
- `page` - Page number (default: 1)
- `perPage` - Items per page (default: 10)

**Example Request:**
```http
GET /cars/listing?search=toyota&status[eq]=In Stock&sortBy=price&sortOrder=desc&page=1&perPage=25
Authorization: Bearer <admin_token>
```

**Response:**
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

### 📈 Dashboard Statistics
```http
GET /cars/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "totalCars": 125,
  "totalSoldCars": 45,
  "totalAvailableCars": 80
}
```

### Get All Cars (Full Data - Admin Only)
```http
GET /cars
Authorization: Bearer <admin_token>
Query Parameters: ?page=1&limit=10&search=term&status=In Stock&public=yes
```

### Search Cars
```http
GET /cars/search?q=searchTerm
Authorization: Bearer <admin_token>
```

### Get Car Facets (Filter Options)
```http
GET /cars/facets
Authorization: Bearer <admin_token>
```

### Get Single Car
```http
GET /cars/{chassisNo}
Authorization: Bearer <admin_token>
```

### Create New Car
```http
POST /cars/store-new
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "chassisNo": "ABC123",
  "make": "Toyota",
  "model": "Camry",
  "year": 2023,
  "price": 25000,
  "status": "In Stock",
  "public": "yes"
}
```

### Create New Car (Alternative)
```http
POST /cars/create
Authorization: Bearer <admin_token>
Content-Type: application/json
```

### Update Car
```http
PATCH /cars/{chassisNo}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "price": 26000,
  "status": "Sold"
}
```

### Delete Car
```http
DELETE /cars/{chassisNo}
Authorization: Bearer <admin_token>
```

### ⚡ Bulk Operations (Dashboard Compatible)

#### Bulk Store Cars
```http
POST /cars/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

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

#### Bulk Update Prices (Dashboard Compatible)
```http
PATCH /cars/bulk/price
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "chassisNumbers": ["ABC123", "DEF456", "GHI789"],
  "price": 5000
}
```

**Price Adjustment Logic:**
- **Positive value**: Increases price by the specified amount
- **Negative value**: Decreases price by the specified amount

**Response:**
```json
{
  "message": "Prices updated successfully",
  "updatedCount": 3
}
```

#### Bulk Update Status (Dashboard Compatible)
```http
PATCH /cars/bulk/status
Authorization: Bearer <admin_token>
Content-Type: application/json

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

**Response:**
```json
{
  "message": "Status updated successfully",
  "updatedCount": 3
}
```

#### Bulk Update Public Visibility (Dashboard Compatible)
```http
PATCH /cars/bulk/public
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "chassisNumbers": ["ABC123", "DEF456", "GHI789"],
  "public": "yes"
}
```

**Public Visibility Options:**
- `"yes"` - Car is visible to public customers
- `"no"` - Car is only visible to internal staff

**Response:**
```json
{
  "message": "Public visibility updated successfully",
  "updatedCount": 3
}
```

#### Bulk Delete Cars (Dashboard Compatible)
```http
DELETE /cars/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "chassisNumbers": ["ABC123", "DEF456", "GHI789"]
}
```

**Response:**
```json
{
  "message": "Cars deleted successfully",
  "deletedCount": 3
}
```

---

## 📊 Dashboard Table API (Frontend Integration)

### Complete Dashboard Workflow

#### 1. Load Dashboard Data
```http
GET /cars/listing?page=1&perPage=25
Authorization: Bearer <admin_token>
```

#### 2. Load Dashboard Statistics
```http
GET /cars/stats
Authorization: Bearer <admin_token>
```

#### 3. Search & Filter
```http
GET /cars/listing?search=toyota&status[eq]=In Stock&condition[eq]=New&sortBy=price&sortOrder=desc
Authorization: Bearer <admin_token>
```

#### 4. Bulk Operations
```http
# Bulk Status Update
PATCH /cars/bulk/status
Authorization: Bearer <admin_token>
Content-Type: application/json
{
  "chassisNumbers": ["ABC123", "DEF456"],
  "status": "Sold"
}

# Bulk Price Adjustment
PATCH /cars/bulk/price
Authorization: Bearer <admin_token>
Content-Type: application/json
{
  "chassisNumbers": ["ABC123", "DEF456"],
  "price": 3000
}

# Bulk Delete
DELETE /cars/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json
{
  "chassisNumbers": ["ABC123", "DEF456"]
}
```

### Dashboard Table Features Supported
- ✅ **Pagination**: `page` and `perPage` parameters
- ✅ **Search**: Text search across multiple fields
- ✅ **Filtering**: By status, condition, and other fields
- ✅ **Sorting**: By year, price, created_at, chassisNo
- ✅ **Bulk Selection**: Individual and bulk operations
- ✅ **Statistics**: Real-time dashboard stats
- ✅ **Real-time Updates**: Optimistic UI updates with rollback

---

## 📸 Image Management Endpoints

### Direct Upload (Multiple Cars)
```http
POST /cars/images/upload
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Body (form-data):
- car_image: [Select multiple image files named like "ABC123_1.jpg"]
```

### Add Images to Specific Car (Laravel Compatible)
```http
POST /cars/images/add-images/{chassisNo}
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Body (form-data):
- car_image: [Select image files]
```

### Add Images to Specific Car (Alternative)
```http
POST /cars/images/{chassisNo}/add
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

### Generate Generic Presigned URLs
```http
POST /cars/images/presigned-urls
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "files": [
    {
      "fileName": "test-image.jpg",
      "contentType": "image/jpeg"
    }
  ]
}
```

### Generate Car-Specific Presigned URLs (Frontend Compatible)
```http
POST /cars/images/generate-car-image-presigned-urls
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "chassisNo": "ABC123",
  "files": [
    {
      "fileName": "car-front.jpg",
      "contentType": "image/jpeg"
    }
  ]
}
```

### Update Car Images (After S3 Upload)
```http
POST /cars/images/update-car-images
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "chassisNo": "ABC123",
  "keys": [
    "cars/ABC123/car-front.jpg",
    "cars/ABC123/car-back.jpg"
  ]
}
```

### Delete Car Images
```http
DELETE /cars/images/{chassisNo}/images
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "imageUrls": [
    "https://bucket.s3.region.amazonaws.com/cars/ABC123/car-front.jpg"
  ]
}
```

### Migrate Problematic Images
```http
POST /cars/images/migrate-problematic-images
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "chassisNo": "ABC123",
  "dryRun": true
}
```

---

## 🌐 Public Endpoints (No Authentication Required)

### Get Best Cars (Top 4)
```http
GET /public/cars/best
```

### Get Public Cars with Filters
```http
GET /public/cars
Query Parameters: ?search=term&make=Toyota&year=2023&price_min=20000&price_max=30000
```

### Public Car Search
```http
GET /public/cars/search?search=searchTerm
```

### Get Public Car Facets
```http
GET /public/cars/facets
```

### Get Specific Public Car
```http
GET /public/cars/{chassisNo}
```

---

## 👥 Admin Management Endpoints (Master Only)

### Get All Admins
```http
GET /admin/admins
Authorization: Bearer <master_token>
```

### Create New Admin
```http
POST /admin/admins
Authorization: Bearer <master_token>
Content-Type: application/json

{
  "email": "newadmin@dealership.com",
  "password": "password123",
  "name": "New Admin",
  "branch": "Main Branch"
}
```

### Get Single Admin
```http
GET /admin/admins/{id}
Authorization: Bearer <master_token>
```

### Update Admin
```http
PATCH /admin/admins/{id}
Authorization: Bearer <master_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "branch": "New Branch"
}
```

### Delete Admin
```http
DELETE /admin/admins/{id}
Authorization: Bearer <master_token>
```

---

## 👨‍💼 Staff Management Endpoints (Admin+ Only)

### Get All Staff
```http
GET /staff
Authorization: Bearer <admin_token>
```

### Create New Staff
```http
POST /staff
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "newstaff@dealership.com",
  "password": "password123",
  "name": "New Staff",
  "branch": "Main Branch"
}
```

### Get Staff Sold By Selector
```http
GET /staff/sold-by-selector
Authorization: Bearer <admin_token>
```

### Get Single Staff
```http
GET /staff/{id}
Authorization: Bearer <admin_token>
```

### Update Staff
```http
PATCH /staff/{id}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "branch": "New Branch"
}
```

### Delete Staff
```http
DELETE /staff/{id}
Authorization: Bearer <admin_token>
```

---

## 🗄️ Database Management Endpoints

### Get Database Status
```http
GET /database/status
Authorization: Bearer <admin_token>
```

### Public Database Setup (No Auth Required)
```http
POST /public/database/setup
```

### Public Database Status (No Auth Required)
```http
GET /public/database/status
```

### Public Database Migration (No Auth Required)
```http
POST /public/database/migrate
```

### Public Database Seeding (No Auth Required)
```http
POST /public/database/seed
```

### Public Database Reset (No Auth Required - DANGEROUS!)
```http
POST /public/database/reset
```

---

## 📊 Response Formats

### Success Response
```json
{
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "timestamp": "2025-01-07T10:30:00.000Z",
  "path": "/v1/cars",
  "method": "POST",
  "message": "Error message here"
}
```

### Paginated Response
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 🔧 File Upload Specifications

### Supported File Types
- **Images**: JPEG, PNG, JPG, WebP
- **Documents**: PDF
- **Maximum File Size**: 50MB per file
- **Maximum Files**: 10 files per request

### Image Upload Workflow (S3 Presigned URLs)
1. **Request Presigned URLs**: `POST /cars/images/generate-car-image-presigned-urls`
2. **Upload to S3**: Direct PUT requests using presigned URLs
3. **Notify Backend**: `POST /cars/images/update-car-images`

### Direct Upload Workflow
1. **Upload Files**: `POST /cars/images/add-images/{chassisNo}`
2. **Files processed automatically** and added to car record

---

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 413 | Payload Too Large - File size exceeded |
| 500 | Internal Server Error - Server error |

---

## 🔒 Permission Levels

| Role | Description | Access Level |
|------|-------------|--------------|
| **MASTER** | System administrator | Full access to all endpoints |
| **ADMIN** | Branch administrator | Access to cars, staff, images |
| **STAFF** | Regular staff member | Limited access to cars and images |

---

## 📝 Notes for Frontend Integration

### General Integration
1. **Base URL**: Always use `http://localhost:3000/api/v1` as the base URL
2. **Authentication**: Use the unified login endpoint `/auth/login` for automatic user type detection
3. **File Uploads**: Use multipart/form-data for direct uploads, presigned URLs for S3 uploads
4. **Error Handling**: Check response status codes and handle errors appropriately
5. **Pagination**: Use query parameters for paginated endpoints
6. **CORS**: Backend is configured for cross-origin requests from multiple origins including `http://localhost:5173` (Vite), `http://localhost:3000`, `http://localhost:3001`, `http://localhost:8080`, and `http://localhost:4200`

### Dashboard Table Integration
7. **Primary Endpoint**: Use `/cars/listing` for dashboard table data (not `/cars`)
8. **Query Parameters**: Support both formats - `status[eq]=In Stock` and `status=In Stock`
9. **Search**: Searches across brand, model, variant, chassisNo, and color fields
10. **Response Format**: Dashboard listing returns `{ data, currentPage, lastPage, total }` format
11. **Statistics**: Use `/cars/stats` for dashboard summary cards
12. **Bulk Operations**: All bulk endpoints return `{ message, updatedCount/deletedCount }` format
13. **Real-time Updates**: Implement optimistic updates with rollback on API failure
14. **Debounced Search**: Implement 500ms debounce on search input to avoid excessive API calls

### Data Types & Validation
15. **Car Status**: "In Stock", "Sold", "On Order", "In Transit", "Reserved"
16. **Car Condition**: "New", "Used", "Certified Pre-Owned", "Recon"
17. **Public Visibility**: "yes" or "no" (string values)
18. **Price**: Numeric values in MYR
19. **Features**: Array of strings
20. **Images**: Array of S3 URLs

---

*This API reference is generated for the Car Dealership Backend NestJS application. All endpoints are tested and ready for frontend integration.*
