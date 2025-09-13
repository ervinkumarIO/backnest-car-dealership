# Progressive Facets Filtering Fix

## Problem Description

The facets functionality was not working correctly for progressive filtering. When users applied filters (e.g., set max price to 100,000), the facets would still show counts for ALL cars in the database instead of only showing counts for cars that match the current filter criteria.

### Example of the Issue:
1. User sets `price_max=100000` → Should only show facets for cars under 100k
2. User then selects `brand=Mercedes` → Should only show facets for Mercedes cars under 100k
3. But the old implementation always showed facets for ALL cars regardless of applied filters

## Root Cause

The `getFacets` method in `CarsService` was completely ignoring the query parameters and just returning facets for ALL cars:

```typescript
// OLD IMPLEMENTATION (BROKEN)
async getFacets(_query: any) {
  // This is a complex method that would need custom query building
  // For now, return basic structure
  const cars = await this.carRepository.find(); // ❌ Gets ALL cars, ignores filters
  
  // Build facets from ALL cars regardless of filters
  // ...
}
```

## Solution

### 1. **Fixed Progressive Filtering Logic**

The new implementation applies the same filtering logic as `getCarListing` but without pagination:

```typescript
// NEW IMPLEMENTATION (FIXED)
async getFacets(query: CarListingQuery) {
  const { search, ...filters } = query;

  // Build the same query as getCarListing but without pagination
  const queryBuilder = this.carRepository
    .createQueryBuilder('car')
    .select([...allCarFields]);

  // Apply search (case-insensitive)
  if (search) {
    queryBuilder.where(
      '(LOWER(car.brand) LIKE LOWER(:search) OR LOWER(car.model) LIKE LOWER(:search) OR LOWER(car.variant) LIKE LOWER(:search) OR LOWER(car.chassisNo) LIKE LOWER(:search) OR LOWER(car.color) LIKE LOWER(:search))',
      { search: `%${search}%` },
    );
  }

  // Apply filters (same logic as getCarListing)
  Object.keys(filters).forEach((key) => {
    if (filters[key] && key !== 'search' && key !== 'sortBy' && key !== 'sortOrder' && key !== 'perPage' && key !== 'page') {
      // Handle price range filtering
      if (key === 'price_min') {
        const priceMin = Number(filters[key]);
        if (!isNaN(priceMin)) {
          queryBuilder.andWhere('car.price >= :price_min', {
            price_min: priceMin,
          });
        }
      } else if (key === 'price_max') {
        const priceMax = Number(filters[key]);
        if (!isNaN(priceMax)) {
          queryBuilder.andWhere('car.price <= :price_max', {
            price_max: priceMax,
          });
        }
      } else {
        // Regular field filtering
        queryBuilder.andWhere(`car.${key} = :${key}`, {
          [key]: String(filters[key]),
        });
      }
    }
  });

  // Get filtered cars (no pagination for facets)
  const cars = await queryBuilder.getMany();

  // Build facets from FILTERED cars only
  // ...
}
```

### 2. **Added Price Range Support**

Enhanced the facets to include price range information:

```typescript
// Add price range facets
if (cars.length > 0) {
  const prices = cars
    .map((car) => car.price)
    .filter((price) => price != null);
  if (prices.length > 0) {
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    facets['price_range'] = {
      min: minPrice,
      max: maxPrice,
      count: cars.length,
    };
  }
}
```

### 3. **Removed Access Restriction**

Removed the `@AdminOnly()` decorator from the facets endpoint to allow all authenticated users (MASTER, ADMIN, STAFF) to access it:

```typescript
// Before
@Get('facets')
@AdminOnly()  // ❌ Restricted to admin only
async getFacets(@Query() query: any) {
  return this.carsService.getFacets(query);
}

// After
@Get('facets')
// ✅ Available to all authenticated users
async getFacets(@Query() query: any) {
  return this.carsService.getFacets(query);
}
```

## How It Works Now

