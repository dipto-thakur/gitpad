// file: components/ui/badge.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

const BASE =
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors';

const VARIANTS = {
  default: 'border-border bg-muted text-muted-foreground',
  outline: 'border-border bg-transparent text-foreground',
  subtle: 'border-transparent bg-muted/50 text-muted-foreground',
} as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof VARIANTS;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return <div className={cn(BASE, VARIANTS[variant], className)} {...props} />;
}