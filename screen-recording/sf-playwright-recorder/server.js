/**
 * SF Playwright Recorder - Server
 * Records browser interactions and generates Playwright test scripts.
 * Handles Salesforce Lightning shadow DOM selectors automatically.
 */

const express = require('express');
const { WebSocketServer } = require('ws');
const { chromium } = require('playwright');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');
const net = require('net');
const { spawn } = require('child_process');
const { Command } = require('commander');
const { openResource } = require('open-resource');

// ── CLI ───────────────────────────────────────────────────────────────────────
const program = new Command();
program
  .name('sf-playwright-recorder')
  .description('Record Salesforce browser interactions and generate Playwright tests')
  .version('1.0.0')
  .option('-p, --port <number>', 'port to listen on (tries port+1 if busy)', '3777')
  .option('--no-open', 'do not open the browser UI automatically')
  .parse(process.argv);

const cliOpts = program.opts();

// ── Port finder ───────────────────────────────────────────────────────────────
function isPortFree(port) {
  return new Promise(resolve => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => tester.close(() => resolve(true)))
      .listen(port, '127.0.0.1');
  });
}

async function findPort(start) {
  let p = parseInt(start, 10);
  while (!(await isPortFree(p))) {
    console.log(`⚠  Port ${p} in use — trying ${p + 1}…`);
    p++;
  }
  return p;
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const STORAGE_DIR = path.join(__dirname, 'generated');
const AUTH_FILE   = path.join(STORAGE_DIR, 'sf-auth.json');
const DOT_FILE    = path.join(os.homedir(), '.sfplaywright-recorder');

if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

// ── Dotfile YAML helpers ──────────────────────────────────────────────────────
// Minimal hand-rolled parser for the specific dotfile format.
// Supports: top-level keys, "profiles:" block with list items (- key: val).

function parseDotFile(text) {
  const result = { profiles: [] };
  const lines = text.split('\n');
  let inProfiles = false;
  let current = null;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line || line.trimStart().startsWith('#')) continue;

    if (/^profiles:\s*(\[\])?/.test(line)) {
      inProfiles = true;
      continue;
    }

    if (inProfiles) {
      const listItem = line.match(/^\s+-\s+(\S+):\s*(.*)/);
      const keyVal   = line.match(/^\s+(\S+):\s*(.*)/);

      if (listItem) {
        if (current) result.profiles.push(current);
        current = { [listItem[1]]: listItem[2].trim() };
      } else if (keyVal && current) {
        current[keyVal[1]] = keyVal[2].trim();
      } else if (line.match(/^\S/)) {
        inProfiles = false;
      }
    }
  }
  if (current) result.profiles.push(current);
  return result;
}

function serializeDotFile(data) {
  const lines = [
    '# SF Playwright Recorder - profiles',
    '# Each profile: name, login-url, username, password (optional), org-type',
    '# org-type: sandbox | production | scratch | developer',
    '',
  ];

  if (!data.profiles || !data.profiles.length) {
    lines.push('profiles: []');
    return lines.join('\n') + '\n';
  }

  lines.push('profiles:');
  for (const p of data.profiles) {
    const keys = ['name', 'login-url', 'username', 'password', 'org-type'];
    let first = true;
    for (const k of keys) {
      if (!p[k] && p[k] !== '') continue;
      lines.push(first ? `  - ${k}: ${p[k]}` : `    ${k}: ${p[k]}`);
      first = false;
    }
    // any extra keys not in the canonical list
    for (const [k, v] of Object.entries(p)) {
      if (keys.includes(k)) continue;
      lines.push(first ? `  - ${k}: ${v}` : `    ${k}: ${v}`);
      first = false;
    }
  }
  return lines.join('\n') + '\n';
}

function readDotFile() {
  if (!fs.existsSync(DOT_FILE)) {
    fs.writeFileSync(DOT_FILE, serializeDotFile({ profiles: [] }), 'utf8');
  }
  return parseDotFile(fs.readFileSync(DOT_FILE, 'utf8'));
}

