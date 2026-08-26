// file: components/DeleteFileButton.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

import { deleteFileAction } from '@/actions/github';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
} from '@/components/ui/drawer';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InlineBanner } from '@/components/ui/inline-banner';

export function DeleteFileButton({
  owner,
  repo,
  branch,
  path,
  sha,
  open,
  onOpenChange,
  onDeleted,
  redirectAfterDelete = false,
}: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  sha: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
  redirectAfterDelete?: boolean;
}) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'deleting' | 'error'>(
    'idle',
  );
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

  async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    setStatus('deleting');
    setError(null);

    try {
      const result = await deleteFileAction({
        owner,
        repo,
        branch,
        path,
        message: trimmedMessage,
        sha,
      });

      if (!result.ok) {
        setStatus('error');
        setError(result.error);
        return;
      }

      onDeleted?.();

      if (redirectAfterDelete) {
        router.push(
          `/repos/${owner}/${repo}?branch=${encodeURIComponent(branch)}`,
        );
        router.refresh();
        return;
      }

      // FileBrowser mode:
      // close the drawer and let the parent refresh the tree.
      onOpenChange(false);
    } catch {
      setStatus('error');
      setError('Failed to delete file.');
    }
  }

  return (
    <Drawer open={open} onOpenChange={close}>
      <DrawerContent open={open}>
        <form onSubmit={handleDelete}>
          <DrawerHeader className="gap-1">
            <DrawerTitle className="truncate font-mono text-[15px] font-medium tracking-tight">
              Delete {fileName}?
            </DrawerTitle>

            <DrawerDescription className="text-[13px] text-muted-foreground text-muted-foreground">
              This commits a deletion directly to{' '}
              <strong className="font-medium text-muted-foreground/50 dark:text-muted-foreground/50">
                {branch}
              </strong>
              .
            </DrawerDescription>
          </DrawerHeader>

          <DrawerBody className="flex flex-col gap-3">
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200/70 bg-red-50/50 px-3.5 py-3 dark:border-red-900/40 dark:bg-red-950/20">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-red-500 dark:text-red-400"
                strokeWidth={2}
              />

              <p className="text-[13px] leading-snug text-red-700 dark:text-red-400">
                This action cannot be undone from here. The file will be
                permanently removed from this branch.
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

            {status === 'error' && error && (
              <InlineBanner variant="error">
                {error}
              </InlineBanner>
            )}
          </DrawerBody>

          <DrawerFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => close(false)}
              disabled={status === 'deleting'}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="destructive"
              disabled={
                message.trim().length === 0 ||
                status === 'deleting'
              }
            >
              {status === 'deleting' ? 'Deleting…' : 'Delete file'}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}