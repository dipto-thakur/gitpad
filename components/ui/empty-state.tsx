// file: components/ui/empty-state.tsx
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type EmptyStateAction = {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
};

export function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-zinc-200 px-6 py-12 text-center dark:border-zinc-800',
        className,
      )}
    >
      {icon && (
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-zinc-100 to-zinc-100/50 text-zinc-400 dark:from-zinc-900 dark:to-zinc-900/50 dark:text-zinc-500 [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </span>
      )}

      <p className="text-[14.5px] font-medium tracking-tight text-zinc-700 dark:text-zinc-200">{title}</p>

      {description && (
        <p className="mt-1 max-w-[260px] text-[13px] leading-relaxed text-zinc-400 dark:text-zinc-500">
          {description}
        </p>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="mt-5 flex w-full max-w-[280px] flex-col items-stretch gap-2 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
          {primaryAction && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.1 }}
              onClick={primaryAction.onClick}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 text-[13px] font-medium text-zinc-50 transition-colors active:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-300 sm:h-9"
            >
              {primaryAction.icon && <span className="[&>svg]:h-[15px] [&>svg]:w-[15px]">{primaryAction.icon}</span>}
              {primaryAction.label}
            </motion.button>
          )}

          {secondaryAction && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.1 }}
              onClick={secondaryAction.onClick}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-zinc-200/80 px-4 text-[13px] font-medium text-zinc-600 transition-colors active:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:active:bg-zinc-900 sm:h-9"
            >
              {secondaryAction.icon && <span className="[&>svg]:h-[15px] [&>svg]:w-[15px]">{secondaryAction.icon}</span>}
              {secondaryAction.label}
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}