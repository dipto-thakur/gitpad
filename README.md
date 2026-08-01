# GitHub Doc Editor

Edit Markdown/text/config files in your own GitHub repos and commit them —
no Git, terminal, VS Code, or local clone.

Not an IDE. Not GitHub Desktop. Login → repo → branch → file → edit → commit.

## Stack
Next.js App Router, TypeScript (strict), Tailwind, Auth.js (GitHub OAuth),
GitHub REST API via Server Actions. No Firebase/Supabase/Clerk.

## Setup

1. Create a GitHub OAuth App: https://github.com/settings/developers
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `http://localhost:3000/api/auth/callback/github`
2. Copy `.env.example` to `.env.local` and fill in:
   - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` from the OAuth App
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL=http://localhost:3000`
3. Install and run:
   ```
   npm install
   npm run dev
   ```
4. Tests:
   ```
   npm test
   ```

## Architecture

```
Browser → Next.js → Server Actions → GitHubClient → GitHub REST API
```

No Git executable, no local clone — every operation is a direct GitHub API
call. The OAuth access token lives only in the encrypted session cookie and
is read server-side in `lib/auth/session.ts`; it is never sent to the
browser or written to localStorage.

- `lib/github/client.ts` — single GitHub REST API wrapper (server-only)
- `lib/validation` — path/branch/repo/commit-message/sha validation, enforced
  on every server action regardless of client-side checks
- `lib/encoding` — base64 ↔ UTF-8 helpers for the Contents API
- `actions/github.ts` — server actions; the only callers of `GitHubClient`
- `app/repos/[owner]/[repo]` — branch select + file browser
- `app/repos/[owner]/[repo]/edit/[...path]` — plain-textarea editor

## Scope of this build

Implements phases 1–9 of the spec: auth, repo listing, branch selection,
file browser, open file, editor, change detection (dirty check +
beforeunload warning), commit (with SHA-based optimistic concurrency —
mismatches are surfaced as "reload and retry", never silently overwritten),
and explicit error handling for not-found / forbidden / rate-limited /
network / SHA-mismatch cases.

`deleteFileAction` in `actions/github.ts` implements the future "delete"
milestone at the API layer; no UI is wired to it yet, matching the spec's
phased rollout (UI improvements come after core functionality).

Not implemented, by design (non-goals): syntax highlighting, autocomplete,
AI assistance, realtime collaboration, PR/issue/Actions management,
create/rename UI (rename = read+create+delete per spec, not yet wired to UI).

## Security notes

- OAuth only — no PAT/password/SSH key ever requested from the user.
- Token never touches client JS or localStorage; only Server Actions and the
  GitHub API client can read it.
- Every server action re-validates owner/repo/branch/path/commit
  message/sha, independent of UI constraints (path traversal, control
  characters, and oversized inputs are rejected).
- Commits use the file's last-read `sha`; GitHub's 409/422 on stale sha is
  mapped to `SHA_MISMATCH` and never auto-resolved.
