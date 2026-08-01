import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';

/**
 * Scope is deliberately minimal: "repo" is required to read/write private
 * repository contents via the Contents API. If a user only needs public
 * repos, they can still use this scope safely since GitHub OAuth apps
 * cannot request a narrower "read/write public repo contents only" scope
 * through classic OAuth. (A future iteration could migrate to a GitHub App
 * with fine-grained, per-repo installation permissions.)
 */
const SCOPES = ['read:user', 'repo'];

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      authorization: { params: { scope: SCOPES.join(' ') } },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 }, // 8h
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, account }) {
      // Only runs server-side. The access token is stored in the encrypted
      // JWT cookie and is never forwarded to the client-visible session
      // object below.
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Deliberately DO NOT copy token.accessToken onto session — the
      // session object is serialized to the browser via useSession()/
      // getSession(). Server code retrieves the token separately via
      // getServerAccessToken().
      if (session.user) {
        (session.user as { login?: string }).login =
          (token as { login?: string }).login;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
};