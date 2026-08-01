'use client';

import { signIn } from 'next-auth/react';

export function SignInButton() {
  return (
    <button
      onClick={() => signIn('github', { callbackUrl: '/repos' })}
      className="rounded-md border border-border bg-fg px-4 py-2 text-sm font-medium text-white hover:opacity-90"
    >
      Sign in with GitHub
    </button>
  );
}
