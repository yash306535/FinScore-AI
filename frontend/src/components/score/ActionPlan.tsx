import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';

import { dimensionMeta } from '../../data/questions';
import { ActionPlanItem } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface ActionPlanProps {
  items: ActionPlanItem[];
  scoreId: string;
}

export const ActionPlan = ({ items, scoreId }: ActionPlanProps) => {
  const storageKey = `actionplan_${scoreId}`;
  const [completedMonths, setCompletedMonths] = useState<number[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCompletedMonths(JSON.parse(saved) as number[]);
      } catch (error) {
        setCompletedMonths([]);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(completedMonths));
  }, [completedMonths, storageKey]);

  const completedCount = completedMonths.length;
  const currentMonth = useMemo(
    () => items.find((item) => !completedMonths.includes(item.month))?.month ?? items.at(-1)?.month ?? 1,
    [completedMonths, items]
  );

  const toggleMonth = (month: number) => {
    setCompletedMonths((previous) =>
      previous.includes(month)
        ? previous.filter((value) => value !== month)
        : [...previous, month].sort((a, b) => a - b)
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-white">Your 12-Month Financial Roadmap</h2>
          <p className="mt-2 text-muted">Personalized steps to improve your Money Health Score.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-white">
          <span className="font-semibold text-success">{completedCount}</span> of 12 months completed
        </div>
      </div>

      <div className="relative space-y-4 md:space-y-0">
        <div className="absolute bottom-0 left-5 top-0 hidden w-px bg-border md:block" />
        {items.map((item) => {
          const isCompleted = completedMonths.includes(item.month);
          const isCurrent = item.month === currentMonth;
          const markerClass = isCompleted
            ? 'bg-success text-white'
            : isCurrent
              ? 'bg-amber text-navy'
              : 'bg-slate-700 text-muted';

          return (
            <div key={item.month} className="relative md:grid md:grid-cols-[56px,1fr] md:gap-5 md:pb-5">
              <div className="relative hidden md:flex md:justify-center">
                <div className={`z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${markerClass}`}>
                  {item.month}
                </div>
              </div>
              <Card
                className={`relative border-l-4 ${isCompleted ? 'border-l-success' : isCurrent ? 'border-l-amber' : 'border-l-border'} p-5 md:p-6`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-bold md:hidden ${markerClass}`}>
                      {item.month}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className={`text-lg font-bold text-white ${isCompleted ? 'line-through opacity-80' : ''}`}>
                          {item.title}
                        </h3>
                        {item.amount !== null ? (
                          <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                            {formatCurrency(item.amount)}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-white/90">{item.goal}</p>
                      <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-muted">
                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-amber" />
                        <span>{item.action}</span>
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => toggleMonth(item.month)}
                    className="mt-1 h-5 w-5 rounded border-border bg-navy text-success accent-success"
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <Badge className="border-white/10 bg-white/5 text-muted">
                    {dimensionMeta[item.dimension].label}
                  </Badge>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </section>
  );
};
