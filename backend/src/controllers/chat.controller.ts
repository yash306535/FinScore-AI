import { NextFunction, Request, Response } from 'express';
import { PrismaClient, ScoreResult as StoredScoreResult } from '@prisma/client';

import {
  chatWithFinancialCopilot,
  chatWithScoreContext,
  generateOpportunityRadar
} from '../services/gemini.service';
import { searchWithSerper } from '../services/serper.service';
import {
  AssistantMessageTurn,
  DimensionKey,
  SearchSource,
  createAppError,
  dimensionKeys,
  toDimensionTitle
} from '../types';

const prisma = new PrismaClient();

const getAuthorizedScore = async (
  userId: string,
  scoreId?: string
): Promise<StoredScoreResult | null> => {
  if (scoreId) {
    const score = await prisma.scoreResult.findUnique({
      where: { id: scoreId }
    });

    if (!score) {
      throw createAppError('score not found', 404);
    }

    if (score.userId !== userId) {
      throw createAppError('forbidden', 403);
    }

    return score;
  }

  return prisma.scoreResult.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

const getWeaknessDimension = (score: StoredScoreResult | null): DimensionKey | null => {
  const weakness = (score?.quizAnswers as { analysis?: { topWeakness?: string } } | null)?.analysis
    ?.topWeakness;

  if (!weakness || !dimensionKeys.includes(weakness as DimensionKey)) {
    return null;
  }

  return weakness as DimensionKey;
};

const dimensionSearchHints: Record<DimensionKey, string> = {
  emergency: 'emergency fund liquid funds high yield savings account',
  insurance: 'term insurance health insurance plans premium coverage',
  investments: 'SIP mutual funds index funds asset allocation',
  debt: 'loan prepayment balance transfer debt snowball',
  tax: 'tax planning section 80C ELSS PPF NPS deductions',
  retirement: 'retirement corpus NPS EPF pension planning'
};

const buildAssistantSearchQuery = (
  message: string,
  score: StoredScoreResult | null
): string => {
  const weakness = getWeaknessDimension(score);
  const weaknessHint = weakness
    ? `${toDimensionTitle(weakness)} ${dimensionSearchHints[weakness]}`
    : 'personal finance money management';

  return `${message} India ${weaknessHint}`.replace(/\s+/g, ' ').trim();
};

const buildOpportunityRadarQuery = (score: StoredScoreResult | null): string => {
  const weakness = getWeaknessDimension(score);

  if (!weakness) {
    return 'best personal finance opportunities for salaried professionals in India 2026';
  }

  return `latest India ${toDimensionTitle(weakness)} opportunities 2026 for salaried professionals ${dimensionSearchHints[
    weakness
  ]}`.replace(/\s+/g, ' ');
};

export const sendChatMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      next(createAppError('authentication required', 401));
      return;
    }

    const { message, scoreId } = req.body as { message: string; scoreId: string };

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

    const reply = await chatWithScoreContext(score, message);

    res.json({ reply });
  } catch (error) {
    next(error);
  }
};

export const sendAssistantMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      next(createAppError('authentication required', 401));
      return;
    }

    const {
      message,
      scoreId,
      history = [],
      useWebSearch = false
    } = req.body as {
      message: string;
      scoreId?: string;
      history?: AssistantMessageTurn[];
      useWebSearch?: boolean;
    };

    const score = await getAuthorizedScore(req.userId, scoreId);
    let sources: SearchSource[] = [];
    let searchQuery: string | null = null;
    let warning: string | null = null;

    if (useWebSearch) {
      searchQuery = buildAssistantSearchQuery(message, score);

      try {
        sources = await searchWithSerper(searchQuery, 'search', 5);

        if (!sources.length) {
          warning = 'Live web search did not return usable sources, so the reply used score context only.';
        }
      } catch (error) {
        console.error(error);
        warning =
          'Live web search is temporarily unavailable, so the reply used score context only.';
      }
    }

    const reply = await chatWithFinancialCopilot({
      scoreContext: score,
      message,
      history,
      sources,
      searchQuery
    });

    res.json({
      reply,
      sources,
      scoreId: score?.id || null,
      liveWebUsed: useWebSearch && sources.length > 0,
      searchQuery,
      warning
    });
  } catch (error) {
    next(error);
  }
};

export const getOpportunityRadar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      next(createAppError('authentication required', 401));
      return;
    }

    const { scoreId } = req.body as { scoreId?: string };
    const score = await getAuthorizedScore(req.userId, scoreId);
    const searchQuery = buildOpportunityRadarQuery(score);
    let sources: SearchSource[] = [];
    let warning: string | null = null;

    try {
      sources = await searchWithSerper(searchQuery, 'news', 6);

      if (!sources.length) {
        warning =
          'Opportunity Radar could not find recent news items, so this brief leans more on your score context.';
      }
    } catch (error) {
      console.error(error);
      warning =
        'Live market/news search is temporarily unavailable, so this brief leans more on your score context.';
    }

    const radar = await generateOpportunityRadar({
      scoreContext: score,
      sources,
      searchQuery
    });

    const weakness = getWeaknessDimension(score);

    res.json({
      ...radar,
      sources,
      searchQuery,
      generatedAt: new Date().toISOString(),
      focusDimension: weakness ? toDimensionTitle(weakness) : null,
      scoreId: score?.id || null,
      warning
    });
  } catch (error) {
    next(error);
  }
};
