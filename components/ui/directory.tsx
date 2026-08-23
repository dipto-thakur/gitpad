// file: components/ui/directory.tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Live breadcrumb reflecting the currently active folder in FileBrowser's
 * tree — reads the same `at`/`open` URL params useOpenDirs writes to, so
 * it updates on every row/subrow click without any prop drilling.
 *
 * Beyond 2 levels deep, middle segments collapse into a "…" dropdown
 * instead of scrolling/truncating — root and the current folder stay
 * visible and tappable at all times, every ancestor is still one tap
 * away via the dropdown, and nothing is ever cut off on narrow screens.
 */

export function Directory({ owner, repo }: { owner: string; repo: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activePath = searchParams.get('at') ?? '';
  const segments = activePath ? activePath.split('/').filter(Boolean) : [];

  function navigateTo(depth: number) {
    const targetPath = segments.slice(0, depth).join('/');
    const params = new URLSearchParams(searchParams.toString());

    if (depth === 0) {
      params.delete('at');
      params.delete('open');
    } else {
      params.set('at', targetPath);
      const ancestors = segments.slice(0, depth).map((_, i) => segments.slice(0, i + 1).join('/'));
      params.set('open', ancestors.join(','));
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // Collapse everything except the last segment once path is deep enough
  // that showing it all would crowd/overflow a mobile header.
  const COLLAPSE_THRESHOLD = 2;
  const shouldCollapse = segments.length > COLLAPSE_THRESHOLD;
  const hiddenSegments = shouldCollapse ? segments.slice(0, -1) : [];
  const visibleSegments = shouldCollapse ? segments.slice(-1) : segments;
  const visibleStartDepth = shouldCollapse ? segments.length - 1 : 0;

  return (
    <nav aria-label="Current folder" className="flex min-w-0 items-center gap-1 text-[12px] leading-none">
      <button
        type="button"
        onClick={() => navigateTo(0)}
        className="shrink-0 truncate text-zinc-400 transition-colors hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200"
      >
        {owner}/{repo}
      </button>

      {segments.length > 0 && (
        <ChevronRight className="h-3 w-3 shrink-0 text-zinc-300 dark:text-zinc-700" strokeWidth={2} />
      )}

      {shouldCollapse && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Show ${hiddenSegments.length} parent folders`}
                className="flex h-6 shrink-0 items-center rounded-md px-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {hiddenSegments.map((seg, i) => (
                <DropdownMenuItem key={i} onSelect={() => navigateTo(i + 1)}>
                  <span className="font-mono">{seg}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <ChevronRight className="h-3 w-3 shrink-0 text-zinc-300 dark:text-zinc-700" strokeWidth={2} />
        </>
      )}

      {visibleSegments.map((seg, i) => {
        const depth = visibleStartDepth + i + 1;
        const isLast = depth === segments.length;
        return (
          <span key={depth} className="flex min-w-0 items-center gap-1">
            <button
              type="button"
              onClick={() => navigateTo(depth)}
              disabled={isLast}
              className={
                isLast
                  ? 'min-w-0 truncate font-mono font-medium text-zinc-700 dark:text-zinc-200'
                  : 'min-w-0 truncate font-mono text-zinc-400 transition-colors hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-200'
              }
            >
              {seg}
            </button>
            {!isLast && (
              <ChevronRight className="h-3 w-3 shrink-0 text-zinc-300 dark:text-zinc-700" strokeWidth={2} />
            )}
          </span>
        );
      })}
    </nav>
  );
}