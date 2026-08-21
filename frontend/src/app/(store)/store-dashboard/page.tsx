'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function StoreDashboard() {
  const { user } = useAuthStore();
  const storeId = user?.storeId || '';

  const { data: ordersRes, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', storeId, 1],
    queryFn: () => api.getOrders(storeId, 1),
    enabled: !!storeId,
  });

  const { data: productsRes, isLoading: productsLoading } = useQuery({
    queryKey: ['products', storeId],
    queryFn: () => api.getProducts(storeId),
    enabled: !!storeId,
  });

  const orders = ordersRes?.data || [];
  const totalOrders = ordersRes?.meta?.total || 0;
  
  // Calculate real revenue from delivered orders
  const revenue = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeOrders = orders.filter(o => ['PLACED', 'PREPARING', 'READY'].includes(o.status)).length;
  const totalProducts = productsRes?.data?.length || 0;

  return (
    <div className="pb-20">
      {/* Merchant Dashboard Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#12121a] mb-8">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-indigo-100 dark:border-indigo-800">
              🏪
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {user?.name || 'Store Operations'}
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                {user?.address || 'Command center overview'}
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link href="/orders" className="flex-1 md:flex-none">
              <Button className="w-full shadow-sm">View Live Orders</Button>
            </Link>
            <Link href="/menu" className="flex-1 md:flex-none">
              <Button variant="secondary" className="w-full shadow-sm">Manage Menu</Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          
          <Card className="p-6 md:col-span-2 shadow-sm bg-white dark:bg-[#12121a]">
            <h2 className="text-gray-500 dark:text-gray-400 font-semibold text-sm mb-1">Total Revenue</h2>
            <div className="text-4xl font-bold mt-4 text-gray-900 dark:text-white">
              ₹{ordersLoading ? '---' : revenue.toLocaleString()}
            </div>
            <p className="text-gray-400 text-xs mt-2">From delivered orders</p>
          </Card>

          <Card className="p-6 border-l-[4px] border-l-emerald-500 shadow-lg hover:-translate-y-1 transition-transform duration-300 bg-white dark:bg-[#12121a]">
            <h2 className="text-gray-500 dark:text-gray-400 font-bold uppercase text-xs tracking-wider">Active Orders</h2>
            <div className="text-5xl font-black mt-4 text-gray-900 dark:text-white">
              {ordersLoading ? '-' : activeOrders}
            </div>
            <Link href="/orders" className="text-sm text-emerald-600 dark:text-emerald-400 font-bold mt-6 flex items-center gap-1 group">
              Requires attention 
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="p-5 flex-1 shadow-md hover:-translate-y-1 transition-transform duration-300 bg-white dark:bg-[#12121a]">
              <h2 className="text-gray-500 dark:text-gray-400 font-bold uppercase text-xs tracking-wider mb-2">Total Orders</h2>
              <div className="text-3xl font-black text-gray-900 dark:text-white">{ordersLoading ? '-' : totalOrders}</div>
            </Card>

            <Card className="p-5 flex-1 shadow-md hover:-translate-y-1 transition-transform duration-300 bg-white dark:bg-[#12121a]">
              <h2 className="text-gray-500 dark:text-gray-400 font-bold uppercase text-xs tracking-wider mb-2">Menu Items</h2>
              <div className="text-3xl font-black text-gray-900 dark:text-white">{productsLoading ? '-' : totalProducts}</div>
            </Card>
          </div>
        </div>

        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Recent Activity</h2>
          <Link href="/orders" className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline">View All</Link>
        </div>
        
        <Card className="p-0 overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#12121a]">
          {ordersLoading ? (
            <div className="p-16 flex justify-center items-center gap-3 text-gray-500">
              <span className="animate-pulse">Fetching recent orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-20 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center text-2xl mb-4 border border-dashed border-gray-300 dark:border-gray-700">
                🍽️
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No orders yet</h3>
              <p className="max-w-sm text-sm">When users order from your store, they will automatically appear here in real-time.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0b0b10]">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order: any) => (
                  <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => window.location.href = `/orders/${order.id}`}>
                    <td className="px-6 py-5 font-mono text-[0.85rem] font-medium text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 text-[11px] font-black tracking-widest uppercase rounded-md border
                        ${order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                          order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : 
                          order.status === 'READY' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                          'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-black text-[0.95rem] text-right text-gray-900 dark:text-white">
                      ₹{order.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
