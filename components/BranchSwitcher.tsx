'use client';

import { useRouter } from 'next/navigation';
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

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Branch</span>
      <select
        value={activeBranch}
        onChange={(e) => {
          // Explicit user action required to switch branches — never
          // switched automatically.
          const params = new URLSearchParams({ branch: e.target.value });
          router.push(`/repos/${owner}/${repo}?${params.toString()}`);
        }}
        className="rounded-md border border-border px-2 py-1 text-sm"
      >
        {branches.map((b) => (
          <option key={b.name} value={b.name}>
            {b.name}
            {b.protected ? ' (protected)' : ''}
          </option>
        ))}
      </select>
    </label>
  );
}
