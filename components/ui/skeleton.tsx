// file: components/ui/skeleton.tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-md bg-muted bg-muted', className)}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: 'easeInOut',
          repeatDelay: 0.2,
        }}
      />
    </div>
  );
}