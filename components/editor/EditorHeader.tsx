// file: components/editor/EditorHeader.tsx
'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { EditorActionsMenu } from '@/components/editor/EditorActionsMenu';

type EditorHeaderProps = {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  sha: string;
};

export function EditorHeader({
  owner,
  repo,
  branch,
  path,
  sha,
}: EditorHeaderProps) {
  const fileName = path.split('/').pop() ?? path;
  const dirPath = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : null;

  return (
    <header className="sticky top-0 z-10 flex items-center gap-1 border-b border-border/80 bg-background/80 px-2 py-4 backdrop-blur-md border-border/80 dark:bg-background/80">
      <Link
        href={`/repos/${owner}/${repo}?branch=${encodeURIComponent(branch)}`}
        aria-label="Back to file browser"
        className="flex h-10 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-zinc-900 text-muted-foreground dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2} />
      </Link>

      <div className="min-w-0 flex-1 px-1.5">
        <p className="truncate font-mono text-[13.5px] font-medium tracking-tight text-foreground text-foreground">
          {fileName}
        </p>
        <p className="truncate text-[11.5px] leading-tight text-muted-foreground text-muted-foreground">
          {dirPath ? `${dirPath} · ${branch}` : branch}
        </p>
      </div>

      <EditorActionsMenu
        owner={owner}
        repo={repo}
        branch={branch}
        path={path}
        sha={sha}
      />
    </header>
  );
}