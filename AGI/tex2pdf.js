#!/usr/bin/env node
/**
 * tex2pdf.js — Compile a .tex file to PDF.
 *
 * Two compilation engines, tried in order:
 *
 *   1. NATIVE (preferred)
 *      pdflatex pass 1 → bibtex → pdflatex pass 2 → pdflatex pass 3
 *      Requires: pdflatex + bibtex (MacTeX / TeX Live)
 *
 *   2. FALLBACK — no LaTeX required
 *      pandoc (.tex → HTML with MathJax) → Chrome headless (HTML → PDF)
 *      Requires: pandoc + Google Chrome
 *
 * Usage:
 *   node tex2pdf.js <file.tex> [options]
 *
 * Options:
 *   --outdir <dir>   Output directory (default: same dir as .tex file)
 *   --runs   <n>     pdflatex passes (default: 3; native engine only)
 *   --no-bib         Skip bibtex (native engine only)
 *   --engine <e>     Force engine: "native" | "pandoc" (default: auto-detect)
 *   --open           Open the resulting PDF when done
 *   --help           Show this help
 */

'use strict';

const { spawnSync } = require('child_process');
const path  = require('path');
const fs    = require('fs');
const os    = require('os');

// ── ANSI colours ─────────────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
  dim:    '\x1b[2m',
};

const ok   = (m) => process.stdout.write(`${C.green}✔${C.reset} ${m}\n`);
const info = (m) => process.stdout.write(`${C.cyan}•${C.reset} ${m}\n`);
const warn = (m) => process.stdout.write(`${C.yellow}⚠${C.reset} ${m}\n`);
const fail = (m) => process.stdout.write(`${C.red}✖${C.reset} ${m}\n`);
const step = (m) => process.stdout.write(`\n${C.bold}${m}${C.reset}\n`);

