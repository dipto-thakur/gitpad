// file: components/Editor.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { commitFileAction } from '@/actions/github';
import { CommitBar } from '@/components/editor/CommitBar';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { Textarea } from '@/components/ui/textarea';

import type { FileContent } from '@/types';

type EditorProps = {
  owner: string;
  repo: string;
  branch: string;
  file: FileContent;
};

export function Editor({
  owner,
  repo,
  branch,
  file,
}: EditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [content, setContent] = useState(file.content);
  const [sha, setSha] = useState(file.sha);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState <
    'idle' | 'committing' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState<string | null>(null);

  const dirty = content !== file.content;

  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = '';
    }

    window.addEventListener('beforeunload', handler);

    return () => {
      window.removeEventListener('beforeunload', handler);
    };
  }, [dirty]);

  function handleTab(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Tab') return;

    e.preventDefault();

    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    const next =
      content.slice(0, start) +
      '\t' +
      content.slice(end);

    setContent(next);

    requestAnimationFrame(() => {
      el.selectionStart = start + 1;
      el.selectionEnd = start + 1;
    });
  }

  async function handleCommit(
    e: React.FormEvent<HTMLFormElement>
  ) {
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

  const needsReload =
    status === 'error' &&
    error !== null &&
    (error.toLowerCase().includes('changed on github') ||
      error
        .toLowerCase()
        .includes('deleted from the repository'));

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 dark:bg-zinc-950">
      <EditorHeader
        owner={owner}
        repo={repo}
        branch={branch}
        path={file.path}
        sha={sha}
      />

      <main className="flex min-h-0 flex-1">
        <div className="mx-auto flex w-full flex-1 flex-col ">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);

              if (status !== 'idle') {
                setStatus('idle');
              }
            }}
            onKeyDown={handleTab}
            spellCheck={true}
            className="min-h-full w-full flex-1 resize-none border-none bg-transparent  font-mono  leading-[1.75] tracking-[-0.01em] text-zinc-800 shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-zinc-200"
          />
        </div>
      </main>

      <CommitBar
        path={file.path}
        dirty={dirty}
        message={message}
        status={status}
        error={error}
        needsReload={needsReload}
        onMessageChange={setMessage}
        onSubmit={handleCommit}
      />
    </div>
  );
}