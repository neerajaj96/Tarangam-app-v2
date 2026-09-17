/**
 * Tarangam content QA gate — zero dependencies, runs in CI before build.
 * Fails (exit 1) on broken dashboard links, malformed quizzes, duplicate
 * slugs/anchors. Orphan videos are warnings only.
 */
import fs from 'fs';
import path from 'path';

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// 1. Dashboard links must resolve to content/*.md (locked cards carry no href).
{
  const html = fs.readFileSync('index.html', 'utf-8');
  for (const m of html.matchAll(/href="(dist\/[^"]+\.html)"/g)) {
    const md = m[1].replace(/^dist\//, 'content/').replace(/\.html$/, '.md');
    if (!fs.existsSync(md)) fail(`dashboard broken link: ${m[1]} (missing ${md})`);
  }
}

// 2. Per-file checks.
const courses = fs.readdirSync('content').filter((d) => fs.statSync(path.join('content', d)).isDirectory());
for (const course of courses) {
  const dir = path.join('content', course);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort();

  // 2a. Naming convention + duplicate seq.
  const seen = new Map();
  for (const f of files) {
    const m = f.match(/^m(\d+)_(\d+)_/);
    if (!m) { fail(`${course}/${f}: breaks m{mod}_{seq}_{slug}.md convention`); continue; }
    const key = `${m[1]}_${m[2]}`;
    if (seen.has(key)) fail(`${course}: duplicate seq ${key} in ${seen.get(key)} and ${f}`);
    else seen.set(key, f);
  }

  for (const f of files) {
    const t = fs.readFileSync(path.join(dir, f), 'utf-8');

    // 2b. Quiz balance: every ::: quiz needs ::: explanation, exactly 1 correct, >=2 options.
    const opens = (t.match(/::: quiz /g) || []).length;
    const expls = (t.match(/::: explanation/g) || []).length;
    if (opens !== expls) fail(`${course}/${f}: ${opens} quiz opens vs ${expls} explanations`);
    for (const b of t.matchAll(/::: quiz (.*?)\n(.*?)\n::: explanation\n(.*?)\n:::/gs)) {
      const opts = [];
      let correct = 0;
      for (const line of b[2].split('\n')) {
        const s = line.trim();
        if (!s) continue;
        if (s.startsWith('(*') && s.includes(')')) { opts.push(s); correct++; }
        else if (s.startsWith('(') && s.includes(')') && !s.startsWith('(*')) opts.push(s);
      }
      if (correct !== 1) fail(`${course}/${f}: quiz "${b[1].trim().slice(0, 50)}" has ${correct} correct options`);
      if (opts.length < 2) fail(`${course}/${f}: quiz "${b[1].trim().slice(0, 50)}" has <2 options`);
      if (!b[3].trim()) fail(`${course}/${f}: empty explanation`);
    }

    // 2c. Duplicate anchor ids within a page.
    const ids = [...t.matchAll(/<a id="([^"]+)">/g)].map((m) => m[1]);
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dup.length) fail(`${course}/${f}: duplicate anchor ids: ${[...new Set(dup)].join(', ')}`);

    // 2d. Fence balance.
    if ((t.match(/```/g) || []).length % 2 !== 0) fail(`${course}/${f}: unbalanced code fences`);
  }
}

// 3. Orphan videos (warning): mp4s no topic references.
{
  const vids = fs.existsSync('assets/videos') ? fs.readdirSync('assets/videos').filter((f) => f.endsWith('.mp4')) : [];
  const all = courses.flatMap((c) =>
    fs.readdirSync(path.join('content', c)).map((f) => fs.readFileSync(path.join('content', c, f), 'utf-8')),
  ).join('\n');
  for (const v of vids) {
    if (!all.includes(v.replace(/\.mp4$/, '')) && !all.includes(v)) warn(`orphan video (no .md references it): assets/videos/${v}`);
  }
}

// 4. Post-build dist validation (skipped when dist/ absent, e.g. fresh clone).
// Every relative *.html link inside dist/ must resolve to a built file —
// this catches nav/prev-next/dashboard rewrite breakage in both Pages modes.
if (fs.existsSync('dist')) {
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      return e.isDirectory() ? walk(p) : [p];
    });
  const pages = walk('dist').filter((f) => f.endsWith('.html'));
  if (!pages.length) fail('dist/ exists but contains no .html pages');
  for (const page of pages) {
    const html = fs.readFileSync(page, 'utf-8');
    for (const m of html.matchAll(/href="([^"#]+?\.html)"/g)) {
      const href = m[1];
      if (/^(https?:)?\/\//.test(href) || href.startsWith('mailto:')) continue;
      const target = path.normalize(path.join(path.dirname(page), href));
      if (!fs.existsSync(target)) fail(`dist broken link: ${page} -> ${href}`);
    }
  }
  // dist/index.html must be standalone (no dist/ prefixes — artifact root).
  const di = fs.existsSync('dist/index.html') ? fs.readFileSync('dist/index.html', 'utf-8') : '';
  if (di.includes('href="dist/')) fail('dist/index.html still contains dist/ prefixes (artifact mode broken)');
  // Canonical artifact depth: topic pages sit at <root>/<COURSE>/, so no
  // asset ref may climb two levels (../../ escapes the Pages subfolder).
  for (const page of pages) {
    if (/href="\.\.\/\.\.|src="\.\.\/\.\./.test(fs.readFileSync(page, 'utf-8'))) {
      fail(`dist depth escape (../../) in ${page} — must be ../ for artifact root`);
    }
  }
}

for (const w of warnings) console.warn('WARN: ' + w);
if (errors.length) {
  for (const e of errors) console.error('FAIL: ' + e);
  console.error(`${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(1);
}
console.log(`check passed (${courses.length} courses), ${warnings.length} warning(s)`);
