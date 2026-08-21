import { Router } from 'express';
import * as productController from './productController';
import { validate } from '../../middleware/validate';
import { ProductSchema } from './productSchema';
import { authorize } from '../../middleware/authorize';
import { authenticate } from '../../middleware/authenticate';

const router = Router({ mergeParams: true });

// We can mount this as /api/stores/:storeId/products or /api/products
// Let's use /api/products with ?store_id= query, or just base routes.

router.get('/', productController.getProducts);
router.post('/', authenticate, authorize('STORE_ADMIN', 'SUPER_ADMIN'), validate(ProductSchema), productController.createProduct);
router.delete('/:id', authenticate, authorize('STORE_ADMIN', 'SUPER_ADMIN'), productController.deleteProduct);

export default router;
