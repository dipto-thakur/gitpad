// file: app/loading.tsx
import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background dark:bg-background">
      <Spinner size="lg" />
    </div>
  );
}