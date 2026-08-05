# GitHub Doc Editor

Edit any UTF-8 text file — Markdown, code, config, whatever — in your own
GitHub repos and commit it directly. No Git, terminal, VS Code, or local
clone.

GitHub's Contents API doesn't distinguish `.md` from `.py` or `.html`; only
binary vs. text matters, and that's a property of a file's bytes, not its
extension. So neither do we: any file that decodes as valid UTF-8 is
editable here, full stop. A small extension blocklist (images, video,
audio, fonts, archives, executables, office docs) exists purely to grey out
obviously-binary files in the browser — it's a UI hint, not a gate. The
real check is a strict UTF-8 decode of the actual bytes at open time
(`lib/encoding/base64.ts`), which also correctly accepts a text file with a
misleading extension and rejects a binary file with an innocent-looking one.

Not an IDE. Not GitHub Desktop. Login → repo → branch → file → edit → commit.

## Stack
Next.js App Router, TypeScript (strict), Tailwind, Auth.js (GitHub OAuth),
GitHub REST API via Server Actions. No Firebase/Supabase/Clerk.

## Setup

1. Create a GitHub OAuth App: https://github.com/settings/developers
   - Homepage URL: `https://gitnote.vercel.app:3000`
   - Callback URL: `https://gitnote.vercel.app:3000/api/auth/callback/github`
2. Copy `.env.example` to `.env.local` and fill in:
   - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` from the OAuth App
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL=https://gitnote.vercel.app:3000`
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