// file: components/BranchSwitcher.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GitBranch, Lock, Check } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Row } from '@/components/ui/row';
import type { BranchSummary } from '@/types';

/**
 * Branch selection is a bottom sheet, not a native <select> — matches the
 * app's one repeating list pattern (Row) instead of introducing a second,
 * differently-styled control. Switching is always an explicit tap; never
 * automatic.
 */
export function BranchSwitcher({
  owner,
  repo,
  branches,
  activeBranch,
}: {
  owner: string;
  repo: string;
  branches: BranchSummary[];
  activeBranch: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function selectBranch(name: string) {
    setOpen(false);
    const params = new URLSearchParams({ branch: name });
    router.push(`/repos/${owner}/${repo}?${params.toString()}`);
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="flex h-9 max-w-[160px] items-center gap-1.5 rounded-lg border border-zinc-200/80 px-2.5 text-[12.5px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <GitBranch className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
          <span className="truncate font-mono">{activeBranch}</span>
        </button>
      </DrawerTrigger>

      <DrawerContent open={open}>
        <DrawerHeader>
          <DrawerTitle>Switch branch</DrawerTitle>
        </DrawerHeader>

        <ul className="flex flex-col gap-0.5 px-1 pb-3 pt-1">
          {branches.map((b) => {
            const active = b.name === activeBranch;
            return (
              <li key={b.name}>
                <Row
                  icon={<GitBranch className="h-[17px] w-[17px]" />}
                  label={<span className="font-mono">{b.name}</span>}
                  meta={
                    <span className="flex items-center gap-1.5">
                      {b.protected && <Lock className="h-3.5 w-3.5" strokeWidth={2} />}
                      {active && <Check className="h-4 w-4 text-zinc-700 dark:text-zinc-200" strokeWidth={2} />}
                    </span>
                  }
                  onClick={() => selectBranch(b.name)}
                  aria-current={active}
                  className={active ? 'bg-zinc-100/80 font-medium dark:bg-zinc-800/50' : undefined}
                />
              </li>
            );
          })}
        </ul>
      </DrawerContent>
    </Drawer>
  );
}