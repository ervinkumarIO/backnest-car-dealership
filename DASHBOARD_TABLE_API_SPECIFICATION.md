# 📋 Dashboard Table API Specification

## Overview
This document outlines the complete API requirements for the dashboard table component and all its associated functionality, including data fetching, filtering, sorting, pagination, and bulk operations.

---

## 🔍 1. FETCH CARS (Table Data)

### Endpoint
```http
GET /cars/listing
```

### Purpose
Fetch paginated car inventory data for the dashboard table.

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Text search across car fields |
| `status` | string | No | Filter by status (In Stock, Sold, etc.) |
| `condition` | string | No | Filter by condition (New, Used, etc.) |
| `sortBy` | string | No | Sort field (year, price, created_at) |
| `sortOrder` | string | No | Sort direction (asc, desc) |
| `page` | number | No | Page number (default: 1) |
| `perPage` | number | No | Items per page (default: 10) |

### Example Request
```http
GET /cars/listing?search=toyota&status[eq]=In Stock&sortBy=price&sortOrder=desc&page=1&perPage=25
```

### Expected Response
```json
{
  "data": [
    {
      "chassisNo": "ABC123",
      "brand": "Toyota",
      "model": "Camry",
      "variant": "2.5L Hybrid",
      "year": "2023",
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
      "public": "yes"
    }
  ],
  "currentPage": 1,
  "lastPage": 5,
  "total": 125
}
```

