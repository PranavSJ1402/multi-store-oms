import type {
  Order,
  PaginatedResponse,
  ApiResponse,
  OrdersPerDay,
  RevenuePerStore,
  TopItem,
  AuthResponse,
  User,
} from './types';
import { getAuthToken } from './authStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

let serverCookies: any;
if (typeof window === 'undefined') {
  try {
    serverCookies = require('next/headers').cookies;
  } catch (e) {
    // Ignore
  }
}

/**
 * Core fetch wrapper — automatically attaches Authorization header
 * when a token exists in the auth store (or in cookies during SSR).
 */
async function fetchJSON<T>(url: string, options: RequestInit = {}): Promise<T> {
  let token = null;

  if (typeof window !== 'undefined') {
    token = getAuthToken();
  } else if (serverCookies) {
    try {
      const cookieStore = serverCookies();
      token = cookieStore.get('oms_token')?.value || null;
    } catch (e) {
      // Ignore
    }
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // ── Auth ────────────────────────────────────────────────────────────────────
  login: (email: string, password: string): Promise<{ data: AuthResponse; message: string }> =>
    fetchJSON(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role: string): Promise<{ data: AuthResponse; message: string }> =>
    fetchJSON(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  getMe: (): Promise<{ data: User }> =>
    fetchJSON(`${BASE_URL}/auth/me`),

  // ── Orders ──────────────────────────────────────────────────────────────────
  getOrders: (storeId: string, page = 1, limit = 10): Promise<PaginatedResponse<Order>> =>
    fetchJSON(`${BASE_URL}/orders?store_id=${storeId}&page=${page}&limit=${limit}`, {
      cache: 'no-store',
    }),

  getOrderById: (id: string): Promise<ApiResponse<Order>> =>
    fetchJSON(`${BASE_URL}/orders/${id}`, { cache: 'no-store' }),

  createOrder: (data: {
    store_id: string;
    items: { item_id: string; qty: number }[];
    total_amount: number;
  }): Promise<ApiResponse<Order>> =>
    fetchJSON(`${BASE_URL}/orders`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateOrderStatus: (id: string, status: string): Promise<ApiResponse<Order>> =>
    fetchJSON(`${BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // ── Analytics ───────────────────────────────────────────────────────────────
  getOrdersPerDay: (): Promise<{ data: OrdersPerDay[] }> =>
    fetchJSON(`${BASE_URL}/analytics/orders-per-day`, { cache: 'no-store' }),

  getRevenuePerStore: (): Promise<{ data: RevenuePerStore[] }> =>
    fetchJSON(`${BASE_URL}/analytics/revenue-per-store`, { cache: 'no-store' }),

  getTopItems: (): Promise<{ data: TopItem[] }> =>
    fetchJSON(`${BASE_URL}/analytics/top-items`, { cache: 'no-store' }),

  // ── Archive ─────────────────────────────────────────────────────────────────
  archiveOldOrders: (): Promise<{ data: { archivedCount: number }; message: string }> =>
    fetchJSON(`${BASE_URL}/archive/archive-old-orders`, { method: 'POST' }),

  // ── Stores & Products ───────────────────────────────────────────────────────
  getStores: (): Promise<{ data: any[] }> =>
    fetchJSON(`${BASE_URL}/stores`, { cache: 'no-store' }),

  getProducts: (storeId: string): Promise<{ data: any[] }> =>
    fetchJSON(`${BASE_URL}/products?store_id=${storeId}`, { cache: 'no-store' }),

  createProduct: (data: any): Promise<{ data: any; message: string }> =>
    fetchJSON(`${BASE_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteProduct: (id: string): Promise<{ message: string }> =>
    fetchJSON(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
    }),
};
