import { Router } from 'express';
import { z } from 'zod';

import { login, logout, me, register } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const optionalNumber = (options?: { integer?: boolean }) =>
  z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }

      const parsed = Number(value);
      return Number.isNaN(parsed) ? value : parsed;
    },
    options?.integer
      ? z.number().int().positive().optional()
      : z.number().positive().optional()
  );

const registerSchema = z.object({
  name: z.string().min(2, 'name must be at least 2 characters'),
  email: z.string().email('enter a valid email address'),
  password: z.string().min(8, 'password must be at least 8 characters'),
  age: optionalNumber({ integer: true }),
  income: optionalNumber()
});

const loginSchema = z.object({
  email: z.string().email('enter a valid email address'),
  password: z.string().min(1, 'password is required')
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);

export default router;
