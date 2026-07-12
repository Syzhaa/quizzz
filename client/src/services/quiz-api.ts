import { get, post, patch, del, ApiResponse } from '../utils/http';

export interface Choice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  durationSeconds: number;
  choices: Choice[];
  correctChoiceId: string;
  mediaUrl?: string;
}

export interface Quiz {
  _id: string;
  ownerId: string;
  title: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export async function getQuizzes(): Promise<Quiz[]> {
  const res: ApiResponse<Quiz[]> = await get('/quizzes');
  if (!res.success) throw new Error(res.message);
  return res.data || [];
}

export async function getQuiz(id: string): Promise<Quiz> {
  const res: ApiResponse<Quiz> = await get(`/quizzes/${id}`);
  if (!res.success) throw new Error(res.message);
  return res.data!;
}

export async function createQuiz(title: string): Promise<Quiz> {
  const res: ApiResponse<Quiz> = await post('/quizzes', { title });
  if (!res.success) throw new Error(res.message);
  return res.data!;
}

export async function updateQuiz(id: string, data: { title?: string; questions?: Question[] }): Promise<Quiz> {
  const res: ApiResponse<Quiz> = await patch(`/quizzes/${id}`, data);
  if (!res.success) throw new Error(res.message);
  return res.data!;
}

export async function deleteQuiz(id: string): Promise<void> {
  const res: ApiResponse<void> = await del(`/quizzes/${id}`);
  if (!res.success) throw new Error(res.message);
}

export async function duplicateQuiz(id: string): Promise<Quiz> {
  const res: ApiResponse<Quiz> = await post(`/quizzes/${id}/duplicate`, {});
  if (!res.success) throw new Error(res.message);
  return res.data!;
}
