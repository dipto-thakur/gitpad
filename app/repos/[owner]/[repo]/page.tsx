// file: app/repos/[owner]/[repo]/page.tsx
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getRepoAction, listBranchesAction } from '@/actions/github';
import { FileBrowser } from '@/components/FileBrowser';
import { BranchSwitcher } from '@/components/BranchSwitcher';
import { InlineBanner } from '@/components/ui/inline-banner';

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
    return <ErrorState owner={owner} repo={repo} message={repoResult.error} />;
  }

  const branchesResult = await listBranchesAction(owner, repo);
  if (!branchesResult.ok) {
    return <ErrorState owner={owner} repo={repo} message={branchesResult.error} />;
  }

  const activeBranch = searchParams.branch || repoResult.data.defaultBranch;
  const isKnownBranch = branchesResult.data.some((b) => b.name === activeBranch);
  const branch = isKnownBranch ? activeBranch : repoResult.data.defaultBranch;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-8">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-background py-4">
        <Link
          href="/repos"
          className="flex h-9 items-center gap-1 -ml-2 px-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Repositories
        </Link>
        <BranchSwitcher owner={owner} repo={repo} branches={branchesResult.data} activeBranch={branch} />
      </header>

      <h1 className="mb-3 truncate text-base font-medium text-foreground">{repoResult.data.fullName}</h1>

      <FileBrowser owner={owner} repo={repo} branch={branch} path="" />
    </main>
  );
}

function ErrorState({ owner, repo, message }: { owner: string; repo: string; message: string }) {
  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <InlineBanner variant="error">{message}</InlineBanner>
      <Link href="/repos" className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Repositories
      </Link>
    </main>
  );
}