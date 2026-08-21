'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { OrderStatusUpdater } from '@/components/orders/OrderStatusUpdater';
import { useSocket } from '@/hooks/useSocket';

export default function OrderDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: orderRes, isLoading: orderLoading, error: orderError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.getOrderById(id),
  });

  const order = orderRes?.data;

  const { socket } = useSocket(order?.storeId || '');

  useEffect(() => {
    if (!socket || !order?.id) return;

    const handleUpdate = (updatedOrder: any) => {
      if (updatedOrder.id === order.id) {
        queryClient.setQueryData(['order', order.id], { data: updatedOrder });
      }
    };

    socket.on('orderUpdated', handleUpdate);
    return () => {
      socket.off('orderUpdated', handleUpdate);
    };
  }, [socket, order?.id, queryClient]);

  const { data: productsRes, isLoading: productsLoading } = useQuery({
    queryKey: ['products', order?.storeId],
    queryFn: () => api.getProducts(order?.storeId as string),
    enabled: !!order?.storeId,
  });

  const products = productsRes?.data || [];

  // Map item_id to product name and price
  const getProductDetails = (itemId: string) => {
    const product = products.find((p: any) => p.id === itemId);
    return product ? { name: product.name, price: product.price } : { name: `Item ${itemId.slice(0, 6)}`, price: 0 };
  };

  if (orderLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh] flex-col gap-4">
        <Spinner size={32} />
        <p className="text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (orderError || !order) {
    const isNetworkError = orderError?.message?.includes('fetch failed') || orderError?.message?.toLowerCase().includes('network');

    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {isNetworkError ? 'Connection Error' : 'Order Not Found'}
        </h2>
        <p className="text-gray-500 mb-6">
          {isNetworkError
            ? 'Failed to connect to the backend server. Please make sure the backend is running.'
            : 'This order doesn\'t exist or you don\'t have access to it.'}
        </p>
        <Button onClick={() => router.push('/orders')}>Back to Orders</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 animate-fade-in flex flex-col gap-10">

      <div className="flex flex-col gap-6">
        <button
          onClick={() => router.push('/orders')}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors w-max"
        >
          &larr; Back to Orders
        </button>

        <div className="flex justify-between items-end border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
              Order {order.orderNumber}
            </h1>
            <p className="text-sm text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <span className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-widest ${order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
              order.status === 'READY' ? 'bg-indigo-50 text-indigo-600' :
                order.status === 'PREPARING' ? 'bg-amber-50 text-amber-600' :
                  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
              }`}>
              {order.status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-10">

        <div className="w-full py-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full z-0"></div>
            {(() => {
              const steps = [
                { id: 'PLACED', label: 'Placed' },
                { id: 'PREPARING', label: 'Preparing' },
                { id: 'READY', label: 'Ready' },
                { id: 'DELIVERED', label: 'Delivered' },
                { id: 'COMPLETED', label: 'Completed' }
              ];
              const currentIndex = steps.findIndex(s => s.id === order.status);
              const activeIndex = currentIndex === -1 ? 0 : currentIndex;

              // Progress bar fill
              const progressWidth = `${(activeIndex / (steps.length - 1)) * 100}%`;

              return (
                <>
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 dark:bg-indigo-500 rounded-full z-0 transition-all duration-500 ease-in-out"
                    style={{ width: progressWidth }}
                  ></div>

                  {steps.map((step, idx) => {
                    const isCompleted = idx <= activeIndex;
                    const isCurrent = idx === activeIndex;

                    return (
                      <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                        <div
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                            ? 'bg-indigo-600 border-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.4)]'
                            : 'bg-white dark:bg-[#0b0b10] border-gray-300 dark:border-gray-700'
                            }`}
                        >
                          {isCompleted ? (
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                          )}
                        </div>
                        <span className={`text-[0.65rem] sm:text-xs font-bold uppercase tracking-wider absolute -bottom-7 whitespace-nowrap ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' :
                          isCompleted ? 'text-gray-900 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'
                          }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">Order Items</h3>

          {productsLoading ? (
            <div className="text-sm text-gray-500 animate-pulse py-4">Loading items...</div>
          ) : (
            <div className="flex flex-col">
              {order.items.map((item: any, idx: number) => {
                const details = getProductDetails(item.item_id);
                return (
                  <div key={idx} className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-800/60 last:border-0">
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-gray-400 w-8">{item.qty}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-200">{details.name}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-200">
                      ₹{(details.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <div className="w-full sm:w-1/2 flex justify-between items-center bg-gray-50 dark:bg-white/[0.02] p-5 rounded-lg">
            <span className="text-gray-500 font-medium">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
