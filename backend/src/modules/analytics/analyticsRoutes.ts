import { Router } from 'express';
import { getOrdersPerDay, getRevenuePerStore, getTopItems } from './analyticsController';

const router = Router();

router.get('/orders-per-day', getOrdersPerDay);
router.get('/revenue-per-store', getRevenuePerStore);
router.get('/top-items', getTopItems);

export default router;
