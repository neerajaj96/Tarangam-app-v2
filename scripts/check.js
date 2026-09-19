/**
 * Tarangam content QA gate — zero dependencies, runs in CI before build.
 * Fails (exit 1) on broken dashboard links, malformed quizzes, duplicate
 * slugs/anchors, and curriculum/content mismatches against
 * data/curriculum.json. Orphan videos are warnings only.
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFileSync } from 'child_process';
import { SCENE_IDS } from './scenes.js';
import {
  CURRICULUM_PATH,
  loadCurriculum,
  CURRICULUM_READ_ERROR,
  CURRICULUM_PARSE_ERROR,
  CURRICULUM_SHAPE_ERROR,
} from './curriculum.js';
import {
  TOPIC_SCHEMA_PATH,
  TOPIC_METADATA_EXAMPLE_PATH,
  loadTopicSchema,
  loadTopicMetadata,
  validateTopicMetadata,
  collectTopicMetadataCoverage,
  formatCoverageSummary,
} from './topic-metadata.js';
import {
  buildTopicGraph,
  analyzeTopicGraph,
  formatGraphReport,
} from './topic-graph.js';
import {
  buildTopicManifestFromGraph,
  validateTopicManifest,
  formatManifestSummary,
} from './topic-manifest.js';

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// 0. Curriculum/content consistency against data/curriculum.json
// (canonical source — no hardcoded fallback), loaded via the shared
// scripts/curriculum.js loader. Loader failures are collected as QA
// failures through the mechanism below, never thrown. Every failure names
// the course code, the affected file/directory, and expected vs actual.
let curriculumDoc = null;
try {
  curriculumDoc = loadCurriculum();
} catch (err) {
  if (err && err.code === CURRICULUM_READ_ERROR) {
    fail(`curriculum: cannot read ${CURRICULUM_PATH} (${err.cause && err.cause.message}) — expected the canonical curriculum file to exist`);
  } else if (err && err.code === CURRICULUM_PARSE_ERROR) {
    fail(`curriculum: cannot parse ${CURRICULUM_PATH} (${err.cause && err.cause.message}) — expected valid JSON`);
  } else if (err && err.code === CURRICULUM_SHAPE_ERROR) {
    fail(`curriculum: ${CURRICULUM_PATH} must contain a top-level "curriculum" object and a "dashboardOrder" array — actual: missing or wrong type`);
  } else {
    fail(`curriculum: unexpected error loading ${CURRICULUM_PATH} (${err && err.message})`);
  }
  curriculumDoc = null;
}

if (curriculumDoc !== null) {
  const curriculum = curriculumDoc.curriculum;
  const contentDirs = fs.readdirSync('content').filter((d) => fs.statSync(path.join('content', d)).isDirectory());

  // 0a. Course consistency.
  const seenCodes = new Map(); // lowercased code -> first-seen key
  for (const code of Object.keys(curriculum)) {
    const entry = curriculum[code];
    if (!entry || typeof entry !== 'object') {
      fail(`curriculum: course "${code}" entry is malformed in ${CURRICULUM_PATH} — expected an object with code/name/modules`);
      continue;
    }
    if (entry.code !== code) {
      fail(`curriculum: course key "${code}" does not match entry.code "${entry.code}" in ${CURRICULUM_PATH} — expected identical codes (possible duplicate/misplaced entry)`);
    }
    const folded = code.toLowerCase();
    if (seenCodes.has(folded)) {
      fail(`curriculum: duplicate course code "${code}" collides with "${seenCodes.get(folded)}" in ${CURRICULUM_PATH} (case-insensitive match) — expected unique codes`);
    } else {
      seenCodes.set(folded, code);
    }
    // Every curriculum course expected to have content must have its directory.
    const expectedDir = entry.contentDir || path.join('content', code);
    if (!fs.existsSync(expectedDir) || !fs.statSync(expectedDir).isDirectory()) {
      fail(`curriculum: course "${code}" expects content directory ${expectedDir} (from ${CURRICULUM_PATH}) — actual: directory missing`);
    }
  }
  // Duplicate `order` values across courses.
  const seenOrders = new Map();
  for (const code of Object.keys(curriculum)) {
    const order = curriculum[code] && curriculum[code].order;
    if (order === undefined) continue;
    if (seenOrders.has(order)) {
      fail(`curriculum: courses "${seenOrders.get(order)}" and "${code}" share order ${order} in ${CURRICULUM_PATH} — expected unique ordering`);
    } else {
      seenOrders.set(order, code);
    }
  }
  // Every content directory must be listed in the curriculum.
  for (const dir of contentDirs) {
    if (!Object.prototype.hasOwnProperty.call(curriculum, dir)) {
      fail(`curriculum: content/${dir}/ has no entry in ${CURRICULUM_PATH} — expected every content course to be listed (actual: unlisted)`);
    }
  }

  // 0b. Module consistency + topic counts.
  for (const code of Object.keys(curriculum)) {
    const entry = curriculum[code];
    if (!entry || typeof entry !== 'object' || !Array.isArray(entry.modules)) {
      fail(`curriculum: course "${code}" has no "modules" array in ${CURRICULUM_PATH} — expected a module list`);
      continue;
    }
    const seenNums = new Map();
    const seenNames = new Map();
    for (const m of entry.modules) {
      if (!m || typeof m !== 'object' || typeof m.number !== 'number' || !m.name || typeof m.name !== 'string') {
        fail(`curriculum: course "${code}" has a malformed module entry ${JSON.stringify(m)} in ${CURRICULUM_PATH} — expected {number: <int>, name: <string>}`);
        continue;
      }
      if (seenNums.has(m.number)) {
        fail(`curriculum: course "${code}" has duplicate module number ${m.number} ("${seenNums.get(m.number)}" vs "${m.name}") in ${CURRICULUM_PATH} — expected unique module numbers`);
      } else {
        seenNums.set(m.number, m.name);
      }
      const foldedName = m.name.toLowerCase();
      if (seenNames.has(foldedName)) {
        fail(`curriculum: course "${code}" has duplicate module name "${m.name}" (modules ${seenNames.get(foldedName)} and ${m.number}) in ${CURRICULUM_PATH} — expected unique module names`);
      } else {
        seenNames.set(foldedName, m.number);
      }
    }
    // Module-number set the build resolves names from (mirrors build.js).
    const resolvable = new Set(entry.modules
      .filter((m) => m && typeof m.number === 'number')
      .map((m) => m.number));
    const dir = path.join('content', code);
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
    for (const f of files) {
      const mm = f.match(/^m(\d+)_/);
      if (!mm) continue; // naming-convention check (2a) owns this case
      const modNum = parseInt(mm[1], 10);
      if (!resolvable.has(modNum)) {
        fail(`curriculum: ${dir}/${f} references module ${modNum} — expected one of [${[...resolvable].sort((a, b) => a - b).join(', ')}] for course "${code}" in ${CURRICULUM_PATH} (actual: unresolvable module number)`);
      }
    }
    // Topic counts: actual .md files vs canonical topicCount (never auto-fixed).
    if (typeof entry.topicCount !== 'number') {
      fail(`curriculum: course "${code}" has no numeric "topicCount" in ${CURRICULUM_PATH} — expected a number matching content/${code}/*.md`);
    } else if (files.length !== entry.topicCount) {
      fail(`curriculum: course "${code}" topicCount is ${entry.topicCount} in ${CURRICULUM_PATH} but content/${code}/ holds ${files.length} .md files — expected equal counts (update the JSON by hand, it is never auto-modified)`);
    }
  }

  // 0c. Dashboard order: each curriculum course exactly once, no unknown codes.
  const orderCounts = new Map();
  for (const c of curriculumDoc.dashboardOrder) orderCounts.set(c, (orderCounts.get(c) || 0) + 1);
  for (const [c, n] of orderCounts) {
    if (n > 1) fail(`curriculum: dashboardOrder lists "${c}" ${n} times in ${CURRICULUM_PATH} — expected exactly once`);
    if (!Object.prototype.hasOwnProperty.call(curriculum, c)) {
      fail(`curriculum: dashboardOrder lists unknown course "${c}" in ${CURRICULUM_PATH} — expected a code present in "curriculum"`);
    }
  }
  for (const code of Object.keys(curriculum)) {
    if (!orderCounts.has(code)) {
      fail(`curriculum: course "${code}" is missing from dashboardOrder in ${CURRICULUM_PATH} — expected every curriculum course to appear exactly once`);
    }
  }
}

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
    // 2d2. No widget may open inside another widget's body (nesting breaks
    // the line-based widget parsers); back-to-back ::: closers betray it.
    if (/^:::\n:::/m.test(t)) {
      fail(`${course}/${f}: consecutive ::: closers — a widget is likely nested inside another`);
    }

    // 2e. Anim scene ids must exist in the registry (scripts/scenes.js).
    for (const m of t.matchAll(/::: anim (\S+)/g)) {
      if (!SCENE_IDS.includes(m[1])) fail(`${course}/${f}: unknown anim scene '${m[1]}' (registry: ${SCENE_IDS.join(', ')})`);
    }
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

// 5. Inline <script> syntax gate: every template script block must parse
// (Jinja placeholders stubbed out). Catches keyboard/touch/quiz JS regressions.
{
  const tpl = fs.readFileSync('templates/base.html', 'utf-8');
  const blocks = [...tpl.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (!blocks.length) fail('templates/base.html: no inline scripts found');
  const stubbed = blocks
    .map((s) => s.replace(/\{%[\s\S]*?%\}/g, '').replace(/\{\{[\s\S]*?\}\}/g, '0'))
    .join('\n;\n');
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tarangam-check-')), 'inline.js');
  fs.writeFileSync(tmp, stubbed, 'utf-8');
  try {
    execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' });
  } catch (e) {
    fail('templates/base.html inline JS syntax error: ' + (e.stderr || e.message || e).toString().slice(0, 500));
  }
}

// 6. Topic metadata fixture validation + coverage report (migration is
// still opt-in: only topics carrying a front-matter block are validated).
// Loading, validation, and coverage live in scripts/topic-metadata.js;
// the checker only maps loader failures, collects invalid-topic errors
// as QA failures, and prints the concise coverage summary.
{
  let schema = null;
  let fixture = null;
  let schemaOk = false;
  let fixtureOk = false;
  try {
    schema = loadTopicSchema();
    schemaOk = true;
  } catch (e) {
    fail(`topic-schema: cannot read/parse ${TOPIC_SCHEMA_PATH} (${(e.cause && e.cause.message) || e.message}) — expected the canonical topic metadata schema`);
  }
  try {
    fixture = loadTopicMetadata();
    fixtureOk = true;
  } catch (e) {
    fail(`topic-metadata: cannot read/parse ${TOPIC_METADATA_EXAMPLE_PATH} (${(e.cause && e.cause.message) || e.message}) — expected a valid example topic object`);
  }
  if (schemaOk && fixtureOk) {
    for (const e of validateTopicMetadata(fixture, {
      schema,
      curriculumDoc,
      label: `topic-metadata: ${TOPIC_METADATA_EXAMPLE_PATH}`,
    })) fail(e);
  }
  // Coverage scan: invalid front-matter fails, metadata-less topics remain
  // valid, and the migration baseline is printed on every check run.
  if (schemaOk) {
    const coverage = collectTopicMetadataCoverage({ schema, curriculumDoc });
    for (const item of coverage.invalid) {
      for (const e of item.errors) fail(e);
    }
    console.log(formatCoverageSummary(coverage));
  }
}

// 7. Topic knowledge-graph integrity (scripts/topic-graph.js): missing,
// self, and circular prerequisites fail; cross-course, later-sequence,
// and orphan findings are warnings only. Prints a concise report.
{
  let graphSchema = null;
  try {
    graphSchema = loadTopicSchema();
  } catch {
    graphSchema = null; // section 6 already reports schema load failures
  }
  if (graphSchema && curriculumDoc) {
    const graph = buildTopicGraph({ curriculumDoc, schema: graphSchema });
    for (const item of graph.metadataErrors) {
      for (const e of item.errors) fail(e);
    }
    const analysis = analyzeTopicGraph(graph);
    for (const e of analysis.errors) fail(`topic-graph: ${e}`);
    for (const w of analysis.warnings) warn(`topic-graph: ${w}`);
    for (const line of formatGraphReport(analysis)) console.log(line);
    // 8. Topic manifest integrity (scripts/topic-manifest.js): same graph,
    // no rebuild. Fails on structural problems, edge disagreement, and
    // drift from the known migration baseline (432 topics, 14 metadata).
    if (analysis.errors.length === 0) {
      const manifest = buildTopicManifestFromGraph(graph, analysis, { curriculumDoc });
      for (const e of validateTopicManifest(manifest, { graph })) fail(`topic-manifest: ${e}`);
      if (manifest.aggregates.totalTopics !== 432) {
        fail(`topic-manifest: expected 432 topics (migration baseline) — actual: ${manifest.aggregates.totalTopics}`);
      }
      if (manifest.aggregates.metadataTopics !== 187) {
        fail(`topic-manifest: expected 187 metadata topics (migration baseline) — actual: ${manifest.aggregates.metadataTopics}`);
      }
      console.log(formatManifestSummary(manifest));
    }
  }
}

// 9. Curriculum explorer wiring: the page, its JS modules, and the
// published manifest must all exist and reference each other, in source
// and (when present) in dist/.
{
  for (const f of ['explorer.html', 'dashboard.html', 'assets/curriculum-data.js', 'assets/explorer.js', 'assets/dashboard.js', 'assets/learner-state.js', 'assets/learner-path.js', 'scripts/learner-path.js', 'style.css']) {
    if (!fs.existsSync(f)) fail(`explorer: expected source file ${f} — actual: missing`);
  }
  if (fs.existsSync('explorer.html')) {
    const html = fs.readFileSync('explorer.html', 'utf-8');
    for (const ref of ['assets/explorer.js', 'style.css']) {
      if (!html.includes(ref)) fail(`explorer: explorer.html does not reference ${ref}`);
    }
  }
  if (fs.existsSync('assets/explorer.js')) {
    const js = fs.readFileSync('assets/explorer.js', 'utf-8');
    if (!js.includes('curriculum-data.js')) fail('explorer: assets/explorer.js does not import the curriculum data module');
    if (!js.includes('learner-state.js')) fail('explorer: assets/explorer.js does not import the learner-state module');
  }
  if (fs.existsSync('templates/base.html')) {
    const tpl = fs.readFileSync('templates/base.html', 'utf-8');
    if (!tpl.includes('assets/learner-state.js')) fail('explorer: templates/base.html does not connect topic pages to the learner-state module');
  }
  if (fs.existsSync('assets/dashboard.js')) {
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    if (!js.includes('learner-state.js')) fail('explorer: assets/dashboard.js does not import the learner-state module');
    if (!js.includes('curriculum-data.js')) fail('explorer: assets/dashboard.js does not import the curriculum data module');
  }
  if (fs.existsSync('index.html')) {
    const home = fs.readFileSync('index.html', 'utf-8');
    if (!home.includes('dashboard.html')) fail('explorer: index.html has no visible Dashboard entry');
  }
  if (fs.existsSync('dist')) {
    for (const f of ['dist/explorer.html', 'dist/dashboard.html', 'dist/assets/curriculum-data.js', 'dist/assets/explorer.js', 'dist/assets/dashboard.js', 'dist/assets/learner-state.js', 'dist/assets/learner-path.js', 'dist/data/topic-manifest.json']) {
      if (!fs.existsSync(f)) fail(`explorer: expected built file ${f} — actual: missing (run npm run build:notes)`);
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
