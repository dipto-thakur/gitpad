// file: components/editor/CommitBar.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { InlineBanner } from '@/components/ui/inline-banner';
import { Input } from '@/components/ui/input';

type CommitBarProps = {
  path: string;
  dirty: boolean;
  message: string;
  status: 'idle' | 'committing' | 'success' | 'error';
  error: string | null;
  needsReload: boolean;
  onMessageChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function CommitBar({
  path,
  dirty,
  message,
  status,
  error,
  needsReload,
  onMessageChange,
  onSubmit,
}: CommitBarProps) {
  const router = useRouter();

 return (
    <form
      onSubmit={onSubmit}
      className="sticky bottom-0 border-t bg-background/90 px-4 pb-safe pt-3.5 backdrop-blur-md"
    >
      {status === 'error' && error && (
        <div className="mb-2.5">
          <InlineBanner variant="error">
            {error}
            {needsReload && (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="ml-2"
                onClick={() => router.refresh()}
              >
                Reload file
              </Button>
            )}
          </InlineBanner>
        </div>
      )}

      {status === 'success' && (
        <div className="mb-2.5">
          <InlineBanner variant="success">
            Committed.
          </InlineBanner>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={`Update ${path}`}
          maxLength={500}
          aria-label="Commit message"
          className="h-10 flex-1 text-[14px]"
        />

        <Button
          type="submit"
          disabled={
            !dirty ||
            message.trim().length === 0 ||
            status === 'committing'
          }
          className="h-10 shrink-0 px-4 text-[14px] font-medium"
        >
          {status === 'committing' ? 'Committing…' : 'Commit'}
        </Button>
      </div>

      <p
        className={`mt-2 text-[11.5px] leading-none transition-opacity ${
          dirty ? 'text-muted-foreground opacity-100' : 'opacity-0'
        }`}
      >
        Unsaved changes
      </p>
    </form>
  );
}