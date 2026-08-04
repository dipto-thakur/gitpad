// file: components/profile/stat-tile.tsx
'use client';

import { Skeleton } from '@/components/ui/skeleton';
import type { ProfileStats } from '@/actions/profile';

export type StatsState = 'loading' | 'error' | ProfileStats;

export function StatTile({
  label,
  state,
  pick,
  suffix,
}: {
  label: string;
  state: StatsState;
  pick: (s: ProfileStats) => number;
  suffix?: (value: number) => string;
}) {
  const loading = state === 'loading';
  const value = state !== 'loading' && state !== 'error' ? pick(state) : null;

  return (
    <div className="flex-1 rounded-xl  bg-zinc-100/60 px-3.5 py-3 dark:border-zinc-800/80 dark:bg-zinc-900/60">
      {loading ? (
        <Skeleton className="h-6 w-12" />
      ) : (
        <p className="font-mono text-[19px] font-medium tracking-tight text-zinc-800 dark:text-zinc-200">
          {value === null ? '—' : `${value}${suffix ? suffix(value) : ''}`}
        </p>
      )}
      <p className="mt-0.5 text-[11.5px] leading-tight text-zinc-400 dark:text-zinc-500">{label}</p>
    </div>
  );
}