import { Router } from 'express';
import * as authController from './authController';
import { RegisterSchema, LoginSchema } from './authSchema';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/register-store', authController.registerStore);
router.post('/login', authController.login);

// Protected — requires valid JWT
router.get('/me', authenticate, authController.me);

export default router;
