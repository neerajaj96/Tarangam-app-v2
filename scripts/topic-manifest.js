/**
 * Shared topic manifest — a stable JSON-safe snapshot of the validated
 * topic graph for future browser-side consumption (no Markdown parsing
 * in the browser), plus a dependency-free read/query API. Used by
 * scripts/build.js (writes dist/data/topic-manifest.json),
 * scripts/output.js (file writer), and scripts/check.js (integrity QA).
 * Zero dependencies; ES module style like the rest of scripts/.
 *
 * Only manifest construction, validation, and queries live here. Graph
 * construction/analysis reuses scripts/topic-graph.js — never duplicated.
 * No filesystem writes (output.js owns those), HTML generation,
 * curriculum validation, learner state, or UI logic.
 */
import { buildTopicGraph, analyzeTopicGraph } from './topic-graph.js';

export const MANIFEST_VERSION = 1;

function sortedKeys(obj) {
  return Object.keys(obj).sort();
}

function sortedCountMap(obj) {
  const out = {};
  for (const k of sortedKeys(obj)) out[k] = obj[k];
  return out;
}

// Convert a validated { graph, analysis } pair into a JSON-safe manifest
// with deterministic ordering (topics sorted by course/module/sequence/id,
// aggregates keyed alphabetically, no timestamps). Legacy topics keep
// fallback values (nulls/empties), never invented metadata. Display names
// come from the curriculum document when provided (falling back to codes).
// Throws when the graph has integrity errors — the build must fail then;
// warnings stay warnings.
export function buildTopicManifestFromGraph(graph, analysis, { curriculumDoc = null } = {}) {
  if (analysis.errors.length) {
    throw new Error(
      `Cannot build topic manifest with ${analysis.errors.length} graph error(s):\n- ${analysis.errors.join('\n- ')}`
    );
  }
  const namesFor = (courseCode, module) => {
    const entry = curriculumDoc?.curriculum?.[courseCode];
    const mod = entry?.modules?.find((m) => m.number === module);
    return {
      courseName: entry?.name ?? courseCode,
      moduleName: mod?.name ?? `Module ${module}`,
    };
  };
  const topics = [...graph.nodes.values()]
    .sort((a, b) =>
      a.courseCode.localeCompare(b.courseCode) ||
      a.module - b.module ||
      a.sequence - b.sequence ||
      a.id.localeCompare(b.id)
    )
    .map((n) => ({
      id: n.id,
      courseCode: n.courseCode,
      ...namesFor(n.courseCode, n.module),
      module: n.module,
      sequence: n.sequence,
      title: n.title,
      filename: n.filename,
      hasMetadata: n.hasMetadata,
      difficulty: n.difficulty,
      estimatedMinutes: n.estimatedMinutes,
      concepts: [...n.concepts],
      prerequisites: [...n.prerequisites],
      examRelevance: n.examRelevance,
      tags: [...n.tags],
      prerequisiteDepth: n.hasMetadata ? n.depth : null,
    }));

  const byCourse = {};
  const byModule = {};
  for (const t of topics) {
    if (!byCourse[t.courseCode]) byCourse[t.courseCode] = { total: 0, metadata: 0 };
    byCourse[t.courseCode].total += 1;
    if (t.hasMetadata) byCourse[t.courseCode].metadata += 1;
    const modKey = `${t.courseCode}:M${t.module}`;
    if (!byModule[modKey]) byModule[modKey] = { total: 0, metadata: 0 };
    byModule[modKey].total += 1;
    if (t.hasMetadata) byModule[modKey].metadata += 1;
  }

  return {
    version: MANIFEST_VERSION,
    topics,
    aggregates: {
      totalTopics: topics.length,
      metadataTopics: topics.filter((t) => t.hasMetadata).length,
      byCourse: sortedCountMap(byCourse),
      byModule: sortedCountMap(byModule),
      byDifficulty: sortedCountMap(analysis.coverage.byDifficulty),
      byExamRelevance: sortedCountMap(analysis.coverage.byExamRelevance),
      prerequisiteEdges: analysis.edgeCount,
      maxDepth: analysis.maxDepth,
    },
  };
}

// Build a manifest straight from the repo: constructs the graph, analyzes
// it, then delegates. Throws on graph integrity errors.
export function buildTopicManifest({ contentDir = 'content', curriculumDoc = null, schema = null } = {}) {
  const graph = buildTopicGraph({ contentDir, curriculumDoc, schema });
  const analysis = analyzeTopicGraph(graph);
  return buildTopicManifestFromGraph(graph, analysis, { curriculumDoc });
}

