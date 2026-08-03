// file: components/profile/profile.tsx
'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { getProfileStatsAction, type ProfileStats } from '@/actions/profile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerBody } from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { Row } from '@/components/ui/row';

type StatsState = 'loading' | 'error' | ProfileStats;

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
        className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border"
      >
        <Avatar image={image} login={login} className="h-full w-full" textClassName="text-xs" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent open={open}>
          <DrawerHeader className="flex items-center gap-3">
            <Avatar image={image} login={login} className="h-12 w-12 shrink-0" textClassName="text-sm" />
            <div className="min-w-0">
              <DrawerTitle>{name || login}</DrawerTitle>
              <p className="truncate text-xs text-muted-foreground">@{login}</p>
            </div>
          </DrawerHeader>

          <DrawerBody className="flex flex-col gap-3">
            <div className="flex gap-2">
              <StatTile label="Contributions (past year)" state={stats} pick={(s) => s.totalContributions} />
              <StatTile
                label="Current streak"
                state={stats}
                pick={(s) => s.currentStreak}
                suffix={(v) => (v === 1 ? ' day' : ' days')}
              />
            </div>
            {stats === 'error' && (
              <p className="text-xs text-muted-foreground">Contribution stats aren&apos;t available right now.</p>
            )}
          </DrawerBody>

          <div className="border-t border-border pb-2">
            <Row icon={<LogOut />} label="Sign out" destructive onClick={() => signOut({ callbackUrl: '/' })} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function Avatar({
  image,
  login,
  className,
  textClassName,
}: {
  image?: string | null;
  login: string;
  className?: string;
  textClassName?: string;
}) {
  if (image) {
    // Plain <img>, not next/image — avatars.githubusercontent.com would
    // otherwise need remotePatterns config for little benefit at this size.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" referrerPolicy="no-referrer" className={`${className ?? ''} rounded-full object-cover`} />;
  }
  return (
    <span
      className={`${className ?? ''} flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ${textClassName ?? ''}`}
    >
      {login.slice(0, 2).toUpperCase()}
    </span>
  );
}

function StatTile({
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
    <div className="flex-1 rounded border border-border px-3 py-2.5">
      {loading ? (
        <Skeleton className="h-6 w-10" />
      ) : (
        <p className="text-lg font-medium text-foreground">
          {value === null ? '—' : `${value}${suffix ? suffix(value) : ''}`}
        </p>
      )}
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}