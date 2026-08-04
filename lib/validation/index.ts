/**
 * lib\validation\index.ts
 * All validation is server-side and defensive. Nothing from the client is
 * trusted: repo names, branch names, file paths, and commit messages are
 * re-validated on every server action, even if the UI already restricts
 * input.
 *
 * Every exported validator accepts `unknown` and narrows internally —
 * callers may pass undefined/null/non-strings (e.g. a missing route param)
 * and get `false` back, never a thrown TypeError.
 */

const OWNER_REPO_RE = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,98})$/;
const BRANCH_RE = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,244}$/;

/**
 * Editability is determined by actually decoding a file's bytes as strict
 * UTF-8 (see lib/encoding/base64.ts) — GitHub's Contents API doesn't
 * distinguish ".py" from ".md"; only binary vs. text matters, and that's a
 * property of the bytes, not the filename.
 *
 * This blocklist exists purely as a cheap, best-effort UI hint so the file
 * browser can grey out obviously-binary files (images, archives, fonts,
 * executables, media) without fetching every file's content just to list a
 * directory. It never blocks an open attempt on its own — a file flagged
 * here can still be opened; a file NOT flagged here can still turn out to
 * be binary and get rejected by the real check.
 */
const LIKELY_BINARY_EXTENSIONS = new Set([
  // images
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'webp', 'tiff', 'tif', 'heic', 'avif',
  // video
  'mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v',
  // audio
  'mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac', 'wma',
  // fonts
  'ttf', 'otf', 'woff', 'woff2', 'eot',
  // archives
  'zip', 'tar', 'gz', 'tgz', 'bz2', 'xz', '7z', 'rar', 'jar', 'war',
  // executables / compiled / packages
  'exe', 'dll', 'so', 'dylib', 'bin', 'class', 'pyc', 'o', 'a', 'msi', 'apk', 'deb', 'rpm',
  // documents / office
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp',
  // databases
  'db', 'sqlite', 'sqlite3',
]);

export function isLikelyBinaryPath(path: unknown): boolean {
  if (typeof path !== 'string' || path.length === 0) return false;
  const name = path.split('/').pop() ?? '';
  const dot = name.lastIndexOf('.');
  if (dot === -1 || dot === name.length - 1) return false; // no extension, or dotfile like .gitignore
  const ext = name.slice(dot + 1).toLowerCase();
  return LIKELY_BINARY_EXTENSIONS.has(ext);
}

export function isValidOwnerOrRepo(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0) return false;
  return OWNER_REPO_RE.test(value) && !value.includes('..');
}

export function isValidBranchName(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0) return false;
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
export function isValidRepoPath(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > 1024) return false;
  if (value.startsWith('/')) return false;
  if (value.includes('\\')) return false;
  if (value.includes('..')) return false;
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f]/.test(value)) return false;
  const segments = value.split('/');
  return segments.every((s) => s.length > 0 && s !== '.' && s !== '..');
}

export function isValidCommitMessage(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.length > 500) return false;
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(trimmed)) return false;
  return true;
}

export function isValidSha(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^[a-f0-9]{40}$/i.test(value);
}