import { HTMLAttributes, PropsWithChildren } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = ({
  children,
  className = '',
  hoverable = false,
  ...props
}: PropsWithChildren<CardProps>) => (
  <div
    className={`panel-surface p-6 ${hoverable ? 'transition hover:border-slate-400/70 hover:bg-slate-800/95' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
);
