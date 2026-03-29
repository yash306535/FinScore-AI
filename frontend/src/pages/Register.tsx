import { useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { WalletCards } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { ApiValidationError, ToastState } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Toast } from '../components/ui/Toast';

export const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isLoading } = useAuth();
  const isDemoMode = useMemo(() => searchParams.get('demo') === '1', [searchParams]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    income: isDemoMode ? '65000' : ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<ToastState>({ open: false, message: '' });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        age: form.age ? Number(form.age) : undefined,
        income: form.income ? Number(form.income) : undefined
      });
      navigate('/quiz');
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
          message: axiosError.response?.data?.message || 'Unable to create your account right now.',
          variant: 'error'
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4 py-12">
      <Toast {...toast} onClose={() => setToast({ open: false, message: '', variant: 'info' })} />
      <Card className="w-full max-w-lg p-8 sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber text-navy">
            <WalletCards className="h-6 w-6" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-muted">
            Start your free Money Health Score and get a personalized roadmap.
          </p>
        </div>

        <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-white">Full Name</label>
            <input
              value={form.name}
              onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
              className="w-full rounded-2xl border border-border bg-navy px-4 py-3 text-white outline-none transition focus:border-amber"
              placeholder="Your full name"
            />
            {errors.name ? <p className="mt-2 text-sm text-danger">{errors.name}</p> : null}
          </div>

          <div className="sm:col-span-2">
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

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-white">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
              className="w-full rounded-2xl border border-border bg-navy px-4 py-3 text-white outline-none transition focus:border-amber"
              placeholder="At least 8 characters"
            />
            {errors.password ? <p className="mt-2 text-sm text-danger">{errors.password}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white">Age (optional)</label>
            <input
              inputMode="numeric"
              value={form.age}
              onChange={(event) => setForm((previous) => ({ ...previous, age: event.target.value }))}
              className="w-full rounded-2xl border border-border bg-navy px-4 py-3 text-white outline-none transition focus:border-amber"
              placeholder="29"
            />
            {errors.age ? <p className="mt-2 text-sm text-danger">{errors.age}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-white">Monthly Income in rupees (optional)</label>
            <input
              inputMode="numeric"
              value={form.income}
              onChange={(event) => setForm((previous) => ({ ...previous, income: event.target.value }))}
              className="w-full rounded-2xl border border-border bg-navy px-4 py-3 text-white outline-none transition focus:border-amber"
              placeholder="65000"
            />
            {errors.income ? <p className="mt-2 text-sm text-danger">{errors.income}</p> : null}
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" fullWidth loading={isLoading}>
              Create Account
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-amber">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};
