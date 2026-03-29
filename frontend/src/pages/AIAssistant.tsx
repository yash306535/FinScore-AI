import { useEffect, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight,
  Bot,
  Globe2,
  Newspaper,
  Send,
  Sparkles,
  TrendingUp,
  TriangleAlert
} from 'lucide-react';

import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Loader } from '../components/ui/Loader';
import { Toast } from '../components/ui/Toast';
import { useScore } from '../hooks/useScore';
import {
  getOpportunityRadarRequest,
  getWeaknessFromScore,
  sendAssistantMessageRequest
} from '../services/quiz.service';
import { ChatMessage, ChatSource, OpportunityRadar, ScoreResult, ToastState } from '../types';

const formatTime = () =>
  new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

const formatDimensionLabel = (value: string) => {
  switch (value) {
    case 'emergency':
      return 'Emergency Fund';
    case 'insurance':
      return 'Insurance';
    case 'investments':
      return 'Investments';
    case 'debt':
      return 'Debt';
    case 'tax':
      return 'Tax Planning';
    case 'retirement':
      return 'Retirement';
    default:
      return value;
  }
};

const buildWelcomeMessage = (score: ScoreResult | null): ChatMessage => ({
  id: crypto.randomUUID(),
  role: 'assistant',
  text: score
    ? `I'm your Money Health Copilot. I can explain your ${score.totalScore.toFixed(1)}/100 score, turn weak spots into concrete next steps, and switch on live web research whenever you want fresher answers.`
    : "I'm your Money Health Copilot. I can answer money questions, search the live web when you switch that mode on, and help you get more value from the assessment once you have a score.",
  timestamp: formatTime(),
  mode: 'score'
});

const SourceList = ({ sources }: { sources: ChatSource[] }) => {
  if (!sources.length) {
    return null;
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {sources.slice(0, 4).map((source) => (
        <a
          key={source.link}
          href={source.link}
          target="_blank"
          rel="noreferrer"
          className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/0 p-3 transition hover:border-amber/40 hover:from-amber/10 hover:to-white/5"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-white transition group-hover:text-amber">
              {source.title}
            </p>
            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted transition group-hover:text-amber" />
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">{source.snippet || 'Open source'}</p>
          {source.source || source.date ? (
            <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-amber/80">
              {[source.source, source.date].filter(Boolean).join(' / ')}
            </p>
          ) : null}
        </a>
      ))}
    </div>
  );
};

