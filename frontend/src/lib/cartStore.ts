import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  storeId: string | null;
  items: CartItem[];
  addItem: (storeId: string, item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  storeId: null,
  items: [],
  addItem: (storeId, item) => set((state) => {
    // If adding from a different store, clear the cart first
    if (state.storeId && state.storeId !== storeId) {
      return { storeId, items: [{ ...item, quantity: 1 }] };
    }

    const existing = state.items.find(i => i.id === item.id);
    if (existing) {
      return {
        storeId,
        items: state.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      };
    }

    return { storeId, items: [...state.items, { ...item, quantity: 1 }] };
  }),
  removeItem: (itemId) => set((state) => ({
    items: state.items.filter(i => i.id !== itemId)
  })),
  clearCart: () => set({ storeId: null, items: [] }),
  getTotal: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0)
}));
