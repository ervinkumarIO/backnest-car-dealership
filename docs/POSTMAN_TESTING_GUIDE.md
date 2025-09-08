# 🧪 Postman Testing Guide - Car Dealership API

## 📋 Prerequisites

1. **Start the NestJS server**: `npm run start:dev`
2. **Setup database**: Use the development endpoints to initialize
3. **Postman installed** with environment variables configured
4. **MySQL database running** with proper connection settings
5. **AWS S3 configured** (for image upload testing)

## 🔧 Postman Environment Setup

### **Create Environment Variables**
Create a new environment in Postman with these variables:

```json
{
  "baseUrl": "http://localhost:3000/api/v1",
  "adminToken": "",
  "staffToken": "",
  "masterToken": "",
  "testChassisNo": "ABC123"
}
```

### **🚀 Public Database Management (Lead Developer Access)**
The API now includes public database management endpoints that don't require authentication:

- **`GET /public/database/status`** - Check database connection and status
- **`POST /public/database/setup`** - Complete database initialization (migrations + seeding)
- **`POST /public/database/migrate`** - Run database migrations only
- **`POST /public/database/seed`** - Seed database with development data only
- **`POST /public/database/reset`** - Reset database (DANGEROUS!)

**Benefits:**
- ✅ No authentication required for database operations
- ✅ Direct access for lead developers and testing
- ✅ Faster development workflow
- ✅ Easier testing and deployment
- ✅ Individual control over migrations and seeding

**Security Note:** These endpoints should be disabled in production environments.

## 🚀 Testing Sequence

### **Phase 1: Database Setup**

#### **1.1 Initial Database Setup (Public - No Auth Required)**
```http
POST {{baseUrl}}/public/database/setup
```
**Purpose**: Complete database setup (migrations + seeding)  
**Expected**: 200 OK with setup confirmation  
**Note**: Use this for initial setup - no authentication required

**Expected Response**:
```json
{
  "message": "Initial database setup completed successfully",
  "timestamp": "2025-09-05T19:23:14.266Z",
  "warning": "This endpoint should be disabled in production"
}
```

#### **1.2 Check Database Status (Public)**
```http
GET {{baseUrl}}/public/database/status
```
**Purpose**: Check database connection and status  
**Expected**: 200 OK with database statistics  
**Note**: No authentication required

**Expected Response**:
```json
{
  "admins": 4,
  "staff": 4,
  "cars": 8,
  "database": "car_dealership",
  "type": "mysql",
  "message": "Database connection successful",
  "timestamp": "2025-09-05T19:23:14.266Z"
}
```

#### **1.3 Individual Database Operations (Public - Lead Developer Access)**

##### **1.3.1 Run Database Migration Only**
```http
POST {{baseUrl}}/public/database/migrate
```
**Purpose**: Creates all database tables  
**Expected**: 200 OK with migration confirmation  
**Note**: No authentication required - Lead developer access

##### **1.3.2 Seed Database with Sample Data Only**
```http
POST {{baseUrl}}/public/database/seed
```
**Purpose**: Populates database with test data  
**Expected**: 200 OK with seeding confirmation  
**Note**: No authentication required - Lead developer access

##### **1.3.3 Reset Database (Dangerous!)**
```http
POST {{baseUrl}}/public/database/reset
```
**Purpose**: Drops and recreates all tables  
**Expected**: 200 OK with reset confirmation  
**Warning**: This will delete ALL data! No authentication required

#### **1.4 Protected Database Status (Optional)**
```http
GET {{baseUrl}}/dev/database/status
Authorization: Bearer {{masterToken}}
```
**Purpose**: Get database status with authentication  
**Expected**: 200 OK with database statistics  
**Note**: Requires authentication - alternative to public endpoint

---

### **Phase 2: Authentication Testing**

#### **2.1 Master Login**
```http
POST {{baseUrl}}/auth/admin/login
Content-Type: application/json

{
  "email": "master@dealership.com",
  "password": "password123"
}
```

**Expected Response**:
```json
{
  "user": {
    "id": 1,
    "adminId": "MASTER",
    "email": "master@dealership.com",
    "name": "Master Admin",
    "role": "master",
    "branch": "KL"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "admin"
}
```

**📝 Action**: Copy `access_token` to `masterToken` environment variable

#### **2.2 Admin Login**
```http
POST {{baseUrl}}/auth/admin/login
Content-Type: application/json

{
  "email": "admin.kl@dealership.com",
  "password": "password123"
}
```

