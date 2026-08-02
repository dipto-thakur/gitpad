import 'server-only';
import { cookies } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

/**
 * Returns the authenticated GitHub username, or null. Safe to call from
 * server components and server actions. Never exposes the access token.
 */
export async function getCurrentUser(): Promise<{ login: string; name?: string | null; image?: string | null } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const login = (session.user as { login?: string }).login;
  if (!login) return null;
  return { login, name: session.user.name, image: session.user.image };
}

/**
 * Retrieves the raw GitHub OAuth access token server-side only, for use by
 * the GitHubClient. This function must never be called from client
 * components, and its return value must never be sent to the browser.
 */
export async function getServerAccessToken(): Promise<string | null> {
  const cookieStore = cookies();
  const secureCookie = (process.env.NEXTAUTH_URL ?? '').startsWith('https://');
  const token = await getToken({
    req: { cookies: Object.fromEntries(cookieStore.getAll().map((c) => [c.name, c.value])) } as unknown as Parameters<typeof getToken>[0]['req'],
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie,
  });
  const accessToken = (token as { accessToken?: string } | null)?.accessToken;
  return accessToken ?? null;
}