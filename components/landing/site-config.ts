// file: components/landing/site-config.ts

/**
 * Central config for the landing page. Update these three to point at your
 * own repo, GitHub profile, and portfolio — everything else on the page
 * (Nav, Creator) reads from here rather than hardcoding links in markup.
 */
export const SITE_CONFIG = {
    name: 'GitNote',
    tagline: 'Edit. Commit. Done.',
    creatorName: 'Dipto Thakur',
    repoUrl: 'https://github.com/your-username/gh-doc-editor',
    githubUrl: 'https://github.com/your-username',
    portfolioUrl: 'https://dipto.dev',
  } as const;