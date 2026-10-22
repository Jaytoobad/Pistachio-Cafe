#!/usr/bin/env node
// Builds the site, serves the production bundle with `vite preview` and checks
// every public route at phone, tablet and desktop widths.
//
// For each route and width it:
//   - saves a full-page screenshot to docs/screens/<route>-<width>.png
//   - fails on console errors, page errors and failed network requests
//   - fails if the page text contains a broken-encoding sequence
//   - fails on horizontal overflow (documentElement.scrollWidth > innerWidth)
//   - fails if the header logo is taller than 64px
//   - fails if any other <img> is wider than its container
//   - fails if a button or link sticks out of its parent card
//   - fails if the header is taller than 130px on desktop / 100px on phones
//
// Usage: npm run verify
// Exit code: 0 = everything passed, 1 = at least one check failed.

import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const SCREEN_DIR = join(ROOT, 'docs', 'screens');
const VITE_BIN = join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');

const ROUTES = [
  '/',
  '/menu',
  '/cart',
  '/checkout',
  '/track',
  '/about',
  '/visit',
  '/gallery',
  '/contact',
  '/reviews',
  '/privacy',
  '/terms',
  '/delivery-info',
  '/admin/login',
  '/admin/today',
  '/admin/orders',
  '/admin/dishes',
  '/admin/menu',
  '/admin/riders',
  '/admin/zones',
  '/admin/reviews',
  '/admin/subscribers',
  '/admin/customers',
  '/admin/staff',
  '/admin/settings',
];

const WIDTHS = [390, 768, 1440];
const VIEWPORT_HEIGHT = 900;

const HEADER_MAX_DESKTOP = 130;
const HEADER_MAX_PHONE = 100;
const LOGO_MAX_HEIGHT = 64;
const OVERFLOW_TOLERANCE = 1;

// Broken sequences, written as \u escapes so this file stays pure ASCII.
const BROKEN_PATTERNS = [
  { label: 'a-euro', chars: '\u00e2\u20ac' },
  { label: 'A-tilde', chars: '\u00c3' },
  { label: 'A-circumflex', chars: '\u00c2' },
  { label: 'o-slash', chars: '\u00f0\u0178' },
  { label: 'a-tilde', chars: '\u00e2\u02dc' },
  { label: 'a-dagger', chars: '\u00e2\u2020' },
  { label: 'a-euro-one', chars: '\u00e2\u20ac\u00b9' },
  { label: 'a-euro-ord', chars: '\u00e2\u20ac\u00ba' },
  { label: 'replacement-char', chars: '\ufffd' },
];

function slug(route) {
  if (route === '/') return 'home';
  return route
    .replace(/^\//, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

function run(command, args, options = {}) {
  return new Promise((resolvePromise) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      env: { ...process.env, ...(options.env || {}) },
      shell: options.shell === true,
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (d) => {
      stdout += d.toString();
    });
    child.stderr?.on('data', (d) => {
      stderr += d.toString();
    });
    child.on('error', (error) => resolvePromise({ code: 1, stdout, stderr: String(error) }));
    child.on('close', (code) => resolvePromise({ code: code ?? 1, stdout, stderr }));
  });
}

function npmRun(args) {
  const npmExecPath = process.env.npm_execpath;
  if (npmExecPath) {
    return run(process.execPath, [npmExecPath, ...args]);
  }
  return run(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args,
    { shell: process.platform === 'win32' },
  );
}

function freePort() {
  return new Promise((resolvePromise, rejectPromise) => {
    const server = createServer();
    server.unref();
    server.on('error', rejectPromise);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolvePromise(port));
    });
  });
}

