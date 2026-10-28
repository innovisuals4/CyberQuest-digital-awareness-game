'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useProgress } from '@/lib/useProgress';
import { LEVELS } from '@/lib/types';
import { completionPercent } from '@/lib/game';

const RAIL = [
  { icon: 'console', label: 'Console', href: '/dashboard' },
  { icon: 'missions', label: 'Missions', href: '#missions' },
  { icon: 'badges', label: 'Badges', href: '#dossier' },
  { icon: 'site', label: 'Site', href: '/' },
] as const;

function RailIcon({ name }: { name: (typeof RAIL)[number]['icon'] }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (name === 'console')
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  if (name === 'missions')
    return (
      <svg {...common}>
        <path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7z" />
        <path d="M12 8v8M8 10l8 4M16 10l-8 4" />
      </svg>
    );
  if (name === 'badges')
    return (
      <svg {...common}>
        <path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.8l1.1-6.1L3.2 9.4l6.1-.8z" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90" aria-hidden>
      <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * pct) / 100}
        style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)' }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff4d9d" />
          <stop offset="100%" stopColor="#ff7a45" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Dashboard() {
  const { progress, update } = useProgress();
  const [section, setSection] = useState('Console');

  if (!progress) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
          <span className="text-primary">▮</span> Decrypting agent profile
          <span className="blink">_</span>
        </div>
      </div>
    );
  }

  const pct = completionPercent(progress);
  const done = LEVELS.filter(l => progress.levels[l.id]?.completed).length;
  const current = LEVELS[Math.min(progress.currentLevelId, 15) - 1];
  const last = progress.lastPlayedLevelId;
  const today = new Date().toISOString().slice(0, 10);
  const claimed = progress.dailyChallengeDate === today && progress.dailyChallengeDone;
  const nextLevel = Math.min(progress.currentLevelId, LEVELS.length);

  return (
    <div className="flex min-h-screen">
      {/* ── icon rail ─────────────────────────────── */}
      <aside className="sticky top-0 z-40 hidden h-screen w-[68px] shrink-0 flex-col items-center gap-2 border-r border-line bg-[#07030c]/70 py-4 backdrop-blur-xl md:flex">
        <Link
          href="/"
          className="mb-4 grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent font-display text-[10px] font-black text-[#14020a]"
          aria-label="CQ — CyberQuest home"
        >
          CQ
        </Link>
        <nav className="flex flex-1 flex-col items-center gap-1.5">
          {RAIL.map(item => {
            const on = section === item.label;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSection(item.label)}
                title={item.label}
                aria-label={item.label}
                className={`group relative grid h-11 w-11 place-items-center rounded-xl transition ${
                  on
                    ? 'bg-primary-soft text-primary ring-1 ring-line-hot'
                    : 'text-muted hover:bg-white/5 hover:text-fg'
                }`}
              >
                <RailIcon name={item.icon} />
                <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md border border-line bg-[#0d0614] px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-fg opacity-0 transition group-hover:opacity-100">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <span className="font-mono text-[8px] tracking-[0.2em] text-muted/50 [writing-mode:vertical-rl]">
          SECURE · v1.0
        </span>
      </aside>

      <div className="min-w-0 flex-1">
        {/* ── top HUD ──────────────────────────────── */}
        <header className="sticky top-0 z-30 border-b border-line bg-[#07030c]/85 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-3 px-4 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.28em] text-muted lg:block">
                Agent
              </span>
              <input
                value={progress.username}
                onChange={e => update(p => ({ ...p, username: e.target.value.slice(0, 24) }))}
                placeholder="Agent"
                aria-label="Agent name"
                className="w-28 rounded-md border border-transparent bg-transparent px-1.5 py-1 font-display text-sm font-bold text-fg outline-none transition placeholder:font-normal placeholder:text-muted/60 hover:border-line focus:border-line-hot md:w-40"
              />
              <span className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-ok sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-ok blink" /> online
              </span>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-muted sm:flex">
                <span>
                  XP <span className="text-fg">{progress.totalXP}</span>
                </span>
                <span className="text-line-strong">|</span>
                <span>
                  Cleared <span className="text-fg">{done}</span>
                </span>
              </div>
              <Link href="/" className="cq-btn cq-btn-ghost !px-4 !py-2 !text-[9px]">
                Exit
              </Link>
            </div>
          </div>
          <div className="cq-meter !h-[3px] rounded-none">
            <span style={{ width: `${pct}%` }} />
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-10">
          {/* ── featured mission ──────────────────── */}
          <section className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="cq-panel cq-cut relative overflow-hidden p-6 md:p-8"
            >
              <div className="cq-scan" />
              <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.28em] text-muted">
                <span className="text-primary">Next objective</span>
                <span>
                  Sector {String(current.id).padStart(2, '0')} / 15
                </span>
              </div>

              <div className="mt-6 flex items-start gap-4">
                <span className="text-5xl md:text-6xl">{current.icon}</span>
                <div className="min-w-0">
                  <h1 className="font-display text-2xl font-black leading-tight md:text-3xl">
                    {current.title}
                  </h1>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                    {current.description}
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 divide-x divide-line border-y border-line">
                {[
                  ['Difficulty', current.baseDifficulty],
                  ['Questions', '10 of 32'],
                  ['Lives', '3'],
                ].map(([k, v]) => (
                  <div key={k} className="px-4 py-3 first:pl-0">
                    <div className="font-mono text-[8px] uppercase tracking-[0.22em] text-muted">
                      {k}
                    </div>
                    <div className="mt-0.5 font-display text-sm font-bold capitalize text-fg">
                      {v}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href={`/play/${nextLevel}`} className="cq-btn cq-btn-primary">
                  Deploy mission <span aria-hidden>→</span>
                </Link>
                {last && (
                  <Link href={`/play/${last}`} className="cq-btn cq-btn-ghost">
                    Replay last
                  </Link>
                )}
                <span className="ml-auto hidden font-mono text-[9px] uppercase tracking-[0.22em] text-muted sm:block">
                  Fresh set every run
                </span>
              </div>
            </motion.div>

            {/* agent card */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="cq-panel relative flex flex-col justify-between p-6 md:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted">
                  Agent dossier
                </span>
                <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary">
                  LV {Math.max(1, Math.floor(progress.totalXP / 100) + 1)}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-5">
                <div className="relative grid place-items-center">
                  <Ring pct={pct} />
                  <span className="absolute font-display text-sm font-bold">{pct}%</span>
                </div>
                <div>
                  <div className="font-display text-lg font-bold leading-tight">
                    {progress.username || 'Agent'}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted">
                    {done} of 15 sectors cleared
                  </div>
                  <div className="mt-2 text-[11px] text-muted">
                    {progress.totalXP} XP banked
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <Link
                  href="#missions"
                  className="rounded-lg border border-line px-3 py-2.5 text-center font-display text-[10px] font-bold uppercase tracking-widest text-fg transition hover:border-line-hot hover:bg-primary-soft"
                >
                  Mission grid
                </Link>
                <a
                  href="#dossier"
                  className="rounded-lg border border-line px-3 py-2.5 text-center font-display text-[10px] font-bold uppercase tracking-widest text-fg transition hover:border-line-hot hover:bg-primary-soft"
                >
                  Badges
                </a>
              </div>
            </motion.div>
          </section>

          {/* ── mission grid ──────────────────────── */}
          <section id="missions" className="mt-10 scroll-mt-20">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-primary">
                  Mission grid
                </p>
                <h2 className="mt-1.5 font-display text-xl font-black md:text-2xl">
                  Fifteen sectors
                </h2>
              </div>
              <div className="flex items-center gap-4 font-mono text-[9px] uppercase tracking-widest text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-primary" /> cleared
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm border border-line-hot" /> open
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-white/10" /> locked
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
              {LEVELS.map((l, i) => {
                const lp = progress.levels[l.id];
                const state = lp?.completed ? 'done' : lp?.unlocked ? 'open' : 'locked';
                const isNext = l.id === nextLevel;

                return (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.025, 0.4), duration: 0.35 }}
                  >
                    <Link
                      href={state === 'locked' ? '#' : `/play/${l.id}`}
                      aria-disabled={state === 'locked'}
                      onClick={e => {
                        if (state === 'locked') e.preventDefault();
                      }}
                      className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border p-4 transition ${
                        state === 'locked'
                          ? 'cursor-not-allowed border-line/60 bg-white/[0.012] opacity-55'
                          : state === 'done'
                            ? 'border-line bg-white/[0.035] hover:-translate-y-0.5 hover:border-primary/60'
                            : 'border-line-hot bg-primary-soft hover:-translate-y-0.5 hover:bg-primary/15'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-mono text-[10px] tracking-[0.18em] text-muted">
                          {String(l.id).padStart(2, '0')}
                        </span>
                        {state === 'done' ? (
                          <span className="font-mono text-[9px] uppercase tracking-widest text-ok">
                            ✓ {lp.bestScore}
                          </span>
                        ) : state === 'open' ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary blink" />
                        ) : (
                          <span className="font-mono text-[9px] text-muted/60">🔒</span>
                        )}
                      </div>

                      <div className="mt-5 text-2xl">{l.icon}</div>
                      <div className="mt-2 font-display text-[12px] font-bold leading-snug text-fg">
                        {l.title}
                      </div>
                      <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted">
                        {state === 'done'
                          ? 'replayable'
                          : state === 'open'
                            ? 'deploy'
                            : 'locked'}
                      </div>

                      {isNext && (
                        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-primary to-accent" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ── dossier / daily / badges ───────────── */}
          <section id="dossier" className="mt-10 grid gap-4 scroll-mt-20 lg:grid-cols-3">
            <div className="cq-panel p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted">
                  Daily supply drop
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-accent">
                  +50 XP
                </span>
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-muted">
                {claimed
                  ? 'Claimed. The next drop unlocks at midnight local time.'
                  : 'Log in, claim the drop, keep the streak alive.'}
              </p>
              <button
                disabled={claimed}
                onClick={() =>
                  update(p => ({
                    ...p,
                    dailyChallengeDate: today,
                    dailyChallengeDone: true,
                    totalXP: p.totalXP + 50,
                  }))
                }
                className={`mt-4 w-full rounded-lg border py-3 font-display text-[10px] font-bold uppercase tracking-[0.2em] transition ${
                  claimed
                    ? 'border-line text-muted'
                    : 'border-accent/50 bg-accent/15 text-accent hover:bg-accent/25'
                }`}
              >
                {claimed ? 'Claimed ✓' : 'Claim drop'}
              </button>
            </div>

            <div className="cq-panel p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted">
                  Achievements
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
                  {progress.badges.length} unlocked
                </span>
              </div>
              {progress.badges.length === 0 ? (
                <p className="mt-3 text-[13px] leading-relaxed text-muted">
                  No badges yet. Clear a sector to mint your first one — a perfect run mints a
                  second.
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {progress.badges.map(b => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line-hot bg-primary-soft px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-fg"
                    >
                      <span className="text-accent">★</span>
                      {b}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4">
                {[
                  ['Total XP', progress.totalXP],
                  ['Cleared', `${done}/15`],
                  ['Badges', progress.badges.length],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted">
                      {k}
                    </div>
                    <div className="font-display text-lg font-bold">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
