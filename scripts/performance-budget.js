/**
 * Deterministic performance-budget audit (Node, no dependencies).
 *
 * Inspects the built dist/ output and reports actual size vs configured
 * budget with pass/fail per budget, the largest files and generated topic
 * pages, and aggregate HTML/CSS/JS/data sizes. Budgets are practical
 * limits set from the measured repository baseline plus headroom — not
 * industry targets, and never a synthetic performance score.
 *
 * Budgets cover: generated HTML size, shared CSS size, JavaScript asset
 * size (total, per-file max, runtime-module count), curriculum manifest
 * size, assessment-bank size, total initial learner-surface payload per
 * surface, and maximum generated topic-page size.
 *
 * Run: node scripts/performance-budget.js [--dir dist]
 * Exit code is 0 when every budget passes, 1 otherwise (build/check
 * fail loudly on the same contract — see scripts/check.js).
 */
import fs from 'node:fs';
import path from 'node:path';

// Repository-level budgets in bytes. Set from the measured baseline plus
// ~20–25% headroom; raise deliberately (never silently) when content
// legitimately grows, e.g. new assessment questions or topics.
export const PERFORMANCE_BUDGETS = {
  // Generated topic HTML: total across all topic pages.
  totalTopicHtmlBytes: 22 * 1024 * 1024,
  // Largest single generated topic page.
  maxTopicPageBytes: 75 * 1024,
  // Shared stylesheet.
  sharedCssBytes: 50 * 1024,
  // All shipped runtime JavaScript, in total.
  totalJsBytes: 480 * 1024,
  // Largest single shipped JavaScript asset.
  maxJsFileBytes: 60 * 1024,
  // Locally loaded runtime JS modules (assets/*.js shipped to dist).
  runtimeModuleCount: 24,
  // Curriculum manifest JSON.
  manifestBytes: 400 * 1024,
  // Assessment question-bank JSON.
  bankBytes: 460 * 1024,
  // Largest single entry HTML page (index carries inlined catalog data).
  maxEntryHtmlBytes: 130 * 1024,
  // Total initial learner-surface payload (entry HTML + shared CSS +
  // transitive local JS + manifest + bank where the surface loads it).
  initialPayloadBytes: 1400 * 1024,
  // Generated topic pages must all survive optimization.
  topicPageCount: 432,
};

const ENTRY_MODULES = {
  dashboard: 'assets/dashboard.js',
  explorer: 'assets/explorer.js',
  course: 'assets/course-page.js',
  assessment: 'assets/assessment-page.js',
  topic: 'assets/topic-study-context.js',
  index: null,
};

const ENTRY_HTML = {
  dashboard: 'dashboard.html',
  explorer: 'explorer.html',
  course: 'course.html',
  assessment: 'assessment.html',
  topic: null, // worst-case topic page, resolved at audit time
  index: 'index.html',
};

function bytesOf(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return null;
  }
}

// Transitive local JS imports of a dist entry module (dist-relative paths).
export function localRuntimeClosure(outputDir, entry) {
  const seen = new Set();
  const walk = (rel) => {
    const abs = path.join(outputDir, rel);
    if (seen.has(rel) || !fs.existsSync(abs)) return;
    seen.add(rel);
    const src = fs.readFileSync(abs, 'utf-8');
    for (const m of src.matchAll(/from\s+['"](\.\.?\/[^'"]+\.js)['"]/g)) {
      walk(path.normalize(path.join(path.dirname(rel), m[1])));
    }
  };
  walk(entry);
  return [...seen].sort();
}

function topicPages(outputDir) {
  const out = [];
  if (!fs.existsSync(outputDir)) return out;
  for (const course of fs.readdirSync(outputDir).sort()) {
    const dir = path.join(outputDir, course);
    if (!fs.statSync(dir).isDirectory() || !/^[A-Z0-9]+$/.test(course)) continue;
    for (const file of fs.readdirSync(dir).sort()) {
      if (!file.endsWith('.html')) continue;
      out.push({ courseCode: course, file, bytes: bytesOf(path.join(dir, file)) ?? 0 });
    }
  }
  return out;
}