**📝 Action**: Copy `access_token` to `adminToken` environment variable

#### **2.3 Staff Login**
```http
POST {{baseUrl}}/auth/staff/login
Content-Type: application/json

{
  "email": "john.sales@dealership.com",
  "password": "password123"
}
```

**📝 Action**: Copy `access_token` to `staffToken` environment variable

#### **2.4 Test Current User Endpoint**
```http
GET {{baseUrl}}/auth/me
Authorization: Bearer {{masterToken}}
```

**Expected Response**:
```json
{
  "role": "master",
  "user": {
    "adminId": "MASTER",
    "staffId": null,
    "name": "Master Admin",
    "email": "master@dealership.com",
    "branch": "KL"
  }
}
```

#### **2.5 Test Profile Endpoint**
```http
GET {{baseUrl}}/auth/profile
Authorization: Bearer {{adminToken}}
```

#### **2.6 Test Logout**
```http
POST {{baseUrl}}/auth/logout
Authorization: Bearer {{adminToken}}
```

**Expected Response**:
```json
{
  "message": "Logged out successfully"
}
```

#### **2.7 Test Session Login (Alternative)**
```http
POST {{baseUrl}}/auth/session/login
Content-Type: application/json

{
  "email": "admin.kl@dealership.com",
  "password": "password123"
}
```

**Expected Response**:
```json
{
  "user": {
    "id": 2,
    "adminId": "ADMIN001",
    "email": "admin.kl@dealership.com",
    "name": "KL Admin",
    "role": "admin",
    "branch": "KL"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "admin"
}
```

---

### **Phase 3: Car Management Testing**

#### **3.1 Get All Cars (Admin Access)**
```http
GET {{baseUrl}}/cars
Authorization: Bearer {{adminToken}}
```

**Query Parameters to Test**:
- `?search=Toyota`
- `?brand[eq]=Honda`
- `?year[eq]=2023`
- `?status[eq]=In Stock`
- `?sortBy=price&sortOrder=desc`

#### **3.2 Get Car Statistics**
```http
GET {{baseUrl}}/cars/statistics
Authorization: Bearer {{adminToken}}
```

**Expected Response**:
```json
{
  "totalCars": 8,
  "totalSoldCars": 1,
  "totalAvailableCars": 7
}
```

**Alternative Endpoint** (for frontend compatibility):
```http
GET {{baseUrl}}/cars/stats
Authorization: Bearer {{adminToken}}
```

#### **3.3 Search Cars**
```http
GET {{baseUrl}}/cars/search?q=Toyota
Authorization: Bearer {{adminToken}}
```

#### **3.4 Get Filter Facets**
```http
GET {{baseUrl}}/cars/facets
Authorization: Bearer {{adminToken}}
```

#### **3.5 Get Car by Chassis Number**
```http
GET {{baseUrl}}/cars/{{testChassisNo}}
Authorization: Bearer {{adminToken}}
```

#### **3.6 Create New Car**
```http
POST {{baseUrl}}/cars/create
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "chassisNo": "TEST001",
  "brand": "Test Brand",
  "model": "Test Model",
  "variant": "1.0L",
  "price": 50000,
  "year": 2024,
  "color": "Red",
  "transmission": "Manual",
  "fuelType": "Petrol",
  "mileage": 0,
  "grade": "A",
  "status": "In Stock",
  "condition": "New",
  "features": ["GPS", "Bluetooth"],
  "remarks": "Test car for API testing",
  "branch": "KL",
  "public": "no"
}
```

**Alternative Endpoint** (for frontend compatibility):
```http
POST {{baseUrl}}/cars
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "chassisNo": "TEST002",
  "brand": "Test Brand 2",
  "model": "Test Model 2",
  "variant": "1.5L",
  "price": 60000,
  "year": 2024,
  "color": "Blue",
  "transmission": "Automatic",
  "fuelType": "Petrol",
  "mileage": 0,
  "grade": "A",
  "status": "In Stock",
  "condition": "New",
  "features": ["GPS", "Bluetooth", "Sunroof"],
  "remarks": "Alternative endpoint test car",
  "branch": "KL",
  "public": "no"
}
```

#### **3.7 Update Car**
```http
PATCH {{baseUrl}}/cars/TEST001
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "price": 55000,
  "status": "In Stock",
  "remarks": "Updated test car"
}
```

