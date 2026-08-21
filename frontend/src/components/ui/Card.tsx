import React from 'react';
import { cn } from '@/lib/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, style, hover = true }) => (
  <div
    className={cn(
      'bg-white dark:bg-white/[0.03]',
      'border border-gray-200 dark:border-white/[0.07]',
      'rounded-xl transition-colors duration-200',
      hover && 'hover:bg-gray-50 dark:hover:bg-white/[0.055] hover:border-gray-300 dark:hover:border-white/[0.14]',
      className
    )}
    style={style}
  >
    {children}
  </div>
);
