'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.register(form.name, form.email, form.password, 'USER');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <Card className="p-7">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
        {error && (
          <div className="px-3.5 py-3 rounded-md bg-red-500/10 border border-red-500/25 border-l-[3px] border-l-red-400 text-sm text-red-500 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="reg-name" className="block text-[0.85rem] font-semibold text-gray-500 dark:text-gray-400 tracking-wide mb-1.5">Full Name</label>
          <input id="reg-name" type="text" required placeholder="John Doe"
            value={form.name} onChange={(e) => update('name', e.target.value)}
            className="w-full px-3.5 py-2.5 text-[0.875rem] rounded-md border outline-none transition-colors duration-150 bg-white dark:bg-black/20 text-gray-900 dark:text-white border-gray-200 dark:border-white/[0.07] focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-indigo-50 dark:focus:bg-indigo-500/[0.04]" />
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-[0.85rem] font-semibold text-gray-500 dark:text-gray-400 tracking-wide mb-1.5">Email Address</label>
          <input id="reg-email" type="email" required placeholder="john@example.com"
            value={form.email} onChange={(e) => update('email', e.target.value)}
            className="w-full px-3.5 py-2.5 text-[0.875rem] rounded-md border outline-none transition-colors duration-150 bg-white dark:bg-black/20 text-gray-900 dark:text-white border-gray-200 dark:border-white/[0.07] focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-indigo-50 dark:focus:bg-indigo-500/[0.04]" />
        </div>

        <div>
          <label htmlFor="reg-password" className="block text-[0.85rem] font-semibold text-gray-500 dark:text-gray-400 tracking-wide mb-1.5">Password</label>
          <input id="reg-password" type="password" required placeholder="Min. 6 characters"
            value={form.password} onChange={(e) => update('password', e.target.value)}
            className="w-full px-3.5 py-2.5 text-[0.875rem] rounded-md border outline-none transition-colors duration-150 bg-white dark:bg-black/20 text-gray-900 dark:text-white border-gray-200 dark:border-white/[0.07] focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-indigo-50 dark:focus:bg-indigo-500/[0.04]" />
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full mt-1 py-2.5">
          {isLoading ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>
    </Card>
  );
}