export const AIAssistant = () => {
  const { getLatestScore, getScoreById } = useScore();
  const [searchParams] = useSearchParams();
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [useLiveWeb, setUseLiveWeb] = useState(false);
  const [toast, setToast] = useState<ToastState>({ open: false, message: '' });
  const [radar, setRadar] = useState<OpportunityRadar | null>(null);
  const [radarLoading, setRadarLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scoreIdParam = searchParams.get('scoreId') || undefined;

  useEffect(() => {
    const loadContext = async () => {
      try {
        setLoading(true);
        setRadar(null);

        const result = scoreIdParam ? await getScoreById(scoreIdParam) : await getLatestScore();
        setScore(result);
        setMessages([buildWelcomeMessage(result)]);
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;

        if (axiosError.response?.status === 404) {
          setScore(null);
          setMessages([buildWelcomeMessage(null)]);
          return;
        }

        setToast({
          open: true,
          message: axiosError.response?.data?.message || 'Unable to load your AI Copilot right now.',
          variant: 'error'
        });
        setMessages([buildWelcomeMessage(null)]);
      } finally {
        setLoading(false);
      }
    };

    void loadContext();
  }, [scoreIdParam]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const weakness = score ? getWeaknessFromScore(score) : null;
  const suggestions = score
    ? [
        'What should I fix first?',
        `Give me a 30-day plan for ${formatDimensionLabel(weakness || 'emergency')}`,
        'Search live updates that could help me'
      ]
    : [
        'How should I start managing my salary better?',
        'What is a good emergency fund target in India?',
        'Search live money trends for salaried professionals'
      ];

  const sendMessage = async (messageText: string) => {
    const trimmed = messageText.trim();

    if (!trimmed || sending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: trimmed,
      timestamp: formatTime()
    };

    const history = messages.map((message) => ({
      role: message.role,
      text: message.text
    }));

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setSending(true);

    try {
      const response = await sendAssistantMessageRequest({
        scoreId: score?.id,
        message: trimmed,
        useWebSearch: useLiveWeb,
        history
      });

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: response.reply,
          timestamp: formatTime(),
          sources: response.sources,
          mode: response.liveWebUsed ? 'live-web' : 'score',
          warning: response.warning,
          searchQuery: response.searchQuery
        }
      ]);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setToast({
        open: true,
        message: axiosError.response?.data?.message || 'I could not answer that just now.',
        variant: 'error'
      });
    } finally {
      setSending(false);
    }
  };

  const generateRadar = async () => {
    try {
      setRadarLoading(true);
      const result = await getOpportunityRadarRequest(score?.id);
      setRadar(result);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setToast({
        open: true,
        message: axiosError.response?.data?.message || 'Opportunity Radar is unavailable right now.',
        variant: 'error'
      });
    } finally {
      setRadarLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen label="Launching your AI Copilot..." />;
  }

  return (
    <AppShell showFooter={false}>
      <Toast {...toast} onClose={() => setToast({ open: false, message: '', variant: 'info' })} />
      <div className="app-container py-10 sm:py-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] overflow-hidden">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-amber/20 blur-3xl" />
          <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute left-1/3 top-44 h-44 w-44 rounded-full bg-sky-400/10 blur-3xl" />
        </div>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber/20 bg-amber/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber">
              <Sparkles className="h-4 w-4" />
              Gemini + Serper Copilot
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold text-white sm:text-5xl">
              Money guidance that feels personal, not robotic.
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-muted sm:text-lg">
              Ask score-aware questions, switch on live web when you need fresh context, and get
              practical action steps instead of generic advice.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/85">
                <Bot className="h-3.5 w-3.5 text-amber" />
                Score-Aware Assistant
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/85">
                <Globe2 className="h-3.5 w-3.5 text-emerald-300" />
                Live Web Mode
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/85">
                <TrendingUp className="h-3.5 w-3.5 text-amber" />
                Opportunity Radar
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {score ? (
              <Link to={`/results/${score.id}`}>
                <Button variant="outline" className="px-4 py-3">
                  Back to Report
                </Button>
              </Link>
            ) : null}
            <Link to="/dashboard">
              <Button variant="ghost" className="px-4 py-3">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[330px,minmax(0,1fr)] xl:grid-cols-[370px,minmax(0,1fr)]">
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card className="overflow-hidden border-white/10 bg-[linear-gradient(145deg,rgba(245,158,11,0.16),rgba(15,23,42,0.92)_38%,rgba(15,23,42,0.98))] p-0">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber text-navy">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-amber/80">Copilot Mode</p>
                    <h2 className="font-display text-2xl font-bold text-white">AI Coach</h2>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm leading-6 text-white/85">
                  <p>Understands your score context and weak areas.</p>
                  <p>Fetches fresh web snippets when live mode is enabled.</p>
                  <p>Keeps conversation flow so follow-up questions feel natural.</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setUseLiveWeb((current) => !current)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      useLiveWeb
                        ? 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30'
                        : 'bg-white/8 text-muted ring-1 ring-white/10 hover:bg-white/12 hover:text-white'
                    }`}
                  >
                    <Globe2 className="h-4 w-4" />
                    {useLiveWeb ? 'Live Web On' : 'Live Web Off'}
                  </button>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-sm text-white/80 ring-1 ring-white/10">
                    <TrendingUp className="h-4 w-4 text-amber" />
                    Opportunity Radar
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-[0.18em] text-amber/80">Your Context</p>
              {score ? (
                <>
                  <h2 className="mt-2 font-display text-3xl font-bold text-white">
                    {score.totalScore.toFixed(1)} / 100
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{score.aiInsights}</p>
                  <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-navy/60 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Weakest Area</p>
                      <p className="mt-2 text-base font-semibold text-white">
                        {formatDimensionLabel(weakness || 'emergency')}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-navy/60 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Report Date</p>
                      <p className="mt-2 text-base font-semibold text-white">
                        {new Date(score.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="mt-2 font-display text-2xl font-bold text-white">No saved score yet</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    You can ask general finance questions now. For personalized answers, finish the
                    assessment once and come back here.
                  </p>
                  <div className="mt-5">
                    <Link to="/quiz">
                      <Button className="w-full">Take Assessment</Button>
                    </Link>
                  </div>
                </>
              )}
            </Card>

            <Card className="overflow-hidden border-emerald-400/15 bg-[linear-gradient(160deg,rgba(16,185,129,0.12),rgba(15,23,42,0.95)_45%,rgba(15,23,42,0.98))]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-300">
                    <Newspaper className="h-3.5 w-3.5" />
                    Serper Feature
                  </div>
                  <h2 className="mt-3 font-display text-3xl font-bold text-white">Opportunity Radar</h2>
                  <p className="mt-2 text-sm leading-6 text-white/80">
                    Scan live India-focused financial signals and turn them into practical, actionable
                    moves.
                  </p>
                </div>
                <Button
                  className="shrink-0 px-4 py-3"
                  onClick={() => void generateRadar()}
                  loading={radarLoading}
                >
                  {radar ? 'Refresh' : 'Generate'}
                </Button>
              </div>

              {radar ? (
                <div className="mt-6 space-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-emerald-300/80">
                      {radar.focusDimension ? `${radar.focusDimension} Focus` : 'General Focus'}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-bold text-white">{radar.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/85">{radar.summary}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-navy/50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Next Actions</p>
                      <div className="mt-3 space-y-3 text-sm leading-6 text-white/90">
                        {radar.actions.map((item) => (
                          <p key={item}>- {item}</p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-navy/50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Watchouts</p>
                      <div className="mt-3 space-y-3 text-sm leading-6 text-white/90">
                        {radar.watchouts.map((item) => (
                          <p key={item}>- {item}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-xs leading-6 text-muted">
                    <p>Query: {radar.searchQuery}</p>
                    <p>Updated: {new Date(radar.generatedAt).toLocaleString('en-IN')}</p>
                  </div>

                  {radar.warning ? (
                    <div className="rounded-2xl border border-amber/25 bg-amber/10 p-4 text-sm text-amber">
                      {radar.warning}
                    </div>
                  ) : null}

                  <SourceList sources={radar.sources} />
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-black/10 p-5 text-sm leading-6 text-white/75">
                  Generate a brief to surface timely opportunities, market cues, and action ideas from live
                  search results.
                </div>
              )}
            </Card>
          </div>

          <Card className="relative flex min-h-[720px] flex-col overflow-hidden border-white/15 bg-[linear-gradient(170deg,rgba(15,23,42,0.95),rgba(15,23,42,0.82)_45%,rgba(2,132,199,0.08))] p-0 lg:min-h-[780px] lg:h-[calc(100vh-10rem)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-amber/10 to-transparent" />

            <div className="relative border-b border-white/10 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Conversation</p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-white">Money Health AI Chat</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-sm text-white/80 ring-1 ring-white/10">
                    <Bot className="h-4 w-4 text-amber" />
                    Score-aware context
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseLiveWeb((current) => !current)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      useLiveWeb
                        ? 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30'
                        : 'bg-white/8 text-white/80 ring-1 ring-white/10 hover:bg-white/12'
                    }`}
                  >
                    <Globe2 className="h-4 w-4" />
                    {useLiveWeb ? 'Using Live Web' : 'Use Live Web'}
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => void sendMessage('Give me a simple 3-step plan for this month')}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white/85 transition hover:border-amber/35 hover:bg-amber/10"
                >
                  3-step monthly plan
                </button>
                <button
                  type="button"
                  onClick={() => void sendMessage('Explain my score in plain language')}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white/85 transition hover:border-amber/35 hover:bg-amber/10"
                >
                  Explain my score simply
                </button>
                <button
                  type="button"
                  onClick={() => void sendMessage('What should I avoid doing right now?')}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white/85 transition hover:border-amber/35 hover:bg-amber/10"
                >
                  Avoid mistakes first
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="relative flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[94%] rounded-[1.8rem] px-4 py-4 shadow-lg sm:max-w-[82%] ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-amber to-amber/90 text-navy'
                        : 'border border-white/10 bg-slate-950/80 text-white'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-amber">
                        {message.mode === 'live-web' ? <Globe2 className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                        {message.mode === 'live-web' ? 'AI + Live Web' : 'AI Copilot'}
                      </div>
                    ) : null}

                    <p className="text-sm leading-7 sm:text-[15px]">{message.text}</p>

                    {message.warning ? (
                      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber/25 bg-amber/10 p-3 text-sm text-amber">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{message.warning}</span>
                      </div>
                    ) : null}

                    {message.searchQuery ? (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted">
                        Query: {message.searchQuery}
                      </div>
                    ) : null}

                    <SourceList sources={message.sources || []} />

                    <p
                      className={`mt-3 text-xs ${
                        message.role === 'user' ? 'text-navy/70' : 'text-muted'
                      }`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}

              {messages.length <= 1 ? (
                <div className="rounded-[1.8rem] border border-dashed border-white/20 bg-white/[0.03] p-5">
                  <p className="text-sm text-muted">Try one of these to get started.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => void sendMessage(suggestion)}
                        className="rounded-full border border-amber/30 bg-amber/10 px-4 py-2 text-sm text-amber transition hover:bg-amber/20"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {sending ? (
                <div className="flex justify-start">
                  <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/70 px-4 py-4 text-white">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-amber [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-amber [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-amber" />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative border-t border-white/10 bg-slate-950/30 px-5 py-5 sm:px-6">
              <div className="rounded-[1.8rem] border border-white/10 bg-slate-950/80 p-4">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage(input);
                    }
                  }}
                  rows={3}
                  placeholder={
                    useLiveWeb
                      ? 'Ask with live web mode on...'
                      : 'Ask about your score, planning, savings, debt, tax, or retirement...'
                  }
                  className="min-h-[84px] w-full resize-none bg-transparent text-sm leading-7 text-white outline-none placeholder:text-muted"
                />
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs leading-5 text-muted">
                      Press Enter to send. Use Shift + Enter for a new line.
                    </p>
                    <p className="mt-1 text-xs text-muted/80">{input.trim().length} characters</p>
                  </div>
                  <Button
                    className="px-5 py-3"
                    disabled={!input.trim() || sending}
                    onClick={() => void sendMessage(input)}
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};



