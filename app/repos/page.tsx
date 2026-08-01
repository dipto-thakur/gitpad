import Link from 'next/link';
import { listRepositoriesAction } from '@/actions/github';
import { getCurrentUser } from '@/lib/auth/session';
import { SignOutButton } from '@/components/SignOutButton';
import { RepoSearch } from '@/components/RepoSearch';

export default async function ReposPage() {
  const user = await getCurrentUser();
  const result = await listRepositoriesAction();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Repositories</h1>
          {user && <p className="text-sm text-muted">Signed in as {user.login}</p>}
        </div>
        <SignOutButton />
      </header>

      {!result.ok && (
        <p className="rounded-md border border-border bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error}
        </p>
      )}

      {result.ok && <RepoSearch repos={result.data} />}
    </main>
  );
}
