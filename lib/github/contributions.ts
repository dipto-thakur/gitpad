// lib/github/contributions.ts

import type { GitHubRequest } from './request';
import type { GhContributionsData } from './types';

export async function getContributionStats(
  api: GitHubRequest,
): Promise<{
  totalContributions: number;
  currentStreak: number;
  last7Days: { date: string; count: number }[];
}> {
  const query = `
    query {
      viewer {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const data =
    await api.graphql<GhContributionsData>(query);

  const calendar =
    data.viewer.contributionsCollection.contributionCalendar;

  const days = calendar.weeks.flatMap(
    (week) => week.contributionDays,
  );

  return {
    totalContributions: calendar.totalContributions,
    currentStreak: computeCurrentStreak(days),
    last7Days: days.slice(-7).map((day) => ({
      date: day.date,
      count: day.contributionCount,
    })),
  };
}

export function computeCurrentStreak(
  days: {
    date: string;
    contributionCount: number;
  }[],
): number {
  let streak = 0;
  let skippedToday = false;

  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i]!;

    if (day.contributionCount > 0) {
      streak++;
      continue;
    }

    if (i === days.length - 1 && !skippedToday) {
      skippedToday = true;
      continue;
    }

    break;
  }

  return streak;
}