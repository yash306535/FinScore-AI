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

import { errorMiddleware } from './middleware/error.middleware';
import { generalRateLimit } from './middleware/rateLimit.middleware';
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import healthRoutes from './routes/health.routes';
import quizRoutes from './routes/quiz.routes';
import scoreRoutes from './routes/score.routes';

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(generalRateLimit);

app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/health', healthRoutes);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Money Health Score backend listening on port ${port}`);
});

export default app;