// Validate a manifest's structure without touching the filesystem.
// Returns error strings (empty = valid): no duplicate topic keys,
// required fields present, prerequisite ids resolving to same-course
// manifest topics. With { graph } also provided, the manifest edge set
// must agree with the graph edge set.
export function validateTopicManifest(manifest, { graph = null } = {}) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object' || !Array.isArray(manifest.topics)) {
    return ['topic manifest must be an object with a "topics" array'];
  }
  const seen = new Set();
  const keys = new Set();
  for (const t of manifest.topics) {
    for (const f of ['id', 'courseCode', 'courseName', 'module', 'moduleName', 'sequence', 'title', 'filename', 'hasMetadata']) {
      if (t[f] === undefined) errors.push(`topic manifest entry is missing required field "${f}" (id: ${t.id || '?'})`);
    }
    const key = `${t.courseCode}/${t.id}`;
    if (seen.has(key)) errors.push(`topic manifest has duplicate topic key "${key}"`);
    seen.add(key);
    keys.add(key);
  }
  for (const t of manifest.topics) {
    for (const p of t.prerequisites || []) {
      if (!keys.has(`${t.courseCode}/${p}`)) {
        errors.push(`topic manifest prerequisite "${p}" of "${t.courseCode}/${t.id}" resolves to no manifest topic`);
      }
    }
  }
  if (graph) {
    const manifestEdges = new Set();
    for (const t of manifest.topics) {
      for (const p of t.prerequisites || []) manifestEdges.add(`${t.courseCode}/${t.id} -> ${t.courseCode}/${p}`);
    }
    const graphEdges = new Set(graph.edges.filter((e) => e.kind !== 'missing').map((e) => `${e.from} -> ${e.to}`));
    for (const e of manifestEdges) {
      if (!graphEdges.has(e)) errors.push(`topic manifest edge "${e}" agrees with no graph edge`);
    }
    for (const e of graphEdges) {
      if (!manifestEdges.has(e)) errors.push(`topic manifest is missing graph edge "${e}"`);
    }
  }
  return errors;
}

// One-line QA summary, e.g.
// "topic manifest: 432 topics, 14 metadata, 18 prerequisite edges, maxDepth 5".
export function formatManifestSummary(manifest) {
  const a = manifest.aggregates;
  return `topic manifest: ${a.totalTopics} topics, ${a.metadataTopics} metadata, ${a.prerequisiteEdges} prerequisite edges, maxDepth ${a.maxDepth}`;
}

// --- Read/query API (pure: operates on a manifest object, no I/O). ---

const indexCache = new WeakMap();

function indexFor(manifest) {
  let index = indexCache.get(manifest);
  if (!index) {
    index = {
      byKey: new Map(),
      byCourse: new Map(),
      byModule: new Map(),
      byDifficulty: new Map(),
      byExam: new Map(),
      dependents: new Map(), // key -> [dependent entries]
    };
    for (const t of manifest.topics) {
      const key = `${t.courseCode}/${t.id}`;
      index.byKey.set(key, t);
      const push = (map, k) => {
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(t);
      };
      push(index.byCourse, t.courseCode);
      push(index.byModule, `${t.courseCode}:M${t.module}`);
      if (t.difficulty) push(index.byDifficulty, t.difficulty);
      if (t.examRelevance) push(index.byExam, t.examRelevance);
    }
    for (const t of manifest.topics) {
      const from = `${t.courseCode}/${t.id}`;
      for (const p of t.prerequisites || []) {
        const to = `${t.courseCode}/${p}`;
        if (!index.byKey.has(to)) continue;
        if (!index.dependents.has(to)) index.dependents.set(to, []);
        index.dependents.get(to).push(t);
      }
    }
    indexCache.set(manifest, index);
  }
  return index;
}

export function getTopic(manifest, courseCode, id) {
  return indexFor(manifest).byKey.get(`${courseCode}/${id}`) ?? null;
}

export function getCourseTopics(manifest, courseCode) {
  return [...(indexFor(manifest).byCourse.get(courseCode) || [])];
}

export function getModuleTopics(manifest, courseCode, module) {
  return [...(indexFor(manifest).byModule.get(`${courseCode}:M${module}`) || [])];
}

export function getPrerequisites(manifest, courseCode, id) {
  const index = indexFor(manifest);
  const topic = index.byKey.get(`${courseCode}/${id}`);
  if (!topic) return [];
  return (topic.prerequisites || [])
    .map((p) => index.byKey.get(`${courseCode}/${p}`))
    .filter((t) => t !== undefined);
}

export function getDependents(manifest, courseCode, id) {
  return [...(indexFor(manifest).dependents.get(`${courseCode}/${id}`) || [])];
}

export function getTopicsByDifficulty(manifest, difficulty) {
  return [...(indexFor(manifest).byDifficulty.get(difficulty) || [])];
}

export function getTopicsByExamRelevance(manifest, level) {
  return [...(indexFor(manifest).byExam.get(level) || [])];
}

function normalizeQuery(q) {
  return String(q ?? '').trim().toLowerCase();
}

// Normalized case-insensitive substring search across topic title,
// concepts, tags, and topic ID (legacy topics included).
export function searchTopics(manifest, query) {
  const q = normalizeQuery(query);
  if (!q) return [];
  return manifest.topics.filter((t) => {
    const haystacks = [t.title, t.id, ...(t.concepts || []), ...(t.tags || [])];
    return haystacks.some((h) => normalizeQuery(h).includes(q));
  });
}
