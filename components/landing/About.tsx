// file: components/landing/About.tsx
import {
  RiShieldCheckLine,
  RiLockLine,
  RiTerminalBoxLine,
  RiSmartphoneLine,
  RiFlashlightLine,
  RiCursorLine,
} from 'react-icons/ri';
import { Badge } from '@/components/ui/badge';
import { siteConfig } from '@/hooks/site-config'; // ← pull trustItems from here

// siteConfig.trustItems shape:
// { label: string; icon?: 'shield' | 'lock' | 'terminal' | 'mobile' | 'fast' | 'quick' }[]

const ICON_MAP = {
  shield: RiShieldCheckLine,
  lock: RiLockLine,
  terminal: RiTerminalBoxLine,
  mobile: RiSmartphoneLine,
  fast: RiFlashlightLine,
  quick: RiCursorLine,
} as const;

export function About() {
  const trustItems = siteConfig.trustItems ?? [
    { label: 'Official GitHub OAuth', icon: 'shield' },
    { label: 'Private repos supported', icon: 'lock' },
    { label: 'No Git. No terminal.', icon: 'terminal' },
    { label: 'Mobile-first', icon: 'mobile' },
    { label: 'Fast', icon: 'fast' },
    { label: 'Quick access', icon: 'quick' },
  ];

  return (
    <section className="mx-auto max-auto px-6 py-16 bg-background/90 border-border/80 dark:bg-background/95">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-base leading-7 text-foreground text-foreground">
          Not an IDE. Not GitHub Desktop. GitPad does one thing 
          <span className="text-muted-foreground dark:text-muted-foreground"> open a file, edit it, commit it.</span>
        </p>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {trustItems.map(({ label, icon }) => {
            const Icon = icon ? ICON_MAP[icon as keyof typeof ICON_MAP] : undefined;
            return (
              <li key={label}>
                <Badge
                  variant="outline"
                  className="gap-1.5 border-border/80 bg-background/60 py-1 pl-2 pr-2.5 text-muted-foreground/50 backdrop-blur-sm transition-colors hover:border-zinc-300 hover:bg-background dark:border-zinc-800 dark:bg-muted/60 dark:text-muted-foreground/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground text-muted-foreground" />}
                  {label}
                </Badge>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}