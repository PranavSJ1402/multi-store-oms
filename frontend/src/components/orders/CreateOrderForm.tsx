'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { OrderItem } from '@/lib/types';

export function CreateOrderForm() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const storeId = params.storeId as string;
  const [items, setItems] = useState<OrderItem[]>([{ item_id: '', qty: 1 }]);
  const [totalAmount, setTotalAmount] = useState<string>('');

  const mutation = useMutation({
    mutationFn: api.createOrder,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast('Order placed successfully!', 'success', 'Order Created');
      router.push('/orders');
    },
    onError: (err: Error) => {
      toast(err.message || 'Failed to create order. Is the backend running?', 'error', 'Error');
    },
  });

  const addItem = () => setItems((prev) => [...prev, { item_id: '', qty: 1 }]);

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const filledItems = items.filter((i) => i.item_id.trim());
    if (filledItems.length === 0) {
      toast('Please add at least one item with an ID', 'error');
      return;
    }

    const amount = parseFloat(totalAmount);
    if (!amount || amount <= 0) {
      toast('Please enter a valid total amount', 'error');
      return;
    }

    mutation.mutate({
      store_id: storeId,
      items: filledItems.map((i) => ({ item_id: i.item_id.trim(), qty: Number(i.qty) })),
      total_amount: amount,
    });
  };

  return (
    <Card className="p-7">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Checkout</h2>
          <p className="text-sm text-gray-500">Completing order for store: {storeId}</p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-[0.85rem] font-semibold text-gray-500 dark:text-gray-400 tracking-wide">Order Items</label>
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
              + Add Item
            </Button>
          </div>

          <div className="flex flex-col gap-2.5">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex gap-3 items-end bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.07] rounded-xl p-3.5"
              >
                <div className="flex-1">
                  <label htmlFor={`item-id-${index}`} className="block text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide mb-1">Item ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BURGER_CLASSIC"
                    value={item.item_id}
                    onChange={(e) => updateItem(index, 'item_id', e.target.value)}
                    id={`item-id-${index}`}
                    className="w-full px-3 py-2 text-[0.875rem] rounded-md border outline-none transition-colors duration-150 bg-white dark:bg-black/20 text-gray-900 dark:text-white border-gray-200 dark:border-white/[0.07] focus:border-indigo-500 dark:focus:border-indigo-400"
                  />
                </div>
                <div className="w-[90px]">
                  <label htmlFor={`item-qty-${index}`} className="block text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={item.qty}
                    onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 1)}
                    id={`item-qty-${index}`}
                    className="w-full px-3 py-2 text-[0.875rem] rounded-md border outline-none transition-colors duration-150 bg-white dark:bg-black/20 text-gray-900 dark:text-white border-gray-200 dark:border-white/[0.07] focus:border-indigo-500 dark:focus:border-indigo-400"
                  />
                </div>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="flex-shrink-0 mb-px px-2.5"
                    aria-label={`Remove item ${index + 1}`}
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="total-amount" className="block text-[0.85rem] font-semibold text-gray-500 dark:text-gray-400 tracking-wide mb-1.5">Total Amount (₹)</label>
          <input
            id="total-amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            className="w-full px-3.5 py-2.5 text-[0.875rem] rounded-md border outline-none transition-colors duration-150 bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-white border-gray-200 dark:border-white/[0.07] focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-indigo-50 dark:focus:bg-indigo-500/[0.04]"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-white/[0.07]">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {mutation.isPending ? 'Placing Order...' : 'Place Order'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
