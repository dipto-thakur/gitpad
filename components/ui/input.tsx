// file: components/ui/input.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-xl border border-zinc-200/80 bg-white px-3.5 text-[14.5px] text-zinc-800',
        'placeholder:text-zinc-400',
        'shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:border-zinc-300 focus-visible:ring-1 focus-visible:ring-zinc-300',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder:text-zinc-600',
        'dark:focus-visible:border-zinc-700 dark:focus-visible:ring-zinc-700',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';