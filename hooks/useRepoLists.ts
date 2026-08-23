// file: hooks/useRepoLists.ts
'use client';

import { useEffect, useState } from 'react';

const FAVORITES_KEY = 'gh-doc-editor:favorites';
const RECENTS_KEY = 'gh-doc-editor:recents';
const MAX_RECENTS = 8;

/**
 * Owns favorites + recents state, backed by localStorage. Extracted from
 * RepoSearch so the persistence concern is testable/reusable on its own —
 * the component only ever needs the derived arrays and two callbacks.
 */
export function useRepoLists() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]'));
      setRecents(JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]'));
    } catch {
      // ignore malformed local storage
    }
  }, []);

  function toggleFavorite(fullName: string) {
    setFavorites((prev) => {
      const next = prev.includes(fullName) ? prev.filter((f) => f !== fullName) : [...prev, fullName];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }

  function recordRecent(fullName: string) {
    try {
      const current: string[] = JSON.parse(localStorage.getItem(RECENTS_KEY) ?? '[]');
      const next = [fullName, ...current.filter((f) => f !== fullName)].slice(0, MAX_RECENTS);
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      setRecents(next);
    } catch {
      // ignore
    }
  }

  return { favorites, recents, toggleFavorite, recordRecent };
}