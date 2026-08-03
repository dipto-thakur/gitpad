// file: components/DeleteFileButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteFileAction } from '@/actions/github';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InlineBanner } from '@/components/ui/inline-banner';

/**
 * Controlled — this component owns no trigger of its own. It's opened from
 * EditorActionsMenu ("More" menu), keeping the editor screen down to one
 * visible primary action (Commit) instead of a row of competing buttons.
 */
export function DeleteFileButton({
  owner,
  repo,
  branch,
  path,
  sha,
  open,
  onOpenChange,
}: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  sha: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'deleting' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function close(next: boolean) {
    if (!next) {
      if (status === 'deleting') return;
      setError(null);
      setStatus('idle');
      setMessage('');
    }
    onOpenChange(next);
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setStatus('deleting');
    setError(null);
    const result = await deleteFileAction({ owner, repo, branch, path, message, sha });
    if (!result.ok) {
      setStatus('error');
      setError(result.error);
      return;
    }
    router.push(`/repos/${owner}/${repo}?branch=${encodeURIComponent(branch)}`);
    router.refresh();
  }

  return (
    <Drawer open={open} onOpenChange={close}>
      <DrawerContent open={open}>
        <form onSubmit={handleDelete}>
          <DrawerHeader>
            <DrawerTitle>Delete {path}?</DrawerTitle>
            <DrawerDescription>
              Commits a deletion directly to <strong>{branch}</strong>. It cannot be undone from here.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody className="flex flex-col gap-3">
            <Input
              autoFocus
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Delete ${path}`}
              maxLength={500}
            />
            {status === 'error' && error && <InlineBanner variant="error">{error}</InlineBanner>}
          </DrawerBody>
          <DrawerFooter>
            <Button type="button" variant="ghost" onClick={() => close(false)} disabled={status === 'deleting'}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={message.trim().length === 0 || status === 'deleting'}>
              {status === 'deleting' ? 'Deleting…' : 'Delete'}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}