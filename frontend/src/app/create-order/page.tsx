'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface CartItem {
  item_id: string;
  name: string;
  price: number;
  qty: number;
}

export default function CreateOrderPage() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch all stores
  const { data: storesRes, isLoading: storesLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: () => api.getStores(),
  });
  const stores = storesRes?.data || [];

  // Fetch products for selected store
  const { data: productsRes, isLoading: productsLoading } = useQuery({
    queryKey: ['products', selectedStoreId],
    queryFn: () => api.getProducts(selectedStoreId),
    enabled: !!selectedStoreId,
  });
  const products = productsRes?.data || [];
  const selectedStoreName = stores.find((s: any) => s.id === selectedStoreId)?.name;

  // Handle Cart
  const updateCartQty = (product: any, delta: number) => {
    setCart((prev) => {
      const existing = prev[product.id];
      const newQty = (existing?.qty || 0) + delta;

      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      }

      return {
        ...prev,
        [product.id]: {
          item_id: product.id,
          name: product.name,
          price: product.price,
          qty: newQty,
        }
      };
    });
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Submit Order
  const createOrderMutation = useMutation({
    mutationFn: (data: { store_id: string; items: { item_id: string; qty: number }[]; total_amount: number }) =>
      api.createOrder(data),
    onSuccess: () => {
      toast('Order placed successfully!', 'success');
      setCart({});
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      router.push('/orders');
    },
    onError: (err: any) => toast(err.message || 'Failed to place order', 'error')
  });

  const handleCheckout = () => {
    if (!selectedStoreId || cartItems.length === 0) return;
    createOrderMutation.mutate({
      store_id: selectedStoreId,
      items: cartItems.map(i => ({ item_id: i.item_id, qty: i.qty })),
      total_amount: cartTotal
    });
  };

  return (
    <div className="pb-20">

      <div className="bg-[#0f172a] text-white py-16 px-8 mb-10 md:rounded-3xl shadow-xl max-w-7xl mx-auto mt-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 justify-between items-center relative z-10">
          <div className="flex-1 w-full">
            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-indigo-200 mb-4 border border-white/10">Order Food</span>
            <h1 className="text-4xl font-black tracking-tight mb-4 text-white">
              {selectedStoreName ? `Ordering from ${selectedStoreName}` : 'Find something delicious'}
            </h1>
            <p className="text-slate-300 text-lg max-w-xl font-medium">
              {selectedStoreName 
                ? 'Browse the menu and add items to your cart. We will have it ready for you shortly.' 
                : 'Select a kitchen from below to view their exclusive menu and start your order.'}
            </p>
          </div>

          <div className="w-full md:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl">
            <label className="block text-xs font-bold uppercase tracking-widest text-white/70 mb-2">Select a Kitchen</label>
            {storesLoading ? (
              <div className="px-4 py-3 text-slate-300 font-medium">Loading kitchens...</div>
            ) : (
              <select
                value={selectedStoreId}
                onChange={(e) => {
                  setSelectedStoreId(e.target.value);
                  setCart({}); // Reset cart on store change
                }}
                className="w-full px-4 py-3 bg-white text-gray-900 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold cursor-pointer shadow-sm"
              >
                <option value="" disabled className="text-gray-500">Choose a location...</option>
                {stores.map((store: any) => (
                  <option key={store.id} value={store.id}>{store.name} - {store.address}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-8 relative">

        <div className="flex-1">
          {!selectedStoreId ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-[#0f0f15] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
              <div className="text-6xl mb-4 opacity-50">🍽️</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Awaiting Kitchen Selection</h3>
              <p className="text-gray-500 max-w-sm mx-auto">Please select a store from the dropdown above to view their menu.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-end mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Menu Items</h2>
              </div>

              {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800/40 rounded-2xl h-48 border border-gray-200 dark:border-gray-800" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-[#0f0f15] rounded-2xl border border-gray-200 dark:border-gray-800">
                  <p className="text-gray-500 font-medium">This store hasn't added any menu items yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product: any) => {
                    const qtyInCart = cart[product.id]?.qty || 0;
                    return (
                      <Card key={product.id} className="p-0 overflow-hidden flex flex-col h-full hover:shadow-xl hover:-translate-y-1 hover:shadow-indigo-500/10 transition-all duration-300 border border-gray-200 dark:border-gray-800/60 bg-white dark:bg-[#12121a]">
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-3 gap-2">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{product.name}</h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                              {product.category || 'Mains'}
                            </span>
                          </div>
                          
                          <p className="text-[0.9rem] text-gray-500 dark:text-gray-400 line-clamp-3 mb-6 flex-1 leading-relaxed">
                            {product.description || 'No description provided.'}
                          </p>
                          
                          <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-gray-800/80 pt-5">
                            <span className="font-black text-xl text-gray-900 dark:text-white tracking-tight">₹{product.price.toFixed(2)}</span>

                            {qtyInCart > 0 ? (
                              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-1.5 border border-gray-200 dark:border-gray-700/50 shadow-sm">
                                <button onClick={() => updateCartQty(product, -1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm hover:scale-105 active:scale-95 transition-transform font-bold text-lg border border-gray-100 dark:border-gray-700">-</button>
                                <span className="font-bold text-sm w-4 text-center">{qtyInCart}</span>
                                <button onClick={() => updateCartQty(product, 1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm hover:scale-105 active:scale-95 transition-transform font-bold text-lg">+</button>
                              </div>
                            ) : (
                              <Button size="sm" onClick={() => updateCartQty(product, 1)} className="px-5 py-2 h-auto text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-bold rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95">
                                Add to Cart
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div className="md:w-80 lg:w-[350px] shrink-0 relative">
          <div className={`sticky top-24 transition-all duration-500 ${selectedStoreId ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
            <div className="bg-white dark:bg-[#0b0b10] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[80vh] relative overflow-hidden">

              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
              
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-5 pb-5 border-b border-gray-100 dark:border-gray-800/80 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                Your Cart
              </h2>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-900/50 border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center">
                      <span className="text-3xl opacity-40">🛒</span>
                    </div>
                    <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">Your cart is feeling a bit empty.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {cartItems.map((item) => (
                      <div key={item.item_id} className="flex justify-between items-center group">
                        <div className="flex-1 pr-4">
                          <p className="text-[0.95rem] font-bold text-gray-900 dark:text-white leading-tight">{item.name}</p>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">₹{item.price.toFixed(2)} <span className="opacity-60 mx-1">x</span> {item.qty}</p>
                        </div>
                        <p className="text-[0.95rem] font-black text-indigo-600 dark:text-indigo-400 shrink-0">₹{(item.price * item.qty).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="pt-5 mt-5 border-t border-dashed border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                    <span className="font-bold text-gray-600 dark:text-gray-400">Total Amount</span>
                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    disabled={createOrderMutation.isPending}
                    className="w-full py-6 text-[0.95rem] font-black tracking-widest uppercase shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {createOrderMutation.isPending ? 'Processing...' : 'Place Order Now'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
