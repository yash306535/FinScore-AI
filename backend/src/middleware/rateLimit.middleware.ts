import rateLimit from 'express-rate-limit';

const parseEnvNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const quizRateLimit = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ message: 'too many quiz submissions please wait a minute' });
  }
});

export const generalRateLimit = rateLimit({
  windowMs: parseEnvNumber(process.env.RATE_LIMIT_WINDOW_MS, 900_000),
  max: parseEnvNumber(process.env.RATE_LIMIT_MAX, 100),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ message: 'too many requests please try again later' });
  }
});
