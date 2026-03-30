import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const loadEnvironment = () => {
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'backend/.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../backend/.env')
  ];

  for (const envPath of new Set(candidates)) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }
  }
};

loadEnvironment();

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { isAllowedFrontendOrigin } from './config/runtime';
import { errorMiddleware } from './middleware/error.middleware';
import { generalRateLimit } from './middleware/rateLimit.middleware';
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import healthRoutes from './routes/health.routes';
import quizRoutes from './routes/quiz.routes';
import scoreRoutes from './routes/score.routes';

const app = express();
const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST || '0.0.0.0';

app.set('trust proxy', 1);
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, isAllowedFrontendOrigin(origin));
    },
    credentials: true
  })
);
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(generalRateLimit);

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Money Health Score backend is running',
    health: '/api/health'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/health', healthRoutes);

app.use(errorMiddleware);

app.listen(port, host, () => {
  console.log(`Money Health Score backend listening on ${host}:${port}`);
});

export default app;
