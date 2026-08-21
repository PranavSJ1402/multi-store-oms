import React from 'react';
import { cn } from '@/lib/cn';
import type { OrderStatus } from '@/lib/types';

interface BadgeProps {
  status: OrderStatus | string;
}

const statusClasses: Record<string, string> = {
  PLACED:
    'text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20',
  PREPARING:
    'text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',
  READY:
    'text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20',
  DELIVERED:
    'text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20',
  COMPLETED:
    'text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
  CANCELLED:
    'text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20',
};

const dotClasses: Record<string, string> = {
  PLACED:    'bg-blue-500 dark:bg-blue-400',
  PREPARING: 'bg-amber-500 dark:bg-amber-400 animate-pulse-dot',
  READY:     'bg-indigo-500 dark:bg-indigo-400',
  DELIVERED: 'bg-teal-500 dark:bg-teal-400',
  COMPLETED: 'bg-emerald-500 dark:bg-emerald-400',
  CANCELLED: 'bg-red-500 dark:bg-red-400',
};

export const Badge: React.FC<BadgeProps> = ({ status }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
      'text-[0.72rem] font-semibold tracking-wide',
      statusClasses[status] ?? 'text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10'
    )}
  >
    <span
      className={cn('w-[5px] h-[5px] rounded-full flex-shrink-0', dotClasses[status] ?? 'bg-gray-400')}
    />
    {status.charAt(0) + status.slice(1).toLowerCase()}
  </span>
);
