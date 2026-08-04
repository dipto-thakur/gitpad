import 'server-only';
import {
  decodeBase64ToUtf8Strict,
  BinaryContentError,
  encodeUtf8ToBase64,
  MAX_EDITABLE_FILE_BYTES,
} from '@/lib/encoding/base64';
import type { BranchSummary, FileContent, RepoSummary, TreeEntry } from '@/types';
import { isLikelyBinaryPath } from '@/lib/validation';

const GITHUB_API = process.env.GITHUB_API_BASE_URL ?? 'https://api.github.com';

export class GitHubApiError extends Error {
  status: number;
  code: 'NOT_FOUND' | 'FORBIDDEN' | 'RATE_LIMITED' | 'NETWORK' | 'SHA_MISMATCH' | 'UNKNOWN';

  constructor(message: string, status: number, code: GitHubApiError['code']) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * Thrown by getFile() when the fetched bytes fail strict UTF-8 validation —
 * i.e. the file is actually binary, regardless of what its extension
 * suggested. Kept distinct from GitHubApiError since this isn't an HTTP
 * failure; the request succeeded, the content just isn't editable text.
 */
export class BinaryFileError extends Error {
  constructor(path: string) {
    super(`"${path}" is a binary file and cannot be edited here.`);
    this.name = 'BinaryFileError';
  }
}

function classify(status: number): GitHubApiError['code'] {
  if (status === 404) return 'NOT_FOUND';
  if (status === 403) return 'FORBIDDEN';
  if (status === 409 || status === 422) return 'SHA_MISMATCH';
  if (status === 429) return 'RATE_LIMITED';
  return 'UNKNOWN';
}

/**
 * A single thin wrapper around fetch for the GitHub REST API. The access
 * token never leaves the server: this class is only ever imported from
 * server actions and route handlers.
 */
export class GitHubClient {
  private readonly token: string;