function jsAssets(outputDir) {
  const assets = path.join(outputDir, 'assets');
  if (!fs.existsSync(assets)) return [];
  return fs.readdirSync(assets)
    .filter((f) => f.endsWith('.js'))
    .map((f) => ({ file: `assets/${f}`, bytes: bytesOf(path.join(assets, f)) ?? 0 }))
    .sort((a, b) => b.bytes - a.bytes);
}

// Initial payload for one surface: entry HTML + shared CSS + transitive
// local JS + manifest + bank (bank only where the surface loads it:
// dashboard, explorer, course, assessment, and topic study context all do;
// the static index landing fetches nothing and carries HTML+CSS only).
function surfacePayload(outputDir, surface) {
  const parts = [];
  const add = (rel, bytes) => {
    if (bytes !== null && bytes !== undefined) parts.push({ file: rel, bytes });
  };
  add(ENTRY_HTML[surface] ?? '(worst topic page)', surface === 'topic' ? 0 : bytesOf(path.join(outputDir, ENTRY_HTML[surface])));
  add('style.css', bytesOf(path.join(outputDir, 'style.css')));
  const entry = ENTRY_MODULES[surface];
  if (entry) {
    for (const rel of localRuntimeClosure(outputDir, entry)) {
      add(rel, bytesOf(path.join(outputDir, rel)));
    }
  }
  if (surface !== 'index') {
    add('data/topic-manifest.json', bytesOf(path.join(outputDir, 'data/topic-manifest.json')));
    add('data/assessments.json', bytesOf(path.join(outputDir, 'data/assessments.json')));
  }
  if (surface === 'topic') {
    const pages = topicPages(outputDir);
    const worst = pages.reduce((m, p) => (p.bytes > (m?.bytes ?? -1) ? p : m), null);
    parts[0] = { file: worst ? `${worst.courseCode}/${worst.file}` : '(no topic pages)', bytes: worst ? worst.bytes : 0 };
  }
  const total = parts.reduce((a, p) => a + p.bytes, 0);
  return { surface, total, parts };
}

