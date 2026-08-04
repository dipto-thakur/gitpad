// file: actions/profile.ts
'use server';

import { getServerAccessToken } from '@/lib/auth/session';
import { GitHubClient } from '@/lib/github/client';
import type { ActionResult } from '@/types';

export interface DayCount {
  /** ISO date, e.g. "2026-08-05" */
  date: string;
  count: number;
}

export interface ProfileStats {
  totalContributions: number;
  currentStreak: number;
  /** Oldest → newest, always exactly 7 entries ending today. */
  last7Days: DayCount[];
}

/**
 * Contribution stats for the profile drawer. Purely informational — a
 * failure here (GraphQL hiccup, rate limit) should never block sign-out or
 * navigation, so callers should treat a failed result as "hide the stats
 * section", not as an error to surface loudly.
 */
export async function getProfileStatsAction(): Promise<ActionResult<ProfileStats>> {
  const token = await getServerAccessToken();
  if (!token) return { ok: false, error: 'Sign in required.', code: 'UNAUTHENTICATED' };

  try {
    const client = new GitHubClient(token);
    const stats = await client.getContributionStats();
    return { ok: true, data: stats };
  } catch {
    return { ok: false, error: "Couldn't load contribution stats.", code: 'UNKNOWN' };
  }
}