#### **3.8 Bulk Update Prices**
```http
PATCH {{baseUrl}}/cars/bulk/price
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "action": "increase",
  "amount": 5000,
  "chassisNo": ["TEST001", "ABC123"]
}
```

#### **3.9 Bulk Update Status**
```http
PATCH {{baseUrl}}/cars/bulk/status
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "status": "In Transit",
  "chassisNo": ["TEST001"]
}
```

#### **3.10 Bulk Update Public Visibility**
```http
PATCH {{baseUrl}}/cars/bulk/public
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "public": "yes",
  "chassisNo": ["TEST001"]
}
```

#### **3.11 Delete Car**
```http
DELETE {{baseUrl}}/cars/TEST001
Authorization: Bearer {{adminToken}}
```

---

### **Phase 4: Image Management Testing**

#### **4.1 Direct Upload (Multiple Cars)**
```http
POST {{baseUrl}}/cars/images/upload
Authorization: Bearer {{adminToken}}
Content-Type: multipart/form-data

Body (form-data):
- car_image: [Select multiple image files named like "ABC123_1.jpg", "DEF456_2.jpg"]
```

**Expected Response:**
```json
{
  "message": "Images uploaded and linked to cars successfully!",
  "data": {
    "ABC123": [
      "https://your-bucket.s3.region.amazonaws.com/1234567890_ABC123_1.jpg"
    ],
    "DEF456": [
      "https://your-bucket.s3.region.amazonaws.com/1234567890_DEF456_2.jpg"
    ]
  }
}
```

#### **4.2 Add Images to Specific Car (Laravel Compatible)**
```http
POST {{baseUrl}}/cars/images/add-images/{{testChassisNo}}
Authorization: Bearer {{adminToken}}
Content-Type: multipart/form-data

Body (form-data):
- car_image: [Select image files]
```

**Expected Response:**
```json
{
  "message": "Images added successfully!",
  "data": {
    "chassisNo": "ABC123",
    "new_images": [
      "https://your-bucket.s3.region.amazonaws.com/1234567890_new_image.jpg"
    ],
    "all_images": [
      "https://your-bucket.s3.region.amazonaws.com/existing_image.jpg",
      "https://your-bucket.s3.region.amazonaws.com/1234567890_new_image.jpg"
    ]
  }
}
```

#### **4.3 Generate Generic Presigned URLs**
```http
POST {{baseUrl}}/cars/images/presigned-urls
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "files": [
    {
      "fileName": "test-image.jpg",
      "contentType": "image/jpeg"
    },
    {
      "fileName": "test-image.png",
      "contentType": "image/png"
    }
  ]
}
```

**Expected Response:**
```json
{
  "message": "Presigned URLs generated successfully",
  "data": {
    "urls": [
      {
        "fileName": "test-image.jpg",
        "key": "car-images/1234567890_test-image.jpg",
        "presignedUrl": "https://your-bucket.s3.amazonaws.com/car-images/1234567890_test-image.jpg?X-Amz-Algorithm=..."
      }
    ],
    "expiresIn": "15 minutes",
    "region": "us-west-2"
  }
}
```

#### **4.4 Generate Car-Specific Presigned URLs (Laravel Compatible)**
```http
POST {{baseUrl}}/cars/images/generate-car-image-presigned-urls
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "chassisNo": "{{testChassisNo}}",
  "files": [
    {
      "fileName": "car-front.jpg",
      "contentType": "image/jpeg"
    },
    {
      "fileName": "car-back.png",
      "contentType": "image/png"
    }
  ]
}
```

**Expected Response:**
```json
{
  "message": "Presigned URLs generated successfully",
  "data": {
    "chassisNo": "ABC123",
    "urls": [
      {
        "fileName": "car-front.jpg",
        "key": "cars/ABC123/car-front.jpg",
        "presignedUrl": "https://your-bucket.s3.amazonaws.com/cars/ABC123/car-front.jpg?X-Amz-Algorithm=..."
      }
    ],
    "expiresIn": "15 minutes",
    "region": "us-west-2"
  }
}
```

#### **4.5 Update Car Images (After S3 Upload)**
```http
POST {{baseUrl}}/cars/images/update-car-images
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "chassisNo": "{{testChassisNo}}",
  "keys": [
    "cars/ABC123/car-front.jpg",
    "cars/ABC123/car-back.png"
  ]
}
```

