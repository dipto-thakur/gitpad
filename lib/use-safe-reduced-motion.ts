// file: lib/use-safe-reduced-motion.ts
'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * framer-motion's useReducedMotion() reads window.matchMedia synchronously
 * during render, not inside an effect. On the server `window` doesn't
 * exist, so it returns null; on the client it resolves immediately on
 * first paint. Whenever a visitor's OS actually has reduced motion on,
 * server and client disagree on that very first render — a hydration
 * mismatch, and literally the `typeof window !== 'undefined'` branching
 * pattern React's own warning names.
 *
 * Standard Next.js-safe fix: report "motion enabled" for both the server
 * render and the client's first paint (guaranteed identical, since effects
 * haven't run yet), then pick up the real preference after mount.
 */
export function useSafeReducedMotion(): boolean {
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);

  return mounted ? Boolean(reduceMotion) : false;
}