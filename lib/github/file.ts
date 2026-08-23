// lib/github/file.ts

import {
    decodeBase64ToUtf8Strict,
    BinaryContentError,
    encodeUtf8ToBase64,
    MAX_EDITABLE_FILE_BYTES,
  } from '@/lib/encoding/base64';
  import type { FileContent } from '@/types';
  
  import {
    BinaryFileError,
    GitHubApiError,
  } from './errors';
  import type { GitHubRequest } from './request';
  import type { GhCommitResponse, GhContentItem } from './types';
  
  function encodePath(path: string): string {
    return path
      .split('/')
      .filter(Boolean)
      .map(encodeURIComponent)
      .join('/');
  }
  
  export async function getFile(
    api: GitHubRequest,
    owner: string,
    repo: string,
    branch: string,
    path: string,
  ): Promise<FileContent> {
    const item = await api.request<GhContentItem>(
      `/repos/${owner}/${repo}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`,
    );
  
    if (Array.isArray(item) || item.type !== 'file') {
      throw new GitHubApiError(
        'Path is not a file',
        400,
        'UNKNOWN',
      );
    }
  
    if ((item.size ?? 0) > MAX_EDITABLE_FILE_BYTES) {
      throw new GitHubApiError(
        'File too large to edit safely',
        413,
        'UNKNOWN',
      );
    }
  
    let content = '';
  
    if (item.content) {
      try {
        content = decodeBase64ToUtf8Strict(item.content);
      } catch (error) {
        if (error instanceof BinaryContentError) {
          throw new BinaryFileError(path);
        }
  
        throw error;
      }
    }
  
    return {
      path: item.path,
      content,
      sha: item.sha,
      encoding: 'utf-8',
      size: item.size ?? 0,
    };
  }
  
  export async function createFile(
    api: GitHubRequest,
    params: {
      owner: string;
      repo: string;
      branch: string;
      path: string;
      content: string;
      message: string;
    },
  ): Promise<{ commitSha: string; contentSha: string }> {
    const res = await api.request<GhCommitResponse>(
      `/repos/${params.owner}/${params.repo}/contents/${encodePath(params.path)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: params.message,
          content: encodeUtf8ToBase64(params.content),
          branch: params.branch,
        }),
      },
    );
  
    return {
      commitSha: res.commit.sha,
      contentSha: res.content?.sha ?? '',
    };
  }
  
  export async function commitFile(
    api: GitHubRequest,
    params: {
      owner: string;
      repo: string;
      branch: string;
      path: string;
      content: string;
      message: string;
      sha: string;
    },
  ): Promise<{ commitSha: string; contentSha: string }> {
    const res = await api.request<GhCommitResponse>(
      `/repos/${params.owner}/${params.repo}/contents/${encodePath(params.path)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: params.message,
          content: encodeUtf8ToBase64(params.content),
          sha: params.sha,
          branch: params.branch,
        }),
      },
    );
  
    return {
      commitSha: res.commit.sha,
      contentSha: res.content?.sha ?? '',
    };
  }
  
  export async function deleteFile(
    api: GitHubRequest,
    params: {
      owner: string;
      repo: string;
      branch: string;
      path: string;
      message: string;
      sha: string;
    },
  ): Promise<{ commitSha: string }> {
    const res = await api.request<GhCommitResponse>(
      `/repos/${params.owner}/${params.repo}/contents/${encodePath(params.path)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: params.message,
          sha: params.sha,
          branch: params.branch,
        }),
      },
    );
  
    return {
      commitSha: res.commit.sha,
    };
  }
  interface GhBlobResponse {
    sha: string;
    content: string;
    encoding: string;
    size: number;
  }
  
  /**
   * Fetches raw file bytes (base64) via the Git Blobs API, keyed by blob sha
   * rather than path+ref. Used for downloads — unlike getFile() this never
   * throws on binary content and isn't capped by MAX_EDITABLE_FILE_BYTES
   * (Blobs API supports up to 100MB, vs Contents API's ~1MB inline limit).
   */
  export async function getBlob(
    api: GitHubRequest,
    owner: string,
    repo: string,
    fileSha: string,
  ): Promise<{ content: string; encoding: string; size: number }> {
    const res = await api.request<GhBlobResponse>(
      `/repos/${owner}/${repo}/git/blobs/${fileSha}`,
    );
  
    return {
      content: res.content,
      encoding: res.encoding,
      size: res.size,
    };
  }