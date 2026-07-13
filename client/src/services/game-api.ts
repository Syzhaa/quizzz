
import { get, post } from '../utils/http';

export async function createGameSession(quizId: string): Promise<string> {
  const res = await post<any>('/games/host', { quizId });
  if (!res.success) {
    throw new Error(res.message || 'Failed to create game session');
  }
  return res.data.pin;
}
export async function getGameSessionStatus(pin: string): Promise<any> {
  const res = await get<any>(`/games/${pin}`);
  if (!res.success) {
    throw new Error(res.message || 'Failed to fetch game session');
  }
  return res.data;
}
