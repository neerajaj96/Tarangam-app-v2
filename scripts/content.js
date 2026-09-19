/**
 * Shared content discovery — course directories, Markdown topic files, and
 * topic file-path resolution under content/, used by scripts/build.js.
 * Zero dependencies; ES module style like the rest of scripts/.
 *
 * Only filesystem discovery + filename/path normalization live here. No
 * Markdown rendering, widget parsing, HTML generation, templates, scenes,
 * curriculum validation, or UI logic.
 */
import fs from 'fs';
import path from 'path';

export const CONTENT_DIR = 'content';

// Course directory names under contentDir, in readdir order, directories
// only (same iteration semantics the build previously inlined).
export function listContentCourses(contentDir = CONTENT_DIR) {
  return fs.readdirSync(contentDir).filter((entry) => {
    try {
      return fs.statSync(path.join(contentDir, entry)).isDirectory();
    } catch {
      return false;
    }
  });
}

// Filesystem path of a course directory.
export function resolveCoursePath(contentDir, courseCode) {
  return path.join(contentDir, courseCode);
}

// Markdown topic filenames of a course, sorted in reading order
// (same `.md` filter + default sort the build previously inlined).
export function listTopicFiles(coursePath) {
  return fs.readdirSync(coursePath).filter((f) => f.endsWith('.md')).sort();
}

// Per-file path resolution + m{mod}_{seq}_{slug}.md parsing for one topic
// file. modNum falls back to 0 exactly as the build previously did for
// names outside the convention (the convention check below owns reporting).
export function parseTopicFile(coursePath, filename) {
  const modMatch = filename.match(/^m(\d+)_/);
  return {
    id: filename.replace(/\.md$/, ''),
    sourceFilename: filename,
    htmlFilename: filename.replace(/\.md$/, '.html'),
    sourcePath: path.join(coursePath, filename),
    modNum: modMatch ? parseInt(modMatch[1], 10) : 0,
  };
}

// Naming-convention diagnostics over one course's file list: filenames
// breaking m{mod}_{seq}_{slug}.md and duplicate mod_seq pairs. Returns
// warning strings (same wording the build previously pushed inline);
// the caller decides how to report them.
export function findTopicFilenameIssues(courseCode, files) {
  const issues = [];
  const seenSeq = new Map();
  for (const f of files) {
    const m = f.match(/^m(\d+)_(\d+)_/);
    if (!m) {
      issues.push(`${courseCode}/${f}: filename breaks m{mod}_{seq}_{slug}.md convention`);
      continue;
    }
    const key = `${m[1]}_${m[2]}`;
    if (seenSeq.has(key)) {
      issues.push(`${courseCode}: duplicate seq ${key} in ${seenSeq.get(key)} and ${f}`);
    } else {
      seenSeq.set(key, f);
    }
  }
  return issues;
}
