import React from 'react';
import { cn } from '@/lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variants: Record<string, string> = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-600 hover:border-indigo-500',
  secondary:
    'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5',
  danger:
    'bg-transparent text-red-500 dark:text-red-400 border-red-300/60 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-400 dark:hover:border-red-500/50',
};

const sizes: Record<string, string> = {
  sm: 'px-3 py-1 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  ...props
}) => (
  <button
    className={cn(
      'inline-flex items-center justify-center gap-1.5 font-semibold border cursor-pointer',
      'whitespace-nowrap no-underline leading-none font-sans transition-colors duration-150',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      variants[variant],
      sizes[size],
      className
    )}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading && (
      <span
        className="spinner flex-shrink-0"
        style={{ width: 13, height: 13 }}
        aria-hidden="true"
      />
    )}
    {children}
  </button>
);
