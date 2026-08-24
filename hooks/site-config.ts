// file: components/landing/site-config.ts
export type TrustItem = {
  label: string;
  icon: 'shield' | 'lock' | 'terminal' | 'mobile' | 'fast' | 'quick';
};

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
      { label: 'Mobile-first', icon: 'mobile' },
      { label: 'Fast', icon: 'fast' },
      { label: 'Quick access', icon: 'quick' },
    ] satisfies TrustItem[],
  } as const;

 