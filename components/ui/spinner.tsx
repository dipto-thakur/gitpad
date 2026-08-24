// file: components/ui/spinner.tsx
'use client';

import { motion } from 'framer-motion';
import { BrandMark } from '@/components/icons/BrandMark';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg';
}

const SIZE_MAP = {
  sm: 'h-4 w-auto',
  default: 'h-6 w-auto',
  lg: 'h-9 w-auto',
} as const;

/**
 * BrandMark-as-loader — a soft breathing pulse (opacity + subtle scale) on
 * the app's own logo instead of generic dots/spinner. currentColor means
 * it inherits theme automatically, same as every other BrandMark usage.
 * Respects prefers-reduced-motion by dropping the scale/opacity animation
 * to a static, slightly-dimmed mark instead.
 */
export function Spinner({ size = 'default', className, ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <motion.div
        animate={{ opacity: [0.35, 1, 0.35], scale: [0.96, 1, 0.96] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="motion-reduce:!animate-none motion-reduce:opacity-60"
      >
        <BrandMark className={cn(SIZE_MAP[size], 'text-zinc-900 dark:text-zinc-100')} />
      </motion.div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}