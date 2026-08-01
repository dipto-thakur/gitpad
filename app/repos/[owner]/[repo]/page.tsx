import Link from 'next/link';
import { getRepoAction, listBranchesAction } from '@/actions/github';
import { FileBrowser } from '@/components/FileBrowser';
import { BranchSwitcher } from '@/components/BranchSwitcher';

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
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/repos" className="text-sm text-muted hover:text-fg">
        ← Repositories
      </Link>
      <div className="mt-4 mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{repoResult.data.fullName}</h1>
        <BranchSwitcher
          owner={owner}
          repo={repo}
          branches={branchesResult.data}
          activeBranch={branch}
        />
      </div>

      <FileBrowser owner={owner} repo={repo} branch={branch} path="" />
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <p className="rounded-md border border-border bg-red-50 px-4 py-3 text-sm text-red-700">
        {message}
      </p>
      <Link href="/repos" className="mt-4 inline-block text-sm text-muted hover:text-fg">
        ← Repositories
      </Link>
    </main>
  );
}
