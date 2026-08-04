// file: components/landing/Creator.tsx
import { Globe, Code2 } from 'lucide-react';
import { GithubMark } from '@/components/icons/GithubMark';
import { SITE_CONFIG } from '@/components/landing/site-config';

const LINKS = [
  { href: SITE_CONFIG.repoUrl, label: 'Source', icon: Code2 },
  { href: SITE_CONFIG.githubUrl, label: 'GitHub', icon: GithubMark },
  { href: SITE_CONFIG.portfolioUrl, label: 'Portfolio', icon: Globe },
];

export function Creator() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-10 text-center">
        <p className="text-xs text-muted-foreground">
          Built by <span className="text-foreground">{SITE_CONFIG.creatorName}</span>
        </p>
        <div className="flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}