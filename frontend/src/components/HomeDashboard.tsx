'use client';

import Link from 'next/link';
import type { RevenuePerStore, TopItem } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Props {
  revenueData: RevenuePerStore[];
  topItems: TopItem[];
  totalRevenue: number;
  totalStores: number;
}

import { useAuthStore } from '@/lib/authStore';

export function HomeDashboard({ revenueData, topItems, totalRevenue, totalStores }: Props) {
  const maxRevenue = Math.max(...revenueData.map((s) => s.revenue), 1);
  const { user } = useAuthStore();

  const { data: storesRes } = useQuery({
    queryKey: ['stores'],
    queryFn: () => api.getStores(),
  });
  const stores = storesRes?.data || [];

  return (
    <div className="animate-fade-in flex flex-col gap-7">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-[#eeeef6]">
          <span className="text-gradient">Multi-Store OMS</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-500 mt-1.5 text-sm">
          Real-time order management across all stores.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} />
        <StatCard label="Active Stores" value={String(totalStores || '—')} />
        <StatCard label="Top Item" value={topItems[0]?.item_id || '—'} />
      </div>

      {/* Revenue by Store */}
      {revenueData.length > 0 && (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-xl p-5 transition-colors">
          <SectionLabel>Revenue by store</SectionLabel>
          <div className="flex flex-col gap-3.5 mt-3">
            {revenueData.map((store) => (
              <div key={store.store_id}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {stores.find((s: any) => s.id === store.store_id)?.name || store.store_id}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-[#eeeef6]">
                    ₹{store.revenue.toFixed(2)}
                  </span>
                </div>
                <div className="h-[3px] bg-gray-100 dark:bg-white/[0.06] rounded-full">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${(store.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <SectionLabel>Quick actions</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2.5">
          <ActionCard href="/orders" title="View Orders" desc="Browse and filter orders by store" />
          <ActionCard href="/analytics" title="Analytics" desc="Revenue charts and top items" />
          <ActionCard href="/archive" title="Archive" desc="Move old orders to archive" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-xl p-5 hover:border-gray-300 dark:hover:border-white/[0.14] transition-colors">
      <div className="text-[0.7rem] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-2.5">
        {label}
      </div>
      <div className="text-[1.65rem] font-bold tracking-tight text-gray-900 dark:text-[#eeeef6]">
        {value}
      </div>
    </div>
  );
}

function ActionCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="no-underline block">
      <div className="
        bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-xl
        p-4 cursor-pointer transition-colors duration-150
        hover:bg-gray-50 dark:hover:bg-white/[0.055] hover:border-gray-300 dark:hover:border-white/[0.14]
      ">
        <div className="font-semibold text-[0.9rem] text-gray-900 dark:text-[#eeeef6] mb-0.5">{title}</div>
        <div className="text-[0.8rem] text-gray-400 dark:text-gray-500">{desc}</div>
      </div>
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[0.7rem] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">
      {children}
    </div>
  );
}
