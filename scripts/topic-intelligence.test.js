/**
 * Dependency-free tests for the canonical Topic Intelligence Layer
 * (node:test + node:assert only — no test framework). Covers, on fixtures
 * plus the live 432-topic repository: root/leaf detection,
 * ancestors/descendants, dependency chains, depth, navigation and
 * module/course boundaries, combined discovery, progress-aware readiness
 * (completed vs blocked, ancestor completion, remaining counts,
 * recommendation order), deterministic ordering, Node/browser export
 * identity, invalid ids/courses, empty searches, and cyclic/dangling
 * graphs (termination, never hangs).
 *
 * Run: npm test  (node --test scripts/topic-intelligence.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as ScriptsAPI from './topic-intelligence.js';
import * as AssetsAPI from '../assets/topic-intelligence.js';
import { buildTopicManifest } from './topic-manifest.js';
import { loadTopicSchema } from './topic-metadata.js';
import { loadCurriculum } from './curriculum.js';

const {
  topicKey,
  getTopic,
  getCourseTopics,
  getModuleTopics,
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
  searchTopics,
  searchConcepts,
  filterByTags,
  filterByDifficulty,
  filterByExamRelevance,
  filterByMaxMinutes,
  combinedFilter,
  getCompletedPrerequisites,
  getBlockedPrerequisites,
  getReadyTopics,
  getInProgressTopics,
  getRecommendedNextTopics,
  getNextRecommendedTopic,
  getAncestorCompletion,
  getRemainingDependencyCount,
} = ScriptsAPI;

function entry(overrides) {
  const base = {
    id: 'x', courseCode: 'C1', courseName: 'Course One', module: 1, moduleName: 'M1',
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

const cyclic = {
  version: 1,
  topics: [
    entry({ id: 'm1_01_x', title: 'X', sequence: 1, prerequisites: ['m1_02_y'], prerequisiteDepth: 1 }),
    entry({ id: 'm1_02_y', title: 'Y', sequence: 2, prerequisites: ['m1_01_x'], prerequisiteDepth: 1 }),
    entry({ id: 'm1_03_w', title: 'W', sequence: 3, prerequisites: ['m9_99_ghost'], prerequisiteDepth: 1 }),
  ],
};

const ids = (topics) => topics.map((t) => `${t.courseCode}/${t.id}`);
const readerFrom = (map) => (course, id) => map[`${course}/${id}`];

describe('Node/browser export identity', () => {
  it('shares one implementation across entry points', () => {
    for (const name of ['getTopic', 'getAncestors', 'getDescendants', 'combinedFilter', 'getRecommendedNextTopics', 'getPrerequisiteDepth']) {
      assert.equal(ScriptsAPI[name], AssetsAPI[name]);
    }
    assert.deepEqual(ids(getAncestors(fixture, 'C1', 'm1_04_d')),
      ids(AssetsAPI.getAncestors(fixture, 'C1', 'm1_04_d')));
  });
});

describe('root/leaf detection', () => {
  it('flags roots and leaves, rejects unknown topics', () => {
    assert.equal(isRootTopic(fixture, 'C1', 'm1_01_a'), true);
    assert.equal(isRootTopic(fixture, 'C1', 'm1_02_b'), false);
    assert.equal(isLeafTopic(fixture, 'C1', 'm1_04_d'), true);
    assert.equal(isLeafTopic(fixture, 'C1', 'm1_02_b'), false);
    assert.equal(isRootTopic(fixture, 'C1', 'nope'), false);
    assert.equal(isLeafTopic(fixture, 'NOPE', 'm1_01_a'), false);
  });
});

describe('ancestors/descendants/chains', () => {
  it('collects transitive ancestors once, in curriculum order', () => {
    assert.deepEqual(ids(getAncestors(fixture, 'C1', 'm1_04_d')),
      ['C1/m1_01_a', 'C1/m1_02_b', 'C1/m1_03_c']);
    assert.deepEqual(getAncestors(fixture, 'C1', 'm1_01_a'), []);
    assert.deepEqual(getAncestors(fixture, 'C1', 'nope'), []);
  });

  it('collects transitive descendants in curriculum order', () => {
    assert.deepEqual(ids(getDescendants(fixture, 'C1', 'm1_01_a')),
      ['C1/m1_02_b', 'C1/m1_03_c', 'C1/m1_04_d']);
    assert.deepEqual(getDescendants(fixture, 'C1', 'm1_04_d'), []);
    assert.deepEqual(getDescendants(fixture, 'C2', 'm1_01_z'), []);
  });

  it('chains ancestors plus self, and recomputes stored depths', () => {
    assert.deepEqual(ids(getDependencyChain(fixture, 'C1', 'm1_04_d')),
      ['C1/m1_01_a', 'C1/m1_02_b', 'C1/m1_03_c', 'C1/m1_04_d']);
    assert.deepEqual(getDependencyChain(fixture, 'C1', 'nope'), []);
    assert.equal(getPrerequisiteDepth(fixture, 'C1', 'm1_04_d'), 2);
    assert.equal(getPrerequisiteDepth(fixture, 'C1', 'm1_01_a'), 0);
    assert.equal(getPrerequisiteDepth(fixture, 'C1', 'nope'), null);
  });

  it('terminates on cycles and skips dangling ids', () => {
    assert.deepEqual(ids(getAncestors(cyclic, 'C1', 'm1_01_x')), ['C1/m1_02_y']);
    assert.deepEqual(ids(getDescendants(cyclic, 'C1', 'm1_01_x')), ['C1/m1_02_y']);
    assert.deepEqual(getAncestors(cyclic, 'C1', 'm1_03_w'), []);
    assert.equal(typeof getPrerequisiteDepth(cyclic, 'C1', 'm1_01_x'), 'number');
  });
});

describe('curriculum navigation', () => {
  it('steps globally with null at the ends and for unknown ids', () => {
    assert.equal(getNextTopic(fixture, 'C1', 'm1_01_a').id, 'm1_02_b');
    assert.equal(getPreviousTopic(fixture, 'C1', 'm1_01_a'), null);
    assert.equal(getPreviousTopic(fixture, 'C2', 'm1_01_z').id, 'm2_01_e');
    assert.equal(getNextTopic(fixture, 'C2', 'm1_01_z'), null);
    assert.equal(getNextTopic(fixture, 'C1', 'nope'), null);
  });

  it('stays inside modules and courses at their boundaries', () => {
    assert.equal(getNextInModule(fixture, 'C1', 'm1_04_d'), null);
    assert.equal(getPreviousInModule(fixture, 'C1', 'm2_01_e'), null);
    assert.equal(getNextInModule(fixture, 'C1', 'm1_01_a').id, 'm1_02_b');
    assert.equal(getNextInCourse(fixture, 'C1', 'm2_01_e'), null);
    assert.equal(getPreviousInCourse(fixture, 'C1', 'm2_01_e').id, 'm1_04_d');
    assert.equal(getPreviousInCourse(fixture, 'C2', 'm1_01_z'), null);
  });

  it('reports module and course boundaries, empty-safe', () => {
    assert.deepEqual(
      [getModuleBoundaries(fixture, 'C1', 1).first.id, getModuleBoundaries(fixture, 'C1', 1).last.id],
      ['m1_01_a', 'm1_04_d']);
    assert.deepEqual(getModuleBoundaries(fixture, 'C1', 9), { first: null, last: null });
    assert.deepEqual(
      [getCourseBoundaries(fixture, 'C1').first.id, getCourseBoundaries(fixture, 'C1').last.id],
      ['m1_01_a', 'm2_01_e']);
    assert.deepEqual(getCourseBoundaries(fixture, 'NOPE'), { first: null, last: null });
  });
});

describe('classification accessors', () => {
  it('reads fields null-safely with copies', () => {
    assert.equal(getDifficulty(fixture, 'C1', 'm1_03_c'), 'advanced');
    assert.equal(getExamRelevance(fixture, 'C1', 'm1_03_c'), 'high');
    assert.equal(getEstimatedMinutes(fixture, 'C1', 'm1_03_c'), 9);
    assert.deepEqual(getConcepts(fixture, 'C1', 'm1_01_a'), ['alpha concept']);
    assert.deepEqual(getTags(fixture, 'C1', 'm1_01_a'), ['core']);
    assert.deepEqual(getLearningObjectives(fixture, 'C1', 'm1_01_a'), ['Do X']);
    assert.equal(getDifficulty(fixture, 'C1', 'nope'), null);
    assert.deepEqual(getConcepts(fixture, 'C1', 'nope'), []);
    assert.deepEqual(getTags(null, 'C1', 'm1_01_a'), []);
  });
});

describe('discovery', () => {
  it('searches titles, concepts, and tags; concept search is concept-only', () => {
    assert.deepEqual(ids(searchTopics(fixture, 'alpha')), ['C1/m1_01_a']);
    assert.deepEqual(ids(searchTopics(fixture, 'CORE')), ['C1/m1_01_a', 'C1/m1_02_b']);
    assert.deepEqual(searchTopics(fixture, '   '), []);
    assert.deepEqual(ids(searchConcepts(fixture, 'beta concept')), ['C1/m1_02_b']);
    assert.deepEqual(ids(searchConcepts(fixture, 'core')), []);
  });

  it('filters by tags, difficulty, exam relevance, and study time', () => {
    assert.deepEqual(ids(filterByTags(fixture, ['core'])), ['C1/m1_01_a', 'C1/m1_02_b']);
    assert.deepEqual(ids(filterByTags(fixture, ['core', 'extra'], 'any')),
      ['C1/m1_01_a', 'C1/m1_02_b', 'C1/m1_03_c']);
    assert.deepEqual(filterByTags(fixture, []), fixture.topics);
    assert.deepEqual(ids(filterByDifficulty(fixture, 'advanced')), ['C1/m1_03_c']);
    assert.deepEqual(ids(filterByExamRelevance(fixture, ['high', 'medium'])),
      ['C1/m1_01_a', 'C1/m1_02_b', 'C1/m1_03_c', 'C1/m1_04_d', 'C1/m2_01_e', 'C2/m1_01_z']);
    assert.deepEqual(ids(filterByMaxMinutes(fixture, 5)).length, 5);
    assert.deepEqual(filterByMaxMinutes(fixture, 4), []);
  });

  it('combines every facet with AND in manifest order', () => {
    assert.deepEqual(ids(combinedFilter(fixture, {
      courseCode: 'C1', difficulties: ['beginner'], tags: ['core'],
    })), ['C1/m1_01_a', 'C1/m1_02_b']);
    assert.deepEqual(ids(combinedFilter(fixture, { query: 'gamma', module: 1 })), ['C1/m1_03_c']);
    assert.deepEqual(combinedFilter(fixture, { courseCode: 'NOPE' }), []);
    assert.deepEqual(ids(combinedFilter(fixture, {})), ids(fixture.topics));
  });
});

describe('progress-aware intelligence', () => {
  it('splits completed vs blocked prerequisites with live states', () => {
    const reader = readerFrom({ 'C1/m1_02_b': 'completed' });
    assert.deepEqual(getCompletedPrerequisites(fixture, reader, 'C1', 'm1_04_d').map((p) => p.id), ['m1_02_b']);
    assert.deepEqual(getBlockedPrerequisites(fixture, reader, 'C1', 'm1_04_d').map((p) => p.id), ['m1_03_c']);
    assert.deepEqual(getBlockedPrerequisites(fixture, reader, 'C1', 'm1_04_d')[0].state, 'not_started');
    assert.deepEqual(getCompletedPrerequisites(fixture, reader, 'C1', 'nope'), []);
  });

  it('orders recommendations: in-progress, then blockers, then ready', () => {
    const reader = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_03_c': 'in_progress' });
    assert.deepEqual(ids(getRecommendedNextTopics(fixture, reader)),
      ['C1/m1_03_c', 'C1/m1_02_b', 'C1/m2_01_e', 'C2/m1_01_z']);
    assert.equal(getNextRecommendedTopic(fixture, reader).id, 'm1_03_c');
    const done = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed', 'C1/m1_03_c': 'completed' });
    assert.equal(getNextRecommendedTopic(fixture, done).id, 'm1_04_d');
  });

  it('scores ancestor completion and remaining dependencies', () => {
    const none = readerFrom({});
    assert.deepEqual(getAncestorCompletion(fixture, none, 'C1', 'm1_04_d'),
      { completed: 0, total: 3, percent: 0 });
    assert.equal(getRemainingDependencyCount(fixture, none, 'C1', 'm1_04_d'), 3);
    const half = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    assert.deepEqual(getAncestorCompletion(fixture, half, 'C1', 'm1_04_d'),
      { completed: 2, total: 3, percent: 67 });
    assert.equal(getRemainingDependencyCount(fixture, half, 'C1', 'm1_04_d'), 1);
    assert.deepEqual(getAncestorCompletion(fixture, none, 'C1', 'm1_01_a'),
      { completed: 0, total: 0, percent: 100 });
  });

  it('treats unknown statuses as unfinished without crashing', () => {
    const reader = () => 'bogus';
    assert.deepEqual(ids(getRecommendedNextTopics(fixture, reader)), ['C1/m1_01_a', 'C1/m2_01_e', 'C2/m1_01_z']);
    assert.equal(getAncestorCompletion(fixture, reader, 'C1', 'm1_04_d').percent, 0);
  });
});

describe('live 432-topic repository', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });

  it('indexes all 432 topics with full relationship coverage', () => {
    assert.equal(manifest.topics.length, 432);
    assert.deepEqual(ids(getAncestors(manifest, 'PCCST501', 'm1_07_domain_name_system_dns')),
      ['PCCST501/m1_01_internet_overview_and_network_edge',
        'PCCST501/m1_03_application_layer_paradigms',
        'PCCST501/m1_04_world_wide_web_and_http',
        'PCCST501/m1_05_file_transfer_protocol_ftp',
        'PCCST501/m1_06_electronic_mail_smtp_pop3_imap']);
    assert.equal(getDependencyChain(manifest, 'GXEST104', 'm2_09_m2_mixed_drill').length, 10);
    assert.equal(isRootTopic(manifest, 'GAMAT301', 'm1_01_random_variables_pmf_cdf'), true);
    assert.equal(isLeafTopic(manifest, 'GAMAT301', 'm1_06_expectation_functions_m1_drill'), true);
  });

  it('navigates live modules, courses, and filters deterministically', () => {
    assert.equal(getNextTopic(manifest, 'GAMAT301', 'm1_01_random_variables_pmf_cdf').id,
      'm1_02_expectation_mean_variance');
    assert.equal(getPreviousTopic(manifest, 'GAMAT301', 'm1_01_random_variables_pmf_cdf'), null);
    assert.deepEqual(
      [getCourseBoundaries(manifest, 'GAMAT301').first.id, getCourseBoundaries(manifest, 'GAMAT301').last.id],
      ['m1_01_random_variables_pmf_cdf', 'm4_06_m4_mixed_drill']);
    assert.deepEqual(
      [getModuleBoundaries(manifest, 'PCCST501', 1).first.id, getModuleBoundaries(manifest, 'PCCST501', 1).last.id],
      ['m1_01_internet_overview_and_network_edge', 'm1_99_practice_lab_application_layer_drills']);
    assert.equal(combinedFilter(manifest, { courseCode: 'PCCST501', difficulties: ['beginner'] }).length, 32);
    assert.equal(JSON.stringify(getAncestors(manifest, 'PCCST501', 'm1_07_domain_name_system_dns')),
      JSON.stringify(getAncestors(manifest, 'PCCST501', 'm1_07_domain_name_system_dns')));
  });

  it('scores live progress and recommends the curriculum head', () => {
    const none = () => 'not_started';
    const first = getRecommendedNextTopics(manifest, none)[0];
    assert.equal(`${first.courseCode}/${first.id}`, 'GAMAT301/m1_01_random_variables_pmf_cdf');
    assert.equal(getNextRecommendedTopic(manifest, none).id, 'm1_01_random_variables_pmf_cdf');
    assert.deepEqual(getAncestorCompletion(manifest, none, 'GXEST104', 'm2_09_m2_mixed_drill'),
      { completed: 0, total: 9, percent: 0 });
    assert.equal(getRemainingDependencyCount(manifest, none, 'GXEST104', 'm2_09_m2_mixed_drill'), 9);
    assert.equal(getPrerequisiteDepth(manifest, 'GXEST104', 'm2_09_m2_mixed_drill'), 8);
  });
});
