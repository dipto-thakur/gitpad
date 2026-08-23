// file: components/RepoSearch/RepoListSection.tsx
'use client';

import { RepoRow } from './RepoRow';
import type { RepoSummary } from '@/types';

/**
 * A titled group of repo rows in the shared rounded-container list style.
 * Reused for both "Recent" and "All repositories" so that container
 * markup (border, bg, padding) is defined once, not twice.
 */
export function RepoListSection({
  title,
  count,
  repos,
  favorites,
  onToggleFavorite,
  onOpen,
}: {
  title: string;
  count?: number;
  repos: RepoSummary[];
  favorites: string[];
  onToggleFavorite: (fullName: string) => void;
  onOpen: (fullName: string) => void;
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between px-1">
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {title}
        </h2>
        {typeof count === 'number' && (
          <span className="text-[11px] tabular-nums text-zinc-300 dark:text-zinc-700">{count}</span>
        )}
      </div>

      <ul className="flex flex-col gap-0.5 rounded-xl border border-zinc-200/80 bg-zinc-100/60 p-1 dark:border-zinc-800/80 dark:bg-zinc-900/40">
      {repos.map((r, i) => (
          <RepoRow
            key={r.id}
            repo={r}
            favorite={favorites.includes(r.fullName)}
            onToggleFavorite={onToggleFavorite}
            onOpen={onOpen}
            isLast={i === repos.length - 1}
          />
        ))}
      </ul>
    </section>
  );
}