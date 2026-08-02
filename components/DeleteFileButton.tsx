'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteFileAction } from '@/actions/github';

export function DeleteFileButton({
  owner,
  repo,
  branch,
  path,
  sha,
}: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  sha: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'deleting' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function close() {
    if (status === 'deleting') return;
    setOpen(false);
    setError(null);
    setStatus('idle');
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
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-red-600 hover:underline"
      >
        Delete file
      </button>

      {open && (
        // Simple, dependency-free confirmation dialog: no destructive
        // action fires without this explicit, separate confirmation step.
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-file-title"
          onKeyDown={(e) => {
            if (e.key === 'Escape') close();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        >
          <div className="w-full max-w-sm rounded-lg border border-border bg-white p-5 shadow-lg">
            <h2 id="delete-file-title" className="text-sm font-semibold">
              Delete {path}?
            </h2>
            <p className="mt-1 text-sm text-muted">
              This commits a deletion directly to <strong>{branch}</strong>. It
              cannot be undone from here.
            </p>

            <form onSubmit={handleDelete} className="mt-4 flex flex-col gap-2">
              <label htmlFor="delete-commit-message" className="text-xs text-muted">
                Commit message
              </label>
              <input
                id="delete-commit-message"
                autoFocus
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Delete ${path}`}
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
                  disabled={status === 'deleting'}
                  className="rounded-md px-3 py-2 text-sm text-muted hover:text-fg disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={message.trim().length === 0 || status === 'deleting'}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {status === 'deleting' ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}