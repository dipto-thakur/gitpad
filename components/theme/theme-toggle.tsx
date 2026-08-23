// file: components/theme-toggle.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { RiMoonFill, RiSunFill } from 'react-icons/ri';
import { cn } from '@/lib/utils';

/**
 * Horizontal on/off switch (iOS-style), not an icon button — the knob
 * slides between two ends of a pill track, with the active mode's icon
 * shown on the knob itself. Track dims/tints slightly by mode so the
 * whole control communicates state even at a glance, not just the knob
 * position.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid a hydration mismatch: resolvedTheme is only known client-side.
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative flex h-7 w-[38px] shrink-0 items-center rounded-full px-[3px] transition-colors duration-200',
        isDark ? 'bg-zinc-800' : 'bg-zinc-200',
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={cn(
          'flex h-[20px] w-[20px] items-center justify-center rounded-full bg-white shadow-sm dark:bg-zinc-100',
          isDark ? 'ml-auto' : 'ml-0',
        )}
      >
        {isDark ? (
          <RiMoonFill className="h-3.5 w-3.5 text-zinc-700" />
        ) : (
          <RiSunFill className="h-3.5 w-3.5 text-amber-500" />
        )}
      </motion.span>
    </button>
  );
}