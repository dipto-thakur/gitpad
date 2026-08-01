import { describe, expect, it } from 'vitest';
import {
  isSupportedFile,
  isValidBranchName,
  isValidCommitMessage,
  isValidOwnerOrRepo,
  isValidRepoPath,
  isValidSha,
} from './index';

describe('isValidOwnerOrRepo', () => {
  it('accepts normal names', () => {
    expect(isValidOwnerOrRepo('dipto-dev')).toBe(true);
    expect(isValidOwnerOrRepo('my.repo_name')).toBe(true);
  });
  it('rejects traversal and empty', () => {
    expect(isValidOwnerOrRepo('..')).toBe(false);
    expect(isValidOwnerOrRepo('')).toBe(false);
    expect(isValidOwnerOrRepo('a/b')).toBe(false);
  });
});

describe('isValidBranchName', () => {
  it('accepts typical branch names', () => {
    expect(isValidBranchName('main')).toBe(true);
    expect(isValidBranchName('feature/foo-bar')).toBe(true);
  });
  it('rejects traversal, leading/trailing slash, double slash', () => {
    expect(isValidBranchName('../etc')).toBe(false);
    expect(isValidBranchName('/main')).toBe(false);
    expect(isValidBranchName('main/')).toBe(false);
    expect(isValidBranchName('a//b')).toBe(false);
  });
});

describe('isValidRepoPath', () => {
  it('accepts nested relative paths', () => {
    expect(isValidRepoPath('docs/README.md')).toBe(true);
  });
  it('rejects traversal and absolute paths', () => {
    expect(isValidRepoPath('../../etc/passwd')).toBe(false);
    expect(isValidRepoPath('/etc/passwd')).toBe(false);
    expect(isValidRepoPath('a\\b')).toBe(false);
    expect(isValidRepoPath('a/../b')).toBe(false);
  });
});

describe('isSupportedFile', () => {
  it('accepts known extensions and exact names', () => {
    expect(isSupportedFile('README.md')).toBe(true);
    expect(isSupportedFile('config.yaml')).toBe(true);
    expect(isSupportedFile('LICENSE')).toBe(true);
    expect(isSupportedFile('.gitignore')).toBe(true);
  });
  it('rejects binaries and unknown extensions', () => {
    expect(isSupportedFile('photo.png')).toBe(false);
    expect(isSupportedFile('app.exe')).toBe(false);
    expect(isSupportedFile('archive.zip')).toBe(false);
  });
});

describe('isValidCommitMessage', () => {
  it('accepts short reasonable messages', () => {
    expect(isValidCommitMessage('Update README')).toBe(true);
  });
  it('rejects empty and oversized messages', () => {
    expect(isValidCommitMessage('')).toBe(false);
    expect(isValidCommitMessage('   ')).toBe(false);
    expect(isValidCommitMessage('a'.repeat(501))).toBe(false);
  });
});

describe('isValidSha', () => {
  it('accepts a 40-char hex sha', () => {
    expect(isValidSha('a'.repeat(40))).toBe(true);
  });
  it('rejects malformed sha', () => {
    expect(isValidSha('not-a-sha')).toBe(false);
    expect(isValidSha('a'.repeat(39))).toBe(false);
  });
});
