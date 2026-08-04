// file: components/ui/header.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type HeaderProps = {
  /** Href for the back button. Omit to hide it. */
  backHref?: string;
  backLabel?: string;

  /** Primary line — file name, repo name, etc. */
  title: string;
  /** Secondary line — path, branch, owner. Optional. */
  subtitle?: string;
  /** Use monospace for title (file/repo names). Default true. */
  mono?: boolean;

  /** Right-aligned slot — actions menu, branch switcher, etc. */
  actions?: React.ReactNode;

  className?: string;
};

export function Header({
  backHref,
  backLabel = 'Back',
  title,
  subtitle,
  mono = true,
  actions,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex items-center gap-2 border-b border-zinc-200/80 bg-zinc-50/80 px-4 py-2.5 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80 sm:px-10',
        className,
      )}
    >
      {backHref && (
        <Link
          href={backHref}
          aria-label={backLabel}
          className="flex h-10 shrink-0 items-center gap-1 rounded-lg px-2 -ml-2 text-[13.5px] font-medium text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          <span className="hidden sm:inline">{backLabel}</span>
        </Link>
      )}

      <div className="min-w-0 flex-1 px-0.5">
        <p
          className={cn(
            'truncate text-[13.5px] font-medium tracking-tight text-zinc-800 dark:text-zinc-200',
            mono && 'font-mono',
          )}
        >
          {title}
        </p>
        {subtitle && (
          <p className="truncate text-[11.5px] leading-tight text-zinc-400 dark:text-zinc-500">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
    </header>
  );
}