import { useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { Bot, Globe2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { AppShell } from '../components/layout/AppShell';
import { ScoreCard } from '../components/score/ScoreCard';
import { ScoreHistory } from '../components/score/ScoreHistory';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Loader } from '../components/ui/Loader';
import { Toast } from '../components/ui/Toast';
import { useScore } from '../hooks/useScore';
import { useQuizStore } from '../store/quizStore';
import { ScoreHistoryItem, ScoreResult, ToastState } from '../types';

const getGreeting = (name: string) => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return `Good morning ${name}.`;
  }

  if (hour < 18) {
    return `Good afternoon ${name}.`;
  }

  return `Good evening ${name}.`;
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { getLatestScore, getScoreHistory } = useScore();
  const resetQuiz = useQuizStore((state) => state.resetQuiz);
  const user = useQuizStore((state) => state.user);
  const [latestScore, setLatestScore] = useState<ScoreResult | null>(null);
  const [history, setHistory] = useState<ScoreHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({ open: false, message: '' });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const historyResult = await getScoreHistory();
        setHistory(historyResult);

        if (historyResult.length > 0) {
          const latest = await getLatestScore();
          setLatestScore(latest);
        } else {
          setLatestScore(null);
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        setToast({
          open: true,
          message: axiosError.response?.data?.message || 'Unable to load your dashboard right now.',
          variant: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const greeting = useMemo(() => getGreeting(user?.name || 'there'), [user?.name]);

  if (loading) {
    return <Loader fullScreen label="Loading your dashboard..." />;
  }

  return (
    <AppShell>
      <Toast {...toast} onClose={() => setToast({ open: false, message: '', variant: 'info' })} />
      <div className="app-container py-10 sm:py-14">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-white">{greeting}</h1>
          <p className="mt-2 text-lg text-muted">Here is your financial health overview.</p>
        </div>

        {latestScore ? (
          <ScoreCard score={latestScore} />
        ) : (
          <Card className="text-center">
            <h2 className="font-display text-3xl font-bold text-white">Your first score is waiting</h2>
            <p className="mt-3 text-muted">
              Take the assessment once to unlock your Money Health Score, AI insights, and action plan.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => {
                  resetQuiz();
                  navigate('/quiz');
                }}
              >
                Start Assessment
              </Button>
            </div>
          </Card>
        )}

        <Card className="mt-8 overflow-hidden border-amber/20 bg-[linear-gradient(150deg,rgba(245,158,11,0.12),rgba(15,23,42,0.94)_40%,rgba(15,23,42,0.98))]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-amber/80">
                <Bot className="h-3.5 w-3.5" />
                New AI Feature
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold text-white">Open AI Copilot</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
                Use the new separate chatbot to ask about your score, switch on live web research, and
                generate an Opportunity Radar with Serper-powered signals.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-sm text-emerald-300 ring-1 ring-emerald-400/25">
                <Globe2 className="h-4 w-4" />
                Live web mode
              </div>
              <Link to={latestScore ? `/assistant?scoreId=${latestScore.id}` : '/assistant'}>
                <Button className="px-5 py-3">Launch Copilot</Button>
              </Link>
            </div>
          </div>
        </Card>

        {history.length > 0 ? (
          <div className="mt-8">
            <ScoreHistory history={history} />
          </div>
        ) : null}

        <Card className="mt-8 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-white">Ready for your next assessment</h2>
            <p className="mt-2 text-muted">
              Take a fresh checkup after you complete a few action-plan milestones to see how your score moves.
            </p>
          </div>
          <Button
            onClick={() => {
              resetQuiz();
              navigate('/quiz');
            }}
          >
            Take New Assessment
          </Button>
        </Card>
      </div>
    </AppShell>
  );
};
