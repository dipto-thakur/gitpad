// file: components/sign/SignInButton.tsx
'use client';

import { signIn } from 'next-auth/react';
import { GithubMark } from '@/components/icons/GithubMark';
import { Button } from '@/components/ui/button';

export function SignInButton({ className, size = 'default' }: { className?: string; size?: 'default' | 'sm' }) {
  return (
    <Button
      type="button"
      variant="primary"
      size={size}
      className={className}
      onClick={() => signIn('github', { callbackUrl: '/repos' })}
    >
      <GithubMark className="h-4 w-4" />
      Sign in with GitHub
    </Button>
  );
}