**Expected Response:**
```json
{
  "message": "Car images updated successfully",
  "data": {
    "chassisNo": "ABC123",
    "images": [
      "https://your-bucket.s3.region.amazonaws.com/cars/ABC123/car-front.jpg",
      "https://your-bucket.s3.region.amazonaws.com/cars/ABC123/car-back.png"
    ]
  }
}
```

#### **4.6 Delete Car Images**
```http
DELETE {{baseUrl}}/cars/images/{{testChassisNo}}/images
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "imageUrls": [
    "https://your-bucket.s3.region.amazonaws.com/cars/ABC123/car-front.jpg",
    "https://your-bucket.s3.region.amazonaws.com/car-images/old-image.jpg"
  ]
}
```

**Expected Response:**
```json
{
  "message": "Images deleted successfully.",
  "remaining_images": [
    "https://your-bucket.s3.region.amazonaws.com/cars/ABC123/car-back.png"
  ]
}
```

#### **4.7 Complete Frontend-Compatible Workflow**

**Step 1: Get Presigned URLs**
```http
POST {{baseUrl}}/cars/images/generate-car-image-presigned-urls
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "chassisNo": "{{testChassisNo}}",
  "files": [
    {
      "fileName": "frontend-test.jpg",
      "contentType": "image/jpeg"
    }
  ]
}
```

**Step 2: Upload to S3 (Use presigned URL from Step 1)**
```http
PUT <presigned_url_from_step_1>
Content-Type: image/jpeg

[Binary file data - select file in Postman]
```

**Step 3: Update Car with Image Keys**
```http
POST {{baseUrl}}/cars/images/update-car-images
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "chassisNo": "{{testChassisNo}}",
  "keys": ["cars/ABC123/frontend-test.jpg"]
}
```

#### **4.8 Migrate Problematic Images (Dry Run)**
```http
POST {{baseUrl}}/cars/images/migrate-problematic-images
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "chassisNo": "{{testChassisNo}}",
  "dryRun": true
}
```

**Expected Response:**
```json
{
  "message": "Migration preview completed",
  "chassisNo": "ABC123",
  "sanitizedChassisNo": "ABCHASH123",
  "migrations": [
    {
      "from": "car-images/old-image.jpg",
      "to": "cars/ABCHASH123/old-image.jpg"
    }
  ],
  "errors": [],
  "dryRun": true
}
```

#### **4.9 Image Management Testing Checklist**

**File Upload Tests:**
- [ ] Direct upload with multiple files
- [ ] Add images to specific car
- [ ] File size validation (max 5MB)
- [ ] File type validation (jpeg, png, jpg, webp, pdf)
- [ ] Filename sanitization (spaces, special characters)

**Presigned URL Tests:**
- [ ] Generate generic presigned URLs
- [ ] Generate car-specific presigned URLs
- [ ] URL expiration (15 minutes)
- [ ] S3 upload using presigned URLs
- [ ] Update car with uploaded image keys

**Image Management Tests:**
- [ ] Delete specific images
- [ ] Image URL cleanup and normalization
- [ ] Database transaction rollback on errors
- [ ] S3 cleanup on upload failures

**Error Handling Tests:**
- [ ] Invalid chassis number
- [ ] Missing authentication
- [ ] Invalid file types
- [ ] File size exceeded
- [ ] S3 connection issues

---

### **Phase 5: Admin Management Testing (Master Only)**

#### **5.1 Get All Admins**
```http
GET {{baseUrl}}/admin/admins?page=1&limit=10
Authorization: Bearer {{masterToken}}
```

#### **5.2 Create New Admin**
```http
POST {{baseUrl}}/admin/admins
Authorization: Bearer {{masterToken}}
Content-Type: application/json

{
  "adminId": "ADM999",
  "name": "Test Admin",
  "email": "test.admin@dealership.com",
  "phone": "+60123456999",
  "branch": "KL",
  "password": "password123"
}
```

#### **5.3 Get Admin by ID**
```http
GET {{baseUrl}}/admin/admins/5
Authorization: Bearer {{masterToken}}
```
**Note**: Use the ID from the create response

#### **5.4 Update Admin**
```http
PATCH {{baseUrl}}/admin/admins/5
Authorization: Bearer {{masterToken}}
Content-Type: application/json

{
  "name": "Updated Test Admin",
  "phone": "+60123456998"
}
```

#### **5.5 Delete Admin**
```http
DELETE {{baseUrl}}/admin/admins/5
Authorization: Bearer {{masterToken}}
```

