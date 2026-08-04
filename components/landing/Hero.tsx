// file: components/landing/Hero.tsx
'use client';

import { motion, type Variants } from 'framer-motion';
import { SignInButton } from '@/components/sign/SignInButton';
import { EditorPreview } from '@/components/landing/EditorPreview';
import { SITE_CONFIG } from '@/components/landing/site-config';
import { useSafeReducedMotion } from '@/lib/use-safe-reduced-motion';

export function Hero() {
  const reduceMotion = useSafeReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.07, delayChildren: reduceMotion ? 0 : 0.04 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  };

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
      >
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.h1 variants={item} className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {SITE_CONFIG.tagline}
          </motion.h1>
          <motion.p variants={item} className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
            A lightweight GitHub document client. Open a file, edit it, commit —
            no Git, no terminal, no local clone.
          </motion.p>

          {/* Single dominant action for the page. */}
          <motion.div variants={item} className="mt-8 w-full sm:w-auto">
            <SignInButton className="w-full sm:w-auto sm:px-8" />
          </motion.div>
        </div>

        <motion.div variants={item} className="flex justify-center lg:justify-end">
          <EditorPreview />
        </motion.div>
      </motion.div>
    </section>
  );
}