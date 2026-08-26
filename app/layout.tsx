// file: app/layout.tsx
import type { Metadata, Viewport } from 'next';

import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ScrollbarStyles } from '@/components/ui/scrollbar';
import { sans, mono } from '@/lib/fonts';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdfcfb' },
    { media: '(prefers-color-scheme: dark)', color: '#161412' },
  ],
  colorScheme: 'light dark',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://gitpad.vercel.app'),

  title: {
    default: 'GitPad',
    template: '%s · GitPad',
  },

  description:
    'Edit, create, and commit repository files directly to GitHub from any device. No Git installation. No terminal.',

  applicationName: 'GitPad',

  keywords: [
    'GitHub',
    'Git',
    'Repository',
    'README',
    'Markdown',
    'Documentation',
    'Commit',
    'Editor',
    'Developer Tools',
  ],

  authors: [{ name: 'Dipto Thakur' }],
  creator: 'Dipto Thakur',
  publisher: 'Dipto Thakur',

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },

  openGraph: {
    type: 'website',
    title: 'GitPad',
    description: 'A lightweight GitHub document editor for committing changes without Git.',
    siteName: 'GitPad',
    url: 'https://gitpad.vercel.app',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'GitPad — edit and commit GitHub files from your browser',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'GitPad',
    description: 'Edit and commit repository files directly from your browser.',
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ScrollbarStyles />
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}