import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { HomeDashboard } from '@/components/HomeDashboard';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Multi-store order management overview with real-time analytics',
};

// This is a Server Component — data is fetched on the server
export default async function HomePage() {
  // Parallel server-side data fetch — no client-side waterfalls
  const [revenueRes, topItemsRes] = await Promise.allSettled([
    api.getRevenuePerStore(),
    api.getTopItems(),
  ]);

  const revenueData = revenueRes.status === 'fulfilled' ? revenueRes.value.data : [];
  const topItems = topItemsRes.status === 'fulfilled' ? topItemsRes.value.data : [];

  const totalRevenue = revenueData.reduce((sum, s) => sum + s.revenue, 0);
  const totalStores = revenueData.length;

  return (
    <HomeDashboard
      revenueData={revenueData}
      topItems={topItems}
      totalRevenue={totalRevenue}
      totalStores={totalStores}
    />
  );
}