function writeDotFile(data) {
  fs.writeFileSync(DOT_FILE, serializeDotFile(data), 'utf8');
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ── State ────────────────────────────────────────────────────────────────────
let recorderState = {
  recording: false,
  steps: [],        // {type, selector, value, url, key, modifiers}
  browser: null,
  context: null,
  page: null,
};

// ── WebSocket broadcast ───────────────────────────────────────────────────────
function broadcast(msg) {
  const data = JSON.stringify(msg);
  wss.clients.forEach(c => { if (c.readyState === 1) c.send(data); });
}

// ── Selector generation ───────────────────────────────────────────────────────
// Prefer readable locators; fall back to data attributes then CSS.
function buildSelector(el) {
  // Priority order matches Playwright best-practices:
  //   label text > placeholder > role+accessibleName > testId > visible text > shadow path > CSS

  // getByLabel uses the associated <label> text or aria-labelledby — most stable on SF forms
  if (el.label)       return `getByLabel(${JSON.stringify(el.label)})`;
  if (el.ariaLabel)   return `getByLabel(${JSON.stringify(el.ariaLabel)})`;
  if (el.placeholder) return `getByPlaceholder(${JSON.stringify(el.placeholder)})`;

  // getByRole accessible name: always use exact:true to avoid substring matches
  // (e.g. "Account" must not match "Account Brand").
  const accessibleName = el.label || el.ariaLabel || el.name;
  if (el.role && accessibleName) {
    return `getByRole(${JSON.stringify(el.role)}, { name: ${JSON.stringify(accessibleName)}, exact: true })`;
  }

  if (el.testId)      return `getByTestId(${JSON.stringify(el.testId)})`;
  if (el.text && el.tag && ['BUTTON','A'].includes(el.tag))
                      return `getByText(${JSON.stringify(el.text)}, { exact: true })`;
  // Shadow-DOM path (Salesforce LWC)
  if (el.shadowPath && el.shadowPath.length > 0) {
    const chain = el.shadowPath.map(s => JSON.stringify(s)).join(', ');
    return `locator('css=' + shadowPath([${chain}]))`;
  }
  return `locator(${JSON.stringify(el.css || el.xpath || 'unknown')})`;
}

// ── Code generation ───────────────────────────────────────────────────────────

// Collapse consecutive fill steps on the same element: only keep the last one.
// Also deduplicate consecutive identical navigations.
function compressSteps(steps) {
  const out = [];
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (s.type === 'fill') {
      // Skip if the next step is another fill on the same selector
      const next = steps[i + 1];
      const sameTarget = next && next.type === 'fill' &&
        JSON.stringify(next.element) === JSON.stringify(s.element);
      if (sameTarget) continue;
    }
    if (s.type === 'navigate') {
      // Skip duplicate consecutive navigations
      const prev = out[out.length - 1];
      if (prev && prev.type === 'navigate' && prev.url === s.url) continue;
    }
    out.push(s);
  }
  return out;
}

