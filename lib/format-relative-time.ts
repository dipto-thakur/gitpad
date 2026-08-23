// file: lib/format-relative-time.ts

/**
 * "3d ago", "2h ago", "just now" — compact relative time for file-explorer
 * style metadata. No date library needed for this granularity.
 */
export function formatRelativeTime(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60_000);
    const hours = Math.floor(diffMs / 3_600_000);
    const days = Math.floor(diffMs / 86_400_000);
  
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
  
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
  
    return `${Math.floor(months / 12)}y ago`;
  }