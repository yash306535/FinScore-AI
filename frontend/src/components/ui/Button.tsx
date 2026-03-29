import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantMap: Record<ButtonVariant, string> = {
  primary: 'bg-amber text-navy hover:bg-amber/90',
  outline: 'border border-border bg-transparent text-white hover:border-amber hover:text-amber',
  ghost: 'bg-transparent text-muted hover:bg-white/5 hover:text-white',
  danger: 'bg-danger text-white hover:bg-danger/90'
};

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  loading = false,
  disabled,
  fullWidth = false,
  ...props
}: PropsWithChildren<ButtonProps>) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200 ${variantMap[variant]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'cursor-not-allowed opacity-70' : ''} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
    <span>{children}</span>
  </button>
);
