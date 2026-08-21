'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

import { api } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/lib/authStore';
import type { PaginatedResponse, Order } from '@/lib/types';
import { cn } from '@/lib/cn';

interface Props {
  initialData: PaginatedResponse<Order> | null;
  initialStoreId: string;
}

export function OrdersClient({ initialData, initialStoreId }: Props) {
  const { user } = useAuthStore();

  const defaultStoreId = user?.storeId ?? '';
  const [storeId, setStoreId] = useState<string>(defaultStoreId);
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket(storeId);
  const { toast } = useToast();

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['orders', storeId, page],
    queryFn: () => api.getOrders(storeId, page),
    initialData:
      storeId === initialStoreId && page === 1
        ? initialData ?? undefined
        : undefined,
    placeholderData: (prev) => prev,
  });

  const { data: storesRes } = useQuery({
    queryKey: ['stores'],
    queryFn: () => api.getStores(),
  });
  const stores = storesRes?.data || [];
  const storeName = stores.find((s: any) => s.id === storeId)?.name || storeId;

  useEffect(() => {
    if (!socket) return;

    const handleOrderCreated = (newOrder: Order) => {
      queryClient.invalidateQueries({
        queryKey: ['orders', storeId],
      });

      toast(
        `New order placed — #${newOrder.orderNumber}`,
        'success',
        'New Order'
      );
    };

    const handleOrderUpdated = (updatedOrder: Order) => {
      queryClient.invalidateQueries({
        queryKey: ['orders', storeId],
      });

      toast(
        `Order #${updatedOrder.orderNumber} → ${updatedOrder.status}`,
        'info',
        'Status Updated'
      );
    };

    socket.on('orderCreated', handleOrderCreated);
    socket.on('orderUpdated', handleOrderUpdated);

    return () => {
      socket.off('orderCreated', handleOrderCreated);
      socket.off('orderUpdated', handleOrderUpdated);
    };
  }, [socket, storeId, queryClient, toast]);

  // Admin naturally defaults to '' which shows all orders. No need to auto-select the first store.

  const handleStoreChange = (newStoreId: string) => {
    setStoreId(newStoreId);
    setPage(1);
  };

  const meta = data?.meta;
  const orders = data?.data ?? [];

  return (
    <div className="animate-fade-in flex flex-col gap-6">

      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Orders
          </h1>

          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-2">
            <span
              className={cn(
                'inline-block w-1.5 h-1.5 rounded-full flex-shrink-0',
                isConnected
                  ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse-dot'
                  : 'bg-gray-300 dark:bg-gray-600'
              )}
            />

            {meta ? `${meta.total} orders` : 'Fetching orders…'}

            {isFetching && !isLoading && (
              <span className="text-gray-400 dark:text-gray-500">
                · syncing
              </span>
            )}
          </p>
        </div>

        <div className="flex gap-2.5 items-center flex-wrap">
          {user?.role === 'SUPER_ADMIN' && (
            <select
              id="store-filter"
              value={storeId}
              onChange={(e) => handleStoreChange(e.target.value)}
              className="
                w-auto min-w-[120px]
                px-3 py-2
                text-sm
                rounded-lg
                border
                outline-none
                appearance-none
                transition-colors
                duration-150
                bg-gray-50
                dark:bg-white/[0.04]
                text-gray-900
                dark:text-white
                border-gray-200
                dark:border-white/[0.07]
                focus:border-indigo-500
                dark:focus:border-indigo-400
                focus:bg-indigo-50
                dark:focus:bg-indigo-500/[0.04]
              "
              aria-label="Filter by store"
            >
              {stores.length > 0 ? (
                <>
                  <option value="" className="bg-white dark:bg-[#16161f] text-gray-900 dark:text-white">
                    All Stores
                  </option>
                  {stores.map((store: any) => (
                    <option
                      key={store.id}
                      value={store.id}
                      className="bg-white dark:bg-[#16161f] text-gray-900 dark:text-white"
                    >
                      {store.name}
                    </option>
                  ))}
                </>
              ) : (
                <option value="" disabled>Loading stores...</option>
              )}
            </select>
          )}
        </div>
      </div>

      <Card className="p-0 overflow-hidden" hover={false}>
        {isLoading ? (
          <div className="flex justify-center items-center p-16 gap-3 text-gray-400 dark:text-gray-500">
            <Spinner size={24} />
            <span>Loading orders...</span>
          </div>
        ) : error ? (
          <div className="p-16 text-center text-red-500">
            ⚠️ Failed to load orders. Make sure the backend is running.
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">📭</div>

            <div className="font-semibold text-lg text-gray-900 dark:text-white">
              No orders found ☹️
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/[0.07]">
                    Order ID
                  </th>

                  <th className="text-left py-3 px-4 text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/[0.07]">
                    Store
                  </th>

                  <th className="text-left py-3 px-4 text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/[0.07]">
                    Date
                  </th>

                  <th className="text-left py-3 px-4 text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/[0.07]">
                    Items
                  </th>

                  <th className="text-left py-3 px-4 text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/[0.07]">
                    Status
                  </th>

                  <th className="text-left py-3 px-4 text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/[0.07]">
                    Total
                  </th>

                  <th className="text-right py-3 px-4 text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/[0.07]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order: Order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-200 dark:border-white/[0.07] hover:bg-gray-50 dark:hover:bg-white/[0.025] transition-colors duration-150 last:border-b-0"
                  >
                    <td className="py-3.5 px-4 text-gray-900 dark:text-white">
                      <span className="font-mono text-[0.82rem] font-bold text-gray-700 dark:text-gray-300">
                        #{order.orderNumber}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[0.85rem] font-medium text-gray-600 dark:text-gray-400">
                      {stores.find((s: any) => s.id === order.storeId)?.name || order.storeId}
                    </td>

                    <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 text-[0.85rem] whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}{' '}
                      <span className="opacity-70">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 text-[0.85rem]">
                      {Array.isArray(order.items)
                        ? order.items.length
                        : '—'}{' '}
                    </td>

                    <td className="py-3.5 px-4">
                      {user?.role === 'STORE_ADMIN' ? (
                        <div className="relative inline-block">
                          <select
                            className={cn(
                              "text-[0.72rem] tracking-wide font-semibold px-2 py-1 rounded-full border outline-none appearance-none pr-6 cursor-pointer focus:ring-2 focus:ring-indigo-500 transition-colors",
                              order.status === 'PLACED' ? 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20' :
                              order.status === 'PREPARING' ? 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20' :
                              order.status === 'READY' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' :
                              order.status === 'DELIVERED' ? 'text-teal-600 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-400 border-teal-200 dark:border-teal-500/20' :
                              order.status === 'COMPLETED' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' :
                              order.status === 'CANCELLED' ? 'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20' :
                              'text-gray-600 bg-gray-50 dark:bg-white/5 dark:text-gray-400 border-gray-200 dark:border-white/10'
                            )}
                            value={order.status}
                            onChange={async (e) => {
                              try {
                                await api.updateOrderStatus(order.id, e.target.value);
                              } catch (err: any) {
                                toast(err?.message || 'Failed to update status', 'error', 'Error');
                                e.target.value = order.status; // revert UI
                              }
                            }}
                          >
                            {(() => {
                              const STATUS_FLOW = ['PLACED', 'PREPARING', 'READY', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
                              const currentIndex = STATUS_FLOW.indexOf(order.status);
                              return STATUS_FLOW.map((status, idx) => {
                                const isDisabled = idx < currentIndex;
                                return (
                                  <option 
                                    key={status} 
                                    value={status} 
                                    disabled={isDisabled} 
                                    className={isDisabled ? "text-gray-400 dark:text-gray-500 italic" : "bg-white dark:bg-gray-900 text-gray-900 dark:text-white"}
                                  >
                                    {isDisabled ? `🚫 ${status}` : status}
                                  </option>
                                );
                              });
                            })()}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-current opacity-70">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      ) : (
                        <Badge status={order.status} />
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-sm text-gray-900 dark:text-white">
                      ₹{order.totalAmount.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-[0.85rem] text-indigo-600 dark:text-indigo-400 font-medium no-underline hover:text-indigo-700 dark:hover:text-indigo-300"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex justify-between items-center px-5 py-4 border-t border-gray-200 dark:border-white/[0.07]">
            <span className="text-[0.85rem] text-gray-500 dark:text-gray-400">
              Page {meta.page} of {meta.totalPages} ({meta.total} orders)
            </span>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                ← Prev
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(meta.totalPages, p + 1))
                }
                disabled={page >= meta.totalPages}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}