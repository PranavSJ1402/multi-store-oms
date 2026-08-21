import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

let io: Server;

import { verifyToken } from '../modules/auth/authService';

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = verifyToken(token);
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id} (User: ${socket.data.user?.email})`);

    // Join a store-specific room to receive store-filtered events
    socket.on('joinStore', (storeId: string) => {
      // Leave any previously joined store rooms to avoid receiving stale events
      const currentRooms = Array.from(socket.rooms).filter(
        (room) => room.startsWith('store_') && room !== `store_${storeId}`
      );
      currentRooms.forEach((room) => socket.leave(room));

      socket.join(`store_${storeId}`);
      console.log(`[Socket] ${socket.id} joined room store_${storeId}`);
    });

    socket.on('joinAdmin', () => {
      if (socket.data.user?.role === 'SUPER_ADMIN') {
        socket.join('admin_orders');
        console.log(`[Socket] ${socket.id} joined room admin_orders`);
      }
    });

    socket.on('leaveAdmin', () => {
      socket.leave('admin_orders');
      console.log(`[Socket] ${socket.id} left room admin_orders`);
    });

    // Allow client to explicitly leave a store room
    socket.on('leaveStore', (storeId: string) => {
      socket.leave(`store_${storeId}`);
      console.log(`[Socket] ${socket.id} left room store_${storeId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected: ${socket.id} (reason: ${reason})`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};
