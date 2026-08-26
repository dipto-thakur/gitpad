// file: components/RepoSearch/RepoRow.tsx
'use client';

import { motion } from 'framer-motion';
import { SiGithub } from 'react-icons/si';
import { RiLockLine, RiStarFill, RiStarLine } from 'react-icons/ri';
import { RowLink } from '@/components/ui/row';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';
import type { RepoSummary } from '@/types';

/**
 * Single repo row. Favorite star sits leftmost (primary, always-visible
 * action — matches Files/Mail apps putting the pin/flag affordance before
 * the content, not after it). A soft bottom divider marks where each row
 * ends without needing a bordered-card look; pass isLast to suppress it
 * on a section's final row.
 */
export function RepoRow({
  repo,
  favorite,
  onToggleFavorite,
  onOpen,
  isLast = false,
}: {
  repo: RepoSummary;
  favorite: boolean;
  onToggleFavorite: (fullName: string) => void;
  onOpen: (fullName: string) => void;
  isLast?: boolean;
}) {
  return (
    <li
      className={cn(
        'flex min-w-0 items-center gap-0.5',
        !isLast && 'border-b border-zinc-200/60 dark:border-zinc-800/60',
      )}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={favorite}
        onClick={() => onToggleFavorite(repo.fullName)}
        className="flex h-11 w-9 shrink-0 items-center justify-center text-muted-foreground/50 transition-colors hover:text-muted-foreground dark:text-muted-foreground/50 dark:hover:text-muted-foreground"
      >
        {favorite ? (
          <RiStarFill className="h-4 w-4 text-amber-400" />
        ) : (
          <RiStarLine className="h-4 w-4" />
        )}
      </motion.button>

      <RowLink
        href={`/repos/${repo.owner}/${repo.name}`}
        onClick={() => onOpen(repo.fullName)}
        icon={<SiGithub className="h-[15px] w-[15px] shrink-0" />}
        label={repo.name}
        meta={
          <span className="flex items-center gap-1.5">
            {repo.private && <RiLockLine className="h-3.5 w-3.5 shrink-0" />}
            {formatRelativeTime(repo.updatedAt)}
          </span>
        }
        chevron
        className="min-w-0 flex-1"
      />
    </li>
  );
}