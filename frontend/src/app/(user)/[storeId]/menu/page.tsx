'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/lib/cartStore';

// Function to generate a stable, beautiful gradient class based on store ID
const getGradient = (id: string) => {
  const gradients = [
    'from-indigo-500 to-purple-500',
    'from-pink-500 to-rose-500',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-500',
    'from-cyan-400 to-blue-500',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export default function MenuPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;

  const { items, addItem, removeItem, getTotal } = useCartStore();
  const cartTotal = getTotal();
  const storeItems = items.filter(i => i.storeId === storeId); // Filter cart for this store

  const { data: productsRes, isLoading } = useQuery({
    queryKey: ['products', storeId],
    queryFn: () => api.getProducts(storeId),
  });
  
  const { data: storesRes } = useQuery({
    queryKey: ['stores'],
    queryFn: () => api.getStores(),
  });

  const products = productsRes?.data || [];
  const storeData = storesRes?.data?.find((s: any) => s.id === storeId);
  const storeName = storeData?.name || 'Store Menu';
  const storeAddress = storeData?.address || '';

  return (
    <div className="pb-20">
      {/* Simple Header */}
      <div className="bg-slate-900 text-white py-12 px-6 mb-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="flex-1 w-full">
            <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-400 hover:text-white transition-colors mb-4">
              &larr; Back to Stores
            </Link>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">
              {storeName}
            </h1>
            <p className="text-slate-300 text-sm">
              {storeAddress || 'Local Kitchen'}
            </p>
          </div>
            
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex items-center gap-6">
            <div>
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1">Your Cart</div>
              <div className="text-xl font-bold text-white">{storeItems.length} items</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-1">Total</div>
              <div className="text-xl font-bold text-white">₹{cartTotal.toFixed(2)}</div>
            </div>
            <Button 
              onClick={() => router.push(`/${storeId}/checkout`)} 
              disabled={storeItems.length === 0}
              className="ml-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold border-none"
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-end mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Our Menu</h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800/40 rounded-2xl h-48 border border-gray-200 dark:border-gray-800" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-[#0f0f15] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="text-5xl mb-4 opacity-70">🍽️</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No menu available</h3>
            <p className="text-gray-500 max-w-sm mx-auto">This store hasn't added any items to their menu yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => {
              const inCart = storeItems.find(i => i.id === product.id)?.quantity || 0;
              
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

                      {inCart > 0 ? (
                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-1.5 border border-gray-200 dark:border-gray-700/50 shadow-sm">
                          <button onClick={() => removeItem(storeId, product.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm hover:scale-105 active:scale-95 transition-transform font-bold text-lg border border-gray-100 dark:border-gray-700">-</button>
                          <span className="font-bold text-sm w-4 text-center">{inCart}</span>
                          <button onClick={() => addItem(storeId, { id: product.id, name: product.name, price: product.price })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm hover:scale-105 active:scale-95 transition-transform font-bold text-lg">+</button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => addItem(storeId, { id: product.id, name: product.name, price: product.price })} className="px-5 py-2 h-auto text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-bold rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95">
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
      </div>
    </div>
  );
}
