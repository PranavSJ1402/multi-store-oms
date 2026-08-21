import React from 'react';
import { cn } from '@/lib/cn';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 20, className }) => (
  <span
    className={cn('spinner', className)}
    style={{ width: size, height: size }}
    role="status"
    aria-label="Loading"
  />
);
