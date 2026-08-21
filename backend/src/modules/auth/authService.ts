import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import type { RegisterInput, LoginInput } from './authSchema';

const SALT_ROUNDS = 12;

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  storeId?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export const hashPassword = (plain: string) => bcrypt.hash(plain, SALT_ROUNDS);

export const verifyPassword = (plain: string, hash: string) =>
  bcrypt.compare(plain, hash);

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, env.JWT_SECRET) as JwtPayload;

// ── Service methods ──────────────────────────────────────────────────────────

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  const existingStore = await prisma.store.findUnique({ where: { email: input.email } });
  if (existingUser || existingStore) throw new Error('EMAIL_TAKEN');

  const hashed = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashed,
      role: input.role,
    },
  });

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  return { user, token };
};

export const registerStoreAdmin = async (input: import('./authSchema').RegisterStoreInput) => {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  const existingStore = await prisma.store.findUnique({ where: { email: input.email } });
  if (existingUser || existingStore) throw new Error('EMAIL_TAKEN');

  const hashed = await hashPassword(input.password);
  
  const newStore = await prisma.store.create({
    data: {
      name: input.store_name,
      address: input.address,
      phone: input.phone,
      email: input.email,
      password: hashed,
    },
  });

  const token = signToken({ userId: newStore.id, email: newStore.email, role: 'STORE_ADMIN' });
  const { password: _, ...safeStore } = newStore;
  
  // Transform to look like a User to the frontend for ease
  const user = { ...safeStore, role: 'STORE_ADMIN', storeId: newStore.id };
  return { user, store: safeStore, token };
};

export const loginUser = async (input: LoginInput) => {
  let user: any = await prisma.user.findUnique({ where: { email: input.email } });
  let isStore = false;

  if (!user) {
    const store = await prisma.store.findUnique({ where: { email: input.email } });
    if (store) {
      user = store;
      isStore = true;
    }
  }

  if (!user) throw new Error('INVALID_CREDENTIALS');

  const valid = await verifyPassword(input.password, user.password);
  if (!valid) throw new Error('INVALID_CREDENTIALS');

  const role = isStore ? 'STORE_ADMIN' : user.role;
  let storeId = isStore ? user.id : undefined;

  if (!isStore && role === 'STORE_ADMIN') {
    const store = await prisma.store.findUnique({ where: { email: user.email } });
    if (store) {
      storeId = store.id;
    } else {
      const storeByName = await prisma.store.findFirst({ where: { name: user.name.replace(' Admin', '') } });
      if (storeByName) storeId = storeByName.id;
    }
  }

  const token = signToken({ userId: user.id, email: user.email, role, storeId });
  const { password: _, ...safeUser } = user;
  
  const frontendUser = { ...safeUser, role, storeId };
  return { user: frontendUser, token };
};

export const getMe = async (userId: string) => {
  let user: any = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    const store = await prisma.store.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, address: true, phone: true, createdAt: true },
    });
    if (store) {
      return { ...store, role: 'STORE_ADMIN', storeId: store.id };
    }
  } else if (user.role === 'STORE_ADMIN') {
    const store = await prisma.store.findUnique({ where: { email: user.email } });
    if (store) {
      user.storeId = store.id;
    } else {
      const storeByName = await prisma.store.findFirst({ where: { name: user.name.replace(' Admin', '') } });
      if (storeByName) user.storeId = storeByName.id;
    }
  }

  if (!user) throw new Error('USER_NOT_FOUND');
  return user;
};

// ── Admin seed ───────────────────────────────────────────────────────────────
// Called once at server startup — creates a default ADMIN if none exists.

export const seedAdmin = async () => {
  const existing = await prisma.user.findUnique({ where: { email: 'admin@oms.com' } });
  if (existing) return; // Already seeded

  const hashed = await hashPassword('admin123');
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@oms.com',
      password: hashed,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin seeded — admin@oms.com / admin123');
};
