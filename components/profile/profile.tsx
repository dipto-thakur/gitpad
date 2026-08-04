// file: components/profile/profile.tsx
'use client';

import { useEffect, useState } from 'react';
import { getProfileStatsAction } from '@/actions/profile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerBody } from '@/components/ui/drawer';
import { Avatar } from '@/components/profile/avatar';
import { StatTile, type StatsState } from '@/components/profile/stat-tile';
import { WeekHeatmap } from '@/components/profile/week-heatmap';
import { SignOutButton } from '@/components/sign/SignOutButton';

export function Profile({
  login,
  name,
  image,
}: {
  login: string;
  name?: string | null;
  image?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<StatsState>('loading');
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!open || fetched) return;
    setFetched(true);
    getProfileStatsAction().then((res) => {
      setStats(res.ok ? res.data : 'error');
    });
  }, [open, fetched]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Profile"
        className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200/80 transition-opacity hover:opacity-80 dark:border-zinc-800/80"
      >
        <Avatar image={image} login={login} className="h-full w-full" textClassName="text-xs" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent open={open}>
          <DrawerHeader className="flex items-center gap-3">
            <Avatar image={image} login={login} className="h-12 w-12 shrink-0" textClassName="text-sm" />
            <div className="min-w-0">
              <DrawerTitle className="truncate">{name || login}</DrawerTitle>
              <p className="truncate text-[12.5px] text-zinc-400 dark:text-zinc-500">@{login}</p>
            </div>
          </DrawerHeader>

          <DrawerBody className="flex flex-col gap-3">
            <div className="flex gap-3">
              <StatTile label="Contributions/Year" state={stats} pick={(s) => s.totalContributions} />
              <StatTile
                label="Current streak"
                state={stats}
                pick={(s) => s.currentStreak}
                suffix={(v) => (v === 1 ? ' day' : ' days')}
              />
            </div>

            <WeekHeatmap state={stats} />

            <SignOutButton />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}