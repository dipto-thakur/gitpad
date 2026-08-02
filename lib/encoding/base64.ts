/**
 * GitHub Contents API returns file content as base64 (with embedded newlines).
 * These helpers convert safely between base64 and UTF-8 text without relying
 * on browser-only APIs, so they work in Node server actions.
 */

export function decodeBase64ToUtf8(base64: string): string {
  const clean = base64.replace(/\n/g, '');
  return Buffer.from(clean, 'base64').toString('utf-8');
}

export function encodeUtf8ToBase64(text: string): string {
  return Buffer.from(text, 'utf-8').toString('base64');
}

/**
 * Thrown when a file's decoded bytes are not valid UTF-8 text. This is the
 * actual binary/text determination — not a filename or extension guess.
 * `Buffer#toString('utf-8')` silently replaces invalid sequences with
 * U+FFFD instead of failing, so a strict TextDecoder is used here instead.
 */
export class BinaryContentError extends Error {
  constructor() {
    super('File content is not valid UTF-8 text.');
    this.name = 'BinaryContentError';
  }
}

const BINARY_SNIFF_BYTES = 8000; // enough to catch a NUL early in large files

/**
 * Decodes base64 to text, or throws BinaryContentError if the bytes are not
 * valid UTF-8. Two checks, cheapest first:
 *  1. A NUL byte anywhere in the first chunk — near-universal in binaries,
 *     essentially never present in genuine text files.
 *  2. Strict (fatal) UTF-8 decoding of the full content — catches invalid
 *     byte sequences that a lossy decode would silently mangle.
 */
export function decodeBase64ToUtf8Strict(base64: string): string {
  const buf = Buffer.from(base64.replace(/\n/g, ''), 'base64');
  const sniffLength = Math.min(buf.length, BINARY_SNIFF_BYTES);
  for (let i = 0; i < sniffLength; i++) {
    if (buf[i] === 0) throw new BinaryContentError();
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    throw new BinaryContentError();
  }
}

/**
 * GitHub Contents API rejects files it cannot represent as UTF-8 safely
 * beyond a certain size for the "get contents" endpoint (>1MB requires the
 * Git Data API). We guard early with a conservative limit for this app,
 * since it is a document editor, not a bulk file manager.
 */
export const MAX_EDITABLE_FILE_BYTES = 1_000_000; // 1MB