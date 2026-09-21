/**
 * Shared build output — dist/ directory management and all generated-file
 * writes (topic HTML, sitemap.xml, style.css,
 * .nojekyll, dashboard subject-detail injection into index.html,
 * standalone dist/index.html, assets/media copies), used by
 * scripts/build.js. ES module style like the rest of scripts/.
 *
 * Only output-generation lives here. It reuses escapeHtml from
 * scripts/markdown.js and renderSubjectDetails from scripts/pages.js
 * rather than duplicating them. No curriculum loading, content discovery,
 * Markdown parsing, widget preprocessing, page/template rendering,
 * curriculum validation, learner state, or UI logic.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'node:crypto';
import { escapeHtml } from './markdown.js';
import { renderSubjectDetails } from './pages.js';

export const OUTPUT_DIR = 'dist';

// Clean output first so renamed/deleted .md files don't leave stale .html behind.
export function cleanOutputDir(outputDir = OUTPUT_DIR) {
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outputDir, { recursive: true });
}

export function ensureCourseDir(outputDir, courseCode) {
  const courseOutDir = path.join(outputDir, courseCode);
  if (!fs.existsSync(courseOutDir)) {
    fs.mkdirSync(courseOutDir, { recursive: true });
  }
  return courseOutDir;
}

export function writeTopicHtml(courseOutDir, filename, html) {
  const targetPath = path.join(courseOutDir, filename);
  fs.writeFileSync(targetPath, html, 'utf-8');
}

// NOTE: no navigation_index.json is published. It was previously written
// to dist/ but nothing — no page, script, test, sitemap, or doc — ever
// reads it, so shipping 125KB of duplicated catalog data served no
// learner. coursesData is still built in memory for the sitemap and
// dashboard injection below.

// Sitemap for SEO (relative URLs; Pages serves dist/ as root).
export function writeSitemap(outputDir, coursesData) {
  const urls = ['index.html'];
  for (const [courseCode, course] of Object.entries(coursesData)) {
    for (const mod of Object.values(course.modules)) {
      for (const topic of mod.topics) urls.push(`${courseCode}/${topic.filename}`);
    }
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url><loc>${escapeHtml(u)}</loc></url>`).join('\n') + `\n</urlset>\n`;
  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemap, 'utf-8');
}

// Topic manifest for future browser-side consumption (static JSON, no
// Markdown parsing needed). Stable formatting: sorted content from the
// manifest builder plus a trailing newline; no timestamps.
export function writeTopicManifest(outputDir, manifest) {
  const dir = path.join(outputDir, 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, 'topic-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
}

export function writeStaticRootFiles(outputDir) {
  // Copy style.css to dist
  if (fs.existsSync('style.css')) {
    fs.copyFileSync('style.css', path.join(outputDir, 'style.css'));
  }

  // Create .nojekyll in dist
  fs.writeFileSync(path.join(outputDir, '.nojekyll'), '', 'utf-8');
}

// Dashboard subject-detail injection (Topics step of the flow).
// Root index.html carries empty TARANGAM-SUBJECT-DETAILS markers; the
// build fills them with per-course module/topic blocks so both Pages
// modes (branch root + artifact) serve identical lists with zero fetching.
// Replacement is deterministic (same content → same bytes), so diffs stay
// reviewable; missing markers fail loudly instead of shipping empty screens.
export function injectDashboardSubjectDetails(coursesData, dashboardOrder) {
  if (fs.existsSync('index.html')) {
    const START = '<!-- TARANGAM-SUBJECT-DETAILS:START -->';
    const END = '<!-- TARANGAM-SUBJECT-DETAILS:END -->';
    let rootIndex = fs.readFileSync('index.html', 'utf-8');
    const si = rootIndex.indexOf(START);
    const ei = rootIndex.indexOf(END);
    if (si === -1 || ei === -1 || ei < si) {
      throw new Error('index.html missing TARANGAM-SUBJECT-DETAILS markers — dashboard topics view cannot be built');
    }
    const detailsHtml = renderSubjectDetails(coursesData, dashboardOrder);
    rootIndex = rootIndex.slice(0, si + START.length) + '\n' + detailsHtml + '\n' + rootIndex.slice(ei);
    // Fill per-subject topic counts on the subject buttons (same determinism).
    rootIndex = rootIndex.replace(
      /<span class="subject-count" data-topic-count="([A-Za-z0-9]+)">.*?<\/span>/g,
      (m, code) => {
        const n = Object.values((coursesData[code] || {}).modules || {}).reduce((a, mod) => a + mod.topics.length, 0);
        return `<span class="subject-count" data-topic-count="${code}">${n} topics</span>`;
      }
    );
    fs.writeFileSync('index.html', rootIndex, 'utf-8');
  }
}

// Copy root index.html to dist/index.html with adjusted paths for standalone hosting.
// Root uses dist/<COURSE>/... links (branch-root mode); inside dist/ the
// same cards must be explicitly relative (./<COURSE>/...) for artifact mode.
// NOTE: a hardcoded /Tarangam-app-v2/ base is deliberately NOT used — it
// would break one of the two modes (branch root needs dist/ prefix,
// artifact root must not have it). Explicit relative paths serve both.
export function writeStandaloneIndex(outputDir) {
  if (fs.existsSync('index.html')) {
    let rootIndex = fs.readFileSync('index.html', 'utf-8');
    // Replace "dist/" prefix for links inside dist/
    const standaloneIndex = rootIndex.replace(/href="dist\//g, 'href="./');
    fs.writeFileSync(path.join(outputDir, 'index.html'), standaloneIndex, 'utf-8');
  }
}

// Copy the learner dashboard page (links resolve the same way as the
// explorer page, so no path rewrite is needed here).
export function copyDashboardPage(outputDir) {
  if (fs.existsSync('dashboard.html')) {
    fs.copyFileSync('dashboard.html', path.join(outputDir, 'dashboard.html'));
  }
}

// Copy the course overview page (manifest, learner state, and question
// bank all resolve client-side at runtime, so no path rewrite is needed
// here — same static-first pattern as the explorer page).
export function copyCoursePage(outputDir) {
  if (fs.existsSync('course.html')) {
    fs.copyFileSync('course.html', path.join(outputDir, 'course.html'));
  }
}

// Copy the PWA/static-offline assets: web manifest, service worker,
// offline fallback page, and icons. Copies are byte-identical except
// dist/sw.js, which injectServiceWorkerVersion stamps with the
// deterministic cache version (relative URLs resolve within the
// deployment scope, so no path rewrite is needed for domain-root or
// Pages-subpath hosting).
export function copyPwaAssets(outputDir) {
  if (fs.existsSync('manifest.webmanifest')) {
    fs.copyFileSync('manifest.webmanifest', path.join(outputDir, 'manifest.webmanifest'));
  }
  if (fs.existsSync('sw.js')) {
    fs.copyFileSync('sw.js', path.join(outputDir, 'sw.js'));
  }
  if (fs.existsSync('offline.html')) {
    fs.copyFileSync('offline.html', path.join(outputDir, 'offline.html'));
  }
  if (fs.existsSync('icons')) {
    fs.cpSync('icons', path.join(outputDir, 'icons'), { recursive: true });
  }
}

export const SERVICE_WORKER_VERSION_TOKEN = '__TARANGAM_VERSION__';

// Deterministic service-worker version: `tarangam-<12 hex>` over every
// shipped byte the user can observe — the shell file list named in sw.js
// (resolved against the repo root, sorted), curriculum data, topic
// Markdown, templates, and entry pages. Same inputs always mint the same
// version; any visible change rotates caches on the next activation.
// Exported so tests assert the published worker carries exactly this.
export function computeServiceWorkerVersion() {
  const shellBlock = fs.readFileSync('sw.js', 'utf-8').split('SHELL_URLS')[1] || '';
  const shellFiles = [...new Set(
    [...shellBlock.matchAll(/'(\.\/[^']+)'/g)]
      .map((m) => m[1].slice(2))
      .filter((p) => !p.endsWith('/') && fs.existsSync(p) && fs.statSync(p).isFile())
  )].sort();
  const extraInputs = [];
  const collect = (dir, suffix) => {
    if (!fs.existsSync(dir)) return;
    const walk = (d) => {
      for (const name of fs.readdirSync(d).sort()) {
        const p = path.join(d, name);
        if (fs.statSync(p).isDirectory()) walk(p);
        else if (p.endsWith(suffix)) extraInputs.push(p);
      }
    };
    walk(dir);
  };
  collect('content', '.md');
  collect('templates', '.html');
  const hash = crypto.createHash('sha256');
  for (const file of shellFiles) {
    hash.update(`file:${file}\n`);
    hash.update(fs.readFileSync(file));
    hash.update('\n');
  }
  for (const file of [
    ...extraInputs,
    'data/curriculum.json', 'data/assessments.json', 'manifest.webmanifest', 'offline.html',
    'index.html', 'dashboard.html', 'explorer.html', 'course.html', 'assessment.html',
  ].filter((f) => fs.existsSync(f) && fs.statSync(f).isFile()).sort()) {
    hash.update(`file:${file}\n`);
    hash.update(fs.readFileSync(file));
    hash.update('\n');
  }
  return `tarangam-${hash.digest('hex').slice(0, 12)}`;
}

// Stamp the published worker with the deterministic version. The source
// sw.js keeps the placeholder (development only); dist/sw.js carries the
// minted version. Idempotent for identical inputs.
export function injectServiceWorkerVersion(outputDir = OUTPUT_DIR) {
  const target = path.join(outputDir, 'sw.js');
  if (!fs.existsSync(target)) return null;
  const version = computeServiceWorkerVersion();
  const stamped = fs.readFileSync(target, 'utf-8').split(SERVICE_WORKER_VERSION_TOKEN).join(version);
  fs.writeFileSync(target, stamped);
  return version;
}

// Copy the curriculum explorer page (its topic links resolve client-side
// against the manifest base URL, so no path rewrite is needed here).
export function copyExplorerPage(outputDir) {
  if (fs.existsSync('explorer.html')) {
    fs.copyFileSync('explorer.html', path.join(outputDir, 'explorer.html'));
  }
}

// Copy the self-assessment page (question bank + manifest resolve
// client-side at runtime, so no path rewrite is needed here).
export function copyAssessmentPage(outputDir) {
  if (fs.existsSync('assessment.html')) {
    fs.copyFileSync('assessment.html', path.join(outputDir, 'assessment.html'));
  }
}

// Copy the static assessment question bank for browser-side consumption
// (deterministic bytes: exact copy of data/assessments.json).
export function copyAssessmentData(outputDir) {
  if (fs.existsSync(path.join('data', 'assessments.json'))) {
    const dir = path.join(outputDir, 'data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(path.join('data', 'assessments.json'), path.join(dir, 'assessments.json'));
  }
}

// Copy assets and media if they exist
export function copyAssetDirs(outputDir) {
  if (fs.existsSync('assets')) {
    fs.cpSync('assets', path.join(outputDir, 'assets'), { recursive: true });
  }
  if (fs.existsSync('media')) {
    fs.cpSync('media', path.join(outputDir, 'media'), { recursive: true });
  }
}
