import { useState } from 'react';
import { Flame, TrendingUp, Target, Calendar, IndianRupee, Info } from 'lucide-react';

import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtCr = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  return fmt(n);
};

const calcFIRE = (inputs: {
  currentAge: number;
  retirementAge: number;
  monthlyExpenses: number;
  currentCorpus: number;
  annualReturn: number;
  inflationRate: number;
  monthlyInvestment: number;
}) => {
  const {
    currentAge, retirementAge, monthlyExpenses,
    currentCorpus, annualReturn, inflationRate, monthlyInvestment
  } = inputs;

  const yearsToRetire = retirementAge - currentAge;
  const months = yearsToRetire * 12;

  // Inflation-adjusted monthly expenses at retirement
  const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetire);

  // FIRE number = 25x annual expenses (4% safe withdrawal rule)
  const fireNumber = futureMonthlyExpenses * 12 * 25;

  const r = annualReturn / 100 / 12; // monthly return

  // Future value of current corpus
  const corpusFV = currentCorpus * Math.pow(1 + r, months);

  // Future value of monthly SIP
  const sipFV = r > 0
    ? monthlyInvestment * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
    : monthlyInvestment * months;

  const projectedCorpus = corpusFV + sipFV;
  const gap = fireNumber - projectedCorpus;

  // Monthly SIP needed to hit FIRE number
  const sipNeeded = r > 0 && months > 0
    ? (fireNumber - corpusFV) * r / (((Math.pow(1 + r, months) - 1) * (1 + r)))
    : months > 0 ? (fireNumber - corpusFV) / months : 0;

  // Years to FIRE with current SIP (binary search)
  let yearsToFIRE = yearsToRetire;
  if (monthlyInvestment > 0) {
    for (let y = 1; y <= 50; y++) {
      const m = y * 12;
      const fv = currentCorpus * Math.pow(1 + r, m) +
        (r > 0 ? monthlyInvestment * ((Math.pow(1 + r, m) - 1) / r) * (1 + r) : monthlyInvestment * m);
      const fn = monthlyExpenses * Math.pow(1 + inflationRate / 100, y) * 12 * 25;
      if (fv >= fn) { yearsToFIRE = y; break; }
    }
  }

  const onTrack = projectedCorpus >= fireNumber;

  return {
    fireNumber,
    projectedCorpus,
    gap: Math.max(0, gap),
    sipNeeded: Math.max(0, sipNeeded),
    yearsToFIRE,
    futureMonthlyExpenses,
    onTrack,
    retirementAge,
    fireAge: currentAge + yearsToFIRE,
  };
};

const InputField = ({
  label, value, onChange, min, max, step, prefix, suffix, hint
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
  prefix?: string; suffix?: string; hint?: string;
}) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-muted">{label}</label>
    {hint && <p className="mt-0.5 text-xs text-white/40">{hint}</p>}
    <div className="mt-2 flex items-center overflow-hidden rounded-2xl border border-white/10 bg-navy/60 focus-within:border-amber/50">
      {prefix && (
        <span className="border-r border-white/10 px-3 py-3 text-sm text-amber">{prefix}</span>
      )}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step ?? 1}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none"
      />
      {suffix && (
        <span className="border-l border-white/10 px-3 py-3 text-xs text-muted">{suffix}</span>
      )}
    </div>
  </div>
);

const StatCard = ({
  label, value, sub, color = 'amber', icon: Icon
}: {
  label: string; value: string; sub?: string; color?: 'amber' | 'emerald' | 'red' | 'sky';
  icon: React.ElementType;
}) => {
  const colors = {
    amber:   'border-amber/20 bg-amber/10 text-amber',
    emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    red:     'border-red-400/20 bg-red-400/10 text-red-400',
    sky:     'border-sky-400/20 bg-sky-400/10 text-sky-300',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] opacity-80">{label}</p>
        <Icon className="h-4 w-4 opacity-70" />
      </div>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
    </div>
  );
};

