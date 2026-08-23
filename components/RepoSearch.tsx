// file: components/RepoSearch.tsx
'use client';

import { useMemo, useState } from 'react';
import { useRepoLists } from '@/hooks/useRepoLists';
import { SearchField } from '@/components/RepoSearch/SearchField';
import { RepoListSection } from '@/components/RepoSearch/RepoListSection';
import { NoResults } from '@/components/RepoSearch/NoResults';
import type { RepoSummary } from '@/types';

export function RepoSearch({ repos }: { repos: RepoSummary[] }) {
  const [query, setQuery] = useState('');
  const { favorites, recents, toggleFavorite, recordRecent } = useRepoLists();

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

  const recentRepos = useMemo(
    () =>
      recents
        .map((fullName) => repos.find((r) => r.fullName === fullName))
        .filter((r): r is RepoSummary => Boolean(r))
        .slice(0, 5),
    [repos, recents],
  );

  return (
    <div className="flex flex-col gap-6">
      <SearchField value={query} onChange={setQuery} />

      {recentRepos.length > 0 && !query && (
        <RepoListSection
          title="Recent"
          repos={recentRepos}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onOpen={recordRecent}
        />
      )}

      {filtered.length === 0 ? (
        <NoResults query={query} />
      ) : (
        <RepoListSection
          title="All repositories"
          count={filtered.length}
          repos={filtered}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onOpen={recordRecent}
        />
      )}
    </div>
  );
}