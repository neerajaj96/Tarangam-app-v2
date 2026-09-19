/**
 * Shared topic knowledge-graph — in-memory topic nodes plus prerequisite
 * edges built from the repository's curriculum and Markdown metadata,
 * with integrity analysis (missing / cross-course / self / circular /
 * later-sequence prerequisites, orphans, coverage, depth). Used by
 * scripts/check.js. Zero dependencies; ES module style like the rest of
 * scripts/.
 *
 * Only graph construction + analysis live here. Discovery reuses
 * scripts/content.js, front-matter parsing/validation reuses
 * scripts/topic-metadata.js, and legacy titles reuse scripts/pages.js —
 * nothing is duplicated. No filesystem writes, HTML generation,
 * curriculum validation, learner state, or UI logic.
 *
 * Node keys are `courseCode/id` (ids like m1_01_* repeat across courses).
 * Prerequisite ids are course-local bare ids: same-course hits become
 * internal edges; ids found only in another course become cross-course
 * edges (warnings, never errors — the format is ambiguous by design);
 * ids found nowhere become missing edges (errors). Legacy topics without
 * metadata stay fully supported: they are nodes, valid edge targets, and
 * depth roots, but carry no metadata fields.
 */
import fs from 'fs';
import {
  CONTENT_DIR,
  listContentCourses,
  resolveCoursePath,
  listTopicFiles,
  parseTopicFile,
} from './content.js';
import {
  parseTopicFrontMatter,
  validateTopicMetadata,
} from './topic-metadata.js';
import { formatTopicTitle } from './pages.js';

export const GRAPH_NODE_LEGACY = 'legacy';
export const GRAPH_NODE_METADATA = 'metadata';

function nodeKey(courseCode, id) {
  return `${courseCode}/${id}`;
}

function parseSequence(filename) {
  const m = filename.match(/^m\d+_(\d+)_/);
  return m ? parseInt(m[1], 10) : 0;
}

