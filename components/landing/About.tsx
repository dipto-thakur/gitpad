// file: components/landing/About.tsx
import { Check } from 'lucide-react';

const TRUST_ITEMS = ['Official GitHub OAuth', 'Private repos supported', 'No Git. No terminal.'];

export function About() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-base leading-7 text-foreground">
          Not an IDE. Not GitHub Desktop. GitNote does one thing —
          <span className="text-muted-foreground"> open a file, edit it, commit it.</span>
        </p>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {TRUST_ITEMS.map((label) => (
            <li key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-foreground" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}