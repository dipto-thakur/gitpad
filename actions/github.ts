'use server';

import { getServerAccessToken } from '@/lib/auth/session';
import { GitHubApiError, GitHubClient } from '@/lib/github/client';
import {
  isSupportedFile,
  isValidBranchName,
  isValidCommitMessage,
  isValidOwnerOrRepo,
  isValidRepoPath,
  isValidSha,
} from '@/lib/validation';
import type {
  ActionResult,
  BranchSummary,
  CommitResult,
  FileContent,
  RepoSummary,
  TreeEntry,
} from '@/types';

async function getClient(): Promise<GitHubClient | null> {
  const token = await getServerAccessToken();
  if (!token) return null;
  return new GitHubClient(token);
}

function fail<T>(
  error: string,
  code:
    | 'UNAUTHENTICATED'
    | 'NOT_FOUND'
    | 'FORBIDDEN'
    | 'RATE_LIMITED'
    | 'SHA_MISMATCH'
    | 'VALIDATION'
    | 'NETWORK'
    | 'UNSUPPORTED_FILE'
    | 'FILE_TOO_LARGE'
    | 'UNKNOWN',
): ActionResult<T> {
  return { ok: false, error, code };
}

function fromApiError<T>(e: unknown): ActionResult<T> {
  if (e instanceof GitHubApiError) {
    if (e.code === 'NOT_FOUND') return fail('Not found.', 'NOT_FOUND');
    if (e.code === 'FORBIDDEN') return fail('You do not have permission for this.', 'FORBIDDEN');
    if (e.code === 'RATE_LIMITED') return fail('GitHub rate limit hit. Try again shortly.', 'RATE_LIMITED');
    if (e.code === 'SHA_MISMATCH')
      return fail('This file changed on GitHub since you opened it. Reload and retry.', 'SHA_MISMATCH');
    if (e.code === 'NETWORK') return fail('Network error reaching GitHub.', 'NETWORK');
    return fail('GitHub request failed.', 'UNKNOWN');
  }
  return fail('Unexpected error.', 'UNKNOWN');
}

export async function listRepositoriesAction(): Promise<ActionResult<RepoSummary[]>> {
  const client = await getClient();
  if (!client) return fail('Sign in required.', 'UNAUTHENTICATED');
  try {
    const repos = await client.listRepositories();
    return { ok: true, data: repos };
  } catch (e) {
    return fromApiError(e);
  }
}

export async function listBranchesAction(
  owner: string,
  repo: string,
): Promise<ActionResult<BranchSummary[]>> {
  const client = await getClient();
  if (!client) return fail('Sign in required.', 'UNAUTHENTICATED');
  if (!isValidOwnerOrRepo(owner) || !isValidOwnerOrRepo(repo)) {
    return fail('Invalid repository reference.', 'VALIDATION');
  }
  try {
    const branches = await client.listBranches(owner, repo);
    return { ok: true, data: branches };
  } catch (e) {
    return fromApiError(e);
  }
}

export async function getRepoAction(owner: string, repo: string): Promise<ActionResult<RepoSummary>> {
  const client = await getClient();
  if (!client) return fail('Sign in required.', 'UNAUTHENTICATED');
  if (!isValidOwnerOrRepo(owner) || !isValidOwnerOrRepo(repo)) {
    return fail('Invalid repository reference.', 'VALIDATION');
  }
  try {
    const r = await client.getRepo(owner, repo);
    return { ok: true, data: r };
  } catch (e) {
    return fromApiError(e);
  }
}

export async function listTreeAction(
  owner: string,
  repo: string,
  branch: string,
  path: string,
): Promise<ActionResult<TreeEntry[]>> {
  const client = await getClient();
  if (!client) return fail('Sign in required.', 'UNAUTHENTICATED');
  if (!isValidOwnerOrRepo(owner) || !isValidOwnerOrRepo(repo) || !isValidBranchName(branch)) {
    return fail('Invalid repository or branch.', 'VALIDATION');
  }
  if (path !== '' && !isValidRepoPath(path)) {
    return fail('Invalid path.', 'VALIDATION');
  }
  try {
    const entries = await client.listTree(owner, repo, branch, path);
    return { ok: true, data: entries };
  } catch (e) {
    return fromApiError(e);
  }
}

