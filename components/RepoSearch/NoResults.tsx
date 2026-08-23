// file: components/RepoSearch/NoResults.tsx
'use client';

import { SearchX } from 'lucide-react';

export function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-200 py-14 text-center dark:border-zinc-800">
      <SearchX className="h-6 w-6 text-zinc-300 dark:text-zinc-700" strokeWidth={1.5} />
      <p className="text-[14px] text-zinc-500 dark:text-zinc-400">No repositories match</p>
      <p className="max-w-[220px] truncate font-mono text-[13px] text-zinc-400 dark:text-zinc-600">
        &ldquo;{query}&rdquo;
      </p>
    </div>
  );
}