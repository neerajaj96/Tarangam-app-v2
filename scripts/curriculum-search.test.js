/**
 * Dependency-free tests for the canonical deterministic curriculum search
 * (node:test + node:assert only — no test framework). Covers the single
 * shared matcher plus ranked presentation in assets/topic-intelligence.js
 * (via scripts/topic-intelligence.js) and its Curriculum Explorer
 * integration: empty queries, exact ID/title, partial titles, concept/tag/
 * objective/course/module matches, facet composition, deterministic tier +
 * manifest-order tie-breaking, unknown queries, all-432 discoverability,
 * static path generation for local and Pages hosting, byte-identical
 * repeated ordering, and proof that searching alters no other layer
 * (recommendations, graph, readiness, revision, attention, learner state,
 * assessment evaluation).
 *
 * Ranking contract (documented in assets/topic-intelligence.js):
 * exact_id > exact_title > title > id > concept > tag > objective >
 * course > module, ties in canonical manifest order. Match tiers are
 * categorical reasons, never numeric relevance scores.
 *
 * Run: npm test  (node --test scripts/curriculum-search.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as Intel from './topic-intelligence.js';
import * as AssetsIntel from '../assets/topic-intelligence.js';
import * as Data from '../assets/curriculum-data.js';
import { buildExamReadiness } from '../assets/exam-readiness.js';
import { buildRevisionModel } from '../assets/revision.js';
import { buildAttentionModel } from '../assets/weak-topic-analysis.js';
import { createLearnerState, memoryStorage } from '../assets/learner-state.js';
import { evaluateAnswer } from '../assets/assessment.js';
import { getExplorerVisibleTopics } from '../assets/explorer.js';
import { buildTopicManifest } from './topic-manifest.js';
import { loadTopicSchema } from './topic-metadata.js';
import { loadCurriculum } from './curriculum.js';

function entry(overrides) {
  const base = {
    id: 'x', courseCode: 'C1', courseName: 'Course One', module: 1, moduleName: 'Foundations',
    sequence: 1, title: 'X', filename: 'x.html', hasMetadata: true,
    difficulty: 'beginner', estimatedMinutes: 5, concepts: [], learningObjectives: ['Do X'],
    prerequisites: [], examRelevance: 'medium', tags: [], prerequisiteDepth: 0,
    ...overrides,
  };
  if (!overrides.filename) base.filename = `${base.id}.html`;
  return base;
}

// Diamond: d cites [b, c]; b and c cite [a]; e is standalone; z is C2 root.
const fixture = {
  version: 1,
  topics: [
    entry({ id: 'm1_01_a', title: 'Alpha', sequence: 1, concepts: ['alpha concept'], tags: ['core'] }),
    entry({ id: 'm1_02_b', title: 'Beta', sequence: 2, prerequisites: ['m1_01_a'], prerequisiteDepth: 1, concepts: ['beta concept'], tags: ['core'] }),
    entry({ id: 'm1_03_c', title: 'Gamma', sequence: 3, prerequisites: ['m1_01_a'], prerequisiteDepth: 1, difficulty: 'advanced', estimatedMinutes: 9, examRelevance: 'high', tags: ['extra'] }),
    entry({ id: 'm1_04_d', title: 'Delta', sequence: 4, prerequisites: ['m1_02_b', 'm1_03_c'], prerequisiteDepth: 2 }),
    entry({ id: 'm2_01_e', title: 'Epsilon', module: 2, moduleName: 'M2', sequence: 1 }),
    entry({ id: 'm1_01_z', courseCode: 'C2', courseName: 'Course Two', title: 'Zeta', sequence: 1 }),
  ],
};

// Tier-control manifest: every tier reachable with a distinct query.
const tiers = {
  version: 1,
  topics: [
    entry({ id: 't_grasp_basics', title: 'Grasp Basics', courseCode: 'CX', courseName: 'Course X', module: 1, moduleName: 'Foundations', sequence: 1, concepts: ['hold'], tags: ['start'], learningObjectives: ['Name parts'] }),
    entry({ id: 't_deep_dive', title: 'Deep Dive', courseCode: 'CX', courseName: 'Course X', module: 2, moduleName: 'Basement', sequence: 1, concepts: ['grasp'], tags: ['seed'], learningObjectives: ['Explain grasp'] }),
  ],
};

const ids = (topics) => topics.map((t) => `${t.courseCode}/${t.id}`);
const rankedIds = (entries) => entries.map((e) => `${e.topic.courseCode}/${e.topic.id}`);
const readerFrom = (map) => (course, id) => map[`${course}/${id}`];
const none = () => 'not_started';

describe('canonical discovery identity', () => {
  it('shares one matcher and ranking across entry points', () => {
    for (const name of [
      'searchTopics', 'searchCurriculum', 'describeSearchMatch',
      'topicMatchesQuery', 'combinedFilter', 'normalizeSearchText',
    ]) {
      assert.equal(Intel[name], AssetsIntel[name]);
    }
    assert.equal(Data.searchCurriculum, AssetsIntel.searchCurriculum);
    assert.equal(Data.describeSearchMatch, AssetsIntel.describeSearchMatch);
    assert.equal(Data.topicMatchesQuery, AssetsIntel.topicMatchesQuery);
    assert.deepEqual(AssetsIntel.SEARCH_MATCH_KINDS, [
      'exact_id', 'exact_title', 'title', 'id', 'concept',
      'tag', 'objective', 'course', 'module',
    ]);
  });

  it('normalizes queries deterministically and safely', () => {
    assert.equal(Intel.normalizeSearchText('  BeTa  '), 'beta');
    assert.equal(Intel.normalizeSearchText('a  b'), 'a b');
    assert.equal(Intel.normalizeSearchText(''), '');
    assert.deepEqual(Intel.searchTopics(fixture, ''), []);
    assert.deepEqual(Intel.searchTopics(fixture, '   '), []);
    assert.deepEqual(Intel.searchCurriculum(fixture, ''), []);
    assert.deepEqual(Intel.searchCurriculum(fixture, null), []);
  });
});

describe('extended searchTopics fields', () => {
  it('keeps existing pins while covering objectives, course, and module', () => {
    assert.deepEqual(ids(Intel.searchTopics(fixture, 'alpha')), ['C1/m1_01_a']);
    assert.deepEqual(ids(Intel.searchTopics(fixture, 'CORE')), ['C1/m1_01_a', 'C1/m1_02_b']);
    assert.deepEqual(Intel.searchTopics(fixture, '   '), []);
    // Learning objectives are now searchable.
    assert.ok(ids(Intel.searchTopics(fixture, 'do x')).length > 0);
    // Course code / name are now searchable.
    assert.deepEqual(ids(Intel.searchTopics(fixture, 'c2')), ['C2/m1_01_z']);
    assert.ok(ids(Intel.searchTopics(fixture, 'course two')).includes('C2/m1_01_z'));
  });
});

describe('ranked search tiers', () => {
  it('reports the strongest tier per topic', () => {
    const t = (id) => tiers.topics.find((x) => x.id === id);
    assert.equal(Intel.describeSearchMatch(t('t_grasp_basics'), 't_grasp_basics'), 'exact_id');
    assert.equal(Intel.describeSearchMatch(t('t_grasp_basics'), 'Grasp Basics'), 'exact_title');
    assert.equal(Intel.describeSearchMatch(t('t_grasp_basics'), 'grasp bas'), 'title');
    assert.equal(Intel.describeSearchMatch(t('t_grasp_basics'), 't_grasp'), 'id');
    assert.equal(Intel.describeSearchMatch(t('t_deep_dive'), 'grasp'), 'concept');
    assert.equal(Intel.describeSearchMatch(t('t_deep_dive'), 'seed'), 'tag');
    assert.equal(Intel.describeSearchMatch(t('t_deep_dive'), 'explain grasp'), 'concept');
    assert.equal(Intel.describeSearchMatch(t('t_deep_dive'), 'explain'), 'objective');
    assert.equal(Intel.describeSearchMatch(t('t_grasp_basics'), 'course x'), 'course');
    assert.equal(Intel.describeSearchMatch(t('t_grasp_basics'), 'foundations'), 'module');
    assert.equal(Intel.describeSearchMatch(t('t_grasp_basics'), 'zzz-no-match'), null);
    assert.equal(Intel.describeSearchMatch(null, 'grasp'), null);
    assert.equal(Intel.topicMatchesQuery(t('t_grasp_basics'), 'grasp'), true);
    assert.equal(Intel.topicMatchesQuery(t('t_grasp_basics'), 'zzz-no-match'), false);
  });

  it('orders stronger matches first with manifest-order ties', () => {
    // 'grasp': Basics matches by exact title-word (title tier); Deep Dive
    // matches by concept. Title outranks concept.
    const ranked = Intel.searchCurriculum(tiers, 'grasp');
    assert.deepEqual(rankedIds(ranked), ['CX/t_grasp_basics', 'CX/t_deep_dive']);
    assert.deepEqual(ranked.map((e) => e.matchKind), ['title', 'concept']);
    // Same tier on both topics resolves in manifest order.
    const both = Intel.searchCurriculum(tiers, 'course');
    assert.deepEqual(rankedIds(both), ['CX/t_grasp_basics', 'CX/t_deep_dive']);
    assert.ok(both.every((e) => e.matchKind === 'course'));
    // Multi-token ranking uses the strongest tier across tokens: 'x' hits
    // Deep Dive's objective ('Explain grasp'), outranking course-only Basics.
    const multi = Intel.searchCurriculum(tiers, 'course x');
    assert.deepEqual(rankedIds(multi), ['CX/t_deep_dive', 'CX/t_grasp_basics']);
    assert.deepEqual(multi.map((e) => e.matchKind), ['objective', 'course']);
  });
});

describe('fixture search behavior', () => {
  it('finds exact IDs and titles first', () => {
    const byId = Intel.searchCurriculum(fixture, 'm1_02_b');
    assert.equal(rankedIds(byId)[0], 'C1/m1_02_b');
    assert.equal(byId[0].matchKind, 'exact_id');
    const byTitle = Intel.searchCurriculum(fixture, 'Beta');
    assert.equal(rankedIds(byTitle)[0], 'C1/m1_02_b');
    assert.equal(byTitle[0].matchKind, 'exact_title');
  });

  it('orders partial-title ties in manifest order', () => {
    // 'eta' is a substring of Beta and Zeta titles alike.
    const ranked = Intel.searchCurriculum(fixture, 'eta');
    assert.deepEqual(rankedIds(ranked), ['C1/m1_02_b', 'C2/m1_01_z']);
    assert.ok(ranked.every((e) => e.matchKind === 'title'));
  });

  it('matches concepts, tags, and objectives', () => {
    assert.deepEqual(rankedIds(Intel.searchCurriculum(fixture, 'beta concept')), ['C1/m1_02_b']);
    assert.deepEqual(rankedIds(Intel.searchCurriculum(fixture, 'core')), ['C1/m1_01_a', 'C1/m1_02_b']);
    assert.ok(Intel.searchCurriculum(fixture, 'do x').length > 0);
  });

  it('returns nothing for unknown queries', () => {
    assert.deepEqual(Intel.searchCurriculum(fixture, 'zzz-no-such-topic'), []);
    assert.deepEqual(Intel.searchTopics(fixture, 'zzz-no-such-topic'), []);
  });
});

describe('Explorer global search', () => {
  it('searches the entire curriculum under the all-courses scope', () => {
    const all = getExplorerVisibleTopics(fixture, none, { courseCode: 'all', query: 'eta' });
    assert.deepEqual(ids(all), ['C1/m1_02_b', 'C2/m1_01_z']);
    const scoped = getExplorerVisibleTopics(fixture, none, { courseCode: 'C1', query: 'eta' });
    assert.deepEqual(ids(scoped), ['C1/m1_02_b']);
    // Null course behaves like all (never an empty trap for search).
    assert.deepEqual(
      ids(getExplorerVisibleTopics(fixture, none, { courseCode: null, query: 'eta' })),
      ['C1/m1_02_b', 'C2/m1_01_z']
    );
  });

  it('preserves manifest order when no query is supplied', () => {
    assert.deepEqual(
      ids(getExplorerVisibleTopics(fixture, none, { courseCode: 'C1' })),
      ['C1/m1_01_a', 'C1/m1_02_b', 'C1/m1_03_c', 'C1/m1_04_d', 'C1/m2_01_e']
    );
    assert.deepEqual(
      ids(getExplorerVisibleTopics(fixture, none, { courseCode: 'all' })).length,
      6
    );
  });

  it('composes search with every existing facet', () => {
    const base = { courseCode: 'all', query: 'core' };
    // Course + module facets narrow ranked results.
    assert.deepEqual(
      ids(getExplorerVisibleTopics(fixture, none, { ...base, courseCode: 'C1', module: 1 })),
      ['C1/m1_01_a', 'C1/m1_02_b']
    );
    // Difficulty facet narrows (both are beginner).
    assert.deepEqual(
      ids(getExplorerVisibleTopics(fixture, none, { ...base, difficulties: 'beginner' })),
      ['C1/m1_01_a', 'C1/m1_02_b']
    );
    assert.deepEqual(
      ids(getExplorerVisibleTopics(fixture, none, { ...base, difficulties: 'advanced' })),
      []
    );
    // Exam facet narrows.
    assert.deepEqual(
      ids(getExplorerVisibleTopics(fixture, none, { ...base, examRelevances: 'medium' })),
      ['C1/m1_01_a', 'C1/m1_02_b']
    );
    // Journey / exam views compose.
    assert.deepEqual(
      ids(getExplorerVisibleTopics(fixture, readerFrom({ 'C1/m1_01_a': 'completed' }), { ...base, journey: 'completed' })),
      ['C1/m1_01_a']
    );
    assert.deepEqual(
      ids(getExplorerVisibleTopics(fixture, readerFrom({ 'C1/m1_01_a': 'completed' }), { ...base, examView: 'exam_completed' })),
      ['C1/m1_01_a']
    );
    // Assessment + attention views compose (bank covering Alpha only).
    const assessment = {
      bank: {
        version: 1,
        questions: [
          {
            id: 'q1', courseCode: 'C1', topicId: 'm1_01_a', type: 'true_false',
            question: 'A?', answer: true, explanation: 'E.',
            difficulty: 'beginner', examRelevance: 'high',
          },
        ],
      },
      attempts: { version: 1, attempts: [] },
    };
    assert.deepEqual(
      ids(getExplorerVisibleTopics(fixture, none, { ...base, assessment, assessmentFilter: 'available' })),
      ['C1/m1_01_a']
    );
    assert.deepEqual(
      ids(getExplorerVisibleTopics(fixture, none, { ...base, assessment, attentionFilter: 'exam_not_assessed' })),
      ['C1/m1_01_a']
    );
    assert.deepEqual(
      JSON.stringify(getExplorerVisibleTopics(fixture, none, { courseCode: 'all', query: '  Beta  ' })),
      JSON.stringify(getExplorerVisibleTopics(fixture, none, { courseCode: 'all', query: 'beta' }))
    );
  });

  it('supports multi-word queries spanning fields with token AND', () => {
    // 'c1 beta' spans course code + title; both tokens must match.
    assert.deepEqual(ids(Intel.searchTopics(fixture, 'c1 beta')), ['C1/m1_02_b']);
    assert.deepEqual(ids(Intel.searchTopics(fixture, 'c2 beta')), []);
    assert.equal(Intel.describeSearchMatch(fixture.topics[1], 'c1 beta'), 'title');
  });

  it('opens results through the existing topic-page links', () => {
    const results = getExplorerVisibleTopics(fixture, none, { courseCode: 'all', query: 'm1_02_b' });
    assert.equal(ids(results)[0], 'C1/m1_02_b');
    assert.ok(fs.readFileSync('explorer.html', 'utf-8').includes('id="xp-search"'));
    assert.ok(fs.readFileSync('assets/explorer.js', 'utf-8').includes('searchCurriculum'));
  });
});

describe('static path generation for search results', () => {
  it('resolves topic pages for local development and Pages subpaths', () => {
    const topic = fixture.topics[1];
    assert.equal(Data.topicPageUrl('', 'C1', topic), 'C1/m1_02_b.html');
    assert.equal(Data.topicPageUrl('/repo/', 'C1', topic), '/repo/C1/m1_02_b.html');
    // Every ranked result links through the same helper (no second router).
    for (const { topic: t } of Intel.searchCurriculum(fixture, 'core')) {
      assert.match(Data.topicPageUrl('', t.courseCode, t), /^[A-Za-z0-9]+\/[A-Za-z0-9_]+\.html$/);
    }
  });
});

describe('byte-identical repeated ordering', () => {
  it('produces identical rankings across runs', () => {
    for (const q of ['eta', 'core', 'm1_01_a', 'Gamma', 'course one', 'M1', 'do x', 'c1 beta']) {
      assert.equal(
        JSON.stringify(Intel.searchCurriculum(fixture, q)),
        JSON.stringify(Intel.searchCurriculum(fixture, q))
      );
      assert.equal(
        JSON.stringify(getExplorerVisibleTopics(fixture, none, { courseCode: 'all', query: q })),
        JSON.stringify(getExplorerVisibleTopics(fixture, none, { courseCode: 'all', query: q }))
      );
    }
  });
});

describe('search alters no other layer', () => {
  it('leaves recommendations, graph, readiness, revision, attention, state, and evaluation intact', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const store = createLearnerState({ manifest: fixture, storage: memoryStorage() });
    store.markTopicCompleted('C1', 'm1_01_a');
    const snap = () => JSON.stringify({
      recommended: Intel.getRecommendedNextTopics(fixture, getStatus),
      prereqs: Intel.getPrerequisites(fixture, 'C1', 'm1_04_d'),
      readiness: buildExamReadiness(fixture, getStatus),
      revision: buildRevisionModel(fixture, getStatus, null, NOW),
      attention: buildAttentionModel(fixture, getStatus, null, NOW, null).counts,
      learner: store.getTopicState('C1', 'm1_01_a'),
      evaluation: evaluateAnswer(
        { type: 'true_false', answer: true }, 'yes'
      ),
    });
    const NOW = 1800000000000;
    const before = snap();
    for (const q of ['alpha', 'eta', 'core', 'zzz', '', '   ', 'm1', 'c1 beta']) {
      Intel.searchTopics(fixture, q);
      Intel.searchCurriculum(fixture, q);
      Intel.combinedFilter(fixture, { query: q });
      getExplorerVisibleTopics(fixture, getStatus, { courseCode: 'all', query: q });
    }
    assert.equal(snap(), before);
  });
});

describe('live 432-topic repository', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });

  it('keeps all 432 topics discoverable with deterministic ranked order', () => {
    assert.equal(manifest.topics.length, 432);
    const byCourse = new Map();
    for (const t of manifest.topics) {
      if (!byCourse.has(t.courseCode)) byCourse.set(t.courseCode, []);
      byCourse.get(t.courseCode).push(t);
    }
    let exactFirst = 0;
    for (const t of manifest.topics) {
      // Bare IDs repeat across courses, so exactness is asserted within
      // the topic's own course scope; global search must still contain it.
      const scoped = Intel.searchCurriculum({ topics: byCourse.get(t.courseCode) }, t.id);
      assert.ok(scoped.length > 0, `${t.courseCode}/${t.id} discoverable by ID`);
      assert.equal(scoped[0].topic.id, t.id);
      assert.equal(scoped[0].matchKind, 'exact_id');
      exactFirst += 1;
      const global = Intel.searchCurriculum(manifest, `${t.courseCode} ${t.id}`);
      assert.ok(global.some((e) => e.topic.courseCode === t.courseCode && e.topic.id === t.id));
    }
    assert.equal(exactFirst, 432);
    // A broad query ranks deterministically and byte-identically.
    const first = JSON.stringify(Intel.searchCurriculum(manifest, 'introduction').map((e) => `${e.topic.courseCode}/${e.topic.id}/${e.matchKind}`));
    const second = JSON.stringify(Intel.searchCurriculum(manifest, 'introduction').map((e) => `${e.topic.courseCode}/${e.topic.id}/${e.matchKind}`));
    assert.equal(first, second);
    assert.ok(JSON.parse(first).length > 1);
    // Explorer global search spans courses.
    const visible = getExplorerVisibleTopics(manifest, none, { courseCode: 'all', query: 'm1' });
    assert.ok(visible.length > 100);
    assert.ok(new Set(visible.map((t) => t.courseCode)).size > 1);
    // Manifest order preserved without a query.
    assert.deepEqual(
      ids(getExplorerVisibleTopics(manifest, none, { courseCode: 'GAMAT301' })),
      ids(manifest.topics.filter((t) => t.courseCode === 'GAMAT301'))
    );
  });
});
