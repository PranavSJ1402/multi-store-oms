'use client';

import type { OrdersPerDay, RevenuePerStore, TopItem } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Props {
  ordersPerDay: OrdersPerDay[];
  revenuePerStore: RevenuePerStore[];
  topItems: TopItem[];
}

export function AnalyticsClient({ ordersPerDay, revenuePerStore, topItems }: Props) {
  const { data: storesRes } = useQuery({
    queryKey: ['stores'],
    queryFn: () => api.getStores(),
  });
  const stores = storesRes?.data || [];

  const totalOrders = ordersPerDay.reduce((s, d) => s + Number(d.count), 0);
  const totalRevenue = revenuePerStore.reduce((s, r) => s + r.revenue, 0);
  const topItem = topItems[0]?.item_id ?? '—';

  const maxCount = Math.max(...ordersPerDay.map((d) => Number(d.count)), 1);
  const maxRevenue = Math.max(...revenuePerStore.map((r) => r.revenue), 1);
  const maxQty = Math.max(...topItems.map((i) => Number(i.total_qty)), 1);

  // Tailwind colors mapped
  const COLORS = [
    'var(--color-accent)', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6',
  ];

  const isEmpty = ordersPerDay.length === 0 && revenuePerStore.length === 0 && topItems.length === 0;

  if (isEmpty) {
    return (
      <Card className="p-16 text-center">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">No Data Yet</h2>
        <p className="text-gray-500 dark:text-gray-400">Create some orders to see analytics here.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat label="Total Orders (30d)" value={String(totalOrders)} icon="📦" />
        <MiniStat label="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} icon="💰" />
        <MiniStat label="Stores Tracked" value={String(revenuePerStore.length)} icon="🏪" />
        <MiniStat label="Top Selling Item" value={topItem} icon="🔥" />
      </div>

      {/* Orders Per Day Chart */}
      {ordersPerDay.length > 0 && (
        <Card className="p-6">
          <SectionTitle>Orders Per Day (Last 30 Days)</SectionTitle>
          <div className="w-full overflow-x-auto pb-4 pt-4">
            <div className="relative h-48 min-w-[600px] w-full">
              {(() => {
                const orderedDays = [...ordersPerDay].reverse();
                const maxC = maxCount || 1;
                const points = orderedDays.map((day, i) => {
                  const x = orderedDays.length > 1 ? (i / (orderedDays.length - 1)) * 100 : 50;
                  const y = 100 - ((Number(day.count) / maxC) * 85); // 85% height to leave top padding
                  return `${x},${y}`;
                });

                const pathData = points.join(' L ');
                const dLine = `M ${pathData}`;
                const dArea = `M ${pathData} L 100,100 L 0,100 Z`;

                return (
                  <>
                    <svg className="w-full h-[140px] overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d={dArea} fill="url(#area-gradient)" className="transition-all duration-500 ease-in-out" />
                      <path d={dLine} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="drop-shadow-[0_4px_6px_rgba(99,102,241,0.4)]" />

                      {points.map((pt, i) => {
                        const [x, y] = pt.split(',');
                        const day = orderedDays[i];
                        const dateLabel = new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        return (
                          <g key={i} className="group">
                            <circle cx={x} cy={y} r="4" fill="#ffffff" stroke="#6366f1" strokeWidth="2.5" vectorEffect="non-scaling-stroke" className="transition-all duration-200 group-hover:stroke-[4px] cursor-pointer" />
                            <title>{dateLabel}: {day.count} orders</title>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Labels */}
                    <div className="absolute top-[150px] left-0 w-full flex justify-between mt-2">
                      {orderedDays.map((day, i) => {
                        const x = orderedDays.length > 1 ? (i / (orderedDays.length - 1)) * 100 : 50;
                        const dateLabel = new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        const showLabel = orderedDays.length <= 10 || i % Math.ceil(orderedDays.length / 8) === 0 || i === orderedDays.length - 1;
                        if (!showLabel) return null;

                        return (
                          <div key={i} className="absolute text-[0.7rem] font-medium text-gray-500 dark:text-gray-400 transform -translate-x-1/2 whitespace-nowrap" style={{ left: `${x}%` }}>
                            {dateLabel}
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </Card>
      )}

      {/* Revenue Per Store */}
      {revenuePerStore.length > 0 && (
        <Card className="p-6">
          <SectionTitle>Revenue Per Store</SectionTitle>
          <div className="flex flex-col gap-3.5">
            {revenuePerStore.map((store, idx) => {
              const pct = (store.revenue / maxRevenue) * 100;
              const color = COLORS[idx % COLORS.length];
              return (
                <div key={store.store_id}>
                  <div className="flex justify-between mb-1.5 items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {stores.find((s: any) => s.id === store.store_id)?.name || store.store_id}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      ₹{store.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}99)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Top 5 Selling Items */}
      {topItems.length > 0 && (
        <Card className="p-6">
          <SectionTitle>Top 5 Selling Items</SectionTitle>
          <div className="flex flex-col gap-3">
            {topItems.map((item, idx) => {
              const qty = Number(item.total_qty);
              const pct = (qty / maxQty) * 100;
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div key={item.item_id} className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center flex-shrink-0 text-gray-500 dark:text-gray-400 font-bold">
                    {medals[idx] ?? `${idx + 1}`}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-sm font-mono text-gray-900 dark:text-white">{item.item_id}</span>
                      <span className="font-bold text-sm text-amber-600 dark:text-amber-400">
                        {qty.toLocaleString()} sold
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-[width] duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          background: idx === 0
                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                            : idx === 1
                              ? 'linear-gradient(90deg, #9ca3af, #d1d5db)'
                              : idx === 2
                                ? 'linear-gradient(90deg, #b45309, #d97706)'
                                : 'linear-gradient(90deg, #6366f1, #818cf8)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold tracking-wider uppercase text-gray-500 dark:text-gray-400 mb-5">
      {children}
    </h2>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-xl p-5 hover:border-gray-300 dark:hover:border-white/[0.14] transition-colors">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-extrabold tracking-tight mb-1 text-gray-900 dark:text-[#eeeef6]">{value}</div>
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}
