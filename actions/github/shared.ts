// file: actions/github/shared.ts

import { getServerAccessToken } from '@/lib/auth/session';
import {
  GitHubApiError,
  GitHubClient,
} from '@/lib/github/client';

import {
  isValidBranchName,
  isValidCommitMessage,
  isValidOwnerOrRepo,
  isValidRepoPath,
  isValidSha,
} from '@/lib/validation';

import type { ActionResult } from '@/types';

/* Types                                                                      */

export type ActionErrorCode =
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

/* GitHub client                                                              */

export async function getClient(): Promise<GitHubClient | null> {
  const token = await getServerAccessToken();

  if (!token) {
    return null;
  }

  return new GitHubClient(token);
}

/* Action results                                                             */

export function fail<T>(
  error: string,
  code: ActionErrorCode,
): ActionResult<T> {
  return {
    ok: false,
    error,
    code,
  };
}

/* GitHub API errors                                                          */

/**
 * Single source of truth for turning a GitHubApiError into a
 * (message, code) pair. fromApiError() and apiErrorMessage() both read
 * from this so the two can never drift out of sync.
 */
function describeApiError(e: unknown): { message: string; code: ActionErrorCode } {
  if (e instanceof GitHubApiError) {
    switch (e.code) {
      case 'NOT_FOUND':
        return { message: 'Not found.', code: 'NOT_FOUND' };
      case 'FORBIDDEN':
        return { message: 'You do not have permission for this.', code: 'FORBIDDEN' };
      case 'RATE_LIMITED':
        return { message: 'GitHub rate limit hit. Try again shortly.', code: 'RATE_LIMITED' };
      case 'SHA_MISMATCH':
        return {
          message: 'This file changed on GitHub since you opened it. Reload and retry.',
          code: 'SHA_MISMATCH',
        };
      case 'NETWORK':
        return { message: 'Network error reaching GitHub.', code: 'NETWORK' };
      default:
        return { message: 'GitHub request failed.', code: 'UNKNOWN' };
    }
  }
  return { message: 'Unexpected error.', code: 'UNKNOWN' };
}

export function fromApiError<T>(e: unknown): ActionResult<T> {
  const { message, code } = describeApiError(e);
  return fail(message, code);
}

/**
 * Returns only the user-facing message from an unknown/API error.
 *
 * Useful when an action needs to include progress information:
 * "Moved 2 of 5 files before this failed."
 */
export function apiErrorMessage(e: unknown): string {
  return describeApiError(e).message;
}

/* Common validation                                                          */

export function validateRepoRef(
  owner: string,
  repo: string,
): ActionResult<null> {
  if (
    !isValidOwnerOrRepo(owner) ||
    !isValidOwnerOrRepo(repo)
  ) {
    return fail(
      'Invalid repository reference.',
      'VALIDATION',
    );
  }

  return {
    ok: true,
    data: null,
  };
}

export function validateRepoBranch(
  owner: string,
  repo: string,
  branch: string,
): ActionResult<null> {
  if (
    !isValidOwnerOrRepo(owner) ||
    !isValidOwnerOrRepo(repo) ||
    !isValidBranchName(branch)
  ) {
    return fail(
      'Invalid repository or branch.',
      'VALIDATION',
    );
  }

  return {
    ok: true,
    data: null,
  };
}

export function validatePath(
  path: string,
): ActionResult<null> {
  if (!isValidRepoPath(path)) {
    return fail(
      'Invalid path.',
      'VALIDATION',
    );
  }

  return {
    ok: true,
    data: null,
  };
}

export function validateOptionalPath(
  path: string,
): ActionResult<null> {
  if (path !== '' && !isValidRepoPath(path)) {
    return fail(
      'Invalid path.',
      'VALIDATION',
    );
  }

  return {
    ok: true,
    data: null,
  };
}

export function validateCommitMessage(
  message: string,
): ActionResult<null> {
  if (!isValidCommitMessage(message)) {
    return fail(
      'Commit message is required (max 500 chars).',
      'VALIDATION',
    );
  }

  return {
    ok: true,
    data: null,
  };
}

export function validateSha(
  sha: string,
): ActionResult<null> {
  if (!isValidSha(sha)) {
    return fail(
      'Missing or invalid file version. Reload and retry.',
      'VALIDATION',
    );
  }

  return {
    ok: true,
    data: null,
  };
}

/**
 * Renaming a folder into itself or one of its own subpaths would create
 * new files inside a subtree that's still being read/deleted mid-loop —
 * source and destination overlap. Shared here since both a file rename
 * and a folder rename need the same guard.
 */
export function validateNoSelfNesting(
  oldPath: string,
  newPath: string,
): ActionResult<null> {
  if (newPath === oldPath || newPath.startsWith(`${oldPath}/`)) {
    return fail(
      'Cannot rename into itself or a subfolder of itself.',
      'VALIDATION',
    );
  }

  return {
    ok: true,
    data: null,
  };
}