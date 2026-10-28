'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useProgress } from '@/lib/useProgress';
import { useGameContext } from '@/lib/GameContext';
import { LEVELS, Question, Difficulty } from '@/lib/types';
import { selectQuestions, QUESTIONS_PER_ATTEMPT, STARTING_LIVES, PlayerProgress } from '@/lib/game';
import { sfx } from '@/lib/sound';
import Confetti from '@/components/Confetti';

type Phase = 'setup' | 'playing' | 'gameover' | 'results';

const DIFFICULTY_INFO: { id: Difficulty; label: string; xp: number; blurb: string }[] = [
  { id: 'easy', label: 'Recruit', xp: 10, blurb: 'Warm-up signals' },
  { id: 'medium', label: 'Field', xp: 20, blurb: 'Standard threat load' },
  { id: 'hard', label: 'Specialist', xp: 30, blurb: 'Compressed timings' },
  { id: 'expert', label: 'Ghost', xp: 40, blurb: 'Everything, all at once' },
];

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const levelId = Number(params?.id);
  const level = LEVELS.find(l => l.id === levelId);
  const { progress, update } = useProgress();
  const ctx = useGameContext();

  const [phase, setPhase] = useState<Phase>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [attemptQuestionIds, setAttemptQuestionIds] = useState<string[]>([]);
  const [attemptResults, setAttemptResults] = useState<('correct' | 'wrong' | 'skip')[]>([]);
  const [perfect, setPerfect] = useState(true);
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const q = questions[idx];

  useEffect(() => {
    if (progress) setDifficulty(progress.preferences.difficulty || 'medium');
  }, [progress]);

  const startAttempt = useCallback(() => {
    if (!progress) return;
    sfx.click();
    const seen = progress.seenQuestionIds[levelId] || [];
    const qs = selectQuestions(levelId, difficulty, seen, recentIds, QUESTIONS_PER_ATTEMPT);
    setQuestions(qs);
    setAttemptQuestionIds(qs.map(x => x.id));
    setRecentIds(qs.map(x => x.id));
    setIdx(0);
    setLives(STARTING_LIVES);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setSelected(null);
    setSubmitted(false);
    setPerfect(true);
    setAttemptResults([]);
    setShowHint(false);
    setPhase('playing');
  }, [progress, levelId, difficulty, recentIds]);

  useEffect(() => {
    ctx.setContext({
      levelId,
      topic: level?.topic || '',
      question: q || null,
      difficulty,
      answerSubmitted: submitted,
      correctAnswer:
        submitted && q
          ? Array.isArray(q.correctAnswer)
            ? q.correctAnswer.join(',')
            : q.correctAnswer
          : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId, level?.topic, questions, idx, difficulty, submitted]);

  const finishSuccess = useCallback(() => {
    const xpEarned = correctCount * DIFFICULTY_INFO.find(d => d.id === difficulty)!.xp;
    update((p: PlayerProgress) => {
      // deep-enough copy — mutating nested objects would corrupt previous state
      const next: PlayerProgress = {
        ...p,
        levels: { ...p.levels, [levelId]: { ...p.levels[levelId] } },
        seenQuestionIds: { ...p.seenQuestionIds },
        badges: [...p.badges],
        preferences: { ...p.preferences },
      };
      const seen = new Set(next.seenQuestionIds[levelId] || []);
      attemptQuestionIds.forEach(id => seen.add(id));
      next.seenQuestionIds[levelId] = Array.from(seen);
      const lp = next.levels[levelId];
      lp.attempts = (lp.attempts || 0) + 1;
      lp.completed = true;
      if (score > lp.bestScore) lp.bestScore = score;
      lp.completedAt = Date.now();
      next.totalXP = next.totalXP + xpEarned + (perfect ? 25 : 0);
      const nxt = levelId + 1;
      if (nxt <= LEVELS.length && next.levels[nxt]) {
        next.levels[nxt] = { ...next.levels[nxt], unlocked: true };
      }
      next.currentLevelId = Math.max(
        next.currentLevelId,
        Math.min(levelId + 1, LEVELS.length)
      );
      if (!next.badges.includes(`${level?.title} Badge`))
        next.badges.push(`${level?.title} Badge`);
      if (perfect && !next.badges.includes('Perfect Run')) next.badges.push('Perfect Run');
      if (levelId === 15 && !next.badges.includes('CyberQuest Champion'))
        next.badges.push('CyberQuest Champion');
      next.lastPlayedLevelId = levelId;
      next.preferences.difficulty = difficulty;
      return next;
    });
    sfx.levelUp();
    setPhase('results');
  }, [correctCount, difficulty, score, perfect, attemptQuestionIds, levelId, level, update]);

  const finishFailure = useCallback(() => {
    const xpEarned = correctCount * DIFFICULTY_INFO.find(d => d.id === difficulty)!.xp;
    update((p: PlayerProgress) => {
      // deep-enough copy — mutating nested objects would corrupt previous state
      const next: PlayerProgress = {
        ...p,
        levels: { ...p.levels, [levelId]: { ...p.levels[levelId] } },
        seenQuestionIds: { ...p.seenQuestionIds },
        preferences: { ...p.preferences },
      };
      const seen = new Set(next.seenQuestionIds[levelId] || []);
      attemptQuestionIds.forEach(id => seen.add(id));
      next.seenQuestionIds[levelId] = Array.from(seen);
      const lp = next.levels[levelId];
      lp.attempts = (lp.attempts || 0) + 1;
      if (score > lp.bestScore && lp.completed) lp.bestScore = Math.max(lp.bestScore, score);
      next.totalXP = next.totalXP + Math.floor(xpEarned * 0.5);
      next.lastPlayedLevelId = levelId;
      next.preferences.difficulty = difficulty;
      return next;
    });
    sfx.gameover();
    setPhase('gameover');
  }, [correctCount, difficulty, score, attemptQuestionIds, levelId, update]);

  const handleSubmit = useCallback(() => {
    if (submitted || !selected || !q) return;
    const correct = selected === q.correctAnswer;
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(m => Math.max(m, newStreak));
      setScore(s => s + 10 * (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : difficulty === 'hard' ? 3 : 4) + newStreak);
      setCorrectCount(c => c + 1);
      setAttemptResults(r => [...r, 'correct']);
      sfx.correct();
    } else {
      setStreak(0);
      setLives(l => l - 1);
      setWrongCount(w => w + 1);
      setAttemptResults(r => [...r, 'wrong']);
      setPerfect(false);
      sfx.wrong();
      setShake(true);
      setTimeout(() => setShake(false), 420);
    }
    setSubmitted(true);
  }, [submitted, selected, q, streak, difficulty]);

  const handleNext = useCallback(() => {
    if (lives <= 0) {
      finishFailure();
      return;
    }
    if (idx + 1 >= questions.length) {
      finishSuccess();
      return;
    }
    setIdx(i => i + 1);
    setSelected(null);
    setSubmitted(false);
    setShowHint(false);
  }, [lives, idx, questions.length, finishFailure, finishSuccess]);

  /* keyboard: A–D / 1–4 to answer, Enter to confirm, H for hint */
  useEffect(() => {
    if (phase !== 'playing' || !q) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (submitted) handleNext();
        else handleSubmit();
        return;
      }
      if (!submitted) {
        const k = e.key.toLowerCase();
        const num = ['1', '2', '3', '4', '5', '6'].indexOf(k);
        const letter = ['a', 'b', 'c', 'd', 'e', 'f'].indexOf(k);
        const pos = num >= 0 ? num : letter;
        if (pos >= 0 && q.options && q.options[pos]) {
          setSelected(q.options[pos].id);
          sfx.click();
        }
      }
      if (e.key.toLowerCase() === 'h') setShowHint(s => !s);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, q, submitted, handleNext, handleSubmit]);

  const accuracy = useMemo(
    () => (questions.length ? Math.round((correctCount / questions.length) * 100) : 0),
    [correctCount, questions.length]
  );

  if (!level) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="font-mono text-sm text-muted">Sector not found.</p>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
          Loading mission<span className="blink">_</span>
        </p>
      </div>
    );
  }

  if (!progress.levels[levelId]?.unlocked) {
    return (
      <div className="grid min-h-screen place-items-center px-6">
        <div className="cq-panel max-w-sm p-8 text-center">
          <div className="text-4xl">🔒</div>
          <h1 className="mt-4 font-display text-lg font-bold">Sector sealed</h1>
          <p className="mt-2 text-sm text-muted">
            Clear the previous sector to decrypt this file.
          </p>
          <button onClick={() => router.push('/dashboard')} className="cq-btn cq-btn-ghost mt-6">
            Back to console
          </button>
        </div>
      </div>
    );
  }

  /* ── SETUP ─────────────────────────────────────── */
  if (phase === 'setup') {
    const lp = progress.levels[levelId];
    return (
      <div className="min-h-screen">
        <header className="border-b border-line">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5">
            <button
              onClick={() => router.push('/dashboard')}
              className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted transition hover:text-fg"
            >
              ← Console
            </button>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              Pre-flight
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-5 py-10 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-baseline gap-4">
              <span className="font-display text-[clamp(3rem,10vw,6rem)] font-black leading-none text-white/[0.07]">
                {String(level.id).padStart(2, '0')}
              </span>
              <span className="pb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                Sector briefing
              </span>
            </div>

            <div className="mt-2 flex items-start gap-4">
              <span className="text-5xl">{level.icon}</span>
              <div>
                <h1 className="font-display text-3xl font-black leading-tight md:text-4xl">
                  {level.title}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                  {level.description}
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-[1.3fr_1fr]">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted">
                  Select threat level
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {DIFFICULTY_INFO.map(d => {
                    const on = difficulty === d.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => {
                          setDifficulty(d.id);
                          sfx.click();
                        }}
                        aria-pressed={on}
                        className={`rounded-xl border p-3.5 text-left transition ${
                          on
                            ? 'border-line-hot bg-primary-soft cq-glow-soft'
                            : 'border-line bg-white/[0.02] hover:border-line-strong'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display text-[11px] font-bold uppercase tracking-widest">
                            {d.label}
                          </span>
                          <span
                            className={`font-mono text-[9px] ${on ? 'text-primary' : 'text-muted'}`}
                          >
                            +{d.xp} XP
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-muted">{d.blurb}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="cq-panel-flat p-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted">
                  Mission parameters
                </p>
                <dl className="mt-3 space-y-2.5">
                  {[
                    ['Questions', `${QUESTIONS_PER_ATTEMPT} of 32`],
                    ['Lives', `${STARTING_LIVES}`],
                    ['Fresh set', 'Every attempt'],
                    ['Best score', lp.bestScore || '—'],
                    ['Attempts', lp.attempts || 0],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between border-b border-line/60 pb-2 last:border-0 last:pb-0"
                    >
                      <dt className="font-mono text-[10px] uppercase tracking-widest text-muted">
                        {k}
                      </dt>
                      <dd className="font-display text-[11px] font-bold text-fg">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button onClick={startAttempt} className="cq-btn cq-btn-primary">
                Deploy mission <span aria-hidden>→</span>
              </button>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
                A–D to answer · Enter to confirm · H for hint
              </span>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  /* ── PLAYING ───────────────────────────────────── */
  if (phase === 'playing' && q) {
    const isCorrect = submitted && selected === q.correctAnswer;
    const answered = attemptResults.length;
    const optionIds = q.options?.map(o => o.id) ?? [];

    return (
      <div className="flex min-h-screen flex-col">
        {/* HUD */}
        <header className="sticky top-0 z-30 border-b border-line bg-[#07030c]/85 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                aria-label="Abort mission"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line text-muted transition hover:border-line-hot hover:text-fg"
              >
                ✕
              </button>
              <div className="min-w-0">
                <div className="truncate font-display text-[11px] font-bold uppercase tracking-widest">
                  {level.title}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                  Sector {String(level.id).padStart(2, '0')} · Q{idx + 1}/{questions.length}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] md:gap-5">
              <div className="flex items-center gap-1" aria-label={`${lives} lives remaining`}>
                {Array.from({ length: STARTING_LIVES }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-[13px] transition ${
                      i < lives ? 'text-primary' : 'text-white/15'
                    }`}
                  >
                    {i < lives ? '❤' : '♡'}
                  </span>
                ))}
              </div>
              <div className="hidden text-muted sm:block">
                Score <span className="font-display text-fg">{score}</span>
              </div>
              <div className="text-muted">
                <span className={streak > 1 ? 'text-accent' : 'text-muted'}>🔥 {streak}</span>
              </div>
            </div>
          </div>

          {/* segmented progress */}
          <div className="mx-auto flex max-w-6xl gap-1 px-4 pb-2 md:px-6">
            {questions.map((_, i) => {
              const r = attemptResults[i];
              const live = i === idx;
              return (
                <span
                  key={i}
                  className={`cq-seg !h-[4px] ${
                    r === 'correct'
                      ? 'cq-seg-done'
                      : r === 'wrong'
                        ? 'cq-seg-bad'
                        : live
                          ? 'cq-seg-live'
                          : ''
                  }`}
                />
              );
            })}
          </div>
        </header>

        <main className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 pt-6 pb-28 md:grid-cols-[200px_1fr] md:px-6">
          {/* flight deck */}
          <aside className="hidden md:block">
            <div className="sticky top-24 space-y-5">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted">
                  Flight deck
                </p>
                <div className="mt-3 grid grid-cols-5 gap-1.5">
                  {questions.map((_, i) => {
                    const r = attemptResults[i];
                    const live = i === idx;
                    return (
                      <span
                        key={i}
                        aria-label={`Question ${i + 1}${r ? `: ${r}` : ''}`}
                        className={`grid h-7 place-items-center rounded font-mono text-[9px] ${
                          r === 'correct'
                            ? 'bg-primary/80 text-[#14020a]'
                            : r === 'wrong'
                              ? 'bg-bad/70 text-white'
                              : live
                                ? 'border border-primary text-primary'
                                : 'border border-line text-muted/60'
                        }`}
                      >
                        {i + 1}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 border-t border-line pt-4">
                {[
                  ['Answered', `${answered}/${questions.length}`],
                  ['Correct', correctCount],
                  ['Accuracy', `${answered ? Math.round((correctCount / answered) * 100) : 0}%`],
                  ['Streak', maxStreak],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
                      {k}
                    </span>
                    <span className="font-display text-[11px] font-bold">{v}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowHint(s => !s)}
                className="w-full rounded-lg border border-line px-3 py-2.5 text-left font-mono text-[9px] uppercase tracking-widest text-muted transition hover:border-line-hot hover:text-fg"
              >
                {showHint ? 'Hide hint' : 'Request hint'} <span className="cq-kbd ml-1">H</span>
              </button>
            </div>
          </aside>

          {/* question */}
          <section className="flex min-w-0 flex-col">
            <motion.div
              animate={shake ? { x: [0, -10, 9, -6, 6, 0] } : { x: 0 }}
              transition={{ duration: 0.42 }}
            >
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24 }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-primary">
                      {q.type.replace(/-/g, ' ')}
                    </span>
                    <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-muted">
                      {q.difficulty}
                    </span>
                  </div>

                  {q.scenario && (
                    <div className="mt-5 border-l-2 border-accent/70 bg-white/[0.025] px-4 py-3">
                      <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent">
                        Situation brief
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">{q.scenario}</p>
                    </div>
                  )}

                  <h2 className="mt-5 font-display text-[19px] font-bold leading-snug md:text-[26px]">
                    {q.questionText}
                  </h2>

                  {showHint && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 rounded-lg border border-accent/40 bg-accent/[0.08] px-4 py-3 text-[12px] leading-relaxed text-accent"
                    >
                      Hint: {q.hint || 'Re-read the scenario and look for the detail that is out of place.'}
                    </motion.p>
                  )}

                  <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {q.options?.map((opt, i) => {
                      const chosen = selected === opt.id;
                      const right = submitted && opt.id === q.correctAnswer;
                      const wrongPick = submitted && chosen && opt.id !== q.correctAnswer;
                      return (
                        <button
                          key={opt.id}
                          disabled={submitted}
                          onClick={() => {
                            setSelected(opt.id);
                            sfx.click();
                          }}
                          className={`group relative flex items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition ${
                            right
                              ? 'border-ok/70 bg-ok/10'
                              : wrongPick
                                ? 'border-bad/70 bg-bad/10'
                                : chosen
                                  ? 'border-primary bg-primary-soft'
                                  : 'border-line bg-white/[0.02] hover:border-line-strong hover:bg-white/[0.04]'
                          } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border font-mono text-[11px] ${
                              right
                                ? 'border-ok/60 bg-ok/20 text-ok'
                                : wrongPick
                                  ? 'border-bad/60 bg-bad/20 text-bad'
                                  : chosen
                                    ? 'border-primary bg-primary text-[#14020a]'
                                    : 'border-line text-muted group-hover:text-fg'
                            }`}
                          >
                            {LETTERS[i] ?? i + 1}
                          </span>
                          <span className="pt-0.5 text-[13px] leading-relaxed text-fg/90">
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
            </motion.div>

            {/* action dock */}
            <div className="mt-auto pt-8">
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl border p-4 ${
                      isCorrect ? 'border-ok/40 bg-ok/[0.07]' : 'border-bad/40 bg-bad/[0.07]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-full text-[11px] ${
                          isCorrect ? 'bg-ok/20 text-ok' : 'bg-bad/20 text-bad'
                        }`}
                      >
                        {isCorrect ? '✓' : '✕'}
                      </span>
                      <span
                        className={`font-display text-[11px] font-bold uppercase tracking-widest ${
                          isCorrect ? 'text-ok' : 'text-bad'
                        }`}
                      >
                        {isCorrect ? 'Signal decoded' : 'Signal missed'}
                      </span>
                      {isCorrect && streak > 1 && (
                        <span className="ml-auto font-mono text-[10px] text-accent">
                          🔥 {streak} streak
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-fg/80">{q.explanation}</p>
                    <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted">
                      ▸ {q.takeaway}
                    </p>
                  </motion.div>
                )}

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={submitted ? handleNext : handleSubmit}
                  disabled={!submitted && !selected}
                  className="cq-btn cq-btn-primary"
                >
                  {submitted
                    ? lives <= 0
                      ? 'See debrief'
                      : idx + 1 >= questions.length
                        ? 'Finish mission'
                        : 'Next question'
                    : 'Submit answer'}
                  <span aria-hidden>→</span>
                </button>
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
                  {submitted ? 'Enter ↵ to continue' : 'Select A–D · Enter ↵ to submit'}
                </span>
                <span className="md:hidden">
                  <button
                    onClick={() => setShowHint(s => !s)}
                    className="cq-btn cq-btn-ghost !px-4 !py-2.5 !text-[9px]"
                  >
                    {showHint ? 'Hide hint' : 'Hint'}
                  </button>
                </span>
                <span className="ml-auto hidden font-mono text-[9px] uppercase tracking-widest text-muted sm:block">
                  {optionIds.length} options
                </span>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  /* ── RESULTS ───────────────────────────────────── */
  if (phase === 'results') {
    const xpGained = correctCount * DIFFICULTY_INFO.find(d => d.id === difficulty)!.xp;
    return (
      <>
        <Confetti />
        <div className="min-h-screen">
          <header className="border-b border-line">
            <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-ok">
                ● Debrief
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                Sector {String(level.id).padStart(2, '0')}
              </span>
            </div>
          </header>

          <main className="mx-auto max-w-4xl px-5 py-12 md:py-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
                Mission complete
              </p>
              <h1 className="mt-3 font-display text-[clamp(2.2rem,7vw,4rem)] font-black leading-[0.95]">
                SECTOR
                <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  DECRYPTED.
                </span>
              </h1>

              <div className="mt-10 grid gap-4 md:grid-cols-[1.2fr_1fr]">
                <div className="cq-panel cq-cut relative overflow-hidden p-6 md:p-8">
                  <div className="cq-scan" />
                  <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted">
                    Final score
                  </p>
                  <div className="mt-1 font-display text-6xl font-black leading-none text-fg">
                    {score}
                  </div>
                  <div className="mt-6 grid grid-cols-3 divide-x divide-line border-t border-line pt-4">
                    {[
                      ['Accuracy', `${accuracy}%`],
                      ['Correct', `${correctCount}/${questions.length}`],
                      ['Best streak', maxStreak],
                    ].map(([k, v]) => (
                      <div key={k} className="px-3 first:pl-0">
                        <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted">
                          {k}
                        </div>
                        <div className="font-display text-lg font-bold">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="cq-panel p-6">
                  <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted">
                    Rewards
                  </p>
                  <ul className="mt-3 space-y-3 text-[13px]">
                    <li className="flex items-center justify-between border-b border-line pb-2">
                      <span className="text-muted">XP earned</span>
                      <span className="font-display font-bold text-accent">+{xpGained}</span>
                    </li>
                    {perfect && (
                      <li className="flex items-center justify-between border-b border-line pb-2">
                        <span className="text-muted">Perfect bonus</span>
                        <span className="font-display font-bold text-accent">+25</span>
                      </li>
                    )}
                    <li className="flex items-center justify-between border-b border-line pb-2">
                      <span className="text-muted">Badge</span>
                      <span className="font-display text-[11px] font-bold">
                        {level.title}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-muted">Network progress</span>
                      <span className="font-display text-[11px] font-bold">
                        {Math.round(((level.id) / 15) * 100)}%
                      </span>
                    </li>
                  </ul>
                  {wrongCount > 0 && (
                    <p className="mt-4 font-mono text-[10px] leading-relaxed text-muted">
                      {wrongCount} signal{wrongCount > 1 ? 's' : ''} missed. Replay deals a fresh
                      set of questions.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {levelId < 15 ? (
                  <button
                    onClick={() => router.push(`/play/${levelId + 1}`)}
                    className="cq-btn cq-btn-primary"
                  >
                    Next sector <span aria-hidden>→</span>
                  </button>
                ) : (
                  <button onClick={() => router.push('/dashboard')} className="cq-btn cq-btn-primary">
                    🏆 Champion — return to console
                  </button>
                )}
                <button onClick={startAttempt} className="cq-btn cq-btn-ghost">
                  Replay sector
                </button>
                <button onClick={() => router.push('/dashboard')} className="cq-btn cq-btn-ghost">
                  Console
                </button>
              </div>
            </motion.div>
          </main>
        </div>
      </>
    );
  }

  /* ── GAME OVER ─────────────────────────────────── */
  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-bad">
            ● Connection lost
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            Sector {String(level.id).padStart(2, '0')}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bad">Mission failed</p>
        <h1 className="mt-3 font-display text-[clamp(2.2rem,7vw,4rem)] font-black leading-[0.95]">
          LIVES
          <br />
          <span className="text-bad">DEPLETED.</span>
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
          You burned through all three lives. Nothing is lost — the retry shuffles a brand new
          set of questions from this sector.
        </p>

        <div className="mt-9 grid max-w-lg grid-cols-3 divide-x divide-line border-y border-line">
          {[
            ['Score', score],
            ['Correct', `${correctCount}/${questions.length}`],
            ['Accuracy', `${accuracy}%`],
          ].map(([k, v]) => (
            <div key={k} className="px-4 py-4 first:pl-0">
              <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted">{k}</div>
              <div className="font-display text-xl font-bold">{v}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={startAttempt} className="cq-btn cq-btn-primary">
            Retry sector <span aria-hidden>→</span>
          </button>
          <button onClick={() => router.push('/dashboard')} className="cq-btn cq-btn-ghost">
            Console
          </button>
        </div>
      </main>
    </div>
  );
}

export default function PlayClient() {
  return <PlayPage />;
}