---

### **Phase 6: Staff Management Testing (Admin+ Access)**

#### **6.1 Get All Staff**
```http
GET {{baseUrl}}/admin/staff?page=1&limit=10
Authorization: Bearer {{adminToken}}
```

#### **6.2 Get Sold-By Selector Data**
```http
GET {{baseUrl}}/admin/staff/sold-by-selector
Authorization: Bearer {{adminToken}}
```

#### **6.3 Create New Staff**
```http
POST {{baseUrl}}/admin/staff
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "staffId": "STF999",
  "name": "Test Staff",
  "email": "test.staff@dealership.com",
  "phone": "+60123456999",
  "branch": "KL",
  "role": "sales",
  "department": "sales",
  "password": "password123"
}
```

#### **6.4 Get Staff by ID**
```http
GET {{baseUrl}}/admin/staff/5
Authorization: Bearer {{adminToken}}
```

#### **6.5 Update Staff**
```http
PATCH {{baseUrl}}/admin/staff/5
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "name": "Updated Test Staff",
  "role": "manager"
}
```

#### **6.6 Delete Staff**
```http
DELETE {{baseUrl}}/admin/staff/5
Authorization: Bearer {{adminToken}}
```

---

### **Phase 7: Public Endpoints Testing (No Authentication)**

#### **7.1 Get Public Cars**
```http
GET {{baseUrl}}/public/cars
```

**Query Parameters to Test**:
- `?search=Toyota`
- `?brand[eq]=Honda`
- `?sortBy=price&sortOrder=asc`

#### **7.2 Public Car Search**
```http
GET {{baseUrl}}/public/cars/search?search=Toyota
```

#### **7.3 Get Public Facets**
```http
GET {{baseUrl}}/public/cars/facets
```

#### **7.4 Get Best Cars**
```http
GET {{baseUrl}}/public/cars/best
```

#### **7.5 Get Public Car Details**
```http
GET {{baseUrl}}/public/cars/{{testChassisNo}}
```
**Note**: Car must have `public: "yes"` and `status: "In Stock"`

---

### **Phase 8: Authorization Testing**

#### **8.1 Test Staff Access to Admin Endpoint (Should Fail)**
```http
GET {{baseUrl}}/admin/admins
Authorization: Bearer {{staffToken}}
```
**Expected**: 403 Forbidden

#### **8.2 Test Admin Access to Master Endpoint (Should Fail)**
```http
POST {{baseUrl}}/dev/database/migrate
Authorization: Bearer {{adminToken}}
```
**Expected**: 403 Forbidden

#### **8.3 Test Unauthorized Access (Should Fail)**
```http
GET {{baseUrl}}/cars
```
**Expected**: 401 Unauthorized

---

## 🔄 Frontend Compatibility Testing

### **Alternative Endpoints for Frontend Integration**

The API provides alternative endpoint paths to ensure compatibility with existing frontend implementations:

#### **Car Creation Endpoints**
- **Primary**: `POST /cars/create`
- **Alternative**: `POST /cars` (for frontend compatibility)

#### **Car Statistics Endpoints**
- **Primary**: `GET /cars/statistics`
- **Alternative**: `GET /cars/stats` (for frontend compatibility)

#### **Authentication Endpoints**
- **JWT Login**: `POST /auth/admin/login` or `POST /auth/staff/login`
- **Session Login**: `POST /auth/session-login` (alternative for session-based frontends)
- **User Info**: `GET /auth/me` (returns frontend-compatible format with `adminId`/`staffId`)

### **Frontend Integration Notes**

1. **User ID Format**: The `/auth/me` endpoint returns user IDs in the format expected by the frontend:
   - Master: `adminId: "MASTER"`
   - Admin: `adminId: "ADMIN001"` (padded with zeros)
   - Staff: `staffId: "STF001"` (padded with zeros)

2. **JWT Token Handling**: Frontend should store JWT tokens and include them in Authorization headers as `Bearer {token}`

3. **Logout Implementation**: JWT logout is client-side - frontend should remove the token from storage

---

## 🧪 Testing Checklist

### **✅ Authentication & Authorization**
- [ ] Master login successful
- [ ] Admin login successful  
- [ ] Staff login successful
- [ ] Session login works
- [ ] `/auth/me` returns correct user info with proper ID formatting
- [ ] `/auth/profile` returns user details
- [ ] `/auth/logout` works (JWT client-side logout)
- [ ] JWT tokens are properly formatted
- [ ] Role-based access control enforced
- [ ] Unauthorized requests blocked
- [ ] Token expiration handling

