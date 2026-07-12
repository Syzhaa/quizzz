import { Server as SocketServer, Namespace } from 'socket.io';

export function createNamespace(io: SocketServer, name: string): Namespace {
  const nsp = io.of(name);

  nsp.on('connection', (socket) => {
    console.log(`[Socket] connected to ${name}: ${socket.id}`);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] disconnected from ${name}: ${socket.id} (${reason})`);
    });
  });

  return nsp;
}
