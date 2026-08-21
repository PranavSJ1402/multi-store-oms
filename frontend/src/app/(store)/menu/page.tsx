'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function StoreMenuManagement() {
  const { user } = useAuthStore();
  const storeId = user?.storeId || '';
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Mains');

  const { data: productsRes, isLoading } = useQuery({
    queryKey: ['products', storeId],
    queryFn: () => api.getProducts(storeId),
    enabled: !!storeId,
  });

  const mutation = useMutation({
    mutationFn: (data: { name: string; price: number; description: string; store_id: string; category: string }) => 
      api.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', storeId] });
      toast('Product added successfully', 'success');
      setName('');
      setPrice('');
      setDescription('');
    },
    onError: () => toast('Failed to add product', 'error')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    mutation.mutate({ 
      name, 
      price: parseFloat(price), 
      description, 
      store_id: storeId, 
      category
    });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', storeId] });
      toast('Product deleted', 'info');
    },
    onError: () => toast('Failed to delete product', 'error')
  });

  const products = productsRes?.data || [];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Menu Management</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Add new items to your menu and manage existing ones.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-6">Create New Item</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Item Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Classic Burger" 
                  value={name} onChange={e => setName(e.target.value)} 
                  className="w-full px-3.5 py-2.5 text-sm rounded-md border bg-gray-50 dark:bg-black/20 dark:text-white border-gray-200 dark:border-white/[0.07] outline-none focus:border-indigo-500" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={price} onChange={e => setPrice(e.target.value)} 
                    className="w-full px-3.5 py-2.5 text-sm rounded-md border bg-gray-50 dark:bg-black/20 dark:text-white border-gray-200 dark:border-white/[0.07] outline-none focus:border-indigo-500" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                  <select 
                    value={category} onChange={e => setCategory(e.target.value)} 
                    className="w-full px-3.5 py-2.5 text-sm rounded-md border bg-gray-50 dark:bg-[#16161f] dark:text-white border-gray-200 dark:border-white/[0.07] outline-none focus:border-indigo-500"
                  >
                    <option>Starters</option>
                    <option>Mains</option>
                    <option>Desserts</option>
                    <option>Beverages</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea 
                  placeholder="A short description of the item..." 
                  value={description} onChange={e => setDescription(e.target.value)} 
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm rounded-md border bg-gray-50 dark:bg-black/20 dark:text-white border-gray-200 dark:border-white/[0.07] outline-none focus:border-indigo-500 resize-none" 
                />
              </div>
              
              <Button type="submit" isLoading={mutation.isPending} className="mt-2 py-2.5">
                + Publish Item
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-32 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />
              <div className="h-32 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center p-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-500">
              <div className="text-4xl mb-4">🛒</div>
              Your menu is empty.<br/>Create your first item using the form.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {products.map((product: any) => (
                <Card key={product.id} className="p-0 overflow-hidden flex flex-col h-full hover:-translate-y-1 transition-transform duration-200">
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{product.name}</h3>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-sm shrink-0">
                          {product.category || 'Mains'}
                        </span>
                        <button 
                          onClick={() => deleteMutation.mutate(product.id)}
                          disabled={deleteMutation.isPending}
                          className="text-[10px] text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-[0.85rem] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 flex-1">
                      {product.description || 'No description provided.'}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                      <span className="font-extrabold text-lg text-gray-900 dark:text-white">₹{product.price.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
