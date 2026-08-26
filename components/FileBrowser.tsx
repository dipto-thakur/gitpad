// file: components/FileBrowser.tsx
'use client';

import { useState } from 'react';
import { FilePlus, FolderOpen, FolderPlus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { useFileTree } from '@/hooks/useFileTree';
import { useOpenDirs } from '@/hooks/useOpenDirs';
import { EntryRow } from '@/components/FileBrowser/EntryRow';
import { CreateEntryForm } from '@/components/CreateEntryForm';
import { cn } from '@/lib/utils';
import { StaticRow } from '@/components/ui/row';
import { Skeleton } from '@/components/ui/skeleton';
import { InlineBanner } from '@/components/ui/inline-banner';
import { Divider } from '@/components/ui/divider';
import { EmptyState } from '@/components/ui/empty-state';

export function FileBrowser({
  owner,
  repo,
  branch,
  path,
  depth = 0,
  openDirs: openDirsProp,
  onToggleDir: onToggleDirProp,
}: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  depth?: number;
  openDirs?: Set<string>;
  onToggleDir?: (path: string) => void;
}) {
  const { entries, error, reload, isEmpty } = useFileTree(owner, repo, branch, path);
  const [createMode, setCreateMode] = useState<'file' | 'folder' | null>(null);


  const ownOpenDirs = useOpenDirs();
  const openDirs = openDirsProp ?? ownOpenDirs.openDirs;
  const toggleDir = onToggleDirProp ?? ownOpenDirs.toggleDir;

  return (
    <div
      className={cn(
        'min-w-0',
        depth > 0 &&
          'ml-3 border-l border-zinc-200/70 bg-zinc-100/25 pl-3 dark:border-zinc-800/70 dark:bg-muted/20',
      )}
    >
      {depth === 0 && (
        <>
          <CreateEntryForm
            owner={owner}
            repo={repo}
            branch={branch}
            basePath={path}
            onCreated={reload}
            openMode={createMode}
            onOpenModeChange={setCreateMode}
          />
  
          <Divider className="mb-4" />
        </>
      )}
  
      {error && (
        <div className="px-1 py-2">
          <InlineBanner variant="error">{error}</InlineBanner>
        </div>
      )}
  
      {!error && entries === null && (
        <div className="flex flex-col gap-1.5 px-1 py-1">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-3/4 rounded-lg" />
          <Skeleton className="h-10 w-1/2 rounded-lg" />
        </div>
      )}
  
      {isEmpty && depth === 0 && (
        <EmptyState
          icon={<FolderOpen />}
          title="This folder is empty"
          description="Create a file or folder to get started."
          primaryAction={{
            label: 'New file',
            icon: <FilePlus />,
            onClick: () => setCreateMode('file'),
          }}
          secondaryAction={{
            label: 'New folder',
            icon: <FolderPlus />,
            onClick: () => setCreateMode('folder'),
          }}
        />
      )}
  
      {isEmpty && depth > 0 && (
        <StaticRow
          icon={<FolderOpen />}
          label="Empty folder"
          meta="Use ⋯ on the folder above to add files"
          className="text-muted-foreground dark:text-muted-foreground/50"
        />
      )}
  
      {!error && entries !== null && entries.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {entries.map((entry) => {
            const isOpen = openDirs.has(entry.path);
  
            return (
              <li key={entry.path}>
                <EntryRow
                  owner={owner}
                  repo={repo}
                  branch={branch}
                  entry={entry}
                  isOpen={isOpen}
                  onToggleDir={toggleDir}
                  onChanged={reload}
                />
  
                {entry.type === 'dir' && (
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-0.5">
                          <FileBrowser
                            owner={owner}
                            repo={repo}
                            branch={branch}
                            path={entry.path}
                            depth={depth + 1}
                            openDirs={openDirs}
                            onToggleDir={toggleDir}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}