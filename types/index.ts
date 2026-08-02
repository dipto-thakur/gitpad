export interface RepoSummary {
  id: number;
  owner: string;
  name: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
  updatedAt: string;
}

export interface BranchSummary {
  name: string;
  protected: boolean;
}

export type TreeEntryType = 'file' | 'dir';

export interface TreeEntry {
  path: string;
  name: string;
  type: TreeEntryType;
  sha: string;
  size?: number;
  supported: boolean;
}

export interface FileContent {
  path: string;
  content: string; // decoded UTF-8 text
  sha: string;
  encoding: 'utf-8';
  size: number;
}

export interface CommitResult {
  commitSha: string;
  contentSha: string;
}

export interface RenameResult {
  commitSha: string;
  deleteCommitSha: string;
}

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: ErrorCode };

export type ErrorCode =
  | 'UNAUTHENTICATED'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'SHA_MISMATCH'
  | 'VALIDATION'
  | 'NETWORK'
  | 'UNSUPPORTED_FILE'
  | 'FILE_TOO_LARGE'
  | 'UNKNOWN';