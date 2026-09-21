/**
 * Shared build output — dist/ directory management and all generated-file
 * writes (topic HTML, navigation_index.json, sitemap.xml, style.css,
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

export function writeNavigationIndex(outputDir, coursesData) {
  fs.writeFileSync(path.join(outputDir, 'navigation_index.json'), JSON.stringify(coursesData, null, 2), 'utf-8');
}

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
