import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

import {
  ActionPlanItem,
  AssistantMessageTurn,
  DimensionKey,
  OpportunityRadarPayload,
  SearchSource,
  createAppError,
  toDimensionTitle
} from '../types';
import { formatSourcesForPrompt } from './serper.service';
import { normalizeScore } from './scoring.service';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const SCORING_SYSTEM_PROMPT = `You are a Certified Financial Planner with 15 years of experience specializing in personal finance for working Indians aged 22 to 45. Analyze the provided quiz answers carefully and score each of the 6 financial dimensions from 0 to 100 using Indian financial best practices and SEBI guidelines. Be strict and realistic with scoring. Apply these exact weights to calculate totalScore: Emergency Fund 20 percent, Insurance 15 percent, Investments 25 percent, Debt 20 percent, Tax Planning 10 percent, Retirement 10 percent. Return ONLY a valid JSON object with no extra text before or after. The JSON must have exactly these fields: totalScore as a number rounded to 1 decimal, dimensions as an object containing emergency, insurance, investments, debt, tax, and retirement where each has score as number, label as exactly one of Poor or Fair or Good or Excellent, and insight as exactly 2 specific sentences referencing the user's actual answers, topStrength as the key of the highest scoring dimension, topWeakness as the key of the lowest scoring dimension, headline as one compelling sentence that summarizes their financial health without being generic.`;

const actionPlanSchema = z
  .array(
    z.object({
      month: z.number().int().min(1).max(12),
      title: z.string().min(1),
      goal: z.string().min(1),
      action: z.string().min(1),
      amount: z.number().int().nullable(),
      dimension: z.enum([
        'emergency',
        'insurance',
        'investments',
        'debt',
        'tax',
        'retirement'
      ])
    })
  )
  .length(12);

const coerceToString = z.preprocess((val) => {
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) {
    const first = Object.values(val as Record<string, unknown>).find((v) => typeof v === 'string');
    return first ?? JSON.stringify(val);
  }
  return String(val);
}, z.string().min(1));

const opportunityRadarSchema = z.object({
  title: z.string().min(1).max(120),
  summary: z.string().min(1),
  actions: z.array(coerceToString).min(1).max(6),
  watchouts: z.array(coerceToString).min(1).max(5)
});

const getGeminiClient = (): GoogleGenerativeAI => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw createAppError('GEMINI_API_KEY is not configured', 500);
  }

  return new GoogleGenerativeAI(apiKey);
};

const getGeminiModel = (systemInstruction: string, responseMimeType?: string) =>
  getGeminiClient().getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction,
    generationConfig: {
      temperature: responseMimeType === 'application/json' ? 0.2 : 0.7,
      ...(responseMimeType ? { responseMimeType } : {})
    }
  });

const normalizeModelText = (text: string): string =>
  text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .replace(/\r/g, '')
    .trim();

const formatScoreContext = (scoreContext: unknown): string =>
  scoreContext
    ? JSON.stringify(scoreContext, null, 2)
    : 'No saved Money Health Score is available. Offer useful general guidance and invite the user to take the assessment when relevant.';

const formatConversationHistory = (history: AssistantMessageTurn[]): string => {
  if (!history.length) {
    return 'No earlier conversation turns.';
  }

  return history
    .slice(-8)
    .map((entry) => `${entry.role === 'assistant' ? 'Assistant' : 'User'}: ${entry.text}`)
    .join('\n');
};

const generateTextWithGemini = async (
  systemInstruction: string,
  prompt: string,
  emptyResponseMessage: string
): Promise<string> => {
  const model = getGeminiModel(systemInstruction);
  const result = await model.generateContent(prompt);
  const text = result.response
    .text()
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) {
    throw createAppError(emptyResponseMessage, 502);
  }

  return text;
};

const generateJsonWithGemini = async (
  systemInstruction: string,
  prompt: string,
  parseFailureMessage: string,
  emptyResponseMessage: string
): Promise<unknown> => {
  const model = getGeminiModel(systemInstruction, 'application/json');
  const result = await model.generateContent(prompt);
  const rawText = normalizeModelText(result.response.text());

  if (!rawText) {
    throw createAppError(emptyResponseMessage, 502);
  }

  try {
    return JSON.parse(rawText);
  } catch (error) {
    throw createAppError(`${parseFailureMessage} Raw response: ${rawText.slice(0, 700)}`, 502);
  }
};

export const scoreQuiz = async (quizAnswers: Record<string, unknown>) => {
  const parsed = await generateJsonWithGemini(
    SCORING_SYSTEM_PROMPT,
    `Score this quiz answer payload:\n${JSON.stringify(quizAnswers, null, 2)}`,
    'Failed to parse Gemini scoring response.',
    'Gemini returned an empty scoring response'
  );

  return normalizeScore(parsed);
};

export const getMotivationalInsight = async (
  score: number,
  weakness: string
): Promise<string> =>
  generateTextWithGemini(
    'You are a behavioral finance coach for young Indian professionals. Keep responses warm, direct, non-judgmental, and practical.',
    `The user just received their Money Health Score of ${score} out of 100. Their biggest financial weakness is in the ${toDimensionTitle(
      weakness as DimensionKey
    )} dimension. Write exactly 3 sentences as a single plain paragraph with no formatting. First sentence: acknowledge one specific thing they are doing well based on their score. Second sentence: give the single highest-impact action they can take in the next 7 days, name a specific rupee amount or product. Third sentence: paint a picture of where they will be in 12 months if they take that action today. Do not use bullet points, headers, bold, or any markdown formatting.`,
    'Gemini returned an empty motivational insight'
  );

