// @ts-check
const { defineConfig } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const authFile = path.join(__dirname, 'generated', 'sf-auth.json');

module.exports = defineConfig({
  testDir: './generated',
  testMatch: '**/*.js',
  timeout: 120_000,          // max time for the whole test
  use: {
    headless: false,
    viewport: null,
    actionTimeout: 15_000,   // each click/fill/select times out in 15 s
    navigationTimeout: 30_000,
    launchOptions: { args: ['--start-maximized'] },
    storageState: fs.existsSync(authFile) ? authFile : undefined,
  },
});
