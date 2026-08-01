import { describe, expect, it } from 'vitest';
import { decodeBase64ToUtf8, encodeUtf8ToBase64 } from './base64';

describe('base64 <-> utf-8', () => {
  it('round-trips plain ASCII', () => {
    const text = '# Hello\n\nSome content.';
    expect(decodeBase64ToUtf8(encodeUtf8ToBase64(text))).toBe(text);
  });

  it('round-trips unicode', () => {
    const text = 'café — naïve 中文 emoji 🚀';
    expect(decodeBase64ToUtf8(encodeUtf8ToBase64(text))).toBe(text);
  });

  it('handles GitHub-style newline-wrapped base64', () => {
    const text = 'line one\nline two';
    const wrapped = encodeUtf8ToBase64(text).replace(/(.{4})/g, '$1\n');
    expect(decodeBase64ToUtf8(wrapped)).toBe(text);
  });
});
