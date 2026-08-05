import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';

interface GitHubProfile {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

/**
 * Scope is deliberately minimal: "repo" is required to read/write private
 * repository contents via the Contents API. If a user only needs public
 * repos, they can still use this scope safely since GitHub OAuth apps
 * cannot request a narrower "read/write public repo contents only" scope
 * through classic OAuth. (A future iteration could migrate to a GitHub App
 * with fine-grained, per-repo installation permissions.)
 */
const SCOPES = ['read:user', 'repo'];

// Whether to use the __Secure- cookie prefix should track whether the app
// is actually served over https, not NODE_ENV — `next start` always sets
// NODE_ENV=production even when running on plain https://gitnote.vercel.app (e.g.
// testing a production build locally), which would otherwise make the
// session cookie unsettable and silently break auth.
const useSecureCookies = (process.env.NEXTAUTH_URL ?? '').startsWith('https://');

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      authorization: { params: { scope: SCOPES.join(' ') } },
      // The default GithubProvider profile mapping (id/name/email/image)
      // drops the GitHub "login" (username), which we need for building
      // repo API calls and for display. Map it explicitly.
      profile(profile: GitHubProfile) {
        return {
          id: String(profile.id),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          login: profile.login,
        };
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 }, // 8h
  cookies: {
    sessionToken: {
      name: useSecureCookies
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Only runs server-side. The access token is stored in the encrypted
      // JWT cookie and is never forwarded to the client-visible session
      // object below.
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      // `user` is only present on the initial sign-in request (the object
      // returned by profile() above); persist login onto the token so it
      // survives subsequent requests.
      if (user && 'login' in user) {
        token.login = (user as { login?: string }).login;
      }
      return token;
    },
    async session({ session, token }) {
      // Deliberately DO NOT copy token.accessToken onto session — the
      // session object is serialized to the browser via useSession()/
      // getSession(). Server code retrieves the token separately via
      // getServerAccessToken().
      if (session.user) {
        session.user.login = token.login;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
};