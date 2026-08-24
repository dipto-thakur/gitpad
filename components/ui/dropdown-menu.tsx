// file: components/ui/dropdown-menu.tsx
'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({
  className,
  sideOffset = 8,
  align = 'end',
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'z-50 min-w-[190px] max-w-[250px] overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/95 p-1 backdrop-blur-xl',
          'shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_12px_28px_-8px_rgba(0,0,0,0.10)]',
          'dark:border-zinc-800/80 dark:bg-zinc-900/95 dark:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3),0_12px_28px_-8px_rgba(0,0,0,0.5)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
          'origin-[var(--radix-dropdown-menu-content-transform-origin)]',
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  variant = 'default',
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  /** 'destructive' pre-applies red styling — no need to hand-roll className overrides at each call site. */
  variant?: 'default' | 'destructive';
}) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'flex h-9 w-full cursor-pointer select-none items-center gap-2.5 rounded-[10px] px-2.5 text-[13px] font-medium outline-none',
        'transition-colors duration-100 [&>svg]:h-[15px] [&>svg]:w-[15px] [&>svg]:shrink-0',
        variant === 'destructive'
          ? 'text-red-600 data-[highlighted]:bg-red-50 dark:text-red-400 dark:data-[highlighted]:bg-red-950/40'
          : 'text-zinc-700 data-[highlighted]:bg-zinc-100 dark:text-zinc-200 dark:data-[highlighted]:bg-zinc-800/70',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn(
        'px-2.5 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn('my-1 h-px bg-zinc-200/70 dark:bg-zinc-800/70', className)}
      {...props}
    />
  );
}