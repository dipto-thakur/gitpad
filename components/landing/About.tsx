// file: components/landing/About.tsx
import { ShieldCheck, Lock, TerminalSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { siteConfig } from '@/hooks/site-config'; // ← pull TRUST_ITEMS from here

// siteConfig.trustItems shape:
// { label: string; icon?: 'shield' | 'lock' | 'terminal' }[]

const ICON_MAP = {
  shield: ShieldCheck,
  lock: Lock,
  terminal: TerminalSquare,
} as const;

export function About() {
  const trustItems = siteConfig.trustItems ?? [
    { label: 'Official GitHub OAuth', icon: 'shield' },
    { label: 'Private repos supported', icon: 'lock' },
    { label: 'No Git. No terminal.', icon: 'terminal' },
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-base leading-7 text-foreground">
          Not an IDE. Not GitHub Desktop. GitNote does one thing 
     </p>
          <span className="text-muted-foreground"> open a file, edit it, commit it.</span>
   

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {trustItems.map(({ label, icon }) => {
            const Icon = ICON_MAP[icon as keyof typeof ICON_MAP];
            return (
              <li key={label}>
                <Badge variant="outline">
                  {Icon && <Icon className="h-3.5 w-3.5" />}
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