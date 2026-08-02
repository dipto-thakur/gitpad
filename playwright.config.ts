import { defineConfig } from '@playwright/test';

const PORT = 3000;
const MOCK_GITHUB_PORT = 4010;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false, // shared mock-server state; keep specs sequential
  retries: 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: `node e2e/mock-github-api.mjs`,
      port: MOCK_GITHUB_PORT,
      reuseExistingServer: !process.env.CI,
      env: { MOCK_GITHUB_PORT: String(MOCK_GITHUB_PORT) },
    },
    {
      command: 'npm run build && npm run start',
      port: PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        GITHUB_CLIENT_ID: 'test-client-id',
        GITHUB_CLIENT_SECRET: 'test-client-secret',
        NEXTAUTH_SECRET: 'e2e-test-secret-e2e-test-secret',
        NEXTAUTH_URL: `http://localhost:${PORT}`,
        GITHUB_API_BASE_URL: `http://localhost:${MOCK_GITHUB_PORT}`,
      },
    },
  ],
});