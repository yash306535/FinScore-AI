import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { QuizQuestion } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface QuizStepProps {
  question: QuizQuestion;
  selectedValue?: string;
  isLast: boolean;
  canGoBack: boolean;
  onSelect: (value: string) => void;
  onBack: () => void;
  onReview: () => void;
}

export const QuizStep = ({
  question,
  selectedValue,
  isLast,
  canGoBack,
  onSelect,
  onBack,
  onReview
}: QuizStepProps) => (
  <motion.div
    key={question.id}
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -30 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="mx-auto max-w-4xl"
  >
    <Card className="overflow-hidden p-8 sm:p-10">
      <p className="mb-8 text-center font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
        {question.question}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {question.options.map((option) => {
          const isSelected = selectedValue === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`group relative min-h-[120px] rounded-3xl border p-6 text-center transition duration-200 ${
                isSelected
                  ? 'border-amber bg-amber text-navy shadow-lg shadow-amber/20'
                  : 'border-border bg-slate-900/60 text-white hover:border-amber hover:bg-slate-800/90'
              }`}
            >
              {isSelected ? (
                <CheckCircle2 className="absolute right-4 top-4 h-6 w-6" />
              ) : null}
              <span className="text-lg font-semibold leading-snug">{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={onBack} disabled={!canGoBack}>
          Back
        </Button>
        {isLast ? (
          <Button variant="primary" onClick={onReview} disabled={!selectedValue}>
            Review and Submit
          </Button>
        ) : (
          <p className="text-sm text-muted">Choose an option and we will move you forward automatically.</p>
        )}
      </div>
    </Card>
  </motion.div>
);
