import { useEffect, useState } from 'react';
import { animate, motion } from 'framer-motion';

import { getGrade } from '../../utils/scoreColor';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  showCaption?: boolean;
}

const circumference = 2 * Math.PI * 80;

const getArcColor = (score: number): string => {
  if (score >= 70) {
    return '#10B981';
  }

  if (score >= 40) {
    return '#F59E0B';
  }

  return '#EF4444';
};

const getGradeBadgeClass = (score: number): string => {
  if (score >= 85) {
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30';
  }

  if (score >= 70) {
    return 'bg-success/15 text-success border-success/30';
  }

  if (score >= 55) {
    return 'bg-lime-400/15 text-lime-300 border-lime-300/30';
  }

  if (score >= 40) {
    return 'bg-amber/15 text-amber border-amber/30';
  }

  if (score >= 20) {
    return 'bg-orange-400/15 text-orange-300 border-orange-300/30';
  }

  return 'bg-danger/15 text-danger border-danger/30';
};

export const ScoreGauge = ({ score, size = 240, showCaption = true }: ScoreGaugeProps) => {
  const [displayScore, setDisplayScore] = useState(0);
  const dashOffset = circumference - (score / 100) * circumference;
  const color = getArcColor(score);

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (value) => setDisplayScore(Number(value.toFixed(1)))
    });

    return () => controls.stop();
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-4" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
          <circle cx="100" cy="100" r="80" stroke="#334155" strokeWidth="12" fill="none" />
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="font-display text-5xl font-bold text-white">{displayScore.toFixed(1)}</p>
          <span
            className={`mt-3 inline-flex rounded-full border px-4 py-1 text-sm font-semibold ${getGradeBadgeClass(score)}`}
          >
            {getGrade(score)}
          </span>
          {showCaption ? <p className="mt-3 text-sm text-muted">Money Health Score</p> : null}
        </div>
      </div>
    </div>
  );
};
