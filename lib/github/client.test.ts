import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { computeCurrentStreak, GitHubApiError, GitHubClient } from './client';
import { encodeUtf8ToBase64 } from '@/lib/encoding/base64';

function mockResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe('GitHubClient integration (canned success responses)', () => {
  const client = new GitHubClient('fake-token');

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('listRepositories: maps GitHub repo list shape to RepoSummary[]', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(200, [
        {
          id: 1,
          name: 'notes',
          full_name: 'dipto/notes',
          private: false,
          default_branch: 'main',
          updated_at: '2026-07-01T00:00:00Z',
          owner: { login: 'dipto' },
        },
        {
          id: 2,
          name: 'forgecv',
          full_name: 'dipto/forgecv',
          private: true,
          default_branch: 'main',
          updated_at: '2026-07-15T00:00:00Z',
          owner: { login: 'dipto' },
        },
      ]),
    );
    const repos = await client.listRepositories();
    expect(repos).toEqual([
      {
        id: 1,
        owner: 'dipto',
        name: 'notes',
        fullName: 'dipto/notes',
        private: false,
        defaultBranch: 'main',
        updatedAt: '2026-07-01T00:00:00Z',
      },
      {
        id: 2,
        owner: 'dipto',
        name: 'forgecv',
        fullName: 'dipto/forgecv',
        private: true,
        defaultBranch: 'main',
        updatedAt: '2026-07-15T00:00:00Z',
      },
    ]);
  });

  it('listBranches: maps GitHub branch list shape to BranchSummary[]', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(200, [
        { name: 'main', protected: true },
        { name: 'dev', protected: false },
      ]),
    );
    const branches = await client.listBranches('dipto', 'notes');
    expect(branches).toEqual([
      { name: 'main', protected: true },
      { name: 'dev', protected: false },
    ]);
  });

  it('getRepo: maps a single GitHub repo response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(200, {
        id: 1,
        name: 'notes',
        full_name: 'dipto/notes',
        private: false,
        default_branch: 'main',
        updated_at: '2026-07-01T00:00:00Z',
        owner: { login: 'dipto' },
      }),
    );
    const repo = await client.getRepo('dipto', 'notes');
    expect(repo.fullName).toBe('dipto/notes');
    expect(repo.defaultBranch).toBe('main');
  });

  it('listTree: requests repo root without a trailing slash before the query string', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(200, []));
    await client.listTree('dipto', 'notes', 'main', '');
    const calledUrl = vi.mocked(fetch).mock.calls[0]![0] as string;
    expect(calledUrl).toBe('https://api.github.com/repos/dipto/notes/contents?ref=main');
  });

  it('listTree: sorts directories before files, then alphabetically, and flags unsupported files', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(200, [
        { name: 'zeta.md', path: 'zeta.md', sha: 'z'.repeat(40), size: 10, type: 'file' },
        { name: 'assets', path: 'assets', sha: 'a'.repeat(40), type: 'dir' },
        { name: 'logo.png', path: 'logo.png', sha: 'p'.repeat(40), size: 2048, type: 'file' },
        { name: 'README.md', path: 'README.md', sha: 'r'.repeat(40), size: 20, type: 'file' },
      ]),
    );
    const entries = await client.listTree('dipto', 'notes', 'main', '');
    expect(entries.map((e) => e.name)).toEqual(['assets', 'logo.png', 'README.md', 'zeta.md']);
    expect(entries.find((e) => e.name === 'logo.png')?.supported).toBe(false);
    expect(entries.find((e) => e.name === 'README.md')?.supported).toBe(true);
  });

  it('listTree: wraps a single-file response (GitHub returns an object, not array, for one file)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(200, { name: 'README.md', path: 'README.md', sha: 'r'.repeat(40), size: 5, type: 'file' }),
    );
    const entries = await client.listTree('dipto', 'notes', 'main', 'README.md');
    expect(entries).toHaveLength(1);
    expect(entries[0]!.name).toBe('README.md');
  });

  it('commitFile: returns commit and content sha on success', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(200, {
        content: { sha: 'd'.repeat(40) },
        commit: { sha: 'c'.repeat(40) },
      }),
    );
    const result = await client.commitFile({
      owner: 'dipto',
      repo: 'notes',
      branch: 'main',
      path: 'README.md',
      content: 'updated body',
      message: 'Update README',
      sha: 'a'.repeat(40),
    });
    expect(result).toEqual({ commitSha: 'c'.repeat(40), contentSha: 'd'.repeat(40) });
  });

  it('deleteFile: returns the deletion commit sha on success', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(200, { content: null, commit: { sha: 'e'.repeat(40) } }),
    );
    const result = await client.deleteFile({
      owner: 'dipto',
      repo: 'notes',
      branch: 'main',
      path: 'old.md',
      message: 'Remove old.md',
      sha: 'a'.repeat(40),
    });
    expect(result).toEqual({ commitSha: 'e'.repeat(40) });
  });

  it('createFile: returns commit and content sha on success (no sha sent in request body)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(200, {
        content: { sha: 'n'.repeat(40) },
        commit: { sha: 'm'.repeat(40) },
      }),
    );
    const result = await client.createFile({
      owner: 'dipto',
      repo: 'notes',
      branch: 'main',
      path: 'new-doc.md',
      content: '# New doc',
      message: 'Create new-doc.md',
    });
    expect(result).toEqual({ commitSha: 'm'.repeat(40), contentSha: 'n'.repeat(40) });
    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.sha).toBeUndefined();
  });

  it('createFile: 422 (path already exists) surfaces as SHA_MISMATCH for the caller to interpret', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(422, { message: 'sha wasn\'t supplied' }),
    );
    await expect(
      client.createFile({
        owner: 'dipto',
        repo: 'notes',
        branch: 'main',
        path: 'README.md',
        content: 'dup',
        message: 'Create README.md',
      }),
    ).rejects.toMatchObject({ code: 'SHA_MISMATCH', status: 422 });
  });

  it('getFile: fetches any path regardless of extension — .py, .html, .css all succeed', async () => {
    for (const [path, text] of [
      ['script.py', 'print("hi")\n'],
      ['index.html', '<!doctype html><html></html>'],
      ['style.css', 'body { color: red; }'],
      ['Dockerfile', 'FROM node:20\n'],
    ] as const) {
      vi.mocked(fetch).mockResolvedValueOnce(
        mockResponse(200, {
          name: path,
          path,
          sha: 'a'.repeat(40),
          size: text.length,
          type: 'file',
          content: encodeUtf8ToBase64(text),
        }),
      );
      const result = await client.getFile('dipto', 'notes', 'main', path);
      expect(result.content).toBe(text);
    }
  });

  it('getFile: rejects a file whose decoded bytes are not valid UTF-8, even with a misleading extension', async () => {
    const binaryBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x0d, 0x0a]); // PNG-ish header w/ NUL
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(200, {
        name: 'sneaky.md', // extension lies — content is what matters
        path: 'sneaky.md',
        sha: 'a'.repeat(40),
        size: binaryBytes.length,
        type: 'file',
        content: binaryBytes.toString('base64'),
      }),
    );
    await expect(client.getFile('dipto', 'notes', 'main', 'sneaky.md')).rejects.toMatchObject({
      name: 'BinaryFileError',
    });
  });

  it('getFile: accepts a text file with an unusual/binary-suggesting extension based on real content', async () => {
    const text = 'this file is actually just text, extension notwithstanding';
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(200, {
        name: 'notes.bin',
        path: 'notes.bin',
        sha: 'a'.repeat(40),
        size: text.length,
        type: 'file',
        content: encodeUtf8ToBase64(text),
      }),
    );
    const result = await client.getFile('dipto', 'notes', 'main', 'notes.bin');
    expect(result.content).toBe(text);
  });
});

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

