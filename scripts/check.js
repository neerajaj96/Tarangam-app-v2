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
      if (manifest.aggregates.metadataTopics !== 432) {
        fail(`topic-manifest: expected 432 metadata topics (migration baseline) — actual: ${manifest.aggregates.metadataTopics}`);
      }
      console.log(formatManifestSummary(manifest));
    }
  }
}

// 9. Curriculum explorer wiring: the page, its JS modules, and the
// published manifest must all exist and reference each other, in source
// and (when present) in dist/.
{
  for (const f of ['explorer.html', 'dashboard.html', 'assessment.html', 'data/assessments.json', 'assets/curriculum-data.js', 'assets/explorer.js', 'assets/dashboard.js', 'assets/assessment.js', 'assets/assessment-page.js', 'assets/learner-state.js', 'assets/learner-path.js', 'assets/topic-intelligence.js', 'assets/topic-study-context.js', 'assets/learning-journey.js', 'assets/exam-readiness.js', 'assets/revision.js', 'assets/learning-analytics.js', 'assets/study-planner.js', 'scripts/learner-path.js', 'scripts/topic-intelligence.js', 'scripts/learning-journey.js', 'scripts/exam-readiness.js', 'scripts/revision.js', 'scripts/learning-analytics.js', 'scripts/study-planner.js', 'scripts/assessment.js', 'style.css']) {
    if (!fs.existsSync(f)) fail(`explorer: expected source file ${f} — actual: missing`);
  }
  if (fs.existsSync('assessment.html')) {
    const html = fs.readFileSync('assessment.html', 'utf-8');
    for (const ref of ['assets/assessment-page.js', 'style.css', 'id="as-questions"']) {
      if (!html.includes(ref)) fail(`assessment: assessment.html does not reference ${ref}`);
    }
  }
  if (fs.existsSync('explorer.html')) {
    const html = fs.readFileSync('explorer.html', 'utf-8');
    for (const ref of ['assets/explorer.js', 'style.css', 'id="xp-journey"']) {
      if (!html.includes(ref)) fail(`explorer: explorer.html does not reference ${ref}`);
    }
  }
  if (fs.existsSync('dashboard.html')) {
    const html = fs.readFileSync('dashboard.html', 'utf-8');
    for (const ref of ['id="db-analytics"', 'id="db-continue"', 'id="db-exam"', 'id="db-review"', 'id="db-plan"', 'id="db-assessment"', 'id="db-progress-list"', 'id="db-ready-list"', 'id="db-recent-list"']) {
      if (!html.includes(ref)) fail(`journey: dashboard.html is missing unified journey section ${ref}`);
    }
  }
  if (fs.existsSync('explorer.html')) {
    const html = fs.readFileSync('explorer.html', 'utf-8');
    if (!html.includes('id="xp-examview"')) fail('exam: explorer.html is missing the exam-readiness view filter (xp-examview)');
    if (!html.includes('id="xp-review"')) fail('review: explorer.html is missing the revision view filter (xp-review)');
    if (!html.includes('id="xp-assessment"')) fail('assessment: explorer.html is missing the assessment view filter (xp-assessment)');
  }
  if (fs.existsSync('assets/explorer.js')) {
    const js = fs.readFileSync('assets/explorer.js', 'utf-8');
    if (!js.includes('curriculum-data.js')) fail('explorer: assets/explorer.js does not import the curriculum data module');
    if (!js.includes('learner-state.js')) fail('explorer: assets/explorer.js does not import the learner-state module');
    if (!js.includes('learning-journey.js')) fail('journey: assets/explorer.js does not use the unified learning journey model');
    if (!js.includes('tarangam:progress-changed') && !js.includes('PROGRESS_CHANGED_EVENT') && !js.includes('onJourneyProgressChanged')) fail('journey: assets/explorer.js does not sync on the unified progress event');
  }
  if (fs.existsSync('templates/base.html')) {
    const tpl = fs.readFileSync('templates/base.html', 'utf-8');
    if (!tpl.includes('assets/learner-state.js')) fail('explorer: templates/base.html does not connect topic pages to the learner-state module');
    if (!tpl.includes('id="tsStudyContext"')) fail('study-context: templates/base.html has no study-context mount — topic pages cannot initialize the intelligence panel');
    if (!tpl.includes('assets/topic-study-context.js')) fail('study-context: templates/base.html does not load the topic study-context module');
    if (!tpl.includes('tarangam:progress-changed')) fail('journey: templates/base.html does not use the unified progress event');
  }
  if (fs.existsSync('assets/dashboard.js')) {
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    if (!js.includes('learner-state.js')) fail('explorer: assets/dashboard.js does not import the learner-state module');
    if (!js.includes('curriculum-data.js')) fail('explorer: assets/dashboard.js does not import the curriculum data module');
    if (!js.includes('learning-journey.js')) fail('journey: assets/dashboard.js does not use the unified learning journey model');
    if (!js.includes('tarangam:progress-changed') && !js.includes('PROGRESS_CHANGED_EVENT') && !js.includes('onJourneyProgressChanged')) fail('journey: assets/dashboard.js does not sync on the unified progress event');
  }
  if (fs.existsSync('assets/topic-study-context.js')) {
    const js = fs.readFileSync('assets/topic-study-context.js', 'utf-8');
    if (!js.includes('learning-journey.js')) fail('journey: assets/topic-study-context.js does not use the unified learning journey model');
    if (!js.includes('Unlocked by completing')) fail('journey: assets/topic-study-context.js does not surface unlocked dependents');
  }
  if (fs.existsSync('index.html')) {
    const home = fs.readFileSync('index.html', 'utf-8');
    if (!home.includes('dashboard.html')) fail('explorer: index.html has no visible Dashboard entry');
  }
  if (fs.existsSync('dist')) {
    for (const f of ['dist/explorer.html', 'dist/dashboard.html', 'dist/assessment.html', 'dist/course.html', 'dist/manifest.webmanifest', 'dist/sw.js', 'dist/offline.html', 'dist/icons/icon-192.png', 'dist/icons/icon-512.png', 'dist/assets/curriculum-data.js', 'dist/assets/explorer.js', 'dist/assets/dashboard.js', 'dist/assets/assessment.js', 'dist/assets/assessment-page.js', 'dist/assets/learner-state.js', 'dist/assets/learner-path.js', 'dist/assets/topic-intelligence.js', 'dist/assets/topic-study-context.js', 'dist/assets/learning-journey.js', 'dist/assets/exam-readiness.js', 'dist/assets/revision.js', 'dist/assets/learning-analytics.js', 'dist/assets/study-planner.js', 'dist/data/topic-manifest.json', 'dist/data/assessments.json']) {
      if (!fs.existsSync(f)) fail(`explorer: expected built file ${f} — actual: missing (run npm run build:notes)`);
    }
  }
  if (fs.existsSync('assets/dashboard.js')) {
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    if (!js.includes('buildDashboardAssessmentModel') && !js.includes('assessment.js')) fail('assessment: assets/dashboard.js does not use the canonical assessment module');
    if (!js.includes('db-assessment') && !js.includes('renderAssessment')) fail('assessment: assets/dashboard.js does not render the assessment section');
    if (!js.includes('getAssessmentQuestionCount')) fail('assessment: assets/dashboard.js does not surface total questions via getAssessmentQuestionCount');
    if (!js.includes('getExamQuestionCoverage')) fail('assessment: assets/dashboard.js does not surface exam-relevant coverage via getExamQuestionCoverage');
    if (!js.includes('getQuestionTypeDistribution')) fail('assessment: assets/dashboard.js does not surface type distribution via getQuestionTypeDistribution');
  }
  if (fs.existsSync('assets/explorer.js')) {
    const js = fs.readFileSync('assets/explorer.js', 'utf-8');
    if (!js.includes('filterTopicsByAssessment') && !js.includes('assessment.js')) fail('assessment: assets/explorer.js does not use the canonical assessment module');
    if (!js.includes('getExplorerAssessmentCoverage')) fail('assessment: assets/explorer.js does not expose coverage indicators via getExplorerAssessmentCoverage');
    if (!js.includes('getAssessmentCoverage') && !js.includes('getExamQuestionCoverage')) fail('assessment: assets/explorer.js does not use the deterministic coverage APIs');
  }
  if (fs.existsSync('assets/topic-study-context.js')) {
    const js = fs.readFileSync('assets/topic-study-context.js', 'utf-8');
    if (!js.includes('ts-assessment') && !js.includes('Assessment not available')) fail('assessment: assets/topic-study-context.js does not surface assessment state');
  }
  if (fs.existsSync('assets/learning-journey.js')) {
    const js = fs.readFileSync('assets/learning-journey.js', 'utf-8');
    if (!js.includes('buildAssessmentSummary')) fail('assessment: assets/learning-journey.js does not expose assessment state');
  }
  if (fs.existsSync('assets/dashboard.js')) {
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    if (!js.includes('buildStudyPlan') && !js.includes('study-planner.js')) fail('planner: assets/dashboard.js does not use the canonical study planner');
    if (!js.includes('db-plan') && !js.includes('renderPlan')) fail('planner: assets/dashboard.js does not render the study plan section');
  }
  if (fs.existsSync('assets/explorer.js')) {
    const js = fs.readFileSync('assets/explorer.js', 'utf-8');
    if (!js.includes('In study plan') && !js.includes('study-planner.js')) fail('planner: assets/explorer.js does not surface the study plan');
  }
  if (fs.existsSync('assets/topic-study-context.js')) {
    const js = fs.readFileSync('assets/topic-study-context.js', 'utf-8');
    if (!js.includes('ts-plan') && !js.includes('study-planner.js')) fail('planner: assets/topic-study-context.js does not surface plan membership');
  }
  if (fs.existsSync('assets/learning-journey.js')) {
    const js = fs.readFileSync('assets/learning-journey.js', 'utf-8');
    if (!js.includes('buildStudyPlan')) fail('planner: assets/learning-journey.js does not expose the study plan');
  }
  if (fs.existsSync('assets/dashboard.js')) {
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    if (!js.includes('buildLearningAnalytics') && !js.includes('learning-analytics.js')) fail('analytics: assets/dashboard.js does not use the canonical analytics module');
    if (!js.includes('db-analytics') && !js.includes('renderAnalytics')) fail('analytics: assets/dashboard.js does not render the analytics section');
  }
  if (fs.existsSync('assets/explorer.js')) {
    const js = fs.readFileSync('assets/explorer.js', 'utf-8');
    if (!js.includes('getExplorerCourseAnalytics') && !js.includes('learning-analytics.js')) fail('analytics: assets/explorer.js does not use the canonical analytics module');
  }
  if (fs.existsSync('assets/topic-study-context.js')) {
    const js = fs.readFileSync('assets/topic-study-context.js', 'utf-8');
    if (!js.includes('buildTopicAnalyticsContribution')) fail('analytics: assets/topic-study-context.js does not surface the analytics contribution');
  }
  if (fs.existsSync('assets/learning-journey.js')) {
    const js = fs.readFileSync('assets/learning-journey.js', 'utf-8');
    if (!js.includes('buildLearningAnalytics')) fail('analytics: assets/learning-journey.js does not expose the analytics object');
  }
  if (fs.existsSync('assets/dashboard.js')) {
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    if (!js.includes('exam-readiness.js') && !js.includes('buildExamReadiness')) fail('exam: assets/dashboard.js does not use the exam readiness layer');
    if (!js.includes('db-exam')) fail('exam: assets/dashboard.js does not render the exam readiness section');
  }
  if (fs.existsSync('assets/explorer.js')) {
    const js = fs.readFileSync('assets/explorer.js', 'utf-8');
    if (!js.includes('filterTopicsByExam') && !js.includes('exam-readiness.js')) fail('exam: assets/explorer.js does not use the exam readiness layer');
  }
  if (fs.existsSync('assets/topic-study-context.js')) {
    const js = fs.readFileSync('assets/topic-study-context.js', 'utf-8');
    if (!js.includes('Exam readiness')) fail('exam: assets/topic-study-context.js does not surface exam readiness');
    if (!js.includes('Review status')) fail('review: assets/topic-study-context.js does not surface review status');
  }
  if (fs.existsSync('assets/dashboard.js')) {
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    if (!js.includes('db-review') && !js.includes('renderReview')) fail('review: assets/dashboard.js does not render the review section');
  }
  if (fs.existsSync('assets/explorer.js')) {
    const js = fs.readFileSync('assets/explorer.js', 'utf-8');
    if (!js.includes('filterTopicsByReview') && !js.includes('revision.js')) fail('review: assets/explorer.js does not use the revision layer');
  }
}

