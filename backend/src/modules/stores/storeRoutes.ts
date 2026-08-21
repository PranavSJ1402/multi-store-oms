import { Router } from 'express';
import * as storeController from './storeController';
import { validate } from '../../middleware/validate';
import { StoreSchema, UpdateStoreSchema } from './storeSchema';
import { authorize } from '../../middleware/authorize';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.get('/', storeController.getStores);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN'), validate(StoreSchema), storeController.createStore);
router.patch('/:id', authenticate, authorize('SUPER_ADMIN', 'STORE_ADMIN'), validate(UpdateStoreSchema), storeController.updateStore);

export default router;
