// app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/theme/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://diptothakur.vercel.app/"),

  title: {
    default: "GitNote",
    template: "%s · GitNote",
  },

  description:
    "Edit, create, and commit repository files directly to GitHub from any device. No Git installation. No terminal.",

  applicationName: "GitNote",

  keywords: [
    "GitHub",
    "Git",
    "Repository",
    "README",
    "Markdown",
    "Documentation",
    "Commit",
    "Editor",
    "Developer Tools",
  ],

  authors: [{ name: "Dipto Thakur" }],
  creator: "Dipto Thakur",
  publisher: "Dipto Thakur",

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    type: "website",
    title: "GitNote",
    description:
      "A lightweight GitHub document editor for committing changes without Git.",
    siteName: "GitNote",
  },

  twitter: {
    card: "summary_large_image",
    title: "GitNote",
    description:
      "Edit and commit repository files directly from your browser.",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={inter.variable}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}