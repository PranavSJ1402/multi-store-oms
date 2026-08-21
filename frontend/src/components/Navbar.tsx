'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavLink } from './NavLink';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from './ThemeToggle';
import { useAuthStore } from '@/lib/authStore';

export function Navbar() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/register-store' || pathname.startsWith('/admin');

  return (
    <nav
      className="sticky top-0 z-50 bg-white/90 dark:bg-[#0b0b10]/90 backdrop-blur-lg border-b border-gray-200 dark:border-white/[0.07]"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="font-bold text-[1rem] tracking-tight text-gray-900 dark:text-white">
            ⚡ <span className="text-gradient">OMS</span>
          </span>
        </Link>

        {/* Nav Links */}
        {!isAuthPage && (
          <div className="flex items-center gap-0.5">
            {(!user || user.role === 'USER') && (
              <>
                <NavLink href="/">Stores</NavLink>
                <NavLink href="/create-order">Create Order</NavLink>
                <NavLink href="/orders">My Orders</NavLink>
              </>
            )}

            {user?.role === 'STORE_ADMIN' && (
              <>
                <NavLink href="/store-dashboard">Store Dashboard</NavLink>
                <NavLink href="/orders">Live Orders</NavLink>
                <NavLink href="/menu">Menu Management</NavLink>
              </>
            )}

            {user?.role === 'SUPER_ADMIN' && (
              <>
                <NavLink href="/admin-dashboard">Admin Dashboard</NavLink>
                <NavLink href="/analytics">Analytics</NavLink>
                <NavLink href="/archive">Archive</NavLink>
              </>
            )}
          </div>
        )}

        {/* Right side — theme toggle + user menu */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!isAuthPage && (
            user ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-800 pl-4">
                <Link href="/login" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Log in
                </Link>
                <Link href="/register" className="text-sm font-bold bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                  Sign up
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