export const generatePlan = async (
  score: number,
  weakness: string,
  income: number
): Promise<ActionPlanItem[]> => {
  const parsed = await generateJsonWithGemini(
    'You create realistic, step-by-step personal finance action plans for Indian professionals. Always return exactly the requested JSON and keep rupee amounts realistic for the stated income.',
    `Create a 12-month personalized financial action plan for an Indian professional. Their Money Health Score is ${score} out of 100. Their weakest financial dimension is ${weakness}. Their monthly income is ${income} rupees. Return ONLY a valid JSON array of exactly 12 objects with no extra text. Each object must have these fields: month as integer from 1 to 12, title as action title under 7 words, goal as specific measurable goal for that month, action as one concrete step to take this month, amount as integer rupee amount or null if not applicable, dimension as the financial dimension this addresses using one of these exact values: emergency, insurance, investments, debt, tax, retirement. Rules: Month 1 must be a quick win completable in one week. Months 2 and 3 build on month 1. From month 4 increase complexity gradually. Distribute actions across all 6 dimensions over the 12 months. Use specific Indian products: mention SIP for mutual funds, term insurance from LIC or HDFC Life, PPF contributions, NPS Tier 1, ELSS funds for tax saving, Floater health insurance plans.`,
    'Failed to parse Gemini action plan response.',
    'Gemini returned an empty action plan response'
  );

  const validation = actionPlanSchema.safeParse(parsed);

  if (!validation.success) {
    throw createAppError(
      `Gemini action plan response was invalid: ${validation.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')}`,
      502
    );
  }

  return [...validation.data].sort((a, b) => a.month - b.month) as ActionPlanItem[];
};

export const chatWithScoreContext = async (
  scoreContext: unknown,
  message: string
): Promise<string> =>
  generateTextWithGemini(
    `You are a personal financial advisor reviewing a client's Money Health Score report. Answer conversationally, cite the user's actual scores and context, use Indian rupees for amounts, keep replies under 4 sentences unless asked for more detail, and start with the biggest improvement opportunity when in doubt.`,
    `Here is the user's complete financial profile and saved score context:\n${JSON.stringify(
      scoreContext,
      null,
      2
    )}\n\nUser question: ${message}`,
    'Gemini returned an empty chat response'
  );

export const chatWithFinancialCopilot = async ({
  scoreContext,
  message,
  history = [],
  sources = [],
  searchQuery
}: {
  scoreContext: unknown;
  message: string;
  history?: AssistantMessageTurn[];
  sources?: SearchSource[];
  searchQuery?: string | null;
}): Promise<string> =>
  generateTextWithGemini(
    `You are Money Health Copilot, an AI financial coach for Indian professionals. Keep answers warm, sharp, and practical. Use the user's Money Health Score context when available. When live web sources are provided, ground time-sensitive claims only in those sources, mention exact dates when helpful, and cite the source number in square brackets like [1] or [2]. Never invent a citation. Keep answers under 6 sentences unless the user asks for more.`,
    `Today's date: ${new Date().toISOString().slice(0, 10)}

Saved Money Health Score context:
${formatScoreContext(scoreContext)}

Recent conversation:
${formatConversationHistory(history)}

Live web mode: ${sources.length ? 'ON' : 'OFF'}
${searchQuery ? `Search query used: ${searchQuery}` : ''}

Live web sources:
${formatSourcesForPrompt(sources)}

User message:
${message}`,
    'Gemini returned an empty assistant response'
  );

export const generateOpportunityRadar = async ({
  scoreContext,
  sources,
  searchQuery
}: {
  scoreContext: unknown;
  sources: SearchSource[];
  searchQuery: string;
}): Promise<OpportunityRadarPayload> => {
  const parsed = await generateJsonWithGemini(
    `You create punchy, decision-ready opportunity briefs for a personal finance app used by Indian professionals. Always return exactly the requested JSON and keep the advice concrete, timely, and realistic.`,
    `Today's date: ${new Date().toISOString().slice(0, 10)}

Saved Money Health Score context:
${formatScoreContext(scoreContext)}

Search query used:
${searchQuery}

Live web sources:
${formatSourcesForPrompt(sources)}

Return ONLY a JSON object with these exact fields:
- title: short headline under 10 words
- summary: 2 concise sentences explaining the current opportunity
- actions: array of exactly 3 concrete next steps
- watchouts: array of exactly 2 risks or caveats

Rules:
- Tailor the brief to the user's weakest dimension when available.
- Keep it India-specific.
- If the sources are recent news or changing market guidance, reflect that with concrete wording instead of vague statements.
- Do not mention fields outside the JSON schema.`,
    'Failed to parse Gemini opportunity radar response.',
    'Gemini returned an empty opportunity radar response'
  );

  const validation = opportunityRadarSchema.safeParse(parsed);

  if (!validation.success) {
    throw createAppError(
      `Gemini opportunity radar response was invalid: ${validation.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')}`,
      502
    );
  }

  return validation.data;
};