describe('computeCurrentStreak (pure function)', () => {
  function day(date: string, count: number) {
    return { date, contributionCount: count };
  }

  it('counts back from the most recent day while contributions continue', () => {
    const days = [day('2026-07-30', 1), day('2026-07-31', 2), day('2026-08-01', 3)];
    expect(computeCurrentStreak(days)).toBe(3);
  });

  it('stops at the first zero-contribution day before today', () => {
    const days = [day('2026-07-30', 0), day('2026-07-31', 5), day('2026-08-01', 2)];
    expect(computeCurrentStreak(days)).toBe(2);
  });

  it('does not break the streak if only today has zero contributions yet', () => {
    const days = [day('2026-07-30', 4), day('2026-07-31', 1), day('2026-08-01', 0)];
    expect(computeCurrentStreak(days)).toBe(2);
  });

  it('returns 0 when today and yesterday both have zero contributions', () => {
    const days = [day('2026-07-30', 3), day('2026-07-31', 0), day('2026-08-01', 0)];
    expect(computeCurrentStreak(days)).toBe(0);
  });

  it('returns 0 for an empty calendar', () => {
    expect(computeCurrentStreak([])).toBe(0);
  });
});

describe('GitHubClient.getContributionStats (GraphQL, mocked fetch)', () => {
  const client = new GitHubClient('fake-token');

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('parses totalContributions and computes the streak from the calendar', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      mockResponse(200, {
        data: {
          viewer: {
            contributionsCollection: {
              contributionCalendar: {
                totalContributions: 512,
                weeks: [
                  { contributionDays: [{ date: '2026-07-30', contributionCount: 2 }] },
                  { contributionDays: [{ date: '2026-07-31', contributionCount: 1 }] },
                  { contributionDays: [{ date: '2026-08-01', contributionCount: 0 }] },
                ],
              },
            },
          },
        },
      }),
    );
    const result = await client.getContributionStats();
    expect(result).toEqual({ totalContributions: 512, currentStreak: 2 });

    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe('https://api.github.com/graphql');
    expect((init as RequestInit).method).toBe('POST');
  });

  it('a 200 response with a GraphQL errors array is treated as a failure', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(200, { errors: [{ message: 'Bad credentials' }] }));
    await expect(client.getContributionStats()).rejects.toMatchObject({ message: 'Bad credentials' });
  });

  it('non-2xx from the GraphQL endpoint maps through the normal status classifier', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse(403, { message: 'Bad credentials' }));
    await expect(client.getContributionStats()).rejects.toMatchObject({ code: 'FORBIDDEN', status: 403 });
  });
});