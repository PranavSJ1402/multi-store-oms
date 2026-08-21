'use client';

import React, { createContext, useContext, useCallback, useState } from 'react';
import { cn } from '@/lib/cn';

type ToastType = 'success' | 'info' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const iconMap: Record<ToastType, string> = {
  success: '✓',
  info: '⚡',
  error: '✕',
};

const typeClasses: Record<ToastType, { border: string; iconBg: string; iconColor: string }> = {
  success: {
    border: 'border-l-emerald-500',
    iconBg: 'bg-emerald-500/10 border-emerald-500/30',
    iconColor: 'text-emerald-500',
  },
  info: {
    border: 'border-l-indigo-500',
    iconBg: 'bg-indigo-500/10 border-indigo-500/30',
    iconColor: 'text-indigo-400',
  },
  error: {
    border: 'border-l-red-500',
    iconBg: 'bg-red-500/10 border-red-500/30',
    iconColor: 'text-red-400',
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let counter = 0;

  const toast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = ++counter;
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => {
          const c = typeClasses[t.type];
          return (
            <div
              key={t.id}
              role="alert"
              className={cn(
                'animate-slide-in pointer-events-auto',
                'flex items-start gap-2.5 px-3.5 py-3 rounded-xl',
                'bg-white dark:bg-[#12121a]/95',
                'border border-gray-200 dark:border-white/[0.07]',
                'border-l-[3px]',
                'shadow-lg shadow-black/10 dark:shadow-black/40',
                c.border
              )}
            >
              {/* Icon */}
              <div className={cn('w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold border', c.iconBg, c.iconColor)}>
                {iconMap[t.type]}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                {t.title && (
                  <div className="font-semibold text-sm text-gray-900 dark:text-[#eeeef6] mb-0.5">{t.title}</div>
                )}
                <div className="text-[0.85rem] text-gray-500 dark:text-[#8888a8] leading-snug">{t.message}</div>
              </div>
              {/* Dismiss */}
              <button
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                className="flex-shrink-0 text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-400 cursor-pointer bg-transparent border-none p-0.5 text-sm leading-none"
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
