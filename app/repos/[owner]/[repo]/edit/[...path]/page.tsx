// file: app/repos/[owner]/[repo]/edit/[...path]/page.tsx
import Link from 'next/link';
import { getFileAction } from '@/actions/github';
import { Editor } from '@/components/editor/Editor';
import { InlineBanner } from '@/components/ui/inline-banner';

export default async function EditFilePage({
  params,
  searchParams,
}: {
  params: Promise<{ owner: string; repo: string; path: string[] }>;
  searchParams: Promise<{ branch?: string }>;
}) {
  const { owner, repo, path: pathSegments } = await params;
  const { branch } = await searchParams;
  const path = pathSegments.map(decodeURIComponent).join('/');

  if (!branch) {
    return <ErrorState owner={owner} repo={repo} message="A branch is required to open this file." />;
  }

  const result = await getFileAction(owner, repo, branch, path);
  if (!result.ok) {
    return <ErrorState owner={owner} repo={repo} message={result.error} />;
  }

  return <Editor owner={owner} repo={repo} branch={branch} file={result.data} />;
}

function ErrorState({ owner, repo, message }: { owner: string; repo: string; message: string }) {
  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <InlineBanner variant="error">{message}</InlineBanner>
      <Link href={`/repos/${owner}/${repo}`} className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Back
      </Link>
    </main>
  );
}