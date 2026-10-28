'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

/** Respect the OS "reduce motion" setting for every Framer animation. */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
