'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '@/lib/authStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
}

/**
 * Manages a Socket.IO connection scoped to a specific store room.
 * - Automatically joins / re-joins the store room on connect & reconnect
 * - Leaves old store room when storeId changes
 * - Reconnection is handled by Socket.IO client natively (exponential backoff)
 */
export const useSocket = (storeId: string): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const prevStoreIdRef = useRef<string | null>(null);

  const joinStore = useCallback((socket: Socket, sid: string) => {
    if (prevStoreIdRef.current !== null && prevStoreIdRef.current !== sid) {
      if (prevStoreIdRef.current === '') {
        socket.emit('leaveAdmin');
      } else {
        socket.emit('leaveStore', prevStoreIdRef.current);
      }
    }
    if (sid === '') {
      socket.emit('joinAdmin');
    } else {
      socket.emit('joinStore', sid);
    }
    prevStoreIdRef.current = sid;
  }, []);

  useEffect(() => {
    // Create socket with reconnection options
    const socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
      auth: { token: getAuthToken() },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      joinStore(socket, storeId);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      // If server disconnected us, manually reconnect
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    socket.on('reconnect', (attempt) => {
      console.log(`[Socket] Reconnected after ${attempt} attempt(s)`);
      joinStore(socket, storeId);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only create socket once

  // Re-join when storeId changes (without reconnecting)
  useEffect(() => {
    if (socketRef.current?.connected && storeId !== prevStoreIdRef.current) {
      joinStore(socketRef.current, storeId);
    }
  }, [storeId, joinStore]);

  return { socket: socketRef.current, isConnected };
};
