
import { get, post } from '../utils/http';

export interface Player {
  socketId: string;
  nickname: string;
  score: number;
}

export interface CreateGameSessionResponse {
  pin: string;
}

export interface GameSessionStatus {
  status: 'waiting' | 'starting' | 'playing' | 'finished';
  pin: string;
  quizId: string;
  hostId: string;
  currentQuestionIndex: number;
  players: Player[];
  questionStartTime?: number;
  answeredPlayers: Record<string, boolean>;
}

export async function createGameSession(quizId: string): Promise<string> {
  const res = await post<CreateGameSessionResponse>('/games/host', { quizId });
  if (!res.success || !res.data) {
    throw new Error(res.message || 'Failed to create game session');
  }
  return res.data.pin;
}

export async function getGameSessionStatus(pin: string): Promise<GameSessionStatus> {
  const res = await get<GameSessionStatus>(`/games/${pin}`);
  if (!res.success || !res.data) {
    throw new Error(res.message || 'Failed to fetch game session');
  }
  return res.data;
}
