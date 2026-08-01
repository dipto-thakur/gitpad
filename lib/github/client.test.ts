import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GitHubApiError, GitHubClient } from './client';
import { encodeUtf8ToBase64 } from '@/lib/encoding/base64';

function mockResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe('GitHubClient integration (mocked fetch)', () => {
  const client = new GitHubClient('fake-token');

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('commitFile: 409 conflict maps to SHA_MISMATCH', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(409, { message: 'sha does not match' }),
    );
    await expect(
      client.commitFile({
        owner: 'dipto',
        repo: 'notes',
        branch: 'main',
        path: 'README.md',
        content: 'new content',
        message: 'update',
        sha: 'a'.repeat(40),
      }),
    ).rejects.toMatchObject({ code: 'SHA_MISMATCH', status: 409 } satisfies Partial<GitHubApiError>);
  });

  it('commitFile: 422 unprocessable also maps to SHA_MISMATCH', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(422, { message: 'sha wasn\'t supplied' }),
    );
    await expect(
      client.commitFile({
        owner: 'dipto',
        repo: 'notes',
        branch: 'main',
        path: 'README.md',
        content: 'new content',
        message: 'update',
        sha: 'a'.repeat(40),
      }),
    ).rejects.toMatchObject({ code: 'SHA_MISMATCH', status: 422 });
  });

  it('listRepositories: 429 maps to RATE_LIMITED', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(429, { message: 'API rate limit exceeded' }),
    );
    await expect(client.listRepositories()).rejects.toMatchObject({
      code: 'RATE_LIMITED',
      status: 429,
    });
  });

  it('getFile: 404 (deleted upstream) maps to NOT_FOUND', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(404, { message: 'Not Found' }));
    await expect(client.getFile('dipto', 'notes', 'main', 'README.md')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  it('commitFile: 404 (file removed before commit lands) maps to NOT_FOUND', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(404, { message: 'Not Found' }));
    await expect(
      client.commitFile({
        owner: 'dipto',
        repo: 'notes',
        branch: 'main',
        path: 'README.md',
        content: 'new content',
        message: 'update',
        sha: 'a'.repeat(40),
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });

  it('getFile: succeeds and decodes base64 content on 200', async () => {
    const text = 'hello world';
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(200, {
        name: 'README.md',
        path: 'README.md',
        sha: 'a'.repeat(40),
        size: text.length,
        type: 'file',
        content: encodeUtf8ToBase64(text),
      }),
    );
    const result = await client.getFile('dipto', 'notes', 'main', 'README.md');
    expect(result.content).toBe(text);
    expect(result.sha).toBe('a'.repeat(40));
  });

  it('network failure maps to NETWORK', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('fetch failed'));
    await expect(client.listRepositories()).rejects.toMatchObject({ code: 'NETWORK' });
  });

  it('error responses truncate overly long GitHub messages', async () => {
    const longMessage = 'x'.repeat(500);
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(500, { message: longMessage }));
    let caught: GitHubApiError | undefined;
    try {
      await client.listRepositories();
    } catch (e) {
      caught = e as GitHubApiError;
    }
    expect(caught).toBeInstanceOf(GitHubApiError);
    expect(caught!.message.length).toBeLessThan(longMessage.length);
  });
});