function generateCode(steps, useAuth) {
  const lines = [];
  lines.push(`const { test, expect } = require('@playwright/test');`);
  lines.push('');

  lines.push(`test('Recorded SF flow', async ({ page }) => {`);

  let lastUrl = null;
  for (const step of compressSteps(steps)) {
    switch (step.type) {
      case 'navigate':
        if (step.url !== lastUrl) {
          lines.push(`  await page.goto(${JSON.stringify(step.url)});`);
          lastUrl = step.url;
        }
        break;
      case 'click': {
        const sel = buildSelector(step.element);
        lines.push(`  await page.${sel}.click();`);
        break;
      }
      case 'fill': {
        const sel = buildSelector(step.element);
        lines.push(`  await page.${sel}.fill(${JSON.stringify(step.value)});`);
        break;
      }
      case 'select': {
        const sel = buildSelector(step.element);
        lines.push(`  await page.${sel}.selectOption(${JSON.stringify(step.value)});`);
        break;
      }
      case 'check': {
        const sel = buildSelector(step.element);
        lines.push(`  await page.${sel}.${step.checked ? 'check' : 'uncheck'}();`);
        break;
      }
      case 'keypress':
        lines.push(`  await page.keyboard.press(${JSON.stringify(step.key)});`);
        break;
      case 'assertText': {
        const sel = buildSelector(step.element);
        lines.push(`  await expect(page.${sel}).toHaveText(${JSON.stringify(step.value)});`);
        break;
      }
      case 'assertVisible': {
        const sel = buildSelector(step.element);
        lines.push(`  await expect(page.${sel}).toBeVisible();`);
        break;
      }
      case 'screenshot':
        lines.push(`  await page.screenshot({ path: ${JSON.stringify(step.path || 'screenshot.png')}, fullPage: true });`);
        break;
      case 'waitForUrl':
        lines.push(`  await page.waitForURL(${JSON.stringify(step.url)});`);
        break;
    }
  }

  lines.push(`});`);
  return lines.join('\n');
}

// ── REST endpoints ────────────────────────────────────────────────────────────

// Start a new recording session
app.post('/api/start', async (req, res) => {
  if (recorderState.recording) return res.json({ ok: false, error: 'Already recording' });

  const { url = 'about:blank', useAuth = false } = req.body;

  try {
    const launchOptions = {
      headless: false,
      args: ['--start-maximized'],
    };

    recorderState.browser = await chromium.launch(launchOptions);

    const contextOptions = {
      viewport: null,
      // Let Playwright handle permissions naturally
    };

    if (useAuth && fs.existsSync(AUTH_FILE)) {
      contextOptions.storageState = AUTH_FILE;
    }

    recorderState.context = await recorderState.browser.newContext(contextOptions);
    recorderState.page    = await recorderState.context.newPage();

    // Inject interaction capture into every page/frame
    await recorderState.context.addInitScript({ path: path.join(__dirname, 'public', 'capture.js') });

    // Expose a function so the in-page script can send events to Node
    await recorderState.context.exposeFunction('__playwrightRecorderEvent', (event) => {
      if (!recorderState.recording) return;
      recorderState.steps.push(event);
      const code = generateCode(recorderState.steps, useAuth && fs.existsSync(AUTH_FILE));
      broadcast({ type: 'step', event, code, stepCount: recorderState.steps.length });
    });

    // Track navigations
    recorderState.page.on('framenavigated', frame => {
      if (frame !== recorderState.page.mainFrame()) return;
      const navStep = { type: 'navigate', url: frame.url() };
      if (recorderState.recording) {
        recorderState.steps.push(navStep);
        const code = generateCode(recorderState.steps, useAuth && fs.existsSync(AUTH_FILE));
        broadcast({ type: 'step', event: navStep, code, stepCount: recorderState.steps.length });
      }
    });

    recorderState.recording = true;
    recorderState.steps = [];

    if (url && url !== 'about:blank') {
      await recorderState.page.goto(url, { waitUntil: 'domcontentloaded' });
    }

    broadcast({ type: 'started', url });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.json({ ok: false, error: err.message });
  }
});

// Stop recording
app.post('/api/stop', async (req, res) => {
  if (!recorderState.recording) return res.json({ ok: false, error: 'Not recording' });

  recorderState.recording = false;

  try {
    if (recorderState.browser) {
      await recorderState.browser.close();
    }
  } catch (_) {}

  recorderState.browser  = null;
  recorderState.context  = null;
  recorderState.page     = null;

  broadcast({ type: 'stopped', stepCount: recorderState.steps.length });
  res.json({ ok: true });
});

// Get generated code
app.get('/api/code', (req, res) => {
  const useAuth = fs.existsSync(AUTH_FILE);
  res.json({ code: generateCode(recorderState.steps, useAuth), stepCount: recorderState.steps.length });
});

