import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { AnalyticsClient } from '@/components/analytics/AnalyticsClient';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Orders per day, revenue per store, and top selling items',
};

// Server Component: all three analytics endpoints fetched in parallel on the server
export default async function AnalyticsPage() {
  const [ordersPerDayRes, revenueRes, topItemsRes] = await Promise.allSettled([
    api.getOrdersPerDay(),
    api.getRevenuePerStore(),
    api.getTopItems(),
  ]);

  const ordersPerDay = ordersPerDayRes.status === 'fulfilled' ? ordersPerDayRes.value.data : [];
  const revenuePerStore = revenueRes.status === 'fulfilled' ? revenueRes.value.data : [];
  const topItems = topItemsRes.status === 'fulfilled' ? topItemsRes.value.data : [];

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Orders, revenue, and top items — server-rendered, always fresh.
        </p>
      </div>
      <AnalyticsClient
        ordersPerDay={ordersPerDay}
        revenuePerStore={revenuePerStore}
        topItems={topItems}
      />
    </div>
  );
}
