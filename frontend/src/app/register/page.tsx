import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Register — Multi-Store OMS',
  description: 'Create a new staff account (Admin only)',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 -mt-14">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <div className="text-3xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white">
            ⚡ <span className="text-gradient">OMS</span>
          </div>
          <h1 className="text-2xl font-bold mb-1.5 text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Sign up to start ordering from stores
          </p>
        </div>
        <RegisterForm />
        <div className="mt-6 text-center text-sm text-gray-500 flex flex-col gap-2">
          <div>
            Already have an account? <Link href="/login" className="text-indigo-600 font-medium">Sign in</Link>
          </div>
          <div>
            Register as restaurant owner? <Link href="/register-store" className="text-indigo-600 font-medium">Partner with us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
