import { questions } from '../data/questions';
import {
  AssistantReply,
  DimensionKey,
  OpportunityRadar,
  QuizAnswers,
  QuizQuestion,
  ScoreHistoryItem,
  ScoreResult
} from '../types';
import api from './api';

export const buildQuizSubmission = (quizAnswers: QuizAnswers) => {
  const dimensions = questions.reduce(
    (accumulator, question) => {
      accumulator[question.dimension].push({
        questionId: question.id,
        question: question.question,
        answer: quizAnswers[question.id] ?? null
      });
      return accumulator;
    },
    {
      emergency: [],
      insurance: [],
      investments: [],
      debt: [],
      tax: [],
      retirement: []
    } as Record<DimensionKey, Array<{ questionId: string; question: string; answer: string | null }>>
  );

  return {
    submittedAt: new Date().toISOString(),
    totalQuestions: questions.length,
    dimensions
  };
};

export const getQuestionById = (questionId: string): QuizQuestion | undefined =>
  questions.find((question) => question.id === questionId);

export const submitQuizRequest = async (
  quizAnswers: QuizAnswers,
  income: number
): Promise<ScoreResult> => {
  const { data } = await api.post<ScoreResult>('/quiz/submit', {
    quizAnswers: buildQuizSubmission(quizAnswers),
    income
  });

  return data;
};

export const getScoreByIdRequest = async (id: string): Promise<ScoreResult> => {
  const { data } = await api.get<ScoreResult>(`/score/${id}`);
  return data;
};

export const getLatestScoreRequest = async (): Promise<ScoreResult> => {
  const { data } = await api.get<ScoreResult>('/score/latest');
  return data;
};

export const getScoreHistoryRequest = async (): Promise<ScoreHistoryItem[]> => {
  const { data } = await api.get<ScoreHistoryItem[]>('/score/history');
  return data;
};

export const sendChatMessageRequest = async (
  scoreId: string,
  message: string
): Promise<string> => {
  const { data } = await api.post<{ reply: string }>('/chat/message', {
    scoreId,
    message
  });

  return data.reply;
};

export const sendAssistantMessageRequest = async (payload: {
  scoreId?: string;
  message: string;
  useWebSearch?: boolean;
  history?: Array<{ role: 'user' | 'assistant'; text: string }>;
}): Promise<AssistantReply> => {
  const { data } = await api.post<AssistantReply>('/chat/assistant', payload);
  return data;
};

export const getOpportunityRadarRequest = async (
  scoreId?: string
): Promise<OpportunityRadar> => {
  const { data } = await api.post<OpportunityRadar>('/chat/opportunity-radar', {
    ...(scoreId ? { scoreId } : {})
  });

  return data;
};

export const getAnalysisFromScore = (score: ScoreResult) => score.quizAnswers?.analysis;

export const getWeaknessFromScore = (score: ScoreResult): DimensionKey =>
  score.quizAnswers?.analysis?.topWeakness ||
  (Object.entries({
    emergency: score.emergency,
    insurance: score.insurance,
    investments: score.investments,
    debt: score.debt,
    tax: score.tax,
    retirement: score.retirement
  }).sort((a, b) => a[1] - b[1])[0]?.[0] as DimensionKey) ||
  'emergency';
