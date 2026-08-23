'use client';
//components\EntryOptionsMenu.tsx
import { useState } from 'react';
import { Copy, Download, FilePlus, FolderPlus, Loader2, MoreVertical, Ellipse, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { DeleteFileButton } from '@/components/options/DeleteFileButton';
import { RenameFileButton } from '@/components/options/RenameFileButton';
import { RenameFolderButton } from '@/components/options/RenameFolderButton';
import { CreateEntryForm } from '@/components/CreateEntryForm';
import { downloadFileAction, downloadFolderAction } from '@/actions/github';
import type { TreeEntry } from '@/types';
import { ShareEntryButton } from '@/components/ShareEntryButton';

type CreateMode = 'file' | 'folder' | null;

function triggerBase64Download(filename: string, base64: string) {
  const bytes = atob(base64);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i);

  const blob = new Blob([buffer]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Trailing options menu for a single FileBrowser row — a dropdown that
 * reads like a normal file-explorer context menu.
 */
export function EntryOptionsMenu({
  owner,
  repo,
  branch,
  entry,
  onChanged,
  tone = 'file',
}: {
  owner: string;
  repo: string;
  branch: string;
  entry: TreeEntry;
  onChanged: () => void;
  tone?: 'file' | 'folder';
}) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isDir = entry.type === 'dir';
  const label = isDir ? `${entry.name}/` : entry.name;

  async function copyPath() {
    try {
      await navigator.clipboard.writeText(entry.path);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable/denied — silently no-op.
    }
  }

  async function download() {
    if (downloading) return;
    setDownloading(true);
    try {
      const result = isDir
        ? await downloadFolderAction({ owner, repo, branch, path: entry.path })
        : await downloadFileAction({ owner, repo, path: entry.path, sha: entry.sha });

      if (!result.ok) {
        // No toast system wired in yet — surfacing this as a plain alert
        // rather than failing silently. Swap for a proper banner/toast if
        // you add one.
        window.alert(result.error);
        return;
      }
      triggerBase64Download(result.data.filename, result.data.base64);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`More actions for ${label}`}
          >
            <MoreVertical
              className={
                tone === 'folder'
                  ? 'h-[18px] w-[18px] text-amber-500/70 dark:text-amber-400/60'
                  : 'h-[18px] w-[18px]'
              }
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          {isDir && (
            <>
              <DropdownMenuItem onSelect={() => setCreateMode('file')}>
                <FilePlus className="h-[15px] w-[15px] shrink-0 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
                New file
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setCreateMode('folder')}>
                <FolderPlus className="h-[15px] w-[15px] shrink-0 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
                New folder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
            <Pencil className="h-[15px] w-[15px] shrink-0 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
            Rename
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={copyPath}>
            <Copy className="h-[15px] w-[15px] shrink-0 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
            {copied ? 'Copied!' : 'Copy path'}
          </DropdownMenuItem>

          <ShareEntryButton owner={owner} repo={repo} branch={branch} path={entry.path} isDir={isDir} />

          <DropdownMenuItem onSelect={download} disabled={downloading}>
            {downloading ? (
              <Loader2 className="h-[15px] w-[15px] shrink-0 animate-spin text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
            ) : (
              <Download className="h-[15px] w-[15px] shrink-0 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
            )}
            {isDir ? 'Download as .zip' : 'Download'}
          </DropdownMenuItem>

          {!isDir && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setDeleteOpen(true)}
                className="text-red-600 data-[highlighted]:bg-red-50 dark:text-red-400 dark:data-[highlighted]:bg-red-950/40"
              >
                <Trash2 className="h-[15px] w-[15px] shrink-0 text-red-500/80 dark:text-red-400/80" strokeWidth={2} />
                Delete file
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isDir && (
        <CreateEntryForm
          owner={owner}
          repo={repo}
          branch={branch}
          basePath={entry.path}
          onCreated={onChanged}
          openMode={createMode}
          onOpenModeChange={setCreateMode}
        />
      )}

      {isDir ? (
        <RenameFolderButton
          owner={owner}
          repo={repo}
          branch={branch}
          path={entry.path}
          open={renameOpen}
          onOpenChange={setRenameOpen}
          onRenamed={onChanged}
        />
      ) : (
        <RenameFileButton
          owner={owner}
          repo={repo}
          branch={branch}
          path={entry.path}
          open={renameOpen}
          onOpenChange={setRenameOpen}
          onRenamed={onChanged}
        />
      )}

      {!isDir && (
        <DeleteFileButton
          owner={owner}
          repo={repo}
          branch={branch}
          path={entry.path}
          sha={entry.sha}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onDeleted={onChanged}
        />
      )}
    </>
  );
}