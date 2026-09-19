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

// 6. Topic metadata fixture validation (schema foundation only — no
// migration of the 432 Markdown topics yet). Validates
// data/topic-metadata.example.json against data/topic-schema.json with a
// dependency-free walker: required fields, types, enums, patterns,
// ranges, array structure, plus obvious invalid values (empty/whitespace
// strings) and cross-checks (course/module exist, id follows the
// m{module}_{sequence}_ filename convention and names a real content file).
{
  const SCHEMA_PATH = path.join('data', 'topic-schema.json');
  const FIXTURE_PATH = path.join('data', 'topic-metadata.example.json');
  let schema = null;
  let fixture = null;
  let fixtureParsed = false;
  try {
    schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
  } catch (e) {
    fail(`topic-schema: cannot read/parse ${SCHEMA_PATH} (${e.message}) — expected the canonical topic metadata schema`);
  }
  try {
    fixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf-8'));
    fixtureParsed = true;
  } catch (e) {
    fail(`topic-metadata: cannot read/parse ${FIXTURE_PATH} (${e.message}) — expected a valid example topic object`);
  }
  if (schema && fixtureParsed) {
    const where = `topic-metadata: ${FIXTURE_PATH}`;
    const props = (schema.properties && typeof schema.properties === 'object') ? schema.properties : {};
    if (!fixture || typeof fixture !== 'object' || Array.isArray(fixture)) {
      fail(`${where} must be a JSON object — actual: ${Array.isArray(fixture) ? 'array' : typeof fixture}`);
    } else {
      for (const key of (schema.required || [])) {
        if (!Object.prototype.hasOwnProperty.call(fixture, key)) fail(`${where} is missing required field "${key}"`);
      }
      if (schema.additionalProperties === false) {
        for (const key of Object.keys(fixture)) {
          if (!Object.prototype.hasOwnProperty.call(props, key)) fail(`${where} has unexpected field "${key}" (schema allows no additional properties)`);
        }
      }
      const typeOk = (v, t) => {
        if (t === 'integer') return typeof v === 'number' && Number.isInteger(v);
        if (t === 'number') return typeof v === 'number' && Number.isFinite(v);
        if (t === 'array') return Array.isArray(v);
        return typeof v === t;
      };
      const checkValue = (v, def, label) => {
        if (!def || typeof def !== 'object') return;
        if (def.type && !typeOk(v, def.type)) {
          fail(`${where} field "${label}" must be ${def.type} — actual: ${Array.isArray(v) ? 'array' : typeof v}`);
          return;
        }
        if (def.enum && !def.enum.includes(v)) {
          fail(`${where} field "${label}" must be one of [${def.enum.join(', ')}] — actual: ${JSON.stringify(v)}`);
        }
        if (typeof v === 'string') {
          if (def.minLength !== undefined && v.length < def.minLength) fail(`${where} field "${label}" must be at least ${def.minLength} character(s) — actual: empty`);
          if (def.maxLength !== undefined && v.length > def.maxLength) fail(`${where} field "${label}" must be at most ${def.maxLength} characters — actual: ${v.length}`);
          if (def.pattern && !(new RegExp(def.pattern).test(v))) fail(`${where} field "${label}" must match ${def.pattern} — actual: ${JSON.stringify(v)}`);
          if (def.minLength && !v.trim()) fail(`${where} field "${label}" must not be blank/whitespace-only`);
        }
        if (typeof v === 'number') {
          if (def.minimum !== undefined && v < def.minimum) fail(`${where} field "${label}" must be >= ${def.minimum} — actual: ${v}`);
          if (def.maximum !== undefined && v > def.maximum) fail(`${where} field "${label}" must be <= ${def.maximum} — actual: ${v}`);
        }
        if (Array.isArray(v)) {
          if (def.minItems !== undefined && v.length < def.minItems) fail(`${where} field "${label}" must have at least ${def.minItems} item(s) — actual: ${v.length}`);
          if (def.items) v.forEach((item, i) => checkValue(item, def.items, `${label}[${i}]`));
        }
      };
      for (const [key, def] of Object.entries(props)) {
        if (Object.prototype.hasOwnProperty.call(fixture, key)) checkValue(fixture[key], def, key);
      }
      // Cross-checks against the repo (only when values are well-formed).
      const modNum = fixture.module;
      const seqNum = fixture.sequence;
      if (typeof fixture.courseCode === 'string' && curriculumDoc) {
        if (!Object.prototype.hasOwnProperty.call(curriculumDoc.curriculum, fixture.courseCode)) {
          fail(`${where} courseCode "${fixture.courseCode}" is not a course in ${CURRICULUM_PATH} — expected an existing course`);
        } else if (Number.isInteger(modNum)) {
          const nums = curriculumDoc.curriculum[fixture.courseCode].modules.map((m) => m.number);
          if (!nums.includes(modNum)) fail(`${where} module ${modNum} is not a module of "${fixture.courseCode}" in ${CURRICULUM_PATH} — expected one of [${nums.join(', ')}]`);
        }
      }
      if (typeof fixture.id === 'string' && Number.isInteger(modNum) && Number.isInteger(seqNum)) {
        const prefix = `m${modNum}_${String(seqNum).padStart(2, '0')}_`;
        if (!fixture.id.startsWith(prefix)) fail(`${where} id "${fixture.id}" does not match the m{module}_{sequence}_ filename convention — expected prefix "${prefix}"`);
      }
      if (typeof fixture.id === 'string' && typeof fixture.courseCode === 'string') {
        const md = path.join('content', fixture.courseCode, `${fixture.id}.md`);
        if (!fs.existsSync(md)) fail(`${where} id "${fixture.id}" has no content file ${md} — expected the fixture to describe a real topic`);
      }
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
