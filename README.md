<div align="center">

# GitHub Doc Editor

**Edit any UTF-8 file in your GitHub repos and commit it directly - no Git, terminal, clone, or IDE.**

[Live Demo](https://gitnote.vercel.app/)

</div>

---

## Goal

Most quick edits to a repo, fixing a typo in a README, tweaking a config value, adjusting a line of code, don't need a local clone, a terminal, or an IDE. They need: open the file, change the text, commit. This tool is built around that single loop, with nothing else in the way.

It isn't a scaled-down IDE and isn't trying to become one. It's the smallest possible interface between "I need to change this file" and "it's committed."

---

## Core Idea: Content, Not Extension

GitHub's Contents API doesn't distinguish `.md` from `.py` from `.html` — it only knows binary versus text, and that's a property of a file's bytes, not its name. This tool follows the same rule: any file that decodes as valid UTF-8 is editable, regardless of extension.

An extension blocklist (images, video, audio, fonts, archives, executables, office docs) exists only as a UI hint to grey out obviously-binary files before you click. The real gate is a strict UTF-8 decode of the actual bytes at open time — which correctly accepts a text file with a misleading extension, and rejects a binary file with an innocent one.

---

## Core Features

**Direct commit, no local state**
Every operation — read, edit, commit — is a live call to the GitHub REST API. No local clone, no working directory, no merge conflicts to resolve by hand.

**Byte-level file detection**
Editability is decided by decoding the file, not reading its name, so the tool works correctly on config files, extensionless files, and mislabeled files alike.

**Optimistic concurrency on commit**
Every commit is tied to the file's last-read SHA. If the file changed upstream since you opened it, GitHub's mismatch is surfaced as "reload and retry" — it is never silently overwritten.

**Dirty-state protection**
Unsaved changes are tracked in the editor and trigger a `beforeunload` warning before you can navigate away or close the tab.

**Explicit error states**
Not-found, forbidden, rate-limited, network failure, and SHA-mismatch are each handled and surfaced distinctly, rather than collapsing into a generic error message.

**OAuth-only auth**
Sign-in is GitHub OAuth. No personal access token, password, or SSH key is ever requested from the user.

---

## System Design

```
Browser → Next.js → Server Actions → GitHubClient → GitHub REST API
```

| Property | Choice | Why |
|---|---|---|
| Auth | Auth.js, GitHub OAuth | No credential handling beyond what GitHub already manages |
| Token storage | Encrypted session cookie, server-only | Never sent to the browser, never in localStorage |
| API access | Server Actions → single `GitHubClient` wrapper | One controlled path to the GitHub API, no client-side calls |
| Validation | Path/branch/repo/message/SHA checks on every action | Server re-validates regardless of what the UI already checked |
| Persistence | None beyond the session cookie | GitHub is the only source of truth for file state |

---

## Scope

**Implemented**
Auth, repo listing, branch selection, file browser, open/edit, dirty-state detection, SHA-based commit with concurrency protection, and explicit handling for not-found / forbidden / rate-limited / network / SHA-mismatch cases. Delete is implemented at the API layer; no UI is wired to it yet.

**Deliberately out of scope**
Syntax highlighting, autocomplete, AI assistance, realtime collaboration, PR/issue/Actions management, and create/rename flows. This stays a focused editing tool rather than growing into an in-browser IDE.

---

## Security

- OAuth only — no PAT, password, or SSH key ever requested
- Token is server-only: never reachable from client JS or storage
- Every server action independently validates owner, repo, branch, path, commit message, and SHA — not just the UI
- Path traversal, control characters, and oversized inputs are rejected server-side
- Stale-SHA commits are mapped to an explicit `SHA_MISMATCH` state and never auto-resolved