// 10. Unified learning journey integrity: single deterministic engine over
// the canonical intelligence layer — no AI/ML, no gamification, no second
// graph, no server. Static/GitHub Pages compatible (no fetch in the model,
// no polling for sync).
{
  if (fs.existsSync('assets/learning-journey.js')) {
    const js = fs.readFileSync('assets/learning-journey.js', 'utf-8');
    for (const token of ['continue_in_progress', 'unblocks_future_topic', 'ready_curriculum_order', 'curriculum_fallback']) {
      if (!js.includes(token)) fail(`journey: assets/learning-journey.js is missing reason "${token}"`);
    }
    for (const banned of ['fetch(', 'XMLHttpRequest', 'setInterval', 'setTimeout', 'xp', 'streak', 'badge', 'leaderboard', 'openai', 'llm']) {
      if (banned === 'xp' || banned === 'badge') continue; // substrings of legit identifiers; checked below precisely
      if (js.toLowerCase().includes(banned)) fail(`journey: assets/learning-journey.js must stay static-first (found "${banned}")`);
    }
    if (/[<>=]\s*points|streaks|leaderboards|openai|anthropic/i.test(js)) {
      fail('journey: assets/learning-journey.js must not add AI/ML or gamification');
    }
    if (!js.includes("from './topic-intelligence.js'")) fail('journey: assets/learning-journey.js must build on the canonical Topic Intelligence Layer');
  }
}

