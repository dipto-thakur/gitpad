// file: components/ui/drawer.tsx
'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

/**
 * Bottom sheet content. Radix handles focus trap, Escape-to-close, and
 * outside-click for us (accessibility floor); Framer Motion owns the
 * slide-up/fade visuals so they can be tuned (120–180ms, no bounce) without
 * fighting Radix's own animation system.
 */
export function DrawerContent({
  children,
  className,
  open,
}: {
  children: React.ReactNode;
  className?: string;
  open: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <DialogPrimitive.Portal forceMount>
          <DialogPrimitive.Overlay asChild forceMount>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-black/40"
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content asChild forceMount aria-describedby={undefined}>
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
              className={cn(
                'fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto',
                'rounded-t-lg border-t border-border bg-surface pb-safe',
                'sm:inset-x-auto sm:left-1/2 sm:bottom-8 sm:max-w-sm sm:-translate-x-1/2 sm:rounded-lg sm:border',
                className,
              )}
            >
              <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-border sm:hidden" />
              {children}
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

export function DrawerHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-4 pt-3', className)}>{children}</div>;
}

export function DrawerTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <DialogPrimitive.Title className={cn('text-sm font-semibold text-foreground', className)}>
      {children}
    </DialogPrimitive.Title>
  );
}

export function DrawerDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('mt-1 text-sm text-muted-foreground', className)}>{children}</p>;
}

export function DrawerBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-4 py-3', className)}>{children}</div>;
}

export function DrawerFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex justify-end gap-2 px-4 pb-4 pt-2', className)}>{children}</div>;
}