import { Link } from 'react-router-dom';

import { ScoreResult } from '../../types';
import { getGrade, getScoreBgClass } from '../../utils/scoreColor';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ScoreGauge } from './ScoreGauge';

interface ScoreCardProps {
  score: ScoreResult;
}

export const ScoreCard = ({ score }: ScoreCardProps) => (
  <Card className="grid gap-8 lg:grid-cols-[220px,1fr] lg:items-center">
    <div className="mx-auto">
      <ScoreGauge score={score.totalScore} size={220} />
    </div>
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-amber">Latest assessment</p>
      <h2 className="mt-3 font-display text-3xl font-bold text-white">Your current money snapshot</h2>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-4xl font-bold text-white">{score.totalScore.toFixed(1)}</span>
        <span className={`rounded-full border px-4 py-1 text-sm font-semibold ${getScoreBgClass(score.totalScore)}`}>
          Grade {getGrade(score.totalScore)}
        </span>
      </div>
      <p className="mt-4 text-muted">
        Assessed on{' '}
        {new Date(score.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })}
      </p>
      <div className="mt-6">
        <Link to={`/results/${score.id}`}>
          <Button>View Full Report</Button>
        </Link>
      </div>
    </div>
  </Card>
);
