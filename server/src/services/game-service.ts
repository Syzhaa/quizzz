import { getRedis } from '../config/redis.js';
import { Quiz, Question } from '../models/quiz.js';

export interface Player {
  socketId: string;
  nickname: string;
  score: number;
}

export interface GameState {
  pin: string;
  quizId: string;
  hostId: string;
  hostSocketId?: string;
  status: 'waiting' | 'starting' | 'playing' | 'finished';
  currentQuestionIndex: number;
  players: Record<string, Player>; // socketId -> Player
  questions: Question[];
  questionStartTime?: number;
  answeredPlayers: Record<string, boolean>;
}

// Menghasilkan 6 digit angka acak (String)
function generatePIN(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const GAME_PREFIX = 'game:';

export async function createGameSession(quizId: string, hostId: string): Promise<string> {
  const quiz = await Quiz.findOne({ _id: quizId, ownerId: hostId });
  if (!quiz) {
    throw new Error('Quiz not found or unauthorized');
  }

  const redis = getRedis();
  let pin = generatePIN();
  
  // Pastikan PIN unik (sangat kecil kemungkinannya bentrok, tapi kita handle)
  let isExists = await redis.exists(`${GAME_PREFIX}${pin}`);
  while (isExists) {
    pin = generatePIN();
    isExists = await redis.exists(`${GAME_PREFIX}${pin}`);
  }

  const gameState: GameState = {
    pin,
    quizId,
    hostId,
    status: 'waiting',
    currentQuestionIndex: -1,
    players: {},
    questions: quiz.questions,
    answeredPlayers: {},
  };

  // Simpan game state di Redis (berlaku 24 jam)
  await redis.setex(`${GAME_PREFIX}${pin}`, 60 * 60 * 24, JSON.stringify(gameState));

  return pin;
}

export async function getGameState(pin: string): Promise<GameState | null> {
  const redis = getRedis();
  const data = await redis.get(`${GAME_PREFIX}${pin}`);
  if (!data) return null;
  return JSON.parse(data) as GameState;
}

export async function saveGameState(pin: string, state: GameState): Promise<void> {
  const redis = getRedis();
  // Simpan ulang dengan TTL 24 jam
  await redis.setex(`${GAME_PREFIX}${pin}`, 60 * 60 * 24, JSON.stringify(state));
}

export async function setHostSocketId(pin: string, socketId: string): Promise<GameState> {
  const state = await getGameState(pin);
  if (!state) throw new Error('Game session not found');
  
  state.hostSocketId = socketId;
  await saveGameState(pin, state);
  return state;
}

export async function addPlayer(pin: string, socketId: string, nickname: string): Promise<GameState> {
  const state = await getGameState(pin);
  if (!state) throw new Error('Game session not found');
  
  if (state.status === 'finished') {
    throw new Error('Sesi kuis sudah selesai');
  }

  // Jika game sudah playing, cek apakah ini reconnect (nickname sudah ada dengan socketId lama)
  if (state.status === 'playing') {
    const existingEntry = Object.entries(state.players).find(
      ([, p]) => p.nickname.toLowerCase() === nickname.toLowerCase()
    );
    if (existingEntry) {
      const [oldSocketId, oldPlayer] = existingEntry;
      if (oldSocketId !== socketId) {
        // Migrasi data player ke socket ID baru
        delete state.players[oldSocketId];
        state.players[socketId] = {
          socketId,
          nickname: oldPlayer.nickname,
          score: oldPlayer.score,
        };
        // Migrasi juga answeredPlayers jika ada
        if (state.answeredPlayers[oldSocketId]) {
          delete state.answeredPlayers[oldSocketId];
          state.answeredPlayers[socketId] = true;
        }
      }
      await saveGameState(pin, state);
      return state;
    }
    // Player baru join di tengah game - buat entry baru
    state.players[socketId] = {
      socketId,
      nickname,
      score: 0,
    };
    await saveGameState(pin, state);
    return state;
  }

  // Status waiting - logika normal
  let finalNickname = nickname;
  let counter = 1;
  const existingNames = Object.values(state.players).map(p => p.nickname.toLowerCase());
  while (existingNames.includes(finalNickname.toLowerCase())) {
    finalNickname = `${nickname} ${counter}`;
    counter++;
  }

  state.players[socketId] = {
    socketId,
    nickname: finalNickname,
    score: 0,
  };

  await saveGameState(pin, state);
  return state;
}

export async function removePlayer(pin: string, socketId: string): Promise<GameState> {
  const state = await getGameState(pin);
  if (!state) throw new Error('Game session not found');
  
  if (state.players[socketId]) {
    delete state.players[socketId];
    await saveGameState(pin, state);
  }
  return state;
}

export async function prepareGame(pin: string): Promise<GameState> {
  const state = await getGameState(pin);
  if (!state) throw new Error('Game session not found');
  
  if (!state.questions || state.questions.length === 0) {
    throw new Error('Sesi kuis sudah kadaluarsa atau tidak valid, silakan buat sesi HOST baru dari Dashboard.');
  }

  state.status = 'playing';
  state.currentQuestionIndex = 0;
  state.answeredPlayers = {};
  
  await saveGameState(pin, state);
  return state;
}

export async function setQuestionStartTime(pin: string): Promise<void> {
  const state = await getGameState(pin);
  if (!state) return;
  state.questionStartTime = Date.now();
  await saveGameState(pin, state);
}

export async function nextQuestion(pin: string): Promise<GameState> {
  const state = await getGameState(pin);
  if (!state) throw new Error('Game session not found');
  
  if (state.currentQuestionIndex >= state.questions.length - 1) {
    state.status = 'finished';
  } else {
    state.currentQuestionIndex += 1;
    state.questionStartTime = Date.now();
    state.answeredPlayers = {};
  }
  
  await saveGameState(pin, state);
  return state;
}

export async function submitAnswer(
  pin: string, 
  socketId: string, 
  choiceId: string
): Promise<{ state: GameState, isCorrect: boolean, scoreGained: number }> {
  const state = await getGameState(pin);
  if (!state) throw new Error('Game session not found');
  
  if (state.status !== 'playing') throw new Error('Game is not playing');
  if (state.answeredPlayers[socketId]) throw new Error('Player already answered');
  
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isCorrect = currentQuestion.correctChoiceId === choiceId;
  
  let scoreGained = 0;
  if (isCorrect && state.questionStartTime) {
    const timeElapsedMs = Date.now() - state.questionStartTime;
    const maxTimeMs = currentQuestion.durationSeconds * 1000;
    
    // Kahoot-style scoring logic (max 1000, decreases to 500 based on time)
    if (timeElapsedMs < maxTimeMs) {
      const timeRatio = 1 - (timeElapsedMs / maxTimeMs);
      scoreGained = Math.round(500 + (500 * timeRatio));
    }
  }
  
  state.players[socketId].score += scoreGained;
  state.answeredPlayers[socketId] = true;
  
  await saveGameState(pin, state);
  return { state, isCorrect, scoreGained };
}
