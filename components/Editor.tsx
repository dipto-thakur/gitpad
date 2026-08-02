'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { commitFileAction } from '@/actions/github';
import { DeleteFileButton } from '@/components/DeleteFileButton';
import type { FileContent } from '@/types';

export function Editor({
  owner,
  repo,
  branch,
  file,
}: {
  owner: string;
  repo: string;
  branch: string;
  file: FileContent;
}) {
  const [content, setContent] = useState(file.content);
  const [sha, setSha] = useState(file.sha);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'committing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const dirty = content !== file.content;

  // Warn before leaving the page (tab close/refresh) with unsaved edits.
  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  function handleTab(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = content.slice(0, start) + '\t' + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + 1;
    });
  }

  async function handleCommit(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty) return;
    setStatus('committing');
    setError(null);
    const result = await commitFileAction({
      owner,
      repo,
      branch,
      path: file.path,
      content,
      message,
      sha,
    });
    if (!result.ok) {
      setStatus('error');
      setError(result.error);
      return;
    }
    setStatus('success');
    setSha(result.data.contentSha);
    setMessage('');
    router.refresh();
  }

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-sm font-medium">{file.path}</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">{branch}</span>
          <DeleteFileButton owner={owner} repo={repo} branch={branch} path={file.path} sha={sha} />
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (status !== 'idle') setStatus('idle');
        }}
        onKeyDown={handleTab}
        spellCheck={false}
        className="h-[60vh] w-full resize-y rounded-md border border-border p-3 font-mono text-sm outline-none focus:ring-1 focus:ring-fg"
      />

      <form onSubmit={handleCommit} className="mt-4 flex flex-col gap-2">
        <label className="text-xs text-muted" htmlFor="commit-message">
          Commit message
        </label>
        <input
          id="commit-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Update ${file.path}`}
          maxLength={500}
          className="rounded-md border border-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-fg"
        />

        {status === 'error' && error && (
          <p className="rounded-md border border-border bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
            {(error.toLowerCase().includes('changed on github') ||
              error.toLowerCase().includes('deleted from the repository')) && (
              <button
                type="button"
                onClick={() => router.refresh()}
                className="ml-2 underline"
              >
                Reload file
              </button>
            )}
          </p>
        )}

        {status === 'success' && (
          <p className="rounded-md border border-border bg-green-50 px-3 py-2 text-sm text-green-700">
            Committed.
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!dirty || message.trim().length === 0 || status === 'committing'}
            className="rounded-md bg-fg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === 'committing' ? 'Committing…' : 'Commit'}
          </button>
          {dirty && <span className="text-xs text-muted">Unsaved changes</span>}
        </div>
      </form>
    </div>
  );
}