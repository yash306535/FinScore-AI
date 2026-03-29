import { Router } from 'express';
import { z } from 'zod';

import {
  getOpportunityRadar,
  sendAssistantMessage,
  sendChatMessage
} from '../controllers/chat.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const schema = z.object({
  message: z.string().min(1, 'message is required'),
  scoreId: z.string().min(1, 'scoreId is required')
});

const assistantSchema = z.object({
  message: z.string().min(1, 'message is required'),
  scoreId: z.string().min(1, 'scoreId is required').optional(),
  useWebSearch: z.boolean().optional().default(false),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        text: z.string().min(1, 'text is required').max(4000, 'text is too long')
      })
    )
    .max(12, 'history is too long')
    .optional()
    .default([])
});

const opportunityRadarSchema = z.object({
  scoreId: z.string().min(1, 'scoreId is required').optional()
});

router.post('/message', authMiddleware, validate(schema), sendChatMessage);
router.post('/assistant', authMiddleware, validate(assistantSchema), sendAssistantMessage);
router.post(
  '/opportunity-radar',
  authMiddleware,
  validate(opportunityRadarSchema),
  getOpportunityRadar
);

export default router;
