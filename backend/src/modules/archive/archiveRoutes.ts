import { Router } from 'express';
import { archiveOldOrders } from './archiveController';

const router = Router();

// Only SUPER_ADMIN can run these (enforced in app.ts)
router.post('/archive-old-orders', archiveOldOrders);

export default router;