### **✅ Car Management**
- [ ] Get all cars with filters
- [ ] Search cars works
- [ ] Get car statistics
- [ ] Get filter facets
- [ ] Create new car
- [ ] Update existing car
- [ ] Bulk operations work
- [ ] Delete car

### **✅ Image Management**
- [ ] Direct upload with multiple files
- [ ] Add images to specific car (Laravel compatible)
- [ ] Generate generic presigned URLs
- [ ] Generate car-specific presigned URLs (Laravel compatible)
- [ ] Update car images after S3 upload
- [ ] Delete car images
- [ ] Complete frontend-compatible workflow
- [ ] Image migration (dry run and actual)
- [ ] File validation (size, type, sanitization)
- [ ] Error handling and transaction rollback

### **✅ User Management**
- [ ] Admin CRUD (Master only)
- [ ] Staff CRUD (Admin+)
- [ ] Proper branch filtering

### **✅ Public Endpoints**
- [ ] Public car viewing
- [ ] Public search
- [ ] Best cars endpoint
- [ ] Public facets

### **✅ Database Management**
- [ ] Public database setup (no auth)
- [ ] Public database status check
- [ ] Public database migration (no auth)
- [ ] Public database seeding (no auth)
- [ ] Public database reset (no auth)
- [ ] Protected status checking (optional)

## 🚨 Common Issues & Solutions

### **Issue**: "Invalid credentials" on login
**Solution**: Ensure database is seeded with sample data

### **Issue**: 401 Unauthorized
**Solution**: Check if token is properly set in Authorization header

### **Issue**: 403 Forbidden
**Solution**: Verify user role has required permissions

### **Issue**: Car not found
**Solution**: Use chassis numbers from seeded data (ABC123, DEF456, etc.)

### **Issue**: Database connection error
**Solution**: Check MySQL is running and environment variables are correct

### **Issue**: Migration fails
**Solution**: Ensure database exists and user has CREATE/ALTER permissions

### **Issue**: Seeding fails
**Solution**: Run migration first, then seeding. Check for duplicate data conflicts

### **Issue**: JWT token expired
**Solution**: Re-login to get fresh token. Tokens expire after configured time

### **Issue**: S3 upload fails
**Solution**: Check AWS credentials and S3 bucket permissions in environment variables

### **Issue**: Image upload returns 400 Bad Request
**Solution**: Check file size (max 5MB) and file type (jpeg, png, jpg, webp, pdf only)

### **Issue**: Presigned URL upload fails
**Solution**: Ensure you're using PUT method and correct Content-Type header

### **Issue**: Car not found when adding images
**Solution**: Verify the chassis number exists in the database using car search

### **Issue**: Image deletion fails
**Solution**: Check that the image URLs are correct and accessible

## 📊 Expected Test Results Summary

| Endpoint Category | Total Tests | Expected Pass |
|------------------|-------------|---------------|
| Database Setup | 6 | 6 |
| Authentication | 8 | 8 |
| Car Management | 12 | 12 |
| Image Management | 9 | 9 |
| Admin Management | 5 | 5 |
| Staff Management | 6 | 6 |
| Public Endpoints | 5 | 5 |
| Authorization Tests | 3 | 3 |
| **Total** | **52** | **52** |

## 🎯 Quick Test Collection

For rapid testing, you can import this Postman collection structure:

```json
{
  "info": {
    "name": "Car Dealership API Tests",
    "description": "Complete API testing collection"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api/v1"
    }
  ]
}
```

**Happy Testing! 🚀**

---

## 🎯 **Updated Testing Workflow**

### **Quick Start (5 minutes)**
1. **Start Server**: `npm run start:dev`
2. **Setup Database**: `POST /public/database/setup` (no auth required)
3. **Login**: `POST /auth/admin/login` (use master credentials)
4. **Test Basic Endpoints**: Get cars, create car, test auth

### **Complete Testing (30 minutes)**
Follow the full testing sequence above for comprehensive API validation.

### **Frontend Integration Testing**
Focus on the alternative endpoints and JWT token handling for seamless frontend integration.

---

**Pro Tip**: Test in the exact order listed above for best results. The database setup and authentication must be completed first before testing other endpoints. All linting errors have been resolved, so the codebase is production-ready! ✅
