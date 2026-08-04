// file: app/repos/page.tsx

import { listRepositoriesAction } from "@/actions/github";
import { getCurrentUser } from "@/lib/auth/session";

import { Profile } from "@/components/profile/profile";
import { RepoSearch } from "@/components/RepoSearch";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { InlineBanner } from "@/components/ui/inline-banner";
import { Header } from "@/components/ui/header";

export default async function ReposPage() {
  const user = await getCurrentUser();
  const result = await listRepositoriesAction();

  return (
    <main className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col">
        <Header
          title="GitNote"
          mono={false}
          actions={
            <>
              <ThemeToggle />
              {user && (
                <Profile login={user.login} name={user.name} image={user.image} />
              )}
            </>
          }
        />

        <section className="flex-1 px-4 pb-10 pt-6 sm:px-10 sm:pt-10">
          {!result.ok && <InlineBanner variant="error">{result.error}</InlineBanner>}

          {result.ok && <RepoSearch repos={result.data} />}
        </section>
      </div>
    </main>
  );
}