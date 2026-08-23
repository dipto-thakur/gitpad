// file: components/RenameFolderButton.tsx
'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { renameFolderAction } from '@/actions/github';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InlineBanner } from '@/components/ui/inline-banner';

/**
 * Controlled, mirrors RenameFileButton but operates on every file under
 * `path` via renameFolderAction. Calls onRenamed() to refresh the listing
 * — no single edit route to navigate to for a folder.
 */
export function RenameFolderButton({
  owner,
  repo,
  branch,
  path,
  open,
  onOpenChange,
  onRenamed,
}: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRenamed: () => void;
}) {
  const [newPath, setNewPath] = useState(path);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'renaming' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const folderName = path.split('/').pop() ?? path;
  const trimmedNew = newPath.trim();

  function close(next: boolean) {
    if (!next) {
      if (status === 'renaming') return;
      setNewPath(path);
      setMessage('');
      setError(null);
      setStatus('idle');
    }
    onOpenChange(next);
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!trimmedNew || trimmedNew === path) return;
    setStatus('renaming');
    setError(null);
    const result = await renameFolderAction({
      owner,
      repo,
      branch,
      oldPath: path,
      newPath: trimmedNew,
      message: message.trim() || `Rename ${path} to ${trimmedNew}`,
    });
    if (!result.ok) {
      setStatus('error');
      setError(result.error);
      return;
    }
    onRenamed();
    close(false);
  }

  return (
    <Drawer open={open} onOpenChange={close}>
      <DrawerContent open={open}>
        <form onSubmit={handleRename}>
          <DrawerHeader className="gap-1">
            <DrawerTitle className="truncate font-mono text-[15px] font-medium tracking-tight">
              Rename {folderName}/
            </DrawerTitle>
            <DrawerDescription className="text-[13px] text-zinc-400 dark:text-zinc-500">
              One create + delete commit pair per file inside, to <strong className="font-medium text-zinc-600 dark:text-zinc-300">{branch}</strong>.
            </DrawerDescription>
          </DrawerHeader>

          <DrawerBody className="flex flex-col gap-3">
            <div className="flex items-start gap-2.5 rounded-xl border border-zinc-200/80 bg-zinc-100/60 px-3.5 py-3 dark:border-zinc-800/80 dark:bg-zinc-900/60">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" strokeWidth={2} />
              <p className="text-[13px] leading-snug text-zinc-500 dark:text-zinc-400">
                Large folders take longer — each file is moved individually. Don't close this until it finishes.
              </p>
            </div>

            <Input
              autoFocus
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              aria-label="New path"
              className="font-mono text-[13.5px]"
            />

            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Rename ${path} to ${trimmedNew || '…'}`}
              maxLength={500}
              aria-label="Commit message"
            />

            {status === 'error' && error && <InlineBanner variant="error">{error}</InlineBanner>}
          </DrawerBody>

          <DrawerFooter>
            <Button type="button" variant="ghost" onClick={() => close(false)} disabled={status === 'renaming'}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={trimmedNew.length === 0 || trimmedNew === path || status === 'renaming'}
            >
              {status === 'renaming' ? 'Renaming…' : 'Rename'}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}