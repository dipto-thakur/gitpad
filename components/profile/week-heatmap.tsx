// file: components/profile/week-heatmap.tsx
'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { StatsState } from '@/components/profile/stat-tile';
import type { ProfileStats } from '@/actions/profile';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function levelClass(count: number, max: number) {
  if (count === 0) return 'bg-zinc-200/70 dark:bg-zinc-800';
  const ratio = max === 0 ? 0 : count / max;
  if (ratio > 0.75) return 'bg-emerald-500 dark:bg-emerald-400';
  if (ratio > 0.5) return 'bg-emerald-500/70 dark:bg-emerald-400/70';
  if (ratio > 0.25) return 'bg-emerald-500/45 dark:bg-emerald-400/45';
  return 'bg-emerald-500/25 dark:bg-emerald-400/25';
}

export function WeekHeatmap({ state }: { state: StatsState }) {
  const loading = state === 'loading';
  const error = state === 'error';
  const days = !loading && !error ? (state as ProfileStats).last7Days : null;
  const max = days ? Math.max(...days.map((d) => d.count), 1) : 1;

  return (
    <div className="rounded-xl  bg-zinc-100/60 px-3.5 py-3  dark:bg-zinc-900/60">
      <p className="mb-2.5 text-[11.5px] leading-tight text-zinc-400 dark:text-zinc-500">Last 7 days</p>

      {loading ? (
        <div className="flex items-end gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-8 flex-1 rounded-md" />
          ))}
        </div>
      ) : error || !days ? (
        <p className="text-[13px] text-zinc-400 dark:text-zinc-600">Not available right now.</p>
      ) : (
        <div className="flex items-end gap-2">
          {days.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-8 w-full items-center justify-center rounded-md text-[10px] font-medium tabular-nums text-zinc-700 dark:text-zinc-200',
                  levelClass(d.count, max),
                )}
                title={`${d.date}: ${d.count} commit${d.count === 1 ? '' : 's'}`}
              >
                {d.count > 0 ? d.count : ''}
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
                {DAY_LABELS[new Date(d.date).getDay()]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}