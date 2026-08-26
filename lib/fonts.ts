// file: lib/fonts.ts
import { Inter, JetBrains_Mono } from 'next/font/google';

/**
 * UI sans — body text, labels, buttons, headings. Inter reads clean and
 * neutral at small sizes (13–15px), which is most of this app's text —
 * dense list rows, dropdown items, form labels — without the personality
 * a display/serif font would add that this utility-first app doesn't need.
 */
export const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

/**
 * Monospace — file paths, branch names, commit SHAs, the code editor
 * itself, breadcrumbs. JetBrains Mono has clear glyph disambiguation
 * (0 vs O, 1 vs l vs I) which matters a lot here since this app's whole
 * job is displaying exact file paths and git refs users must trust are
 * accurate at a glance.
 */
export const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});