export function auditPerformance(outputDir = 'dist') {
  const results = [];
  const check = (key, actual, budget, detail, unit = ' bytes') => {
    results.push({
      key,
      actual,
      budget,
      pass: typeof actual === 'number' && actual <= budget,
      detail: detail ?? '',
      unit,
    });
  };

  const pages = topicPages(outputDir);
  const totalTopicHtml = pages.reduce((a, p) => a + p.bytes, 0);
  const largestTopics = [...pages].sort((a, b) => b.bytes - a.bytes).slice(0, 5);
  const maxTopic = largestTopics[0] ?? null;
  check('totalTopicHtmlBytes', totalTopicHtml, PERFORMANCE_BUDGETS.totalTopicHtmlBytes, `${pages.length} topic pages`);
  check('maxTopicPageBytes', maxTopic ? maxTopic.bytes : 0, PERFORMANCE_BUDGETS.maxTopicPageBytes, maxTopic ? `${maxTopic.courseCode}/${maxTopic.file}` : 'no topic pages');
  check('topicPageCount', pages.length, PERFORMANCE_BUDGETS.topicPageCount, 'all 432 topics must survive');
  // Count is exact: over is as wrong as under (missing or stray pages).
  const countResult = results[results.length - 1];
  countResult.pass = countResult.actual === countResult.budget;
  countResult.detail = `${pages.length} of ${PERFORMANCE_BUDGETS.topicPageCount} topic pages`;
  countResult.unit = '';

  check('sharedCssBytes', bytesOf(path.join(outputDir, 'style.css')) ?? 0, PERFORMANCE_BUDGETS.sharedCssBytes, 'style.css');

  const js = jsAssets(outputDir);
  const totalJs = js.reduce((a, f) => a + f.bytes, 0);
  check('totalJsBytes', totalJs, PERFORMANCE_BUDGETS.totalJsBytes, `${js.length} runtime modules`);
  check('maxJsFileBytes', js.length ? js[0].bytes : 0, PERFORMANCE_BUDGETS.maxJsFileBytes, js.length ? js[0].file : 'no js assets');
  check('runtimeModuleCount', js.length, PERFORMANCE_BUDGETS.runtimeModuleCount, 'shipped assets/*.js modules', '');

  check('manifestBytes', bytesOf(path.join(outputDir, 'data/topic-manifest.json')) ?? 0, PERFORMANCE_BUDGETS.manifestBytes, 'topic-manifest.json');
  check('bankBytes', bytesOf(path.join(outputDir, 'data/assessments.json')) ?? 0, PERFORMANCE_BUDGETS.bankBytes, 'assessments.json');

  let worstEntry = { file: '(none)', bytes: 0 };
  for (const page of ['dashboard.html', 'explorer.html', 'course.html', 'assessment.html', 'index.html']) {
    const size = bytesOf(path.join(outputDir, page)) ?? 0;
    if (size > worstEntry.bytes) worstEntry = { file: page, bytes: size };
  }
  check('maxEntryHtmlBytes', worstEntry.bytes, PERFORMANCE_BUDGETS.maxEntryHtmlBytes, worstEntry.file);

  const payloads = {};
  for (const surface of Object.keys(ENTRY_MODULES)) {
    const payload = surfacePayload(outputDir, surface);
    payloads[surface] = payload;
    check(
      `initialPayloadBytes:${surface}`,
      payload.total,
      PERFORMANCE_BUDGETS.initialPayloadBytes,
      payload.parts.map((p) => `${p.file.split('/').pop()}=${Math.round(p.bytes / 1024)}k`).join(' + ')
    );
  }

  const allFiles = [];
  const walk = (dir) => {
    for (const name of fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []) {
      const p = path.join(dir, name);
      if (fs.statSync(p).isDirectory()) walk(p);
      else allFiles.push({ file: path.relative(outputDir, p), bytes: fs.statSync(p).size });
    }
  };
  walk(outputDir);
  allFiles.sort((a, b) => b.bytes - a.bytes);
  const aggregates = { html: 0, css: 0, js: 0, json: 0, media: 0, other: 0 };
  for (const f of allFiles) {
    const ext = path.extname(f.file).toLowerCase();
    if (ext === '.html') aggregates.html += f.bytes;
    else if (ext === '.css') aggregates.css += f.bytes;
    else if (ext === '.js') aggregates.js += f.bytes;
    else if (ext === '.json') aggregates.json += f.bytes;
    else if (['.mp4', '.png', '.svg', '.webmanifest'].includes(ext)) aggregates.media += f.bytes;
    else aggregates.other += f.bytes;
  }

  const pass = results.every((r) => r.pass);
  return { pass, results, largestFiles: allFiles.slice(0, 10), largestTopics, aggregates, payloads };
}

export function formatBudgetReport(audit) {
  const kb = (n) => `${(n / 1024).toFixed(1)}KB`;
  const lines = ['# Performance budget audit', ''];
  for (const r of audit.results) {
    lines.push(`- [${r.pass ? 'PASS' : 'FAIL'}] ${r.key}: ${r.actual}${r.unit ?? ' bytes'} (budget ${r.budget})${r.detail ? ` — ${r.detail}` : ''}`);
  }
  lines.push('', '## Largest files', '');
  for (const f of audit.largestFiles) lines.push(`- ${kb(f.bytes)} ${f.file}`);
  lines.push('', '## Largest topic pages', '');
  for (const t of audit.largestTopics) lines.push(`- ${kb(t.bytes)} ${t.courseCode}/${t.file}`);
  lines.push('', '## Aggregates', '');
  for (const [kind, bytes] of Object.entries(audit.aggregates)) lines.push(`- ${kind}: ${kb(bytes)}`);
  lines.push('');
  return `${lines.join('\n')}\n`;
}

const isMain = process.argv[1] && process.argv[1].endsWith('performance-budget.js');
if (isMain) {
  const dirIndex = process.argv.indexOf('--dir');
  const outputDir = dirIndex !== -1 && process.argv[dirIndex + 1] ? process.argv[dirIndex + 1] : 'dist';
  const audit = auditPerformance(outputDir);
  process.stdout.write(formatBudgetReport(audit));
  if (!audit.pass) {
    console.error('performance budgets breached — see FAIL lines above');
    process.exit(1);
  }
}
