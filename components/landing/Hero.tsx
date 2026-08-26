// file: components/landing/Hero.tsx
'use client';

import { motion, type Variants } from 'framer-motion';
import { RiArrowRightLine, RiGithubFill } from 'react-icons/ri';
import { SignInButton } from '@/components/sign/SignInButton';
import { EditorPreview } from '@/components/landing/illustration';
import { Badge } from '@/components/ui/badge';
import { siteConfig } from '@/hooks/site-config';
import { useSafeReducedMotion } from '@/lib/use-safe-reduced-motion';

export function Hero() {
  const reduceMotion = useSafeReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.07, delayChildren: reduceMotion ? 0 : 0.04 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section className="relative overflow-hidden bg-background/90 dark:bg-background/95">

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.05),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_65%)]"
      />


      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-200/80 to-transparent dark:via-zinc-800/80"
      />

      <div className="mx-auto max-w-5xl px-6 pb-16 pt-14 sm:py-28">
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
        >
          <motion.div variants={item} className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <EditorPreview />
          </motion.div>

          <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
            <motion.div variants={item}>
              <Badge variant="outline" className="gap-1.5 border-border/80 bg-background/60 py-1 pl-1 pr-2.5 backdrop-blur-sm dark:border-zinc-800 dark:bg-muted/60">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                  <RiGithubFill className="h-2.5 w-2.5" />
                </span>
                Built on the GitHub API
              </Badge>
            </motion.div>

            <motion.h1
              variants={item}
              className="mt-5 text-[34px] font-semibold leading-[1.1] tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl sm:leading-[1.08]"
            >
              {siteConfig.tagline}
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-muted-foreground dark:text-muted-foreground sm:text-base"
            >
              A lightweight GitHub document client. Open a file, edit it, commit.
              no Git, no terminal, no local clone.
            </motion.p>

            <motion.div variants={item} className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
              <SignInButton className="w-full sm:w-auto sm:px-8" />

              <a
                href={siteConfig.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-11 items-center gap-1.5 rounded-xl px-4 text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-zinc-900 active:text-zinc-900 dark:text-muted-foreground dark:hover:text-zinc-100 dark:active:text-zinc-100"
              >
                View source
                <RiArrowRightLine className="h-[15px] w-[15px] shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
              </a>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-8 flex items-center gap-2 text-[12px] text-muted-foreground dark:text-muted-foreground/50"
            >
              No install · Sign in with GitHub · Free
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}