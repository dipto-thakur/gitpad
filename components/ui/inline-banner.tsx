// file: components/ui/inline-banner.tsx
'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Check } from 'lucide-react';
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
        'flex items-start gap-2 rounded border px-3 py-2.5 text-sm',
        variant === 'error'
          ? 'border-destructive/30 text-destructive'
          : 'border-border text-foreground',
        className,
      )}
    >
      {variant === 'error' ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <Check className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{children}</span>
    </motion.div>
  );
}