### Progressive Filtering Example:

1. **Initial Request** (no filters):
   ```
   GET /api/v1/cars/facets
   ```
   Returns facets for ALL cars in the database.

2. **After Price Filter** (max price 100,000):
   ```
   GET /api/v1/cars/facets?price_max=100000
   ```
   Returns facets only for cars under 100,000.

3. **After Brand Filter** (Mercedes under 100k):
   ```
   GET /api/v1/cars/facets?price_max=100000&brand=Mercedes
   ```
   Returns facets only for Mercedes cars under 100,000.

4. **After Year Filter** (2023 Mercedes under 100k):
   ```
   GET /api/v1/cars/facets?price_max=100000&brand=Mercedes&year=2023
   ```
   Returns facets only for 2023 Mercedes cars under 100,000.

### Response Format:

```json
{
  "chassis_numbers": ["ABC123", "DEF456"],
  "facets": {
    "brand": {
      "Mercedes": 5,
      "BMW": 3
    },
    "year": {
      "2023": 3,
      "2022": 5
    },
    "color": {
      "White": 4,
      "Black": 3,
      "Silver": 1
    },
    "price_range": {
      "min": 45000,
      "max": 95000,
      "count": 8
    }
  }
}
```

## Supported Filter Parameters

The facets endpoint now supports all the same filter parameters as the car listing endpoint:

- `search` - Text search across brand, model, variant, chassisNo, color
- `brand` - Filter by car brand
- `model` - Filter by car model
- `variant` - Filter by car variant
- `year` - Filter by manufacturing year
- `color` - Filter by car color
- `transmission` - Filter by transmission type
- `fuelType` - Filter by fuel type
- `grade` - Filter by car grade
- `condition` - Filter by car condition
- `price_min` - Minimum price filter
- `price_max` - Maximum price filter
- `status` - Filter by car status
- `public` - Filter by public visibility
- `branch` - Filter by branch

## API Endpoints

### Admin/Staff Facets (Authenticated)
```
GET /api/v1/cars/facets
```
- **Access**: MASTER, ADMIN, STAFF
- **Purpose**: Get filter options for admin dashboard/inventory management
- **Supports**: All filter parameters

### Public Facets (No Authentication)
```
GET /api/v1/public/cars/facets
```
- **Access**: Public
- **Purpose**: Get filter options for public car browsing
- **Supports**: All filter parameters (automatically filters to public cars with status "In Stock")

## Testing

To test the progressive filtering:

1. **Test without filters**:
   ```bash
   curl "http://localhost:3000/api/v1/cars/facets"
   ```

2. **Test with price filter**:
   ```bash
   curl "http://localhost:3000/api/v1/cars/facets?price_max=100000"
   ```

3. **Test with multiple filters**:
   ```bash
   curl "http://localhost:3000/api/v1/cars/facets?price_max=100000&brand=Mercedes&year=2023"
   ```

4. **Test with search**:
   ```bash
   curl "http://localhost:3000/api/v1/cars/facets?search=toyota"
   ```

## Benefits

1. **Progressive Filtering**: Facets now correctly narrow down as filters are applied
2. **Consistent Behavior**: Facets use the same filtering logic as car listings
3. **Price Range Support**: Added price range information in facets
4. **Better UX**: Users see accurate counts for available options
5. **Accessible to All Users**: Removed admin-only restriction
6. **Type Safety**: Added proper type checking for price filters

## Files Modified

- `src/cars/cars.service.ts` - Fixed `getFacets` method implementation
- `src/cars/cars.controller.ts` - Removed `@AdminOnly()` decorator from facets endpoint
- `docs/PROGRESSIVE_FACETS_FILTERING.md` - This documentation file

## Related Issues Fixed

- ✅ Progressive filtering now works correctly
- ✅ Price range filtering supported
- ✅ Facets accessible to all authenticated users
- ✅ Consistent filtering logic between listing and facets
- ✅ Type safety improvements
