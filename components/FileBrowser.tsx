// file: components/FileBrowser.tsx
'use client';

import { useEffect, useState } from 'react';
import { Folder, FileText, FolderOpen, FilePlus, FolderPlus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { listTreeAction } from '@/actions/github';
import type { TreeEntry } from '@/types';
import { CreateEntryForm } from '@/components/CreateEntryForm';
import { Row, RowLink, StaticRow } from '@/components/ui/row';
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
}: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  depth?: number;
}) {
  const [entries, setEntries] = useState<TreeEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openDirs, setOpenDirs] = useState<Set<string>>(new Set());
  const [reloadToken, setReloadToken] = useState(0);
  const [createMode, setCreateMode] = useState<'file' | 'folder' | null>(null);

  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    setError(null);
    listTreeAction(owner, repo, branch, path).then((res) => {
      if (cancelled) return;
      if (res.ok) setEntries(res.data);
      else setError(res.error);
    });
    return () => {
      cancelled = true;
    };
  }, [owner, repo, branch, path, reloadToken]);

  function toggleDir(p: string) {
    setOpenDirs((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  const isEmpty = !error && entries !== null && entries.length === 0;

  return (
    <div className={depth === 0 ? '' : 'ml-3 border-l border-zinc-200/80 pl-3 dark:border-zinc-800/80'}>
      {depth === 0 && (
  <>
    <CreateEntryForm
      owner={owner}
      repo={repo}
      branch={branch}
      basePath={path}
      onCreated={() => setReloadToken((t) => t + 1)}
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
    primaryAction={{ label: 'New file', icon: <FilePlus />, onClick: () => setCreateMode('file') }}
    secondaryAction={{ label: 'New folder', icon: <FolderPlus />, onClick: () => setCreateMode('folder') }}
  />
)}

      {isEmpty && depth > 0 && (
        <StaticRow icon={<FolderOpen />} label="Empty folder" className="text-zinc-400 dark:text-zinc-600" />
      )}

      {!error && entries !== null && entries.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {entries.map((entry) => (
            <li key={entry.path}>
              {entry.type === 'dir' ? (
                <>
                  <Row
                    icon={<Folder />}
                    label={`${entry.name}/`}
                    onClick={() => toggleDir(entry.path)}
                    aria-expanded={openDirs.has(entry.path)}
                  />
                  <AnimatePresence initial={false}>
                    {openDirs.has(entry.path) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-0.5">
                          <FileBrowser owner={owner} repo={repo} branch={branch} path={entry.path} depth={depth + 1} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : entry.supported ? (
                <RowLink
                  href={`/repos/${owner}/${repo}/edit/${entry.path}?branch=${encodeURIComponent(branch)}`}
                  icon={<FileText />}
                  label={entry.name}
                />
              ) : (
                <RowLink
                  href={`/repos/${owner}/${repo}/edit/${entry.path}?branch=${encodeURIComponent(branch)}`}
                  icon={<FileText />}
                  label={entry.name}
                  meta="likely binary"
                  className="text-zinc-400 dark:text-zinc-600"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}