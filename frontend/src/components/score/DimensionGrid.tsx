import { dimensionMeta } from '../../data/questions';
import { DimensionInsight, DimensionKey, ScoreResult } from '../../types';
import { getScoreBgClass } from '../../utils/scoreColor';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

const fallbackLabel = (score: number): DimensionInsight['label'] => {
  if (score >= 85) {
    return 'Excellent';
  }

  if (score >= 60) {
    return 'Good';
  }

  if (score >= 40) {
    return 'Fair';
  }

  return 'Poor';
};

const buildFallbackInsight = (dimension: string, score: number): string =>
  `Your ${dimension.toLowerCase()} score is ${score.toFixed(1)} out of 100. Complete the quiz again after making improvements to track movement here.`;

interface DimensionGridProps {
  score: ScoreResult;
}

export const DimensionGrid = ({ score }: DimensionGridProps) => {
  const analysis = score.quizAnswers?.analysis?.dimensions;
  const dimensionScores = {
    emergency: score.emergency,
    insurance: score.insurance,
    investments: score.investments,
    debt: score.debt,
    tax: score.tax,
    retirement: score.retirement
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {(Object.keys(dimensionScores) as DimensionKey[]).map((dimension) => {
        const Icon = dimensionMeta[dimension].icon;
        const detail = analysis?.[dimension] || {
          score: dimensionScores[dimension],
          label: fallbackLabel(dimensionScores[dimension]),
          insight: buildFallbackInsight(dimensionMeta[dimension].label, dimensionScores[dimension])
        };

        return (
          <Card key={dimension} hoverable className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-amber">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-white">{dimensionMeta[dimension].label}</h3>
              </div>
              <span className="text-2xl font-bold text-white">{detail.score.toFixed(1)}</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full ${
                  detail.score >= 70 ? 'bg-success' : detail.score >= 40 ? 'bg-amber' : 'bg-danger'
                }`}
                style={{ width: `${detail.score}%` }}
              />
            </div>

            <Badge className={getScoreBgClass(detail.score)}>{detail.label}</Badge>
            <p className="text-sm leading-6 text-muted">{detail.insight}</p>
          </Card>
        );
      })}
    </div>
  );
};
