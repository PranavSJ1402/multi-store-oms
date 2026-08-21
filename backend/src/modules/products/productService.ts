import { prisma } from '../../lib/prisma';
import { CreateProductInput } from './productSchema';

export const getProductsByStore = async (storeId: string) => {
  return prisma.product.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' },
  });
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    const err = Object.assign(new Error('Product not found'), { status: 404 });
    throw err;
  }
  return product;
};

export const createProduct = async (data: CreateProductInput) => {
  return prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      description: data.description,
      category: data.category,
      storeId: data.store_id,
    },
  });
};

export const deleteProduct = async (id: string) => {
  return prisma.product.delete({
    where: { id },
  });
};
