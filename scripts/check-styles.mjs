#!/usr/bin/env node
// Finds CSS classes that are used in JSX but have no matching selector in any
// stylesheet. Used classes that no stylesheet knows about are dead classes:
// either a typo, or a rule that was never written.
//
// Usage: node scripts/check-styles.mjs
// Exit code: 0 = every class is styled, 1 = unmatched classes found.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'docs', 'reference', '.vercel']);

function walk(dir, filter, out = []) {
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
      if (SKIP_DIRS.has(name)) continue;
      walk(full, filter, out);
    } else if (info.isFile() && filter(full)) {
      out.push(full);
    }
  }
  return out;
}

// ---------- JSX scanning ----------

function readQuoted(src, start) {
  const quote = src[start];
  let i = start + 1;
  let text = '';
  while (i < src.length) {
    const ch = src[i];
    if (ch === '\\') {
      text += src[i + 1] ?? '';
      i += 2;
      continue;
    }
    if (ch === quote) {
      i++;
      break;
    }
    text += ch;
    i++;
  }
  return { text, end: i };
}

// Reads a template literal, pushing its literal chunks into `out` and the
// literals found inside ${...} substitutions. Returns the index after the
// closing backtick.
function readTemplate(src, start, out) {
  let i = start + 1;
  let chunk = '';
  while (i < src.length) {
    const ch = src[i];
    if (ch === '\\') {
      chunk += src[i + 1] ?? '';
      i += 2;
      continue;
    }
    if (ch === '`') {
      i++;
      break;
    }
    if (ch === '$' && src[i + 1] === '{') {
      if (chunk) {
        out.push(chunk);
        chunk = '';
      }
      const inner = readBalanced(src, i + 1);
      out.push(...expressionLiterals(inner.inner));
      i = inner.end;
      continue;
    }
    chunk += ch;
    i++;
  }
  if (chunk) out.push(chunk);
  return i;
}

// src[start] must be '{'. Returns the inner text and the index after '}'.
function readBalanced(src, start) {
  let depth = 0;
  let i = start;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '{') {
      depth++;
      i++;
      continue;
    }
    if (ch === '}') {
      depth--;
      i++;
      if (depth === 0) return { inner: src.slice(start + 1, i - 1), end: i };
      continue;
    }
    if (ch === '"' || ch === "'") {
      i = readQuoted(src, i).end;
      continue;
    }
    if (ch === '`') {
      i = readTemplate(src, i, []);
      continue;
    }
    if (ch === '/' && src[i + 1] === '/') {
      const nl = src.indexOf('\n', i);
      i = nl === -1 ? src.length : nl;
      continue;
    }
    if (ch === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i);
      i = end === -1 ? src.length : end + 2;
      continue;
    }
    i++;
  }
  return { inner: src.slice(start + 1), end: src.length };
}

// Index just after the literal that starts at `start`.
function skipLiteral(src, start) {
  const quote = src[start];
  if (quote === '`') return readTemplate(src, start, []);
  return readQuoted(src, start).end;
}

// Finds a top level `cond ? a : b` inside a className expression. Literals in
// the condition are values, not class names, so they must be ignored.
function findTopLevelTernary(expr) {
  let depth = 0;
  let question = -1;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      i = skipLiteral(expr, i) - 1;
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{') {
      depth++;
      continue;
    }
    if (ch === ')' || ch === ']' || ch === '}') {
      depth--;
      continue;
    }
    if (depth !== 0) continue;
    if (ch === '?') {
      if (expr[i + 1] === '.' || expr[i + 1] === '?') {
        i++;
        continue;
      }
      question = i;
      break;
    }
  }
  if (question === -1) return null;

  let pending = 1;
  for (let i = question + 1; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      i = skipLiteral(expr, i) - 1;
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{') {
      depth++;
      continue;
    }
    if (ch === ')' || ch === ']' || ch === '}') {
      depth--;
      continue;
    }
    if (depth !== 0) continue;
    if (ch === '?') {
      if (expr[i + 1] === '.' || expr[i + 1] === '?') {
        i++;
        continue;
      }
      pending++;
      continue;
    }
    if (ch === ':') {
      pending--;
      if (pending === 0) {
        return {
          condition: expr.slice(0, question),
          consequent: expr.slice(question + 1, i),
          alternate: expr.slice(i + 1),
        };
      }
    }
  }
  return null;
}

function collectLiterals(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '"' || ch === "'") {
      const { text, end } = readQuoted(src, i);
      out.push(text);
      i = end;
      continue;
    }
    if (ch === '`') {
      i = readTemplate(src, i, out);
      continue;
    }
    i++;
  }
  return out;
}

