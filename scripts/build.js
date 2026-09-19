import fs from 'fs';
import path from 'path';
import { CURRICULUM_PATH, loadCurriculum } from './curriculum.js';
import {
  listContentCourses,
  resolveCoursePath,
  listTopicFiles,
  parseTopicFile,
  findTopicFilenameIssues,
} from './content.js';
import {
  readTopicMarkdown,
  renderMarkdown,
  escapeHtml,
  linkSections,
  buildJumpPills,
} from './markdown.js';
import { transformCustomWidgets } from './widgets.js';
import {
  formatTopicTitle,
  renderSubjectDetails,
  renderTopicDocument,
} from './pages.js';

const CONTENT_DIR = 'content';
const OUTPUT_DIR = 'dist';
const TEMPLATE_PATH = path.join('templates', 'base.html');

// Single source of truth: all curriculum metadata (course names, module
// names, dashboard ordering) comes from data/curriculum.json, loaded via
// the shared scripts/curriculum.js loader (fails loudly when the file is
// missing, malformed, or structurally invalid). Topic counts and topic
// lists always come from content/ — never from the JSON.
const CURRICULUM_DOC = loadCurriculum();

// Derived view over the canonical document (same shape the build
// previously hardcoded inline, so the rest of the pipeline is untouched).
const MODULE_NAMES = Object.fromEntries(
  Object.values(CURRICULUM_DOC.curriculum).map((c) => [
    c.code,
    Object.fromEntries((c.modules || []).map((m) => [m.number, m.name]))
  ])
);

// Markdown file reading, Markdown → HTML conversion (marked
// configuration), HTML escaping, and heading/section helpers live in the
// shared scripts/markdown.js module; custom `:::` widget preprocessing
// (callouts, quizzes, steps, toggles, manim, scenes) lives in the shared
// scripts/widgets.js module; navigation, subject-detail, template, and
// topic-page HTML assembly live in the shared scripts/pages.js module.

