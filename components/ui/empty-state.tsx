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
        'flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-zinc-200 px-6 py-14 text-center dark:border-zinc-800',
        className,
      )}
    >
      {icon && (
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500 [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </span>
      )}

      <p className="text-[14.5px] font-medium text-zinc-700 dark:text-zinc-200">{title}</p>

      {description && (
        <p className="mt-1 max-w-[280px] text-[13px] leading-snug text-zinc-400 dark:text-zinc-500">
          {description}
        </p>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="mt-5 flex items-center gap-2">
          {primaryAction && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.12 }}
              onClick={primaryAction.onClick}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 text-[13px] font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {primaryAction.icon && <span className="[&>svg]:h-[15px] [&>svg]:w-[15px]">{primaryAction.icon}</span>}
              {primaryAction.label}
            </motion.button>
          )}

          {secondaryAction && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.12 }}
              onClick={secondaryAction.onClick}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200/80 px-3.5 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
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