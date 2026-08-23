// file: components/ShareEntryButton.tsx
'use client';

import { useState } from 'react';
import { RiShareLine, RiCheckLine } from 'react-icons/ri';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { buildGitHubUrl, shareOrCopyLink } from '@/lib/share-link';

/**
 * Drop-in DropdownMenuItem — shares an entry's canonical GitHub URL via
 * the native share sheet on mobile, or copies it to clipboard on desktop.
 * Self-contained: owns its own "shared/copied" feedback state, no props
 * needed beyond what identifies the entry.
 */
export function ShareEntryButton({
  owner,
  repo,
  branch,
  path,
  isDir,
}: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  isDir: boolean;
}) {
  const [status, setStatus] = useState<'idle' | 'shared' | 'copied'>('idle');

  async function handleShare() {
    const url = buildGitHubUrl({ owner, repo, branch, path, isDir });
    const result = await shareOrCopyLink({ title: path.split('/').pop() ?? path, url });
    if (result === 'shared' || result === 'copied') {
      setStatus(result);
      setTimeout(() => setStatus('idle'), 1500);
    }
  }

  return (
    <DropdownMenuItem onSelect={handleShare}>
      {status !== 'idle' ? (
        <RiCheckLine className="h-[15px] w-[15px] shrink-0 text-emerald-500" />
      ) : (
        <RiShareLine className="h-[15px] w-[15px] shrink-0 text-zinc-400 dark:text-zinc-500" />
      )}
      {status === 'shared' ? 'Shared' : status === 'copied' ? 'Link copied!' : 'Share'}
    </DropdownMenuItem>
  );
}