// ── Shell helpers ─────────────────────────────────────────────────────────────
function run(cmd, args, cwd) {
  info(`${C.dim}${cmd} ${args.join(' ')}${C.reset}`);
  return spawnSync(cmd, args, {
    cwd: cwd || process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function hasTool(name) {
  return spawnSync('which', [name], { encoding: 'utf8' }).status === 0;
}

// ── Argument parsing ──────────────────────────────────────────────────────────
function parseArgs(argv) {
  const raw  = argv.slice(2);
  const opts = { runs: 3, bib: true, open: false, outdir: null, engine: 'auto' };
  let texFile = null;

  for (let i = 0; i < raw.length; i++) {
    switch (raw[i]) {
      case '--help': case '-h': printHelp(); process.exit(0); break;
      case '--outdir':  opts.outdir  = raw[++i]; break;
      case '--runs':    opts.runs    = parseInt(raw[++i], 10); break;
      case '--engine':  opts.engine  = raw[++i]; break;
      case '--no-bib':  opts.bib     = false; break;
      case '--open':    opts.open    = true;  break;
      default:
        if (!raw[i].startsWith('-')) texFile = raw[i];
    }
  }
  return { texFile, opts };
}

function printHelp() {
  console.log(`
${C.bold}tex2pdf${C.reset} — Compile a .tex file to PDF

${C.bold}Usage:${C.reset}
  node tex2pdf.js <file.tex> [options]

${C.bold}Options:${C.reset}
  --outdir <dir>    Output directory    (default: same dir as .tex)
  --runs   <n>      pdflatex passes     (default: 3, native only)
  --no-bib          Skip bibtex         (native only)
  --engine <e>      "native" | "pandoc" (default: auto)
  --open            Open PDF after done
  --help            Show this help

${C.bold}Engines (tried in order if --engine auto):${C.reset}
  native  pdflatex + bibtex  →  PDF   (best quality, needs MacTeX/TeX Live)
  pandoc  pandoc + Chrome    →  PDF   (no LaTeX needed)

${C.bold}Install native engine:${C.reset}
  macOS:  brew install --cask mactex
  Ubuntu: sudo apt install texlive-full

${C.bold}Install pandoc engine:${C.reset}
  macOS:  brew install pandoc
  Ubuntu: sudo apt install pandoc
  (Chrome is also required — already present on most systems)
`);
}

// ── Engine 1: pdflatex + bibtex ───────────────────────────────────────────────
function nativeEngine(jobname, absTeX, srcDir, outDir, opts) {
  step('Engine: native (pdflatex + bibtex)');

  function pdflatexPass(n) {
    info(`pdflatex pass ${n}…`);
    const r = run('pdflatex', [
      '-interaction=nonstopmode',
      `-output-directory=${outDir}`,
      `${jobname}.tex`,
    ], srcDir);
    if (r.status !== 0) {
      fail(`pdflatex pass ${n} failed (exit ${r.status})`);
      const lines = (r.stdout || '').trim().split('\n');
      process.stderr.write(
        `\n${C.dim}--- pdflatex output (last 30 lines) ---\n` +
        lines.slice(-30).join('\n') + `\n${C.reset}\n`
      );
      return false;
    }
    return true;
  }

  if (!pdflatexPass(1)) return false;

  if (opts.bib) {
    const auxFile = path.join(outDir, `${jobname}.aux`);
    if (fs.existsSync(auxFile)) {
      info('bibtex pass…');
      const r = run('bibtex', [jobname], outDir);
      if (r.status !== 0) warn(`bibtex exited ${r.status} — continuing.`);
    } else {
      warn('No .aux found — skipping bibtex.');
    }
  }

  for (let n = 2; n <= opts.runs; n++) {
    if (!pdflatexPass(n)) return false;
  }

  return true;
}

// ── Engine 2: pandoc → puppeteer (no header/footer) ──────────────────────────

// Puppeteer bundled with mermaid-cli (no extra install needed)
const PUPPETEER_MODULE =
  '/Users/mchinnappan/.nvm/versions/node/v22.14.0/lib/node_modules/' +
  '@mermaid-js/mermaid-cli/node_modules/puppeteer';

function findPuppeteer() {
  try { return require(PUPPETEER_MODULE); } catch (_) {}
  try { return require('puppeteer'); }       catch (_) {}
  return null;
}

async function chromePrint(htmlPath, pdfPath) {
  const puppeteer = findPuppeteer();
  if (!puppeteer) throw new Error('puppeteer not found');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    // Wait for MathJax to finish rendering
    await page.evaluate(() => new Promise(resolve => {
      if (window.MathJax && window.MathJax.startup) {
        window.MathJax.startup.promise.then(resolve);
      } else {
        setTimeout(resolve, 2000);
      }
    }));
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,   // ← suppresses date/time & URL
      margin: { top: '20mm', bottom: '20mm', left: '18mm', right: '18mm' },
    });
  } finally {
    await browser.close();
  }
}

function pandocEngine(jobname, absTeX, srcDir, outDir) {
  step('Engine: pandoc → puppeteer (no header/footer)');

  // Step A: .tex → standalone HTML with MathJax
  const htmlTmp = path.join(os.tmpdir(), `${jobname}-tex2pdf-${process.pid}.html`);
  info('pandoc: .tex → HTML…');
  const pandocArgs = [
    '--from=latex',
    '--to=html5',
    '--standalone',
    '--mathjax',
    '--highlight-style=tango',
    `--metadata=title:${jobname}`,
    `--output=${htmlTmp}`,
    absTeX,
  ];
  const pr = run('pandoc', pandocArgs, srcDir);
  if (pr.status !== 0) {
    fail(`pandoc failed (exit ${pr.status})`);
    process.stderr.write(`${C.dim}${pr.stderr}${C.reset}\n`);
    return false;
  }
  ok(`HTML intermediate: ${htmlTmp}`);

  // Step B: puppeteer → PDF (displayHeaderFooter: false)
  const pdfOut = path.join(outDir, `${jobname}.pdf`);
  info('puppeteer: HTML → PDF (no headers/footers)…');

  // Run the async puppeteer call synchronously via a child node process
  // Prefer system-installed Chrome over the bundled Chrome for Testing binary
  const CHROME_CANDIDATES = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
  ];
  const chromePath = (() => {
    for (const c of CHROME_CANDIDATES) {
      if (fs.existsSync(c)) return c;
    }
    try { return require(PUPPETEER_MODULE).executablePath(); } catch (_) {}
    return '';
  })();

  const script = `
const puppeteer = require(${JSON.stringify(PUPPETEER_MODULE)});
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: ${JSON.stringify(chromePath)} || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(${JSON.stringify('file://' + htmlTmp)}, { waitUntil: 'networkidle0' });
  await page.evaluate(() => new Promise(resolve => {
    if (window.MathJax && window.MathJax.startup) {
      window.MathJax.startup.promise.then(resolve);
    } else {
      setTimeout(resolve, 3000);
    }
  }));
  await page.pdf({
    path: ${JSON.stringify(pdfOut)},
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: false,
    margin: { top: '20mm', bottom: '20mm', left: '18mm', right: '18mm' },
  });
  await browser.close();
  console.log('done');
})().catch(e => { console.error(e.message); process.exit(1); });
`;

  const tmpScript = path.join(os.tmpdir(), `tex2pdf-print-${process.pid}.js`);
  fs.writeFileSync(tmpScript, script);

  const cr = spawnSync(process.execPath, [tmpScript], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 60000,
  });

  try { fs.unlinkSync(tmpScript); }  catch (_) {}
  try { fs.unlinkSync(htmlTmp); }    catch (_) {}

  if (cr.status !== 0 || cr.stderr.trim()) {
    const msg = (cr.stderr || cr.stdout || '').trim();
    fail(`puppeteer failed: ${msg}`);
    return false;
  }

  return true;
}

