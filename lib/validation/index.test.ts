import { describe, expect, it } from 'vitest';
import {
  isLikelyBinaryPath,
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

describe('isLikelyBinaryPath', () => {
  it('flags known binary extensions (images, video, audio, fonts, archives, executables, office, db)', () => {
    expect(isLikelyBinaryPath('logo.png')).toBe(true);
    expect(isLikelyBinaryPath('clip.mp4')).toBe(true);
    expect(isLikelyBinaryPath('song.mp3')).toBe(true);
    expect(isLikelyBinaryPath('font.woff2')).toBe(true);
    expect(isLikelyBinaryPath('archive.zip')).toBe(true);
    expect(isLikelyBinaryPath('app.exe')).toBe(true);
    expect(isLikelyBinaryPath('report.pdf')).toBe(true);
    expect(isLikelyBinaryPath('data.sqlite3')).toBe(true);
  });

  it('does NOT flag ordinary text/code files — any extension is fair game now', () => {
    expect(isLikelyBinaryPath('README.md')).toBe(false);
    expect(isLikelyBinaryPath('main.py')).toBe(false);
    expect(isLikelyBinaryPath('index.html')).toBe(false);
    expect(isLikelyBinaryPath('style.css')).toBe(false);
    expect(isLikelyBinaryPath('app.tsx')).toBe(false);
    expect(isLikelyBinaryPath('config.yml')).toBe(false);
    expect(isLikelyBinaryPath('Dockerfile.dev')).toBe(false);
  });

  it('does not flag dotfiles or extensionless files', () => {
    expect(isLikelyBinaryPath('.gitignore')).toBe(false);
    expect(isLikelyBinaryPath('.env')).toBe(false);
    expect(isLikelyBinaryPath('LICENSE')).toBe(false);
    expect(isLikelyBinaryPath('Dockerfile')).toBe(false);
  });

  it('is case-insensitive on the extension', () => {
    expect(isLikelyBinaryPath('PHOTO.PNG')).toBe(true);
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