// file: components/ui/button.tsx
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'default' | 'sm' | 'icon';

const baseClasses =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40';

const variantClasses: Record<ButtonVariant, string> = {
  // One primary action per screen — this is that action.
  primary: 'bg-accent text-accent-foreground hover:opacity-90',
  secondary: 'bg-surface text-foreground border border-border hover:bg-muted',
  ghost: 'text-foreground hover:bg-muted',
  destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
  link: 'text-muted-foreground hover:text-foreground underline-offset-4 hover:underline p-0 h-auto',
};

const sizeClasses: Record<ButtonSize, string> = {
  // 48px is the accessibility floor for touch targets.
  default: 'h-12 px-4',
  sm: 'h-9 px-3 text-sm',
  icon: 'h-12 w-12',
};

export interface ButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
  > {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.12 }}
      disabled={disabled}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';