// file: actions/github/rename.ts

'use server';

import { GitHubApiError } from '@/lib/github/client';
import type {
  ActionResult,
  RenameResult,
} from '@/types';

import {
  getClient,
  fail,
  fromApiError,
  apiErrorMessage,
  validateRepoBranch,
  validatePath,
  validateCommitMessage,
} from './shared';

export async function renameFileAction(params: {
  owner: string;
  repo: string;
  branch: string;
  oldPath: string;
  newPath: string;
  message: string;
}): Promise<ActionResult<RenameResult>> {
  const client = await getClient();

  if (!client) {
    return fail('Sign in required.', 'UNAUTHENTICATED');
  }

  const {
    owner,
    repo,
    branch,
    oldPath,
    newPath,
    message,
  } = params;

  const repoValidation = validateRepoBranch(
    owner,
    repo,
    branch,
  );
  if (!repoValidation.ok) return repoValidation;

  const oldPathValidation = validatePath(oldPath);
  if (!oldPathValidation.ok) return oldPathValidation;

  const newPathValidation = validatePath(newPath);
  if (!newPathValidation.ok) return newPathValidation;

  if (oldPath === newPath) {
    return fail(
      'New path must be different from the current path.',
      'VALIDATION',
    );
  }

  const messageValidation = validateCommitMessage(message);
  if (!messageValidation.ok) return messageValidation;

  let current: Awaited<
    ReturnType<typeof client.getFile>
  >;

  try {
    current = await client.getFile(
      owner,
      repo,
      branch,
      oldPath,
    );
  } catch (e) {
    return fromApiError(e);
  }

  let createResult: Awaited<
    ReturnType<typeof client.createFile>
  >;

  try {
    createResult = await client.createFile({
      owner,
      repo,
      branch,
      path: newPath,
      content: current.content,
      message,
    });
  } catch (e) {
    if (
      e instanceof GitHubApiError &&
      e.code === 'SHA_MISMATCH'
    ) {
      return fail(
        'A file already exists at the new path. Choose a different name.',
        'VALIDATION',
      );
    }

    return fromApiError(e);
  }

  try {
    const deleteResult = await client.deleteFile({
      owner,
      repo,
      branch,
      path: oldPath,
      sha: current.sha,
      message: `${message} (remove old path: ${oldPath})`,
    });

    return {
      ok: true,
      data: {
        commitSha: createResult.commitSha,
        deleteCommitSha: deleteResult.commitSha,
      },
    };
  } catch {
    return fail(
      `Created ${newPath}, but couldn't remove ${oldPath} — it may have changed. Delete it manually or retry.`,
      'UNKNOWN',
    );
  }
}

export async function renameFolderAction(params: {
  owner: string;
  repo: string;
  branch: string;
  oldPath: string;
  newPath: string;
  message: string;
}): Promise<ActionResult<{ filesMoved: number }>> {
  const client = await getClient();

  if (!client) {
    return fail('Sign in required.', 'UNAUTHENTICATED');
  }

  const {
    owner,
    repo,
    branch,
    oldPath,
    newPath,
    message,
  } = params;

  const repoValidation = validateRepoBranch(
    owner,
    repo,
    branch,
  );
  if (!repoValidation.ok) return repoValidation;

  const oldPathValidation = validatePath(oldPath);
  if (!oldPathValidation.ok) return oldPathValidation;

  const newPathValidation = validatePath(newPath);
  if (!newPathValidation.ok) return newPathValidation;

  if (oldPath === newPath) {
    return fail(
      'New path must be different from the current path.',
      'VALIDATION',
    );
  }

  if (newPath.startsWith(`${oldPath}/`)) {
    return fail(
      'Cannot rename a folder into itself or a subfolder of itself.',
      'VALIDATION',
    );
  }

  const messageValidation = validateCommitMessage(message);
  if (!messageValidation.ok) return messageValidation;

  let files;

  try {
    files = await client.listFilesRecursive(
      owner,
      repo,
      branch,
      oldPath,
    );
  } catch (e) {
    return fromApiError(e);
  }

  if (files.length === 0) {
    return fail(
      'Folder is empty or no longer exists.',
      'NOT_FOUND',
    );
  }

  if (files.length > 100) {
    return fail(
      `This folder has ${files.length} files — too many to rename safely in one request (limit 100). Consider renaming subfolders individually.`,
      'VALIDATION',
    );
  }

  let moved = 0;

  for (const file of files) {
    const relative = file.path.slice(oldPath.length);
    const destPath = `${newPath}${relative}`;

    let current;

    try {
      current = await client.getFile(
        owner,
        repo,
        branch,
        file.path,
      );
    } catch (e) {
      return fail(
        `${apiErrorMessage(e)} Moved ${moved} of ${files.length} files before this failed — folder is partially renamed.`,
        'UNKNOWN',
      );
    }

    try {
      await client.createFile({
        owner,
        repo,
        branch,
        path: destPath,
        content: current.content,
        message: `${message} (${destPath})`,
      });
    } catch (e) {
      if (
        e instanceof GitHubApiError &&
        e.code === 'SHA_MISMATCH'
      ) {
        return fail(
          `A file already exists at ${destPath}. Moved ${moved} of ${files.length} files before this failed.`,
          'VALIDATION',
        );
      }

      return fail(
        `${apiErrorMessage(e)} Moved ${moved} of ${files.length} files before this failed — folder is partially renamed.`,
        'UNKNOWN',
      );
    }

    try {
      await client.deleteFile({
        owner,
        repo,
        branch,
        path: file.path,
        sha: current.sha,
        message: `${message} (remove old path: ${file.path})`,
      });

      moved++;
    } catch {
      return fail(
        `Created ${destPath}, but couldn't remove ${file.path} — it may have changed. Moved ${moved} of ${files.length} files fully; fix this one manually.`,
        'UNKNOWN',
      );
    }
  }

  return {
    ok: true,
    data: {
      filesMoved: moved,
    },
  };
}