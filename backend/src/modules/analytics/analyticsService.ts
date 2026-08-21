import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Orders per day — last 30 days.
 * MySQL's DATE() and COUNT() work the same as PostgreSQL.
 * Raw results return COUNT as BigInt, so we convert to Number.
 */
export const getOrdersPerDay = async () => {
  const rows = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
    SELECT
      DATE(created_at)    AS date,
      COUNT(*)            AS count
    FROM orders
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 30
  `;

  return rows.map((row) => ({
    date: row.date,
    count: Number(row.count),
  }));
};

/**
 * Total revenue grouped by store.
 * Uses Prisma's groupBy — no raw SQL needed, works identically on MySQL.
 */
export const getRevenuePerStore = async () => {
  const result = await prisma.order.groupBy({
    by: ['storeId'],
    _sum: { totalAmount: true },
    orderBy: { _sum: { totalAmount: 'desc' } },
  });

  return result.map((item) => ({
    store_id: item.storeId,
    revenue: item._sum.totalAmount ?? 0,
  }));
};

/**
 * Top 5 selling items by total quantity.
 *
 * PostgreSQL used jsonb_array_elements(). MySQL 8.0+ equivalent is JSON_TABLE()
 * which is available in XAMPP's bundled MySQL 8.x.
 *
 * JSON_TABLE expands the JSON array inline so we can GROUP BY item_id.
 */
export const getTopItems = async () => {
  const rows = await prisma.$queryRaw<{ item_id: string; total_qty: bigint }[]>`
    SELECT
      jt.item_id                 AS item_id,
      SUM(CAST(jt.qty AS UNSIGNED)) AS total_qty
    FROM orders,
    JSON_TABLE(
      items,
      '$[*]' COLUMNS (
        item_id VARCHAR(255) PATH '$.item_id',
        qty     INT          PATH '$.qty'
      )
    ) AS jt
    GROUP BY jt.item_id
    ORDER BY total_qty DESC
    LIMIT 5
  `;

  return rows.map((row) => ({
    item_id: row.item_id,
    total_qty: Number(row.total_qty),
  }));
};
