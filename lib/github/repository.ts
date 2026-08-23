// lib/github/repository.ts

import type { BranchSummary, RepoSummary } from '@/types';

import { toRepoSummary } from './mappers';
import type { GhBranch, GhRepo } from './types';
import type { GitHubRequest } from './request';

export async function listRepositories(
  api: GitHubRequest,
): Promise<RepoSummary[]> {
  const repos = await api.request<GhRepo[]>(
    '/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member',
  );

  return repos.map(toRepoSummary);
}

export async function listBranches(
  api: GitHubRequest,
  owner: string,
  repo: string,
): Promise<BranchSummary[]> {
  const branches = await api.request<GhBranch[]>(
    `/repos/${owner}/${repo}/branches?per_page=100`,
  );

  return branches.map((branch) => ({
    name: branch.name,
    protected: branch.protected,
  }));
}

export async function getRepo(
  api: GitHubRequest,
  owner: string,
  repo: string,
): Promise<RepoSummary> {
  const repoData = await api.request<GhRepo>(
    `/repos/${owner}/${repo}`,
  );

  return toRepoSummary(repoData);
}