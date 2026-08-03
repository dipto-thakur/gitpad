// file: app/page.tsx
import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { SignInButton } from '@/components/sign/SignInButton';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect('/repos');

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6">
      <div className="flex max-w-xs flex-col items-center gap-3 text-center">
        <h1 className="text-lg font-medium tracking-tight text-foreground">GitHub Doc Editor</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Edit any text file — Markdown, code, config, whatever — in your
          repositories and commit directly. No Git, terminal, or local clone.
        </p>
      </div>
      <SignInButton />
    </main>
  );
}