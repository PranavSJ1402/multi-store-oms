import type { Request, Response, NextFunction } from 'express';
import * as authService from './authService';
import { RegisterSchema, LoginSchema, RegisterStoreSchema } from './authSchema';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = RegisterSchema.parse(req.body);
    const { user, token } = await authService.registerUser(input);
    res.status(201).json({ data: { user, token }, message: 'Account created successfully' });
  } catch (err: any) {
    if (err.name === 'ZodError') return next(err);
    if (err.message === 'EMAIL_TAKEN') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    next(err);
  }
};

export const registerStore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = RegisterStoreSchema.parse(req.body);
    const { user, store, token } = await authService.registerStoreAdmin(input);
    res.status(201).json({ data: { user, store, token }, message: 'Store and admin created successfully' });
  } catch (err: any) {
    if (err.name === 'ZodError') return next(err);
    if (err.message === 'EMAIL_TAKEN') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = LoginSchema.parse(req.body);
    const { user, token } = await authService.loginUser(input);
    res.json({ data: { user, token }, message: 'Login successful' });
  } catch (err: any) {
    if (err.name === 'ZodError') return next(err);
    if (err.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.user is attached by authenticate middleware
    const user = await authService.getMe((req as any).user.userId);
    res.json({ data: user });
  } catch (err: any) {
    if (err.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(err);
  }
};
