import mongoose from 'mongoose';
import { Quiz, Question } from '../models/quiz.js';

export class QuizError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
  }
}

export async function getQuizzesByOwner(ownerId: string) {
  return Quiz.find({ ownerId }).sort({ createdAt: -1 });
}

export async function getQuizById(quizId: string, ownerId: string) {
  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    throw new QuizError('INVALID_QUIZ_ID', 'Invalid quiz ID format', 400);
  }
  const quiz = await Quiz.findOne({ _id: quizId, ownerId });
  if (!quiz) {
    throw new QuizError('QUIZ_NOT_FOUND', 'Quiz not found or unauthorized', 404);
  }
  return quiz;
}

export async function createQuiz(ownerId: string, title: string, questions: Question[] = []) {
  return Quiz.create({ ownerId, title, questions });
}

export async function updateQuiz(
  quizId: string,
  ownerId: string,
  data: { title?: string; questions?: Question[] }
) {
  const quiz = await getQuizById(quizId, ownerId);

  if (data.title !== undefined) quiz.title = data.title;
  if (data.questions !== undefined) quiz.questions = data.questions;

  await quiz.save();
  return quiz;
}

export async function deleteQuiz(quizId: string, ownerId: string) {
  const quiz = await getQuizById(quizId, ownerId);
  await quiz.deleteOne();
  return { success: true };
}

export async function duplicateQuiz(quizId: string, ownerId: string) {
  const original = await getQuizById(quizId, ownerId);
  
  const duplicated = await Quiz.create({
    ownerId,
    title: `${original.title} (Copy)`,
    questions: original.questions,
  });

  return duplicated;
}
