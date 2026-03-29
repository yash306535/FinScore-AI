import { dimensionMeta } from '../../data/questions';
import { DimensionKey } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface QuizSummaryProps {
  counts: Record<string, { total: number; answered: number }>;
  income: string;
  incomeRequired: boolean;
  isSubmitting: boolean;
  onIncomeChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export const QuizSummary = ({
  counts,
  income,
  incomeRequired,
  isSubmitting,
  onIncomeChange,
  onBack,
  onSubmit
}: QuizSummaryProps) => (
  <div className="mx-auto max-w-4xl">
    <Card className="space-y-8 p-8 sm:p-10">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.26em] text-amber">Final review</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
          Ready to generate your Money Health Score
        </h2>
        <p className="mt-3 text-base text-muted">
          You have completed all 20 questions across the 6 core financial dimensions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(dimensionMeta) as DimensionKey[]).map((dimension) => {
          const Icon = dimensionMeta[dimension].icon;
          const count = counts[dimension] || { total: 0, answered: 0 };

          return (
            <div key={dimension} className="rounded-3xl border border-border bg-slate-900/60 p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber/15 text-amber">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-white">{dimensionMeta[dimension].label}</p>
                  <p className="text-sm text-muted">
                    {count.answered} of {count.total} answered
                  </p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div
                  className="h-2 rounded-full bg-amber"
                  style={{ width: `${count.total ? (count.answered / count.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {incomeRequired ? (
        <div className="rounded-3xl border border-amber/30 bg-amber/10 p-5">
          <label className="mb-2 block text-sm font-semibold text-white">Monthly income in rupees</label>
          <input
            value={income}
            onChange={(event) => onIncomeChange(event.target.value)}
            placeholder="Enter your monthly income"
            className="w-full rounded-2xl border border-border bg-navy px-4 py-3 text-white outline-none transition focus:border-amber"
            inputMode="numeric"
          />
          <p className="mt-2 text-sm text-muted">
            We use your income only to generate realistic rupee amounts in the action plan.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back to Edit
        </Button>
        <Button variant="primary" onClick={onSubmit} loading={isSubmitting}>
          Submit for Analysis
        </Button>
      </div>
    </Card>
  </div>
);