  constructor(accessToken: string) {
    this.token = accessToken;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${GITHUB_API}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(init?.headers ?? {}),
        },
        cache: 'no-store',
      });
    } catch {
      throw new GitHubApiError('Network error contacting GitHub', 0, 'NETWORK');
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new GitHubApiError(
        `GitHub API error (${res.status}): ${sanitizeErrorBody(body)}`,
        res.status,
        classify(res.status),
      );
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  /**
   * GraphQL has its own response shape — a 200 with an `errors` array is a
   * failure, unlike REST where failure means non-2xx. Kept separate from
   * request() rather than overloading it with a GraphQL-aware branch.
   */
  private async graphqlRequest<T>(query: string): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${GITHUB_API}/graphql`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
        cache: 'no-store',
      });
    } catch {
      throw new GitHubApiError('Network error contacting GitHub', 0, 'NETWORK');
    }

    if (!res.ok) {
      throw new GitHubApiError(`GitHub GraphQL error (${res.status})`, res.status, classify(res.status));
    }

    const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
    if (json.errors && json.errors.length > 0) {
      throw new GitHubApiError(json.errors[0]!.message.slice(0, 200), 200, 'UNKNOWN');
    }
    if (!json.data) {
      throw new GitHubApiError('GitHub GraphQL returned no data', 200, 'UNKNOWN');
    }
    return json.data;
  }

  /**
   * Total contributions in the past year and the current consecutive-day
   * streak, for the profile drawer. Purely informational — callers should
   * treat failures here as non-fatal (see actions/profile.ts).
   */
 async getContributionStats(): Promise<{
    totalContributions: number;
    currentStreak: number;
    last7Days: { date: string; count: number }[];
  }> {
    const query = `
      query {
        viewer {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;
    const data = await this.graphqlRequest<GhContributionsData>(query);
    const calendar = data.viewer.contributionsCollection.contributionCalendar;
    const days = calendar.weeks.flatMap((w) => w.contributionDays);
    const last7Days = days.slice(-7).map((d) => ({
      date: d.date,
      count: d.contributionCount,
    }));
    return {
      totalContributions: calendar.totalContributions,
      currentStreak: computeCurrentStreak(days),
      last7Days,
    };
  }
  async listRepositories(): Promise<RepoSummary[]> {
    const repos = await this.request<GhRepo[]>(
      '/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member',
    );
    return repos.map(toRepoSummary);
  }

  async listBranches(owner: string, repo: string): Promise<BranchSummary[]> {
    const branches = await this.request<GhBranch[]>(
      `/repos/${owner}/${repo}/branches?per_page=100`,
    );
    return branches.map((b) => ({ name: b.name, protected: b.protected }));
  }

  async getRepo(owner: string, repo: string): Promise<RepoSummary> {
    const r = await this.request<GhRepo>(`/repos/${owner}/${repo}`);
    return toRepoSummary(r);
  }

  async listTree(owner: string, repo: string, branch: string, path: string): Promise<TreeEntry[]> {
    const encodedPath = path
      .split('/')
      .filter(Boolean)
      .map(encodeURIComponent)
      .join('/');
    const qs = `?ref=${encodeURIComponent(branch)}`;
    const url = encodedPath
      ? `/repos/${owner}/${repo}/contents/${encodedPath}${qs}`
      : `/repos/${owner}/${repo}/contents${qs}`;
    const items = await this.request<GhContentItem[] | GhContentItem>(url);
    const list = Array.isArray(items) ? items : [items];
    return list
      .map((item) => toTreeEntry(item))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }

  async getFile(owner: string, repo: string, branch: string, path: string): Promise<FileContent> {
    const encodedPath = path.split('/').filter(Boolean).map(encodeURIComponent).join('/');
    const item = await this.request<GhContentItem>(
      `/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`,
    );
    if (Array.isArray(item) || item.type !== 'file') {
      throw new GitHubApiError('Path is not a file', 400, 'UNKNOWN');
    }
    if ((item.size ?? 0) > MAX_EDITABLE_FILE_BYTES) {
      throw new GitHubApiError('File too large to edit safely', 413, 'UNKNOWN');
    }
    let content = '';
    if (item.content) {
      try {
        content = decodeBase64ToUtf8Strict(item.content);
      } catch (e) {
        if (e instanceof BinaryContentError) throw new BinaryFileError(path);
        throw e;
      }
    }
    return {
      path: item.path,
      content,
      sha: item.sha,
      encoding: 'utf-8',
      size: item.size ?? 0,
    };
  }

  /**
   * Creates a new file. Deliberately omits `sha` in the request body:
   * GitHub's Contents API treats that as "create", and rejects the write
   * with 422 if a file already exists at that path — which is exactly the
   * safety property we want (never silently clobber an existing file via
   * "create").
   */
  async createFile(params: {
    owner: string;
    repo: string;
    branch: string;
    path: string;
    content: string;
    message: string;
  }): Promise<{ commitSha: string; contentSha: string }> {
    const encodedPath = params.path.split('/').filter(Boolean).map(encodeURIComponent).join('/');
    const res = await this.request<GhCommitResponse>(
      `/repos/${params.owner}/${params.repo}/contents/${encodedPath}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: params.message,
          content: encodeUtf8ToBase64(params.content),
          branch: params.branch,
        }),
      },
    );
    return {
      commitSha: res.commit.sha,
      contentSha: res.content?.sha ?? '',
    };
  }

  /**
   * Commits new content to a file. GitHub's Contents API is optimistic-
   * concurrency: the caller must supply the sha it last read. If the file
   * has changed remotely since, GitHub returns 409/422 and we surface that
   * as SHA_MISMATCH so the UI can force a reload instead of overwriting.
   */
  async commitFile(params: {
    owner: string;
    repo: string;
    branch: string;
    path: string;
    content: string;
    message: string;
    sha: string;
  }): Promise<{ commitSha: string; contentSha: string }> {
    const encodedPath = params.path.split('/').filter(Boolean).map(encodeURIComponent).join('/');
    const res = await this.request<GhCommitResponse>(
      `/repos/${params.owner}/${params.repo}/contents/${encodedPath}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: params.message,
          content: encodeUtf8ToBase64(params.content),
          sha: params.sha,
          branch: params.branch,
        }),
      },
    );
    return {
      commitSha: res.commit.sha,
      contentSha: res.content?.sha ?? '',
    };
  }

  async deleteFile(params: {
    owner: string;
    repo: string;
    branch: string;
    path: string;
    message: string;
    sha: string;
  }): Promise<{ commitSha: string }> {
    const encodedPath = params.path.split('/').filter(Boolean).map(encodeURIComponent).join('/');
    const res = await this.request<GhCommitResponse>(
      `/repos/${params.owner}/${params.repo}/contents/${encodedPath}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: params.message,
          sha: params.sha,
          branch: params.branch,
        }),
      },
    );
    return { commitSha: res.commit.sha };
  }
}

/**
 * Counts consecutive days with at least one contribution, walking backward
 * from the most recent day in `days` (chronological order, oldest first —
 * GitHub's contributionCalendar.weeks shape). Today is allowed to have zero
 * contributions without breaking the streak, since the day isn't over yet;
 * any earlier zero-contribution day stops the count. Exported for testing.
 */
export function computeCurrentStreak(days: { date: string; contributionCount: number }[]): number {
  let streak = 0;
  let skippedToday = false;
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i]!;
    if (day.contributionCount > 0) {
      streak++;
    } else if (i === days.length - 1 && !skippedToday) {
      skippedToday = true;
      continue;
    } else {
      break;
    }
  }
  return streak;
}

function sanitizeErrorBody(body: string): string {
  // Never surface raw response bodies (may contain internal detail); return
  // a short, generic excerpt only.
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed?.message === 'string') return parsed.message.slice(0, 200);
  } catch {
    // ignore
  }
  return 'request failed';
}

function toRepoSummary(r: GhRepo): RepoSummary {
  return {
    id: r.id,
    owner: r.owner.login,
    name: r.name,
    fullName: r.full_name,
    private: r.private,
    defaultBranch: r.default_branch,
    updatedAt: r.updated_at,
  };
}

function toTreeEntry(item: GhContentItem): TreeEntry {
  const type: TreeEntry['type'] = item.type === 'dir' ? 'dir' : 'file';
  return {
    path: item.path,
    name: item.name,
    type,
    sha: item.sha,
    size: item.size,
    supported: type === 'dir' ? true : !isLikelyBinaryPath(item.name),
  };
}

// --- Minimal GitHub REST response shapes (only fields we use) ---

interface GhRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  updated_at: string;
  owner: { login: string };
}

interface GhBranch {
  name: string;
  protected: boolean;
}

interface GhContentItem {
  name: string;
  path: string;
  sha: string;
  size?: number;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  content?: string;
}

interface GhContributionsData {
  viewer: {
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: number;
        weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
      };
    };
  };
}

interface GhCommitResponse {
  content: { sha: string } | null;
  commit: { sha: string };
}