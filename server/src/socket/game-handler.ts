import { Server as SocketServer, Socket } from 'socket.io';
import * as gameService from '../services/game-service.js';
import { authenticateSocket, requireHostAuth, AuthenticatedSocket } from '../middleware/socket-auth.js';

export function setupSocketHandlers(io: SocketServer) {
  // Namespace untuk Host (Admin) - dengan authentication
  const hostNsp = io.of('/host');
  hostNsp.use(authenticateSocket);
  hostNsp.on('connection', (socket: AuthenticatedSocket) => {
    
    // Host join ke lobby sebuah PIN
    socket.on('join_game', async ({ pin }) => {
      if (!requireHostAuth(socket, (error) => socket.emit('error', { message: error }))) return;
      
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

        // Jika join di tengah permainan (misal karena refresh/pindah halaman)
        if (game.status === 'playing' && game.questions.length > 0) {
          const question = game.questions[game.currentQuestionIndex];
          const timeElapsedMs = game.questionStartTime ? Date.now() - game.questionStartTime : 0;
          let remainingSeconds = question.durationSeconds - Math.floor(timeElapsedMs / 1000);
          if (remainingSeconds < 0) remainingSeconds = 0;
          
          socket.emit('question_start', {
            id: question.id,
            text: question.text,
            choices: question.choices,
            durationSeconds: remainingSeconds,
            mediaUrl: question.mediaUrl
          });
          socket.emit('player_answered', { totalAnswered: Object.keys(game.answeredPlayers).length });
        } else if (game.status === 'finished') {
          socket.emit('game_over', { players: Object.values(game.players) });
        }
      } catch (err) {
        socket.emit('error', { message: 'Gagal bergabung' });
      }
    });
    socket.on('start_game', async ({ pin }) => {
      if (!requireHostAuth(socket, (error) => socket.emit('error', { message: error }))) return;
      
      try {
        // Pertama: set status 'playing' tapi belum set questionStartTime
        const game = await gameService.prepareGame(pin);
        const question = game.questions[0];
        
        // Buat DTO soal
        const questionDto = {
          id: question.id,
          text: question.text,
          choices: question.choices,
          durationSeconds: question.durationSeconds,
          mediaUrl: question.mediaUrl
        };
        
        // Broadcast game_started + countdown ke semua (pakai room, bukan socket langsung)
        io.of('/player').to(pin).emit('game_started');
        io.of('/player').to(pin).emit('countdown', { seconds: 3 });
        hostNsp.to(pin).emit('game_started');
        hostNsp.to(pin).emit('countdown', { seconds: 3 });
        
        // Setelah 3 detik, kirim soal pertama dan set timer
        setTimeout(async () => {
          await gameService.setQuestionStartTime(pin);
          io.of('/player').to(pin).emit('question_start', questionDto);
          hostNsp.to(pin).emit('question_start', questionDto);
        }, 3000);
      } catch (err) {
        socket.emit('error', { message: err instanceof Error ? err.message : 'Gagal memulai kuis' });
      }
    });

    socket.on('next_question', async ({ pin }) => {
      if (!requireHostAuth(socket, (error) => socket.emit('error', { message: error }))) return;
      
      try {
        const game = await gameService.nextQuestion(pin);
        if (game.status === 'finished') {
          io.of('/player').to(pin).emit('game_over', { players: Object.values(game.players) });
          hostNsp.to(pin).emit('game_over', { players: Object.values(game.players) });
        } else {
          const question = game.questions[game.currentQuestionIndex];
          const questionDto = {
            id: question.id,
            text: question.text,
            choices: question.choices,
            durationSeconds: question.durationSeconds,
            mediaUrl: question.mediaUrl
          };
          io.of('/player').to(pin).emit('question_start', questionDto);
          hostNsp.to(pin).emit('question_start', questionDto);
        }
      } catch (err) {
        socket.emit('error', { message: err instanceof Error ? err.message : 'Gagal memuat soal berikutnya' });
      }
    });

    socket.on('show_leaderboard', async ({ pin }) => {
      if (!requireHostAuth(socket, (error) => socket.emit('error', { message: error }))) return;
      
      try {
        const game = await gameService.getGameState(pin);
        if (game) {
          const leaderboard = Object.values(game.players).sort((a, b) => b.score - a.score);
          io.of('/player').to(pin).emit('leaderboard', leaderboard);
          hostNsp.to(pin).emit('leaderboard', leaderboard);
        }
      } catch (err) {
        // ignore
      }
    });
    socket.on('time_up', async ({ pin }) => {
      if (!requireHostAuth(socket, (error) => socket.emit('error', { message: error }))) return;
      
      try {
        const game = await gameService.getGameState(pin);
        if (game && game.status === 'playing') {
          const currentQuestion = game.questions[game.currentQuestionIndex];
          io.of('/player').to(pin).emit('question_ended', { correctChoiceId: currentQuestion.correctChoiceId });
          hostNsp.to(pin).emit('question_ended', { correctChoiceId: currentQuestion.correctChoiceId });
        }
      } catch (err) {
        // ignore
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
        
        if (game.status === 'finished') {
          socket.emit('error', { message: 'Sesi kuis sudah selesai' });
          return;
        }

        // Tambahkan player
        const updatedGame = await gameService.addPlayer(pin, socket.id, nickname);
        
        // Simpan info PIN di socket object untuk handle disconnect
        socket.data.pin = pin;
        socket.join(pin);

        // Beritahu player sukses join
        socket.emit('joined', { pin, nickname: updatedGame.players[socket.id].nickname });

        // Jika join di tengah permainan
        if (updatedGame.status === 'playing' && updatedGame.questions.length > 0) {
          const question = updatedGame.questions[updatedGame.currentQuestionIndex];
          const timeElapsedMs = updatedGame.questionStartTime ? Date.now() - updatedGame.questionStartTime : 0;
          let remainingSeconds = question.durationSeconds - Math.floor(timeElapsedMs / 1000);
          if (remainingSeconds < 0) remainingSeconds = 0;
          
          socket.emit('question_start', {
            id: question.id,
            text: question.text,
            choices: question.choices,
            durationSeconds: remainingSeconds,
            mediaUrl: question.mediaUrl
          });
          if (updatedGame.answeredPlayers[socket.id]) {
            // Kita belum simpan status benar/salah secara rinci di Redis per question, 
            // tapi client akan mengunci tombol.
          }
        } else if (updatedGame.status === 'finished') {
          socket.emit('game_over');
        }

        // Broadcast ke Host bahwa ada player baru
        hostNsp.to(pin).emit('player_joined', Object.values(updatedGame.players));
      } catch (err) {
        socket.emit('error', { message: err instanceof Error ? err.message : 'Gagal bergabung' });
      }
    });
    socket.on('submit_answer', async ({ pin, choiceId }) => {
      try {
        const { state, isCorrect, scoreGained } = await gameService.submitAnswer(pin, socket.id, choiceId);
        
        socket.emit('answer_result', { isCorrect, scoreGained, currentScore: state.players[socket.id].score });
        
        // Beritahu host bahwa player ini sudah menjawab
        hostNsp.to(pin).emit('player_answered', { socketId: socket.id, totalAnswered: Object.keys(state.answeredPlayers).length });
        
        // Jika semua pemain sudah menjawab, otomatis akhiri soal
        if (Object.keys(state.answeredPlayers).length === Object.keys(state.players).length) {
          const currentQuestion = state.questions[state.currentQuestionIndex];
          hostNsp.to(pin).emit('question_ended', { correctChoiceId: currentQuestion.correctChoiceId });
          playerNsp.to(pin).emit('question_ended', { correctChoiceId: currentQuestion.correctChoiceId });
        }
      } catch (err) {
        // ignore jika sudah menjawab atau error lain
      }
    });

    socket.on('time_up', async ({ pin: _pin }) => {
      // Waktu habis dari client (biasanya dikirim oleh Host agar terpusat)
      // Nanti ditangani dari Host saja agar tidak duplikat
    });
    socket.on('disconnect', async () => {
      const pin = socket.data.pin;
      if (pin) {
        try {
          const game = await gameService.getGameState(pin);
          // Hanya hapus player saat di lobby (waiting).
          // Saat playing, player mungkin hanya pindah halaman (lobby -> game).
          if (game && game.status === 'waiting') {
            const updatedGame = await gameService.removePlayer(pin, socket.id);
            // Beritahu Host bahwa player keluar
            hostNsp.to(pin).emit('player_left', Object.values(updatedGame.players));
          }
        } catch (err) {
          // ignore
        }
      }
    });
  });
}
