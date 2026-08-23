// file: components/landing/Nav.tsx
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { SignInButton } from '@/components/sign/SignInButton';
import { BrandMark } from '@/components/icons/BrandMark';

export function Nav() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
      <BrandMark className="h-6 w-26 text-foreground" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignInButton size="sm" />
        </div>
      </div>
    </header>
  );
}