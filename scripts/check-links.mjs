#!/usr/bin/env node
// Verifies every static internal link in the app points to a real route, and
// every static asset reference (favicon, app entry, image manifest) resolves to
// an actual file. External URLs (http/https/tel/mailto) are not checked.
//
// Usage: node scripts/check-links.mjs
// Exit code: 0 = all links resolve, 1 = broken link(s) found.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PUBLIC = join(ROOT, 'public');
const SRC = join(ROOT, 'src');

// ---------- 1. Build the set of valid internal routes from src/App.jsx ----------

function readAppRoutes() {
  const app = readFileSync(join(SRC, 'App.jsx'), 'utf8');
  const routes = new Set();
  const stack = []; // path segments of the current nesting prefix

  function currentPath() {
    return stack.length === 0 ? '/' : '/' + stack.join('/');
  }

  function addRoute() {
    routes.add(currentPath());
  }

  // Match <Route ...> opening tags and </Route> closing tags in document order,
  // across multiple lines. Capture the attribute string to read `path=`.
  const tagRe = /<\/?Route\b([^>]*)>/gs;
  let match;
  while ((match = tagRe.exec(app)) !== null) {
    const full = match[0];
    const attrs = match[1];
    const isClose = full.startsWith('</');
    const isSelfClosing = /\/\s*>/.test(full);

    if (isClose) {
      if (stack.length > 0) stack.pop();
      continue;
    }

    // Opening <Route ...>
    const pathMatch = attrs.match(/path=["']([^"']+)["']/);
    if (!pathMatch) {
      // <Route index> (no path) renders at the current prefix.
      if (/\bindex\b/.test(attrs)) addRoute();
      continue;
    }

    const value = pathMatch[1];
    if (value === '*') continue; // catch-all, not a link target

    const snapshot = stack.slice();
    if (value.startsWith('/')) {
      stack.length = 0;
      value.slice(1).split('/').filter(Boolean).forEach((s) => stack.push(s));
    } else {
      stack.push(value);
    }
    addRoute();

    if (isSelfClosing) {
      // No children nest under a self-closing route: restore the prior prefix.
      stack.length = 0;
      snapshot.forEach((s) => stack.push(s));
    }
  }

  routes.add('/');
  return routes;
}

// ---------- 2. Collect static internal link targets ----------

const TOKEN_RE = /(?:to|href|src)=["']([^"']+)["']/g;

function collectJsxFiles(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const full = join(dir, name);
    let info;
    try {
      info = statSync(full);
    } catch {
      continue;
    }
    if (info.isDirectory()) {
      if (name === 'node_modules' || name === '.git' || name === 'dist') continue;
      collectJsxFiles(full, out);
    } else if (info.isFile() && full.endsWith('.jsx')) {
      out.push(full);
    }
  }
  return out;
}

function scanFileForLinks(file, targets) {
  const source = readFileSync(file, 'utf8');
  const rel = relative(ROOT, file).split('\\').join('/');
  let match;
  while ((match = TOKEN_RE.exec(source)) !== null) {
    const value = match[1];
    if (!value.startsWith('/')) continue; // external / relative / dynamic
    if (value.startsWith('//')) continue;
    targets.push({ file: rel, value });
  }
}

// ---------- 3. Route matching ----------

function segments(path) {
  return path.split('/').filter(Boolean);
}

function linkMatchesRoute(target, route) {
  const t = segments(target);
  const r = segments(route);
  if (t.length !== r.length) return false;
  for (let i = 0; i < t.length; i++) {
    if (r[i].startsWith(':') || r[i] === '*') continue;
    if (r[i] !== t[i]) return false;
  }
  return true;
}

function resolvesToRoute(target, routes) {
  let path = target.split('?')[0].split('#')[0];
  if (!path.startsWith('/')) path = '/' + path;
  path = path.replace(/\/+$/, '') || '/';
  for (const route of routes) {
    if (linkMatchesRoute(path, route)) return true;
  }
  return false;
}

// ---------- 4. Asset file existence ----------

function assetExists(value) {
  const noLead = value.startsWith('/') ? value.slice(1) : value;
  // /src/main.jsx is served from the project root's src/ dir (Vite dev);
  // everything else (/favicon.svg, /images/...) lives under public/.
  const base = noLead.startsWith('src/') ? ROOT : PUBLIC;
  try {
    statSync(join(base, noLead));
    return true;
  } catch {
    return false;
  }
}

// ---------- run ----------

const routes = readAppRoutes();
const linkTargets = [];
for (const file of collectJsxFiles(join(ROOT, 'src'))) {
  scanFileForLinks(file, linkTargets);
}

// HTML asset references.
const htmlFiles = [join(ROOT, 'index.html')];
for (const file of htmlFiles) {
  try {
    scanFileForLinks(file, linkTargets);
  } catch {
    /* optional file */
  }
}

const findings = [];

for (const { file, value } of linkTargets) {
  // Pathname links are validated as routes; static asset srcs are checked as files.
  if (!resolvesToRoute(value, routes)) {
    if (!assetExists(value)) {
      findings.push({
        file,
        value,
        message: `internal link "${value}" matches no route and no file exists`,
      });
    }
  }
}

// Verify image manifest entries exist on disk.
const manifest = join(SRC, 'storefront', 'data', 'imageManifest.js');
try {
  const manifestSource = readFileSync(manifest, 'utf8');
  const entryRe = /['"]\/([^"']+)['"]/g;
  let m;
  while ((m = entryRe.exec(manifestSource)) !== null) {
    const value = m[1];
    if (!assetExists(value)) {
      findings.push({
        file: relative(ROOT, manifest).split('\\').join('/'),
        value,
        message: `image manifest entry "${value}" has no matching file`,
      });
    }
  }
} catch {
  /* manifest optional */
}

// De-duplicate findings by file + value.
const seen = new Set();
const unique = [];
for (const f of findings) {
  const key = f.file + '|' + f.value;
  if (seen.has(key)) continue;
  seen.add(key);
  unique.push(f);
}

if (unique.length === 0) {
  console.log(
    `check-links: OK - ${linkTargets.length} internal link(s) checked, all resolve to a route or file.`,
  );
  process.exit(0);
}

console.log(`check-links: FAILED - ${unique.length} broken internal link(s).`);
console.log('');
for (const f of unique) {
  console.log(`${f.file}: ${f.value}`);
  console.log(`  ${f.message}`);
}
console.log('');
console.log('Fix: point the link at a defined route (see src/App.jsx) or add the missing file.');
process.exit(1);
