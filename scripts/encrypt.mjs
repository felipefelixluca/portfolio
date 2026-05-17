#!/usr/bin/env node
/**
 * Post-build: encrypt the case-study pages under dist/work/ in place.
 *
 * Home, About, 404, the CV PDF, fonts and images all remain public.
 * Only dist/work/**\/*.html is gated — so a LinkedIn visitor sees the
 * brand, intro and downloadable CV, but the actual case studies require
 * the password.
 *
 * Why we expand the glob in Node rather than letting the shell do it:
 * PowerShell on Windows does not expand `dist/work/**\/*.html` — StatiCrypt
 * receives the literal string and tries to stat it.
 *
 * Password source: $STATICRYPT_PASSWORD (preferred) or $PASSWORD.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { basename, dirname, join, relative, resolve } from 'node:path';

const root = resolve(process.cwd());
const dist = join(root, 'dist');
const gatedRoot = join(dist, 'work');

if (!existsSync(dist)) {
  console.error('[encrypt] dist/ not found. Run `astro build` first.');
  process.exit(1);
}

if (!existsSync(gatedRoot)) {
  console.warn('[encrypt] dist/work/ not found — nothing to gate. Skipping.');
  process.exit(0);
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

const files = findHtml(gatedRoot).map((f) => relative(root, f).replaceAll('\\', '/'));

if (files.length === 0) {
  console.warn('[encrypt] No HTML files found under dist/work/. Nothing to encrypt.');
  process.exit(0);
}

console.log(`[encrypt] gating ${files.length} case-study file(s) under dist/work/ (home, about, CV stay public)`);

// Use ONE shared salt across every encrypted page so a visitor who unlocks
// one case study can browse the others without being prompted again.
// StatiCrypt looks for `.staticrypt.json` next to each input file and
// generates a fresh salt if it can't find one; per-file invocations would
// therefore produce 5 different salts. We side-step that by reading the
// committed root salt (creating it if missing) and passing it explicitly.
const rootSaltFile = join(root, '.staticrypt.json');
let salt;
if (existsSync(rootSaltFile)) {
  salt = JSON.parse(readFileSync(rootSaltFile, 'utf8')).salt;
} else {
  salt = randomBytes(16).toString('hex');
  writeFileSync(rootSaltFile, JSON.stringify({ salt }, null, 4));
  console.log(`[encrypt] generated new root salt: ${salt} (commit .staticrypt.json so CI re-uses it)`);
}

// StatiCrypt with --directory <dir> writes every input as <dir>/<basename>,
// so passing multiple `index.html` files at once would collide on the same
// output path. Per-file invocation with cwd set to the file's parent dir
// makes the encrypted output replace the source in place.
for (const file of files) {
  const parent = dirname(file);
  const r = spawnSync(
    'npx',
    [
      '--yes',
      'staticrypt',
      basename(file),
      '--password',
      password,
      '--salt',
      salt,
      '--directory',
      '.',
      '--short',
    ],
    {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      cwd: parent,
    }
  );
  if (r.status !== 0) {
    console.error(`[encrypt] StatiCrypt failed on ${file}`);
    process.exit(r.status ?? 1);
  }
  // Tidy up: drop the per-directory `.staticrypt.json` StatiCrypt writes,
  // since the root copy is the source of truth and the salt is already
  // embedded in the encrypted HTML.
  const stray = join(parent, '.staticrypt.json');
  if (existsSync(stray)) unlinkSync(stray);
}

console.log(`[encrypt] All ${files.length} case-study HTML file(s) encrypted in place with shared salt.`);
