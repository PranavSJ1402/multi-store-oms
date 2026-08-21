'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function StoreProfilePage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [storeName, setStoreName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Ideally we would fetch the store by ID here to populate the name.
    // For now we'll just allow them to set a new name, which will PATCH.
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.storeId || !storeName) return;

    setIsLoading(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + `/stores/${user.storeId}` || `http://localhost:5000/api/stores/${user.storeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`
        },
        body: JSON.stringify({ name: storeName })
      });
      
      if (!res.ok) throw new Error('Failed to update store');
      toast('Store profile updated successfully', 'success');
      setStoreName('');
    } catch (err) {
      toast('Error updating profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Store Profile</h1>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Store Details</h2>
        <p className="text-sm text-gray-500 mb-6">Update your store's public information.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1">Store Name</label>
            <input 
              type="text" 
              placeholder="e.g. Burger Haven" 
              value={storeName} onChange={e => setStoreName(e.target.value)} 
              className="w-full px-3 py-2 rounded-md border bg-gray-50 dark:bg-black/20 dark:text-white border-gray-200 dark:border-white/[0.07]" 
              required 
            />
          </div>
          <Button type="submit" isLoading={isLoading}>Update Profile</Button>
        </form>
      </Card>
    </div>
  );
}
