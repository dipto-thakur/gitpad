// file: components/landing/site-config.ts

export const siteConfig = {
    name: 'GitPad',
    tagline: 'Edit. Commit. Done.',
    creatorName: 'Dipto Thakur',
    repoUrl: 'https://github.com/dipto-thakur/gitpad',
    githubUrl: 'https://github.com/dipto-thakur',
    portfolioUrl: 'https://diptothakur.vercel.app',

    trustItems: [
      { label: 'Official GitHub OAuth', icon: 'shield' },
      { label: 'Private repos supported', icon: 'lock' },
      { label: 'No Git. No terminal.', icon: 'terminal' },
    ] satisfies TrustItem[],
  } as const;

  export type TrustItem = {
    label: string;
    icon: 'shield' | 'lock' | 'terminal';
  };