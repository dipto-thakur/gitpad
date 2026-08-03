// file: app/repos/page.tsx
import { listRepositoriesAction } from '@/actions/github';
import { getCurrentUser } from '@/lib/auth/session';
import { SignOutButton } from '@/components/sign/SignOutButton';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { RepoSearch } from '@/components/RepoSearch';
import { InlineBanner } from '@/components/ui/inline-banner';

export default async function ReposPage() {
  const user = await getCurrentUser();
  const result = await listRepositoriesAction();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-8">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-background py-4">
        <div>
          <h1 className="text-base font-medium text-foreground">Repositories</h1>
          {user && <p className="text-xs text-muted-foreground">{user.login}</p>}
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>

      {!result.ok && (
        <div className="mt-2">
          <InlineBanner variant="error">{result.error}</InlineBanner>
        </div>
      )}

      {result.ok && <RepoSearch repos={result.data} />}
    </main>
  );
}