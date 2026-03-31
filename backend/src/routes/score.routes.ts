import { Router } from 'express';

import { downloadScorePdf } from '../controllers/pdf.controller';
import {
  getLatestScore,
  getScoreById,
  getScoreHistory
} from '../controllers/score.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/latest', getLatestScore);
router.get('/history', getScoreHistory);
router.get('/:id/pdf', downloadScorePdf);
router.get('/:id', getScoreById);

export default router;
