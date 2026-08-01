import Link from 'next/link';
import { getFileAction } from '@/actions/github';
import { Editor } from '@/components/Editor';

export default async function EditFilePage({
  params,
  searchParams,
}: {
  params: { owner: string; repo: string; path: string[] };
  searchParams: { branch?: string };
}) {
  const { owner, repo } = params;
  const path = params.path.map(decodeURIComponent).join('/');
  const branch = searchParams.branch;

  if (!branch) {
    return (
      <ErrorState owner={owner} repo={repo} message="A branch is required to open this file." />
    );
  }

  const result = await getFileAction(owner, repo, branch, path);
  if (!result.ok) {
    return <ErrorState owner={owner} repo={repo} message={result.error} />;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href={`/repos/${owner}/${repo}?branch=${encodeURIComponent(branch)}`} className="text-sm text-muted hover:text-fg">
        ← {owner}/{repo}
      </Link>
      <Editor owner={owner} repo={repo} branch={branch} file={result.data} />
    </main>
  );
}

function ErrorState({ owner, repo, message }: { owner: string; repo: string; message: string }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="rounded-md border border-border bg-red-50 px-4 py-3 text-sm text-red-700">
        {message}
      </p>
      <Link href={`/repos/${owner}/${repo}`} className="mt-4 inline-block text-sm text-muted hover:text-fg">
        ← Back
      </Link>
    </main>
  );
}
