import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: {
    default: 'Multi-Store OMS',
    template: '%s | Multi-Store OMS',
  },
  description: 'Real-time Order Management System for multiple stores — built with Next.js, Socket.IO, and MySQL.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main className="max-w-7xl mx-auto px-6 py-7">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
