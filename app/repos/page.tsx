// file: app/repos/page.tsx

import { listRepositoriesAction } from "@/actions/github";
import { getCurrentUser } from "@/lib/auth/session";

import { Profile } from "@/components/profile/profile";
import { RepoSearch } from "@/components/RepoSearch";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { InlineBanner } from "@/components/ui/inline-banner";
import { Header } from "@/components/ui/header";
import { Footer } from '@/components/landing/Footer';

export default async function ReposPage() {
  const user = await getCurrentUser();
  const result = await listRepositoriesAction();

return (
    <main className="min-h-dvh bg-zinc-50 dark:bg-zinc-950/95">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col">
      <Header actions={user && <Profile login={user.login} name={user.name} image={user.image} />} />


        <section className="flex-1   px-3 pb-6 pt-4 sm:px-10 sm:pb-10 sm:pt-10">
          {!result.ok && (
            <InlineBanner variant="error">{result.error}</InlineBanner>
          )}

          {result.ok && <RepoSearch repos={result.data} />}
        </section>
      </div>


        <Footer />

    </main>
  );
}