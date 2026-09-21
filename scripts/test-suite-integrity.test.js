/**
 * Deterministic release-integrity tests (node:test + node:assert only — no
 * test framework). Guards the test infrastructure itself: every test suite
 * on disk must be wired into `npm test` (so CI actually runs it), every
 * wired entry must exist, every suite file must be syntactically valid,
 * non-empty, and free of references to identifiers it never defines or
 * imports (a suite that throws at definition time never runs, silently
 * shrinking coverage).
 *
 * Run: npm test  (node --test scripts/test-suite-integrity.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const read = (f) => fs.readFileSync(f, 'utf-8');
const suiteFiles = () => fs.readdirSync('scripts').filter((f) => f.endsWith('.test.js')).sort();

// Identifiers available without import in any suite file.
const AMBIENT_GLOBALS = new Set([
  'console', 'process', 'Buffer', 'URL', 'URLSearchParams', 'setTimeout',
  'clearTimeout', 'setInterval', 'clearInterval', 'queueMicrotask',
  'structuredClone', 'fetch', 'Response', 'Request', 'Headers',
  'describe', 'it', 'test', 'before', 'after', 'beforeEach', 'afterEach',
  'Object', 'Array', 'String', 'Number', 'Boolean', 'BigInt', 'Symbol',
  'Math', 'JSON', 'Date', 'RegExp', 'Error', 'RangeError', 'TypeError',
  'Map', 'Set', 'WeakMap', 'WeakSet', 'Promise', 'Proxy', 'Reflect', 'Intl',
  'ArrayBuffer', 'DataView', 'Uint8Array',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite',
  'encodeURIComponent', 'decodeURIComponent', 'require', '__dirname',
]);
// Language keywords that look like calls (if(, async(, ...) but never throw.
const SYNTAX_NOISE = new Set([
  'if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'typeof',
  'instanceof', 'in', 'of', 'new', 'await', 'async', 'yield', 'delete',
  'void', 'import', 'export', 'default',
]);

function strippedLines(source) {
  const out = [];
  let inBlockComment = false;
  for (const raw of source.split('\n')) {
    let line = raw;
    if (inBlockComment) {
      const end = line.indexOf('*/');
      if (end === -1) {
        out.push('');
        continue;
      }
      line = line.slice(end + 2);
      inBlockComment = false;
    }
    line = line.replace(/\/\/.*$/, '');
    const start = line.indexOf('/*');
    if (start !== -1) {
      const end = line.indexOf('*/', start + 2);
      if (end === -1) {
        line = line.slice(0, start);
        inBlockComment = true;
      } else {
        line = line.slice(0, start) + line.slice(end + 2);
      }
    }
    line = line.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g, "''");
    // Regex literals (e.g. /<h([1-6])>/) would fake call targets and
    // braces; strip spans that open where only a regex can appear.
    line = line.replace(/(?<![\w$)\]'"])\/(?:[^/\\\n\[]|\[[^\]\n]*\]|\\.)+\/[a-z]*/g, "''");
    out.push(line);
  }
  return out;
}

