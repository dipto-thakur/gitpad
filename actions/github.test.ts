import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/session', () => ({
  getServerAccessToken: vi.fn(async () => 'fake-token'),
}));

const mockGetFile = vi.fn();
const mockCommitFile = vi.fn();
const mockListRepositories = vi.fn();
const mockDeleteFile = vi.fn();

vi.mock('@/lib/github/client', async () => {
  const actual = await vi.importActual<typeof import('@/lib/github/client')>(
    '@/lib/github/client',
  );
  return {
    ...actual,
    GitHubClient: vi.fn().mockImplementation(() => ({
      getFile: mockGetFile,
      commitFile: mockCommitFile,
      listRepositories: mockListRepositories,
      deleteFile: mockDeleteFile,
    })),
  };
});

import { GitHubApiError } from '@/lib/github/client';
import {
  commitFileAction,
  deleteFileAction,
  getFileAction,
  listRepositoriesAction,
} from './github';

const VALID_SHA = 'a'.repeat(40);

describe('server action error mapping (mocked GitHubClient)', () => {
  beforeEach(() => {
    mockGetFile.mockReset();
    mockCommitFile.mockReset();
    mockListRepositories.mockReset();
    mockDeleteFile.mockReset();
  });

  it('commitFileAction: 409 conflict -> SHA_MISMATCH with reload-and-retry message', async () => {
    mockCommitFile.mockRejectedValueOnce(
      new GitHubApiError('conflict', 409, 'SHA_MISMATCH'),
    );
    const result = await commitFileAction({
      owner: 'dipto',
      repo: 'notes',
      branch: 'main',
      path: 'README.md',
      content: 'updated',
      message: 'Update README',
      sha: VALID_SHA,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('SHA_MISMATCH');
      expect(result.error.toLowerCase()).toContain('changed on github');
    }
  });

  it('commitFileAction: 404 (deleted upstream) -> explicit deleted message, not generic not-found', async () => {
    mockCommitFile.mockRejectedValueOnce(new GitHubApiError('missing', 404, 'NOT_FOUND'));
    const result = await commitFileAction({
      owner: 'dipto',
      repo: 'notes',
      branch: 'main',
      path: 'README.md',
      content: 'updated',
      message: 'Update README',
      sha: VALID_SHA,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('NOT_FOUND');
      expect(result.error).toContain('deleted from the repository upstream');
    }
  });

  it('getFileAction: 404 on open/reload -> explicit deleted-upstream message', async () => {
    mockGetFile.mockRejectedValueOnce(new GitHubApiError('missing', 404, 'NOT_FOUND'));
    const result = await getFileAction('dipto', 'notes', 'main', 'README.md');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('NOT_FOUND');
      expect(result.error).toContain('no longer exists in the repository');
    }
  });

  it('listRepositoriesAction: 429 -> RATE_LIMITED, friendly retry message', async () => {
    mockListRepositories.mockRejectedValueOnce(
      new GitHubApiError('rate limited', 429, 'RATE_LIMITED'),
    );
    const result = await listRepositoriesAction();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('RATE_LIMITED');
      expect(result.error.toLowerCase()).toContain('rate limit');
    }
  });

  it('commitFileAction: rejects invalid sha before ever calling GitHubClient', async () => {
    const result = await commitFileAction({
      owner: 'dipto',
      repo: 'notes',
      branch: 'main',
      path: 'README.md',
      content: 'updated',
      message: 'Update README',
      sha: 'not-a-real-sha',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('VALIDATION');
    expect(mockCommitFile).not.toHaveBeenCalled();
  });

  it('commitFileAction: succeeds and returns new content sha on 200', async () => {
    mockCommitFile.mockResolvedValueOnce({ commitSha: 'c'.repeat(40), contentSha: 'd'.repeat(40) });
    const result = await commitFileAction({
      owner: 'dipto',
      repo: 'notes',
      branch: 'main',
      path: 'README.md',
      content: 'updated',
      message: 'Update README',
      sha: VALID_SHA,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.contentSha).toBe('d'.repeat(40));
  });

  it('deleteFileAction: succeeds and returns the deletion commit sha', async () => {
    mockDeleteFile.mockResolvedValueOnce({ commitSha: 'e'.repeat(40) });
    const result = await deleteFileAction({
      owner: 'dipto',
      repo: 'notes',
      branch: 'main',
      path: 'old.md',
      message: 'Remove old.md',
      sha: VALID_SHA,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.commitSha).toBe('e'.repeat(40));
  });

  it('deleteFileAction: 404 (already gone) surfaces as a not-found error, never silently succeeds', async () => {
    mockDeleteFile.mockRejectedValueOnce(new GitHubApiError('missing', 404, 'NOT_FOUND'));
    const result = await deleteFileAction({
      owner: 'dipto',
      repo: 'notes',
      branch: 'main',
      path: 'old.md',
      message: 'Remove old.md',
      sha: VALID_SHA,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('NOT_FOUND');
  });

  it('deleteFileAction: rejects an empty commit message before calling GitHubClient', async () => {
    const result = await deleteFileAction({
      owner: 'dipto',
      repo: 'notes',
      branch: 'main',
      path: 'old.md',
      message: '   ',
      sha: VALID_SHA,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('VALIDATION');
    expect(mockDeleteFile).not.toHaveBeenCalled();
  });
});