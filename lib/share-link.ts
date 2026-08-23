// file: lib/share-link.ts

/**
 * Builds the canonical GitHub URL for a file or folder at a given branch —
 * shareable outside the app, opens directly on github.com.
 */
export function buildGitHubUrl(params: {
    owner: string;
    repo: string;
    branch: string;
    path: string;
    isDir: boolean;
  }): string {
    const { owner, repo, branch, path, isDir } = params;
    const kind = isDir ? 'tree' : 'blob';
    return `https://github.com/${owner}/${repo}/${kind}/${encodeURIComponent(branch)}/${path
      .split('/')
      .map(encodeURIComponent)
      .join('/')}`;
  }
  
  /**
   * Native share sheet (mobile) with clipboard fallback (desktop / browsers
   * without the Web Share API). Returns which path was taken so callers can
   * show the right feedback — 'shared' needs no extra UI (OS handles it),
   * 'copied' should show a "Copied!" style confirmation.
   */
  export async function shareOrCopyLink(params: {
    title: string;
    url: string;
  }): Promise<'shared' | 'copied' | 'failed'> {
    const { title, url } = params;
  
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
        return 'shared';
      } catch {
        // User cancelled the share sheet, or share failed — fall through
        // to clipboard rather than treating cancellation as an error.
      }
    }
  
    try {
      await navigator.clipboard.writeText(url);
      return 'copied';
    } catch {
      return 'failed';
    }
  }