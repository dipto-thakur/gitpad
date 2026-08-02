'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { renameFileAction } from '@/actions/github';

export function RenameFileButton({
  owner,
  repo,
  branch,
  path,
}: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}) {
  const [open, setOpen] = useState(false);
  const [newPath, setNewPath] = useState(path);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'renaming' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function close() {
    if (status === 'renaming') return;
    setOpen(false);
    setNewPath(path);
    setMessage('');
    setError(null);
    setStatus('idle');
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
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-sm text-muted hover:text-fg">
        Rename
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-file-title"
          onKeyDown={(e) => {
            if (e.key === 'Escape') close();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        >
          <div className="w-full max-w-sm rounded-lg border border-border bg-white p-5 shadow-lg">
            <h2 id="rename-file-title" className="text-sm font-semibold">
              Rename {path}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Creates the file at the new path, then removes the old one — two
              commits to <strong>{branch}</strong>. The old file is only removed
              once the new one is created.
            </p>

            <form onSubmit={handleRename} className="mt-4 flex flex-col gap-2">
              <label htmlFor="rename-new-path" className="text-xs text-muted">
                New path
              </label>
              <input
                id="rename-new-path"
                autoFocus
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-fg"
              />

              <label htmlFor="rename-message" className="text-xs text-muted">
                Commit message
              </label>
              <input
                id="rename-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Rename ${path} to ${newPath.trim() || '…'}`}
                maxLength={500}
                className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-fg"
              />

              {status === 'error' && error && (
                <p className="rounded-md border border-border bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={close}
                  disabled={status === 'renaming'}
                  className="rounded-md px-3 py-2 text-sm text-muted hover:text-fg disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newPath.trim().length === 0 || newPath.trim() === path || status === 'renaming'}
                  className="rounded-md bg-fg px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {status === 'renaming' ? 'Renaming…' : 'Rename'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}