// file: actions/github/repository.ts

'use server';

import { getClient, fail, fromApiError, validateRepoRef } from './shared';

import type {
  ActionResult,
  BranchSummary,
  RepoSummary,
} from '@/types';

/* -------------------------------------------------------------------------- */
/* Repositories                                                               */
/* -------------------------------------------------------------------------- */

export async function listRepositoriesAction(): Promise<
  ActionResult<RepoSummary[]>
> {
  const client = await getClient();

  if (!client) {
    return fail('Sign in required.', 'UNAUTHENTICATED');
  }

  try {
    const repos = await client.listRepositories();

    return {
      ok: true,
      data: repos,
    };
  } catch (e) {
    return fromApiError(e);
  }
}

/* -------------------------------------------------------------------------- */
/* Branches                                                                   */
/* -------------------------------------------------------------------------- */

export async function listBranchesAction(
  owner: string,
  repo: string,
): Promise<ActionResult<BranchSummary[]>> {
  const client = await getClient();

  if (!client) {
    return fail('Sign in required.', 'UNAUTHENTICATED');
  }

  const validation = validateRepoRef(owner, repo);

  if (!validation.ok) {
    return validation;
  }

  try {
    const branches = await client.listBranches(
      owner,
      repo,
    );

    return {
      ok: true,
      data: branches,
    };
  } catch (e) {
    return fromApiError(e);
  }
}

/* -------------------------------------------------------------------------- */
/* Repository details                                                         */
/* -------------------------------------------------------------------------- */

export async function getRepoAction(
  owner: string,
  repo: string,
): Promise<ActionResult<RepoSummary>> {
  const client = await getClient();

  if (!client) {
    return fail('Sign in required.', 'UNAUTHENTICATED');
  }

  const validation = validateRepoRef(owner, repo);

  if (!validation.ok) {
    return validation;
  }

  try {
    const repository = await client.getRepo(
      owner,
      repo,
    );

    return {
      ok: true,
      data: repository,
    };
  } catch (e) {
    return fromApiError(e);
  }
}