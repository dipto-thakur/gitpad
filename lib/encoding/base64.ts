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
 * GitHub Contents API rejects files it cannot represent as UTF-8 safely
 * beyond a certain size for the "get contents" endpoint (>1MB requires the
 * Git Data API). We guard early with a conservative limit for this app,
 * since it is a document editor, not a bulk file manager.
 */
export const MAX_EDITABLE_FILE_BYTES = 1_000_000; // 1MB
