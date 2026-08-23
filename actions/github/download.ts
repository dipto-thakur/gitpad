// file: actions/github/download.ts
'use server';

import JSZip from 'jszip';
import type { ActionResult } from '@/types';

import {
  getClient,
  fail,
  fromApiError,
  apiErrorMessage,
  validateRepoRef,
  validateRepoBranch,
  validatePath,
  validateSha,
} from './shared';

export async function downloadFileAction(params: {
  owner: string;
  repo: string;
  path: string;
  sha: string;
}): Promise<ActionResult<{ filename: string; base64: string }>> {
  const client = await getClient();
  if (!client) return fail('Sign in required.', 'UNAUTHENTICATED');
  const { owner, repo, path, sha } = params;

  const repoValidation = validateRepoRef(owner, repo);
  if (!repoValidation.ok) return repoValidation;

  const pathValidation = validatePath(path);
  if (!pathValidation.ok) return pathValidation;

  const shaValidation = validateSha(sha);
  if (!shaValidation.ok) return shaValidation;

  try {
    const blob = await client.getBlob(owner, repo, sha);
    return {
      ok: true,
      data: { filename: path.split('/').pop() ?? path, base64: blob.content },
    };
  } catch (e) {
    return fromApiError(e);
  }
}

const MAX_ZIP_FILES = 200;

export async function downloadFolderAction(params: {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}): Promise<ActionResult<{ filename: string; base64: string }>> {
  const client = await getClient();
  if (!client) return fail('Sign in required.', 'UNAUTHENTICATED');
  const { owner, repo, branch, path } = params;

  const repoValidation = validateRepoBranch(owner, repo, branch);
  if (!repoValidation.ok) return repoValidation;

  const pathValidation = validatePath(path);
  if (!pathValidation.ok) return pathValidation;

  let files;
  try {
    files = await client.listFilesRecursive(owner, repo, branch, path);
  } catch (e) {
    return fromApiError(e);
  }
  if (files.length === 0) {
    return fail('Folder is empty or no longer exists.', 'NOT_FOUND');
  }
  if (files.length > MAX_ZIP_FILES) {
    return fail(
      `This folder has ${files.length} files — too many to zip in one request (limit ${MAX_ZIP_FILES}).`,
      'VALIDATION',
    );
  }

  const zip = new JSZip();
  const folderName = path.split('/').pop() ?? path;

  for (const f of files) {
    try {
      const blob = await client.getBlob(owner, repo, f.sha);
      const relativePath = f.path.slice(path.length).replace(/^\//, '');
      zip.file(relativePath, blob.content, { base64: true });
    } catch (e) {
      return fail(`${apiErrorMessage(e)} Failed while zipping ${f.path}.`, 'UNKNOWN');
    }
  }

  const zipBase64 = await zip.generateAsync({ type: 'base64' });
  return { ok: true, data: { filename: `${folderName}.zip`, base64: zipBase64 } };
}