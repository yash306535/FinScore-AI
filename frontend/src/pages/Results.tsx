import { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Bot, Download, Globe2, Share2, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { AppShell } from '../components/layout/AppShell';
import { ActionPlan } from '../components/score/ActionPlan';
import { DimensionGrid } from '../components/score/DimensionGrid';
import { ScoreGauge } from '../components/score/ScoreGauge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Toast } from '../components/ui/Toast';
import { useScore } from '../hooks/useScore';
import { ScoreResult, ToastState } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { getBenchmarkText } from '../utils/scoreColor';

const dimensionSummary = (score: ScoreResult) => [
  ['Emergency Fund', score.emergency],
  ['Insurance', score.insurance],
  ['Investments', score.investments],
  ['Debt', score.debt],
  ['Tax Planning', score.tax],
  ['Retirement', score.retirement]
] as const;

const LoadingSkeleton = () => (
  <div className="app-container max-w-4xl py-12">
    <div className="animate-pulse space-y-6">
      <div className="h-64 rounded-3xl bg-slate-800/70" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-48 rounded-3xl bg-slate-800/60" />
        ))}
      </div>
      <div className="h-32 rounded-3xl bg-slate-800/60" />
      <div className="h-96 rounded-3xl bg-slate-800/60" />
    </div>
  </div>
);

export const Results = () => {
  const { id } = useParams();
  const { getScoreById } = useScore();
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({ open: false, message: '' });
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getScoreById(id);
        setScore(result);
      } catch (error) {
        setToast({ open: true, message: 'Unable to load this score report.', variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const downloadPdf = async () => {
    if (!score) {
      return;
    }

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 16;
    let y = margin;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Money Health Score Report', margin, y);

    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Overall Score: ${score.totalScore.toFixed(1)} / 100`, margin, y);
    y += 7;
    doc.text(`Generated on: ${new Date(score.createdAt).toLocaleDateString('en-IN')}`, margin, y);
    y += 9;

    const summaryLines = doc.splitTextToSize(score.aiInsights, 175);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Dimension Scores', margin, y);
    y += 8;
    doc.setFont('helvetica', 'normal');

    dimensionSummary(score).forEach(([label, value]) => {
      doc.text(`${label}: ${value.toFixed(1)}`, margin, y);
      y += 7;
    });

    if (score.geminiInsight) {
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.text('Motivational Insight', margin, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      const geminiLines = doc.splitTextToSize(score.geminiInsight, 175);
      doc.text(geminiLines, margin, y);
    }

    doc.addPage();
    y = margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('12-Month Action Plan', margin, y);
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    score.actionPlan.forEach((item) => {
      const amount = item.amount ? ` | ${formatCurrency(item.amount)}` : '';
      const line = `${item.month}. ${item.title} (${item.dimension})${amount}`;
      doc.setFont('helvetica', 'bold');
      doc.text(line, margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      const body = doc.splitTextToSize(`Goal: ${item.goal} Action: ${item.action}`, 175);
      doc.text(body, margin, y);
      y += body.length * 4 + 3;
    });

    doc.save('money-health-score-report.pdf');
  };

  const downloadShareImage = async () => {
    if (!heroRef.current) {
      return;
    }

    const canvas = await html2canvas(heroRef.current, {
      backgroundColor: '#0F172A',
      scale: 2
    });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'my-money-health-score.png';
    link.click();
  };

  if (loading) {
    return (
      <AppShell showFooter={false}>
        <LoadingSkeleton />
      </AppShell>
    );
  }

  if (!score) {
    return (
      <AppShell>
        <div className="app-container py-16">
          <Card className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-3xl font-bold text-white">Report unavailable</h1>
            <p className="mt-3 text-muted">We could not find this Money Health Score report.</p>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Toast {...toast} onClose={() => setToast({ open: false, message: '', variant: 'info' })} />
      <div className="app-container max-w-4xl py-10 sm:py-14">
        <div ref={heroRef} className="relative rounded-[2rem] border border-border bg-card/90 p-6 sm:p-8">
          <div className="absolute right-6 top-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => void downloadPdf()}
              className="rounded-2xl border border-border bg-navy/70 p-3 text-white transition hover:border-amber hover:text-amber"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => void downloadShareImage()}
              className="rounded-2xl border border-border bg-navy/70 p-3 text-white transition hover:border-amber hover:text-amber"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <ScoreGauge score={score.totalScore} size={260} />
            <p className="mt-6 max-w-2xl text-2xl italic leading-9 text-white/95">“{score.aiInsights}”</p>
            <p className="mt-4 text-base text-muted">{getBenchmarkText(score.totalScore)}</p>
          </div>
        </div>

        <section className="mt-8 space-y-4">
          <h2 className="font-display text-3xl font-bold text-white">Dimension Breakdown</h2>
          <DimensionGrid score={score} />
        </section>

        {score.geminiInsight ? (
          <section className="mt-8">
            <div className="rounded-3xl border-l-4 border-amber bg-amber/10 p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-5 w-5 text-amber" />
                <div>
                  <h3 className="font-display text-xl font-bold text-white">Motivational Insight</h3>
                  <p className="mt-2 text-base leading-7 text-white/90">{score.geminiInsight}</p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-8">
          <Card className="overflow-hidden border-amber/20 bg-[linear-gradient(160deg,rgba(245,158,11,0.12),rgba(15,23,42,0.95)_42%,rgba(15,23,42,0.98))]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-amber/80">
                  <Bot className="h-3.5 w-3.5" />
                  New Separate Chatbot
                </div>
                <h3 className="mt-3 font-display text-3xl font-bold text-white">Open your AI Copilot</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
                  Your score chat now lives in a dedicated Gemini-style page. Ask follow-up questions,
                  switch on live web search, and use Opportunity Radar for Serper-powered signals.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-sm text-emerald-300 ring-1 ring-emerald-400/25">
                  <Globe2 className="h-4 w-4" />
                  Live web mode
                </div>
                <Link to={`/assistant?scoreId=${score.id}`}>
                  <Button className="px-5 py-3">Chat with AI Copilot</Button>
                </Link>
              </div>
            </div>
          </Card>
        </section>

        <section className="mt-8">
          <ActionPlan items={score.actionPlan} scoreId={score.id} />
        </section>
      </div>
    </AppShell>
  );
};
