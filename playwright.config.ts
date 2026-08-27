import { defineConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join(__dirname, 'playwright/.auth/user.json');
const hasAuth = fs.existsSync(authFile);

export default defineConfig({
  testDir: './tests',

  timeout: 300000, // 5 minutes — covers OTP wait + full booking workflow

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    channel: 'msedge',
    screenshot: 'on',

    // Reuse saved login state when it exists; first run will create it
    ...(hasAuth ? { storageState: authFile } : {}),
  },
});