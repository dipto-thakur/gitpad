// file: components/SignOutButton.tsx
'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SignOutButton() {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="rounded-xl border border-red-200/70 bg-red-50/50 p-3.5 dark:border-red-900/40 dark:bg-red-950/20">
      <p className="mb-2.5 text-[11.5px] font-medium uppercase tracking-wider text-red-400 dark:text-red-500/80">
        Danger zone
      </p>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground dark:text-muted-foreground">
          Sign out of your GitHub session on this device.
        </p>

        <AnimatePresence mode="wait" initial={false}>
          {!confirming ? (
            <motion.button
              key="prompt"
              type="button"
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.12 }}
              onClick={() => setConfirming(true)}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-100/80 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              <LogOut className="h-[15px] w-[15px]" strokeWidth={2} />
              Sign out
            </motion.button>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.15 }}
              className="flex shrink-0 items-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="h-9 rounded-lg px-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Cancel
              </button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.12 }}
                onClick={() => signOut({ callbackUrl: '/' })}
                className={cn(
                  'h-9 rounded-lg bg-red-600 px-3 text-[13px] font-medium text-white transition-colors',
                  'hover:bg-red-700 active:bg-red-800',
                )}
              >
                Confirm
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}