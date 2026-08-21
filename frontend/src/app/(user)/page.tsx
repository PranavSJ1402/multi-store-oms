'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/authStore';
import { Button } from '@/components/ui/Button';
import { useEffect } from 'react';

// Function to generate a stable, beautiful gradient class based on store ID
const getGradient = (id: string) => {
  const gradients = [
    'from-indigo-500 to-purple-500',
    'from-pink-500 to-rose-500',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-500',
    'from-cyan-400 to-blue-500',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export default function UserDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Redirect admins away from the consumer app
  useEffect(() => {
    if (user?.role === 'STORE_ADMIN') {
      router.push('/store-dashboard');
    } else if (user?.role === 'SUPER_ADMIN') {
      router.push('/admin-dashboard');
    }
  }, [user, router]);

  const { data: storesResponse, isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: () => api.getStores(),
  });

  const stores = storesResponse?.data || [];

  return (
    <div className="animate-fade-in pb-12">

      <div className="bg-[#0f172a] text-white py-16 px-8 mb-10 md:rounded-3xl shadow-xl max-w-7xl mx-auto mt-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-indigo-200 mb-4 border border-white/10">Food Delivery</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white leading-tight">
              {user ? `What's on the menu today, ${user.name.split(' ')[0]}?` : 'Craving something? We got it.'}
            </h1>
            <p className="text-slate-300 text-lg max-w-xl font-medium">
              Explore our curated selection of local kitchens. Order your favorite meals directly to your door.
            </p>
          </div>
          {user && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center w-full md:w-72 shadow-2xl">
              <div className="text-3xl mb-3">🍔</div>
              <h3 className="font-bold mb-1 text-white text-lg">Your cravings, saved</h3>
              <p className="text-sm text-slate-300 mb-5">Quickly reorder your past favorites.</p>
              <Link href="/orders">
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold border-none shadow-md">View Past Orders</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Popular Stores</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">Select a kitchen to view their exclusive menu</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800/40 rounded-2xl h-[300px] border border-gray-200 dark:border-gray-800" />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-[#0f0f15] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="text-5xl mb-4 opacity-80">🏪</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Stores Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">We couldn't find any active stores right now. Please check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store: any) => (
              <Link key={store.id} href={`/${store.id}/menu`} className="block group h-full">
                <Card className="p-0 overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 border border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#12121a]">

                  <div className="h-24 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-500/20 relative flex items-center justify-center transition-colors group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40">
                    <span className="text-3xl">🏪</span>
                  </div>

                  <div className="p-6 pt-10 flex-1 flex flex-col">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {store.name}
                    </h3>

                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2 line-clamp-2 flex-1 leading-relaxed">
                      <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {store.address || 'Address not provided'}
                    </p>

                    <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800/80 flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        View Menu
                      </span>
                      <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white text-indigo-500 transition-colors">
                        <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
