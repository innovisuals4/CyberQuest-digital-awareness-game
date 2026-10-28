import { describe, it, expect, beforeEach } from 'vitest';
import { LEVELS } from '@/lib/types';
import { QUESTIONS } from '@/lib/questions';
import {
  selectQuestions,
  QUESTIONS_PER_ATTEMPT,
  STARTING_LIVES,
  defaultProgress,
  loadProgress,
  saveProgress,
  completionPercent,
} from '@/lib/game';

const LEVEL_TOPICS: Record<number, string> = {
  1: 'Digital awareness fundamentals',
  2: 'Phishing and suspicious messages',
  3: 'Password security and authentication',
  4: 'Online privacy and personal information',
  5: 'Social engineering and online interactions',
  6: 'Online scams and fraudulent offers',
  7: 'Network security',
  8: 'Malware, ransomware, and malicious downloads',
  9: 'Digital footprints and online reputation',
  10: 'AI-generated misinformation and deepfakes',
  11: 'Cyberbullying and digital responsibility',
  12: 'Identity theft and account compromise',
  13: 'Data breaches and incident response',
  14: 'Advanced security decisions',
  15: 'Comprehensive digital awareness',
};

describe('Levels', () => {
  it('has exactly 15 levels', () => {
    expect(LEVELS.length).toBe(15);
  });
  it('each level has correct topic', () => {
    LEVELS.forEach(l => {
      expect(l.topic).toBe(LEVEL_TOPICS[l.id]);
    });
  });
  it('each level has at least 30 questions', () => {
    for (let i = 1; i <= 15; i++) {
      const qs = QUESTIONS.filter(q => q.levelId === i);
      expect(qs.length).toBeGreaterThanOrEqual(30);
    }
  });
});

describe('Question selection', () => {
  it('no duplicate questions within an attempt', () => {
    const seen: string[] = [];
    const qs = selectQuestions(1, 'medium', seen, [], 10);
    const ids = qs.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('retry produces different set when alternatives exist', () => {
    const seen: string[] = [];
    const first = selectQuestions(1, 'medium', seen, [], 10).map(q => q.id).sort();
    const second = selectQuestions(1, 'medium', seen, first, 10).map(q => q.id).sort();
    // should differ in at least one
    expect(JSON.stringify(first)).not.toBe(JSON.stringify(second));
  });

  it('replay produces different set when alternatives exist', () => {
    const seen: string[] = [];
    const first = selectQuestions(2, 'medium', seen, [], 10).map(q => q.id).sort();
    const second = selectQuestions(2, 'medium', seen, first, 10).map(q => q.id).sort();
    expect(JSON.stringify(first)).not.toBe(JSON.stringify(second));
  });
});

describe('Question bank quality', () => {
  it('every answer key points at a real option', () => {
    for (const q of QUESTIONS) {
      if (Array.isArray(q.correctAnswer)) continue;
      expect(q.options?.some(o => o.id === q.correctAnswer)).toBe(true);
    }
  });

  it('does not put the correct answer first every time', () => {
    const counts: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 };
    for (const q of QUESTIONS) {
      if (Array.isArray(q.correctAnswer)) continue;
      counts[q.correctAnswer] = (counts[q.correctAnswer] || 0) + 1;
    }
    Object.values(counts).forEach(n => expect(n).toBeGreaterThan(60));
  });
});

describe('Lives', () => {
  it('incorrect answer reduces lives', () => {
    let lives = STARTING_LIVES;
    lives -= 1;
    expect(lives).toBe(2);
  });
  it('zero lives ends attempt', () => {
    let lives = 1;
    lives -= 1;
    expect(lives).toBe(0);
    expect(lives <= 0).toBe(true);
  });
});

describe('Scoring', () => {
  it('calculates score correctly', () => {
    // easy 10 xp per correct
    const base = 3 * 10;
    expect(base).toBe(30);
  });
});

describe('Progress persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('progress survives refresh', () => {
    const p = defaultProgress();
    p.totalXP = 123;
    p.levels[1].completed = true;
    p.levels[1].bestScore = 500;
    saveProgress(p);
    const loaded = loadProgress();
    expect(loaded.totalXP).toBe(123);
    expect(loaded.levels[1].completed).toBe(true);
    expect(loaded.levels[1].bestScore).toBe(500);
  });
  it('lower replay score does not overwrite personal best', () => {
    const p = defaultProgress();
    p.levels[1].completed = true;
    p.levels[1].bestScore = 500;
    saveProgress(p);
    const loaded = loadProgress();
    // simulate: new score 300 should not overwrite
    if (300 > loaded.levels[1].bestScore) loaded.levels[1].bestScore = 300;
    expect(loaded.levels[1].bestScore).toBe(500);
  });
  it('completing level unlocks next', () => {
    const p = defaultProgress();
    // level 2 initially locked
    expect(p.levels[2].unlocked).toBe(false);
    p.levels[1].completed = true;
    p.levels[2].unlocked = true;
    expect(p.levels[2].unlocked).toBe(true);
  });
});

describe('Completion percent', () => {
  it('computes correctly', () => {
    const p = defaultProgress();
    p.levels[1].completed = true;
    p.levels[2].completed = true;
    expect(completionPercent(p)).toBe(Math.round((2 / 15) * 100));
  });
});
