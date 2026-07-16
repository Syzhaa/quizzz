import { io, Socket, ManagerOptions, SocketOptions } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

export function createSocket(namespace: '/host' | '/player', options?: { token?: string }): Socket {
  const socketOptions: Partial<ManagerOptions & SocketOptions> = {
    autoConnect: false,
    transports: ['websocket', 'polling'],
  };

  // Add JWT authentication for host connections
  if (namespace === '/host' && options?.token) {
    socketOptions.auth = {
      token: options.token
    };
  }

  return io(`${SOCKET_URL}${namespace}`, socketOptions);
}
