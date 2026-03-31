import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { generateScorePdf } from '../services/pdf.service';
import { createAppError } from '../types';

const prisma = new PrismaClient();

export const downloadScorePdf = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      next(createAppError('authentication required', 401));
      return;
    }

    const scoreId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!scoreId) {
      next(createAppError('score id is required', 400));
      return;
    }

    const [score, user] = await Promise.all([
      prisma.scoreResult.findUnique({ where: { id: scoreId } }),
      prisma.user.findUnique({ where: { id: req.userId }, select: { name: true } })
    ]);

    if (!score) {
      next(createAppError('score not found', 404));
      return;
    }

    if (score.userId !== req.userId) {
      next(createAppError('forbidden', 403));
      return;
    }

    const buffer = await generateScorePdf({ ...score, userName: user?.name });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="money-health-score-${scoreId.slice(0, 8)}.pdf"`,
      'Content-Length': String(buffer.length)
    });

    res.end(buffer);
  } catch (error) {
    next(error);
  }
};
