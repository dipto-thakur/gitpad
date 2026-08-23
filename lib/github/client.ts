// lib/github/client.ts

import 'server-only';

import { GitHubRequest } from './request';

import * as repository from './repository';
import * as tree from './tree';
import * as file from './file';
import * as contributions from './contributions';

export {
  GitHubApiError,
  BinaryFileError,
} from './errors';

export { computeCurrentStreak } from './contributions';

export class GitHubClient {
  private readonly api: GitHubRequest;

  constructor(accessToken: string) {
    this.api = new GitHubRequest(accessToken);
  }

  listRepositories() {
    return repository.listRepositories(this.api);
  }

  listBranches(owner: string, repo: string) {
    return repository.listBranches(
      this.api,
      owner,
      repo,
    );
  }

  getRepo(owner: string, repo: string) {
    return repository.getRepo(
      this.api,
      owner,
      repo,
    );
  }

  listTree(
    owner: string,
    repo: string,
    branch: string,
    path: string,
  ) {
    return tree.listTree(
      this.api,
      owner,
      repo,
      branch,
      path,
    );
  }

  listFilesRecursive(
    owner: string,
    repo: string,
    branch: string,
    path: string,
  ) {
    return tree.listFilesRecursive(
      this.api,
      owner,
      repo,
      branch,
      path,
    );
  }

  getFile(
    owner: string,
    repo: string,
    branch: string,
    path: string,
  ) {
    return file.getFile(
      this.api,
      owner,
      repo,
      branch,
      path,
    );
  }

  createFile(params: Parameters<typeof file.createFile>[1]) {
    return file.createFile(this.api, params);
  }

  commitFile(params: Parameters<typeof file.commitFile>[1]) {
    return file.commitFile(this.api, params);
  }

  deleteFile(params: Parameters<typeof file.deleteFile>[1]) {
    return file.deleteFile(this.api, params);
  }
  getBlob(owner: string, repo: string, fileSha: string) {
    return file.getBlob(this.api, owner, repo, fileSha);
  }

  getContributionStats() {
    return contributions.getContributionStats(
      this.api,
    );
  }
}