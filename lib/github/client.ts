import 'server-only';
import { decodeBase64ToUtf8, encodeUtf8ToBase64, MAX_EDITABLE_FILE_BYTES } from '@/lib/encoding/base64';
import type { BranchSummary, FileContent, RepoSummary, TreeEntry } from '@/types';
import { isSupportedFile } from '@/lib/validation';

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
    if (!isSupportedFile(path)) {
      throw new GitHubApiError('Unsupported file type', 400, 'UNKNOWN');
    }
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
    const content = item.content ? decodeBase64ToUtf8(item.content) : '';
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
    supported: type === 'dir' ? true : isSupportedFile(item.name),
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

interface GhCommitResponse {
  content: { sha: string } | null;
  commit: { sha: string };
}