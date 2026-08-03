// file: components/RenameFileButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { renameFileAction } from '@/actions/github';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InlineBanner } from '@/components/ui/inline-banner';

/**
 * Controlled — opened from EditorActionsMenu, same reasoning as
 * DeleteFileButton: one visible primary action (Commit) on the editor
 * screen, secondary actions live behind "More".
 */
export function RenameFileButton({
  owner,
  repo,
  branch,
  path,
  open,
  onOpenChange,
}: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [newPath, setNewPath] = useState(path);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'renaming' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
    const trimmed = newPath.trim();
    if (!trimmed || trimmed === path) return;
    setStatus('renaming');
    setError(null);
    const result = await renameFileAction({
      owner,
      repo,
      branch,
      oldPath: path,
      newPath: trimmed,
      message: message.trim() || `Rename ${path} to ${trimmed}`,
    });
    if (!result.ok) {
      setStatus('error');
      setError(result.error);
      return;
    }
    router.push(`/repos/${owner}/${repo}/edit/${trimmed}?branch=${encodeURIComponent(branch)}`);
  }

  return (
    <Drawer open={open} onOpenChange={close}>
      <DrawerContent open={open}>
        <form onSubmit={handleRename}>
          <DrawerHeader>
            <DrawerTitle>Rename {path}</DrawerTitle>
            <DrawerDescription>
              Creates the file at the new path, then removes the old one — two commits to <strong>{branch}</strong>.
              The old file is only removed once the new one is created.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="flex flex-col gap-3">
            <Input autoFocus value={newPath} onChange={(e) => setNewPath(e.target.value)} aria-label="New path" />
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Rename ${path} to ${newPath.trim() || '…'}`}
              maxLength={500}
            />
            {status === 'error' && error && <InlineBanner variant="error">{error}</InlineBanner>}
          </DrawerBody>
          <DrawerFooter>
            <Button type="button" variant="ghost" onClick={() => close(false)} disabled={status === 'renaming'}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={newPath.trim().length === 0 || newPath.trim() === path || status === 'renaming'}
            >
              {status === 'renaming' ? 'Renaming…' : 'Rename'}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}