// Save generated test to disk (code may come from editor via req.body.code)
app.post('/api/save', (req, res) => {
  const { filename = 'recorded-test.spec.js', code: bodyCode } = req.body;
  const useAuth = fs.existsSync(AUTH_FILE);
  const code = bodyCode !== undefined ? bodyCode : generateCode(recorderState.steps, useAuth);
  const outPath = path.join(STORAGE_DIR, path.basename(filename));
  fs.writeFileSync(outPath, code, 'utf8');
  broadcast({ type: 'saved', path: outPath });
  res.json({ ok: true, path: outPath });
});

// Clear steps
app.post('/api/clear', (req, res) => {
  recorderState.steps = [];
  broadcast({ type: 'cleared' });
  res.json({ ok: true });
});

// Add a manual assertion step
app.post('/api/assert', (req, res) => {
  const { type = 'assertVisible', selector, value } = req.body;
  recorderState.steps.push({ type, element: { css: selector }, value });
  const useAuth = fs.existsSync(AUTH_FILE);
  const code = generateCode(recorderState.steps, useAuth);
  broadcast({ type: 'step', code, stepCount: recorderState.steps.length });
  res.json({ ok: true });
});

// Add a screenshot step
app.post('/api/screenshot-step', (req, res) => {
  const { path: p = 'screenshot.png' } = req.body;
  recorderState.steps.push({ type: 'screenshot', path: p });
  const useAuth = fs.existsSync(AUTH_FILE);
  const code = generateCode(recorderState.steps, useAuth);
  broadcast({ type: 'step', code, stepCount: recorderState.steps.length });
  res.json({ ok: true });
});

