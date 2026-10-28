'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameContext } from '@/lib/GameContext';
import {
  AI_PRESETS,
  AISettings,
  DEFAULT_AI_SETTINGS,
  askMentor,
  clearAISettings,
  loadAISettings,
  saveAISettings,
} from '@/lib/ai';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK = [
  'Give me a hint.',
  'Explain this concept.',
  'Why is this risky?',
  'Give me an example.',
];

const WELCOME =
  'CyberMentor online. Ask for a nudge on the current question, or tap a shortcut below. I hint — I do not hand over answers.';

export default function CyberMentor() {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([{ role: 'assistant', content: WELCOME }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [ai, setAi] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [preset, setPreset] = useState('openai');
  const [aiError, setAiError] = useState<string | null>(null);
  const ctx = useGameContext();
  const scrollRef = useRef<HTMLDivElement>(null);

  // load saved AI settings once on mount
  useEffect(() => {
    setAi(loadAISettings());
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, showSettings]);

  useEffect(() => {
    setHintCount(0);
  }, [ctx.question?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const persist = (next: AISettings) => {
    setAi(next);
    saveAISettings(next);
  };

  const applyPreset = (id: string) => {
    setPreset(id);
    const p = AI_PRESETS[id];
    if (p && id !== 'custom') {
      persist({ ...ai, baseUrl: p.baseUrl, model: p.model });
    }
  };

  /** Built-in hint engine — always available, no key needed. */
  const localReply = (text: string): string => {
    const q = ctx.question;
    const lower = text.toLowerCase();
    if (q) {
      const hints = [
        q.hint || 'Think about what protects your data and accounts.',
        'Consider which option reduces risk the most.',
        'Choose the action that verifies through official channels and never shares secrets.',
      ];
      if (lower.includes('hint')) {
        const i = Math.min(hintCount, hints.length - 1);
        setHintCount(c => c + 1);
        return `Hint ${i + 1}: ${hints[i]}`;
      }
      if (ctx.answerSubmitted && (lower.includes('explain') || lower.includes('why'))) {
        return `${q.explanation} Takeaway: ${q.takeaway}`;
      }
      if (lower.includes('example')) {
        return q.scenario
          ? `Picture it like the situation brief: ${q.scenario} In real life, the safe move verifies first and shares last.`
          : 'Picture the situation in the question: risky choices usually create urgency or ask you to share something private. Safe choices verify and protect.';
      }
      if (lower.includes('risky')) return q.explanation;
      return 'Focus on the current question: look for the option that protects data, verifies identity, or resists urgency. Tap "Give me a hint" for a progressive nudge.';
    }
    return 'Deploy into a mission first — then I can give hints tied to the question on screen. Meanwhile: pause before clicking, verify senders, and never share one-time codes.';
  };

  const send = (text: string) => {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    setAiError(null);

    const payload = {
      message: text,
      levelId: ctx.levelId,
      topic: ctx.topic,
      question: ctx.question,
      difficulty: ctx.difficulty,
      hintCount,
      answerSubmitted: ctx.answerSubmitted,
    };

    const usesAI = Boolean(ai.apiKey.trim());

    const finish = (reply: string) => {
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setLoading(false);
    };

    if (usesAI) {
      askMentor(ai, payload)
        .then(finish)
        .catch(err => {
          const msg = err instanceof Error ? err.message : 'AI request failed';
          setAiError(msg);
          finish(`${localReply(text)}\n\n(AI unavailable — ${msg}. Using built-in hints.)`);
        });
    } else {
      // brief pause so the reply feels considered, not instant
      window.setTimeout(() => finish(localReply(text)), 450);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: 'Transcript cleared. What do you need?' }]);
    setAiError(null);
  };

  const forgetKey = () => {
    clearAISettings();
    setAi(DEFAULT_AI_SETTINGS);
    setAiError(null);
  };

  const aiActive = Boolean(ai.apiKey.trim());

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="group fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full border border-line-hot bg-[#0d0614]/90 py-2 pl-2 pr-4 backdrop-blur-xl transition hover:bg-primary-soft cq-glow"
      >
        <span
          aria-hidden
          className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[#14020a]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2.5l2.1 6.4 6.4 2.1-6.4 2.1L12 19.5l-2.1-6.4L3.5 11l6.4-2.1z" />
          </svg>
        </span>
        <span className="text-left">
          <span className="block font-display text-[9px] font-bold uppercase tracking-[0.22em] text-fg">
            CyberMentor
          </span>
          <span className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-widest text-ok">
            <span aria-hidden className="h-1 w-1 rounded-full bg-ok blink" />
            {aiActive ? 'AI online' : 'online'}
          </span>
        </span>
        <span className="sr-only">{open ? 'Close chat' : 'Open chat'}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="CyberMentor chat"
          className="fixed bottom-24 right-4 z-50 flex h-[min(560px,calc(100dvh-7rem))] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-line bg-[#0a0510]/95 shadow-2xl backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-[13px] text-[#14020a]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2.5l2.1 6.4 6.4 2.1-6.4 2.1L12 19.5l-2.1-6.4L3.5 11l6.4-2.1z" />
                </svg>
              </span>
              <div>
                <div className="font-display text-[10px] font-bold uppercase tracking-[0.2em]">
                  CyberMentor
                </div>
                <div className="font-mono text-[8px] uppercase tracking-widest text-muted">
                  {aiActive ? `AI · ${ai.model}` : ctx.topic ? `Sector context: ${ctx.topic.slice(0, 24)}` : 'Built-in hints'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(s => !s)}
                aria-label="AI settings"
                title="AI settings"
                className={`grid h-7 w-7 place-items-center rounded-md border text-muted transition hover:border-line-hot hover:text-fg ${
                  showSettings ? 'border-line-hot text-fg' : 'border-line'
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.08a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.08a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" />
                </svg>
              </button>
              <button
                onClick={clearChat}
                className="rounded-md px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted transition hover:bg-white/5 hover:text-fg"
              >
                Clear
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="grid h-7 w-7 place-items-center rounded-md border border-line text-muted transition hover:border-line-hot hover:text-fg"
              >
                ✕
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="border-b border-line bg-white/[0.02] px-4 py-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-primary">
                Connect your AI model
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                Paste your own API key — it is stored only in this browser and sent directly to
                the provider. Never put a key in the code. Without a key, the built-in hint
                engine is used.
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {Object.entries(AI_PRESETS).map(([id, p]) => (
                  <button
                    key={id}
                    onClick={() => applyPreset(id)}
                    className={`rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest transition ${
                      preset === id
                        ? 'border-primary bg-primary text-[#14020a]'
                        : 'border-line text-muted hover:border-line-hot hover:text-fg'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <label className="mt-3 block">
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
                  API key
                </span>
                <input
                  type="password"
                  value={ai.apiKey}
                  onChange={e => persist({ ...ai, apiKey: e.target.value.trim() })}
                  placeholder="sk-… / gsk_…"
                  autoComplete="off"
                  className="mt-1 w-full rounded-lg border border-line bg-white/[0.03] px-3 py-2 font-mono text-[11px] text-fg outline-none placeholder:text-muted/60 focus:border-line-hot"
                />
              </label>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
                    Model
                  </span>
                  <input
                    value={ai.model}
                    onChange={e => persist({ ...ai, model: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-line bg-white/[0.03] px-2.5 py-2 font-mono text-[10px] text-fg outline-none focus:border-line-hot"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
                    Base URL
                  </span>
                  <input
                    value={ai.baseUrl}
                    onChange={e => {
                      setPreset('custom');
                      persist({ ...ai, baseUrl: e.target.value.trim() });
                    }}
                    className="mt-1 w-full rounded-lg border border-line bg-white/[0.03] px-2.5 py-2 font-mono text-[10px] text-fg outline-none focus:border-line-hot"
                  />
                </label>
              </div>

              <label className="mt-2.5 flex items-center gap-2 text-[11px] text-muted">
                <input
                  type="checkbox"
                  checked={ai.remember}
                  onChange={e => persist({ ...ai, remember: e.target.checked })}
                  className="accent-[var(--primary)]"
                />
                Remember on this device (otherwise wiped when this tab closes)
              </label>

              <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
                  {aiActive ? `Active: ${ai.model}` : 'No key — built-in hints'}
                </span>
                {ai.apiKey && (
                  <button
                    onClick={forgetKey}
                    className="rounded-md border border-line px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-bad transition hover:border-bad/60"
                  >
                    Forget key
                  </button>
                )}
              </div>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3.5 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div
                  className={`inline-block max-w-[88%] whitespace-pre-line rounded-xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-accent text-[#14020a]'
                      : 'border border-line bg-white/[0.04] text-fg/90'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-muted">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
                {aiActive ? 'model thinking' : 'thinking'}
              </div>
            )}
            {aiError && (
              <div className="rounded-md border border-bad/40 bg-bad/10 px-2.5 py-1.5 font-mono text-[9px] text-bad">
                {aiError}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-line px-3 py-2">
            {QUICK.map(qk => (
              <button
                key={qk}
                onClick={() => send(qk)}
                className="rounded-full border border-line px-2.5 py-1 font-mono text-[9px] text-muted transition hover:border-line-hot hover:text-fg"
              >
                {qk}
              </button>
            ))}
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 border-t border-line p-3"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask CyberMentor…"
              aria-label="Message CyberMentor"
              maxLength={500}
              className="min-w-0 flex-1 rounded-lg border border-line bg-white/[0.03] px-3 py-2.5 text-[12.5px] text-fg outline-none placeholder:text-muted/70 focus:border-line-hot"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="grid w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-[#14020a] transition disabled:opacity-40"
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}
