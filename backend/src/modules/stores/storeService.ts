import { prisma } from '../../lib/prisma';
import { CreateStoreInput } from './storeSchema';

export const getStores = async () => {
  const stores = await prisma.store.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return stores;
};

export const createStore = async (data: CreateStoreInput) => {
  throw new Error('Stores must be created via the /auth/register-store endpoint to include authentication data.');
};

export const updateStore = async (id: string, data: Partial<CreateStoreInput>) => {
  const store = await prisma.store.update({
    where: { id },
    data,
  });
  return store;
};
