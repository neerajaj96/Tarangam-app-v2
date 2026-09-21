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
  linkSections,
  buildJumpPills,
} from './markdown.js';
import { transformCustomWidgets } from './widgets.js';
import { loadTopicSchema, parseAndValidateTopicFrontMatter } from './topic-metadata.js';
import {
  formatTopicTitle,
  renderTopicDocument,
} from './pages.js';
import {
  OUTPUT_DIR,
  cleanOutputDir,
  ensureCourseDir,
  writeTopicHtml,
  writeNavigationIndex,
  writeSitemap,
  writeTopicManifest,
  writeStaticRootFiles,
  injectDashboardSubjectDetails,
  writeStandaloneIndex,
  copyExplorerPage,
  copyAssessmentPage,
  copyAssessmentData,
  copyDashboardPage,
  copyCoursePage,
  copyPwaAssets,
  injectServiceWorkerVersion,
  copyAssetDirs,
} from './output.js';
import { buildTopicManifest } from './topic-manifest.js';

const CONTENT_DIR = 'content';
const TEMPLATE_PATH = path.join('templates', 'base.html');

// Single source of truth: all curriculum metadata (course names, module
// names, dashboard ordering) comes from data/curriculum.json, loaded via
// the shared scripts/curriculum.js loader (fails loudly when the file is
// missing, malformed, or structurally invalid). Topic counts and topic
// lists always come from content/ — never from the JSON.
const CURRICULUM_DOC = loadCurriculum();

// Canonical topic metadata schema (data/topic-schema.json), loaded via
// the shared scripts/topic-metadata.js loader; fails loudly when the
// file is missing or malformed, like the curriculum.
const TOPIC_SCHEMA = loadTopicSchema();

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
// topic-page HTML assembly live in the shared scripts/pages.js module;
// dist/ creation/cleaning, generated-file writes, sitemap, dashboard
// injection, and asset copying live in the shared scripts/output.js
// module; topic front-matter parsing lives in the shared
// scripts/topic-metadata.js module; the validated topic manifest lives
// in the shared scripts/topic-manifest.js module; this file orchestrates
// data preparation and the build.

// Attach validated front-matter metadata to the topic's internal build
// representation. Stored as non-enumerable properties so JSON output
// (navigation_index.json) stays byte-identical during migration.
// canonicalTitle/estimatedMinutes resolve metadata-first with the
// filename/content-derived values as fallback; rendering still uses the
// derived title/read-time until a later UI task consumes the canonical
// values, so visible output is unchanged.
function attachTopicMetadata(pageData, metadata, fallback) {
  Object.defineProperties(pageData, {
    metadata: { value: metadata ?? null, enumerable: false },
    canonicalTitle: { value: metadata?.title ?? fallback.title, enumerable: false },
    estimatedMinutes: { value: metadata?.estimatedMinutes ?? fallback.readTime, enumerable: false },
  });
}

export function buildSite() {
  const templateStr = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const coursesData = {};
  const warnings = [];

  // Clean output first so renamed/deleted .md files don't leave stale .html behind.
  cleanOutputDir(OUTPUT_DIR);

  // Course/topic discovery comes from the shared scripts/content.js
  // module (course dirs, sorted .md files, file-path resolution); topic
  // counts and lists always derive from content/ — never from the JSON.
  const courseCodes = listContentCourses(CONTENT_DIR);

  for (const courseCode of courseCodes) {
    const coursePath = resolveCoursePath(CONTENT_DIR, courseCode);

    const courseOutDir = ensureCourseDir(OUTPUT_DIR, courseCode);

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

      // Structured topic metadata (front-matter) is parsed, validated via
      // scripts/topic-metadata.js, and attached to the topic's internal
      // representation; topics without it pass through unchanged with
      // derived values as the fallback, so metadata stays optional during
      // the migration phase.
      const { metadata: topicMetadata, body: topicMarkdown } = parseAndValidateTopicFrontMatter(
        rawMarkdown,
        {
          schema: TOPIC_SCHEMA,
          curriculumDoc: CURRICULUM_DOC,
          label: `topic-metadata: ${page.source_path}#front-matter`,
          expectedCourseCode: courseCode,
          expectedId: page.id,
        }
      );

      const wordCount = topicMarkdown.split(/\s+/).length;
      const readTime = Math.max(2, Math.round(wordCount / 180));
      attachTopicMetadata(page, topicMetadata, { title: page.title, readTime });

      const preprocessedMarkdown = transformCustomWidgets(topicMarkdown);

      // Warn on manim refs pointing at missing files (all 8 mp4s currently orphaned).
      for (const m of preprocessedMarkdown.matchAll(/<source src="\.\.\/(.*?)" type="video\/mp4">/g)) {
        const rel = m[1].replace(/^\//, '');
        if (!fs.existsSync(rel)) warnings.push(`${courseCode}/${page.filename}: video missing ${rel}`);
      }

      const renderedHtmlBody = linkSections(renderMarkdown(preprocessedMarkdown));

      const prevPage = idx > 0 ? pages[idx - 1].pageData : null;
      const nextPage = idx < pages.length - 1 ? pages[idx + 1].pageData : null;

      const jumpBar = buildJumpPills(topicMarkdown);

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

      writeTopicHtml(courseOutDir, page.filename, fullHtmlDoc);
    }

    coursesData[courseCode] = {
      name: courseName,
      modules: modules
    };
  }

  // Generated-file writes, sitemap, static files, dashboard injection,
  // standalone index, and asset copies live in scripts/output.js.
  writeNavigationIndex(OUTPUT_DIR, coursesData);

  writeSitemap(OUTPUT_DIR, coursesData);

  // Static topic manifest from the validated graph (fails loudly on
  // graph integrity errors); HTML output is untouched by this step.
  writeTopicManifest(OUTPUT_DIR, buildTopicManifest({ curriculumDoc: CURRICULUM_DOC, schema: TOPIC_SCHEMA }));

  writeStaticRootFiles(OUTPUT_DIR);

  injectDashboardSubjectDetails(coursesData, CURRICULUM_DOC.dashboardOrder);

  writeStandaloneIndex(OUTPUT_DIR);

  copyExplorerPage(OUTPUT_DIR);

  copyAssessmentPage(OUTPUT_DIR);

  copyAssessmentData(OUTPUT_DIR);

  copyDashboardPage(OUTPUT_DIR);

  copyCoursePage(OUTPUT_DIR);

  copyPwaAssets(OUTPUT_DIR);

  injectServiceWorkerVersion(OUTPUT_DIR);

  copyAssetDirs(OUTPUT_DIR);

  console.log('✅ Tarangam curriculum compilation completed successfully.');
  if (warnings.length) {
    console.warn(`⚠️ ${warnings.length} build warning(s):`);
    for (const w of warnings.slice(0, 50)) console.warn('  - ' + w);
  }
}

const isMain = process.argv[1] && process.argv[1].endsWith('build.js');
if (isMain) buildSite();
