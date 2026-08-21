'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { OrderStatus } from '@/lib/types';
import { useAuthStore } from '@/lib/authStore';

interface Props {
  orderId: string;
  currentStatus: OrderStatus | string;
}

const STATUS_OPTIONS: { value: OrderStatus; label: string; desc: string }[] = [
  { value: 'PLACED', label: 'Placed', desc: 'Order received, not yet started' },
  { value: 'PREPARING', label: 'Preparing', desc: 'Order is being prepared' },
  { value: 'READY', label: 'Ready', desc: 'Order is ready for delivery' },
  { value: 'DELIVERED', label: 'Delivered', desc: 'Order delivered to customer' },
  { value: 'COMPLETED', label: 'Completed', desc: 'Order fully closed' },
  { value: 'CANCELLED', label: 'Cancelled', desc: 'Order cancelled completely' },
];

export function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<OrderStatus>(currentStatus as OrderStatus || 'PLACED');
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: () => api.updateOrderStatus(orderId, status),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast(`Status updated to ${status}`, 'success', 'Order Updated');
      // Refresh the server component data
      router.refresh();
    },
    onError: (err: Error) => {
      toast(err.message || 'Failed to update status', 'error', 'Error');
    },
  });

  const isUnchanged = status === currentStatus;

  return (
    <Card style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Update Status
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {STATUS_OPTIONS.map((opt, idx) => {
          const optIndex = STATUS_OPTIONS.findIndex(o => o.value === opt.value);
          const currentIndex = STATUS_OPTIONS.findIndex(o => o.value === currentStatus);
          const isDisabled = user?.role !== 'SUPER_ADMIN' && optIndex < currentIndex;
          
          return (
            <label
              key={opt.value}
              htmlFor={`status-${opt.value}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 14px', borderRadius: 'var(--radius-sm)', 
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                border: '1px solid var(--border)',
                borderLeft: `3px solid ${status === opt.value ? 'var(--accent)' : 'var(--border)'}`,
                background: 'transparent',
                transition: 'border-color 0.15s',
                opacity: isDisabled ? 0.5 : 1,
              }}
            >
              <input
                type="radio"
                id={`status-${opt.value}`}
                name="order-status"
                value={opt.value}
                checked={status === opt.value}
                onChange={() => setStatus(opt.value)}
                disabled={isDisabled}
                style={{ accentColor: 'var(--accent)', cursor: isDisabled ? 'not-allowed' : 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                  {isDisabled ? `🚫 ${opt.label}` : opt.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{opt.desc}</div>
              </div>
              {opt.value === currentStatus && (
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Current
                </span>
              )}
            </label>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={() => router.back()}>
          Back
        </Button>
        <Button
          onClick={() => mutation.mutate()}
          isLoading={mutation.isPending}
          disabled={isUnchanged || mutation.isPending}
        >
          {mutation.isPending ? 'Updating...' : 'Update Status'}
        </Button>
      </div>
    </Card>
  );
}