### Car Object Structure
```typescript
interface Car {
  chassisNo: string;        // Unique identifier
  brand: string;            // Car brand
  model: string;            // Car model
  variant: string;          // Car variant
  year: string;             // Manufacturing year
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

---

## 📊 2. DASHBOARD STATISTICS

### Endpoint
```http
GET /cars/stats
```

### Purpose
Fetch dashboard statistics for the summary cards displayed above the table.

### Expected Response
```json
{
  "totalCars": 125,
  "totalSoldCars": 45,
  "totalAvailableCars": 80
}
```

### Response Structure
```typescript
interface Dashboard {
  totalCars: number;        // Total cars in inventory
  totalSoldCars: number;    // Total sold cars
  totalAvailableCars: number; // Total available cars
}
```

---

## ⚡ 3. BULK ACTIONS

### 3.1 Bulk Status Update

#### Endpoint
```http
PATCH /cars/bulk/status
```

#### Purpose
Update status for multiple cars simultaneously.

#### Request Body
```json
{
  "chassisNumbers": ["ABC123", "DEF456", "GHI789"],
  "status": "In Stock"
}
```

#### Status Options
- `"In Stock"` - Car is available for sale
- `"Sold"` - Car has been sold
- `"On Order"` - Car is on order
- `"In Transit"` - Car is being transported
- `"Reserved"` - Car is reserved for a customer

#### Expected Response
```json
{
  "message": "Status updated successfully",
  "updatedCount": 3
}
```

---

### 3.2 Bulk Price Update

#### Endpoint
```http
PATCH /cars/bulk/price
```

#### Purpose
Adjust prices for multiple cars (increase or decrease).

#### Request Body
```json
{
  "chassisNumbers": ["ABC123", "DEF456", "GHI789"],
  "price": 5000
}
```

#### Price Adjustment Logic
- **Positive value**: Increases price by the specified amount
- **Negative value**: Decreases price by the specified amount

#### Example
- `"price": 5000` - Increases each car's price by RM 5,000
- `"price": -2000` - Decreases each car's price by RM 2,000

#### Expected Response
```json
{
  "message": "Prices updated successfully",
  "updatedCount": 3
}
```

---

### 3.3 Bulk Delete

#### Endpoint
```http
DELETE /cars/bulk
```

#### Purpose
Delete multiple cars from the inventory.

#### Request Body
```json
{
  "chassisNumbers": ["ABC123", "DEF456", "GHI789"]
}
```

#### Expected Response
```json
{
  "message": "Cars deleted successfully",
  "deletedCount": 3
}
```

---

### 3.4 Bulk Public Visibility Update

#### Endpoint
```http
PATCH /cars/bulk/public
```

#### Purpose
Update public visibility for multiple cars.

#### Request Body
```json
{
  "chassisNumbers": ["ABC123", "DEF456", "GHI789"],
  "public": "yes"
}
```

#### Public Visibility Options
- `"yes"` - Car is visible to public customers
- `"no"` - Car is only visible to internal staff

#### Expected Response
```json
{
  "message": "Public visibility updated successfully",
  "updatedCount": 3
}
```

---

## 🔗 4. INDIVIDUAL CAR ACTIONS

### 4.1 View Car Details

#### Endpoint
```http
GET /cars/{chassisNo}
```

#### Purpose
Fetch detailed information for a specific car.

#### Example Request
```http
GET /cars/ABC123
```

#### Expected Response
```json
{
  "chassisNo": "ABC123",
  "brand": "Toyota",
  "model": "Camry",
  "variant": "2.5L Hybrid",
  "year": "2023",
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
  "public": "yes"
}
```

---

## 🔐 5. AUTHENTICATION REQUIREMENTS

### Authorization Header
All endpoints require JWT token authentication:
```http
Authorization: Bearer <jwt_token>
```

### User Role Requirements
- **Dashboard Table**: Admin or Master users only
- **Bulk Actions**: Admin or Master users only
- **Individual Actions**: Admin or Master users only

### Permission Levels
| Role | Dashboard Access | Bulk Actions | Individual Actions |
|------|------------------|--------------|-------------------|
| **Staff** | ❌ No | ❌ No | ❌ No |
| **Admin** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Master** | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 📝 6. TABLE FUNCTIONALITY MAPPING

| **Table Feature** | **API Endpoint** | **Method** | **Query Parameters** | **Purpose** |
|------------------|------------------|------------|---------------------|-------------|
| **Load Data** | `/cars/listing` | GET | `page`, `perPage` | Fetch paginated car data |
| **Search** | `/cars/listing` | GET | `search` | Text search across car fields |
| **Filter by Status** | `/cars/listing` | GET | `status[eq]` | Filter by car status |
| **Filter by Condition** | `/cars/listing` | GET | `condition[eq]` | Filter by car condition |
| **Sort by Year** | `/cars/listing` | GET | `sortBy=year`, `sortOrder` | Sort by manufacturing year |
| **Sort by Price** | `/cars/listing` | GET | `sortBy=price`, `sortOrder` | Sort by car price |
| **Sort by Date** | `/cars/listing` | GET | `sortBy=created_at`, `sortOrder` | Sort by creation date |
| **Pagination** | `/cars/listing` | GET | `page`, `perPage` | Navigate between pages |
| **Dashboard Stats** | `/cars/stats` | GET | None | Get summary statistics |
| **Bulk Status Update** | `/cars/bulk/status` | PATCH | Request body | Update multiple car statuses |
| **Bulk Price Update** | `/cars/bulk/price` | PATCH | Request body | Adjust multiple car prices |
| **Bulk Delete** | `/cars/bulk` | DELETE | Request body | Delete multiple cars |
| **Bulk Public Update** | `/cars/bulk/public` | PATCH | Request body | Update public visibility |
| **View Car Details** | `/cars/{chassisNo}` | GET | Path parameter | Navigate to car details |

---

## 🎯 7. IMPLEMENTATION NOTES

### Frontend Behavior
1. **Debounced Search**: Search input is debounced by 500ms to avoid excessive API calls
2. **Real-time Updates**: All bulk operations invalidate and refetch data automatically
3. **Error Handling**: All API calls include proper error handling with user feedback
4. **Loading States**: Loading indicators shown during API operations
5. **Optimistic Updates**: UI updates immediately, with rollback on API failure
6. **Pagination**: Supports configurable page sizes (10, 25, 50, 100)
7. **Sorting**: Multi-column sorting with visual indicators
8. **Selection**: Individual and bulk selection with visual feedback

### Query Parameter Format
- **Equality Filters**: `status[eq]=In Stock`
- **Range Filters**: `price[gte]=100000&price[lte]=200000`
- **Search**: `search=toyota camry`
- **Sorting**: `sortBy=price&sortOrder=desc`
- **Pagination**: `page=2&perPage=25`

### Error Response Format
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

## 🚀 8. USAGE EXAMPLES

### Example 1: Fetch First Page with Search
```http
GET /cars/listing?search=toyota&page=1&perPage=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example 2: Filter by Status and Sort by Price
```http
GET /cars/listing?status[eq]=In Stock&sortBy=price&sortOrder=desc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example 3: Bulk Status Update
```http
PATCH /cars/bulk/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "chassisNumbers": ["ABC123", "DEF456"],
  "status": "Sold"
}
```

### Example 4: Bulk Price Increase
```http
PATCH /cars/bulk/price
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "chassisNumbers": ["ABC123", "DEF456"],
  "price": 3000
}
```

---

## 📋 9. TESTING CHECKLIST

### Data Fetching
- [ ] Load initial table data
- [ ] Test pagination (next/previous)
- [ ] Test different page sizes (10, 25, 50, 100)
- [ ] Test search functionality
- [ ] Test status filtering
- [ ] Test condition filtering
- [ ] Test sorting by year
- [ ] Test sorting by price
- [ ] Test sorting by date
- [ ] Test dashboard statistics

### Bulk Operations
- [ ] Test bulk status update (all statuses)
- [ ] Test bulk price increase
- [ ] Test bulk price decrease
- [ ] Test bulk delete with confirmation
- [ ] Test bulk public visibility toggle
- [ ] Test error handling for bulk operations
- [ ] Test selection/deselection functionality

### Individual Actions
- [ ] Test clicking chassis number to view details
- [ ] Test individual row selection
- [ ] Test select all functionality
- [ ] Test partial selection state

### Error Scenarios
- [ ] Test with invalid authentication
- [ ] Test with insufficient permissions
- [ ] Test with invalid query parameters
- [ ] Test with network errors
- [ ] Test with empty results

---

*This specification covers all API requirements for the dashboard table component and its associated functionality. Ensure all endpoints are implemented according to these specifications for proper frontend integration.*
