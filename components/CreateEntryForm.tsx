'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFileAction } from '@/actions/github';

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
  const [mode, setMode] = useState<'closed' | 'file' | 'folder'>('closed');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'creating' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function close() {
    if (status === 'creating') return;
    setMode('closed');
    setName('');
    setMessage('');
    setError(null);
    setStatus('idle');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    // GitHub has no real empty-folder concept — a folder only exists
    // implicitly via file paths inside it. Create a placeholder file, same
    // as `git`'s own .gitkeep convention.
    const path =
      mode === 'folder'
        ? [basePath, trimmed, '.gitkeep'].filter(Boolean).join('/')
        : [basePath, trimmed].filter(Boolean).join('/');

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
    close();
    onCreated();
    if (createdFile) {
      router.push(`/repos/${owner}/${repo}/edit/${path}?branch=${encodeURIComponent(branch)}`);
    }
  }

  if (mode === 'closed') {
    return (
      <div className="mb-2 flex gap-3 px-2">
        <button type="button" onClick={() => setMode('file')} className="text-xs text-muted hover:text-fg">
          + New file
        </button>
        <button type="button" onClick={() => setMode('folder')} className="text-xs text-muted hover:text-fg">
          + New folder
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-2 flex flex-col gap-1.5 rounded-md border border-border p-2">
      <div className="flex items-center gap-2">
        {basePath && <span className="text-xs text-muted">{basePath}/</span>}
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={mode === 'folder' ? 'folder-name' : 'e.g. notes.md, app.py, index.html'}
          onKeyDown={(e) => {
            if (e.key === 'Escape') close();
          }}
          className="flex-1 rounded-md border border-border px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-fg"
        />
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Commit message (optional)"
        maxLength={500}
        className="rounded-md border border-border px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-fg"
      />
      {status === 'error' && error && (
        <p className="rounded-md border border-border bg-red-50 px-2 py-1 text-xs text-red-700">{error}</p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={close}
          disabled={status === 'creating'}
          className="text-xs text-muted hover:text-fg disabled:opacity-40"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={name.trim().length === 0 || status === 'creating'}
          className="rounded-md bg-fg px-2 py-1 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === 'creating' ? 'Creating…' : mode === 'folder' ? 'Create folder' : 'Create file'}
        </button>
      </div>
    </form>
  );
}