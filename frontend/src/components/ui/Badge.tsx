import { PropsWithChildren } from 'react';

interface BadgeProps {
  className?: string;
}

export const Badge = ({ children, className = '' }: PropsWithChildren<BadgeProps>) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${className}`}
  >
    {children}
  </span>
);
