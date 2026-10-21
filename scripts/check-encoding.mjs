#!/usr/bin/env node
// Fails the build when a source file contains mojibake (UTF-8 bytes decoded as
// Latin-1) or the Unicode replacement character.
//
// The broken sequences are written with \u escapes on purpose: this file stays
// pure ASCII, so the checker can never corrupt itself.
//
// Usage: node scripts/check-encoding.mjs
// Exit code: 0 = clean, 1 = broken sequences found.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));

const TARGETS = ['src', 'public'];
const FILES = ['index.html'];

const TEXT_EXTENSIONS = new Set([
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx',
  '.css', '.html', '.json', '.md', '.txt', '.svg', '.xml', '.yml', '.yaml',
]);

// label -> the literal characters that must never appear in a source file.
const PATTERNS = [
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

function isTextFile(filePath) {
  return TEXT_EXTENSIONS.has(filePath.slice(filePath.lastIndexOf('.')));
}

function collectFiles(dir, out = []) {
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
      collectFiles(full, out);
    } else if (info.isFile() && isTextFile(full)) {
      out.push(full);
    }
  }
  return out;
}

function describe(text) {
  return Array.from(text)
    .map((ch) => 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'))
    .join(' ');
}

function scan(filePath, findings) {
  let raw;
  try {
    raw = readFileSync(filePath);
  } catch {
    return;
  }
  const text = raw.toString('utf8');
  const lines = text.split(/\r?\n/);
  const rel = relative(ROOT, filePath).split('\\').join('/');

  lines.forEach((line, index) => {
    for (const pattern of PATTERNS) {
      if (!line.includes(pattern.chars)) continue;
      const column = line.indexOf(pattern.chars) + 1;
      findings.push({
        file: rel,
        line: index + 1,
        column,
        pattern: pattern.label,
        codePoints: describe(pattern.chars),
        snippet: line.trim().slice(0, 160),
      });
    }
  });
}

const findings = [];
const files = [];
for (const target of TARGETS) {
  files.push(...collectFiles(join(ROOT, target)));
}
for (const file of FILES) {
  const full = join(ROOT, file);
  try {
    statSync(full);
    files.push(full);
  } catch {
    /* optional file */
  }
}

for (const file of files) scan(file, findings);

if (findings.length === 0) {
  console.log(`check-encoding: OK - ${files.length} files scanned, no broken sequences.`);
  process.exit(0);
}

console.log(`check-encoding: FAILED - ${findings.length} broken sequence(s) in ${files.length} scanned files.`);
console.log('');

const byFile = new Map();
for (const finding of findings) {
  if (!byFile.has(finding.file)) byFile.set(finding.file, []);
  byFile.get(finding.file).push(finding);
}

for (const [file, items] of byFile) {
  console.log(file);
  for (const item of items) {
    console.log(`  line ${item.line}:${item.column}  [${item.pattern}] ${item.codePoints}`);
    console.log(`    ${item.snippet}`);
  }
}

console.log('');
console.log('Fix: use HTML entities in JSX, \\u escapes in JS strings, and re-save as UTF-8 without BOM.');
process.exit(1);
