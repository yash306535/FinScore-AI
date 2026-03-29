import { BarChart3, BrainCircuit, ListChecks, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { demoAnswers } from '../data/questions';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { useQuizStore } from '../store/quizStore';

const stats = [
  '95% of Indians have no financial plan',
  'CFP costs ?25,000 per year',
  'Your assessment is free and instant'
];

const steps = [
  {
    icon: ListChecks,
    title: 'Answer 20 Questions',
    description: 'Takes about 5 minutes across 6 financial areas.'
  },
  {
    icon: BrainCircuit,
    title: 'AI Analyses Your Profile',
    description: 'Claude and Gemini evaluate your financial health.'
  },
  {
    icon: BarChart3,
    title: 'Get Score and Action Plan',
    description: 'Instant score with a 12-month roadmap.'
  }
];

export const Landing = () => {
  const navigate = useNavigate();
  const isAuthenticated = useQuizStore((state) => state.isAuthenticated);

  const handleDemoClick = () => {
    window.localStorage.setItem('mhs_demo_pending', 'true');
    useQuizStore.setState({ quizAnswers: demoAnswers });

    if (isAuthenticated) {
      useQuizStore.setState({ currentStep: 20 });
      navigate('/quiz');
      return;
    }

    navigate('/register?demo=1');
  };

  return (
    <AppShell>
      <section className="app-container flex min-h-[calc(100vh-160px)] flex-col justify-center py-16">
        <div className="mx-auto max-w-5xl text-center">
          <Badge className="border-amber/25 bg-amber/10 text-amber">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Free AI Financial Health Check
          </Badge>
          <h1 className="mt-8 font-display text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
            Know Your Money Health Score in 5 Minutes
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
            Free AI-powered check across 6 financial dimensions built for India.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button className="px-8 py-4 text-base" onClick={() => navigate('/register')}>
              Check My Score Now
            </Button>
            <Button variant="outline" className="px-8 py-4 text-base" onClick={handleDemoClick}>
              See Sample Score
            </Button>
          </div>

          <div className="mt-14 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40">
            <div className="grid divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {stats.map((stat) => (
                <div key={stat} className="px-6 py-5 text-sm font-semibold text-white sm:text-base">
                  {stat}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="app-container pb-20">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.26em] text-amber">How it works</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
            A practical financial checkup, not generic advice
          </h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} hoverable className="relative overflow-hidden">
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-amber/10 blur-3xl" />
                <div className="relative">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/15 text-amber">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">{step.title}</h3>
                  <p className="mt-3 text-base leading-7 text-muted">{step.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
};
