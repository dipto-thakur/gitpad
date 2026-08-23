// file: components/ui/header.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { BrandMark } from '@/components/icons/BrandMark';
import type { ReactNode } from 'react';

type HeaderProps = {
  /** Optional extra action(s) rendered between BrandMark and ThemeToggle — e.g. Profile. */
  actions?: ReactNode;
  className?: string;
  collapsed?: boolean;
};

/**
 * Universal top bar — BrandMark left, page-specific actions (typically
 * Profile) + ThemeToggle right. No title/back/branch here anymore; those
 * are page-specific and now live in each page's own content below this
 * bar (see RepoPage, EditFilePage) rather than being crammed into a
 * one-size-fits-all header.
 */
export function Header({ actions, className, collapsed = false }: HeaderProps) {
  const headerRef = React.useRef<HTMLElement>(null);
  const [height, setHeight] = React.useState(0);

  React.useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const entry = entries[0];
      if (entry) setHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'sticky top-0  z-20 flex items-center justify-between gap-1.5',
          'border-b border-zinc-200/80 bg-zinc-50/80 backdrop-blur-md',
          'px-3 py-2.5 sm:px-10 sm:py-2.5',
          'pt-[max(0.5rem,env(safe-area-inset-top))]',
          'dark:border-zinc-800/80 dark:bg-zinc-950/80',
          className,
        )}
      >
        <BrandMark className="h-7 w-auto shrink-0 text-foreground sm:h-6" />

        <div className="flex shrink-0 items-center gap-1">
       
          <ThemeToggle />
             {actions}
        </div>
      </header>

      {/*<div aria-hidden="true" style={{ height }} />*/}
    </>
  );
}