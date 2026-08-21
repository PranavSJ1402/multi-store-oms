import { prisma } from '../../lib/prisma';

export const archiveOldOrders = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return prisma.$transaction(async (tx) => {
    const oldOrders = await tx.order.findMany({
      where: { createdAt: { lt: thirtyDaysAgo } },
    });

    if (oldOrders.length === 0) return 0;

    await tx.orderArchive.createMany({
      data: oldOrders.map((order) => ({
        id: order.id,
        orderNumber: (order as any).orderNumber,
        storeId: order.storeId,
        items: order.items as any,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      })),
    });

    await tx.order.deleteMany({
      where: { id: { in: oldOrders.map((o) => o.id) } },
    });

    return oldOrders.length;
  });
};
