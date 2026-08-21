import { z } from 'zod';

export const CreateOrderSchema = z.object({
  store_id: z.string().min(1, 'store_id is required'),
  items: z
    .array(
      z.object({
        item_id: z.string().min(1, 'item_id is required'),
        qty: z.number().int().positive('qty must be a positive integer'),
      })
    )
    .min(1, 'At least one item is required'),
  total_amount: z.number().positive('total_amount must be positive'),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['PLACED', 'PREPARING', 'READY', 'DELIVERED', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'status must be PLACED, PREPARING, READY, DELIVERED, COMPLETED, or CANCELLED' }),
  }),
});

export const GetOrdersQuerySchema = z.object({
  store_id: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusDTO = z.infer<typeof UpdateOrderStatusSchema>;
export type GetOrdersQueryDTO = z.infer<typeof GetOrdersQuerySchema>;
