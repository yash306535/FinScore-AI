import type { JwtPayload } from 'jsonwebtoken';

export const dimensionKeys = [
  'emergency',
  'insurance',
  'investments',
  'debt',
  'tax',
  'retirement'
] as const;

export type DimensionKey = (typeof dimensionKeys)[number];

export interface ScoreDimensionResult {
  score: number;
  label: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  insight: string;
}

export interface ScoreResult {
  totalScore: number;
  dimensions: Record<DimensionKey, ScoreDimensionResult>;
  topStrength: DimensionKey;
  topWeakness: DimensionKey;
  headline: string;
}

export interface ActionPlanItem {
  month: number;
  title: string;
  goal: string;
  action: string;
  amount: number | null;
  dimension: DimensionKey;
}

export interface AssistantMessageTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface SearchSource {
  position: number;
  title: string;
  link: string;
  snippet: string;
  source?: string;
  date?: string;
}

export interface OpportunityRadarPayload {
  title: string;
  summary: string;
  actions: string[];
  watchouts: string[];
}

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

export interface AppError extends Error {
  statusCode?: number;
}

export const createAppError = (message: string, statusCode: number): AppError =>
  Object.assign(new Error(message), { statusCode });

export const toDimensionTitle = (dimension: DimensionKey): string => {
  switch (dimension) {
    case 'emergency':
      return 'Emergency Fund';
    case 'insurance':
      return 'Insurance';
    case 'investments':
      return 'Investments';
    case 'debt':
      return 'Debt';
    case 'tax':
      return 'Tax Planning';
    case 'retirement':
      return 'Retirement';
    default:
      return dimension;
  }
};

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
