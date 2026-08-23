// file: hooks/useFileTree.ts
import { useEffect, useState } from 'react';
import { listTreeAction } from '@/actions/github';
import type { TreeEntry } from '@/types';

/**
 * Fetches and re-fetches a directory listing. Open/closed folder state now
 * lives in the URL (see useOpenDirs) rather than here, so it survives
 * navigating to the editor and back instead of resetting on remount.
 */
export function useFileTree(owner: string, repo: string, branch: string, path: string) {
  const [entries, setEntries] = useState<TreeEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    setError(null);

    listTreeAction(owner, repo, branch, path)
      .then((res) => {
        if (cancelled) return;
        if (res.ok) setEntries(res.data);
        else setError(res.error);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load directory.');
      });

    return () => {
      cancelled = true;
    };
  }, [owner, repo, branch, path, reloadToken]);

  function reload() {
    setReloadToken((t) => t + 1);
  }

  const isEmpty = !error && entries !== null && entries.length === 0;

  return { entries, error, reload, isEmpty };
}