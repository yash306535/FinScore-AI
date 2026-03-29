import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { createAppError } from '../types';

const prisma = new PrismaClient();

export const getLatestScore = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      next(createAppError('authentication required', 401));
      return;
    }

    const latest = await prisma.scoreResult.findFirst({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!latest) {
      next(createAppError('score not found', 404));
      return;
    }

    res.json(latest);
  } catch (error) {
    next(error);
  }
};

export const getScoreHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      next(createAppError('authentication required', 401));
      return;
    }

    const history = await prisma.scoreResult.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        totalScore: true,
        createdAt: true
      }
    });

    res.json(history);
  } catch (error) {
    next(error);
  }
};

export const getScoreById = async (
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

    const score = await prisma.scoreResult.findUnique({
      where: { id: scoreId }
    });

    if (!score) {
      next(createAppError('score not found', 404));
      return;
    }

    if (score.userId !== req.userId) {
      next(createAppError('forbidden', 403));
      return;
    }

    res.json(score);
  } catch (error) {
    next(error);
  }
};
