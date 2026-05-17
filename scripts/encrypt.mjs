#!/usr/bin/env node
/**
 * Post-build: encrypt every dist/**\/*.html file in place using StatiCrypt.
 *
 * Why we expand the glob in Node rather than letting the shell do it:
 * PowerShell on Windows does not expand `dist/**\/*.html` — StatiCrypt
 * receives the literal string and tries to stat it.
 *
 * Password source: $STATICRYPT_PASSWORD (preferred) or $PASSWORD.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(process.cwd());
const dist = join(root, 'dist');

if (!existsSync(dist)) {
  console.error('[encrypt] dist/ not found. Run `astro build` first.');
  process.exit(1);
}

const password =
  process.env.STATICRYPT_PASSWORD ?? process.env.PASSWORD ?? '';

if (!password) {
  console.error(
    '[encrypt] STATICRYPT_PASSWORD not set.\n' +
      '          For local builds: PowerShell `$env:STATICRYPT_PASSWORD = "<removed>"; npm run build`\n' +
      '          For CI: set the STATICRYPT_PASSWORD repo secret.'
  );
  process.exit(1);
}

function findHtml(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...findHtml(full));
    else if (s.isFile() && entry.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = findHtml(dist).map((f) => relative(root, f).replaceAll('\\', '/'));

if (files.length === 0) {
  console.error('[encrypt] No HTML files found under dist/. Nothing to encrypt.');
  process.exit(1);
}

console.log(`[encrypt] encrypting ${files.length} file(s) under dist/`);

const args = [
  'staticrypt',
  ...files,
  '--password',
  password,
  // overwrite the originals in place (no _encrypted suffix)
  '--directory',
  'dist',
  // shorter base-path-relative URLs after unlock
  '--short',
];

const r = spawnSync('npx', ['--yes', ...args], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (r.status !== 0) {
  console.error('[encrypt] StatiCrypt failed.');
  process.exit(r.status ?? 1);
}

console.log(`[encrypt] All ${files.length} dist/*.html files encrypted.`);