function expressionLiterals(expr) {
  const ternary = findTopLevelTernary(expr);
  if (ternary) {
    return [
      ...expressionLiterals(ternary.consequent),
      ...expressionLiterals(ternary.alternate),
    ];
  }
  return collectLiterals(expr);
}

const CLASS_TOKEN = /^[A-Za-z_][A-Za-z0-9_-]*$/;

function classTokens(text) {
  return text
    .split(/\s+/)
    .filter((token) => token.length > 0)
    .filter((token) => CLASS_TOKEN.test(token))
    .filter((token) => !token.endsWith('-'))
    .filter((token) => !token.startsWith('-'));
}

function extractClassNames(source) {
  const found = [];
  const lineAt = (index) => source.slice(0, index).split('\n').length;
  const re = /className\s*=/g;
  let match;
  while ((match = re.exec(source)) !== null) {
    const attrLine = lineAt(match.index);
    let i = match.index + match[0].length;
    while (i < source.length && /\s/.test(source[i])) i++;
    if (source[i] === '"' || source[i] === "'") {
      const { text } = readQuoted(source, i);
      for (const token of classTokens(text)) found.push({ name: token, line: attrLine });
      continue;
    }
    if (source[i] === '{') {
      const { inner } = readBalanced(source, i);
      for (const literal of expressionLiterals(inner)) {
        for (const token of classTokens(literal)) found.push({ name: token, line: attrLine });
      }
    }
  }
  return found;
}

// ---------- CSS scanning ----------

function extractCssClasses(css) {
  const cleaned = css
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/url\([^)]*\)/g, ' ')
    .replace(/"[^"]*"|'[^']*'/g, ' ')
    // 1.5rem -> 0rem so a decimal point is never read as a class selector
    .replace(/\d+\.\d+/g, '0');
  const classes = new Set();
  const re = /\.(-?[_a-zA-Z][\w-]*)/g;
  let match;
  while ((match = re.exec(cleaned)) !== null) {
    classes.add(match[1]);
  }
  return classes;
}

// Tailwind-style utility names. The project does not use Tailwind, so these
// are reported too - but they are called out separately because that is the
// most likely reason they are there.
const UTILITY_RE = new RegExp(
  '^(?:' +
    '[wh]-[a-z0-9]+|' +
    'text-[a-z0-9-]+|' +
    'font-[a-z0-9-]+|' +
    '(?:m|p)[trblxy]?-[0-9]+|' +
    'tracking-[a-z-]+|' +
    'leading-[a-z-]+|' +
    'gap-[0-9]+|' +
    'space-[xy]-[0-9]+|' +
    'flex-[0-9]+|' +
    'inset-[0-9]+|' +
    '[trbl]-?[0-9]+|' +
    'rounded(?:-\\w+)?|' +
    'shadow(?:-\\w+)?|' +
    'border(?:-\\w+)?|' +
    'uppercase|lowercase|capitalize|truncate|italic|underline|' +
    'block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden|' +
    'relative|absolute|fixed|sticky|static|container|' +
    'antialiased|list-none|opacity-[0-9]+' +
    ')$',
);

// ---------- run ----------

const jsxFiles = walk(join(ROOT, 'src'), (f) => f.endsWith('.jsx'));
const cssFiles = walk(ROOT, (f) => f.endsWith('.css'));

const usage = new Map();
for (const file of jsxFiles) {
  const source = readFileSync(file, 'utf8');
  const rel = relative(ROOT, file).split('\\').join('/');
  for (const { name, line } of extractClassNames(source)) {
    if (!usage.has(name)) usage.set(name, []);
    usage.get(name).push(`${rel}:${line}`);
  }
}

const styled = new Set();
for (const file of cssFiles) {
  const css = readFileSync(file, 'utf8');
  for (const name of extractCssClasses(css)) styled.add(name);
}

const unmatched = [...usage.keys()].filter((name) => !styled.has(name)).sort();

if (unmatched.length === 0) {
  console.log(
    `check-styles: OK - ${usage.size} classes used in ${jsxFiles.length} jsx files, all matched in ${cssFiles.length} css files.`,
  );
  process.exit(0);
}

const utilities = unmatched.filter((name) => UTILITY_RE.test(name));

console.log(
  `check-styles: FAILED - ${unmatched.length} class(es) used in JSX have no selector in any css file.`,
);
console.log('');

for (const name of unmatched) {
  const places = usage.get(name);
  console.log(name);
  for (const place of places) console.log(`  ${place}`);
}

console.log('');
console.log('Either write the missing rule or remove the class from the markup.');
if (utilities.length) {
  console.log('');
  console.log(
    `${utilities.length} of them look like Tailwind-style utilities (${utilities.slice(0, 12).join(', ')}${utilities.length > 12 ? ', ...' : ''}). Tailwind is not a dependency of this project, so they currently do nothing.`,
  );
}
process.exit(1);
