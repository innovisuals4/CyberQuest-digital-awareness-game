'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { Question } from '@/lib/types';

export interface GameContextValue {
  levelId: number | null;
  topic: string;
  question: Question | null;
  difficulty: string;
  answerSubmitted: boolean;
  correctAnswer: string | null;
  setContext: (ctx: Partial<GameContextValue>) => void;
}

const GameContext = createContext<GameContextValue>({
  levelId: null,
  topic: '',
  question: null,
  difficulty: 'medium',
  answerSubmitted: false,
  correctAnswer: null,
  setContext: () => {},
});

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameContextValue>({
    levelId: null,
    topic: '',
    question: null,
    difficulty: 'medium',
    answerSubmitted: false,
    correctAnswer: null,
    setContext: (ctx) => setState(prev => ({ ...prev, ...ctx })),
  });
  return <GameContext.Provider value={state}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  return useContext(GameContext);
}
