import { describe, expect, it } from 'vitest';
import {
  BinaryContentError,
  decodeBase64ToUtf8,
  decodeBase64ToUtf8Strict,
  encodeUtf8ToBase64,
} from './base64';

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

describe('decodeBase64ToUtf8Strict (real binary-vs-text determination)', () => {
  it('decodes genuine UTF-8 text of any file "type" — .py, .html, .css, .json, etc. are all just text', () => {
    const samples = [
      '# Markdown\n\nSome *text*.',
      'def main():\n    print("hello")\n',
      '<!doctype html>\n<html><body>hi</body></html>',
      'body { color: red; }',
      '{"key": "value", "n": 1}',
      'name: ci\non: [push]\n',
    ];
    for (const text of samples) {
      expect(decodeBase64ToUtf8Strict(encodeUtf8ToBase64(text))).toBe(text);
    }
  });

  it('decodes unicode text correctly', () => {
    const text = 'café — naïve 中文 emoji 🚀';
    expect(decodeBase64ToUtf8Strict(encodeUtf8ToBase64(text))).toBe(text);
  });

  it('rejects content containing a NUL byte (classic binary signature)', () => {
    const binaryLike = Buffer.from([0x50, 0x4e, 0x47, 0x00, 0x0d, 0x0a]); // fake PNG-ish header
    const base64 = binaryLike.toString('base64');
    expect(() => decodeBase64ToUtf8Strict(base64)).toThrow(BinaryContentError);
  });

  it('rejects content with invalid UTF-8 byte sequences even without a NUL byte', () => {
    // 0xFF 0xFE is not valid UTF-8 in this position and contains no NUL.
    const invalid = Buffer.from([0xff, 0xfe, 0x41, 0x42]);
    const base64 = invalid.toString('base64');
    expect(() => decodeBase64ToUtf8Strict(base64)).toThrow(BinaryContentError);
  });

  it('accepts an empty file as valid text', () => {
    expect(decodeBase64ToUtf8Strict('')).toBe('');
  });
});