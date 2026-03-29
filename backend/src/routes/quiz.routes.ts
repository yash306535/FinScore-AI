import { Router } from 'express';
import { z } from 'zod';

import { submitQuiz } from '../controllers/quiz.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { quizRateLimit } from '../middleware/rateLimit.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const schema = z.object({
  quizAnswers: z.record(z.any()),
  income: z.number().positive('income must be greater than zero')
});

router.post('/submit', authMiddleware, quizRateLimit, validate(schema), submitQuiz);

export default router;
