import { prisma } from '../../lib/prisma';
import { CreateOrderDTO } from './orderSchema';
import { getIO } from '../../sockets/socket';

export const createOrder = async (data: CreateOrderDTO, userId?: string) => {
  const order = await prisma.order.create({
    data: {
      storeId: data.store_id,
      userId: userId || null,
      items: data.items as any,
      totalAmount: data.total_amount,
    },
  });

  // Emit to the specific store room so only subscribers see it
  const io = getIO();
  io.to(`store_${order.storeId}`).to('admin_orders').emit('orderCreated', order);

  return order;
};

export const getOrders = async (storeId?: string, userId?: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const where: any = {};
  if (storeId) where.storeId = storeId;
  if (userId) where.userId = userId;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getOrderById = async (id: string) => {
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) {
    const err = Object.assign(new Error('Order not found'), { status: 404 });
    throw err;
  }

  return order;
};

export const updateOrderStatus = async (id: string, status: string, role?: string) => {
  const STATUS_FLOW = ['PLACED', 'PREPARING', 'READY', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
  
  const existingOrder = await prisma.order.findUnique({ where: { id } });
  if (!existingOrder) {
    throw Object.assign(new Error('Order not found'), { status: 404 });
  }

  const currentIndex = STATUS_FLOW.indexOf(existingOrder.status);
  const newIndex = STATUS_FLOW.indexOf(status);

  if (role !== 'SUPER_ADMIN' && newIndex < currentIndex && newIndex !== -1 && currentIndex !== -1) {
    throw Object.assign(new Error(`Cannot move order status backwards from ${existingOrder.status} to ${status}`), { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
  });

  const io = getIO();
  io.to(`store_${order.storeId}`).to('admin_orders').emit('orderUpdated', order);

  return order;
};
