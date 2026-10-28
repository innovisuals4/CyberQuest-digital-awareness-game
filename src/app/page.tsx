'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LEVELS } from '@/lib/types';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Home() {
  const [active, setActive] = useState(0);
  const preview = LEVELS[active];

  return (
    <div className="min-h-screen">
      {/* ── command bar ─────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-line bg-[#07030c]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-5 md:px-10">
          <div className="flex items-center gap-3">
            <div className="relative grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-primary to-accent text-[11px] font-black text-[#14020a]">
              CQ
            </div>
            <span className="font-display text-[11px] font-bold tracking-[0.42em] text-fg">
              CYBERQUEST
            </span>
          </div>
          <div className="hidden items-center gap-6 text-[10px] font-mono uppercase tracking-[0.22em] text-muted md:flex">
            <span className="text-fg/70">Digital Awareness Protocol</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ok blink" />
              Link stable
            </span>
          </div>
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-fg transition hover:border-line-hot hover:bg-primary-soft"
          >
            Enter
            <span className="transition group-hover:translate-x-0.5">↗</span>
          </Link>
        </div>
      </header>

      <main>
        {/* ── hero / signal ─────────────────────────── */}
        <section className="relative overflow-hidden border-b border-line">
          <div className="absolute inset-y-0 left-1/2 hidden w-px bg-line lg:block" />
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <div className="grid gap-0 lg:grid-cols-12">
              {/* left: type block */}
              <div className="relative border-line py-12 lg:col-span-8 lg:border-r lg:py-20 lg:pr-14">
                <motion.div
                  custom={0}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="mb-7 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted"
                >
                  <span className="text-primary">[ 01 ]</span>
                  <span>15 sectors</span>
                  <span className="text-line-strong">/</span>
                  <span>480 signals</span>
                  <span className="text-line-strong">/</span>
                  <span>1 agent</span>
                </motion.div>

                <h1 className="font-display text-[clamp(2.6rem,7.2vw,5.8rem)] font-black leading-[0.92] tracking-[-0.02em]">
                  <motion.span custom={1} variants={fadeUp} initial="hidden" animate="show" className="block">
                    READ THE
                  </motion.span>
                  <motion.span
                    custom={2}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    className="block text-transparent"
                    style={{ WebkitTextStroke: '1.5px rgba(255,77,157,0.55)' }}
                  >
                    SIGNAL.
                  </motion.span>
                  <motion.span
                    custom={3}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    className="block bg-gradient-to-r from-primary via-pink-300 to-accent bg-clip-text text-transparent"
                  >
                    BREAK THE SCAM.
                  </motion.span>
                </h1>

                <motion.p
                  custom={4}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="mt-8 max-w-lg text-[15px] leading-relaxed text-muted"
                >
                  Fifteen mission sectors of phishing, deepfakes, ransomware and social
                  engineering. Every run deals a fresh hand from 480 question modules — so the
                  training never gets stale and never repeats itself twice.
                </motion.p>

                <motion.div
                  custom={5}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="mt-9 flex flex-wrap items-center gap-3"
                >
                  <Link href="/dashboard" className="cq-btn cq-btn-primary">
                    Begin deployment
                    <span aria-hidden>→</span>
                  </Link>
                  <a href="#sectors" className="cq-btn cq-btn-ghost">
                    Browse sectors
                  </a>
                </motion.div>

                {/* spec strip */}
                <motion.dl
                  custom={6}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="mt-14 grid max-w-xl grid-cols-3 divide-x divide-line border-y border-line"
                >
                  {[
                    ['Modules', '480'],
                    ['Lives / run', '03'],
                    ['Mentor', 'AI'],
                  ].map(([k, v]) => (
                    <div key={k} className="px-4 py-4 first:pl-0">
                      <dt className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
                        {k}
                      </dt>
                      <dd className="font-display text-2xl font-bold text-fg">{v}</dd>
                    </div>
                  ))}
                </motion.dl>
              </div>

              {/* right: live brief */}
              <div className="relative flex flex-col justify-between py-10 lg:col-span-4 lg:py-20 lg:pl-10">
                <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.28em] text-muted">
                  <span>Live brief</span>
                  <span className="flex items-center gap-1.5 text-ok">
                    <span className="h-1.5 w-1.5 rounded-full bg-ok blink" /> rec
                  </span>
                </div>

                <div className="relative my-8">
                  <div className="absolute -left-6 top-2 hidden font-display text-[10px] tracking-[0.3em] text-primary lg:block [writing-mode:vertical-rl]">
                    SECTOR FILE
                  </div>
                  <motion.div
                    key={preview.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="cq-panel cq-cut relative overflow-hidden p-6"
                  >
                    <div className="cq-scan" />
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-[10px] tracking-[0.2em] text-muted">
                        #{String(preview.id).padStart(2, '0')} / 15
                      </span>
                      <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary">
                        {preview.baseDifficulty}
                      </span>
                    </div>
                    <div className="mt-8 text-5xl">{preview.icon}</div>
                    <h2 className="mt-5 font-display text-xl font-bold leading-tight">
                      {preview.title}
                    </h2>
                    <p className="mt-2 text-[12px] leading-relaxed text-muted">
                      {preview.topic}
                    </p>
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between font-mono text-[9px] uppercase tracking-widest text-muted">
                        <span>Threat index</span>
                        <span className="text-primary">
                          {preview.baseDifficulty === 'easy'
                            ? 'low'
                            : preview.baseDifficulty === 'medium'
                              ? 'elevated'
                              : preview.baseDifficulty === 'hard'
                                ? 'high'
                                : 'critical'}
                        </span>
                      </div>
                      <div className="cq-meter">
                        <span style={{ width: `${preview.id * 6.2}%` }} />
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="space-y-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted">
                    Quick jump
                  </p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {LEVELS.map((l, i) => (
                      <button
                        key={l.id}
                        onClick={() => setActive(i)}
                        onMouseEnter={() => setActive(i)}
                        aria-label={`${String(l.id).padStart(2, '0')} — preview ${l.title}`}
                        aria-pressed={active === i}
                        className={`grid h-9 place-items-center rounded-md border font-mono text-[11px] transition ${
                          active === i
                            ? 'border-primary bg-primary text-[#14020a]'
                            : 'border-line text-muted hover:border-line-hot hover:text-fg'
                        }`}
                      >
                        {String(l.id).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── sector table ──────────────────────────── */}
        <section id="sectors" className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                [ 02 ] index
              </p>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight md:text-4xl">
                The mission ledger
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              Sectors unlock sequentially. Clear one, and the next file decrypts. Hover a row to
              inspect the dossier.
            </p>
          </div>

          <div className="border-t border-line">
            {LEVELS.map((l, i) => {
              const isActive = active === i;
              return (
                <Link
                  key={l.id}
                  href="/dashboard"
                  onMouseEnter={() => setActive(i)}
                  className={`group grid grid-cols-[36px_1fr_auto] items-center gap-4 border-b border-line px-1 py-4 transition md:grid-cols-[64px_1fr_120px_32px] md:px-4 ${
                    isActive ? 'bg-primary-soft' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <span
                    className={`font-display text-sm font-bold tracking-widest transition ${
                      isActive ? 'text-primary' : 'text-muted/60'
                    }`}
                  >
                    {String(l.id).padStart(2, '0')}
                  </span>
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="text-xl">{l.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className="truncate font-display text-sm font-bold text-fg">
                          {l.title}
                        </span>
                        <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-muted md:hidden">
                          {l.baseDifficulty}
                        </span>
                      </span>
                      <span className="mt-1 flex items-center gap-3">
                        <span className="truncate text-[11px] text-muted">{l.topic}</span>
                        <span className="hidden h-[3px] w-24 shrink-0 overflow-hidden rounded-full bg-white/10 sm:block">
                          <span
                            className="block h-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${l.id * 6.2}%` }}
                          />
                        </span>
                      </span>
                    </span>
                  </span>
                  <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted md:block">
                    {l.baseDifficulty}
                  </span>
                  <span
                    className={`text-right font-display text-lg transition ${
                      isActive ? 'translate-x-0 text-primary' : '-translate-x-1 text-muted/40'
                    }`}
                    aria-hidden
                  >
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── protocol ──────────────────────────────── */}
        <section className="border-y border-line bg-white/[0.015]">
          <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div className="lg:sticky lg:top-24 lg:self-start">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                  [ 03 ] protocol
                </p>
                <h2 className="mt-3 font-display text-3xl font-black leading-tight md:text-4xl">
                  Three moves.
                  <br />
                  Zero panic.
                </h2>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
                  Every mission is built around a repeatable reflex: pause, inspect, respond.
                  That reflex is what keeps accounts, money and reputations intact.
                </p>
                <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                  Mentor online · no spoilers
                </div>
              </div>

              <ol className="relative">
                {[
                  {
                    n: '01',
                    t: 'Spot the anomaly',
                    d: 'A wrong domain, an urgent tone, an attachment you did not ask for. Missions train your eye on the detail that gives the attack away.',
                  },
                  {
                    n: '02',
                    t: 'Verify before you act',
                    d: 'Cross-check the sender, the link, the request. CyberMentor nudges you with progressive hints instead of handing over the answer.',
                  },
                  {
                    n: '03',
                    t: 'Respond like a pro',
                    d: 'Report, rotate credentials, contain the damage. You earn XP, streaks and badges as your instincts sharpen across all 15 sectors.',
                  },
                ].map(s => (
                  <li
                    key={s.n}
                    className="group grid grid-cols-[56px_1fr] gap-5 border-t border-line py-8 first:border-t-0 md:grid-cols-[88px_1fr] md:gap-8"
                  >
                    <span className="font-display text-2xl font-black text-muted/40 transition group-hover:text-primary md:text-4xl">
                      {s.n}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold md:text-xl">{s.t}</h3>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── closing cta ───────────────────────────── */}
        <section className="mx-auto max-w-[1400px] px-5 py-20 text-center md:px-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted">
            Awaiting agent
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-black leading-tight md:text-5xl">
            Your first sector is
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {' '}
              already open.
            </span>
          </h2>
          <Link href="/dashboard" className="cq-btn cq-btn-primary mt-8">
            Deploy now
            <span aria-hidden>→</span>
          </Link>
        </section>
      </main>

      {/* ── ticker footer ───────────────────────────── */}
      <footer className="border-t border-line">
        <div className="cq-ticker overflow-hidden py-4">
          <div className="cq-ticker-track gap-10 font-mono text-[10px] uppercase tracking-[0.3em] text-muted/60">
            {[0, 1].map(r => (
              <div key={r} className="flex shrink-0 items-center gap-10">
                {LEVELS.map(l => (
                  <span key={`${r}-${l.id}`} className="flex items-center gap-2">
                    <span className="text-primary/70">{String(l.id).padStart(2, '0')}</span>
                    {l.title}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 border-t border-line px-5 py-5 font-mono text-[9px] uppercase tracking-[0.25em] text-muted/60 sm:flex-row sm:items-center sm:justify-between md:px-10">
          <span>CyberQuest © 2026 — digital awareness protocol</span>
          <span>Every question, a real-world threat.</span>
        </div>
      </footer>
    </div>
  );
}
