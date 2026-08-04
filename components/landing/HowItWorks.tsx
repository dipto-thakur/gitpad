// file: components/landing/HowItWorks.tsx
import { GitCommitHorizontal, KeyRound, FolderOpen, PenLine } from 'lucide-react';

const STEPS = [
  { icon: KeyRound, title: 'Connect', desc: 'Sign in with GitHub OAuth.' },
  { icon: FolderOpen, title: 'Browse', desc: 'Pick a repo, branch, and file.' },
  { icon: PenLine, title: 'Edit', desc: 'Plain text, any extension.' },
  { icon: GitCommitHorizontal, title: 'Commit', desc: 'Pushed straight to GitHub.' },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          How it works
        </h2>
        <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <li key={title} className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                <span className="text-muted-foreground">{i + 1}. </span>
                {title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}