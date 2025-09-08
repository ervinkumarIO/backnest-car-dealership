# 🔐 Car Dealership API - Route Permissions Guide

## 📋 User Roles Overview

| Role | Description | Access Level |
|------|-------------|--------------|
| **MASTER** | Master Admin (adminId: 'MASTER') | Full system access, all branches |
| **ADMIN** | Branch Admin | Limited access, same branch only |
| **STAFF** | Staff Member | Basic access, own profile only |

---

## 🌐 Public Routes (No Authentication Required)

### **Authentication Endpoints**
```
POST /api/v1/auth/admin/login          # Admin login
POST /api/v1/auth/staff/login          # Staff login
```

### **Public Car Viewing**
```
GET  /api/v1/public/cars               # View public cars
GET  /api/v1/public/cars/best          # View best cars
GET  /api/v1/public/cars/search        # Search public cars
GET  /api/v1/public/cars/facets        # Get public car facets
GET  /api/v1/public/cars/:chassisNo    # View specific public car
```

### **Database Setup (Development Only)**
```
POST /api/v1/public/database/setup     # Initial database setup
GET  /api/v1/public/database/status    # Database status
POST /api/v1/public/database/migrate   # Run migrations
POST /api/v1/public/database/seed      # Seed database
POST /api/v1/public/database/reset     # Reset database
```

### **General**
```
GET  /api/v1/                          # Health check
```

---

## 🔒 Authenticated Routes (JWT Required)

### **User Profile & Session**
```
GET  /api/v1/auth/profile              # Get user profile
GET  /api/v1/auth/me                   # Get current user
POST /api/v1/auth/logout               # Logout user
```

---

## 👑 MASTER Only Routes

### **Admin Management**
```
GET    /api/v1/admin/admins            # List all admins
POST   /api/v1/admin/admins            # Create new admin
GET    /api/v1/admin/admins/:id        # Get specific admin
PATCH  /api/v1/admin/admins/:id        # Update admin
DELETE /api/v1/admin/admins/:id        # Delete admin
```

### **Development Database**
```
GET  /api/v1/dev/database/status       # Database status (dev only)
```

---

## 🛡️ ADMIN & MASTER Routes

### **Staff Management**
```
GET    /api/v1/admin/staff             # List staff (branch-filtered for admins)
POST   /api/v1/admin/staff             # Create new staff
GET    /api/v1/admin/staff/:id         # Get specific staff
PATCH  /api/v1/admin/staff/:id         # Update staff
DELETE /api/v1/admin/staff/:id         # Delete staff
GET    /api/v1/admin/staff/sold-by-selector  # Get staff for dropdown
```

### **Car Management**
```
GET    /api/v1/cars                    # List all cars
GET    /api/v1/cars/listing            # Get car listing
GET    /api/v1/cars/stats              # Get car statistics
GET    /api/v1/cars/statistics         # Alternative stats endpoint
GET    /api/v1/cars/search             # Search cars
GET    /api/v1/cars/facets             # Get car facets
GET    /api/v1/cars/:chassisNo         # Get specific car
PATCH  /api/v1/cars/:chassisNo         # Update car
DELETE /api/v1/cars/:chassisNo         # Delete car
```

### **Car Creation**
```
POST   /api/v1/cars/store-new          # Store new car
POST   /api/v1/cars/create             # Alternative create endpoint
```

### **Bulk Car Operations**
```
POST   /api/v1/cars/bulk               # Bulk store cars
PATCH  /api/v1/cars/bulk/price         # Bulk update prices
PATCH  /api/v1/cars/bulk/status        # Bulk update status
PATCH  /api/v1/cars/bulk/public        # Bulk update public visibility
DELETE /api/v1/cars/bulk               # Bulk delete cars
```

### **Car Image Management**
```
POST   /api/v1/cars/images/upload                    # Upload car images
POST   /api/v1/cars/images/presigned-urls            # Generate presigned URLs
POST   /api/v1/cars/images/car-presigned-urls        # Generate car-specific URLs
POST   /api/v1/cars/images/update-car-images         # Update car image URLs
DELETE /api/v1/cars/images/:chassisNo/images         # Delete car images
POST   /api/v1/cars/images/:chassisNo/add            # Add images to car
POST   /api/v1/cars/images/migrate-problematic-images # Migrate problematic images
```

---

## 🚫 STAFF Access

**Staff members currently have NO protected routes** - they can only:
- Login via `/api/v1/auth/staff/login`
- Access public car viewing routes
- Access their own profile via `/api/v1/auth/me` (if authenticated)

---

## 🔍 Branch Access Control

### **MASTER Users**
- ✅ Access to **ALL branches**
- ✅ Can manage admins and staff from any branch
- ✅ Can view and manage cars from any branch

### **ADMIN Users**
- ✅ Access to **SAME BRANCH ONLY**
- ❌ Cannot manage other admins
- ✅ Can manage staff in their branch only
- ✅ Can view and manage cars in their branch only

### **STAFF Users**
- ✅ Access to **SAME BRANCH ONLY** (when implemented)
- ❌ Cannot manage users
- ❌ Cannot manage cars (when implemented)

---

## 🛡️ Security Guards

### **Authentication Guards**
- `AuthGuard('jwt')` - Validates JWT token
- `AuthGuard('local')` - Validates username/password

### **Authorization Guards**
- `RolesGuard` - Checks user roles and permissions
- `BranchGuard` - Enforces branch-level access control

### **Role Decorators**
- `@MasterOnly()` - Only MASTER users
- `@AdminOnly()` - ADMIN and MASTER users
- `@StaffOnly()` - STAFF users (not currently used)

---

## 📊 Route Summary

| Route Type | MASTER | ADMIN | STAFF | Public |
|------------|--------|-------|-------|--------|
| **Admin Management** | ✅ | ❌ | ❌ | ❌ |
| **Staff Management** | ✅ | ✅* | ❌ | ❌ |
| **Car Management** | ✅ | ✅* | ❌ | ❌ |
| **Public Car Viewing** | ✅ | ✅ | ✅ | ✅ |
| **Authentication** | ✅ | ✅ | ✅ | ✅ |
| **Database Setup** | ✅ | ✅ | ✅ | ✅ |

*Branch-restricted access

---

## 🚨 Important Notes

1. **Branch Filtering**: Admins can only access data from their assigned branch
2. **MASTER Override**: MASTER users bypass all branch restrictions
3. **Staff Limitations**: Staff routes are not fully implemented yet
4. **Public Routes**: Some database setup routes should be disabled in production
5. **JWT Expiration**: All authenticated routes require valid JWT tokens (24h expiry)

---

## 🔧 Testing Credentials

### **MASTER Admin**
- Email: `master@dealership.com`
- Password: `password123`
- Access: Full system access

### **Sample Admin**
- Email: `admin.kl@dealership.com`
- Password: `password123`
- Access: KL branch only

### **Sample Staff**
- Email: `john.sales@dealership.com`
- Password: `password123`
- Access: Basic access (limited routes)
