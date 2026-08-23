// lib/github/request.ts

import {
    classify,
    GitHubApiError,
    sanitizeErrorBody,
  } from './errors';
  
  const GITHUB_API =
    process.env.GITHUB_API_BASE_URL ?? 'https://api.github.com';
  
  export class GitHubRequest {
    constructor(private readonly token: string) {}
  
    async request<T>(
      path: string,
      init?: RequestInit,
    ): Promise<T> {
      let res: Response;
  
      try {
        res = await fetch(`${GITHUB_API}${path}`, {
          ...init,
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            ...(init?.headers ?? {}),
          },
          cache: 'no-store',
        });
      } catch {
        throw new GitHubApiError(
          'Network error contacting GitHub',
          0,
          'NETWORK',
        );
      }
  
      if (!res.ok) {
        const body = await res.text().catch(() => '');
  
        throw new GitHubApiError(
          `GitHub API error (${res.status}): ${sanitizeErrorBody(body)}`,
          res.status,
          classify(res.status),
        );
      }
  
      if (res.status === 204) {
        return undefined as T;
      }
  
      return (await res.json()) as T;
    }
  
    async graphql<T>(query: string): Promise<T> {
      let res: Response;
  
      try {
        res = await fetch(`${GITHUB_API}/graphql`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
          cache: 'no-store',
        });
      } catch {
        throw new GitHubApiError(
          'Network error contacting GitHub',
          0,
          'NETWORK',
        );
      }
  
      if (!res.ok) {
        throw new GitHubApiError(
          `GitHub GraphQL error (${res.status})`,
          res.status,
          classify(res.status),
        );
      }
  
      const json = (await res.json()) as {
        data?: T;
        errors?: { message: string }[];
      };
  
      if (json.errors?.length) {
        throw new GitHubApiError(
          json.errors[0]!.message.slice(0, 200),
          200,
          'UNKNOWN',
        );
      }
  
      if (!json.data) {
        throw new GitHubApiError(
          'GitHub GraphQL returned no data',
          200,
          'UNKNOWN',
        );
      }
  
      return json.data;
    }
  }