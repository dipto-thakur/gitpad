// file: components/theme-toggle.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'framer-motion';
import { RiMoonFill, RiSunFill } from 'react-icons/ri';

/**
 * Single icon button, not a switch — tapping toggles the theme and the
 * icon cross-fades/rotates to reflect whichever mode is now active
 * (matches the icon-button pattern used elsewhere in the header, e.g.
 * the old back-button/options-menu triggers, rather than introducing a
 * different control shape just for this one action).
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
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-zinc-100 dark:text-muted-foreground dark:hover:bg-zinc-900 dark:hover:text-zinc-100 dark:active:bg-zinc-900"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex"
          >
            <RiMoonFill className="h-[17px] w-[17px]" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex text-amber-500"
          >
            <RiSunFill className="h-[17px] w-[17px]" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}