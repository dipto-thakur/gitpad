// file: app/loading.tsx
import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <Spinner size="lg" />
    </div>
  );
}