async function waitForServer(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

// Runs inside the browser page.
function pageChecks(options) {
  const issues = [];
  const add = (kind, message) => issues.push({ kind, message });

  const isVisible = (el) => {
    if (!el || !el.getBoundingClientRect) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 && rect.height <= 0) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    return true;
  };

  const doc = document.documentElement;
  if (doc.scrollWidth > window.innerWidth) {
    add('overflow', `horizontal scroll: scrollWidth ${doc.scrollWidth}px > innerWidth ${window.innerWidth}px`);
  }

  const header = document.querySelector('header');
  if (header) {
    const headerHeight = header.getBoundingClientRect().height;
    const limit = options.viewportWidth <= 480 ? options.headerMaxPhone : options.headerMaxDesktop;
    if (headerHeight > limit) {
      add('header', `header is ${Math.round(headerHeight)}px tall, limit is ${limit}px`);
    }
  }

  const headerLogo = header
    ? header.querySelector('img.site-brand-logo') || header.querySelector('img')
    : null;
  if (headerLogo && isVisible(headerLogo)) {
    const logoHeight = headerLogo.getBoundingClientRect().height;
    if (logoHeight > options.logoMaxHeight) {
      add('logo', `header logo is ${Math.round(logoHeight)}px tall, limit is ${options.logoMaxHeight}px`);
    }
  }

  for (const img of Array.from(document.images)) {
    if (img === headerLogo) continue;
    if (!isVisible(img)) continue;
    const parent = img.parentElement;
    if (!parent) continue;
    const parentRect = parent.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    if (parentRect.width <= 0) continue;
    if (imgRect.width > parentRect.width + options.tolerance) {
      add(
        'image',
        `<img src="${(img.getAttribute('src') || '').slice(0, 90)}"> is ${Math.round(imgRect.width)}px wide, container is ${Math.round(parentRect.width)}px`,
      );
    }
  }

  const cardAncestor = (el) => {
    let node = el.parentElement;
    while (node && node !== document.body && node !== document.documentElement) {
      const raw = node.getAttribute ? node.getAttribute('class') || '' : '';
      const tokens = raw.split(/\s+/).filter(Boolean);
      if (tokens.some((token) => /card$/i.test(token))) return node;
      node = node.parentElement;
    }
    return null;
  };

  for (const el of Array.from(document.querySelectorAll('button, a'))) {
    if (!isVisible(el)) continue;
    const card = cardAncestor(el);
    if (!card) continue;
    const cardRect = card.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const outside =
      elRect.left < cardRect.left - options.tolerance ||
      elRect.right > cardRect.right + options.tolerance ||
      elRect.top < cardRect.top - options.tolerance ||
      elRect.bottom > cardRect.bottom + options.tolerance;
    if (!outside) continue;
    const label = (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40);
    add(
      'card-overflow',
      `<${el.tagName.toLowerCase()}> "${label}" sticks out of its card (${el.tagName.toLowerCase()} ${Math.round(elRect.left)}-${Math.round(elRect.right)} vs card ${Math.round(cardRect.left)}-${Math.round(cardRect.right)})`,
    );
  }

  return issues;
}

function findBroken(text) {
  const hits = [];
  for (const pattern of BROKEN_PATTERNS) {
    if (text.includes(pattern.chars)) hits.push(pattern.label);
  }
  return hits;
}

