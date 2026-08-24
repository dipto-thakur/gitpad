// file: components/ui/inline-banner.tsx
'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RiCheckboxCircleFill, RiCloseLine, RiErrorWarningFill, RiInformationFill } from 'react-icons/ri';
import { cn } from '@/lib/utils';

type Variant = 'error' | 'success' | 'info';

const VARIANT_STYLES: Record<Variant, { container: string; icon: string; Icon: typeof RiErrorWarningFill }> = {
  error: {
    container:
      'border-red-200/80 bg-red-50/80 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400',
    icon: 'text-red-500 dark:text-red-400',
    Icon: RiErrorWarningFill,
  },
  success: {
    container:
      'border-emerald-200/80 bg-emerald-50/80 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400',
    icon: 'text-emerald-500 dark:text-emerald-400',
    Icon: RiCheckboxCircleFill,
  },
  info: {
    container:
      'border-blue-200/80 bg-blue-50/80 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-400',
    icon: 'text-blue-500 dark:text-blue-400',
    Icon: RiInformationFill,
  },
};

export function InlineBanner({
  variant,
  children,
  className,
  dismissible = false,
}: {
  variant: Variant;
  children: React.ReactNode;
  className?: string;
  /** Shows a close (×) button that removes the banner from view — local only, doesn't touch parent state. */
  dismissible?: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);
  const { container, icon, Icon } = VARIANT_STYLES[variant];

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.15 }}
          role={variant === 'error' ? 'alert' : 'status'}
          className={cn(
            'flex items-start gap-2.5 overflow-hidden rounded-xl border px-3.5 py-3 text-[13px] leading-snug',
            container,
            className,
          )}
        >
          <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', icon)} />
          <span className="min-w-0 flex-1">{children}</span>

          {dismissible && (
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setDismissed(true)}
              className="-m-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full opacity-60 transition-opacity hover:opacity-100"
            >
              <RiCloseLine className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}