// Build the graph from the repo. Returns
// { nodes, edges, byCourse, byModule, metadataErrors } where nodes is a
// Map<key, node>, edges are { from, to, kind } with kind one of
// 'internal' | 'cross-course' | 'missing', and metadataErrors lists
// { courseCode, filename, errors } for malformed/invalid front-matter
// (those topics stay legacy nodes; check.js fails them separately).
// - curriculumDoc: parsed data/curriculum.json or null (cross-checks
//   skipped when null)
// - schema: parsed data/topic-schema.json or null (front-matter accepted
//   unvalidated when null; check.js always passes the loaded schema)
export function buildTopicGraph({ contentDir = CONTENT_DIR, curriculumDoc = null, schema = null } = {}) {
  const nodes = new Map();
  const edges = [];
  const byCourse = new Map();
  const byModule = new Map();
  const metadataErrors = [];

  const track = (node) => {
    nodes.set(node.key, node);
    if (!byCourse.has(node.courseCode)) byCourse.set(node.courseCode, []);
    byCourse.get(node.courseCode).push(node.key);
    const modKey = `${node.courseCode}:M${node.module}`;
    if (!byModule.has(modKey)) byModule.set(modKey, []);
    byModule.get(modKey).push(node.key);
  };

  for (const courseCode of listContentCourses(contentDir)) {
    const coursePath = resolveCoursePath(contentDir, courseCode);
    for (const filename of listTopicFiles(coursePath)) {
      const parsed = parseTopicFile(coursePath, filename);
      const id = parsed.id;
      const key = nodeKey(courseCode, id);
      const module = parsed.modNum;
      const sequence = parseSequence(filename);
      const raw = fs.readFileSync(parsed.sourcePath, 'utf-8');

      let claimed = null;
      try {
        claimed = parseTopicFrontMatter(raw).metadata;
      } catch (e) {
        metadataErrors.push({
          courseCode,
          filename,
          errors: [`topic-metadata: ${courseCode}/${filename} has malformed front-matter (${(e.cause && e.cause.message) || e.message})`],
        });
      }

      let metadata = null;
      if (claimed !== null) {
        const label = `topic-metadata: ${courseCode}/${filename}#front-matter`;
        const problems = schema
          ? validateTopicMetadata(claimed, {
            schema,
            curriculumDoc,
            contentDir,
            label,
            expectedCourseCode: courseCode,
            expectedId: id,
          })
          : [];
        if (problems.length) {
          metadataErrors.push({ courseCode, filename, errors: problems });
        } else {
          metadata = claimed;
        }
      }

      if (metadata) {
        track({
          key,
          id,
          courseCode,
          module,
          sequence,
          filename,
          sourcePath: parsed.sourcePath,
          kind: GRAPH_NODE_METADATA,
          hasMetadata: true,
          title: metadata.title,
          difficulty: metadata.difficulty,
          estimatedMinutes: metadata.estimatedMinutes,
          concepts: [...metadata.concepts],
          prerequisites: [...metadata.prerequisites],
          examRelevance: metadata.examRelevance,
          tags: [...metadata.tags],
          depth: null,
        });
      } else {
        track({
          key,
          id,
          courseCode,
          module,
          sequence,
          filename,
          sourcePath: parsed.sourcePath,
          kind: GRAPH_NODE_LEGACY,
          hasMetadata: false,
          title: formatTopicTitle(filename),
          difficulty: null,
          estimatedMinutes: null,
          concepts: [],
          prerequisites: [],
          examRelevance: null,
          tags: [],
          depth: null,
        });
      }
    }
  }

  // Resolve prerequisite edges (course-local bare ids).
  const idsByCourse = new Map();
  for (const node of nodes.values()) {
    if (!idsByCourse.has(node.courseCode)) idsByCourse.set(node.courseCode, new Set());
    idsByCourse.get(node.courseCode).add(node.id);
  }
  const findOtherCourse = (id, exceptCourse) => {
    const hits = [];
    for (const [code, ids] of idsByCourse) {
      if (code !== exceptCourse && ids.has(id)) hits.push(code);
    }
    return hits.sort();
  };
  for (const node of nodes.values()) {
    if (!node.hasMetadata) continue;
    for (const prereq of node.prerequisites) {
      const localKey = nodeKey(node.courseCode, prereq);
      if (nodes.has(localKey)) {
        edges.push({ from: node.key, to: localKey, kind: 'internal' });
        continue;
      }
      const elsewhere = findOtherCourse(prereq, node.courseCode);
      if (elsewhere.length) {
        edges.push({ from: node.key, to: nodeKey(elsewhere[0], prereq), kind: 'cross-course', candidates: elsewhere });
      } else {
        edges.push({ from: node.key, to: localKey, kind: 'missing' });
      }
    }
  }

  return { nodes, edges, byCourse, byModule, metadataErrors };
}

// Efficient lookup of one topic by course + id. Returns the node or null.
export function findTopic(graph, courseCode, id) {
  return graph.nodes.get(nodeKey(courseCode, id)) ?? null;
}

function comparePosition(a, b) {
  if (a.module !== b.module) return a.module - b.module;
  return a.sequence - b.sequence;
}

function findInternalCycles(nodes, edges) {
  const adj = new Map();
  for (const e of edges) {
    if (e.kind !== 'internal') continue;
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from).push(e.to);
  }
  const cycles = [];
  const color = new Map(); // key -> 'gray' | 'black'
  const stack = [];
  const visit = (key) => {
    color.set(key, 'gray');
    stack.push(key);
    for (const next of adj.get(key) || []) {
      if (next === key) continue; // self-loops already reported as errors
      if (color.get(next) === 'gray') {
        cycles.push([...stack.slice(stack.indexOf(next)), next]);
      } else if (!color.has(next) && nodes.has(next)) {
        visit(next);
      }
    }
    stack.pop();
    color.set(key, 'black');
  };
  for (const key of [...adj.keys()].sort()) {
    if (!color.has(key)) visit(key);
  }
  return cycles;
}

