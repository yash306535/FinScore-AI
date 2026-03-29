import { motion } from 'framer-motion';

interface QuizProgressProps {
  progress: number;
}

export const QuizProgress = ({ progress }: QuizProgressProps) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
    <motion.div
      className="h-full rounded-full bg-amber"
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    />
  </div>
);
