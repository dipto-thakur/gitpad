// file: components/ui/textarea.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex w-full rounded border border-border bg-background px-3 py-3 text-[15px] leading-relaxed text-foreground',
        'placeholder:text-muted-foreground',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';