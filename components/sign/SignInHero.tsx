// file: components/sign/SignInHero.tsx
'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Check } from 'lucide-react';
import { SignInButton } from '@/components/sign/SignInButton';

const TRUST_ITEMS = ['Official GitHub OAuth', 'Private repositories supported', 'No Git. No terminal.'];

export function SignInHero() {
  const reduceMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.07, delayChildren: reduceMotion ? 0 : 0.04 },
    },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  };

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={container}
      className="flex w-full max-w-sm flex-col items-center"
    >
      <motion.header variants={item} className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">GitNote</h1>
        <p className="text-base font-medium tracking-tight text-foreground">Edit. Commit. Done.</p>
        <p className="text-sm leading-6 text-muted-foreground">
          A lightweight GitHub document client for READMEs, notes, configs, and text files.
        </p>
      </motion.header>

      {/* Single dominant action — full width so it reads as the one thing
          to do on this screen, not one option among several. */}
      <motion.div variants={item} className="mt-10 w-full">
        <SignInButton className="w-full" />
      </motion.div>

      <motion.ul variants={item} className="mt-8 w-full space-y-3 border-t border-border pt-6">
        {TRUST_ITEMS.map((label) => (
          <li key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
            <Check className="h-4 w-4 shrink-0 text-foreground" />
            <span>{label}</span>
          </li>
        ))}
      </motion.ul>
    </motion.section>
  );
}