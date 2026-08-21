'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.login(email, password);
      login(res.data.user, res.data.token);

      // Redirect based on role
      const role = res.data.user.role;
      let target = searchParams.get('from');

      if (!target || target === '/login' || target === '/admin') {
        if (role === 'SUPER_ADMIN') target = '/admin-dashboard';
        else if (role === 'STORE_ADMIN') target = '/store-dashboard';
        else target = '/';
      }

      router.push(target);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-7">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
        {error && (
          <div className="px-3.5 py-3 rounded-md bg-red-500/10 border border-red-500/25 border-l-[3px] border-l-red-400 text-sm text-red-500 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="login-email" className="block text-[0.85rem] font-semibold text-gray-500 dark:text-gray-400 tracking-wide mb-1.5">Email address</label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            placeholder="abc@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 text-[0.875rem] rounded-md border outline-none transition-colors duration-150 bg-white dark:bg-black/20 text-gray-900 dark:text-white border-gray-200 dark:border-white/[0.07] focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-indigo-50 dark:focus:bg-indigo-500/[0.04]"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-[0.85rem] font-semibold text-gray-500 dark:text-gray-400 tracking-wide mb-1.5">Password</label>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 text-[0.875rem] rounded-md border outline-none transition-colors duration-150 bg-white dark:bg-black/20 text-gray-900 dark:text-white border-gray-200 dark:border-white/[0.07] focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-indigo-50 dark:focus:bg-indigo-500/[0.04]"
          />
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full mt-1 py-2.5">
          {isLoading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <div className="mt-6 text-center text-sm text-gray-500 flex flex-col gap-2">
        <div>
          New user? <a href="/register" className="text-indigo-600 font-medium">Create an account</a>
        </div>
        <div>
          Want to sell? <a href="/register-store" className="text-indigo-600 font-medium">Register your store</a>
        </div>
      </div>
    </Card>
  );
}
