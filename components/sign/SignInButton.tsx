// file: components/SignInButton.tsx
'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function SignInButton() {
  return (
    <Button type="button" variant="primary" onClick={() => signIn('github', { callbackUrl: '/repos' })}>
      Sign in with GitHub
    </Button>
  );
}