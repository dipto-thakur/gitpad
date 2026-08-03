// file: components/ui/row.tsx
'use client';

import * as React from 'react';
import Link, { type LinkProps } from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function rowClasses(destructive: boolean | undefined, className?: string) {
  return cn(
    'flex w-full min-h-12 items-center gap-3 rounded px-3 py-2.5 text-left text-sm',
    'hover:bg-muted active:bg-muted transition-colors',
    destructive ? 'text-destructive' : 'text-foreground',
    className,
  );
}

function RowContent({
  icon,
  label,
  meta,
  chevron,
}: {
  icon?: React.ReactNode;
  label: React.ReactNode;
  meta?: React.ReactNode;
  chevron?: boolean;
}) {
  return (
    <>
      {icon && <span className="shrink-0 text-muted-foreground [&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span>}
      <span className="flex-1 truncate">{label}</span>
      {meta && <span className="shrink-0 text-xs text-muted-foreground">{meta}</span>}
      {chevron && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
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

/**
 * A single tappable row: icon, label, optional trailing meta text, optional
 * chevron. This is the one repeating shape used for repos, branches, files,
 * and menu actions — prefer this over ad hoc card/list markup.
 */
export const Row = React.forwardRef<HTMLButtonElement, RowProps>(
  ({ className, icon, label, meta, chevron, destructive, ...props }, ref) => (
    <button ref={ref} type="button" className={rowClasses(destructive, className)} {...props}>
      <RowContent icon={icon} label={label} meta={meta} chevron={chevron} />
    </button>
  ),
);
Row.displayName = 'Row';

/**
 * Same visual shape as Row, but a real Next.js <Link> — used for actual
 * navigation (open repo, open file) so it gets proper <a> semantics,
 * prefetching, and middle-click/open-in-new-tab behavior for free.
 */
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
    <div className={cn('flex min-h-12 items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground', className)}>
      {icon && <span className="shrink-0 [&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span>}
      <span className="flex-1 truncate">{label}</span>
      {meta && <span className="shrink-0 text-xs">{meta}</span>}
    </div>
  );
}