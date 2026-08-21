import { Request, Response, NextFunction } from 'express';
import * as productService from './productService';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { store_id } = req.query as { store_id?: string };
    if (!store_id) {
      return res.status(400).json({ error: 'store_id query parameter is required' });
    }
    const products = await productService.getProductsByStore(store_id);
    res.status(200).json({ data: products });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Basic isolation: Store Admin can only create products for their own store
    if (req.user?.role === 'STORE_ADMIN' && req.body.store_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied: Cannot create products for another store' });
    }

    const product = await productService.createProduct(req.body);
    res.status(201).json({ data: product, message: 'Product created successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (req.user?.role === 'STORE_ADMIN' && product.storeId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied: Cannot delete products for another store' });
    }

    await productService.deleteProduct(id);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
