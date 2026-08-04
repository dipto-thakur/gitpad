// file: app\repos\[owner]\[repo]\page.tsx
import { getRepoAction, listBranchesAction } from '@/actions/github';
import { FileBrowser } from '@/components/FileBrowser';
import { BranchSwitcher } from '@/components/BranchSwitcher';
import { InlineBanner } from '@/components/ui/inline-banner';
import { Header } from '@/components/ui/header';

export default async function RepoPage({
  params,
  searchParams,
}: {
  params: { owner: string; repo: string };
  searchParams: { branch?: string };
}) {
  const { owner, repo } = params;

  const repoResult = await getRepoAction(owner, repo);
  if (!repoResult.ok) {
    return <ErrorState message={repoResult.error} />;
  }

  const branchesResult = await listBranchesAction(owner, repo);
  if (!branchesResult.ok) {
    return <ErrorState message={branchesResult.error} />;
  }

  const activeBranch = searchParams.branch || repoResult.data.defaultBranch;
  const isKnownBranch = branchesResult.data.some((b) => b.name === activeBranch);
  const branch = isKnownBranch ? activeBranch : repoResult.data.defaultBranch;

  return (
    <main className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col">
        <Header
          backHref="/repos"
          backLabel="Repositories"
          title={'Repositories'}
          subtitle={''}
          actions={
            <BranchSwitcher
              owner={owner}
              repo={repo}
              branches={branchesResult.data}
              activeBranch={branch}
            />
          }
        />

        <section className="flex-1 px-4 pb-10 pt-6 sm:px-10 sm:pt-10">
          <div className="mb-6 sm:mb-8">
            <h1 className="truncate font-mono text-[19px] font-medium tracking-tight text-zinc-800 dark:text-zinc-200 sm:text-[22px]">
              {repoResult.data.name}
            </h1>
            <p className="mt-1 truncate text-[13px] text-zinc-400 dark:text-zinc-500">
              {owner} · {branch}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-zinc-100/60 p-2 dark:border-zinc-800/80 dark:bg-zinc-900/60 sm:p-3">
            <FileBrowser owner={owner} repo={repo} branch={branch} path="" />
          </div>
        </section>
      </div>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl">
        <Header backHref="/repos" backLabel="Repositories" title="Error" mono={false} />
        <div className="px-4 py-10 sm:px-10">
          <InlineBanner variant="error">{message}</InlineBanner>
        </div>
      </div>
    </main>
  );
}