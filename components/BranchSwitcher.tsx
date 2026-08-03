// file: components/BranchSwitcher.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GitBranch, Lock } from 'lucide-react';
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
          className="flex h-9 items-center gap-1.5 rounded border border-border px-2.5 text-xs text-foreground hover:bg-muted"
        >
          <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
          {activeBranch}
        </button>
      </DrawerTrigger>
      <DrawerContent open={open}>
        <DrawerHeader>
          <DrawerTitle>Switch branch</DrawerTitle>
        </DrawerHeader>
        <ul className="pb-2">
          {branches.map((b) => (
            <li key={b.name}>
              <Row
                icon={<GitBranch />}
                label={b.name}
                meta={b.protected ? <Lock className="h-3.5 w-3.5" /> : undefined}
                onClick={() => selectBranch(b.name)}
                aria-current={b.name === activeBranch}
                className={b.name === activeBranch ? 'font-medium' : undefined}
              />
            </li>
          ))}
        </ul>
      </DrawerContent>
    </Drawer>
  );
}