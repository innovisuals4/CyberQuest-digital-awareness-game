import { QUESTIONS } from '@/lib/questions';
import { Question, LevelDef, LEVELS, Difficulty, DIFFICULTY_XP } from '@/lib/types';

export const QUESTIONS_PER_ATTEMPT = 10;
export const STARTING_LIVES = 3;

export interface LevelProgress {
  unlocked: boolean;
  completed: boolean;
  bestScore: number;
  attempts: number;
  completedAt?: number;
}

export interface PlayerProgress {
  username: string;
  totalXP: number;
  currentLevelId: number;
  levels: Record<number, LevelProgress>;
  seenQuestionIds: Record<number, string[]>;
  attemptCounts: Record<number, number>;
  badges: string[];
  lastPlayedLevelId: number | null;
  dailyChallengeDate?: string;
  dailyChallengeDone?: boolean;
  preferences: { difficulty: Difficulty; timers: boolean; reducedMotion: boolean };
  createdAt: number;
}

const STORAGE_KEY = 'cyberquest_progress_v1';
const LEGACY_KEY = 'cyberquest_progress_v1';

export function defaultProgress(): PlayerProgress {
  const levels: Record<number, LevelProgress> = {};
  LEVELS.forEach((l, idx) => {
    levels[l.id] = { unlocked: idx === 0, completed: false, bestScore: 0, attempts: 0 };
  });
  return {
    username: '',
    totalXP: 0,
    currentLevelId: 1,
    levels,
    seenQuestionIds: {},
    attemptCounts: {},
    badges: [],
    lastPlayedLevelId: null,
    preferences: { difficulty: 'medium', timers: false, reducedMotion: false },
    createdAt: Date.now(),
  };
}

/**
 * Session-only persistence: progress lives in sessionStorage, so it survives
 * reloads and navigation during the visit but is wiped when the tab or
 * browser closes. Nothing about the player is kept after they leave.
 */
export function loadProgress(): PlayerProgress {
  if (typeof window === 'undefined') return defaultProgress();
  try {
    // remove any data saved by older versions that used localStorage
    window.localStorage?.removeItem(LEGACY_KEY);

    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as PlayerProgress;
    // merge missing levels
    const base = defaultProgress();
    const merged: PlayerProgress = { ...base, ...parsed };
    LEVELS.forEach(l => {
      if (!merged.levels[l.id]) merged.levels[l.id] = { unlocked: l.id === 1, completed: false, bestScore: 0, attempts: 0 };
    });
    if (!merged.seenQuestionIds) merged.seenQuestionIds = {};
    if (!merged.badges) merged.badges = [];
    if (!merged.preferences) merged.preferences = base.preferences;
    return merged;
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(p: PlayerProgress) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable (private mode / quota) — play without saving */
  }
}

/** Wipe the session immediately (used on sign-out style exits). */
export function clearProgress() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DIFF_RANK: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3, expert: 4 };

export function selectQuestions(
  levelId: number,
  selectedDifficulty: Difficulty,
  seenIds: string[],
  recentIds: string[],
  count: number = QUESTIONS_PER_ATTEMPT
): Question[] {
  const pool = QUESTIONS.filter(q => q.levelId === levelId);
  let candidates = pool.filter(q => DIFF_RANK[q.difficulty] <= DIFF_RANK[selectedDifficulty]);
  if (candidates.length < count) candidates = pool.slice();
  // exclude recent attempt questions
  let available = candidates.filter(q => !recentIds.includes(q.id));
  if (available.length < count) available = candidates.slice();
  const unseen = available.filter(q => !seenIds.includes(q.id));
  const seen = available.filter(q => seenIds.includes(q.id));
  const ordered = [...shuffle(unseen), ...shuffle(seen)];
  const picked: Question[] = [];
  const used = new Set<string>();
  const stems = new Set<string>();
  const stemOf = (q: Question) =>
    q.options && q.options.length
      ? q.options
          .map(o => o.text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim())
          .sort()
          .join('|')
      : q.questionText
          .toLowerCase()
          .replace(/\(scenario\s*\d+\)/g, '')
          .replace(/check\s*#?\s*\d+/g, '')
          .replace(/[^a-z]+/g, ' ')
          .trim();

  for (const q of ordered) {
    if (picked.length >= count) break;
    if (used.has(q.id)) continue;
    if (stems.has(stemOf(q))) continue;
    used.add(q.id);
    stems.add(stemOf(q));
    picked.push(q);
  }
  // fill from the rest without repeating a stem
  if (picked.length < count) {
    const rest = shuffle(pool.filter(q => !used.has(q.id)));
    for (const q of rest) {
      if (picked.length >= count) break;
      if (stems.has(stemOf(q))) continue;
      used.add(q.id);
      stems.add(stemOf(q));
      picked.push(q);
    }
  }
  // last resort: allow repeated stems so an attempt always has 10 questions
  if (picked.length < count) {
    const rest = shuffle(pool.filter(q => !used.has(q.id)));
    for (const q of rest) {
      if (picked.length >= count) break;
      used.add(q.id);
      picked.push(q);
    }
  }
  return picked;
}

export function computeScore(correct: number, total: number, difficulty: Difficulty, perfect: boolean, streak: number): number {
  const base = correct * DIFFICULTY_XP[difficulty];
  const streakBonus = streak * 2;
  const perfectBonus = perfect ? 20 : 0;
  return base + streakBonus + perfectBonus;
}

export function unlockNext(progress: PlayerProgress, levelId: number) {
  const next = levelId + 1;
  if (next <= LEVELS.length && progress.levels[next]) {
    progress.levels[next].unlocked = true;
  }
}

export function awardBadge(progress: PlayerProgress, badge: string) {
  if (!progress.badges.includes(badge)) progress.badges.push(badge);
}

export function completionPercent(progress: PlayerProgress): number {
  const done = LEVELS.filter(l => progress.levels[l.id]?.completed).length;
  return Math.round((done / LEVELS.length) * 100);
}

export function findLevel(id: number): LevelDef | undefined {
  return LEVELS.find(l => l.id === id);
}
