// lib/github/errors.ts

export type GitHubErrorCode =
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'NETWORK'
  | 'SHA_MISMATCH'
  | 'UNKNOWN';

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: GitHubErrorCode,
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

export class BinaryFileError extends Error {
  constructor(path: string) {
    super(`"${path}" is a binary file and cannot be edited here.`);
    this.name = 'BinaryFileError';
  }
}

export function classify(status: number): GitHubErrorCode {
  if (status === 404) return 'NOT_FOUND';
  if (status === 403) return 'FORBIDDEN';
  if (status === 409 || status === 422) return 'SHA_MISMATCH';
  if (status === 429) return 'RATE_LIMITED';

  return 'UNKNOWN';
}

export function sanitizeErrorBody(body: string): string {
  try {
    const parsed = JSON.parse(body);

    if (typeof parsed?.message === 'string') {
      return parsed.message.slice(0, 200);
    }
  } catch {
    // Ignore invalid JSON.
  }

  return 'request failed';
}