// The smoke test does not perform a real GitHub OAuth handshake (there is
// no test GitHub account to authenticate against in CI). Instead it mints
// a session cookie the same way NextAuth would after a successful OAuth
// callback, using the same secret and encode() function NextAuth's own
// session-decode path uses. This exercises the real authenticated flow
// (repo list -> browse -> open -> edit -> commit) without faking anything
// past the OAuth handshake itself.
import { encode } from 'next-auth/jwt';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? 'e2e-test-secret-e2e-test-secret';

export async function mintSessionCookieValue(): Promise<string> {
  return encode({
    secret: NEXTAUTH_SECRET,
    token: {
      name: 'Octocat',
      email: 'octocat@example.com',
      picture: null,
      login: 'octocat',
      accessToken: 'mock-access-token',
      sub: '1',
    },
    maxAge: 60 * 60 * 8,
  });
}

export const SESSION_COOKIE_NAME = 'next-auth.session-token';