// file: components/DeleteFileButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
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

  const fileName = path.split('/').pop() ?? path;

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
          <DrawerHeader className="gap-1">
            <DrawerTitle className="truncate font-mono text-[15px] font-medium tracking-tight">
              Delete {fileName}?
            </DrawerTitle>
            <DrawerDescription className="text-[13px] text-zinc-400 dark:text-zinc-500">
              This commits a deletion directly to <strong className="font-medium text-zinc-600 dark:text-zinc-300">{branch}</strong>.
            </DrawerDescription>
          </DrawerHeader>

          <DrawerBody className="flex flex-col gap-3">
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200/70 bg-red-50/50 px-3.5 py-3 dark:border-red-900/40 dark:bg-red-950/20">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500 dark:text-red-400" strokeWidth={2} />
              <p className="text-[13px] leading-snug text-red-700 dark:text-red-400">
                This action cannot be undone from here. The file will be permanently removed from this branch.
              </p>
            </div>

            <Input
              autoFocus
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Delete ${path}`}
              maxLength={500}
              aria-label="Commit message"
            />

            {status === 'error' && error && <InlineBanner variant="error">{error}</InlineBanner>}
          </DrawerBody>

          <DrawerFooter>
            <Button type="button" variant="ghost" onClick={() => close(false)} disabled={status === 'deleting'}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={message.trim().length === 0 || status === 'deleting'}
            >
              {status === 'deleting' ? 'Deleting…' : 'Delete file'}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}