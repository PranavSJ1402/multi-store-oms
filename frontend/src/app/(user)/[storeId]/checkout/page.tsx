'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCartStore } from '@/lib/cartStore';
import { useAuthStore } from '@/lib/authStore';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.storeId as string;
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const total = getTotal();

  useEffect(() => {
    if (items.length === 0) {
      toast('Your cart is empty', 'error');
      router.push(`/${storeId}/menu`);
    }
  }, [items, router, storeId, toast]);

  const handleCheckout = async () => {
    if (!user) {
      toast('Please login to place an order', 'error');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        store_id: storeId,
        items: items.map(i => ({ product_id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
        total_amount: total
      };

      await api.createOrder(orderPayload);
      clearCart();
      toast('Order placed successfully!', 'success');
      router.push('/');
    } catch (err: any) {
      toast(err.message || 'Failed to place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="divide-y divide-gray-200 dark:divide-white/[0.07]">
          {items.map(item => (
            <div key={item.id} className="py-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">{item.quantity} x ₹{item.price}</p>
              </div>
              <p className="font-semibold">₹{item.price * item.quantity}</p>
            </div>
          ))}
        </div>
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-white/[0.07] flex justify-between items-center">
          <p className="text-lg font-bold">Total Amount</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">₹{total}</p>
        </div>
      </Card>

      <div className="flex gap-4">
        <Button variant="secondary" className="flex-1" onClick={() => router.push(`/${storeId}/menu`)}>
          Back to Menu
        </Button>
        <Button className="flex-1" onClick={handleCheckout} isLoading={isSubmitting}>
          Confirm & Pay
        </Button>
      </div>
    </div>
  );
}
