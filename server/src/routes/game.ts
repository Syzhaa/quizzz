import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import * as gameService from '../services/game-service.js';

const router = Router();

const hostGameSchema = z.object({
  quizId: z.string().min(1, 'Quiz ID is required'),
});

router.post('/host', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { quizId } = hostGameSchema.parse(req.body);
    const hostId = req.admin!.adminId;
    
    const pin = await gameService.createGameSession(quizId, hostId);
    
    res.json({
      success: true,
      message: 'Game session created successfully',
      data: { pin }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validasi gagal', errors: error.errors });
    } else {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  }
});

router.get('/:pin', async (req, res) => {
  try {
    const pin = req.params.pin;
    const game = await gameService.getGameState(pin);
    
    if (!game) {
      res.status(404).json({ message: 'Game session not found' });
      return;
    }
    
    // Jangan berikan info sensitif, cukup status dan info quiz dasar
    res.json({
      success: true,
      message: 'Game session retrieved',
      data: {
        pin: game.pin,
        status: game.status,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { router as gameRouter };
