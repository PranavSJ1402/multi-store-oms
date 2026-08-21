import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from './orderController';
import { validate } from '../../middleware/validate';
import {
  CreateOrderSchema,
  UpdateOrderStatusSchema,
  GetOrdersQuerySchema,
} from './orderSchema';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.post(
  '/',
  validate(CreateOrderSchema, 'body'),
  createOrder
);
router.get(
  '/',
  validate(GetOrdersQuerySchema, 'query'),
  getOrders
);
router.get(
  '/:id',
  getOrderById
);
router.patch(
  '/:id/status',
  validate(UpdateOrderStatusSchema, 'body'),
  updateOrderStatus
);

export default router;
