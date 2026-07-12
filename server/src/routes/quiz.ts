import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import * as quizService from '../services/quiz-service.js';

const router = Router();

const choiceSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1, 'Choice text cannot be empty'),
});

const questionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1, 'Question text cannot be empty'),
  durationSeconds: z.number().min(5, 'Minimum duration is 5 seconds').default(20),
  choices: z.array(choiceSchema).min(2, 'Minimum 2 choices').max(4, 'Maximum 4 choices'),
  correctChoiceId: z.string().min(1),
  mediaUrl: z.string().optional(),
}).refine(data => data.choices.some(c => c.id === data.correctChoiceId), {
  message: "correctChoiceId must match one of the choice ids",
  path: ["correctChoiceId"]
});

const createQuizSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200),
  questions: z.array(questionSchema).optional(),
});

const updateQuizSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200).optional(),
  questions: z.array(questionSchema).optional(),
});

// All quiz routes require authentication
router.use('/quizzes', authenticate);

router.get('/quizzes', async (req: AuthRequest, res: Response) => {
  try {
    const quizzes = await quizService.getQuizzesByOwner(req.admin!.adminId);
    res.json({ success: true, data: quizzes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/quizzes', async (req: AuthRequest, res: Response) => {
  const parsed = createQuizSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const quiz = await quizService.createQuiz(req.admin!.adminId, parsed.data.title, parsed.data.questions);
    res.status(201).json({ success: true, data: quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/quizzes/:quizId', async (req: AuthRequest, res: Response) => {
  try {
    const quiz = await quizService.getQuizById(req.params.quizId, req.admin!.adminId);
    res.json({ success: true, data: quiz });
  } catch (err) {
    if (err instanceof quizService.QuizError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.patch('/quizzes/:quizId', async (req: AuthRequest, res: Response) => {
  const parsed = updateQuizSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const quiz = await quizService.updateQuiz(req.params.quizId, req.admin!.adminId, parsed.data);
    res.json({ success: true, data: quiz });
  } catch (err) {
    if (err instanceof quizService.QuizError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/quizzes/:quizId', async (req: AuthRequest, res: Response) => {
  try {
    await quizService.deleteQuiz(req.params.quizId, req.admin!.adminId);
    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (err) {
    if (err instanceof quizService.QuizError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/quizzes/:quizId/duplicate', async (req: AuthRequest, res: Response) => {
  try {
    const quiz = await quizService.duplicateQuiz(req.params.quizId, req.admin!.adminId);
    res.status(201).json({ success: true, data: quiz });
  } catch (err) {
    if (err instanceof quizService.QuizError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
