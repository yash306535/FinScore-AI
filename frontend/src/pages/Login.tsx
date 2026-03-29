import { useState } from 'react';
import { AxiosError } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { WalletCards } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { ApiValidationError, ToastState } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Toast } from '../components/ui/Toast';

export const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<ToastState>({ open: false, message: '' });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    try {
      await login(form);
      navigate('/dashboard');
    } catch (error) {
      const axiosError = error as AxiosError<{ errors?: ApiValidationError[]; message?: string }>;
      const fieldErrors = axiosError.response?.data?.errors || [];

      if (fieldErrors.length > 0) {
        setErrors(
          fieldErrors.reduce<Record<string, string>>((accumulator, current) => {
            accumulator[current.field] = current.message;
            return accumulator;
          }, {})
        );
      } else {
        setToast({
          open: true,
          message: axiosError.response?.data?.message || 'Unable to sign in right now.',
          variant: 'error'
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4 py-12">
      <Toast {...toast} onClose={() => setToast({ open: false, message: '', variant: 'info' })} />
      <Card className="w-full max-w-md p-8 sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber text-navy">
            <WalletCards className="h-6 w-6" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-muted">Sign in to view your financial health dashboard.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
              className="w-full rounded-2xl border border-border bg-navy px-4 py-3 text-white outline-none transition focus:border-amber"
              placeholder="you@example.com"
            />
            {errors.email ? <p className="mt-2 text-sm text-danger">{errors.email}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
              className="w-full rounded-2xl border border-border bg-navy px-4 py-3 text-white outline-none transition focus:border-amber"
              placeholder="Enter your password"
            />
            {errors.password ? <p className="mt-2 text-sm text-danger">{errors.password}</p> : null}
          </div>

          <Button type="submit" fullWidth loading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-amber">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
};
