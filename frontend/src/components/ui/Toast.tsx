import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

import { ToastState } from '../../types';

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info
};

const classMap = {
  success: 'border-success/30 bg-success/15 text-success',
  error: 'border-danger/30 bg-danger/15 text-danger',
  info: 'border-amber/30 bg-amber/15 text-amber'
};

interface ToastProps extends ToastState {
  onClose: () => void;
}

export const Toast = ({ open, message, variant = 'info', onClose }: ToastProps) => {
  const Icon = iconMap[variant];

  return (
    <AnimatePresence>
      {open ? (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          onClick={onClose}
          className={`fixed right-4 top-4 z-[120] flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-left shadow-2xl ${classMap[variant]}`}
        >
          <Icon className="mt-0.5 h-5 w-5" />
          <span className="text-sm font-medium">{message}</span>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
};
