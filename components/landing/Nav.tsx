// file: components/landing/Nav.tsx
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { SignInButton } from '@/components/sign/SignInButton';
import { SITE_CONFIG } from '@/components/landing/site-config';

export function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <span className="text-sm font-semibold tracking-tight text-foreground">{SITE_CONFIG.name}</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignInButton size="sm" />
        </div>
      </div>
    </header>
  );
}