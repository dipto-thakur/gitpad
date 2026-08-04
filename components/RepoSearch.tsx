// file: components/RepoSearch.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Star, FolderGit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { RowLink } from '@/components/ui/row';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { RepoSummary } from '@/types';

const FAVORITES_KEY = 'gh-doc-editor:favorites';
const RECENTS_KEY = 'gh-doc-editor:recents';

export function RepoSearch({ repos }: { repos: RepoSummary[] }) {
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]'));
      setRecents(JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]'));
    } catch {
      // ignore malformed local storage
    }
  }, []);

  function toggleFavorite(fullName: string) {
    setFavorites((prev) => {
      const next = prev.includes(fullName) ? prev.filter((f) => f !== fullName) : [...prev, fullName];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }

  function recordRecent(fullName: string) {
    try {
      const current: string[] = JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]');
      const next = [fullName, ...current.filter((f) => f !== fullName)].slice(0, 8);
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? repos.filter((r) => r.fullName.toLowerCase().includes(q)) : repos;
    return [...list].sort((a, b) => {
      const af = favorites.includes(a.fullName) ? 0 : 1;
      const bf = favorites.includes(b.fullName) ? 0 : 1;
      if (af !== bf) return af - bf;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [repos, query, favorites]);

  const recentRepos = repos.filter((r) => recents.includes(r.fullName)).slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search repositories"
        aria-label="Search repositories"
        className="h-11 rounded-xl border-zinc-200/80 bg-white text-[14.5px] placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:placeholder:text-zinc-600 dark:focus-visible:ring-zinc-700"
      />

      {recentRepos.length > 0 && !query && (
        <section>
          <h2 className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Recent
          </h2>
          <ul className="flex flex-col gap-0.5 rounded-xl border border-zinc-200/80 bg-zinc-100/60 p-1 dark:border-zinc-800/80 dark:bg-zinc-900/60">
            {recentRepos.map((r) => (
              <RepoRow
                key={r.id}
                repo={r}
                favorite={favorites.includes(r.fullName)}
                onToggleFavorite={toggleFavorite}
                onOpen={recordRecent}
              />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          All repositories
        </h2>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-zinc-200 py-14 text-center dark:border-zinc-800">
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400">
              No repositories match
            </p>
            <p className="max-w-[220px] truncate font-mono text-[13px] text-zinc-400 dark:text-zinc-600">
              "{query}"
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5 rounded-xl border border-zinc-200/80 bg-zinc-100/60 p-1 dark:border-zinc-800/80 dark:bg-zinc-900/60">
            {filtered.map((r) => (
              <RepoRow
                key={r.id}
                repo={r}
                favorite={favorites.includes(r.fullName)}
                onToggleFavorite={toggleFavorite}
                onOpen={recordRecent}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function RepoRow({
  repo,
  favorite,
  onToggleFavorite,
  onOpen,
}: {
  repo: RepoSummary;
  favorite: boolean;
  onToggleFavorite: (fullName: string) => void;
  onOpen: (fullName: string) => void;
}) {
  return (
    <li className="flex min-w-0 items-center gap-0.5 rounded-lg transition-colors hover:bg-white dark:hover:bg-zinc-800/60">
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={favorite}
        onClick={() => onToggleFavorite(repo.fullName)}
        className="flex h-11 w-9 shrink-0 items-center justify-center text-zinc-300 transition-colors hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400"
      >
        <Star
          className={cn(
            'h-4 w-4 transition-colors',
            favorite && 'fill-amber-400 text-amber-400',
          )}
        />
      </motion.button>

      <RowLink
        href={`/repos/${repo.owner}/${repo.name}`}
        onClick={() => onOpen(repo.fullName)}
        icon={<FolderGit2 className="h-[17px] w-[17px] shrink-0" />}
        label={repo.name}
        meta={repo.private ? 'Private' : 'Public'}
        chevron
        className="min-w-0 flex-1 [&_[data-row-label]]:truncate [&_[data-row-label]]:min-w-0"
      />
    </li>
  );
}