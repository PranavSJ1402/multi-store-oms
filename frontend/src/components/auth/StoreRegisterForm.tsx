'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function StoreRegisterForm() {
  const router = useRouter();
  const login = useAuthStore(s => s.login);

  const [form, setForm] = useState({ 
    store_name: '', 
    email: '', 
    password: '', 
    address: '', 
    phone: '' 
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/register-store' || 'http://localhost:5000/api/auth/register-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register store');
      
      login(data.data.user, data.data.token);
      router.push('/store-dashboard');
      router.refresh();
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
          <div className="px-3.5 py-3 rounded-md bg-red-500/10 border border-red-500/25 border-l-[3px] border-l-red-400 text-sm text-red-500">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[0.85rem] font-semibold text-gray-500 mb-1.5">Store Name</label>
          <input type="text" required placeholder="My Store" value={form.store_name} onChange={(e) => update('store_name', e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-md border" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[0.85rem] font-semibold text-gray-500 mb-1.5">Email Address</label>
            <input type="email" required placeholder="admin@store.com" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-md border" />
          </div>
          <div>
            <label className="block text-[0.85rem] font-semibold text-gray-500 mb-1.5">Password</label>
            <input type="password" required placeholder="Min. 6 characters" value={form.password} onChange={(e) => update('password', e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-md border" />
          </div>
        </div>

        <div>
          <label className="block text-[0.85rem] font-semibold text-gray-500 mb-1.5">Store Address</label>
          <input type="text" placeholder="123 Main St" value={form.address} onChange={(e) => update('address', e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-md border" />
        </div>

        <div>
          <label className="block text-[0.85rem] font-semibold text-gray-500 mb-1.5">Phone Number</label>
          <input type="tel" placeholder="+1 555-0192" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-md border" />
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full mt-2 py-2.5">
          {isLoading ? 'Creating Store…' : 'Register Store'}
        </Button>
      </form>
    </Card>
  );
}
