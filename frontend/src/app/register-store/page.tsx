import type { Metadata } from 'next';
import { StoreRegisterForm } from '@/components/auth/StoreRegisterForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Register Store — Multi-Store OMS',
  description: 'Create a new store account',
};

export default function StoreRegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 -mt-14">
      <div className="w-full max-w-[600px]">
        <div className="text-center mb-8">
          <div className="text-3xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white">
            <span className="text-gradient">Partner with OMS</span>
          </div>
          <h1 className="text-2xl font-bold mb-1.5 text-gray-900 dark:text-white">Register your Store</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Join our platform and start receiving orders today
          </p>
        </div>
        <StoreRegisterForm />
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link href="/login" className="text-indigo-600 font-medium">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