export const FireCalculator = () => {
  const [currentAge, setCurrentAge] = useState(28);
  const [retirementAge, setRetirementAge] = useState(45);
  const [monthlyExpenses, setMonthlyExpenses] = useState(80000);
  const [currentCorpus, setCurrentCorpus] = useState(500000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [inflationRate, setInflationRate] = useState(6);
  const [monthlyInvestment, setMonthlyInvestment] = useState(30000);
  const [calculated, setCalculated] = useState(false);

  const result = calcFIRE({
    currentAge, retirementAge, monthlyExpenses,
    currentCorpus, annualReturn, inflationRate, monthlyInvestment
  });

  const progressPct = Math.min(100, (result.projectedCorpus / result.fireNumber) * 100);

  return (
    <AppShell>
      <div className="app-container py-10 sm:py-14">
        {/* Glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[400px] overflow-hidden">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-amber/15 blur-3xl" />
          <div className="absolute right-10 top-20 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber/20 bg-amber/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber">
            <Flame className="h-4 w-4" />
            FIRE Calculator — India
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-5xl">
            Retire at <span className="text-amber">{retirementAge}</span> on{' '}
            <span className="text-amber">{fmtCr(monthlyExpenses)}/mo</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            Financial Independence, Retire Early — Indian edition. Uses the 4% safe withdrawal rule
            with inflation-adjusted projections for SIP, EPF, and NPS portfolios.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[420px,minmax(0,1fr)]">
          {/* ── Inputs ── */}
          <Card className="space-y-5 border-white/10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">Your Details</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-white">Inputs</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Current Age" value={currentAge} onChange={setCurrentAge} min={18} max={55} suffix="yrs" />
              <InputField label="Target FIRE Age" value={retirementAge} onChange={setRetirementAge} min={currentAge + 1} max={65} suffix="yrs" />
            </div>

            <InputField
              label="Monthly Expenses at Retirement"
              value={monthlyExpenses}
              onChange={setMonthlyExpenses}
              min={10000}
              step={5000}
              prefix="₹"
              hint="In today's rupees — we'll inflate it to your retirement year"
            />

            <InputField
              label="Current Corpus / Savings"
              value={currentCorpus}
              onChange={setCurrentCorpus}
              min={0}
              step={50000}
              prefix="₹"
              hint="Total: FD + MF + EPF + stocks + savings"
            />

            <InputField
              label="Monthly Investment (SIP)"
              value={monthlyInvestment}
              onChange={setMonthlyInvestment}
              min={0}
              step={1000}
              prefix="₹"
              hint="All investments: SIP + EPF + NPS + others"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Expected Annual Return"
                value={annualReturn}
                onChange={setAnnualReturn}
                min={4}
                max={20}
                step={0.5}
                suffix="%"
                hint="Equity: 12%, Hybrid: 10%, Debt: 7%"
              />
              <InputField
                label="Inflation Rate"
                value={inflationRate}
                onChange={setInflationRate}
                min={2}
                max={12}
                step={0.5}
                suffix="%"
                hint="India avg: 6–7%"
              />
            </div>

            <Button className="w-full py-3" onClick={() => setCalculated(true)}>
              <Flame className="h-4 w-4" />
              Calculate My FIRE Number
            </Button>
          </Card>

          {/* ── Results ── */}
          <div className="space-y-6">
            {/* FIRE number hero */}
            <div className="overflow-hidden rounded-3xl border border-amber/20 bg-[linear-gradient(145deg,rgba(245,158,11,0.15),rgba(15,23,42,0.97)_55%)]">
              <div className="border-b border-amber/10 px-6 py-5 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber/80">Your FIRE Number</p>
                <p className="mt-2 font-display text-4xl font-bold text-white sm:text-5xl">
                  {fmtCr(result.fireNumber)}
                </p>
                <p className="mt-2 text-sm text-muted">
                  = {fmtCr(result.futureMonthlyExpenses)}/mo × 12 × 25 — inflated to age {retirementAge}
                </p>
              </div>

              {/* Progress bar */}
              <div className="px-6 py-5 sm:px-8">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>Projected corpus</span>
                  <span className={result.onTrack ? 'text-emerald-300' : 'text-amber'}>
                    {progressPct.toFixed(1)}% of FIRE number
                  </span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/8">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${result.onTrack ? 'bg-emerald-400' : 'bg-amber'}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-white/50">₹0</span>
                  <span className={result.onTrack ? 'font-semibold text-emerald-300' : 'font-semibold text-white'}>
                    {fmtCr(result.projectedCorpus)} projected
                  </span>
                  <span className="text-white/50">{fmtCr(result.fireNumber)}</span>
                </div>
              </div>
            </div>

            {/* Stat grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                icon={Calendar}
                label="FIRE Age with current SIP"
                value={`Age ${result.fireAge}`}
                sub={`${result.yearsToFIRE} years from now`}
                color={result.fireAge <= retirementAge ? 'emerald' : 'amber'}
              />
              <StatCard
                icon={IndianRupee}
                label="SIP needed to hit target"
                value={fmtCr(result.sipNeeded)}
                sub="per month to FIRE on time"
                color={result.sipNeeded <= monthlyInvestment ? 'emerald' : 'red'}
              />
              <StatCard
                icon={TrendingUp}
                label="Projected corpus"
                value={fmtCr(result.projectedCorpus)}
                sub={`at age ${retirementAge}`}
                color="sky"
              />
              <StatCard
                icon={Target}
                label={result.onTrack ? 'Surplus' : 'Shortfall'}
                value={fmtCr(Math.abs(result.fireNumber - result.projectedCorpus))}
                sub={result.onTrack ? 'You\'re on track 🎉' : 'Increase SIP to close gap'}
                color={result.onTrack ? 'emerald' : 'red'}
              />
            </div>

            {/* Insight box */}
            <div className="rounded-2xl border border-white/10 bg-navy/60 px-5 py-5">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                <div className="space-y-2 text-sm leading-6 text-white/75">
                  {result.onTrack ? (
                    <p>
                      You're on track to FIRE at <strong className="text-white">age {retirementAge}</strong>.
                      Your projected corpus of <strong className="text-emerald-300">{fmtCr(result.projectedCorpus)}</strong> exceeds
                      your FIRE number of <strong className="text-white">{fmtCr(result.fireNumber)}</strong>.
                      At the 4% rule, this sustains <strong className="text-white">{fmtCr(result.futureMonthlyExpenses)}/mo</strong> indefinitely.
                    </p>
                  ) : (
                    <p>
                      You need to increase your monthly SIP to{' '}
                      <strong className="text-amber">{fmtCr(result.sipNeeded)}</strong> to retire at age {retirementAge}.
                      With your current SIP of {fmtCr(monthlyInvestment)}, you'll reach FIRE at{' '}
                      <strong className="text-white">age {result.fireAge}</strong> instead.
                    </p>
                  )}
                  <p className="text-xs text-white/40">
                    Assumes {annualReturn}% annual return, {inflationRate}% inflation, 4% safe withdrawal rate.
                    Does not account for taxes on withdrawals or market volatility.
                  </p>
                </div>
              </div>
            </div>

            {/* Indian instruments tip */}
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-300">
                Indian FIRE Portfolio Mix (suggested)
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3 text-sm">
                {[
                  { label: 'Equity SIP (12%)', sub: 'Index/flexi-cap funds' },
                  { label: 'NPS Tier I (10%)', sub: '80CCD deduction + LTCG' },
                  { label: 'EPF / PPF (8%)', sub: 'Tax-free debt anchor' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-emerald-400/10 px-3 py-3">
                    <p className="font-semibold text-emerald-200">{item.label}</p>
                    <p className="mt-0.5 text-xs text-white/50">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
