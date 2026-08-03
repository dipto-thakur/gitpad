import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetServerAccessToken, mockGetContributionStats } = vi.hoisted(() => ({
  mockGetServerAccessToken: vi.fn(),
  mockGetContributionStats: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  getServerAccessToken: mockGetServerAccessToken,
}));

vi.mock('@/lib/github/client', async () => {
  const actual = await vi.importActual<typeof import('@/lib/github/client')>('@/lib/github/client');
  return {
    ...actual,
    GitHubClient: vi.fn().mockImplementation(() => ({
      getContributionStats: mockGetContributionStats,
    })),
  };
});

import { getProfileStatsAction } from './profile';

describe('getProfileStatsAction', () => {
  beforeEach(() => {
    mockGetServerAccessToken.mockReset();
    mockGetContributionStats.mockReset();
  });

  it('returns UNAUTHENTICATED when there is no session token', async () => {
    mockGetServerAccessToken.mockResolvedValueOnce(null);
    const result = await getProfileStatsAction();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('UNAUTHENTICATED');
    expect(mockGetContributionStats).not.toHaveBeenCalled();
  });

  it('returns stats on success', async () => {
    mockGetServerAccessToken.mockResolvedValueOnce('fake-token');
    mockGetContributionStats.mockResolvedValueOnce({ totalContributions: 128, currentStreak: 4 });
    const result = await getProfileStatsAction();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ totalContributions: 128, currentStreak: 4 });
  });

  it('fails gracefully (no throw) when the GraphQL call errors', async () => {
    mockGetServerAccessToken.mockResolvedValueOnce('fake-token');
    mockGetContributionStats.mockRejectedValueOnce(new Error('rate limited'));
    const result = await getProfileStatsAction();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNKNOWN');
      expect(result.error).toContain("Couldn't load contribution stats");
    }
  });
});