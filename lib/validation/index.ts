/**
 * All validation is server-side and defensive. Nothing from the client is
 * trusted: repo names, branch names, file paths, and commit messages are
 * re-validated on every server action, even if the UI already restricts
 * input.
 */

const OWNER_REPO_RE = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,98})$/;
const BRANCH_RE = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,244}$/;

export const SUPPORTED_EXTENSIONS = new Set([
  'md',
  'markdown',
  'txt',
  'json',
  'yml',
  'yaml',
]);

export const SUPPORTED_EXACT_NAMES = new Set([
  '.gitignore',
  '.editorconfig',
  'LICENSE',
  'LICENSE.md',
  'LICENSE.txt',
]);

export function isValidOwnerOrRepo(value: string): boolean {
  return OWNER_REPO_RE.test(value) && !value.includes('..');
}

export function isValidBranchName(value: string): boolean {
  if (!BRANCH_RE.test(value)) return false;
  if (value.includes('..')) return false;
  if (value.startsWith('/') || value.endsWith('/')) return false;
  if (value.includes('//')) return false;
  return true;
}

/**
 * Rejects path traversal, absolute paths, null bytes, and control
 * characters. Only relative, forward-slash paths within the repo tree are
 * accepted.
 */
export function isValidRepoPath(value: string): boolean {
  if (!value || value.length > 1024) return false;
  if (value.startsWith('/')) return false;
  if (value.includes('\\')) return false;
  if (value.includes('..')) return false;
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f]/.test(value)) return false;
  const segments = value.split('/');
  return segments.every((s) => s.length > 0 && s !== '.' && s !== '..');
}

export function isSupportedFile(path: string): boolean {
  const name = path.split('/').pop() ?? '';
  if (SUPPORTED_EXACT_NAMES.has(name)) return true;
  const dot = name.lastIndexOf('.');
  if (dot === -1) return false;
  const ext = name.slice(dot + 1).toLowerCase();
  return SUPPORTED_EXTENSIONS.has(ext);
}

export function isValidCommitMessage(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.length > 500) return false;
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(trimmed)) return false;
  return true;
}

export function isValidSha(value: string): boolean {
  return /^[a-f0-9]{40}$/i.test(value);
}
