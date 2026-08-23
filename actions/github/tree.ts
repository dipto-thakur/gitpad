// file: actions/github/tree.ts

'use server';

import {
  getClient,
  fail,
  fromApiError,
  validateRepoBranch,
  validateOptionalPath,
} from './shared';

import type {
  ActionResult,
  TreeEntry,
} from '@/types';

/* -------------------------------------------------------------------------- */
/* Repository tree                                                            */
/* -------------------------------------------------------------------------- */

export async function listTreeAction(
  owner: string,
  repo: string,
  branch: string,
  path: string,
): Promise<ActionResult<TreeEntry[]>> {
  const client = await getClient();

  if (!client) {
    return fail('Sign in required.', 'UNAUTHENTICATED');
  }

  const repoValidation = validateRepoBranch(
    owner,
    repo,
    branch,
  );

  if (!repoValidation.ok) {
    return repoValidation;
  }

  const pathValidation = validateOptionalPath(path);

  if (!pathValidation.ok) {
    return pathValidation;
  }

  try {
    const entries = await client.listTree(
      owner,
      repo,
      branch,
      path,
    );

    return {
      ok: true,
      data: entries,
    };
  } catch (e) {
    return fromApiError(e);
  }
}