// Analyze any { nodes, edges } graph (repo-built or fixture). Returns
// { errors, warnings, coverage, maxDepth } and sets node.depth for
// metadata nodes (longest prerequisite chain to a root; legacy nodes and
// missing targets count as roots with depth 0; cycles already reported
// as errors are cut defensively). Errors fail QA; warnings never do.
export function analyzeTopicGraph(graph) {
  const { nodes, edges } = graph;
  const errors = [];
  const warnings = [];

  const internalByFrom = new Map();
  for (const e of edges) {
    if (e.kind !== 'internal') continue;
    if (!internalByFrom.has(e.from)) internalByFrom.set(e.from, []);
    internalByFrom.get(e.from).push(e.to);
  }

  for (const e of edges) {
    if (e.kind === 'missing') {
      errors.push(`prerequisite "${e.to}" of "${e.from}" points to a missing topic`);
    } else if (e.from === e.to) {
      errors.push(`prerequisite "${e.from}" references itself`);
    } else if (e.kind === 'cross-course') {
      const where = e.candidates && e.candidates.length > 1
        ? `other courses (${e.candidates.join(', ')})`
        : `course "${e.to.split('/')[0]}"`;
      warnings.push(`prerequisite "${e.to.split('/')[1]}" of "${e.from}" resolves only in ${where} — ids are course-local`);
    }
  }

  for (const cycle of findInternalCycles(nodes, edges)) {
    errors.push(`circular prerequisite chain: ${cycle.join(' -> ')}`);
  }

  for (const e of edges) {
    if (e.kind !== 'internal' || e.from === e.to) continue;
    const from = nodes.get(e.from);
    const to = nodes.get(e.to);
    if (from && to && comparePosition(to, from) > 0) {
      warnings.push(`prerequisite "${e.to}" of "${e.from}" points to a later topic (M${to.module} seq ${to.sequence} after M${from.module} seq ${from.sequence})`);
    }
  }

  const touched = new Set();
  for (const e of edges) {
    if (e.kind === 'missing') continue;
    touched.add(e.from);
    touched.add(e.to);
  }
  for (const node of nodes.values()) {
    if (node.hasMetadata && !touched.has(node.key)) {
      warnings.push(`metadata topic "${node.key}" has no prerequisite relationships`);
    }
  }

  const depthMemo = new Map();
  const depthOf = (key, visiting) => {
    if (depthMemo.has(key)) return depthMemo.get(key);
    const node = nodes.get(key);
    if (!node || !node.hasMetadata) return 0;
    if (visiting.has(key)) return 0; // cycle already reported; cut here
    visiting.add(key);
    let best = 0;
    for (const next of internalByFrom.get(key) || []) {
      best = Math.max(best, 1 + depthOf(next, visiting));
    }
    visiting.delete(key);
    depthMemo.set(key, best);
    return best;
  };
  let maxDepth = 0;
  for (const node of nodes.values()) {
    if (!node.hasMetadata) continue;
    node.depth = depthOf(node.key, new Set());
    if (node.depth > maxDepth) maxDepth = node.depth;
  }

  const coverage = {
    total: nodes.size,
    metadata: 0,
    byCourse: {},
    byModule: {},
    byDifficulty: {},
    byExamRelevance: {},
  };
  for (const node of nodes.values()) {
    if (!node.hasMetadata) continue;
    coverage.metadata += 1;
    coverage.byCourse[node.courseCode] = (coverage.byCourse[node.courseCode] || 0) + 1;
    const modKey = `${node.courseCode}:M${node.module}`;
    coverage.byModule[modKey] = (coverage.byModule[modKey] || 0) + 1;
    coverage.byDifficulty[node.difficulty] = (coverage.byDifficulty[node.difficulty] || 0) + 1;
    coverage.byExamRelevance[node.examRelevance] = (coverage.byExamRelevance[node.examRelevance] || 0) + 1;
  }

  return { errors, warnings, coverage, maxDepth, edgeCount: edges.filter((e) => e.kind !== 'missing').length };
}

// Concise multi-line QA report (no topic dumps).
export function formatGraphReport(analysis) {
  const { coverage, edgeCount } = analysis;
  const joinCounts = (obj) => Object.keys(obj).sort().map((k) => `${k}:${obj[k]}`).join(', ') || 'none';
  return [
    'topic graph:',
    `  topics: ${coverage.total}`,
    `  metadata topics: ${coverage.metadata}`,
    `  prerequisite edges: ${edgeCount}`,
    `  errors: ${analysis.errors.length}`,
    `  warnings: ${analysis.warnings.length}`,
    `  by difficulty: ${joinCounts(coverage.byDifficulty)}`,
    `  by exam relevance: ${joinCounts(coverage.byExamRelevance)}`,
  ];
}
