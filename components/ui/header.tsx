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
          'sticky top-0 z-20 flex items-center justify-between',
          'min-h-14 gap-4',
          'border-b border-zinc-200/60 bg-zinc-50/75 backdrop-blur-md',
          'px-4 py-3 sm:px-10 sm:py-3',
          'pt-[max(0.75rem,env(safe-area-inset-top))]',
          'dark:border-zinc-800/60 dark:bg-zinc-950/75',
          className,
        )}
      >
<BrandMark className="h-6 w-auto sm:h-7 lg:h-8" />
  
        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          {actions}
        </div>
      </header>
    </>
  );
}