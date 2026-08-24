// file: components/FileBrowser/EntryRow.tsx
'use client';

import { motion } from 'framer-motion';
import { RiFolder3Fill, RiFolderOpenFill, RiAlertLine, RiArrowRightSLine } from 'react-icons/ri';
import { Row, RowLink } from '@/components/ui/row';
import { EntryOptionsMenu } from '@/components/EntryOptionsMenu';
import { getFileIcon } from '@/components/icons/file-icons';
import { cn } from '@/lib/utils';
import type { TreeEntry } from '@/types';

/**
 * Single tree row — dir (expand toggle) or file (nav link) — paired with
 * its trailing options menu. Folder icon is a filled glyph (react-icons Ri
 * set) with a soft amber tint carried through to the expand chevron and
 * the folder's own options trigger (via `tone`), so a folder row reads as
 * one coherent, warm-tinted unit at a glance — file rows stay fully
 * neutral by contrast. A soft divider marks row boundaries; suppress on
 * the last row of a list via `isLast`.
 */
export function EntryRow({
  owner,
  repo,
  branch,
  entry,
  isOpen,
  onToggleDir,
  onChanged,
  isLast = false,
}: {
  owner: string;
  repo: string;
  branch: string;
  entry: TreeEntry;
  isOpen: boolean;
  onToggleDir: (path: string) => void;
  onChanged: () => void;
  isLast?: boolean;
}) {
  const isDir = entry.type === 'dir';

  return (
    <div
      className={cn(
        'flex items-center gap-0.5',
        !isLast && !isOpen && 'border-b  bg-zinc-50/95 dark:bg-zinc-950/95',
      )}
    >
      {isDir ? (
        <Row
          className="flex-1"
          icon={
            isOpen ? (
              <RiFolderOpenFill className="text-amber-500/90 dark:text-amber-400/80" />
            ) : (
              <RiFolder3Fill className="text-amber-500/90 dark:text-amber-400/80" />
            )
          }
          label={`${entry.name}/`}
          onClick={() => onToggleDir(entry.path)}
          aria-expanded={isOpen}
          meta={
            <motion.span
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.15 }}
              className="flex text-amber-400/70 dark:text-amber-500/60"
            >
              <RiArrowRightSLine className="h-4 w-4" />
            </motion.span>
          }
        />
      ) : (
        <RowLink
          className="flex-1"
          href={`/repos/${owner}/${repo}/edit/${entry.path}?branch=${encodeURIComponent(branch)}`}
          icon={getFileIcon(entry.name)}
          label={entry.name}
          meta={
            !entry.supported ? (
              <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-600">
                <RiAlertLine className="h-3.5 w-3.5" />
                binary
              </span>
            ) : undefined
          }
        />
      )}

      <EntryOptionsMenu
        owner={owner}
        repo={repo}
        branch={branch}
        entry={entry}
        onChanged={onChanged}
        tone={isDir ? 'folder' : 'file'}
      />
    </div>
  );
}