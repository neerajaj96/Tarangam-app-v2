/**
 * Dependency-free tests for assets/curriculum-data.js (node:test +
 * node:assert only — no test framework). Covers: manifest loading
 * (success, caching, controlled failures), course/module filtering,
 * search, prerequisite/dependent lookup, legacy safety, and topic URL
 * resolution.
 *
 * Run: npm test
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  MANIFEST_LOAD_ERROR,
  clearManifestCache,
  loadManifest,
  getTopic,
  getCourseTopics,
  getModuleTopics,
  moduleNumbers,
  courseCodes,
  getPrerequisites,
  getDependents,
  getTopicsByDifficulty,
  getTopicsByExamRelevance,
  searchTopics,
  topicPageUrl,
} from '../assets/curriculum-data.js';

function entry(overrides) {
  const base = {
    id: 'x', courseCode: 'C1', courseName: 'Course One', module: 1, moduleName: 'M1',
    sequence: 1, title: 'X', hasMetadata: false,
    difficulty: null, estimatedMinutes: null, concepts: [],
    prerequisites: [], examRelevance: null, tags: [], prerequisiteDepth: null,
    ...overrides,
  };
  if (!overrides.filename) base.filename = `${base.id}.html`;
  return base;
}

const fixture = {
  version: 1,
  topics: [
    entry({
      id: 'm1_01_a', title: 'Alpha Basics', sequence: 1, hasMetadata: true,
      difficulty: 'beginner', estimatedMinutes: 5, concepts: ['Alpha'], examRelevance: 'high',
      tags: ['start'], prerequisiteDepth: 0,
    }),
    entry({
      id: 'm1_02_b', title: 'Beta Advanced', sequence: 2, hasMetadata: true,
      difficulty: 'advanced', estimatedMinutes: 9, concepts: ['Beta'],
      prerequisites: ['m1_01_a'], examRelevance: 'low', tags: ['end'], prerequisiteDepth: 1,
    }),
    entry({ id: 'm2_01_c', title: 'Gamma Legacy', module: 2, moduleName: 'M2', sequence: 1 }),
    entry({
      id: 'm1_01_z', courseCode: 'C2', courseName: 'Course Two', title: 'Zeta Intro',
      hasMetadata: true, difficulty: 'beginner', estimatedMinutes: 4, concepts: ['Zeta'],
      examRelevance: 'medium', tags: ['other'], prerequisiteDepth: 0,
    }),
  ],
  aggregates: { totalTopics: 4, metadataTopics: 3 },
};

const okFetch = (seen = []) => async (url) => {
  seen.push(url);
  return { ok: true, status: 200, json: async () => fixture };
};

beforeEach(() => clearManifestCache());

describe('manifest loading', () => {
  it('loads successfully and caches', async () => {
    const seen = [];
    const first = await loadManifest({ fetchImpl: okFetch(seen), candidates: ['data/topic-manifest.json'] });
    assert.equal(first.manifest.topics.length, 4);
    assert.ok(first.baseUrl !== undefined);
    assert.equal(first.cached, false);
    const second = await loadManifest({ fetchImpl: okFetch(seen), candidates: ['data/topic-manifest.json'] });
    assert.equal(second.cached, true);
    assert.equal(seen.length, 1); // second call served from cache
  });

  it('tries candidates in order', async () => {
    const seen = [];
    const fetchImpl = async (url) => {
      seen.push(url);
      if (url.endsWith('dist/data/topic-manifest.json')) return { ok: true, status: 200, json: async () => fixture };
      return { ok: false, status: 404 };
    };
    const { sourceUrl } = await loadManifest({
      fetchImpl,
      candidates: ['data/topic-manifest.json', 'dist/data/topic-manifest.json'],
    });
    assert.ok(sourceUrl.endsWith('dist/data/topic-manifest.json'));
    assert.equal(seen.length, 2);
  });

  it('produces a controlled error when every location fails', async () => {
    await assert.rejects(
      loadManifest({ fetchImpl: async () => ({ ok: false, status: 404 }), candidates: ['a.json'] }),
      (e) => e.code === MANIFEST_LOAD_ERROR && /Could not load/.test(e.message)
    );
  });

  it('produces a controlled error on invalid JSON and wrong shapes', async () => {
    await assert.rejects(
      loadManifest({ fetchImpl: async () => ({ ok: true, json: async () => { throw new Error('bad json'); } }), candidates: ['a.json'] }),
      (e) => e.code === MANIFEST_LOAD_ERROR
    );
    await assert.rejects(
      loadManifest({ fetchImpl: async () => ({ ok: true, json: async () => ({ nope: 1 }) }), candidates: ['a.json'] }),
      (e) => e.code === MANIFEST_LOAD_ERROR && /not a topic manifest/.test(e.message)
    );
  });
});

describe('filtering', () => {
  it('course filtering works', () => {
    assert.equal(getCourseTopics(fixture, 'C1').length, 3);
    assert.equal(getCourseTopics(fixture, 'C2').length, 1);
    assert.deepEqual(getCourseTopics(fixture, 'CX'), []);
    assert.deepEqual(courseCodes(fixture), ['C1', 'C2']);
  });

  it('module filtering works', () => {
    assert.equal(getModuleTopics(fixture, 'C1', 1).length, 2);
    assert.equal(getModuleTopics(fixture, 'C1', 2).length, 1);
    assert.deepEqual(getModuleTopics(fixture, 'C1', 9), []);
    assert.deepEqual(moduleNumbers(fixture, 'C1'), [1, 2]);
  });

  it('difficulty and exam relevance filters work', () => {
    assert.equal(getTopicsByDifficulty(fixture, 'beginner').length, 2);
    assert.equal(getTopicsByExamRelevance(fixture, 'high').length, 1);
    assert.deepEqual(getTopicsByDifficulty(fixture, 'expert'), []);
  });
});

describe('relations and search', () => {
  it('search finds known topics case-insensitively', () => {
    assert.ok(searchTopics(fixture, 'ALPHA').some((t) => t.id === 'm1_01_a'));
    assert.ok(searchTopics(fixture, '  beta  ').some((t) => t.id === 'm1_02_b'));
    assert.ok(searchTopics(fixture, 'zeta').some((t) => t.id === 'm1_01_z'));
    assert.ok(searchTopics(fixture, 'gamma').some((t) => t.id === 'm2_01_c'));
    assert.deepEqual(searchTopics(fixture, '   '), []);
  });

  it('prerequisite lookup works', () => {
    assert.deepEqual(getPrerequisites(fixture, 'C1', 'm1_02_b').map((t) => t.id), ['m1_01_a']);
    assert.deepEqual(getPrerequisites(fixture, 'C1', 'm1_01_a'), []);
  });

  it('dependent lookup works', () => {
    assert.deepEqual(getDependents(fixture, 'C1', 'm1_01_a').map((t) => t.id), ['m1_02_b']);
    assert.deepEqual(getDependents(fixture, 'C1', 'm1_02_b'), []);
  });

  it('legacy topics do not crash queries', () => {
    const legacy = getTopic(fixture, 'C1', 'm2_01_c');
    assert.ok(legacy && legacy.hasMetadata === false);
    assert.deepEqual(getPrerequisites(fixture, 'C1', 'm2_01_c'), []);
    assert.deepEqual(getDependents(fixture, 'C1', 'm2_01_c'), []);
    assert.equal(getTopic(fixture, 'C1', 'missing'), null);
  });

  it('topic page URLs resolve against the manifest base', () => {
    const t = getTopic(fixture, 'C1', 'm1_01_a');
    assert.equal(topicPageUrl('https://x/dist/', 'C1', t), 'https://x/dist/C1/m1_01_a.html');
    assert.equal(topicPageUrl('', 'C1', t), 'C1/m1_01_a.html');
  });
});
