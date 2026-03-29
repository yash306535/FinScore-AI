import { NextFunction, Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

import { generatePlan, getMotivationalInsight, scoreQuiz } from '../services/gemini.service';
import { createAppError } from '../types';

const prisma = new PrismaClient();

export const submitQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      next(createAppError('authentication required', 401));
      return;
    }

    const { quizAnswers, income } = req.body as {
      quizAnswers: Record<string, unknown>;
      income: number;
    };

    const scored = await scoreQuiz(quizAnswers);
    const geminiInsight = await getMotivationalInsight(scored.totalScore, scored.topWeakness);
    const actionPlan = await generatePlan(scored.totalScore, scored.topWeakness, income);
    const quizAnalysis = {
      answers: quizAnswers as Prisma.InputJsonObject,
      analysis: scored as unknown as Prisma.InputJsonObject
    } as Prisma.InputJsonObject;

    const savedScore = await prisma.scoreResult.create({
      data: {
        userId: req.userId,
        totalScore: scored.totalScore,
        emergency: scored.dimensions.emergency.score,
        insurance: scored.dimensions.insurance.score,
        investments: scored.dimensions.investments.score,
        debt: scored.dimensions.debt.score,
        tax: scored.dimensions.tax.score,
        retirement: scored.dimensions.retirement.score,
        quizAnswers: quizAnalysis,
        aiInsights: scored.headline,
        actionPlan: actionPlan as unknown as Prisma.InputJsonArray,
        geminiInsight
      }
    });

    res.status(201).json(savedScore);
  } catch (error) {
    next(error);
  }
};
