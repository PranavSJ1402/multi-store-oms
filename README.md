# 🚀 Multi-Store Order Management System (OMS)

A modern, high-performance Full-Stack Order Management System built for managing multiple stores simultaneously. Features real-time order tracking, robust analytics, secure role-based access, and automated data archival.

## 🌟 Key Features

- **Multi-Tenant Architecture**: Isolate order data between different stores while maintaining global oversight via Super Admin.
- **Real-Time Notifications**: Instant, socket-driven UI updates for order statuses and new orders, eliminating manual refreshes.
- **Robust Role-Based Access Control (RBAC)**: Supports `SUPER_ADMIN`, `STORE_ADMIN`, and `USER` roles with strict JWT-based authorization.
- **Analytics Dashboard**: View total revenue, orders per day, and top selling items visualized dynamically.
- **Automated Archival**: Safely move old orders (> 30 days) into a dedicated `orders_archive` table for maximum active database performance.
- **Data Integrity**: Zod validation schemas strictly enforce valid order status flow (`PLACED ➔ PREPARING ➔ READY ➔ DELIVERED ➔ COMPLETED ➔ CANCELLED`).

## 🛠️ Technology Stack

**Frontend**
- Next.js (App Router)
- React 18
- Tailwind CSS (Utility-first styling with dark mode support)
- React Query (Data fetching, caching, and state management)
- Socket.IO-Client (Real-time events)

**Backend**
- Node.js & Express
- TypeScript
- Prisma ORM
- PostgreSQL / MySQL (Database agnostic via Prisma)
- Zod (Strict API payload validation)
- JSON Web Tokens (Authentication)
- Socket.IO (WebSockets)

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- Postgres / MySQL Database running locally or remotely

### 2. Install Dependencies
Navigate to the root and install dependencies for both frontend and backend:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Environment Variables
Create a `.env` file in the **backend** directory:
```env
PORT=5000
DATABASE_URL="mysql://root:password@localhost:3306/oms_db"
JWT_SECRET="your_super_secret_key"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
```

Create a `.env.local` file in the **frontend** directory:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

### 4. Database Setup (Prisma)
From the `backend` directory, run:
```bash
# Push schema to the database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 5. Running the Application
Open two separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The app will be running at `http://localhost:3000`.

---

## 🏗️ Architecture & Database Design

### Schema Overview (Prisma)
- **`Store`**: Represents a vendor/store entity.
- **`User`**: System administrators, consumers, etc.
- **`Product`**: Items sold by stores.
- **`Order`**: Active orders, heavily indexed for fast querying.
- **`OrderArchive`**: Cold storage for historical orders.

### Indexing Strategy
To ensure `O(log N)` search times as tables grow, indexes are applied to the most queried fields:
- `@@index([storeId])`: For rapidly filtering orders per store.
- `@@index([createdAt])`: For time-series analytics and 30-day archival queries.

---

## 🧪 Testing

1. **Log in as Super Admin:** `admin@system.com`
2. **Log in as Store Admin:** (Use any generated store email)
3. Try creating an order, updating its status, and watching the live tracker automatically progress via WebSockets!

## 📜 Documentation
Please view the [API_DOCS.md](./API_DOCS.md) for a comprehensive list of all backend API routes, payloads, and response structures.
