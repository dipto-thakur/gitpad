// file: components/ui/inline-banner.tsx
'use client';

import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InlineBanner({
  variant,
  children,
  className,
}: {
  variant: 'error' | 'success';
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13.5px] leading-snug',
        variant === 'error'
          ? 'border-red-200/80 bg-red-50/80 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400'
          : 'border-emerald-200/80 bg-emerald-50/80 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400',
        className,
      )}
    >
      {variant === 'error' ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
      )}
      <span className="min-w-0 flex-1">{children}</span>
    </motion.div>
  );
}