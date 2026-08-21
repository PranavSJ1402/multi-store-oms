'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { cn } from '@/lib/cn';

export function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
    router.refresh();
  };

  if (!user) return null;

  const isAdmin = user.role === 'SUPER_ADMIN';

  return (
    <div className="flex items-center gap-2.5">
      {/* Role badge */}
      <span className={cn(
        'text-[0.68rem] font-bold tracking-widest px-2 py-0.5 rounded-full border',
        isAdmin
          ? 'text-indigo-400 dark:text-indigo-300 border-indigo-300/40 dark:border-indigo-500/30'
          : 'text-gray-400 dark:text-gray-500 border-gray-200 dark:border-white/[0.07]'
      )}>
        {user.role}
      </span>

      {/* User name */}
      <span className="text-[0.85rem] text-gray-600 dark:text-gray-400 font-medium hidden sm:block">
        {user.name}
      </span>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="
          px-3 py-1 rounded-lg text-[0.8rem] cursor-pointer font-sans
          border border-gray-200 dark:border-white/[0.07]
          text-gray-500 dark:text-gray-500
          hover:text-red-500 dark:hover:text-red-400
          hover:border-red-300 dark:hover:border-red-500/40
          hover:bg-red-50 dark:hover:bg-red-500/5
          bg-transparent transition-all duration-150
        "
        aria-label="Log out"
      >
        Logout
      </button>
    </div>
  );
}