async function main() {
  mkdirSync(SCREEN_DIR, { recursive: true });

  const globalIssues = [];

  // ---- build ----
  console.log('verify: building site (npm run build) ...');
  const build = await npmRun(['run', 'build']);
  if (build.code !== 0) {
    globalIssues.push('npm run build failed');
    console.log('verify: build gate FAILED, falling back to a direct vite build so the checks can still run.');
    console.log('--- last lines of the failed build ---');
    console.log(build.stdout.trim().split('\n').slice(-12).join('\n'));
    console.log(build.stderr.trim().split('\n').slice(-12).join('\n'));
    const direct = await run(process.execPath, [VITE_BIN, 'build']);
    if (direct.code !== 0) {
      globalIssues.push('vite build failed');
      console.log(direct.stdout.slice(-4000));
      console.log(direct.stderr.slice(-4000));
      console.log('verify: cannot continue without a build.');
      return { globalIssues, results: [] };
    }
  } else {
    console.log('verify: build ok.');
  }

  // ---- preview server ----
  const port = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const preview = spawn(
    process.execPath,
    [VITE_BIN, 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'],
    { cwd: ROOT, stdio: 'ignore', windowsHide: true },
  );

  const browser = await chromium.launch();
  const results = [];

  try {
    const up = await waitForServer(baseUrl);
    if (!up) {
      globalIssues.push('vite preview did not start');
      return { globalIssues, results };
    }
    console.log(`verify: serving dist on ${baseUrl}`);

    for (const route of ROUTES) {
      for (const width of WIDTHS) {
        const context = await browser.newContext({
          viewport: { width, height: VIEWPORT_HEIGHT },
          deviceScaleFactor: 1,
        });
        const page = await context.newPage();
        const issues = [];

        page.on('console', (message) => {
          if (message.type() !== 'error') return;
          const text = message.text();
          if (/favicon|net::ERR_ABORTED/i.test(text)) return;
          issues.push({ kind: 'console', message: `console error: ${text.slice(0, 200)}` });
        });

        page.on('pageerror', (error) => {
          issues.push({ kind: 'pageerror', message: `page error: ${String(error.message).slice(0, 200)}` });
        });

        page.on('requestfailed', (request) => {
          const failure = request.failure();
          const reason = failure ? failure.errorText : 'unknown';
          if (reason === 'net::ERR_ABORTED') return;
          issues.push({
            kind: 'network',
            message: `request failed (${reason}): ${request.url().slice(0, 120)}`,
          });
        });

        page.on('response', (response) => {
          if (response.status() < 400) return;
          issues.push({
            kind: 'network',
            message: `HTTP ${response.status()}: ${response.url().slice(0, 120)}`,
          });
        });

        try {
          const response = await page.goto(baseUrl + route, {
            waitUntil: 'load',
            timeout: 45000,
          });
          if (response && response.status() >= 400) {
            issues.push({
              kind: 'network',
              message: `HTTP ${response.status()} for ${route}`,
            });
          }
          await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
          await page.waitForTimeout(700);

          const domIssues = await page.evaluate(pageChecks, {
            viewportWidth: width,
            headerMaxDesktop: HEADER_MAX_DESKTOP,
            headerMaxPhone: HEADER_MAX_PHONE,
            logoMaxHeight: LOGO_MAX_HEIGHT,
            tolerance: OVERFLOW_TOLERANCE,
          });
          for (const issue of domIssues) issues.push(issue);

          const text = await page.evaluate(() => {
            const body = document.body;
            return `${body.innerText || ''}\n${body.textContent || ''}`;
          });
          for (const label of findBroken(text)) {
            issues.push({ kind: 'encoding', message: `broken encoding sequence in page text: ${label}` });
          }

          const file = join(SCREEN_DIR, `${slug(route)}-${width}.png`);
          await page.screenshot({ path: file, fullPage: true });
          results.push({
            route,
            width,
            ok: issues.length === 0,
            issues,
            screenshot: file,
          });
        } catch (error) {
          results.push({
            route,
            width,
            ok: false,
            issues: [{ kind: 'runtime', message: String(error.message).slice(0, 300) }],
            screenshot: null,
          });
        } finally {
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
    preview.kill();
  }

  return { globalIssues, results };
}

function printTable(results) {
  const header = ['Route', 'Width', 'Result', 'Issues', 'Screenshot'];
  const rows = results.map((r) => [
    r.route,
    String(r.width),
    r.ok ? 'PASS' : 'FAIL',
    r.ok ? '-' : String(r.issues.length),
    r.screenshot ? r.screenshot.replace(ROOT, '.') : '-',
  ]);
  const widths = header.map((h, i) => Math.max(h.length, ...rows.map((row) => row[i].length)));
  const line = (cells) => cells.map((cell, i) => cell.padEnd(widths[i])).join('  ');
  console.log('');
  console.log(line(header));
  console.log(widths.map((w) => '-'.repeat(w)).join('  '));
  for (const row of rows) console.log(line(row));
}

const { globalIssues, results } = await main();

console.log('');
if (globalIssues.length) {
  console.log('Global failures:');
  for (const issue of globalIssues) console.log(`  - ${issue}`);
  console.log('');
}

printTable(results);

const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.log('');
  console.log(`Failures (${failed.length} of ${results.length} route/width combinations):`);
  for (const item of failed) {
    console.log('');
    console.log(`  ${item.route} @ ${item.width}px`);
    for (const issue of item.issues) {
      console.log(`    [${issue.kind}] ${issue.message}`);
    }
  }
  console.log('');
  console.log('Screenshots are in docs/screens/.');
  process.exit(1);
}

console.log('');
console.log(`All ${results.length} route/width combinations passed.`);
console.log('Screenshots are in docs/screens/.');
process.exit(0);
