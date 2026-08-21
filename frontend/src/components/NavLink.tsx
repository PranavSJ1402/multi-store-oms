'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center px-3 py-1.5 text-sm font-medium whitespace-nowrap no-underline transition-colors duration-150',
        'border-b-2',
        isActive
          ? 'text-gray-900 dark:text-white font-semibold border-indigo-500 rounded-none'
          : 'text-gray-500 dark:text-gray-400 border-transparent rounded-lg hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.06]'
      )}
    >
      {children}
    </Link>
  );
}
