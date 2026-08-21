# 📖 API Documentation

This document outlines the core RESTful APIs available in the Multi-Store OMS Backend. All protected routes require a valid JWT token in the `Authorization` header formatted as `Bearer <token>`.

---

## 🔐 Auth APIs

### `POST /api/auth/login`
Authenticates a user or store admin and issues a JWT.
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "mypassword"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "user": { "id": "...", "role": "SUPER_ADMIN" },
    "token": "eyJhbGciOi..."
  }
  ```

---

## 📦 Order APIs

### `POST /api/orders`
Creates a new order. Emits a real-time `orderCreated` socket event.
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "store_id": "uuid-of-store",
    "items": [
      { "item_id": "uuid-of-product", "qty": 2 }
    ],
    "total_amount": 450.50
  }
  ```
- **Response**: `201 Created`

### `GET /api/orders?store_id=<id>&page=1&limit=10`
Fetches a paginated list of orders.
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**:
  - `store_id` (optional, required if not super admin)
  - `page` (default 1)
  - `limit` (default 10)
- **Response**: `200 OK`
  ```json
  {
    "data": [ ...orders ],
    "meta": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
  }
  ```

### `PATCH /api/orders/:id/status`
Updates the status of an existing order. Emits a real-time `orderUpdated` socket event. Strict validation ensures status cannot move backward unless executed by a `SUPER_ADMIN`.
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "status": "READY"
  }
  ```
- **Valid Statuses**: `PLACED`, `PREPARING`, `READY`, `DELIVERED`, `COMPLETED`, `CANCELLED`.
- **Response**: `200 OK`

---

## 📊 Analytics APIs

### `GET /api/analytics/orders-per-day`
Returns time-series data of order volumes over the last 30 days.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
  ```json
  {
    "data": [
      { "date": "2026-08-20", "count": 14 }
    ]
  }
  ```

### `GET /api/analytics/revenue-per-store`
Calculates total revenue grouped by store.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`
  ```json
  {
    "data": [
      { "store_id": "uuid", "revenue": 14500.00 }
    ]
  }
  ```

### `GET /api/analytics/top-items`
Returns the 5 most frequently ordered items across all stores.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

---

## 🗄️ Archival API

### `POST /api/archive/archive-old-orders`
Moves all `COMPLETED` or `CANCELLED` orders older than 30 days into the `orders_archive` table to optimize main table performance.
- **Headers**: `Authorization: Bearer <SUPER_ADMIN_TOKEN>`
- **Response**: `200 OK`
  ```json
  {
    "message": "Archival process completed successfully",
    "data": { "archivedCount": 120 }
  }
  ```
