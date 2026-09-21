/**
 * Tarangam curriculum data layer (browser + Node, no dependencies).
 *
 * Loads the static topic manifest once (cached), resolves it across the
 * repository's hosting modes (Pages artifact root, branch-root dev, site
 * subpaths), and exposes reusable pure queries over the manifest object.
 * No Markdown is ever parsed here. No DOM access — safe to import in
 * Node for tests. All loading failures surface as controlled
 * ManifestLoadErrors (never unhandled rejections).
 */

export const MANIFEST_CANDIDATES = [
  'data/topic-manifest.json',
  'dist/data/topic-manifest.json',
  '/data/topic-manifest.json',
];

export const MANIFEST_LOAD_ERROR = 'MANIFEST_LOAD_ERROR';

export function manifestLoadError(message, cause) {
  const err = new Error(message);
  err.code = MANIFEST_LOAD_ERROR;
  if (cause !== undefined) err.cause = cause;
  return err;
}

let cachedManifest = null;
let cachedBaseUrl = null;
let cachedPromise = null;

export function clearManifestCache() {
  cachedManifest = null;
  cachedBaseUrl = null;
  cachedPromise = null;
}

function resolveFetch(fetchImpl) {
  if (fetchImpl) return fetchImpl;
  const g = globalThis.fetch;
  if (typeof g !== 'function') {
    throw manifestLoadError('No fetch implementation available in this environment.');
  }
  return g.bind(globalThis);
}

function candidateUrls(baseHref) {
  const urls = [];
  const seen = new Set();
  const push = (u) => {
    if (!seen.has(u)) {
      seen.add(u);
      urls.push(u);
    }
  };
  for (const c of MANIFEST_CANDIDATES) {
    try {
      // Site-root-absolute candidates only make sense under http(s).
      if (c.startsWith('/') && baseHref && !/^https?:/i.test(baseHref)) continue;
      push(new URL(c, baseHref || undefined).href);
    } catch {
      push(c);
    }
  }
  return urls;
}

function looksLikeManifest(value) {
  return Boolean(value && typeof value === 'object' && Array.isArray(value.topics));
}

// Load (and cache) the manifest, trying each candidate location in order.
// Returns { manifest, baseUrl, sourceUrl } where baseUrl is the site root
// the manifest was resolved against (used to build topic page links).
// Options: { fetchImpl, baseHref, candidates } — all injectable for tests.
export async function loadManifest(options = {}) {
  if (cachedManifest) {
    return { manifest: cachedManifest, baseUrl: cachedBaseUrl, cached: true };
  }
  if (cachedPromise) return cachedPromise;
  cachedPromise = (async () => {
    const fetchImpl = resolveFetch(options.fetchImpl);
    const urls = options.candidates || candidateUrls(options.baseHref || (typeof document !== 'undefined' && document.baseURI));
    const failures = [];
    for (const url of urls) {
      let response;
      try {
        response = await fetchImpl(url);
      } catch (e) {
        failures.push(`${url} (${e && e.message ? e.message : e})`);
        continue;
      }
      if (!response || !response.ok) {
        failures.push(`${url} (HTTP ${response ? response.status : 'no response'})`);
        continue;
      }
      let json;
      try {
        json = await response.json();
      } catch (e) {
        failures.push(`${url} (invalid JSON: ${e && e.message ? e.message : e})`);
        continue;
      }
      if (!looksLikeManifest(json)) {
        failures.push(`${url} (not a topic manifest: missing "topics" array)`);
        continue;
      }
      cachedManifest = json;
      try {
        cachedBaseUrl = new URL('.', url).href;
      } catch {
        cachedBaseUrl = null;
      }
      return { manifest: cachedManifest, baseUrl: cachedBaseUrl, sourceUrl: url, cached: false };
    }
    throw manifestLoadError(
      `Could not load the topic manifest from any known location: ${failures.join('; ') || 'no candidates'}.`
    );
  })();
  try {
    return await cachedPromise;
  } catch (e) {
    cachedPromise = null;
    throw e;
  }
}

// --- Pure queries over a manifest object (sync, no I/O). ---
//
// Implemented once in the canonical Topic Intelligence Layer
// (./topic-intelligence.js, shared with Node tooling); re-exported here so
// browser consumers keep their existing import path with zero duplication.
// Loading/caching/URL resolution below remain this module's own job.

export {
  topicKey,
  getTopic,
  getCourseTopics,
  getModuleTopics,
  courseCodes,
  moduleNumbers,
  getPrerequisites,
  getDependents,
  getTopicsByDifficulty,
  getTopicsByExamRelevance,
  normalizeSearchText,
  searchTopics,
  searchCurriculum,
  describeSearchMatch,
  topicMatchesQuery,
  SEARCH_MATCH_KINDS,
  getAncestors,
  getDescendants,
  getDependencyChain,
  getPrerequisiteDepth,
  isRootTopic,
  isLeafTopic,
  getPreviousTopic,
  getNextTopic,
  getPreviousInCourse,
  getNextInCourse,
  getPreviousInModule,
  getNextInModule,
  getModuleBoundaries,
  getCourseBoundaries,
  getDifficulty,
  getExamRelevance,
  getEstimatedMinutes,
  getConcepts,
  getTags,
  getLearningObjectives,
  searchConcepts,
  filterByTags,
  filterByDifficulty,
  filterByExamRelevance,
  filterByMaxMinutes,
  combinedFilter,
} from './topic-intelligence.js';

// Topic page URL resolved against the manifest's own base URL, so links
// work in every hosting mode (Pages artifact root, branch-root dev,
// site subpaths) without a second routing system.
export function topicPageUrl(baseUrl, courseCode, topic) {
  const file = typeof topic === 'string' ? topic : topic.filename || `${topic.id}.html`;
  const root = baseUrl || '';
  return `${root}${courseCode}/${file}`;
}
