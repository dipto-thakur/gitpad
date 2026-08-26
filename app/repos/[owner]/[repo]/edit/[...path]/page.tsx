// file: app/repos/[owner]/[repo]/edit/[...path]/page.tsx
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, FileWarning, GitBranch } from 'lucide-react';
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
    return (
      <ErrorState
        owner={owner}
        repo={repo}
        message="A branch is required to open this file."
        icon={<GitBranch className="h-5 w-5 text-amber-500/90 dark:text-amber-400/80" strokeWidth={2} />}
      />
    );
  }

  const result = await getFileAction(owner, repo, branch, path);
  if (!result.ok) {
    return <ErrorState owner={owner} repo={repo} message={result.error} path={path} branch={branch} />;
  }

  return <Editor owner={owner} repo={repo} branch={branch} file={result.data} />;
}

function ErrorState({
  owner,
  repo,
  message,
  path,
  branch,
  icon,
}: {
  owner: string;
  repo: string;
  message: string;
  path?: string;
  branch?: string;
  icon?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 dark:bg-background/95">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 dark:bg-muted">
            {icon ?? <FileWarning className="h-5 w-5 text-red-500/90 dark:text-red-400/80" strokeWidth={2} />}
          </div>
        </div>

        {path && (
          <p className="mb-2 truncate text-center font-mono text-[12px] text-muted-foreground text-muted-foreground">
            {path}
            {branch && <span className="text-muted-foreground/50 dark:text-zinc-700"> · {branch}</span>}
          </p>
        )}

        <InlineBanner variant="error">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span>{message}</span>
          </div>
        </InlineBanner>

        <Link
          href={`/repos/${owner}/${repo}`}
          className="mt-4 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-zinc-100 dark:text-muted-foreground dark:hover:bg-zinc-900 dark:hover:text-zinc-100 dark:active:bg-zinc-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
          Back to repository
        </Link>
      </div>
    </main>
  );
}