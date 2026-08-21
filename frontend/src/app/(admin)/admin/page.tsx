import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Admin Login — Multi-Store OMS',
  description: 'Sign in to the Super Admin panel',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 -mt-14">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="text-3xl font-extrabold tracking-tight mb-2 text-indigo-600 dark:text-indigo-400">
            <span>SUPER ADMIN</span>
          </div>
          <h1 className="text-2xl font-bold mb-1.5 text-gray-900 dark:text-white">Admin Login</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Restricted access for system administrators
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
