// file: components/BranchSwitcher.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Check, ChevronDown, GitBranch, Lock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BranchSummary } from '@/types';

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
  const router = useRouter();

  function selectBranch(name: string) {
    const params = new URLSearchParams({ branch: name });
    router.push(`/repos/${owner}/${repo}?${params.toString()}`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 max-w-[160px] items-center gap-1.5 rounded-lg border border-zinc-200/80 px-2.5 text-[12.5px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <GitBranch className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
          <span className="truncate font-mono">{activeBranch}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>Switch branch</DropdownMenuLabel>

        {branches.map((b) => {
          const active = b.name === activeBranch;
          return (
            <DropdownMenuItem key={b.name} onSelect={() => selectBranch(b.name)}>
              <GitBranch className="h-[15px] w-[15px] shrink-0 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
              <span className={`min-w-0 flex-1 truncate font-mono ${active ? 'font-medium' : ''}`}>
                {b.name}
              </span>
              {b.protected && (
                <Lock className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
              )}
              {active && (
                <Check className="h-4 w-4 shrink-0 text-zinc-700 dark:text-zinc-200" strokeWidth={2} />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}