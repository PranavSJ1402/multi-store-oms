// Shared TypeScript types for the Multi-Store OMS

export type OrderStatus = 'PLACED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
export type UserRole = 'USER' | 'STORE_ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string | null;
  address?: string | null;
  phone?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface OrderItem {
  item_id: string;
  qty: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  storeId: string;
  userId: string | null;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Analytics types
export interface OrdersPerDay {
  date: string;
  count: number;
}

export interface RevenuePerStore {
  store_id: string;
  revenue: number;
}

export interface TopItem {
  item_id: string;
  total_qty: number | string;
}

export interface AnalyticsData {
  ordersPerDay: OrdersPerDay[];
  revenuePerStore: RevenuePerStore[];
  topItems: TopItem[];
}

// Stores are now dynamically fetched from the database
export type StoreId = string;
