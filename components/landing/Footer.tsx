// file: components/landing/Footer.tsx
import { Globe, Code2 } from 'lucide-react';
import { GithubMark } from '@/components/icons/GithubMark';
import { BrandMark } from '@/components/icons/BrandMark';
import { siteConfig } from '@/hooks/site-config';

const LINKS = [
  { href: siteConfig.repoUrl, label: 'Source', icon: Code2 },
  { href: siteConfig.githubUrl, label: 'GitHub', icon: GithubMark },
  { href: siteConfig.portfolioUrl, label: 'Portfolio', icon: Globe },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-zinc-50/100 dark:bg-zinc-950/100">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-12 text-center">
      <BrandMark className="h-7 w-auto text-zinc-950 dark:text-zinc-50" />
      
        <div className="flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>

        <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
          <p>
            Built by{' '}
            <a
              href={siteConfig.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline-offset-4 hover:underline"
            >
              {siteConfig.creatorName}
            </a>
          </p>
          <p>© {year} {siteConfig.name ?? 'GitNote'}. OpenSource MIT.</p>
        </div>
      </div>
    </footer>
  );
}