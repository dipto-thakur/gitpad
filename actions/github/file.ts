// file: actions/github/file.ts

'use server';

import { BinaryFileError, GitHubApiError } from '@/lib/github/client';
import type {
  ActionResult,
  CommitResult,
  FileContent,
} from '@/types';

import {
  getClient,
  fail,
  fromApiError,
  validateRepoBranch,
  validatePath,
  validateCommitMessage,
  validateSha,
} from './shared';

export async function getFileAction(
  owner: string,
  repo: string,
  branch: string,
  path: string,
): Promise<ActionResult<FileContent>> {
  const client = await getClient();

  if (!client) {
    return fail('Sign in required.', 'UNAUTHENTICATED');
  }

  const repoValidation = validateRepoBranch(owner, repo, branch);
  if (!repoValidation.ok) return repoValidation;

  const pathValidation = validatePath(path);
  if (!pathValidation.ok) return pathValidation;

  try {
    const file = await client.getFile(
      owner,
      repo,
      branch,
      path,
    );

    return {
      ok: true,
      data: file,
    };
  } catch (e) {
    if (e instanceof BinaryFileError) {
      return fail(e.message, 'UNSUPPORTED_FILE');
    }

    if (e instanceof GitHubApiError && e.status === 413) {
      return fail(
        'File is too large to edit here.',
        'FILE_TOO_LARGE',
      );
    }

    if (
      e instanceof GitHubApiError &&
      e.code === 'NOT_FOUND'
    ) {
      return fail(
        'This file no longer exists in the repository. It may have been deleted or moved upstream.',
        'NOT_FOUND',
      );
    }

    return fromApiError(e);
  }
}

export async function createFileAction(params: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  content: string;
  message: string;
}): Promise<ActionResult<CommitResult>> {
  const client = await getClient();

  if (!client) {
    return fail('Sign in required.', 'UNAUTHENTICATED');
  }

  const {
    owner,
    repo,
    branch,
    path,
    content,
    message,
  } = params;

  const repoValidation = validateRepoBranch(
    owner,
    repo,
    branch,
  );
  if (!repoValidation.ok) return repoValidation;

  const pathValidation = validatePath(path);
  if (!pathValidation.ok) return pathValidation;

  const messageValidation = validateCommitMessage(message);
  if (!messageValidation.ok) return messageValidation;

  try {
    const result = await client.createFile({
      owner,
      repo,
      branch,
      path,
      content,
      message,
    });

    return {
      ok: true,
      data: result,
    };
  } catch (e) {
    if (
      e instanceof GitHubApiError &&
      e.code === 'SHA_MISMATCH'
    ) {
      return fail(
        'A file already exists at this path. Choose a different name.',
        'VALIDATION',
      );
    }

    return fromApiError(e);
  }
}

export async function commitFileAction(params: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  content: string;
  message: string;
  sha: string;
}): Promise<ActionResult<CommitResult>> {
  const client = await getClient();

  if (!client) {
    return fail('Sign in required.', 'UNAUTHENTICATED');
  }

  const {
    owner,
    repo,
    branch,
    path,
    content,
    message,
    sha,
  } = params;

  const repoValidation = validateRepoBranch(
    owner,
    repo,
    branch,
  );
  if (!repoValidation.ok) return repoValidation;

  const pathValidation = validatePath(path);
  if (!pathValidation.ok) return pathValidation;

  const messageValidation = validateCommitMessage(message);
  if (!messageValidation.ok) return messageValidation;

  const shaValidation = validateSha(sha);
  if (!shaValidation.ok) return shaValidation;

  try {
    const result = await client.commitFile({
      owner,
      repo,
      branch,
      path,
      content,
      message,
      sha,
    });

    return {
      ok: true,
      data: result,
    };
  } catch (e) {
    if (
      e instanceof GitHubApiError &&
      e.code === 'NOT_FOUND'
    ) {
      return fail(
        'This file was deleted from the repository upstream. Reload to see the current state.',
        'NOT_FOUND',
      );
    }

    return fromApiError(e);
  }
}

export async function deleteFileAction(params: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  message: string;
  sha: string;
}): Promise<ActionResult<{ commitSha: string }>> {
  const client = await getClient();

  if (!client) {
    return fail('Sign in required.', 'UNAUTHENTICATED');
  }

  const {
    owner,
    repo,
    branch,
    path,
    message,
    sha,
  } = params;

  const repoValidation = validateRepoBranch(
    owner,
    repo,
    branch,
  );
  if (!repoValidation.ok) return repoValidation;

  const pathValidation = validatePath(path);
  if (!pathValidation.ok) return pathValidation;

  const messageValidation = validateCommitMessage(message);
  if (!messageValidation.ok) return messageValidation;

  const shaValidation = validateSha(sha);
  if (!shaValidation.ok) return shaValidation;

  try {
    const result = await client.deleteFile({
      owner,
      repo,
      branch,
      path,
      message,
      sha,
    });

    return {
      ok: true,
      data: result,
    };
  } catch (e) {
    return fromApiError(e);
  }
}