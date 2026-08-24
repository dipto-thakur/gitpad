// file: app/repos/[owner]/[repo]/page.tsx
import Link from 'next/link';
import { RiAlertLine, RiArrowLeftSLine } from 'react-icons/ri';
import { getRepoAction, listBranchesAction } from '@/actions/github';
import { Directory } from '@/components/ui/directory';
import { FileBrowser } from '@/components/FileBrowser';
import { BranchSwitcher } from '@/components/BranchSwitcher';
import { InlineBanner } from '@/components/ui/inline-banner';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/landing/Footer';

export default async function RepoPage({
  params,
  searchParams,
}: {
  params: Promise<{ owner: string; repo: string }>;
  searchParams: Promise<{ branch?: string }>;
}) {
  const { owner, repo } = await params;
  const { branch: requestedBranch } = await searchParams;

  const repoResult = await getRepoAction(owner, repo);
  if (!repoResult.ok) {
    return <ErrorState message={repoResult.error} />;
  }

  const branchesResult = await listBranchesAction(owner, repo);
  if (!branchesResult.ok) {
    return <ErrorState message={branchesResult.error} />;
  }

  const activeBranch = requestedBranch || repoResult.data.defaultBranch;
  const isKnownBranch = branchesResult.data.some((b) => b.name === activeBranch);
  const branch = isKnownBranch ? activeBranch : repoResult.data.defaultBranch;

  return (
    <main className="min-h-dvh bg-zinc-50 dark:bg-zinc-950/95">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col">
        <Header />

        <section className="min-w-0 flex-1 px-3 pb-6 pt-3 sm:px-10 sm:pb-10 sm:pt-8">
          <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
            <Link
              href="/repos"
              className="-ml-1.5 flex h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-[13px] font-medium text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 dark:active:bg-zinc-900"
            >
              <RiArrowLeftSLine className="h-[18px] w-[18px] shrink-0" />
              <span className="sm:inline">Repositories</span>
            </Link>

            <BranchSwitcher owner={owner} repo={repo} branches={branchesResult.data} activeBranch={branch} />
          </div>

          <div className="mb-3 min-w-0 px-0.5 sm:mb-5">
            <Directory owner={owner} repo={repoResult.data.name}/>
          </div>

          <div className="min-w-0 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100/40 p-1 dark:border-zinc-800/80 dark:bg-zinc-900/40 sm:p-2.5">
            <FileBrowser owner={owner} repo={repo} branch={branch} path="" />
          </div>
        </section>
      </div>

      <div className="hidden sm:block">
        <Footer />
      </div>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col">
        <Header />

        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <div className="mb-4 flex justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900">
                <RiAlertLine className="h-5 w-5 text-red-500/90 dark:text-red-400/80" />
              </div>
            </div>

            <InlineBanner variant="error">{message}</InlineBanner>

            <Link
              href="/repos"
              className="mt-4 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13.5px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 active:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 dark:active:bg-zinc-900"
            >
              <RiArrowLeftSLine className="h-4 w-4" />
              Back to repositories
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}