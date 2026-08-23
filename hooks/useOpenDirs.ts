// file: hooks/useOpenDirs.ts
'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function useOpenDirs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openDirs = useMemo(() => {
    const raw = searchParams.get('open');
    return new Set(raw ? raw.split(',').filter(Boolean) : []);
  }, [searchParams]);

  const toggleDir = useCallback(
    (entryPath: string) => {
      const next = new Set(openDirs);
      const opening = !next.has(entryPath);
      if (opening) next.add(entryPath);
      else next.delete(entryPath);

      const params = new URLSearchParams(searchParams.toString());
      if (next.size > 0) params.set('open', Array.from(next).join(','));
      else params.delete('open');

      // Opening a folder makes it the active location; closing one steps
      // the active location back up to its parent — this is what feeds
      // the Directory breadcrumb.
      if (opening) {
        params.set('at', entryPath);
      } else {
        const parent = entryPath.includes('/') ? entryPath.slice(0, entryPath.lastIndexOf('/')) : '';
        if (parent) params.set('at', parent);
        else params.delete('at');
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [openDirs, searchParams, router, pathname],
  );

  return { openDirs, toggleDir };
}