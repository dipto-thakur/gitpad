// file: components/CreateEntryForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilePlus, FolderPlus } from 'lucide-react';
import { createFileAction } from '@/actions/github';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerBody, DrawerFooter } from '@/components/ui/drawer';
import { Row } from '@/components/ui/row';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InlineBanner } from '@/components/ui/inline-banner';

export function CreateEntryForm({
  owner,
  repo,
  branch,
  basePath,
  onCreated,
}: {
  owner: string;
  repo: string;
  branch: string;
  basePath: string;
  onCreated: () => void;
}) {
  const [mode, setMode] = useState<'file' | 'folder' | null>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'creating' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function close(open: boolean) {
    if (!open) {
      if (status === 'creating') return;
      setMode(null);
      setName('');
      setMessage('');
      setError(null);
      setStatus('idle');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    // GitHub has no real empty-folder concept — create a placeholder file,
    // same as git's own .gitkeep convention.
    const path =
      mode === 'folder' ? [basePath, trimmed, '.gitkeep'].filter(Boolean).join('/') : [basePath, trimmed].filter(Boolean).join('/');

    setStatus('creating');
    setError(null);
    const result = await createFileAction({
      owner,
      repo,
      branch,
      path,
      content: '',
      message: message.trim() || (mode === 'folder' ? `Create folder ${trimmed}` : `Create ${path}`),
    });
    if (!result.ok) {
      setStatus('error');
      setError(result.error);
      return;
    }
    const createdFile = mode === 'file';
    close(false);
    onCreated();
    if (createdFile) {
      router.push(`/repos/${owner}/${repo}/edit/${path}?branch=${encodeURIComponent(branch)}`);
    }
  }

  return (
    <>
      <div className="flex">
        <Row icon={<FilePlus />} label="New file" onClick={() => setMode('file')} className="flex-1" />
        <Row icon={<FolderPlus />} label="New folder" onClick={() => setMode('folder')} className="flex-1" />
      </div>

      <Drawer open={mode !== null} onOpenChange={close}>
        <DrawerContent open={mode !== null}>
          <form onSubmit={handleSubmit}>
            <DrawerHeader>
              <DrawerTitle>{mode === 'folder' ? 'New folder' : 'New file'}</DrawerTitle>
            </DrawerHeader>
            <DrawerBody className="flex flex-col gap-3">
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={mode === 'folder' ? 'folder-name' : 'e.g. notes.md, app.py, index.html'}
              />
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Commit message (optional)"
                maxLength={500}
              />
              {status === 'error' && error && <InlineBanner variant="error">{error}</InlineBanner>}
            </DrawerBody>
            <DrawerFooter>
              <Button type="button" variant="ghost" onClick={() => close(false)} disabled={status === 'creating'}>
                Cancel
              </Button>
              <Button type="submit" disabled={name.trim().length === 0 || status === 'creating'}>
                {status === 'creating' ? 'Creating…' : mode === 'folder' ? 'Create folder' : 'Create file'}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </>
  );
}