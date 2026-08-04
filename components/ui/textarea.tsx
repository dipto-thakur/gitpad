// file: components/ui/textarea.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex w-full border border-zinc-200/80 bg-zinc-100/60 px-7 py-3.5 text-[14px] leading-relaxed text-foreground',
        'shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]',
        'placeholder:text-muted-foreground',
        'transition-colors duration-150',
        'focus:border-zinc-300 focus:bg-zinc-100/90',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:focus:border-zinc-700 dark:focus:bg-zinc-900/90',
        'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-300/60 dark:scrollbar-thumb-zinc-700/60 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300/60 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700/60 [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-padding hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400/60 dark:hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600/60',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';