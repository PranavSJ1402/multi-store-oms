import { Request, Response, NextFunction } from 'express';
import * as storeService from './storeService';

export const getStores = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stores = await storeService.getStores();
    res.status(200).json({ data: stores });
  } catch (error) {
    next(error);
  }
};

export const createStore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const store = await storeService.createStore(req.body);
    res.status(201).json({ data: store, message: 'Store created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateStore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check authorization: STORE_ADMIN can only update their own store
    if (req.user?.role === 'STORE_ADMIN' && req.user.storeId !== id) {
      return res.status(403).json({ error: 'Access denied: Cannot update another store' });
    }

    const store = await storeService.updateStore(id, req.body);
    res.status(200).json({ data: store, message: 'Store updated successfully' });
  } catch (error) {
    next(error);
  }
};
