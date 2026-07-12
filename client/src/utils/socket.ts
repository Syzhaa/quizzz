import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

export function createSocket(namespace: '/host' | '/player'): Socket {
  return io(`${SOCKET_URL}${namespace}`, {
    autoConnect: false,
    transports: ['websocket', 'polling'],
  });
}
