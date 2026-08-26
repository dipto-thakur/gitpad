// file: components/RepoSearch/SearchField.tsx
'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

/**
 * Search input with a leading icon and a clear (×) button once there's a
 * query — standard iOS/Android search-bar affordances, missing from the
 * original bare <Input>.
 */
export function SearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground text-muted-foreground"
        strokeWidth={2}
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search repositories"
        aria-label="Search repositories"
        className="h-11 rounded-xl border-border/80 bg-background pl-10 pr-9 text-[14.5px] placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-border dark:bg-muted dark:placeholder:text-muted-foreground/50"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}