// 11. Deterministic exam readiness layer: pure math over existing
// examRelevance metadata — no AI/ML, no predictions, no gamification, no
// backend, no second recommendation engine, no curriculum changes.
{
  if (!fs.existsSync('assets/exam-readiness.js')) {
    fail('exam: expected source file assets/exam-readiness.js — actual: missing');
  } else {
    const js = fs.readFileSync('assets/exam-readiness.js', 'utf-8');
    for (const token of ['buildExamReadiness', 'getNextExamTopic', 'getExamGaps', 'explainExamContribution', 'readinessPercent']) {
      if (!js.includes(token)) fail(`exam: assets/exam-readiness.js is missing "${token}"`);
    }
    if (!js.includes("from './topic-intelligence.js'")) fail('exam: assets/exam-readiness.js must build on the canonical Topic Intelligence Layer');
    if (!js.includes('high') || !js.includes('medium') || !js.includes('low')) fail('exam: assets/exam-readiness.js must document the high/medium/low weighting');
    for (const banned of ['fetch(', 'XMLHttpRequest', 'setInterval', 'openai', 'anthropic', 'streak', 'leaderboard']) {
      if (js.toLowerCase().includes(banned)) fail(`exam: assets/exam-readiness.js must stay deterministic and static-first (found "${banned}")`);
    }
    if (/predict(s|ed|ive|ion)?\s+(score|grade|exam\s+score|model)/i.test(js)) fail('exam: assets/exam-readiness.js must not add predictive exam scores');
// 12. Deterministic revision & review layer: pure timestamp math over
// existing state — no AI/ML, no retention predictions, no gamification,
// no backend, no second recommendation engine.
{
  if (!fs.existsSync('assets/revision.js')) {
    fail('review: expected source file assets/revision.js — actual: missing');
  } else {
    const js = fs.readFileSync('assets/revision.js', 'utf-8');
    for (const token of ['REVIEW_DUE_DAYS', 'REVIEW_OVERDUE_DAYS', 'buildRevisionModel', 'getNextReviewTopic', 'filterTopicsByReview', 'explainReviewReason']) {
      if (!js.includes(token)) fail(`review: assets/revision.js is missing "${token}"`);
    }
    if (!js.includes("from './topic-intelligence.js'")) fail('review: assets/revision.js must build on the canonical Topic Intelligence Layer');
    for (const banned of ['fetch(', 'XMLHttpRequest', 'setInterval', 'openai', 'anthropic', 'streak', 'leaderboard']) {
      if (js.toLowerCase().includes(banned)) fail(`review: assets/revision.js must stay deterministic and static-first (found "${banned}")`);
    }
    if (/retention\s+model|forgetting\s+curve\s+fit|predict\w*\s+(retention|recall|memory)/i.test(js)) fail('review: assets/revision.js must not add predictive retention models');
    if (/xps\b|experience points/i.test(js)) fail('review: assets/revision.js must not add gamification');
  }
}

// 12. Canonical deterministic learning analytics layer: descriptive math
// over recorded facts — no AI/ML, no prediction, no mastery scores, no
// gamification, no backend, no second recommendation engine.
{
  if (!fs.existsSync('assets/learning-analytics.js')) {
    fail('analytics: expected source file assets/learning-analytics.js — actual: missing');
  } else {
    const js = fs.readFileSync('assets/learning-analytics.js', 'utf-8');
    for (const token of ['buildLearningAnalytics', 'getCourseAnalytics', 'getModuleAnalytics', 'getCoverageAreas', 'buildTopicAnalyticsContribution', 'getTopicDescriptiveState']) {
      if (!js.includes(token)) fail(`analytics: assets/learning-analytics.js is missing "${token}"`);
    }
    if (!js.includes("from './topic-intelligence.js'")) fail('analytics: assets/learning-analytics.js must build on the canonical Topic Intelligence Layer');
    for (const banned of ['fetch(', 'XMLHttpRequest', 'setInterval', 'openai', 'anthropic', 'streak', 'leaderboard']) {
      if (js.toLowerCase().includes(banned)) fail(`analytics: assets/learning-analytics.js must stay descriptive and static-first (found "${banned}")`);
    }
    if (/\bmastery[A-Z_]|["']mastery["']\s*:|mastery\s*=\s*\d/i.test(js)) fail('analytics: assets/learning-analytics.js must not add artificial mastery scores');
    if (/predict\w*\s+(score|retention|grade|exam\s+score|model)/i.test(js)) fail('analytics: assets/learning-analytics.js must not add predictions');
    if (/\bxp\b|\blevels\b.*streak|experience points/i.test(js)) fail('analytics: assets/learning-analytics.js must not add gamification');
  }
}

// 13. Canonical deterministic study planning layer: arithmetic over an
// explicit target plus recorded facts — no AI/ML, no behavioural or
// retention prediction, no gamification, no backend, no second
// recommendation engine.
{
  if (!fs.existsSync('assets/study-planner.js')) {
    fail('planner: expected source file assets/study-planner.js — actual: missing');
  } else {
    const js = fs.readFileSync('assets/study-planner.js', 'utf-8');
    for (const token of ['buildStudyPlan', 'normalizePlanConfig', 'savePlanConfig', 'loadPlanConfig', 'getTopicPlanDay', 'PLAN_CONFIG_KEY']) {
      if (!js.includes(token)) fail(`planner: assets/study-planner.js is missing "${token}"`);
    }
    if (!js.includes("from './topic-intelligence.js'")) fail('planner: assets/study-planner.js must build on the canonical Topic Intelligence Layer');
    for (const banned of ['fetch(', 'XMLHttpRequest', 'setInterval', 'openai', 'anthropic', 'streak', 'leaderboard']) {
      if (js.toLowerCase().includes(banned)) fail(`planner: assets/study-planner.js must stay deterministic and static-first (found "${banned}")`);
    }
    if (/predict\w*\s+(behaviour|behavior|retention|recall|success|score)/i.test(js)) fail('planner: assets/study-planner.js must not predict learner behaviour');
    if (/\bxp\b|experience points|\blevels\b.*streak/i.test(js)) fail('planner: assets/study-planner.js must not add gamification');
  }
}

// 14. Canonical deterministic assessment & knowledge verification layer:
// static question bank plus exact evaluation — no AI/LLMs, no semantic
// grading, no generated questions, no backend, no gamification, no mastery
// scores, no second recommendation engine.
{
  let assessmentBank = null;
  try {
    assessmentBank = JSON.parse(fs.readFileSync(path.join('data', 'assessments.json'), 'utf-8'));
  } catch (e) {
    fail(`assessment: cannot read/parse data/assessments.json (${(e.cause && e.cause.message) || e.message}) — expected the canonical question bank`);
  }
  if (assessmentBank !== null) {
    if (!fs.existsSync('assets/assessment.js')) {
      fail('assessment: expected source file assets/assessment.js — actual: missing');
    } else {
      const js = fs.readFileSync('assets/assessment.js', 'utf-8');
      for (const token of ['validateAssessmentBank', 'createAssessmentSession', 'evaluateAnswer', 'scoreSession', 'recordAttempt', 'getTopicAssessmentState', 'buildAssessmentSummary', 'PASS_THRESHOLD', 'acceptedAnswers', 'getShortAnswerVariants', 'getAssessmentQuestionCount', 'getCoveredTopics', 'getUncoveredTopics', 'getQuestionsPerCourse', 'getCoveredTopicsPerCourse', 'getQuestionsPerModule', 'getSingleQuestionTopics', 'getMultiQuestionTopics', 'getExamQuestionCoverage', 'getQuestionTypeDistribution', 'getTopicQuestionCounts', 'ASSESSMENT_DIFFICULTIES']) {
        if (!js.includes(token)) fail(`assessment: assets/assessment.js is missing "${token}"`);
      }
      if (!js.includes("from './topic-intelligence.js'")) fail('assessment: assets/assessment.js must build on the canonical Topic Intelligence Layer');
      // NOTE: fetch is allowed here exactly as in assets/curriculum-data.js:
      // static-first JSON loading for GitHub Pages, nothing dynamic.
      for (const banned of ['XMLHttpRequest', 'setInterval', 'openai', 'anthropic', 'streak', 'leaderboard']) {
        if (js.toLowerCase().includes(banned)) fail(`assessment: assets/assessment.js must stay deterministic and static-first (found "${banned}")`);
      }
      if (/semantic[A-Z_(]|new\s+\w*semantic/i.test(js)) fail('assessment: assets/assessment.js must not add semantic grading');
      if (/\bmastery[A-Z_]|["']mastery["']\s*:|mastery\s*=\s*\d/i.test(js)) fail('assessment: assets/assessment.js must not add artificial mastery scores');
      if (/\bxp\b|experience points|\blevels\b.*streak/i.test(js)) fail('assessment: assets/assessment.js must not add gamification');
      if (/quality\s*score|QualityScore/i.test(js)) fail('assessment: assets/assessment.js must not add quality scores');
    }
    // Deterministic, dependency-free bank QA: every failure below names the
    // question id, the offending field, and expected vs actual. Mirrors the
    // canonical validator so CI fails loudly on the same contract.
    const norm = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
    if (!Array.isArray(assessmentBank.questions)) {
      fail('assessment-bank: bank must contain a "questions" array — actual: missing or wrong type');
    } else {
      const seenIds = new Set();
      const seenText = new Map();
      const validTypes = new Set(['multiple_choice', 'true_false', 'short_answer']);
      const validDifficulties = new Set(['beginner', 'intermediate', 'advanced']);
      const validExam = new Set(['high', 'medium', 'low']);
      const requiredFields = ['id', 'courseCode', 'topicId', 'type', 'question', 'answer', 'explanation', 'difficulty', 'examRelevance'];
      assessmentBank.questions.forEach((q, i) => {
        const label = q && typeof q.id === 'string' && q.id ? `question "${q.id}"` : `question at index ${i}`;
        if (!q || typeof q !== 'object' || Array.isArray(q)) {
          fail(`assessment-bank: ${label} must be an object — actual: malformed`);
          return;
        }
        for (const field of requiredFields) {
          if (q[field] === undefined || q[field] === null) {
            fail(`assessment-bank: ${label} missing required field "${field}" — expected a value`);
          }
        }
        if (typeof q.id === 'string' && q.id) {
          if (seenIds.has(q.id)) fail(`assessment-bank: duplicate question id "${q.id}" — expected unique ids`);
          seenIds.add(q.id);
        }
        if (typeof q.question === 'string' && q.question.trim() && typeof q.courseCode === 'string' && typeof q.topicId === 'string') {
          const key = `${q.courseCode}/${q.topicId}::${norm(q.question)}`;
          if (seenText.has(key)) fail(`assessment-bank: duplicate question text in topic "${q.courseCode}/${q.topicId}": "${q.id || i}" duplicates "${seenText.get(key)}" — expected unique text per topic`);
          else seenText.set(key, q.id || String(i));
        }
        if (q.type !== undefined && !validTypes.has(q.type)) {
          fail(`assessment-bank: ${label} has invalid type "${q.type}" — expected one of multiple_choice, true_false, short_answer`);
        }
        if (typeof q.question === 'string' && q.question !== undefined && !q.question.trim()) {
          fail(`assessment-bank: ${label} has empty "question" — expected a non-empty string`);
        }
        if (typeof q.explanation === 'string' && !q.explanation.trim()) {
          fail(`assessment-bank: ${label} has missing/empty "explanation" — expected a non-empty string`);
        }
        if (q.difficulty !== undefined && !validDifficulties.has(q.difficulty)) {
          fail(`assessment-bank: ${label} has malformed difficulty "${q.difficulty}" — expected one of beginner, intermediate, advanced`);
        }
        if (q.examRelevance !== undefined && !validExam.has(q.examRelevance)) {
          fail(`assessment-bank: ${label} has malformed examRelevance "${q.examRelevance}" — expected one of high, medium, low`);
        }
        if (q.type === 'multiple_choice') {
          if (!Array.isArray(q.options) || q.options.length < 2) {
            fail(`assessment-bank: ${label} has too few "options" — expected at least 2 entries`);
          } else {
            if (q.options.some((o) => typeof o !== 'string' || !o.trim())) {
              fail(`assessment-bank: ${label} has an empty option — expected all non-empty strings`);
            }
            if (new Set(q.options).size !== q.options.length) {
              fail(`assessment-bank: ${label} has duplicate MCQ options — expected unique options`);
            }
            if (!q.options.includes(q.answer)) {
              fail(`assessment-bank: ${label} has an invalid answer ref — answer must belong to "options"`);
            }
          }
          if (q.acceptedAnswers !== undefined) {
            fail(`assessment-bank: ${label} must not carry "acceptedAnswers" — only short_answer may`);
          }
        }
        if (q.type === 'true_false') {
          if (typeof q.answer !== 'boolean') {
            fail(`assessment-bank: ${label} has an invalid answer ref — true_false answer must be a boolean`);
          }
          if (q.acceptedAnswers !== undefined) {
            fail(`assessment-bank: ${label} must not carry "acceptedAnswers" — only short_answer may`);
          }
        }
        if (q.type === 'short_answer') {
          if (typeof q.answer !== 'string' || !q.answer.trim()) {
            fail(`assessment-bank: ${label} has an invalid answer ref — short_answer answer must be a non-empty string`);
          }
          if (q.options !== undefined) {
            fail(`assessment-bank: ${label} must not carry "options" — short_answer takes answer/acceptedAnswers only`);
          }
          if (q.acceptedAnswers !== undefined) {
            if (!Array.isArray(q.acceptedAnswers) || q.acceptedAnswers.length === 0) {
              fail(`assessment-bank: ${label} has malformed "acceptedAnswers" — expected a non-empty array`);
            } else {
              if (q.acceptedAnswers.some((a) => typeof a !== 'string' || !a.trim())) {
                fail(`assessment-bank: ${label} has malformed "acceptedAnswers" — expected all non-empty strings`);
              } else {
                const normalized = q.acceptedAnswers.map(norm);
                if (new Set(normalized).size !== normalized.length) {
                  fail(`assessment-bank: ${label} has duplicate "acceptedAnswers" after normalization — expected unique variants`);
                }
                if (typeof q.answer === 'string' && q.answer.trim() && !normalized.includes(norm(q.answer))) {
                  fail(`assessment-bank: ${label} has malformed "acceptedAnswers" — answer must be listed when both are present`);
                }
              }
            }
          }
        }
      });
    }
    // Bank validation against the live manifest (unique ids, existing
    // course/topic references, answer integrity, orphans). Loader failures
    // elsewhere are reported by their own sections; skip validation then.
    try {
      const { validateAssessmentBank, getAssessmentCoverage, getAssessmentQuestionCount, getQuestionsPerCourse, getCoveredTopicsPerCourse, getQuestionsPerModule, getQuestionTypeDistribution, getExamQuestionCoverage } = await import('./assessment.js');
      const { buildTopicManifest } = await import('./topic-manifest.js');
      const manifest = buildTopicManifest({ curriculumDoc, schema: loadTopicSchema() });
      for (const e of validateAssessmentBank(assessmentBank, manifest)) fail(`assessment-bank: ${e}`);
      // Orphan / invalid course-topic refs surface here as well (unknown
      // topics never count as covered).
      const validKeys = new Set(manifest.topics.map((t) => `${t.courseCode}/${t.id}`));
      for (const q of assessmentBank.questions) {
        if (q && typeof q.courseCode === 'string' && typeof q.topicId === 'string' && !validKeys.has(`${q.courseCode}/${q.topicId}`)) {
          fail(`assessment-bank: question "${q.id}" is an orphan — unknown topic "${q.courseCode}/${q.topicId}" (invalid course/topic ref)`);
        }
      }
      const coverage = getAssessmentCoverage(assessmentBank, manifest);
      const totalQuestions = getAssessmentQuestionCount(assessmentBank);
      const perCourse = getQuestionsPerCourse(assessmentBank);
      const coveredPerCourse = getCoveredTopicsPerCourse(assessmentBank, manifest);
      const perModule = getQuestionsPerModule(assessmentBank, manifest);
      const typeDist = getQuestionTypeDistribution(assessmentBank);
      const examCov = getExamQuestionCoverage(assessmentBank, manifest);
      const perCourseSum = perCourse.reduce((a, r) => a + r.questionCount, 0);
      if (perCourseSum !== totalQuestions) fail(`assessment-bank: questions-per-course sums to ${perCourseSum} but bank holds ${totalQuestions} — expected equal`);
      const perModuleSum = perModule.reduce((a, r) => a + r.questionCount, 0);
      if (perModuleSum !== totalQuestions) fail(`assessment-bank: questions-per-module sums to ${perModuleSum} but bank holds ${totalQuestions} — expected equal`);
      const typeSum = typeDist.multiple_choice + typeDist.true_false + typeDist.short_answer;
      if (typeSum !== totalQuestions) fail(`assessment-bank: type distribution sums to ${typeSum} but bank holds ${totalQuestions} — expected equal`);
      const coveredSum = coveredPerCourse.reduce((a, r) => a + r.coveredCount, 0);
      if (coveredSum !== coverage.coveredCount) fail(`assessment-bank: topics-covered-per-course sums to ${coveredSum} but coverage reports ${coverage.coveredCount} — expected equal`);
      console.log(`assessment bank: ${coverage.totalQuestions} questions, ${coverage.coveredCount} covered topics, ${coverage.uncoveredTopics.length} uncovered topics`);
      console.log(`assessment coverage: per-course [${perCourse.map((r) => `${r.courseCode}:${r.questionCount}`).join(', ')}]; types mcq=${typeDist.multiple_choice} tf=${typeDist.true_false} short=${typeDist.short_answer}; exam ${examCov.coveredExamTopics}/${examCov.totalExamTopics} (${examCov.coverage}%)`);
      // Reproducible coverage report must exist and match the live bank.
      if (!fs.existsSync(path.join('docs', 'assessment-coverage.md'))) {
        fail('assessment: expected generated report docs/assessment-coverage.md — actual: missing (run node scripts/generate-assessment-coverage.js)');
      } else {
        const report = fs.readFileSync(path.join('docs', 'assessment-coverage.md'), 'utf-8');
        if (!report.includes(`Questions: ${totalQuestions}`)) fail('assessment: docs/assessment-coverage.md is stale — question total does not match the live bank');
        if (!report.includes(`Covered topics: ${coverage.coveredCount} of ${coverage.totalTopics}`)) fail('assessment: docs/assessment-coverage.md is stale — covered topics do not match the live bank');
        if (/uncovered[^]*assessed as|assesses uncovered/i.test(report)) fail('assessment: docs/assessment-coverage.md must never imply uncovered topics are assessed');
        if (!report.includes('not assessed')) fail('assessment: docs/assessment-coverage.md must state uncovered topics are not assessed');
      }
      if (!fs.existsSync(path.join('scripts', 'generate-assessment-coverage.js'))) {
        fail('assessment: expected reproducible generator scripts/generate-assessment-coverage.js — actual: missing');
      }
    } catch (e) {
      warn(`assessment: bank validation skipped (${(e && e.message) || e})`);
    }
  }
}
    if (/xps\b|experience points/i.test(js)) fail('exam: assets/exam-readiness.js must not add gamification');
  }
}

// 15. Canonical deterministic weak-topic analysis layer: descriptive
// attention over recorded evidence — no AI/LLM, no prediction, no mastery
// scores, no numerical weakness scores, no gamification, no second
// recommendation engine, no polling. The existing recommendation API must
// remain intact.
{
  if (!fs.existsSync('assets/weak-topic-analysis.js')) {
    fail('attention: expected source file assets/weak-topic-analysis.js — actual: missing');
  } else {
    const js = fs.readFileSync('assets/weak-topic-analysis.js', 'utf-8');
    for (const token of ['getTopicAttention', 'explainAttention', 'getAttentionTopics', 'getTopAttentionTopics', 'buildAttentionModel', 'getCourseAttention', 'getModuleAttention', 'filterTopicsByAttention', 'normalizeAttentionFilter', 'ATTENTION_REASONS', 'ATTENTION_FILTERS']) {
      if (!js.includes(token)) fail(`attention: assets/weak-topic-analysis.js is missing "${token}"`);
    }
    for (const token of ['assessment_needs_review', 'review_overdue', 'review_due', 'exam_not_assessed', 'blocks_unfinished_exam_topic']) {
      if (!js.includes(token)) fail(`attention: assets/weak-topic-analysis.js is missing reason "${token}"`);
    }
    for (const dep of ["from './topic-intelligence.js'", "from './learner-state.js'", "from './assessment.js'", "from './revision.js'", "from './exam-readiness.js'"]) {
      if (!js.includes(dep)) fail(`attention: assets/weak-topic-analysis.js must build on the canonical layers (missing ${dep})`);
    }
    for (const banned of ['fetch(', 'XMLHttpRequest', 'setInterval', 'openai', 'anthropic', 'streak', 'leaderboard']) {
      if (js.toLowerCase().includes(banned)) fail(`attention: assets/weak-topic-analysis.js must stay deterministic and static-first (found "${banned}")`);
    }
    if (/\bLLM\b|\bAI\s+(grad|recommend|suggest|tutor)/i.test(js)) fail('attention: assets/weak-topic-analysis.js must not add AI/LLM grading or suggestions');
    if (/semantic\s+(grad|similarity|scor)/i.test(js)) fail('attention: assets/weak-topic-analysis.js must not add semantic grading');
    if (/mastery/i.test(js)) fail('attention: assets/weak-topic-analysis.js must not add mastery scores');
    if (/weakness.?score|weakScore/i.test(js)) fail('attention: assets/weak-topic-analysis.js must not add numerical weakness scores');
    if (/xps\b|experience points/i.test(js)) fail('attention: assets/weak-topic-analysis.js must not add gamification');
    if (/function\s+getRecommendedNextTopics|function\s+getNextRecommendedTopic|const\s+getRecommendedNextTopics/.test(js)) fail('attention: assets/weak-topic-analysis.js must not define a second recommendation engine');
    // Journey integration exposes attention without replacing the engine.
    const journey = fs.existsSync('assets/learning-journey.js') ? fs.readFileSync('assets/learning-journey.js', 'utf-8') : '';
    for (const token of ['attentionTopics', 'attentionCounts', 'topAttentionTopics', 'buildAttentionModel']) {
      if (!journey.includes(token)) fail(`attention: assets/learning-journey.js is missing journey integration "${token}"`);
    }
    if (!journey.includes('getRecommendedNextTopics')) fail('attention: existing recommendation API must remain intact in assets/learning-journey.js');
    // Dashboard attention section (descriptive, no scores).
    const dash = fs.existsSync('assets/dashboard.js') ? fs.readFileSync('assets/dashboard.js', 'utf-8') : '';
    for (const token of ['buildDashboardAttentionModel', 'renderAttention', 'db-attention']) {
      if (!dash.includes(token)) fail(`attention: assets/dashboard.js is missing dashboard integration "${token}"`);
    }
    if (/weak.?score|mastery|performance score/i.test(dash)) fail('attention: assets/dashboard.js must not add scores to the attention section');
    const dashHtml = fs.existsSync('dashboard.html') ? fs.readFileSync('dashboard.html', 'utf-8') : '';
    if (!dashHtml.includes('id="db-attention"')) fail('attention: dashboard.html is missing the attention section (db-attention)');
    // Explorer attention filters compose with existing facets.
    const explorer = fs.existsSync('assets/explorer.js') ? fs.readFileSync('assets/explorer.js', 'utf-8') : '';
    for (const token of ['filterTopicsByAttention', 'normalizeAttentionFilter', 'ATTENTION_FILTERS']) {
      if (!explorer.includes(token)) fail(`attention: assets/explorer.js is missing explorer integration "${token}"`);
    }
    const explorerHtml = fs.existsSync('explorer.html') ? fs.readFileSync('explorer.html', 'utf-8') : '';
    if (!explorerHtml.includes('id="xp-attention"')) fail('attention: explorer.html is missing the attention filter (xp-attention)');
    // Study-context attention explanation (only when evidence applies).
    const study = fs.existsSync('assets/topic-study-context.js') ? fs.readFileSync('assets/topic-study-context.js', 'utf-8') : '';
    if (!study.includes('getTopicAttention') && !study.includes('explainAttention')) fail('attention: assets/topic-study-context.js is missing study-context integration');
    if (!study.includes('ts-attention')) fail('attention: assets/topic-study-context.js does not render the attention explanation');
  }
}

// 16. Canonical deterministic adaptive learning views: presentation over
// recorded evidence — no AI/LLM, no prediction, no ability or mastery
// ratings, no numerical ratings, no gamification, no second next-topic
// mechanism, no new learner state, no polling. The existing recommendation,
// storage, assessment, weight, threshold, and graph semantics stay intact.
{
  if (!fs.existsSync('assets/adaptive-learning.js')) {
    fail('adaptive: expected source file assets/adaptive-learning.js — actual: missing');
  } else {
    const js = fs.readFileSync('assets/adaptive-learning.js', 'utf-8');
    for (const token of ['getAdaptiveNext', 'getStrengthenList', 'getProgressionState', 'getProgressionBreakdown', 'getCourseProgression', 'getModuleProgression', 'getProgressionPath', 'getDifficultyProgression', 'getExamFocus', 'getRevisionFocus', 'buildAdaptiveModel', 'PROGRESSION_STATES']) {
      if (!js.includes(token)) fail(`adaptive: assets/adaptive-learning.js is missing "${token}"`);
    }
    for (const dep of ["from './topic-intelligence.js'", "from './learning-journey.js'", "from './exam-readiness.js'", "from './revision.js'", "from './weak-topic-analysis.js'", "from './learning-analytics.js'", "from './assessment.js'", "from './study-planner.js'"]) {
      if (!js.includes(dep)) fail(`adaptive: assets/adaptive-learning.js must reuse the canonical layers (missing ${dep})`);
    }
    for (const banned of ['fetch(', 'XMLHttpRequest', 'setInterval', 'localStorage', 'openai', 'anthropic', 'streak', 'leaderboard']) {
      if (js.toLowerCase().includes(banned)) fail(`adaptive: assets/adaptive-learning.js must stay deterministic and static-first (found "${banned}")`);
    }
    if (/\bLLM\b/i.test(js)) fail('adaptive: assets/adaptive-learning.js must not add AI/LLM');
    if (/semantic\s+(grad|similarity|scor)/i.test(js)) fail('adaptive: assets/adaptive-learning.js must not add semantic grading');
    if (/mastery|weakness.?score|weakScore|performance score|ability score|predicted/i.test(js)) fail('adaptive: assets/adaptive-learning.js must not add ratings or predictions');
    if (/xps\b|experience points/i.test(js)) fail('adaptive: assets/adaptive-learning.js must not add gamification');
    if (/function\s+getRecommendedNextTopics|function\s+getNextRecommendedTopic/.test(js)) fail('adaptive: assets/adaptive-learning.js must not define a second next-topic mechanism');
    if (!js.includes('getNextRecommendedTopic(')) fail('adaptive: assets/adaptive-learning.js must delegate next to the canonical mechanism');
    if (!js.includes('REVIEW_DUE_DAYS') && !js.includes('getReviewQueue')) fail('adaptive: assets/adaptive-learning.js must reuse the existing revision model');
    // Dashboard adaptive section (descriptive, no ratings).
    const dash = fs.existsSync('assets/dashboard.js') ? fs.readFileSync('assets/dashboard.js', 'utf-8') : '';
    for (const token of ['buildDashboardAdaptiveModel', 'renderAdaptive', 'db-adaptive']) {
      if (!dash.includes(token)) fail(`adaptive: assets/dashboard.js is missing dashboard integration "${token}"`);
    }
    if (/mastery|weakness.?score|performance score|ability score/i.test(dash)) fail('adaptive: assets/dashboard.js must not add ratings to the adaptive section');
    const dashHtml = fs.existsSync('dashboard.html') ? fs.readFileSync('dashboard.html', 'utf-8') : '';
    if (!dashHtml.includes('id="db-adaptive"')) fail('adaptive: dashboard.html is missing the adaptive section (db-adaptive)');
    // Explorer progression indicators reuse the adaptive views.
    const explorer = fs.existsSync('assets/explorer.js') ? fs.readFileSync('assets/explorer.js', 'utf-8') : '';
    for (const token of ['getProgressionState', 'getProgressionPath']) {
      if (!explorer.includes(token)) fail(`adaptive: assets/explorer.js is missing explorer integration "${token}"`);
    }
    // Study-context progression path.
    const study = fs.existsSync('assets/topic-study-context.js') ? fs.readFileSync('assets/topic-study-context.js', 'utf-8') : '';
    if (!study.includes('getProgressionPath')) fail('adaptive: assets/topic-study-context.js is missing study-context integration');
    if (!study.includes('ts-progression')) fail('adaptive: assets/topic-study-context.js does not render the progression block');
    // Existing invariants hold: storage, assessment, weights, thresholds.
    const learnerState = fs.existsSync('assets/learner-state.js') ? fs.readFileSync('assets/learner-state.js', 'utf-8') : '';
    if (!learnerState.includes('tarangam_topic_state_v1')) fail('adaptive: existing learner-state storage must remain unchanged');
    const exam = fs.existsSync('assets/exam-readiness.js') ? fs.readFileSync('assets/exam-readiness.js', 'utf-8') : '';
    if (!exam.includes('high: 3') && !exam.includes('high:3')) fail('adaptive: existing exam-readiness weights must remain unchanged');
    const revision = fs.existsSync('assets/revision.js') ? fs.readFileSync('assets/revision.js', 'utf-8') : '';
    if (!revision.includes('REVIEW_DUE_DAYS = 7') || !revision.includes('REVIEW_OVERDUE_DAYS = 14')) fail('adaptive: existing revision thresholds must remain unchanged');
  }
}

// 17. Canonical deterministic curriculum search: one shared matcher plus
// ranked presentation over title/ID/course/module/concepts/tags/objectives
// — no backend, no external service, no AI/semantic similarity, no numeric
// relevance scores, no polling. Ranked order first, manifest order for
// ties; the existing searchTopics API and every other layer stay intact.
{
  if (!fs.existsSync('assets/topic-intelligence.js')) {
    fail('search: expected source file assets/topic-intelligence.js — actual: missing');
  } else {
    const js = fs.readFileSync('assets/topic-intelligence.js', 'utf-8');
    for (const token of ['searchTopics', 'searchCurriculum', 'describeSearchMatch', 'topicMatchesQuery', 'combinedFilter', 'SEARCH_MATCH_KINDS', 'normalizeSearchText']) {
      if (!js.includes(token)) fail(`search: assets/topic-intelligence.js is missing "${token}"`);
    }
    for (const token of ['exact_id', 'exact_title', 'title', 'concept', 'tag', 'objective', 'course', 'module']) {
      if (!js.includes(token)) fail(`search: assets/topic-intelligence.js is missing match tier "${token}"`);
    }
    if (!js.includes('manifest order')) fail('search: assets/topic-intelligence.js must document manifest-order tie-breaking');
    for (const banned of ['fetch(', 'XMLHttpRequest', 'openai', 'anthropic', 'setInterval', 'localStorage']) {
      if (js.toLowerCase().includes(banned)) fail(`search: assets/topic-intelligence.js must stay static-first (found "${banned}")`);
    }
    if (/\bLLMs?\b.*(grad|recommend|suggest|rank|search)|semantic\s+similarity/i.test(js)) fail('search: assets/topic-intelligence.js must not add AI/semantic search');
    const data = fs.existsSync('assets/curriculum-data.js') ? fs.readFileSync('assets/curriculum-data.js', 'utf-8') : '';
    for (const token of ['searchCurriculum', 'describeSearchMatch', 'topicMatchesQuery']) {
      if (!data.includes(token)) fail(`search: assets/curriculum-data.js must re-export "${token}" without duplicating logic`);
    }
    // Explorer global search across the curriculum with existing deep links.
    const explorer = fs.existsSync('assets/explorer.js') ? fs.readFileSync('assets/explorer.js', 'utf-8') : '';
    for (const token of ['searchCurriculum', 'describeSearchMatch', 'topicPageUrl']) {
      if (!explorer.includes(token)) fail(`search: assets/explorer.js is missing search integration "${token}"`);
    }
    if (!explorer.includes('All courses')) fail('search: assets/explorer.js must offer whole-curriculum scope');
    const explorerHtml = fs.existsSync('explorer.html') ? fs.readFileSync('explorer.html', 'utf-8') : '';
    if (!explorerHtml.includes('id="xp-search"')) fail('search: explorer.html is missing the search input (xp-search)');
    // Untouched engines: recommendation, weights, thresholds, evaluation.
    const journey = fs.existsSync('assets/learning-journey.js') ? fs.readFileSync('assets/learning-journey.js', 'utf-8') : '';
    if (!journey.includes('getRecommendedNextTopics')) fail('search: existing recommendation API must remain intact');
    const exam = fs.existsSync('assets/exam-readiness.js') ? fs.readFileSync('assets/exam-readiness.js', 'utf-8') : '';
    if (!exam.includes('high: 3') && !exam.includes('high:3')) fail('search: existing exam-readiness weights must remain unchanged');
    const revision = fs.existsSync('assets/revision.js') ? fs.readFileSync('assets/revision.js', 'utf-8') : '';
    if (!revision.includes('REVIEW_DUE_DAYS = 7') || !revision.includes('REVIEW_OVERDUE_DAYS = 14')) fail('search: existing revision thresholds must remain unchanged');
    const assessment = fs.existsSync('assets/assessment.js') ? fs.readFileSync('assets/assessment.js', 'utf-8') : '';
    if (!assessment.includes('PASS_THRESHOLD')) fail('search: existing assessment evaluation must remain unchanged');
  }
}

// 18. Canonical course/module overview navigation: pure overview models
// over recorded evidence — no AI/LLM, no prediction, no ratings, no
// gamification, no next-topic mechanism of any kind, no new learner state,
// no polling. Topic Previous/Next stays canonical manifest order on every
// hosting mode; all surfaces link through shared helpers.
{
  if (!fs.existsSync('assets/course-overview.js')) {
    fail('course: expected source file assets/course-overview.js — actual: missing');
  } else {
    const js = fs.readFileSync('assets/course-overview.js', 'utf-8');
    for (const token of ['getCourseOverview', 'getModuleOverview', 'buildCourseOverviewList', 'getTopicNeighbors', 'courseHrefFrom', 'parseCourseQuery']) {
      if (!js.includes(token)) fail(`course: assets/course-overview.js is missing "${token}"`);
    }
    for (const dep of ["from './topic-intelligence.js'", "from './learner-state.js'", "from './exam-readiness.js'", "from './revision.js'", "from './weak-topic-analysis.js'", "from './assessment.js'"]) {
      if (!js.includes(dep)) fail(`course: assets/course-overview.js must reuse the canonical layers (missing ${dep})`);
    }
    for (const banned of ['fetch(', 'XMLHttpRequest', 'setInterval', 'localStorage', 'openai', 'anthropic', 'streak', 'leaderboard']) {
      if (js.toLowerCase().includes(banned)) fail(`course: assets/course-overview.js must stay deterministic and static-first (found "${banned}")`);
    }
    if (/\bLLM\b/i.test(js)) fail('course: assets/course-overview.js must not add AI/LLM');
    if (/mastery|weakness.?score|performance score|ability score|predicted/i.test(js)) fail('course: assets/course-overview.js must not add ratings or predictions');
    if (/xps\b|experience points/i.test(js)) fail('course: assets/course-overview.js must not add gamification');
    if (/getRecommendedNextTopics|getNextRecommendedTopic/.test(js)) fail('course: assets/course-overview.js must not define or shadow a next-topic mechanism');
    if (!/no description field/i.test(js)) fail('course: assets/course-overview.js must document that no description is fabricated');
    // Course page ships with shared sync and link mechanisms.
    if (!fs.existsSync('course.html')) fail('course: expected page course.html — actual: missing');
    if (!fs.existsSync('assets/course-page.js')) fail('course: expected source file assets/course-page.js — actual: missing');
    const page = fs.existsSync('assets/course-page.js') ? fs.readFileSync('assets/course-page.js', 'utf-8') : '';
    for (const token of ['getCourseOverview', 'PROGRESS_CHANGED_EVENT', 'topicPageUrl']) {
      if (!page.includes(token)) fail(`course: assets/course-page.js is missing shared integration "${token}"`);
    }
    if (page.includes('setInterval')) fail('course: assets/course-page.js must not poll');
    if (/getRecommendedNextTopics|getNextRecommendedTopic/.test(page)) fail('course: assets/course-page.js must not add a next-topic mechanism');
    const courseHtml = fs.existsSync('course.html') ? fs.readFileSync('course.html', 'utf-8') : '';
    if (!courseHtml.includes('assets/course-page.js')) fail('course: course.html must load assets/course-page.js');
    if (!courseHtml.includes('name="viewport"')) fail('course: course.html must declare a responsive viewport');
    if (!/@media[^{]*max-width/.test(courseHtml)) fail('course: course.html must include responsive rules');
    // Cross-surface links reuse the shared helpers on every surface.
    const dash = fs.existsSync('assets/dashboard.js') ? fs.readFileSync('assets/dashboard.js', 'utf-8') : '';
    if (!dash.includes('course.html?course=')) fail('course: assets/dashboard.js must link course overviews');
    const explorer = fs.existsSync('assets/explorer.js') ? fs.readFileSync('assets/explorer.js', 'utf-8') : '';
    if (!explorer.includes('course.html?course=')) fail('course: assets/explorer.js must link course overviews');
    const study = fs.existsSync('assets/topic-study-context.js') ? fs.readFileSync('assets/topic-study-context.js', 'utf-8') : '';
    if (!study.includes('courseHrefFrom')) fail('course: assets/topic-study-context.js must link course overviews via the shared helper');
    // Static prev/next ordering matches the canonical in-course neighbors.
    const studyCtx = study;
    if (!studyCtx.includes('getPreviousInCourse') && !studyCtx.includes('getNextInCourse')) fail('course: topic navigation must use canonical in-course neighbors');
  }
}

// 19. Complete topic learning navigation: deterministic Previous/Next
// from canonical in-course order, Course → Module → Topic breadcrumb
// links to canonical overviews, prerequisite/action/related blocks from
// existing layers only — no AI/LLM, no new state, no second next-topic
// mechanism. All surfaces keep working through shared helpers.
{
  const template = fs.existsSync(path.join('templates', 'base.html'))
    ? fs.readFileSync(path.join('templates', 'base.html'), 'utf-8')
    : null;
  if (!template) {
    fail('topic-nav: expected template templates/base.html — actual: missing');
  } else {
    if (!template.includes('id="prevTopicLink"') || !template.includes('id="nextTopicLink"')) {
      fail('topic-nav: templates/base.html must render deterministic Previous/Next controls');
    }
    if (!template.includes('{% if prev_page %}') || !template.includes('{% if next_page %}')) {
      fail('topic-nav: templates/base.html must handle first/last topic boundaries');
    }
    for (const token of ['course.html?course={{ course_code }}', '#module-{{ current_mod }}', 'id="crumb"']) {
      if (!template.includes(token)) fail(`topic-nav: templates/base.html breadcrumb is missing "${token}"`);
    }
    if (!template.includes('id="tsStudyContext"')) fail('topic-nav: templates/base.html must mount the canonical study context');
  }
  const coursePage = fs.existsSync('assets/course-page.js') ? fs.readFileSync('assets/course-page.js', 'utf-8') : '';
  if (!coursePage.includes('id="module-')) fail('topic-nav: course modules must expose anchors for breadcrumb deep links');
  for (const banned of ['openai', 'anthropic', 'streak', 'leaderboard']) {
    if ((template || '').toLowerCase().includes(banned)) fail(`topic-nav: templates/base.html must stay static-first (found "${banned}")`);
  }
  // Prerequisite, action, related, and event blocks reuse canonical layers.
  const study = fs.existsSync('assets/topic-study-context.js') ? fs.readFileSync('assets/topic-study-context.js', 'utf-8') : '';
  for (const token of ['getPrerequisites', 'getDirectPrerequisiteCompletion', 'getDependents', 'assessmentHrefFrom', 'PROGRESS_CHANGED_EVENT']) {
    if (!study.includes(token)) fail(`topic-nav: assets/topic-study-context.js is missing canonical integration "${token}"`);
  }
  if (/function\s+getNextRecommendedTopic|function\s+getRecommendedNextTopics|const\s+getNextRecommendedTopic\s*=/.test(study)) fail('topic-nav: study context must not define a next-topic mechanism (reuse the canonical one)');
  // Navigable loop intact on every surface through shared helpers.
  const course = fs.existsSync('assets/course-overview.js') ? fs.readFileSync('assets/course-overview.js', 'utf-8') : '';
  for (const token of ['getTopicNeighbors', 'courseHrefFrom', 'getPreviousInCourse', 'getNextInCourse']) {
    if (!course.includes(token)) fail(`topic-nav: assets/course-overview.js is missing navigation integration "${token}"`);
  }
  const explorer = fs.existsSync('assets/explorer.js') ? fs.readFileSync('assets/explorer.js', 'utf-8') : '';
  if (!explorer.includes('topicPageUrl')) fail('topic-nav: explorer must navigate via the canonical page-URL helper');
  const dash = fs.existsSync('assets/dashboard.js') ? fs.readFileSync('assets/dashboard.js', 'utf-8') : '';
  if (!dash.includes('course.html?course=')) fail('topic-nav: dashboard must keep course navigation working');
}

// 20. Responsive learning UX: narrow-screen hardening without behavior
// changes — viewports, collapsing layouts, overflow guards, wrapping
// titles/breadcrumbs, touch-sized semantic controls, and present
// navigation on every learner surface. CSS-only; no framework, no
// backend, no new dependency.
{
  const pages = ['dashboard.html', 'explorer.html', 'course.html', 'assessment.html', 'index.html'];
  for (const page of pages) {
    if (!fs.existsSync(page)) {
      fail(`responsive: expected page ${page} — actual: missing`);
      continue;
    }
    const html = fs.readFileSync(page, 'utf-8');
    if (!html.includes('name="viewport"') || !html.includes('width=device-width')) {
      fail(`responsive: ${page} must declare a device-width viewport`);
    }
    if (!html.includes('@media')) fail(`responsive: ${page} must include responsive rules`);
  }
  if (!fs.existsSync(path.join('templates', 'base.html')) || !fs.readFileSync(path.join('templates', 'base.html'), 'utf-8').includes('name="viewport"')) {
    fail('responsive: templates/base.html must declare a device-width viewport');
  }
  const css = fs.existsSync('style.css') ? fs.readFileSync('style.css', 'utf-8') : '';
  for (const token of ['@media (max-width: 860px)', '@media (max-width: 640px)', 'overflow-wrap: break-word', 'min-height: 44px']) {
    if (!css.includes(token)) fail(`responsive: style.css is missing shared hardening "${token}"`);
  }
  if (!/img,\s*video,\s*svg,\s*canvas\s*\{\s*max-width:\s*100%/.test(css)) fail('responsive: style.css must bound media inside narrow viewports');
  if (!/\.crumb\s*\{[^}]*flex-wrap:\s*wrap/.test(css)) fail('responsive: breadcrumbs must wrap cleanly');
  if (/width:\s*100vw/.test(css)) fail('responsive: style.css must not introduce viewport-width overflow traps');
  for (const page of ['dashboard.html', 'explorer.html', 'course.html', 'assessment.html']) {
    const html = fs.readFileSync(page, 'utf-8');
    if (!html.includes('min-height: 44px')) fail(`responsive: ${page} must size essential controls for touch`);
    if (!html.includes('overflow-wrap: break-word')) fail(`responsive: ${page} must wrap long titles`);
    if (/width:\s*100vw/.test(html)) fail(`responsive: ${page} must not introduce viewport-width overflow traps`);
  }
  const explorer = fs.existsSync('explorer.html') ? fs.readFileSync('explorer.html', 'utf-8') : '';
  if (!explorer.includes('.xp-card { grid-template-columns: 1fr; }')) fail('responsive: explorer cards must stack on narrow screens');
  if (!fs.readFileSync('course.html', 'utf-8').includes('.co-modules { grid-template-columns: 1fr; }')) {
    fail('responsive: course modules must stack on narrow screens');
  }
  const template = fs.existsSync(path.join('templates', 'base.html')) ? fs.readFileSync(path.join('templates', 'base.html'), 'utf-8') : '';
  for (const token of ['id="prevTopicLink"', 'id="nextTopicLink"', 'id="crumb"']) {
    if (!template.includes(token)) fail(`responsive: topic navigation control missing "${token}"`);
  }
  for (const id of ['xp-search', 'xp-course', 'xp-module', 'as-start', 'co-course', 'db-courses']) {
    const owner = id.startsWith('xp-') ? 'explorer.html' : id.startsWith('as-') ? 'assessment.html' : id.startsWith('co-') ? 'course.html' : 'dashboard.html';
    if (!fs.readFileSync(owner, 'utf-8').includes(`id="${id}"`)) fail(`responsive: navigation control missing "${id}" in ${owner}`);
  }
}

// 21. Accessibility and keyboard UX: semantic landmarks, skip links,
// labels, accessible names, native controls, visible focus, correct ARIA,
// reduced motion, live regions, and real text contrast — without behavior
// changes, framework moves, or new dependencies.
{
  const pages = {
    'dashboard.html': 'db-app', 'explorer.html': 'xp-app', 'course.html': 'co-app',
    'assessment.html': 'as-app', 'index.html': 'main-content',
  };
  for (const [page, target] of Object.entries(pages)) {
    if (!fs.existsSync(page)) {
      fail(`a11y: expected page ${page} — actual: missing`);
      continue;
    }
    const html = fs.readFileSync(page, 'utf-8');
    if (!html.includes('class="skip-link"') || !html.includes(`href="#${target}"`)) {
      fail(`a11y: ${page} must link a skip link to ${target}`);
    }
    if (!html.includes('<main')) fail(`a11y: ${page} must expose a main landmark`);
  }
  const template = fs.existsSync(path.join('templates', 'base.html'))
    ? fs.readFileSync(path.join('templates', 'base.html'), 'utf-8')
    : '';
  if (!template.includes('class="skip-link"')) fail('a11y: topic template must keep its skip link');
  if (!template.includes('<main')) fail('a11y: topic template must keep its main landmark');
  for (const id of ['sidebarToggle', 'themeToggleBtn', 'settingsBtn', 'closeSettings']) {
    if (!new RegExp(`id="${id}"[^>]*aria-label="[^"]+"`).test(template)) {
      fail(`a11y: icon-only button ${id} needs an accessible name`);
    }
  }
  if (!template.includes('role="status"')) fail('a11y: topic progress updates must announce via a live region');
  const assessmentPage = fs.existsSync('assets/assessment-page.js') ? fs.readFileSync('assets/assessment-page.js', 'utf-8') : '';
  if (!assessmentPage.includes('aria-label="Type your answer"')) fail('a11y: free-text answer input needs an accessible name');
  if (!assessmentPage.includes('role="status"')) fail('a11y: per-question feedback must announce via a live region');
  const assessmentHtml = fs.existsSync('assessment.html') ? fs.readFileSync('assessment.html', 'utf-8') : '';
  if (!assessmentHtml.includes('aria-live="polite"')) fail('a11y: assessment result must announce via a live region');
  const explorer = fs.existsSync('assets/explorer.js') ? fs.readFileSync('assets/explorer.js', 'utf-8') : '';
  if (!explorer.includes('aria-current="true"')) fail('a11y: explorer must expose the selected card');
  const css = fs.existsSync('style.css') ? fs.readFileSync('style.css', 'utf-8') : '';
  if (!css.includes(':focus-visible')) fail('a11y: style.css must keep visible focus styles');
  if (!css.includes('@media (prefers-reduced-motion: reduce)')) fail('a11y: style.css must keep reduced-motion support');
  for (const f of ['style.css', 'dashboard.html', 'explorer.html', 'course.html', 'assessment.html', 'index.html', 'templates/base.html']) {
    const content = fs.existsSync(f) ? fs.readFileSync(f, 'utf-8') : '';
    if (/tabindex\s*=\s*["']?[1-9]/.test(content)) fail(`a11y: ${f} must not use positive tabindex`);
    if (/outline:\s*none/.test(content)) fail(`a11y: ${f} must not remove focus outlines`);
  }
  // Real contrast computation over shipped theme variables (WCAG AA).
  const lum = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  for (const theme of ['dark', 'light', 'reading']) {
    const start = css.indexOf(`body[data-theme="${theme}"]`);
    const next = css.indexOf('body[data-theme="', start + 1);
    const section = start === -1 ? '' : css.slice(start, next === -1 ? css.length : next);
    const vars = {};
    for (const m of section.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) vars[m[1]] = m[2];
    for (const [fg, bg] of [['--ink', '--surface'], ['--ink-dim', '--surface'], ['--ink-faint', '--surface'], ['--ink', '--surface-2'], ['--ink-dim', '--surface-2'], ['--ink-faint', '--surface-2'], ['--accent', '--surface']]) {
      if (!vars[fg] || !vars[bg]) {
        fail(`a11y: ${theme} theme must define ${fg} and ${bg}`);
        continue;
      }
      const [x, y] = [lum(vars[fg]), lum(vars[bg])].sort((m, n) => m - n);
      const ratio = (y + 0.05) / (x + 0.05);
      if (ratio < 4.5) fail(`a11y: ${theme} ${fg} on ${bg} is ${ratio.toFixed(2)} (needs WCAG AA 4.5)`);
    }
  }
}

// 22. Offline/PWA foundation: versioned worker, valid manifest, offline
// fallback, graceful registration — static-first, no backend, no new
// learner-state mechanism, Pages-relative paths throughout.
{
  if (!fs.existsSync('manifest.webmanifest')) {
    fail('pwa: expected manifest.webmanifest — actual: missing');
  } else {
    let manifest = null;
    try {
      manifest = JSON.parse(fs.readFileSync('manifest.webmanifest', 'utf-8'));
    } catch (e) {
      fail(`pwa: manifest.webmanifest is not valid JSON (${(e && e.message) || e})`);
    }
    if (manifest) {
      for (const key of ['name', 'short_name', 'description', 'start_url', 'display', 'icons']) {
        if (!manifest[key]) fail(`pwa: manifest.webmanifest needs "${key}"`);
      }
      if (manifest.start_url && (manifest.start_url.startsWith('/') || manifest.start_url.startsWith('http'))) {
        fail('pwa: manifest start_url must stay Pages-relative');
      }
      for (const icon of Array.isArray(manifest.icons) ? manifest.icons : []) {
        if (!icon.src || icon.src.startsWith('/') || icon.src.startsWith('http')) {
          fail(`pwa: manifest icon paths must stay Pages-relative (found "${icon && icon.src}")`);
        }
        if (!fs.existsSync(icon.src)) fail(`pwa: manifest icon file ${icon.src} is missing`);
      }
    }
  }
  if (!fs.existsSync('sw.js')) {
    fail('pwa: expected service worker sw.js — actual: missing');
  } else {
    const sw = fs.readFileSync('sw.js', 'utf-8');
    if (!sw.includes('__TARANGAM_VERSION__')) {
      fail('pwa: sw.js must carry the __TARANGAM_VERSION__ token for deterministic build stamping');
    }
    for (const token of ['SHELL_URLS', 'SHELL_CACHE', 'CONTENT_CACHE', 'DATA_CACHE']) {
      if (!sw.includes(token)) fail(`pwa: sw.js is missing cache layer "${token}"`);
    }
    for (const token of ["addEventListener('install'", "addEventListener('activate'", "addEventListener('fetch'", 'skipWaiting', 'clients.claim', 'caches.delete', 'offline.html']) {
      if (!sw.includes(token)) fail(`pwa: sw.js is missing offline wiring "${token}"`);
    }
    for (const banned of ['localStorage', 'indexedDB', 'tarangam_topic_state_v1', 'openai', 'setInterval']) {
      if (sw.includes(banned)) fail(`pwa: sw.js must not contain "${banned}"`);
    }
  }
  if (!fs.existsSync('offline.html')) {
    fail('pwa: expected offline fallback offline.html — actual: missing');
  } else {
    const html = fs.readFileSync('offline.html', 'utf-8');
    if (!html.includes('<main') || !html.includes('name="viewport"')) fail('pwa: offline.html must render a landmarked responsive fallback');
    if (!html.includes('./index.html') || !html.includes('./dashboard.html')) fail('pwa: offline.html must link entry points relatively');
  }
  if (!fs.existsSync('assets/pwa-register.js')) {
    fail('pwa: expected shared registration assets/pwa-register.js — actual: missing');
  } else {
    const reg = fs.readFileSync('assets/pwa-register.js', 'utf-8');
    if (!reg.includes("'serviceWorker' in navigator") || !reg.includes("register('sw.js')")) {
      fail('pwa: registration must feature-detect and use a relative worker URL');
    }
  }
  for (const page of ['index.html', 'dashboard.html', 'explorer.html', 'course.html', 'assessment.html']) {
    if (!fs.existsSync(page)) continue;
    const html = fs.readFileSync(page, 'utf-8');
    if (!html.includes('assets/pwa-register.js')) fail(`pwa: ${page} must include the shared registration`);
    if (!html.includes('rel="manifest"')) fail(`pwa: ${page} must link the web manifest`);
  }
  if (fs.existsSync('dist')) {
    for (const f of ['dist/manifest.webmanifest', 'dist/sw.js', 'dist/offline.html', 'dist/icons/icon-192.png', 'dist/icons/icon-512.png']) {
      if (!fs.existsSync(f)) fail(`pwa: expected published file ${f} — actual: missing (run npm run build:notes)`);
    }
    if (fs.existsSync('dist/sw.js') && fs.existsSync('sw.js')) {
      const stamped = fs.readFileSync('dist/sw.js', 'utf-8');
      const source = fs.readFileSync('sw.js', 'utf-8');
      if (stamped.includes('__TARANGAM_VERSION__')) {
        fail('pwa: dist/sw.js still carries the version placeholder — build stamping did not run');
      }
      const minted = stamped.match(/const TARANGAM_CACHE_VERSION = '(tarangam-[0-9a-f]{12})'/) || [];
      if (!minted[1] || stamped !== source.split('__TARANGAM_VERSION__').join(minted[1])) {
        fail('pwa: dist/sw.js must equal sw.js with only the deterministic version stamped in');
      }
    }
  }
  const learnerState = fs.existsSync('assets/learner-state.js') ? fs.readFileSync('assets/learner-state.js', 'utf-8') : '';
  if (learnerState.includes('fetch(') || learnerState.includes('indexedDB')) {
    fail('pwa: learner state must stay local without network mechanisms');
  }
  // Offline indicator: event-driven only, shared script + styles.
  const register = fs.existsSync('assets/pwa-register.js') ? fs.readFileSync('assets/pwa-register.js', 'utf-8') : '';
  for (const token of ["addEventListener('online'", "addEventListener('offline'", 'net-status']) {
    if (!register.includes(token)) fail(`pwa: offline indicator is missing "${token}"`);
  }
  if (register.includes('setInterval') || register.includes('localStorage')) {
    fail('pwa: offline indicator must not poll or store state');
  }
  const sharedCss = fs.existsSync('style.css') ? fs.readFileSync('style.css', 'utf-8') : '';
  if (!sharedCss.includes('.net-status')) fail('pwa: style.css must style the offline indicator');
  // Build stamps the published worker deterministically (gated in tests).
  const output = fs.existsSync('scripts/output.js') ? fs.readFileSync('scripts/output.js', 'utf-8') : '';
  for (const token of ['computeServiceWorkerVersion', 'injectServiceWorkerVersion']) {
    if (!output.includes(token)) fail(`pwa: scripts/output.js is missing "${token}"`);
  }
  if (!fs.existsSync('docs/offline-reliability.md')) fail('pwa: expected developer doc docs/offline-reliability.md — actual: missing');
}

// 23. Performance budgets: deterministic audit over dist/ with practical
// limits from the measured baseline — no synthetic scores, no behavior
// changes. Any breached budget fails the build with exact diagnostics.
{
  let audit = null;
  try {
    const { auditPerformance, PERFORMANCE_BUDGETS } = await import('./performance-budget.js');
    audit = auditPerformance('dist');
    if (!audit || !Array.isArray(audit.results) || !audit.results.length) {
      fail('performance: audit returned no results — expected per-budget pass/fail rows');
    } else {
      for (const row of audit.results) {
        if (typeof row.actual !== 'number' || typeof row.budget !== 'number') {
          fail(`performance: budget "${row.key}" did not measure numbers`);
        } else if (!row.pass) {
          fail(`performance: budget "${row.key}" breached — actual ${row.actual} bytes over budget ${row.budget} bytes${row.detail ? ` (${row.detail})` : ''}`);
        }
      }
      const keys = audit.results.map((r) => r.key);
      for (const key of ['totalTopicHtmlBytes', 'maxTopicPageBytes', 'sharedCssBytes', 'totalJsBytes', 'manifestBytes', 'bankBytes', 'topicPageCount']) {
        if (!keys.includes(key)) fail(`performance: audit is missing required budget "${key}"`);
      }
      if (!keys.some((k) => k.startsWith('initialPayloadBytes:'))) {
        fail('performance: audit must report per-surface initial payloads');
      }
    }
    void PERFORMANCE_BUDGETS;
  } catch (e) {
    fail(`performance: audit could not run (${(e && e.message) || e})`);
  }
}

// 24. Learner-state integrity and migrations: versioned, validated,
// migratable local state — no backend, no sync, no new engines. Corrupt
// storage recovers with backups; unknown future versions are preserved
// read-only, never downgraded or overwritten.
{
  if (!fs.existsSync('assets/learner-state-schema.js')) {
    fail('storage: expected schema registry assets/learner-state-schema.js — actual: missing');
  } else {
    const js = fs.readFileSync('assets/learner-state-schema.js', 'utf-8');
    for (const token of ['LEARNER_SCHEMA_VERSION', 'describeLearnerSchema', 'detectStoredVersion', 'isFutureVersion', 'futureVersionKeys', 'validateV1Entry', 'validateV1Map', 'validateLegacyVisited', 'validateLegacyStamps', 'validateStoredState', 'migrateStoredState', 'ensureDefaultState']) {
      if (!js.includes(token)) fail(`storage: assets/learner-state-schema.js is missing "${token}"`);
    }
    if (!js.includes('> LEARNER_SCHEMA_VERSION')) {
      fail('storage: future detection must compare generations against LEARNER_SCHEMA_VERSION (any vN, not one key)');
    }
    // The runtime probe in learner-state.js duplicates the current version
    // constant to avoid a module cycle; both literals must agree.
    const state = fs.existsSync('assets/learner-state.js') ? fs.readFileSync('assets/learner-state.js', 'utf-8') : '';
    const schemaVersion = (js.match(/LEARNER_SCHEMA_VERSION\s*=\s*(\d+)/) || [])[1];
    const runtimeVersion = (state.match(/CURRENT_SCHEMA_VERSION\s*=\s*(\d+)/) || [])[1];
    if (!schemaVersion || !runtimeVersion || schemaVersion !== runtimeVersion) {
      fail(`storage: schema version ${schemaVersion ?? '?'} must equal runtime probe version ${runtimeVersion ?? '?'} (module-cycle-safe duplicate)`);
    }
    for (const dep of ["from './learner-state.js'"]) {
      if (!js.includes(dep)) fail(`storage: schema registry must build on the canonical learner-state module (missing ${dep})`);
    }
    for (const banned of ['fetch(', 'XMLHttpRequest', 'indexedDB', 'localStorage', 'openai', 'setInterval']) {
      if (js.includes(banned)) fail(`storage: schema registry must stay local-only (found "${banned}")`);
    }
    if (!js.includes('readOnly') || !js.includes('read-only')) fail('storage: schema registry must document the read-only preservation path');
  }
  const state = fs.existsSync('assets/learner-state.js') ? fs.readFileSync('assets/learner-state.js', 'utf-8') : '';
  for (const token of ['V1_CORRUPT_BACKUP_KEY', 'V2_STATE_KEY', 'isReadOnly', 'getSchemaInfo']) {
    if (!state.includes(token)) fail(`storage: assets/learner-state.js is missing integrity integration "${token}"`);
  }
  if (state.includes('indexedDB')) fail('storage: learner state must not add IndexedDB');
  if (!fs.existsSync('scripts/learner-state-schema.js')) {
    fail('storage: expected Node entry scripts/learner-state-schema.js — actual: missing');
  }
}

// 25. Learner-state backup and restore: deterministic local-only file
// round-trip with validate-first atomic restore — no backend, no sync,
// no new engines. Failed imports change nothing; future data is never
// downgraded; dashboard wiring stays descriptive.
{
  if (!fs.existsSync('assets/learner-state-backup.js')) {
    fail('backup: expected module assets/learner-state-backup.js — actual: missing');
  } else {
    const js = fs.readFileSync('assets/learner-state-backup.js', 'utf-8');
    for (const token of ['BACKUP_FORMAT', 'buildBackup', 'exportBackup', 'downloadBackup', 'previewBackupImport', 'importBackup']) {
      if (!js.includes(token)) fail(`backup: assets/learner-state-backup.js is missing "${token}"`);
    }
    for (const dep of ["from './learner-state.js'", "from './learner-state-schema.js'"]) {
      if (!js.includes(dep)) fail(`backup: backup layer must build on canonical state layers (missing ${dep})`);
    }
    for (const banned of ['fetch(', 'XMLHttpRequest', 'indexedDB', 'localStorage', 'openai', 'setInterval']) {
      if (js.includes(banned)) fail(`backup: backup layer must stay local-only (found "${banned}")`);
    }
    if (!js.includes('tarangam-learner-state-backup')) fail('backup: backup format identity must be explicit');
  }
  if (!fs.existsSync('scripts/learner-state-backup.js')) {
    fail('backup: expected Node entry scripts/learner-state-backup.js — actual: missing');
  }
  const dashHtml = fs.existsSync('dashboard.html') ? fs.readFileSync('dashboard.html', 'utf-8') : '';
  for (const id of ['db-backup', 'db-export-btn', 'db-import-file', 'db-import-btn', 'db-backup-status']) {
    if (!dashHtml.includes(`id="${id}"`)) fail(`backup: dashboard.html is missing backup section "${id}"`);
  }
  const dash = fs.existsSync('assets/dashboard.js') ? fs.readFileSync('assets/dashboard.js', 'utf-8') : '';
  for (const token of ['previewBackupImport', 'importBackup', 'downloadBackup']) {
    if (!dash.includes(token)) fail(`backup: assets/dashboard.js is missing backup wiring "${token}"`);
  }
}

for (const w of warnings) console.warn('WARN: ' + w);
if (errors.length) {
  for (const e of errors) console.error('FAIL: ' + e);
  console.error(`${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(1);
}
console.log(`check passed (${courses.length} courses), ${warnings.length} warning(s)`);
