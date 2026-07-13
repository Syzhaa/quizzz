import { Server as SocketServer, Socket } from 'socket.io';
import * as gameService from '../services/game-service.js';

export function setupSocketHandlers(io: SocketServer) {
  // Namespace untuk Host (Admin)
  const hostNsp = io.of('/host');
  hostNsp.on('connection', (socket: Socket) => {
    
    // Host join ke lobby sebuah PIN
    socket.on('join_game', async ({ pin, token }) => {
      // (TODO: Validasi token JWT Admin jika diperlukan untuk keamanan ekstra)
      try {
        const game = await gameService.getGameState(pin);
        if (!game) {
          socket.emit('error', { message: 'PIN tidak valid' });
          return;
        }

        // Simpan socket ID host
        await gameService.setHostSocketId(pin, socket.id);
        
        socket.join(pin);
        socket.emit('joined', { pin, players: Object.values(game.players) });
      } catch (err) {
        socket.emit('error', { message: 'Gagal bergabung' });
      }
    });

    socket.on('disconnect', () => {
      // (TODO: Handle host disconnect)
    });
  });

  // Namespace untuk Player
  const playerNsp = io.of('/player');
  playerNsp.on('connection', (socket: Socket) => {
    
    // Player join ke permainan
    socket.on('join_game', async ({ pin, nickname }) => {
      try {
        const game = await gameService.getGameState(pin);
        if (!game) {
          socket.emit('error', { message: 'PIN tidak ditemukan' });
          return;
        }
        
        if (game.status !== 'waiting') {
          socket.emit('error', { message: 'Sesi kuis sudah dimulai atau berakhir' });
          return;
        }

        // Tambahkan player
        const updatedGame = await gameService.addPlayer(pin, socket.id, nickname);
        
        // Simpan info PIN di socket object untuk handle disconnect
        socket.data.pin = pin;
        socket.join(pin);

        // Beritahu player sukses join
        socket.emit('joined', { pin, nickname: updatedGame.players[socket.id].nickname });

        // Broadcast ke Host bahwa ada player baru
        hostNsp.to(pin).emit('player_joined', Object.values(updatedGame.players));
      } catch (err) {
        socket.emit('error', { message: err instanceof Error ? err.message : 'Gagal bergabung' });
      }
    });

    socket.on('disconnect', async () => {
      const pin = socket.data.pin;
      if (pin) {
        try {
          const updatedGame = await gameService.removePlayer(pin, socket.id);
          // Beritahu Host bahwa player keluar
          hostNsp.to(pin).emit('player_left', Object.values(updatedGame.players));
        } catch (err) {
          // ignore
        }
      }
    });
  });
}
