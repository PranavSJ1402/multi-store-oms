import { Request, Response, NextFunction } from 'express';
import * as orderService from './orderService';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.createOrder(req.body, req.user?.userId);
    res.status(201).json({ data: order, message: 'Order created successfully' });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.query is already parsed & coerced by the validate middleware
    const { store_id, page, limit } = req.query as any;
    
    if (req.user?.role === 'USER') {
      // Users see their own orders across all stores, or filter by store if passed
      const result = await orderService.getOrders(store_id, req.user.userId, Number(page), Number(limit));
      return res.status(200).json(result);
    }

    let targetStoreId = store_id;
    // Enforce store isolation: If not SUPER_ADMIN, force the query to use the store admin's storeId
    if (req.user?.role === 'STORE_ADMIN') {
      console.log('STORE_ADMIN requesting orders. user payload:', req.user);
      if (!req.user.storeId) {
        return res.status(403).json({ error: 'Store Admin is not associated with a valid store' });
      }
      targetStoreId = req.user.storeId;
    } else if (req.user?.role !== 'SUPER_ADMIN') {
      targetStoreId = req.user?.storeId; // For other roles?
    }

    const result = await orderService.getOrders(targetStoreId, undefined, Number(page), Number(limit));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);
    
    const isOwner = req.user?.role === 'USER' && order.userId === req.user?.userId;
    const isStoreAdmin = req.user?.role === 'STORE_ADMIN' && order.storeId === req.user?.storeId;
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

    if (!isOwner && !isStoreAdmin && !isSuperAdmin) {
      return res.status(403).json({ error: 'Access denied to this order.' });
    }
    res.status(200).json({ data: order });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // First fetch to check storeId
    const order = await orderService.getOrderById(id);
    if (req.user?.role !== 'SUPER_ADMIN' && order.storeId !== req.user?.storeId) {
      return res.status(403).json({ error: 'Access denied to this order.' });
    }

    const updatedOrder = await orderService.updateOrderStatus(id, status, req.user?.role);
    res.status(200).json({ data: updatedOrder, message: 'Order status updated successfully' });
  } catch (error) {
    next(error);
  }
};
