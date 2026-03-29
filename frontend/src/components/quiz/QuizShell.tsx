import { PropsWithChildren } from 'react';
import type { LucideIcon } from 'lucide-react';

import { QuizProgress } from './QuizProgress';

interface QuizShellProps {
  title: string;
  icon: LucideIcon;
  step: number;
  total: number;
  progress: number;
}

export const QuizShell = ({
  title,
  icon: Icon,
  step,
  total,
  progress,
  children
}: PropsWithChildren<QuizShellProps>) => (
  <div className="min-h-screen bg-navy text-white">
    <div className="sticky top-0 z-30 border-b border-white/5 bg-navy/90 backdrop-blur-xl">
      <div className="app-container py-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber/15 text-amber">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted">Current dimension</p>
              <h2 className="font-display text-xl font-bold text-white">{title}</h2>
            </div>
          </div>
          <p className="text-sm font-medium text-muted">
            Question {step} of {total}
          </p>
        </div>
        <QuizProgress progress={progress} />
      </div>
    </div>

    <div className="app-container py-8 sm:py-12">{children}</div>
  </div>
);
