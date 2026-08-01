'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listTreeAction } from '@/actions/github';
import type { TreeEntry } from '@/types';

export function FileBrowser({
  owner,
  repo,
  branch,
  path,
  depth = 0,
}: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  depth?: number;
}) {
  const [entries, setEntries] = useState<TreeEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openDirs, setOpenDirs] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    setError(null);
    listTreeAction(owner, repo, branch, path).then((res) => {
      if (cancelled) return;
      if (res.ok) setEntries(res.data);
      else setError(res.error);
    });
    return () => {
      cancelled = true;
    };
  }, [owner, repo, branch, path]);

  function toggleDir(p: string) {
    setOpenDirs((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (entries === null) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (entries.length === 0) {
    return <p className="text-sm text-muted">Empty directory.</p>;
  }

  return (
    <ul style={{ paddingLeft: depth === 0 ? 0 : 16 }} className="space-y-0.5">
      {entries.map((entry) => (
        <li key={entry.path}>
          {entry.type === 'dir' ? (
            <>
              <button
                onClick={() => toggleDir(entry.path)}
                className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-sm hover:bg-gray-50"
              >
                <span className="text-muted">{openDirs.has(entry.path) ? '▾' : '▸'}</span>
                <span>{entry.name}/</span>
              </button>
              {openDirs.has(entry.path) && (
                <FileBrowser
                  owner={owner}
                  repo={repo}
                  branch={branch}
                  path={entry.path}
                  depth={depth + 1}
                />
              )}
            </>
          ) : entry.supported ? (
            <Link
              href={`/repos/${owner}/${repo}/edit/${entry.path}?branch=${encodeURIComponent(branch)}`}
              className="flex items-center gap-1.5 rounded px-2 py-1 text-sm hover:bg-gray-50"
            >
              <span className="text-muted">·</span>
              <span>{entry.name}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 rounded px-2 py-1 text-sm text-muted/60">
              <span>·</span>
              <span>{entry.name}</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
