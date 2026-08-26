// file: components/ui/input.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-xl border border-border/80 bg-background px-3.5 text-[14.5px] text-foreground',
        'placeholder:text-muted-foreground',
        'shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:border-zinc-300 focus-visible:ring-1 focus-visible:ring-border',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'dark:border-zinc-800 dark:bg-muted text-foreground dark:placeholder:text-muted-foreground/50',
        'dark:focus-visible:border-zinc-700 dark:focus-visible:ring-zinc-700',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';