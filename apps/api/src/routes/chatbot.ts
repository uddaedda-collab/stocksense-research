import { Router } from 'express';
import { z } from 'zod';
import { answerChatbotQuery } from '../services/chatbot';
import { asyncHandler } from '../middleware/asyncHandler';
import { ApiError } from '../middleware/errorHandler';

export const chatbotRouter = Router();

const messageSchema = z.object({ message: z.string().min(1).max(500) });

chatbotRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, 'message is required (max 500 characters)');
    const response = await answerChatbotQuery(parsed.data.message);
    res.json(response);
  })
);