export async function getFileAction(
  owner: string,
  repo: string,
  branch: string,
  path: string,
): Promise<ActionResult<FileContent>> {
  const client = await getClient();
  if (!client) return fail('Sign in required.', 'UNAUTHENTICATED');
  if (!isValidOwnerOrRepo(owner) || !isValidOwnerOrRepo(repo) || !isValidBranchName(branch)) {
    return fail('Invalid repository or branch.', 'VALIDATION');
  }
  if (!isValidRepoPath(path)) return fail('Invalid path.', 'VALIDATION');
  if (!isSupportedFile(path)) return fail('This file type is not editable here.', 'UNSUPPORTED_FILE');
  try {
    const file = await client.getFile(owner, repo, branch, path);
    return { ok: true, data: file };
  } catch (e) {
    if (e instanceof GitHubApiError && e.status === 413) {
      return fail('File is too large to edit here.', 'FILE_TOO_LARGE');
    }
    if (e instanceof GitHubApiError && e.code === 'NOT_FOUND') {
      return fail(
        'This file no longer exists in the repository. It may have been deleted or moved upstream.',
        'NOT_FOUND',
      );
    }
    return fromApiError(e);
  }
}

export async function commitFileAction(params: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  content: string;
  message: string;
  sha: string;
}): Promise<ActionResult<CommitResult>> {
  const client = await getClient();
  if (!client) return fail('Sign in required.', 'UNAUTHENTICATED');
  const { owner, repo, branch, path, content, message, sha } = params;
  if (!isValidOwnerOrRepo(owner) || !isValidOwnerOrRepo(repo) || !isValidBranchName(branch)) {
    return fail('Invalid repository or branch.', 'VALIDATION');
  }
  if (!isValidRepoPath(path)) return fail('Invalid path.', 'VALIDATION');
  if (!isSupportedFile(path)) return fail('This file type is not editable here.', 'UNSUPPORTED_FILE');
  if (!isValidCommitMessage(message)) return fail('Commit message is required (max 500 chars).', 'VALIDATION');
  if (!isValidSha(sha)) return fail('Missing or invalid file version. Reload and retry.', 'VALIDATION');

  try {
    const result = await client.commitFile({ owner, repo, branch, path, content, message, sha });
    return { ok: true, data: result };
  } catch (e) {
    if (e instanceof GitHubApiError && e.code === 'NOT_FOUND') {
      return fail(
        'This file was deleted from the repository upstream. Reload to see the current state.',
        'NOT_FOUND',
      );
    }
    return fromApiError(e);
  }
}

export async function deleteFileAction(params: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  message: string;
  sha: string;
}): Promise<ActionResult<{ commitSha: string }>> {
  const client = await getClient();
  if (!client) return fail('Sign in required.', 'UNAUTHENTICATED');
  const { owner, repo, branch, path, message, sha } = params;
  if (!isValidOwnerOrRepo(owner) || !isValidOwnerOrRepo(repo) || !isValidBranchName(branch)) {
    return fail('Invalid repository or branch.', 'VALIDATION');
  }
  if (!isValidRepoPath(path)) return fail('Invalid path.', 'VALIDATION');
  if (!isValidCommitMessage(message)) return fail('Commit message is required.', 'VALIDATION');
  if (!isValidSha(sha)) return fail('Missing or invalid file version. Reload and retry.', 'VALIDATION');

  try {
    const result = await client.deleteFile({ owner, repo, branch, path, message, sha });
    return { ok: true, data: result };
  } catch (e) {
    return fromApiError(e);
  }
}