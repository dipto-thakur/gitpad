// file: components/landing/HowItWorks.tsx
import { RiGitCommitLine, RiKey2Line, RiFolderOpenLine, RiEditLine } from 'react-icons/ri';

const STEPS = [
  { icon: RiKey2Line, title: 'Connect', desc: 'Sign in with GitHub OAuth.' },
  { icon: RiFolderOpenLine, title: 'Browse', desc: 'Pick a repo, branch, and file.' },
  { icon: RiEditLine, title: 'Edit', desc: 'Plain text, any extension.' },
  { icon: RiGitCommitLine, title: 'Commit', desc: 'Pushed straight to GitHub.' },
];

export function HowItWorks() {
  return (
    <section className="relative  bg-background/90 border-border/80 dark:bg-background/95">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2 className="text-center font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground text-muted-foreground">
          How it works
        </h2>

        <ol className="relative mt-10 grid gap-y-10 gap-x-6 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-4">
          {/* Connecting line behind the step icons on desktop — reinforces
              "sequence" visually, not just via numbering. Hidden on mobile
              where the 2-col/stacked layout doesn't read as one line. */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-800 lg:block"
          />

          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <li key={title} className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full  bg-background text-zinc-700  dark:bg-background dark:text-muted-foreground/50">
                <Icon className="h-20 w-20" />
              </div>

              <p className="mt-3 text-[13.5px] font-medium text-foreground text-foreground">
                <span className="font-mono text-muted-foreground dark:text-muted-foreground/50">{i + 1}. </span>
                {title}
              </p>

              <p className="mt-1 max-w-[180px] text-[12.5px] leading-relaxed text-muted-foreground dark:text-muted-foreground">
                {desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}