export function buildSite() {
  const templateStr = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const coursesData = {};
  const warnings = [];

  // Clean output first so renamed/deleted .md files don't leave stale .html behind.
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Course/topic discovery comes from the shared scripts/content.js
  // module (course dirs, sorted .md files, file-path resolution); topic
  // counts and lists always derive from content/ — never from the JSON.
  const courseCodes = listContentCourses(CONTENT_DIR);

  for (const courseCode of courseCodes) {
    const coursePath = resolveCoursePath(CONTENT_DIR, courseCode);

    const courseOutDir = path.join(OUTPUT_DIR, courseCode);
    if (!fs.existsSync(courseOutDir)) {
      fs.mkdirSync(courseOutDir, { recursive: true });
    }

    // The curriculum entry is mandatory: a content directory without a
    // data/curriculum.json entry fails the build (no silent fallback).
    const curriculumEntry = CURRICULUM_DOC.curriculum[courseCode];
    if (!curriculumEntry) {
      throw new Error(
        `Content course "${courseCode}" (content/${courseCode}/) has no entry in ` +
        `${CURRICULUM_PATH}. Add it to data/curriculum.json — the build has no hardcoded fallback.`
      );
    }
    const courseName = curriculumEntry.name;
    const modules = {};
    const pages = [];

    const files = listTopicFiles(coursePath);

    // Validate naming convention m{mod}_{seq}_{slug}.md: flag duplicate seq + gaps.
    for (const issue of findTopicFilenameIssues(courseCode, files)) warnings.push(issue);

    for (const filename of files) {
      const parsed = parseTopicFile(coursePath, filename);
      const modNum = parsed.modNum;
      const title = formatTopicTitle(filename);
      const htmlFilename = parsed.htmlFilename;

      if (!modules[modNum]) {
        const modTitle = MODULE_NAMES[courseCode]?.[modNum] || `Module ${modNum}`;
        modules[modNum] = { num: modNum, title: modTitle, topics: [] };
      }

      const pageData = {
        id: parsed.id,
        title: title,
        filename: htmlFilename,
        source_path: parsed.sourcePath
      };

      modules[modNum].topics.push(pageData);
      pages.push({ modNum, pageData });
    }

    // Render pages
    for (let idx = 0; idx < pages.length; idx++) {
      const { modNum, pageData: page } = pages[idx];
      const rawMarkdown = readTopicMarkdown(page.source_path);

      const wordCount = rawMarkdown.split(/\s+/).length;
      const readTime = Math.max(2, Math.round(wordCount / 180));

      const preprocessedMarkdown = transformCustomWidgets(rawMarkdown);

      // Warn on manim refs pointing at missing files (all 8 mp4s currently orphaned).
      for (const m of preprocessedMarkdown.matchAll(/<source src="\.\.\/(.*?)" type="video\/mp4">/g)) {
        const rel = m[1].replace(/^\//, '');
        if (!fs.existsSync(rel)) warnings.push(`${courseCode}/${page.filename}: video missing ${rel}`);
      }

      const renderedHtmlBody = linkSections(renderMarkdown(preprocessedMarkdown));

      const prevPage = idx > 0 ? pages[idx - 1].pageData : null;
      const nextPage = idx < pages.length - 1 ? pages[idx + 1].pageData : null;

      const jumpBar = buildJumpPills(rawMarkdown);

      // Topic-page HTML assembly (header + body through the base
      // template) lives in the shared scripts/pages.js module.
      const fullHtmlDoc = renderTopicDocument({
        templateStr,
        page,
        modNum,
        modules,
        prevPage,
        nextPage,
        totalTopics: pages.length,
        courseCode,
        courseName,
        renderedHtmlBody,
        jumpBar,
        readTime,
      });

      const targetPath = path.join(courseOutDir, page.filename);
      fs.writeFileSync(targetPath, fullHtmlDoc, 'utf-8');
    }

    coursesData[courseCode] = {
      name: courseName,
      modules: modules
    };
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'navigation_index.json'), JSON.stringify(coursesData, null, 2), 'utf-8');

  // Sitemap for SEO (relative URLs; Pages serves dist/ as root).
  {
    const urls = ['index.html'];
    for (const [courseCode, course] of Object.entries(coursesData)) {
      for (const mod of Object.values(course.modules)) {
        for (const topic of mod.topics) urls.push(`${courseCode}/${topic.filename}`);
      }
    }
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map(u => `  <url><loc>${escapeHtml(u)}</loc></url>`).join('\n') + `\n</urlset>\n`;
    fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), sitemap, 'utf-8');
  }

  // Copy style.css to dist
  if (fs.existsSync('style.css')) {
    fs.copyFileSync('style.css', path.join(OUTPUT_DIR, 'style.css'));
  }

  // Create .nojekyll in dist
  fs.writeFileSync(path.join(OUTPUT_DIR, '.nojekyll'), '', 'utf-8');

  // Dashboard subject-detail injection (Topics step of the flow).
  // Root index.html carries empty TARANGAM-SUBJECT-DETAILS markers; the
  // build fills them with per-course module/topic blocks so both Pages
  // modes (branch root + artifact) serve identical lists with zero fetching.
  // Replacement is deterministic (same content → same bytes), so diffs stay
  // reviewable; missing markers fail loudly instead of shipping empty screens.
  if (fs.existsSync('index.html')) {
    const START = '<!-- TARANGAM-SUBJECT-DETAILS:START -->';
    const END = '<!-- TARANGAM-SUBJECT-DETAILS:END -->';
    let rootIndex = fs.readFileSync('index.html', 'utf-8');
    const si = rootIndex.indexOf(START);
    const ei = rootIndex.indexOf(END);
    if (si === -1 || ei === -1 || ei < si) {
      throw new Error('index.html missing TARANGAM-SUBJECT-DETAILS markers — dashboard topics view cannot be built');
    }
    const detailsHtml = renderSubjectDetails(coursesData, CURRICULUM_DOC.dashboardOrder);
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

  // Copy root index.html to dist/index.html with adjusted paths for standalone hosting.
  // Root uses dist/<COURSE>/... links (branch-root mode); inside dist/ the
  // same cards must be explicitly relative (./<COURSE>/...) for artifact mode.
  // NOTE: a hardcoded /Tarangam-app-v2/ base is deliberately NOT used — it
  // would break one of the two modes (branch root needs dist/ prefix,
  // artifact root must not have it). Explicit relative paths serve both.
  if (fs.existsSync('index.html')) {
    let rootIndex = fs.readFileSync('index.html', 'utf-8');
    // Replace "dist/" prefix for links inside dist/
    const standaloneIndex = rootIndex.replace(/href="dist\//g, 'href="./');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), standaloneIndex, 'utf-8');
  }

  // Copy assets and media if they exist
  if (fs.existsSync('assets')) {
    fs.cpSync('assets', path.join(OUTPUT_DIR, 'assets'), { recursive: true });
  }
  if (fs.existsSync('media')) {
    fs.cpSync('media', path.join(OUTPUT_DIR, 'media'), { recursive: true });
  }

  console.log('✅ Tarangam curriculum compilation completed successfully.');
  if (warnings.length) {
    console.warn(`⚠️ ${warnings.length} build warning(s):`);
    for (const w of warnings.slice(0, 50)) console.warn('  - ' + w);
  }
}

const isMain = process.argv[1] && process.argv[1].endsWith('build.js');
if (isMain) buildSite();
