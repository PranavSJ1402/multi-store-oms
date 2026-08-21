'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: () => api.login(email, password),
    onSuccess: (res) => {
      login(res.data.user, res.data.token);
      if (res.data.user.role === 'SUPER_ADMIN') {
        router.push('/dashboard');
      } else if (res.data.user.role === 'STORE_ADMIN') {
        router.push('/store-dashboard');
      } else {
        router.push('/');
      }
    },
    onError: (err: any) => {
      toast(err.message || 'Login failed', 'error');
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-6 -mt-10">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400">Please sign in to your account.</p>
        </div>

        <Card className="p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#12121a]">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="flex flex-col gap-2 mb-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3.5 mt-2 font-bold"
            >
              {loginMutation.isPending ? 'Authenticating...' : 'Sign In'}
            </Button>
          </form>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Register here</Link>
        </div>
      </div>
    </div>
  );
}
