import { getRedis } from '../config/redis.js';
import { Quiz } from '../models/quiz.js';
import crypto from 'crypto';

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
  
  if (state.status !== 'waiting') {
    throw new Error('Permainan sudah dimulai atau sudah selesai');
  }

  // Cek jika nama sudah ada (opsional, tergantung rule, untuk MVP kita beri suffix jika kembar)
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
