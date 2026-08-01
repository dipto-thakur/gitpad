'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
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
      const next = prev.includes(fullName)
        ? prev.filter((f) => f !== fullName)
        : [...prev, fullName];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
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

  function recordRecent(fullName: string) {
    try {
      const current: string[] = JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]');
      const next = [fullName, ...current.filter((f) => f !== fullName)].slice(0, 8);
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search repositories…"
        className="mb-4 w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-fg"
      />

      {recentRepos.length > 0 && !query && (
        <div className="mb-6">
          <h2 className="mb-2 text-xs font-medium uppercase text-muted">Recent</h2>
          <ul className="space-y-1">
            {recentRepos.map((r) => (
              <RepoRow key={r.id} repo={r} onOpen={recordRecent} />
            ))}
          </ul>
        </div>
      )}

      <h2 className="mb-2 text-xs font-medium uppercase text-muted">All</h2>
      <ul className="space-y-1">
        {filtered.map((r) => (
          <li key={r.id} className="flex items-center gap-2">
            <button
              aria-label={favorites.includes(r.fullName) ? 'Unfavorite' : 'Favorite'}
              onClick={() => toggleFavorite(r.fullName)}
              className="text-sm text-muted hover:text-fg"
            >
              {favorites.includes(r.fullName) ? '★' : '☆'}
            </button>
            <RepoRow repo={r} onOpen={recordRecent} />
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-sm text-muted">No repositories match.</li>
        )}
      </ul>
    </div>
  );
}

function RepoRow({ repo, onOpen }: { repo: RepoSummary; onOpen: (fullName: string) => void }) {
  return (
    <Link
      href={`/repos/${repo.owner}/${repo.name}`}
      onClick={() => onOpen(repo.fullName)}
      className="flex flex-1 items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-gray-50"
    >
      <span>{repo.fullName}</span>
      <span className="flex items-center gap-2 text-xs text-muted">
        {repo.private ? 'Private' : 'Public'}
        <span>{repo.defaultBranch}</span>
      </span>
    </Link>
  );
}
