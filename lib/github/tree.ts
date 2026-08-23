// lib/github/tree.ts

import type { TreeEntry } from '@/types';

import { toTreeEntry } from './mappers';
import type { GitHubRequest } from './request';
import type { GhContentItem } from './types';

export async function listTree(
  api: GitHubRequest,
  owner: string,
  repo: string,
  branch: string,
  path: string,
): Promise<TreeEntry[]> {
  const encodedPath = path
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');

  const query = `?ref=${encodeURIComponent(branch)}`;

  const url = encodedPath
    ? `/repos/${owner}/${repo}/contents/${encodedPath}${query}`
    : `/repos/${owner}/${repo}/contents${query}`;

  const items = await api.request<
    GhContentItem[] | GhContentItem
  >(url);

  const list = Array.isArray(items) ? items : [items];

  return list
    .map(toTreeEntry)
    .sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'dir' ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });
}

export async function listFilesRecursive(
  api: GitHubRequest,
  owner: string,
  repo: string,
  branch: string,
  path: string,
): Promise<TreeEntry[]> {
  const entries = await listTree(
    api,
    owner,
    repo,
    branch,
    path,
  );

  const files: TreeEntry[] = [];

  for (const entry of entries) {
    if (entry.type === 'dir') {
      files.push(
        ...(await listFilesRecursive(
          api,
          owner,
          repo,
          branch,
          entry.path,
        )),
      );
    } else {
      files.push(entry);
    }
  }

  return files;
}