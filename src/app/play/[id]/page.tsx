import { Suspense } from 'react';
import PlayClient from './PlayClient';
import { LEVELS } from '@/lib/types';

/**
 * Static export: pre-render one page per sector (1–15) so the site works
 * on GitHub Pages, which can only serve static files.
 */
export function generateStaticParams() {
  return LEVELS.map(l => ({ id: String(l.id) }));
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
          Loading mission<span className="blink">_</span>
        </div>
      }
    >
      <PlayClient />
    </Suspense>
  );
}
