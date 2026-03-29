import { z } from 'zod';

import { DimensionKey, ScoreResult, createAppError, dimensionKeys } from '../types';

const dimensionSchema = z.object({
  score: z.number().min(0).max(100),
  label: z.enum(['Poor', 'Fair', 'Good', 'Excellent']),
  insight: z.string().min(1)
});

const scoreSchema = z.object({
  totalScore: z.number().min(0).max(100),
  dimensions: z.object({
    emergency: dimensionSchema,
    insurance: dimensionSchema,
    investments: dimensionSchema,
    debt: dimensionSchema,
    tax: dimensionSchema,
    retirement: dimensionSchema
  }),
  topStrength: z.enum(dimensionKeys),
  topWeakness: z.enum(dimensionKeys),
  headline: z.string().min(1)
});

export const normalizeScore = (raw: unknown): ScoreResult => {
  const parsed = scoreSchema.safeParse(raw);

  if (!parsed.success) {
    throw createAppError(
      `AI scoring response was invalid: ${parsed.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')}`,
      502
    );
  }

  return {
    totalScore: roundScore(parsed.data.totalScore),
    dimensions: Object.fromEntries(
      Object.entries(parsed.data.dimensions).map(([key, value]) => [
        key,
        {
          score: roundScore(value.score),
          label: value.label,
          insight: value.insight.trim()
        }
      ])
    ) as ScoreResult['dimensions'],
    topStrength: parsed.data.topStrength,
    topWeakness: parsed.data.topWeakness,
    headline: parsed.data.headline.trim()
  };
};

export const getGradeFromScore = (score: number): string => {
  if (score >= 85) {
    return 'A+';
  }

  if (score >= 70) {
    return 'A';
  }

  if (score >= 55) {
    return 'B';
  }

  if (score >= 40) {
    return 'C';
  }

  if (score >= 20) {
    return 'D';
  }

  return 'F';
};

export const getWeakestDimension = (dimensions: ScoreResult['dimensions']): DimensionKey =>
  (Object.entries(dimensions).sort((a, b) => a[1].score - b[1].score)[0]?.[0] as DimensionKey) ||
  'emergency';

const roundScore = (value: number): number => Number(value.toFixed(1));