// ── Open the generated PDF ────────────────────────────────────────────────────
function openPdf(pdfPath) {
  const opener = process.platform === 'darwin' ? 'open'
               : process.platform === 'win32'  ? 'start'
               :                                  'xdg-open';
  spawnSync(opener, [pdfPath], { stdio: 'ignore' });
}

// ── Main ──────────────────────────────────────────────────────────────────────
(function main() {
  const { texFile, opts } = parseArgs(process.argv);

  if (!texFile) { fail('No .tex file specified.'); printHelp(); process.exit(1); }

  const absTeX = path.resolve(texFile);
  if (!fs.existsSync(absTeX)) { fail(`File not found: ${absTeX}`); process.exit(1); }
  if (!absTeX.endsWith('.tex')) { fail(`Expected a .tex file, got: ${absTeX}`); process.exit(1); }

  const srcDir  = path.dirname(absTeX);
  const jobname = path.basename(absTeX, '.tex');
  const outDir  = opts.outdir ? path.resolve(opts.outdir) : srcDir;

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
    info(`Created output directory: ${outDir}`);
  }

  const pdfPath = path.join(outDir, `${jobname}.pdf`);

  console.log(`\n${C.bold}Source:${C.reset}  ${absTeX}`);
  console.log(`${C.bold}Output:${C.reset}  ${pdfPath}`);

  // ── Engine selection ────────────────────────────────────────────────────────
  const nativeAvail = hasTool('pdflatex');
  const pandocAvail = hasTool('pandoc') && findPuppeteer() !== null;

  let engine = opts.engine;
  if (engine === 'auto') {
    engine = nativeAvail ? 'native' : pandocAvail ? 'pandoc' : null;
    if (engine) info(`Auto-selected engine: ${engine}`);
  }

  if (!engine || (engine === 'native' && !nativeAvail) || (engine === 'pandoc' && !pandocAvail)) {
    fail('No usable PDF engine found. Install one of:');
    process.stderr.write(
      `  Native:  brew install --cask mactex      (macOS)\n` +
      `           sudo apt install texlive-full   (Ubuntu)\n` +
      `  Pandoc:  brew install pandoc  +  Google Chrome\n`
    );
    process.exit(1);
  }

  const t0 = Date.now();
  let ok_result = false;

  if (engine === 'native') {
    ok_result = nativeEngine(jobname, absTeX, srcDir, outDir, opts);
  } else {
    ok_result = pandocEngine(jobname, absTeX, srcDir, outDir);
  }

  if (!ok_result || !fs.existsSync(pdfPath)) {
    fail(`PDF not generated at: ${pdfPath}`);
    process.exit(1);
  }

  const kb   = (fs.statSync(pdfPath).size / 1024).toFixed(1);
  const secs = ((Date.now() - t0) / 1000).toFixed(1);

  console.log('');
  ok(`PDF ready:  ${C.bold}${pdfPath}${C.reset}`);
  ok(`Size: ${kb} KB   Time: ${secs}s   Engine: ${engine}`);

  if (opts.open) { info('Opening PDF…'); openPdf(pdfPath); }
})();
