// file: components/profile/profile.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RiGithubFill } from 'react-icons/ri';
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
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(true)}
        aria-label="Profile"
        className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200/80 transition-colors hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700"
      >
        <Avatar image={image} login={login} className="h-full w-full" textClassName="text-xs" />
      </motion.button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent open={open}>
          <DrawerHeader className="flex items-center gap-3">
            <Avatar image={image} login={login} className="h-12 w-12 shrink-0" textClassName="text-sm" />
            <div className="min-w-0 flex-1">
              <DrawerTitle className="truncate">{name || login}</DrawerTitle>
              <a
                href={`https://github.com/${login}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 truncate text-[12.5px] text-zinc-400 transition-colors hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                <RiGithubFill className="h-3.5 w-3.5 shrink-0" />@{login}
              </a>
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

            <div className="mt-1 border-t border-zinc-200/70 pt-3 dark:border-zinc-800/70">
              <SignOutButton />
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}