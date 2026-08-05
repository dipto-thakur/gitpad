// Minimal mock GitHub REST API server used only for the Playwright smoke
// test. Runs as its own process (see playwright.config.ts webServer entry).
// Implements just enough of the Contents/repos/branches endpoints for the
// login -> open -> edit -> commit flow, with in-memory, resettable state.
import http from 'node:http';

const PORT = Number(process.env.MOCK_GITHUB_PORT ?? 4010);

let fileContent = '# Notes\n\nOriginal content.';
let fileSha = 'a'.repeat(40);
let commitCount = 0;

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(json);
}

function toBase64(text) {
  return Buffer.from(text, 'utf-8').toString('base64');
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `https://gitnote.vercel.app:${PORT}`);
  const path = url.pathname;

  // Test-only reset hook so each spec starts from known state.
  if (path === '/__reset' && req.method === 'POST') {
    fileContent = '# Notes\n\nOriginal content.';
    fileSha = 'a'.repeat(40);
    commitCount = 0;
    return send(res, 200, { ok: true });
  }

  if (path === '/user/repos' && req.method === 'GET') {
    return send(res, 200, [
      {
        id: 1,
        name: 'notes',
        full_name: 'octocat/notes',
        private: false,
        default_branch: 'main',
        updated_at: '2026-07-01T00:00:00Z',
        owner: { login: 'octocat' },
      },
    ]);
  }

  if (path === '/repos/octocat/notes' && req.method === 'GET') {
    return send(res, 200, {
      id: 1,
      name: 'notes',
      full_name: 'octocat/notes',
      private: false,
      default_branch: 'main',
      updated_at: '2026-07-01T00:00:00Z',
      owner: { login: 'octocat' },
    });
  }

  if (path === '/repos/octocat/notes/branches' && req.method === 'GET') {
    return send(res, 200, [{ name: 'main', protected: false }]);
  }

  if (path === '/repos/octocat/notes/contents' && req.method === 'GET') {
    return send(res, 200, [
      { name: 'README.md', path: 'README.md', sha: fileSha, size: fileContent.length, type: 'file' },
    ]);
  }

  if (path === '/repos/octocat/notes/contents/README.md' && req.method === 'GET') {
    return send(res, 200, {
      name: 'README.md',
      path: 'README.md',
      sha: fileSha,
      size: fileContent.length,
      type: 'file',
      content: toBase64(fileContent),
    });
  }

  if (path === '/repos/octocat/notes/contents/README.md' && req.method === 'PUT') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      const parsed = JSON.parse(body);
      if (parsed.sha !== fileSha) {
        return send(res, 409, { message: 'sha does not match' });
      }
      fileContent = Buffer.from(parsed.content, 'base64').toString('utf-8');
      commitCount += 1;
      fileSha = `${commitCount}`.padStart(40, 'b');
      return send(res, 200, {
        content: { sha: fileSha },
        commit: { sha: `c${commitCount}`.padEnd(40, '0') },
      });
    });
    return;
  }

  send(res, 404, { message: 'Not Found' });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`mock GitHub API listening on https://gitnote.vercel.app:${PORT}`);
});
