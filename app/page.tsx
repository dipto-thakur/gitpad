import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { SignInButton } from '@/components/SignInButton';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect('/repos');

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-xl font-semibold tracking-tight">GitHub Doc Editor</h1>
      <p className="text-sm text-muted">
        Edit any UTF-8 text file — Markdown, code, config, whatever — in your
        repositories and commit directly, without Git, terminal, or a local
        clone.
      </p>
      <SignInButton />
    </main>
  );
}