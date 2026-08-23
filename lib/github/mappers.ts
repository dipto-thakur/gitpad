// lib/github/mappers.ts

import { isLikelyBinaryPath } from '@/lib/validation';
import type { RepoSummary, TreeEntry } from '@/types';

import type { GhContentItem, GhRepo } from './types';

export function toRepoSummary(r: GhRepo): RepoSummary {
  return {
    id: r.id,
    owner: r.owner.login,
    name: r.name,
    fullName: r.full_name,
    private: r.private,
    defaultBranch: r.default_branch,
    updatedAt: r.updated_at,
  };
}

export function toTreeEntry(item: GhContentItem): TreeEntry {
  const type: TreeEntry['type'] =
    item.type === 'dir' ? 'dir' : 'file';

  return {
    path: item.path,
    name: item.name,
    type,
    sha: item.sha,
    size: item.size,
    supported:
      type === 'dir'
        ? true
        : !isLikelyBinaryPath(item.name),
  };
}