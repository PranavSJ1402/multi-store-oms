'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from './types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        // Mirror token in a plain cookie so Next.js middleware can read it server-side
        document.cookie = `oms_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        // Clear cookie
        document.cookie = 'oms_token=; path=/; max-age=0; SameSite=Lax';
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'oms-auth', // localStorage key
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        // Restore isAuthenticated flag from persisted token
        if (state?.token) {
          state.isAuthenticated = true;
        }
      },
    }
  )
);

/** Helper — get the auth token outside of React components (for api.ts) */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('oms-auth');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
};
