'use client';
import { useState, useEffect, useCallback } from 'react';
import { PlayerProgress, loadProgress, saveProgress } from '@/lib/game';

export function useProgress() {
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  useEffect(() => {
    setProgress(loadProgress());
  }, []);
  // persist once per state change — never inside the updater (StrictMode-safe)
  useEffect(() => {
    if (progress) saveProgress(progress);
  }, [progress]);
  const update = useCallback((fn: (p: PlayerProgress) => PlayerProgress) => {
    setProgress(prev => fn(prev ?? loadProgress()));
  }, []);
  const refresh = useCallback(() => setProgress(loadProgress()), []);
  return { progress, setProgress, update, refresh };
}
