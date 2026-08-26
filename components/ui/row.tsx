// file: components/ui/row.tsx
'use client';

import * as React from 'react';
import Link, { type LinkProps } from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function rowClasses(destructive: boolean | undefined, className?: string) {
  return cn(
    'flex w-full min-w-0 min-h-11 items-center gap-2.5 rounded px-2.5 py-2.5 text-left text-[13.5px]',
    'transition-colors duration-100 active:scale-[0.99]',
    'hover:bg-muted/70 active:bg-zinc-100 hover:bg-muted/50 dark:active:bg-zinc-800/70',
    destructive ? 'text-red-600 dark:text-red-400' : 'text-zinc-700 text-foreground',
    className,
  );
}

function RowContent({
  icon,
  label,
  meta,
  chevron,
  destructive,
}: {
  icon?: React.ReactNode;
  label: React.ReactNode;
  meta?: React.ReactNode;
  chevron?: boolean;
  destructive?: boolean;
}) {
  return (
    <>
      {icon && (
        <span
          className={cn(
            'flex shrink-0 items-center justify-center [&>svg]:h-[17px] [&>svg]:w-[17px]',
            destructive ? 'text-red-500/80 dark:text-red-400/80' : 'text-muted-foreground text-muted-foreground',
          )}
        >
          {icon}
        </span>
      )}
      <span data-row-label className="min-w-0 flex-1 truncate">
        {label}
      </span>
      {meta && (
        <span className="shrink-0 truncate text-[11.5px] text-muted-foreground text-muted-foreground">
          {meta}
        </span>
      )}
      {chevron && (
        <ChevronRight className="h-[15px] w-[15px] shrink-0 text-muted-foreground/50 dark:text-muted-foreground/50" strokeWidth={3} />
      )}
    </>
  );
}

interface RowProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  label: React.ReactNode;
  meta?: React.ReactNode;
  chevron?: boolean;
  destructive?: boolean;
}

export const Row = React.forwardRef<HTMLButtonElement, RowProps>(
  ({ className, icon, label, meta, chevron, destructive, ...props }, ref) => (
    <button ref={ref} type="button" className={rowClasses(destructive, className)} {...props}>
      <RowContent icon={icon} label={label} meta={meta} chevron={chevron} destructive={destructive} />
    </button>
  ),
);
Row.displayName = 'Row';


export function RowLink({
  className,
  icon,
  label,
  meta,
  chevron,
  ...props
}: LinkProps & {
  className?: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
  meta?: React.ReactNode;
  chevron?: boolean;
}) {
  return (
    <Link className={rowClasses(false, className)} {...props}>
      <RowContent icon={icon} label={label} meta={meta} chevron={chevron} />
    </Link>
  );
}

/**
 * Non-interactive variant of Row, for static rows (e.g. a disabled/binary
 * file entry) that shouldn't render as a <button>.
 */
export function StaticRow({
  className,
  icon,
  label,
  meta,
}: {
  className?: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex min-h-11 min-w-0 items-center gap-2.5 px-2.5 py-2 text-[13.5px] text-muted-foreground text-muted-foreground',
        className,
      )}
    >
      {icon && (
        <span className="flex shrink-0 items-center justify-center [&>svg]:h-[17px] [&>svg]:w-[17px]">
          {icon}
        </span>
      )}
      <span data-row-label className="min-w-0 flex-1 truncate">
        {label}
      </span>
      {meta && <span className="shrink-0 truncate text-[11.5px]">{meta}</span>}
    </div>
  );
}