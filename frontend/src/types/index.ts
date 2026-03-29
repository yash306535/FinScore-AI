import type { LucideIcon } from 'lucide-react';

export type DimensionKey =
  | 'emergency'
  | 'insurance'
  | 'investments'
  | 'debt'
  | 'tax'
  | 'retirement';

export interface User {
  id: string;
  name: string;
  email: string;
  age?: number | null;
  income?: number | null;
  createdAt: string;
}

export interface QuizOption {
  label: string;
  value: string;
}

export interface QuizQuestion {
  id: string;
  dimension: DimensionKey;
  dimensionLabel: string;
  icon: LucideIcon;
  question: string;
  options: QuizOption[];
}

export type QuizAnswers = Record<string, string>;

export interface DimensionInsight {
  score: number;
  label: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  insight: string;
}

export interface QuizAnalysis {
  totalScore: number;
  dimensions: Record<DimensionKey, DimensionInsight>;
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

export interface ScoreResult {
  id: string;
  userId: string;
  totalScore: number;
  emergency: number;
  insurance: number;
  investments: number;
  debt: number;
  tax: number;
  retirement: number;
  quizAnswers: {
    answers?: Record<string, unknown>;
    analysis?: QuizAnalysis;
  };
  aiInsights: string;
  actionPlan: ActionPlanItem[];
  geminiInsight?: string | null;
  createdAt: string;
}

export interface ScoreHistoryItem {
  id: string;
  totalScore: number;
  createdAt: string;
}

export interface ApiValidationError {
  field: string;
  message: string;
}

export interface ToastState {
  open: boolean;
  message: string;
  variant?: 'success' | 'error' | 'info';
}

export interface ChatSource {
  position: number;
  title: string;
  link: string;
  snippet: string;
  source?: string;
  date?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: ChatSource[];
  mode?: 'score' | 'live-web';
  warning?: string | null;
  searchQuery?: string | null;
}

export interface AssistantReply {
  reply: string;
  sources: ChatSource[];
  scoreId: string | null;
  liveWebUsed: boolean;
  searchQuery: string | null;
  warning?: string | null;
}

export interface OpportunityRadar {
  title: string;
  summary: string;
  actions: string[];
  watchouts: string[];
  sources: ChatSource[];
  searchQuery: string;
  generatedAt: string;
  focusDimension: string | null;
  scoreId: string | null;
  warning?: string | null;
}