// Call targets used directly inside top-level describe bodies, which run at
// file load: each must resolve to an import, a local definition, or an
// ambient global. Nested it/test/describe callbacks run later inside the
// test runner (parameters and closure state in scope), so only the opener
// line of a nested scope is scanned — its arguments execute at load.
function undefinedDescribeCalls(source, defined) {
  const missing = new Set();
  const lines = strippedLines(source);
  // Top-level describe blocks: [start, end] line ranges at module depth.
  const blocks = [];
  let depth = 0;
  let open = -1;
  lines.forEach((line, i) => {
    if (depth === 0 && /^describe\s*\(/.test(line.trim())) open = i;
    depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    if (open !== -1 && depth === 0) {
      blocks.push([open, i]);
      open = -1;
    }
  });
  const scan = (line) => {
    for (const m of line.matchAll(/(?<![.\w$])([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g)) {
      const name = m[1];
      if (!defined.has(name) && !AMBIENT_GLOBALS.has(name) && !SYNTAX_NOISE.has(name)) {
        missing.add(name);
      }
    }
  };
  for (const [start, end] of blocks) {
    let rel = 0;
    let nested = 0;
    for (let i = start; i <= end; i++) {
      const line = lines[i];
      if (rel === 1) {
        if (/\b(describe|it|test)\s*\(/.test(line)) {
          scan(line); // opener arguments execute at load
          nested = rel;
        } else if (nested === 0) {
          scan(line);
        }
      }
      rel += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      if (nested !== 0 && rel <= nested) nested = 0;
    }
  }
  return [...missing].sort();
}

function definedIdentifiers(source) {
  const defined = new Set();
  for (const m of source.matchAll(/^import\s+([^;]+?)\s+from\s+['"][^'"]+['"]/gm)) {
    const clause = m[1].trim();
    const namespace = clause.match(/^\*\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)$/);
    if (namespace) {
      defined.add(namespace[1]);
      continue;
    }
    const named = clause.match(/\{([^}]*)\}/);
    if (named) {
      for (const part of named[1].split(',')) {
        const alias = part.trim().match(/(?:^|\s)([A-Za-z_$][A-Za-z0-9_$]*)$/);
        if (alias) defined.add(alias[1]);
      }
    }
    const def = clause.match(/^([A-Za-z_$][A-Za-z0-9_$]*)$/);
    if (def) defined.add(def[1]);
  }
  for (const m of source.matchAll(/^(?:const|let|var|function)\s+([A-Za-z_$][A-Za-z0-9_$]*)/gm)) {
    defined.add(m[1]);
  }
  return defined;
}

describe('suites wired into CI', () => {
  it('runs every suite on disk with no dangling entries', () => {
    const pkg = JSON.parse(read('package.json'));
    const entries = pkg.scripts.test.split(/\s+/).filter((t) => t.endsWith('.test.js'));
    const onDisk = suiteFiles();
    for (const file of onDisk) {
      assert.ok(
        entries.includes(`scripts/${file}`),
        `suite scripts/${file} exists but is not wired into npm test (CI would never run it)`,
      );
    }
    for (const entry of entries) {
      assert.ok(fs.existsSync(entry), `npm test lists ${entry} — actual: missing on disk`);
    }
    assert.ok(onDisk.length >= 30, `expected the full v1 suite family — actual: ${onDisk.length} files`);
  });
});

describe('suites structurally sound', () => {
  it('parses every suite file with node --check', () => {
    for (const file of suiteFiles()) {
      try {
        execFileSync(process.execPath, ['--check', path.join('scripts', file)], { stdio: 'pipe' });
      } catch (e) {
        assert.fail(`scripts/${file} fails syntax check: ${(e.stderr || e.message || e).toString().slice(0, 300)}`);
      }
    }
  });

  it('holds at least one test per suite file', () => {
    for (const file of suiteFiles()) {
      const source = read(path.join('scripts', file));
      assert.ok(
        /\bit\s*\(|\btest\s*\(/.test(source),
        `scripts/${file} defines no tests`,
      );
    }
  });

  it('references no undefined calls at suite-definition time', () => {
    for (const file of suiteFiles()) {
      const source = read(path.join('scripts', file));
      const missing = undefinedDescribeCalls(source, definedIdentifiers(source));
      assert.deepEqual(
        missing,
        [],
        `scripts/${file} would throw at load time (suite never runs): undefined ${missing.join(', ')}`,
      );
    }
  });
});

describe('integrity suite stays wired', () => {
  it('runs in npm test', () => {
    const pkg = JSON.parse(read('package.json'));
    assert.ok(pkg.scripts.test.includes('test-suite-integrity.test.js'), 'suite must run in npm test');
  });
});