// Save auth state (run after logging into Salesforce)
app.post('/api/save-auth', async (req, res) => {
  if (!recorderState.context) return res.json({ ok: false, error: 'No active browser session' });
  try {
    await recorderState.context.storageState({ path: AUTH_FILE });
    broadcast({ type: 'authSaved' });
    res.json({ ok: true, path: AUTH_FILE });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// Check auth state
app.get('/api/auth-status', (req, res) => {
  res.json({ hasAuth: fs.existsSync(AUTH_FILE) });
});

// Delete auth state
app.delete('/api/auth', (req, res) => {
  if (fs.existsSync(AUTH_FILE)) fs.unlinkSync(AUTH_FILE);
  broadcast({ type: 'authCleared' });
  res.json({ ok: true });
});

// ── Profile endpoints ─────────────────────────────────────────────────────────

// List all profiles (passwords redacted)
app.get('/api/profiles', (req, res) => {
  const data = readDotFile();
  const safe = data.profiles.map(p => ({ ...p, password: p.password ? '••••••••' : '' }));
  res.json({ profiles: safe, dotFile: DOT_FILE });
});

// Upsert a profile (create or replace by name)
app.post('/api/profiles', (req, res) => {
  const p = req.body;
  if (!p.name) return res.status(400).json({ error: 'name required' });
  const data = readDotFile();
  const idx = data.profiles.findIndex(x => x.name === p.name);
  if (idx >= 0) data.profiles[idx] = { ...data.profiles[idx], ...p };
  else          data.profiles.push(p);
  writeDotFile(data);
  broadcast({ type: 'profilesChanged' });
  res.json({ ok: true });
});

// Delete a profile by name
app.delete('/api/profiles/:name', (req, res) => {
  const data = readDotFile();
  data.profiles = data.profiles.filter(p => p.name !== req.params.name);
  writeDotFile(data);
  broadcast({ type: 'profilesChanged' });
  res.json({ ok: true });
});

// Get one profile's full data (including password — only used server-side for Quick Login)
app.get('/api/profiles/:name/secret', (req, res) => {
  const data = readDotFile();
  const p = data.profiles.find(x => x.name === req.params.name);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// Quick Login: open browser, fill credentials automatically, then keep recording
app.post('/api/quick-login', async (req, res) => {
  const { profileName, useAuth = false } = req.body;
  const data = readDotFile();
  const profile = data.profiles.find(p => p.name === profileName);
  if (!profile) return res.json({ ok: false, error: 'Profile not found: ' + profileName });
  if (!profile.username || !profile.password) {
    return res.json({ ok: false, error: 'Profile is missing username or password' });
  }

  if (recorderState.recording) return res.json({ ok: false, error: 'Already recording' });

  const loginUrl = profile['login-url'] || 'https://login.salesforce.com';

  try {
    recorderState.browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
    const ctxOpts = { viewport: null };
    if (useAuth && fs.existsSync(AUTH_FILE)) ctxOpts.storageState = AUTH_FILE;

    recorderState.context = await recorderState.browser.newContext(ctxOpts);
    recorderState.page    = await recorderState.context.newPage();

    await recorderState.context.addInitScript({ path: require('path').join(__dirname, 'public', 'capture.js') });
    await recorderState.context.exposeFunction('__playwrightRecorderEvent', (event) => {
      if (!recorderState.recording) return;
      recorderState.steps.push(event);
      const code = generateCode(recorderState.steps, fs.existsSync(AUTH_FILE));
      broadcast({ type: 'step', event, code, stepCount: recorderState.steps.length });
    });

    recorderState.page.on('framenavigated', frame => {
      if (frame !== recorderState.page.mainFrame()) return;
      const navStep = { type: 'navigate', url: frame.url() };
      if (recorderState.recording) {
        recorderState.steps.push(navStep);
        const code = generateCode(recorderState.steps, fs.existsSync(AUTH_FILE));
        broadcast({ type: 'step', event: navStep, code, stepCount: recorderState.steps.length });
      }
    });

    recorderState.recording = true;
    recorderState.steps = [];

    broadcast({ type: 'started', url: loginUrl });

    // Navigate to login page and fill credentials — NOT recorded as steps
    await recorderState.page.goto(loginUrl, { waitUntil: 'domcontentloaded' });

    // Pause recording while filling credentials so they don't appear in the test
    recorderState.recording = false;

    try {
      const userField = recorderState.page.getByLabel('Username').or(
        recorderState.page.getByRole('textbox', { name: /username/i })
      ).first();
      await userField.fill(profile.username, { timeout: 10000 });

      const pwField = recorderState.page.getByLabel('Password').or(
        recorderState.page.getByRole('textbox', { name: /password/i })
      ).first();
      await pwField.fill(profile.password, { timeout: 10000 });

      const loginBtn = recorderState.page.getByRole('button', { name: /log in/i }).or(
        recorderState.page.getByRole('button', { name: /login/i })
      ).first();
      await loginBtn.click({ timeout: 10000 });

      // Wait for SF to redirect away from login
      await recorderState.page.waitForURL(url => !url.includes('login.salesforce.com'), { timeout: 30000 });
    } catch (loginErr) {
      // Login failed but browser is open — resume recording and let user handle it
      broadcast({ type: 'runLog', channel: 'stderr', text: 'Quick login warning: ' + loginErr.message });
    }

    // Resume recording for the actual flow
    recorderState.recording = true;
    broadcast({ type: 'quickLoginDone', url: recorderState.page.url() });
    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.json({ ok: false, error: err.message });
  }
});

// List saved test files
app.get('/api/files', (req, res) => {
  const files = fs.readdirSync(STORAGE_DIR)
    .filter(f => f.endsWith('.js') || f.endsWith('.ts'))
    .map(f => ({ name: f, path: path.join(STORAGE_DIR, f) }));
  res.json({ files });
});

// Download a saved file
app.get('/api/files/:name', (req, res) => {
  const filePath = path.join(STORAGE_DIR, path.basename(req.params.name));
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  res.download(filePath);
});

// Return file content as plain text (for Monaco editor)
app.get('/api/files/:name/content', (req, res) => {
  const filePath = path.join(STORAGE_DIR, path.basename(req.params.name));
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  res.type('text/plain').send(fs.readFileSync(filePath, 'utf8'));
});

// Overwrite file content from Monaco editor
app.put('/api/files/:name/content', (req, res) => {
  const name = path.basename(req.params.name);
  if (!name.endsWith('.js') && !name.endsWith('.ts')) {
    return res.status(400).json({ error: 'Only .js / .ts files accepted' });
  }
  const filePath = path.join(STORAGE_DIR, name);
  fs.writeFileSync(filePath, req.body.code || '', 'utf8');
  res.json({ ok: true });
});

// Upload an external test file into generated/ so Playwright can find it
app.post('/api/upload', express.raw({ type: '*/*', limit: '2mb' }), (req, res) => {
  const name = path.basename(req.query.name || 'uploaded-test.spec.js');
  if (!name.endsWith('.js') && !name.endsWith('.ts')) {
    return res.status(400).json({ error: 'Only .js / .ts files accepted' });
  }
  const dest = path.join(STORAGE_DIR, name);
  fs.writeFileSync(dest, req.body);
  res.json({ ok: true, name });
});

// ── Test runner ───────────────────────────────────────────────────────────────
let runnerProc   = null;
let runnerWatchdog = null;

// Hard ceiling: test timeout (120 s) + 30 s grace = 150 s max wall-clock per run.
const WATCHDOG_MS = 150_000;

app.post('/api/run', (req, res) => {
  if (runnerProc) return res.json({ ok: false, error: 'A test run is already in progress' });

  const { filename } = req.body;
  if (!filename) return res.json({ ok: false, error: 'filename required' });

  const safeFile = path.basename(filename);
  const testPath = path.join(STORAGE_DIR, safeFile);
  if (!fs.existsSync(testPath)) return res.json({ ok: false, error: 'File not found: ' + safeFile });

  broadcast({ type: 'runStart', filename: safeFile });

  runnerProc = spawn(
    'npx', ['playwright', 'test', testPath, '--config', path.join(__dirname, 'playwright.config.js')],
    { cwd: __dirname, env: { ...process.env } }
  );

  // Watchdog: force-kill if the process hasn't exited after WATCHDOG_MS
  runnerWatchdog = setTimeout(() => {
    if (runnerProc) {
      broadcast({ type: 'runLog', channel: 'stderr', text: '\n[Recorder] Watchdog: run exceeded time limit — killing process.\n' });
      runnerProc.kill('SIGKILL');
    }
  }, WATCHDOG_MS);

  const fwd = (stream, channel) => {
    stream.on('data', chunk => broadcast({ type: 'runLog', channel, text: chunk.toString() }));
  };
  fwd(runnerProc.stdout, 'stdout');
  fwd(runnerProc.stderr, 'stderr');

  runnerProc.on('close', (code) => {
    clearTimeout(runnerWatchdog);
    runnerWatchdog = null;
    broadcast({ type: 'runEnd', code });
    runnerProc = null;
  });

  res.json({ ok: true });
});

app.post('/api/run/kill', (req, res) => {
  if (!runnerProc) return res.json({ ok: false, error: 'No run in progress' });
  clearTimeout(runnerWatchdog);
  runnerWatchdog = null;
  runnerProc.kill('SIGTERM');
  res.json({ ok: true });
});

app.get('/api/run/status', (req, res) => {
  res.json({ running: !!runnerProc });
});

// ── Start server ──────────────────────────────────────────────────────────────
(async () => {
  const port = await findPort(cliOpts.port);
  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`\n🎬 SF Playwright Recorder running at ${url}\n`);
    console.log(`   Dot-file : ${DOT_FILE}`);
    console.log(`   Tests    : ${STORAGE_DIR}\n`);
    if (cliOpts.open !== false) {
      openResource(url);
    }
  });
})();
