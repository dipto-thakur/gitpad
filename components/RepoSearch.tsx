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
    <div className="flex flex-col gap-6">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search repositories"
        aria-label="Search repositories"
      />

      {recentRepos.length > 0 && !query && (
        <section>
          <h2 className="mb-1 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Recent</h2>
          <ul>
            {recentRepos.map((r) => (
              <RepoRow key={r.id} repo={r} favorite={favorites.includes(r.fullName)} onToggleFavorite={toggleFavorite} onOpen={recordRecent} />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-1 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">All</h2>
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-sm text-muted-foreground">No repositories match "{query}".</p>
        ) : (
          <ul>
            {filtered.map((r) => (
              <RepoRow key={r.id} repo={r} favorite={favorites.includes(r.fullName)} onToggleFavorite={toggleFavorite} onOpen={recordRecent} />
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
    <li className="flex items-center gap-1">
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={favorite}
        onClick={() => onToggleFavorite(repo.fullName)}
        className="flex h-12 w-9 shrink-0 items-center justify-center text-muted-foreground"
      >
        <Star className={cn('h-4 w-4', favorite && 'fill-foreground text-foreground')} />
      </motion.button>
      <RowLink
        href={`/repos/${repo.owner}/${repo.name}`}
        onClick={() => onOpen(repo.fullName)}
        icon={<FolderGit2 />}
        label={repo.name}
        meta={repo.private ? 'Private' : 'Public'}
        chevron
        className="flex-1"
      />
    </li>
  );
}