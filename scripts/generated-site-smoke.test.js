/**
 * Deterministic post-build smoke tests for the generated site (node:test +
 * node:assert only — no test framework). Operates against the freshly
 * generated dist/ directory (never source files as ground truth): entry
 * pages exist, all 435 manifest topics have HTML (and vice versa, no
 * orphans), every local navigation target resolves, every local
 * JS/CSS/manifest/icon/image/data reference resolves inside dist/, no
 * root-absolute Pages-incompatible paths or depth escapes, and
 * dist/data/*.json remain internally consistent with the generated output.
 *
 * Run: npm test  (node --test scripts/generated-site-smoke.test.js)
 * Requires a prior `npm run build:notes` (dist/ is committed, so CI has it).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const ENTRY_PAGES = [
  'index.html',
  'dashboard.html',
  'explorer.html',
  'course.html',
  'assessment.html',
  'offline.html',
];

const read = (f) => fs.readFileSync(f, 'utf-8');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

// External or non-file references never resolve against dist/.
function isSkippable(ref) {
  if (!ref || ref.startsWith('#') || ref.startsWith('data:') || ref.startsWith('blob:')) return true;
  if (ref.startsWith('mailto:') || ref.startsWith('tel:')) return true;
  if (/^(https?:)?\/\//.test(ref)) return true;
  return false;
}

// Strip fragment/query for existence checks.
function cleanRef(ref) {
  return ref.split('#')[0].split('?')[0];
}

function collectRefs(html) {
  return [...html.matchAll(/(href|src)="([^"]+)"/g)].map((m) => ({ attr: m[1], ref: m[2] }));
}

function loadDistManifest() {
  const p = path.join(DIST, 'data', 'topic-manifest.json');
  assert.ok(fs.existsSync(p), `${p} must exist (run npm run build:notes)`);
  return { manifestPath: p, manifest: JSON.parse(read(p)) };
}

describe('generated entry pages', () => {
  it('ships every required entry page', () => {
    assert.ok(fs.existsSync(DIST), 'dist/ must exist (run npm run build:notes)');
    for (const page of ENTRY_PAGES) {
      const p = path.join(DIST, page);
      assert.ok(fs.existsSync(p), `expected generated page ${p} — actual: missing`);
      assert.ok(read(p).includes('<html'), `${p} must be an HTML document`);
    }
  });
});

describe('generated topic pages match the manifest', () => {
  it('generates all 435 topic pages with no orphans either way', () => {
    const { manifest } = loadDistManifest();
    assert.equal(manifest.topics.length, 435, 'dist manifest must hold 435 topics');
    const expected = new Set(
      manifest.topics.map((t) => path.join(DIST, t.courseCode, t.filename.replace(/\.md$/, '.html'))),
    );
    assert.equal(expected.size, 435, 'manifest must point at 435 unique HTML targets');
    for (const target of [...expected].sort()) {
      assert.ok(fs.existsSync(target), `manifest topic missing HTML: ${target}`);
    }
    const onDisk = new Set(
      walk(DIST)
        .filter((f) => f.endsWith('.html'))
        .map((f) => path.normalize(f))
        .filter((f) => {
          const rel = path.relative(DIST, f);
          return rel.includes(path.sep); // topic pages live at dist/<COURSE>/*.html
        }),
    );
    assert.equal(onDisk.size, 435, `dist/ must hold 435 topic pages — actual: ${onDisk.size}`);
    for (const file of [...onDisk].sort()) {
      assert.ok(expected.has(file), `orphaned topic page with no manifest entry: ${file}`);
    }
  });
});

describe('generated navigation integrity', () => {
  it('resolves every local .html navigation target', () => {
    const pages = walk(DIST).filter((f) => f.endsWith('.html')).sort();
    assert.ok(pages.length > 0, 'dist/ must contain HTML pages');
    for (const page of pages) {
      const html = read(page);
      for (const { ref } of collectRefs(html)) {
        if (isSkippable(ref)) continue;
        const clean = cleanRef(ref);
        if (!clean.endsWith('.html')) continue;
        if (clean.startsWith('/')) {
          assert.fail(`${page} uses root-absolute navigation ${ref} — must stay Pages-relative`);
        }
        const target = path.normalize(path.join(path.dirname(page), clean));
        assert.ok(
          fs.existsSync(target),
          `dist broken navigation: ${page} -> ${ref} (missing ${target})`,
        );
      }
    }
  });
});

describe('generated asset references', () => {
  it('resolves local JS, CSS, manifest, icon, image, and data refs inside dist/', () => {
    const pages = walk(DIST).filter((f) => f.endsWith('.html')).sort();
    for (const page of pages) {
      const html = read(page);
      for (const { ref } of collectRefs(html)) {
        if (isSkippable(ref)) continue;
        const clean = cleanRef(ref);
        if (!clean || clean.endsWith('.html') || clean.endsWith('/')) continue;
        if (!/\.(js|css|png|svg|ico|webmanifest|json|xml|woff2?|ttf)$/.test(clean)) continue;
        if (clean.startsWith('/')) {
          assert.fail(`${page} uses root-absolute asset ${ref} — must stay Pages-relative`);
        }
        const target = path.normalize(path.join(path.dirname(page), clean));
        assert.ok(
          target === path.normalize(target) && target.startsWith(path.normalize(DIST) + path.sep),
          `${page} asset escapes dist/: ${ref}`,
        );
        assert.ok(fs.existsSync(target), `dist missing asset: ${page} -> ${ref} (missing ${target})`);
      }
    }
  });

  it('contains no Pages-incompatible root-absolute or depth-escape refs', () => {
    const pages = walk(DIST).filter((f) => f.endsWith('.html')).sort();
    for (const page of pages) {
      const html = read(page);
      for (const { ref } of collectRefs(html)) {
        if (isSkippable(ref)) continue;
        assert.ok(!ref.startsWith('/'), `${page} must not use root-absolute path ${ref}`);
      }
      assert.ok(
        !/href="\.\.\/\.\.|src="\.\.\/\.\./.test(html),
        `dist depth escape (../../) in ${page} — must be ../ for artifact root`,
      );
    }
  });
});

describe('generated data consistency', () => {
  it('ships manifest and bank JSON consistent with the generated curriculum', () => {
    for (const f of [path.join(DIST, 'data', 'topic-manifest.json'), path.join(DIST, 'data', 'assessments.json')]) {
      assert.ok(fs.existsSync(f), `expected ${f} — actual: missing (run npm run build:notes)`);
    }
    const { manifest } = loadDistManifest();
    assert.equal(manifest.aggregates.totalTopics, manifest.topics.length);
    const bank = JSON.parse(read(path.join(DIST, 'data', 'assessments.json')));
    assert.ok(Array.isArray(bank.questions) && bank.questions.length > 0, 'bank must hold questions');
    const validKeys = new Set(manifest.topics.map((t) => `${t.courseCode}/${t.id}`));
    for (const q of bank.questions) {
      assert.ok(
        validKeys.has(`${q.courseCode}/${q.topicId}`),
        `bank question "${q.id}" points at unknown topic "${q.courseCode}/${q.topicId}"`,
      );
    }
    const seen = new Set();
    for (const t of manifest.topics) {
      const key = `${t.courseCode}/${t.id}`;
      assert.ok(!seen.has(key), `manifest holds duplicate topic ${key}`);
      seen.add(key);
    }
  });
});
