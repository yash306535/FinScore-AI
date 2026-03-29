import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircleMore, Send, Sparkles, X } from 'lucide-react';

import { sendChatMessageRequest, getWeaknessFromScore } from '../../services/quiz.service';
import { ChatMessage, ScoreResult } from '../../types';
import { Button } from '../ui/Button';

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
  score: ScoreResult;
}

const formatTime = () =>
  new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

export const ChatPanel = ({ open, onClose, score }: ChatPanelProps) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const weakness = useMemo(() => getWeaknessFromScore(score), [score]);

  const suggestions = [
    'What should I do first',
    `How do I improve my ${weakness} score`,
    'Am I on track for retirement'
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending, open]);

  const sendMessage = async (messageText: string) => {
    const trimmed = messageText.trim();

    if (!trimmed || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: trimmed,
      timestamp: formatTime()
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const reply = await sendChatMessageRequest(score.id, trimmed);
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: reply,
          timestamp: formatTime()
        }
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: 'I could not answer that right now. Please try again in a moment.',
          timestamp: formatTime()
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[70] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed right-0 top-0 z-[80] flex h-screen w-full flex-col border-l border-border bg-card shadow-2xl md:w-[420px]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber/15 text-amber">
                  <MessageCircleMore className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">Chat About Your Score</h3>
                  <p className="mt-1 text-sm text-muted">Ask me anything about your financial health.</p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="rounded-2xl p-2 text-muted transition hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="rounded-3xl border border-border bg-slate-900/60 p-4 text-sm text-muted">
                    Start with one of these prompts or ask your own question.
                  </div>
                  <div className="flex flex-wrap gap-2">
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

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-amber text-navy'
                        : 'border border-border bg-slate-900/80 text-white'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI Advisor
                      </div>
                    ) : null}
                    <p className="text-sm leading-6">{message.text}</p>
                    <p className={`mt-2 text-xs ${message.role === 'user' ? 'text-navy/70' : 'text-muted'}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}

              {isSending ? (
                <div className="flex justify-start">
                  <div className="rounded-3xl border border-border bg-slate-900/80 px-4 py-3 text-white">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-amber [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-amber [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-amber" />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-border px-5 py-4">
              <div className="flex items-center gap-3 rounded-3xl border border-border bg-navy/70 px-4 py-3">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      void sendMessage(input);
                    }
                  }}
                  placeholder="Ask a question about your score"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted"
                />
                <Button
                  className="rounded-2xl px-4 py-2"
                  disabled={!input.trim() || isSending}
                  onClick={() => void sendMessage(input)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};
