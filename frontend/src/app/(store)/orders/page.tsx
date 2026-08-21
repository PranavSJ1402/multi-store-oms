import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { OrdersClient } from '@/components/orders/OrdersClient';

export const metadata: Metadata = {
  title: 'Orders',
  description: 'Browse and filter orders by store with real-time updates',
};

// Server Component: pre-fetches the first page of orders for the user's store
// The client will take over after hydration with store switching and real-time updates
export default async function OrdersPage() {
  // Let the client fetch the initial data since it has access to the user context
  return <OrdersClient initialData={null} initialStoreId={''} />;
}
