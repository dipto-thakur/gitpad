// file: components/Editor.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { commitFileAction } from '@/actions/github';
import { EditorActionsMenu } from '@/components/editor/EditorActionsMenu';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InlineBanner } from '@/components/ui/inline-banner';
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
    const result = await commitFileAction({ owner, repo, branch, path: file.path, content, message, sha });
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

  const needsReload =
    status === 'error' && error !== null && (error.toLowerCase().includes('changed on github') || error.toLowerCase().includes('deleted from the repository'));

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Navigation recedes while editing: just identity + overflow menu. */}
      <header className="sticky top-0 z-10 flex items-center gap-1 border-b border-border bg-background px-2 py-2">
        <Link
          href={`/repos/${owner}/${repo}?branch=${encodeURIComponent(branch)}`}
          aria-label="Back to file browser"
          className="flex h-12 w-9 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1 px-1">
          <p className="truncate text-sm font-medium text-foreground">{file.path}</p>
          <p className="text-xs text-muted-foreground">{branch}</p>
        </div>
        <EditorActionsMenu owner={owner} repo={repo} branch={branch} path={file.path} sha={sha} />
      </header>

      {/* The editor is the primary surface — plain, no code-editor chrome. */}
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (status !== 'idle') setStatus('idle');
        }}
        onKeyDown={handleTab}
        spellCheck={false}
        className="flex-1 resize-none rounded-none border-none px-4 py-4 focus-visible:ring-0 focus-visible:ring-offset-0"
      />

      {/* Commit stays reachable without covering the content — a sticky
          bar, not a floating action button. */}
      <form onSubmit={handleCommit} className="sticky bottom-0 border-t border-border bg-surface px-4 pt-3 pb-safe">
        {status === 'error' && error && (
          <div className="mb-2">
            <InlineBanner variant="error">
              {error}
              {needsReload && (
                <Button type="button" variant="link" size="sm" className="ml-2" onClick={() => router.refresh()}>
                  Reload file
                </Button>
              )}
            </InlineBanner>
          </div>
        )}
        {status === 'success' && (
          <div className="mb-2">
            <InlineBanner variant="success">Committed.</InlineBanner>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Update ${file.path}`}
            maxLength={500}
            aria-label="Commit message"
            className="flex-1"
          />
          <Button type="submit" disabled={!dirty || message.trim().length === 0 || status === 'committing'}>
            {status === 'committing' ? 'Committing…' : 'Commit'}
          </Button>
        </div>
        {dirty && <p className="mt-1.5 text-xs text-muted-foreground">Unsaved changes</p>}
      </form>
    </div>
  );
}