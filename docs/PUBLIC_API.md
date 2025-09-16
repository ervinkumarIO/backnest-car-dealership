# Public API Documentation (Frontend Integration)

## Base URL

- Production: `/api/v1`
- Public routes are prefixed with `/public`

## Authentication

- Public routes do not require authentication

---

## 1) List Public Cars

GET `/public/cars`

Purpose: Browse public cars with filtering, search, sorting, and pagination

Query Parameters:
- search (string, optional): Text search across brand, model, variant, chassisNo, color
- sortBy (string, optional): One of `year`, `price`, `mileage`, `created_at` (default: none)
- sortOrder (string, optional): `asc` | `desc` (default: asc)
- page (number, optional): Page number (default: 1)
- perPage (number, optional): Items per page (default: 21)

Exact-match filters (use [eq] operator):
- brand[eq]
- model[eq]
- variant[eq]
- year[eq]
- color[eq]
- transmission[eq]
- fuelType[eq]
- grade[eq]
- condition[eq]
- branch[eq]

Range filters (numeric fields):
- price[lte], price[gte], price[lt], price[gt]
- mileage[lte], mileage[gte], mileage[lt], mileage[gt]
- year[lte], year[gte], year[lt], year[gt]

Notes:
- Public route automatically restricts to `public = 'yes'` and `status = 'In Stock'`

Example Requests:
- `GET /public/cars?search=mercedes&sortBy=price&sortOrder=asc&page=1&perPage=21`
- `GET /public/cars?brand%5Beq%5D=Mercedes&price%5Blte%5D=300000&mileage%5Blte%5D=50000`
- `GET /public/cars?year%5Bgte%5D=2022&color%5Beq%5D=Black`

Example Response:
```
{
  "data": [
    {
      "chassisNo": "ABC123",
      "brand": "Mercedes",
      "model": "C-Class",
      "variant": "3.0",
      "price": 250000,
      "year": 2023,
      "color": "Black",
      "transmission": "Automatic",
      "fuelType": "Petrol",
      "mileage": 18000,
      "grade": "5A",
      "status": "In Stock",
      "condition": "Recon",
      "features": ["Leather", "Navigation"],
      "image": ["https://.../car-images/ABC123_1.jpg"],
      "remarks": "Excellent condition",
      "branch": "KL",
      "public": "yes",
      "created_at": "2025-01-01T10:00:00.000Z",
      "updated_at": "2025-01-02T10:00:00.000Z"
    }
  ],
  "currentPage": 1,
  "lastPage": 5,
  "total": 100
}
```

---

## 2) Get Public Car Details

GET `/public/cars/:chassisNo`

Purpose: Fetch detailed information for a specific public car

Rules:
- Returns 404 if car is not `public = 'yes'` or not `status = 'In Stock'`

Example:
- `GET /public/cars/ABC123`

Example Response:
```
{
  "chassisNo": "ABC123",
  "brand": "Mercedes",
  "model": "C-Class",
  "variant": "3.0",
  "price": 250000,
  "year": 2023,
  "color": "Black",
  "transmission": "Automatic",
  "fuelType": "Petrol",
  "mileage": 18000,
  "grade": "5A",
  "status": "In Stock",
  "condition": "Recon",
  "features": ["Leather", "Navigation"],
  "image": ["https://.../car-images/ABC123_1.jpg"],
  "remarks": "Excellent condition",
  "branch": "KL",
  "public": "yes",
  "created_at": "2025-01-01T10:00:00.000Z",
  "updated_at": "2025-01-02T10:00:00.000Z"
}
```

---

## 3) Public Facets (for Filters)

GET `/public/cars/facets`

Purpose: Get filter options based on current filters (progressive facets)

Notes:
- Facets are derived from the currently filtered result set
- Public route automatically enforces `public = 'yes'` and `status = 'In Stock'`
- Supports the same query parameters/operators as the listing route

Example Requests:
- `GET /public/cars/facets`
- `GET /public/cars/facets?brand%5Beq%5D=Mercedes`
- `GET /public/cars/facets?price%5Blte%5D=300000&year%5Bgte%5D=2022`

Example Response:
```
{
  "chassis_numbers": ["ABC123", "DEF456", "XYZ789"],
  "facets": {
    "brand": { "Mercedes": 3, "Toyota": 2, "Honda": 1 },
    "model": { "C-Class": 1, "AMG ONE": 1, "GTC": 1 },
    "variant": { "3.0": 2, "2.5L Hybrid": 1 },
    "year": { "2022": 1, "2023": 2 },
    "color": { "Black": 2, "White": 1 },
    "transmission": { "Automatic": 3 },
    "fuelType": { "Petrol": 2, "Hybrid": 1 },
    "grade": { "5A": 1, "G": 1, "E": 1 },
    "condition": { "Recon": 2, "New": 1 },
    "price_range": { "min": 90000, "max": 300000, "count": 3 }
  }
}
```

---

## 4) Public Search (Quick Search)

GET `/public/cars/search`

Purpose: Lightweight public search endpoint for suggestions/results

Query Parameters:
- search (string, required): Prefix or substring match across brand, model, variant, chassisNo

Example:
- `GET /public/cars/search?search=mercedes`

Example Response:
```
{
  "data": [
    { "chassisNo": "ABC123", "brand": "Mercedes", "model": "C-Class", "price": 250000, "year": 2023 },
    { "chassisNo": "XYZ789", "brand": "Mercedes", "model": "GTC", "price": 450000, "year": 2022 }
  ],
  "total": 2
}
```

---

## 5) Best Cars (Highlight Section)

GET `/public/cars/best`

Purpose: Returns the top 4 public cars by price (or curated logic)

Example Response:
```
{
  "data": [
    { "chassisNo": "XYZ789", "brand": "Mercedes", "model": "GTC", "price": 450000, "year": 2022 },
    { "chassisNo": "DEF456", "brand": "Toyota", "model": "GR86", "price": 380000, "year": 2024 },
    { "chassisNo": "ABC123", "brand": "Mercedes", "model": "C-Class", "price": 250000, "year": 2023 },
    { "chassisNo": "LMN555", "brand": "Honda", "model": "Civic", "price": 120000, "year": 2021 }
  ]
}
```

---

## Operator Reference (Frontend → Backend)

Accepted operator syntax in query params (URL-encoded):
- Equals: `[eq]` (e.g., `brand%5Beq%5D=Mercedes`)
- Less than / Less than or equal: `[lt]`, `[lte]`
- Greater than / Greater than or equal: `[gt]`, `[gte]`

Backend translation used internally:
- `[eq]` → `field = :field`
- `[lte]` → `field <= :field_max`
- `[gte]` → `field >= :field_min`
- `[lt]` → `field <= (value - 1)`
- `[gt]` → `field >= (value + 1)`

---

## Pagination Contract

- Request: `page`, `perPage`
- Response:
```
{
  "data": [...],
  "currentPage": 1,
  "lastPage": 5,
  "perPage": 21,
  "total": 100
}
```

---

## Error Responses

- 400 Bad Request: Invalid query parameters (e.g., non-numeric range value)
- 404 Not Found: Car not found or car not public/in stock for detail route
- 500 Internal Server Error: Unexpected error (check server logs)

---

## Integration Tips

- Always URL-encode bracketed operators (e.g., `brand%5Beq%5D=Mercedes`)
- Combine exact and range filters for progressive narrowing (e.g., brand + price + mileage)
- Use `/public/cars/facets` to drive dynamic filter dropdowns
- Use `/public/cars/search` for fast autosuggests
- Cache facet results per filter state to reduce requests
