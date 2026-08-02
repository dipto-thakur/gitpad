import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/session', () => ({
  getServerAccessToken: vi.fn(async () => 'fake-token'),
}));

const mockGetFile = vi.fn();
const mockCommitFile = vi.fn();
const mockListRepositories = vi.fn();
const mockDeleteFile = vi.fn();
const mockCreateFile = vi.fn();

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
      createFile: mockCreateFile,
    })),
  };
});

import { BinaryFileError, GitHubApiError } from '@/lib/github/client';
import {
  commitFileAction,
  createFileAction,
  deleteFileAction,
  getFileAction,
  listRepositoriesAction,
  renameFileAction,
} from './github';

const VALID_SHA = 'a'.repeat(40);

describe('server action error mapping (mocked GitHubClient)', () => {
  beforeEach(() => {
    mockGetFile.mockReset();
    mockCommitFile.mockReset();
    mockListRepositories.mockReset();
    mockDeleteFile.mockReset();
    mockCreateFile.mockReset();
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

  it('getFileAction: binary content -> UNSUPPORTED_FILE with a clear "cannot be edited" message', async () => {
    mockGetFile.mockRejectedValueOnce(new BinaryFileError('logo.png'));
    const result = await getFileAction('dipto', 'notes', 'main', 'logo.png');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FILE');
      expect(result.error).toContain('cannot be edited here');
    }
  });

  it('getFileAction: opens files of any extension — no whitelist gate before the fetch', async () => {
    mockGetFile.mockResolvedValueOnce({
      path: 'main.py',
      content: 'print(1)',
      sha: 'a'.repeat(40),
      encoding: 'utf-8',
      size: 8,
    });
    const result = await getFileAction('dipto', 'notes', 'main', 'main.py');
    expect(result.ok).toBe(true);
    expect(mockGetFile).toHaveBeenCalledWith('dipto', 'notes', 'main', 'main.py');
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

  it('createFileAction: succeeds on a free path', async () => {
    mockCreateFile.mockResolvedValueOnce({ commitSha: 'm'.repeat(40), contentSha: 'n'.repeat(40) });
    const result = await createFileAction({
      owner: 'dipto',
      repo: 'notes',
      branch: 'main',
      path: 'new-doc.md',
      content: '# New',
      message: 'Create new-doc.md',
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.contentSha).toBe('n'.repeat(40));
  });

  it('createFileAction: existing path -> friendly "already exists" message, not stale-sha wording', async () => {
    mockCreateFile.mockRejectedValueOnce(new GitHubApiError('exists', 422, 'SHA_MISMATCH'));
    const result = await createFileAction({
      owner: 'dipto',
      repo: 'notes',
      branch: 'main',
      path: 'README.md',
      content: 'dup',
      message: 'Create README.md',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('VALIDATION');
      expect(result.error).toContain('already exists');
    }
  });

  it('createFileAction: accepts arbitrary extensions now — .py, .html, .css, Dockerfile all succeed (no whitelist)', async () => {
    for (const path of ['script.py', 'index.html', 'style.css', 'Dockerfile']) {
      mockCreateFile.mockResolvedValueOnce({ commitSha: 'm'.repeat(40), contentSha: 'n'.repeat(40) });
      const result = await createFileAction({
        owner: 'dipto',
        repo: 'notes',
        branch: 'main',
        path,
        content: 'content',
        message: `Create ${path}`,
      });
      expect(result.ok).toBe(true);
    }
  });

  it('createFileAction: still rejects an invalid (path-traversal) path regardless of extension', async () => {
    const result = await createFileAction({
      owner: 'dipto',
      repo: 'notes',
      branch: 'main',
      path: '../../etc/passwd',
      content: '',
      message: 'nope',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('VALIDATION');
    expect(mockCreateFile).not.toHaveBeenCalled();
  });

  it('renameFileAction: reads fresh content, creates new path, then deletes old path with the fresh sha', async () => {
    mockGetFile.mockResolvedValueOnce({
      path: 'old.md',
      content: 'body',
      sha: VALID_SHA,
      encoding: 'utf-8',
      size: 4,
    });
    mockCreateFile.mockResolvedValueOnce({ commitSha: 'c1'.padEnd(40, '0'), contentSha: 'd1'.padEnd(40, '0') });
    mockDeleteFile.mockResolvedValueOnce({ commitSha: 'c2'.padEnd(40, '0') });

    const result = await renameFileAction({
      owner: 'dipto',
      repo: 'notes',
      branch: 'main',
      oldPath: 'old.md',
      newPath: 'new.md',
      message: 'Rename old.md to new.md',
    });

    expect(result.ok).toBe(true);
    expect(mockCreateFile).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'new.md', content: 'body' }),
    );
    // Delete must only be called with the freshly-read sha, and only after
    // create has already resolved.
    expect(mockDeleteFile).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'old.md', sha: VALID_SHA }),
    );
    if (result.ok) {
      expect(result.data.commitSha).toBe('c1'.padEnd(40, '0'));
      expect(result.data.deleteCommitSha).toBe('c2'.padEnd(40, '0'));
    }
  });

  it('renameFileAction: new path already taken -> never deletes the old file', async () => {
    mockGetFile.mockResolvedValueOnce({
      path: 'old.md',
      content: 'body',
      sha: VALID_SHA,
      encoding: 'utf-8',
      size: 4,
    });
    mockCreateFile.mockRejectedValueOnce(new GitHubApiError('exists', 422, 'SHA_MISMATCH'));

    const result = await renameFileAction({
      owner: 'dipto',
      repo: 'notes',
      branch: 'main',
      oldPath: 'old.md',
      newPath: 'taken.md',
      message: 'Rename old.md to taken.md',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('already exists');
    expect(mockDeleteFile).not.toHaveBeenCalled();
  });

  it('renameFileAction: create succeeds but delete fails -> reports partial state honestly, does not claim full success', async () => {
    mockGetFile.mockResolvedValueOnce({
      path: 'old.md',
      content: 'body',
      sha: VALID_SHA,
      encoding: 'utf-8',
      size: 4,
    });
    mockCreateFile.mockResolvedValueOnce({ commitSha: 'c1'.padEnd(40, '0'), contentSha: 'd1'.padEnd(40, '0') });
    mockDeleteFile.mockRejectedValueOnce(new GitHubApiError('conflict', 409, 'SHA_MISMATCH'));

    const result = await renameFileAction({
      owner: 'dipto',
      repo: 'notes',
      branch: 'main',
      oldPath: 'old.md',
      newPath: 'new.md',
      message: 'Rename old.md to new.md',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('new.md');
      expect(result.error).toContain("couldn't remove old.md");
    }
  });

  it('renameFileAction: rejects identical old/new paths before touching GitHubClient', async () => {
    const result = await renameFileAction({
      owner: 'dipto',
      repo: 'notes',
      branch: 'main',
      oldPath: 'same.md',
      newPath: 'same.md',
      message: 'noop',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('VALIDATION');
    expect(mockGetFile).not.toHaveBeenCalled();
  });
});