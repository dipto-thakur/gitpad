// file: components/ui/scrollbar.tsx
'use client';

import { cn } from '@/lib/utils';

/**
 * Global custom-scrollbar styling — thin, rounded, theme-aware, near-
 * invisible until hovered/scrolled. Render <ScrollbarStyles /> exactly
 * once, high in the tree (root layout), then apply the `scrollbar-thin`
 * className to any individually-scrollable container (dropdown menus,
 * drawers, nested file trees, code panes) to opt it in.
 *
 * Uses styled-jsx (built into Next.js, no dependency) since Tailwind has
 * no first-class way to target ::-webkit-scrollbar pseudo-elements.
 */
export function ScrollbarStyles() {
  return (
    <style jsx global>{`
      .scrollbar-thin {
        scrollbar-width: thin;
        scrollbar-color: rgba(161, 161, 170, 0.35) transparent;
      }
      .dark .scrollbar-thin {
        scrollbar-color: rgba(113, 113, 122, 0.35) transparent;
      }

      .scrollbar-thin::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      .scrollbar-thin::-webkit-scrollbar-track {
        background: transparent;
      }
      .scrollbar-thin::-webkit-scrollbar-thumb {
        background-color: rgba(161, 161, 170, 0.35);
        border-radius: 9999px;
        border: 2px solid transparent;
        background-clip: content-box;
        transition: background-color 0.15s ease;
      }
      .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background-color: rgba(161, 161, 170, 0.6);
      }
      .dark .scrollbar-thin::-webkit-scrollbar-thumb {
        background-color: rgba(113, 113, 122, 0.35);
      }
      .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background-color: rgba(113, 113, 122, 0.6);
      }
      .scrollbar-thin::-webkit-scrollbar-corner {
        background: transparent;
      }

      /* Fully hidden variant — for surfaces where any scrollbar, even
         thin, would clutter the layout (breadcrumb horizontal scroll,
         tab strips) but scrolling must still work. */
      .scrollbar-none {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .scrollbar-none::-webkit-scrollbar {
        display: none;
      }
    `}</style>
  );
}

/**
 * Convenience wrapper — a scrollable div pre-wired with the thin
 * scrollbar class. Optional; applying `scrollbar-thin` directly to an
 * existing element works just as well when a wrapper isn't wanted.
 */
export function ScrollArea({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('overflow-auto scrollbar-thin', className)} {...props}>
      {children}
    </div>
  );
}