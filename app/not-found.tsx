// file: app/not-found.tsx
import NextLink from 'next/link';
import { RiArrowRightLine, RiHome5Line } from 'react-icons/ri';
import { BrandMark } from '@/components/icons/BrandMark';

/**
 * Adapted for GitPad: no custom font stack (this project relies on system
 * fonts + font-mono for paths/code, not Newsreader/Geist), background and
 * button styling match the zinc-50/950 + active-state tap-feedback
 * convention used across Header/Row/EmptyState. "Contact" swapped for
 * "Repositories" — the one destination that actually makes sense to
 * offer someone who's lost in this app.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-sm flex-col items-center text-center">
      <BrandMark className="h-7 w-auto text-zinc-950 dark:text-zinc-50" />

        <p className="mt-6 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
          Error 404
        </p>

        <h1 className="mt-3 text-[26px] font-medium tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Page not found
        </h1>

        <p className="mt-3 max-w-[280px] text-[13.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          The page you&apos;re looking for doesn&apos;t exist, or it may have been moved.
        </p>

        <div className="mt-7 flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          <NextLink
            href="/repos"
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 text-[13.5px] font-medium text-white transition-colors active:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-300 sm:h-9"
          >
            <RiHome5Line className="h-[15px] w-[15px] shrink-0" />
            Go to repositories
          </NextLink>

          <NextLink
            href="/"
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-zinc-200/80 px-4 text-[13.5px] font-medium text-zinc-600 transition-colors active:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:active:bg-zinc-900 sm:h-9"
          >
            Home
            <RiArrowRightLine className="h-[15px] w-[15px] shrink-0" />
          </NextLink>
        </div>
      </div>
    </main>
  );
}