/**
 * Dependency-free tests for the unified Learning Journey layer
 * (node:test + node:assert only — no test framework). Covers the pure
 * model in assets/learning-journey.js (via scripts/learning-journey.js)
 * plus its Dashboard / Explorer / Topic Study Context integrations:
 * new learner, in-progress preference, completed prerequisite chains,
 * all four recommendation reasons with explainable messages, multiple
 * unlocked dependents, completed-topic transitions, all-completed and
 * invalid/empty states, cross-course boundaries, deterministic ordering,
 * browser event synchronization, Dashboard model, Explorer model, Study
 * Context integration, and the full 486-topic repository.
 *
 * Run: npm test  (node --test scripts/learning-journey.test.js)
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as Journey from './learning-journey.js';
import * as AssetsJourney from '../assets/learning-journey.js';
import { createLearnerState, memoryStorage } from '../assets/learner-state.js';
import {
  buildStudyContextModel,
  renderStudyContext,
  PROGRESS_CHANGED_EVENT as STUDY_EVENT,
} from '../assets/topic-study-context.js';
import { buildDashboardJourneyModel } from '../assets/dashboard.js';
import { getExplorerVisibleTopics, getExplorerTopicJourney } from '../assets/explorer.js';
import { buildTopicManifest } from './topic-manifest.js';
import { loadTopicSchema } from './topic-metadata.js';
import { loadCurriculum } from './curriculum.js';

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

// Chain a->b->c in C1, fan-out a->[b,c] style multi-dependent, plus C2 root.
const fixture = {
  version: 1,
  topics: [
    entry({ id: 'm1_01_a', title: 'Alpha', sequence: 1 }),
    entry({ id: 'm1_02_b', title: 'Beta', sequence: 2, prerequisites: ['m1_01_a'], prerequisiteDepth: 1 }),
    entry({ id: 'm1_03_c', title: 'Gamma', sequence: 3, prerequisites: ['m1_01_a'], prerequisiteDepth: 1 }),
    entry({ id: 'm1_04_d', title: 'Delta', sequence: 4, prerequisites: ['m1_02_b', 'm1_03_c'], prerequisiteDepth: 2 }),
    entry({ id: 'm1_01_z', courseCode: 'C2', courseName: 'Course Two', title: 'Zeta', sequence: 1 }),
  ],
};

const ids = (topics) => topics.map((t) => `${t.courseCode}/${t.id}`);
const readerFrom = (map) => (course, id) => map[`${course}/${id}`];
const none = () => 'not_started';

beforeEach(() => {
  Journey.clearJourneyListeners();
});

describe('module identity and event contract', () => {
  it('shares one implementation across Node and browser entry points', () => {
    for (const name of [
      'buildJourneyModel', 'buildTopicJourney', 'buildDashboardModel',
      'buildExplorerTopicModel', 'filterTopicsByJourney', 'getRecommendationReason',
      'explainRecommendation', 'getUnlockedDependents', 'getNewlyUnlockedDependents',
    ]) {
      assert.equal(Journey[name], AssetsJourney[name]);
    }
    assert.equal(Journey.PROGRESS_CHANGED_EVENT, 'tarangam:progress-changed');
    assert.equal(STUDY_EVENT, Journey.PROGRESS_CHANGED_EVENT);
  });

  it('uses one browser event name across journey, study context, and template', () => {
    const template = fs.readFileSync('templates/base.html', 'utf-8');
    assert.ok(template.includes(`'${Journey.PROGRESS_CHANGED_EVENT}'`));
    const usesContract = (source) =>
      source.includes('tarangam:progress-changed') ||
      source.includes('PROGRESS_CHANGED_EVENT') ||
      source.includes('emitJourneyProgressChanged') ||
      source.includes('onJourneyProgressChanged');
    assert.ok(usesContract(fs.readFileSync('assets/dashboard.js', 'utf-8')));
    assert.ok(usesContract(fs.readFileSync('assets/explorer.js', 'utf-8')));
    assert.ok(usesContract(fs.readFileSync('assets/topic-study-context.js', 'utf-8')));
    assert.ok(fs.readFileSync('assets/learning-journey.js', 'utf-8').includes('tarangam:progress-changed'));
  });

  it('synchronizes listeners without polling via the shared bus', () => {
    const seen = [];
    const offA = Journey.onJourneyProgressChanged((detail) => seen.push(['a', detail]));
    const offB = Journey.onJourneyProgressChanged((detail) => seen.push(['b', detail]));
    Journey.emitJourneyProgressChanged({ courseCode: 'C1', topicId: 'm1_01_a', source: 'test' });
    assert.equal(seen.length, 2);
    assert.deepEqual(seen[0][1], { courseCode: 'C1', topicId: 'm1_01_a', source: 'test' });
    offA();
    Journey.emitJourneyProgressChanged({ source: 'second' });
    assert.equal(seen.length, 3);
    assert.deepEqual(seen[2][0], 'b');
    offB();
    Journey.clearJourneyListeners();
  });
});

describe('new learner state', () => {
  it('starts empty with the curriculum head as deterministic recommendation', () => {
    const model = Journey.buildJourneyModel(fixture, none);
    assert.equal(model.isEmpty, true);
    assert.equal(model.isComplete, false);
    assert.deepEqual(model.inProgress, []);
    assert.equal(model.recommended.id, 'm1_01_a');
    assert.equal(model.recommended.courseCode, 'C1');
    assert.deepEqual(model.overall, { total: 5, completed: 0, inProgress: 0, notStarted: 5, percent: 0 });
    // Starting point is curriculum order, not personalization.
    assert.ok(model.recommendationExplanation.includes('Alpha'));
  });

  it('dashboard model exposes the new-user hierarchy with empty recent list', () => {
    const model = Journey.buildDashboardModel(fixture, none, { getTimestamp: () => null });
    assert.equal(model.recommended.id, 'm1_01_a');
    assert.deepEqual(model.currentWork, []);
    assert.ok(model.readyToLearn.length > 0);
    assert.deepEqual(model.recentlyCompleted, []);
    assert.deepEqual(ids(model.ready), ['C1/m1_01_a', 'C2/m1_01_z']);
  });
});

describe('in-progress learner', () => {
  it('prefers continuing in-progress work with an explainable reason', () => {
    const reader = readerFrom({ 'C1/m1_03_c': 'in_progress' });
    const model = Journey.buildJourneyModel(fixture, reader);
    assert.equal(model.recommended.id, 'm1_03_c');
    assert.equal(model.recommendationReason, Journey.REASON_CONTINUE_IN_PROGRESS);
    assert.match(model.recommendationExplanation, /Continue: you already started/);
    assert.deepEqual(ids(model.inProgress), ['C1/m1_03_c']);
  });

  it('dashboard current work mirrors the journey in-progress list', () => {
    const store = createLearnerState({ manifest: fixture, storage: memoryStorage() });
    store.markTopicStarted('C1', 'm1_02_b');
    const reader = (c, id) => store.getTopicState(c, id).status;
    const model = buildDashboardJourneyModel(fixture, reader, () => null);
    assert.deepEqual(ids(model.currentWork), ['C1/m1_02_b']);
    assert.equal(model.recommendationReason, 'continue_in_progress');
  });
});

describe('completed prerequisite chain', () => {
  it('advances to the dependent and reports prerequisite math', () => {
    const store = createLearnerState({ manifest: fixture, storage: memoryStorage() });
    store.markTopicCompleted('C1', 'm1_01_a');
    const reader = (c, id) => store.getTopicState(c, id).status;
    const model = Journey.buildJourneyModel(fixture, reader);
    // Beta unblocks Delta while Gamma is also ready: blockers first in order.
    assert.equal(model.recommended.id, 'm1_02_b');
    assert.equal(model.recommendationReason, Journey.REASON_UNBLOCKS_FUTURE);
    assert.deepEqual(model.recommendationDetail, {
      courseCode: 'C1',
      id: 'm1_02_b',
      status: 'not_started',
      estimatedMinutes: 5,
      completedPrereqs: 1,
      totalPrereqs: 1,
      prereqPercent: 100,
      remainingDependencies: 0,
      unlockCount: 1,
      isReady: true,
    });
    const focus = Journey.buildTopicJourney(fixture, reader, 'C1', 'm1_04_d');
    assert.deepEqual(focus.prereqCompletion, { completed: 0, total: 2, percent: 0 });
    assert.equal(focus.remainingDependencies, 2);
  });
});

describe('recommendation reasoning', () => {
  it('explains continue_in_progress without inventing unlocks', () => {
    const reader = readerFrom({ 'C2/m1_01_z': 'in_progress' });
    const topic = fixture.topics[4];
    assert.equal(Journey.getRecommendationReason(fixture, reader, topic), 'continue_in_progress');
    const explained = Journey.explainRecommendation(fixture, reader, topic);
    assert.match(explained.message, /Continue: you already started/);
    assert.ok(explained.message.includes('Zeta'));
  });

  it('explains unblocks_future_topic with a provable unlock count', () => {
    const reader = readerFrom({ 'C1/m1_01_a': 'completed' });
    const beta = fixture.topics[1];
    assert.equal(Journey.getRecommendationReason(fixture, reader, beta), 'unblocks_future_topic');
    const explained = Journey.explainRecommendation(fixture, reader, beta);
    assert.match(explained.message, /helps unlock 1 later topic/);
    assert.equal(explained.unlockCount, 1);
  });

  it('explains ready_curriculum_order when nothing further is unlocked', () => {
    const single = {
      version: 1,
      topics: [entry({ id: 'm1_01_solo', title: 'Solo', sequence: 1 })],
    };
    const explained = Journey.explainRecommendation(single, none, single.topics[0]);
    assert.equal(explained.reason, 'ready_curriculum_order');
    assert.match(explained.message, /Ready: all prerequisites are complete/);
  });

  it('explains curriculum_fallback for not-ready fallback topics', () => {
    const reader = readerFrom({});
    const delta = fixture.topics[3];
    assert.equal(Journey.getRecommendationReason(fixture, reader, delta), 'curriculum_fallback');
    const explained = Journey.explainRecommendation(fixture, reader, delta);
    assert.equal(explained.reason, 'curriculum_fallback');
    assert.match(explained.message, /next unfinished topic in curriculum order/);
    assert.match(explained.message, /nothing is ever locked/);
  });

  it('never claims unlocks the graph cannot prove', () => {
    const reader = readerFrom({ 'C1/m1_01_a': 'completed' });
    const beta = fixture.topics[1];
    const descendants = fixture.topics.filter((t) =>
      t.courseCode === 'C1' && ['m1_04_d'].includes(t.id));
    assert.equal(Journey.explainRecommendation(fixture, reader, beta).unlockCount, descendants.length);
  });
});

describe('multiple unlocked dependents', () => {
  it('exposes every newly-ready dependent as informational choices', () => {
    const before = readerFrom({});
    const store = createLearnerState({ manifest: fixture, storage: memoryStorage() });
    store.markTopicCompleted('C1', 'm1_01_a');
    const after = (c, id) => store.getTopicState(c, id).status;
    const unlocked = Journey.getUnlockedDependents(fixture, after, 'C1', 'm1_01_a');
    assert.deepEqual(ids(unlocked), ['C1/m1_02_b', 'C1/m1_03_c']);
    const newly = Journey.getNewlyUnlockedDependents(fixture, before, after, 'C1', 'm1_01_a');
    assert.deepEqual(ids(newly), ['C1/m1_02_b', 'C1/m1_03_c']);
    // Study context surfaces them as choices, not a forced pick.
    const model = buildStudyContextModel(fixture, after, 'C1', 'm1_01_a');
    assert.deepEqual(model.unlockedDependents.map((t) => t.id), ['m1_02_b', 'm1_03_c']);
    const html = renderStudyContext(model);
    assert.match(html, /Unlocked by completing/);
    assert.match(html, /informational only/);
    assert.ok(html.includes('m1_02_b.html') && html.includes('m1_03_c.html'));
  });
});

describe('completed topic transition', () => {
  it('reflects completion immediately and advances the recommendation', () => {
    const store = createLearnerState({ manifest: fixture, storage: memoryStorage() });
    const reader = (c, id) => store.getTopicState(c, id).status;
    let model = buildStudyContextModel(fixture, reader, 'C1', 'm1_01_a');
    assert.equal(model.status, 'not_started');
    assert.equal(model.recommended.id, 'm1_01_a');
    store.markTopicCompleted('C1', 'm1_01_a');
    model = buildStudyContextModel(fixture, reader, 'C1', 'm1_01_a');
    assert.equal(model.status, 'completed');
    assert.equal(model.recommended.id, 'm1_02_b');
    assert.equal(model.recommendationReason, 'unblocks_future_topic');
    assert.match(model.recommendationExplanation, /helps unlock/);
    const journey = Journey.buildJourneyModel(fixture, reader);
    assert.equal(journey.recommended.id, 'm1_02_b');
  });

  it('notifies all surfaces through the shared event on completion', () => {
    const store = createLearnerState({ manifest: fixture, storage: memoryStorage() });
    let renders = 0;
    const off = Journey.onJourneyProgressChanged(() => { renders += 1; });
    store.markTopicCompleted('C1', 'm1_01_a');
    Journey.emitJourneyProgressChanged({ courseCode: 'C1', topicId: 'm1_01_a', source: 'study-context' });
    assert.equal(renders, 1);
    off();
  });
});

describe('all-completed state', () => {
  it('reports curriculum-complete without locking anything', () => {
    const all = {};
    for (const t of fixture.topics) all[`${t.courseCode}/${t.id}`] = 'completed';
    const reader = readerFrom(all);
    const model = Journey.buildJourneyModel(fixture, reader);
    assert.equal(model.isComplete, true);
    assert.equal(model.recommended, null);
    assert.equal(model.recommendationReason, null);
    assert.match(model.recommendationExplanation, /Curriculum complete/);
    assert.deepEqual(model.overall, { total: 5, completed: 5, inProgress: 0, notStarted: 0, percent: 100 });
    assert.deepEqual(model.ready, []);
    const dashboard = Journey.buildDashboardModel(fixture, reader, { getTimestamp: () => null });
    assert.equal(dashboard.isComplete, true);
    assert.deepEqual(dashboard.readyToLearn, []);
  });
});

describe('invalid and empty states', () => {
  it('handles null manifests and unknown topics without throwing', () => {
    assert.deepEqual(Journey.buildJourneyModel(null, none).inProgress, []);
    assert.equal(Journey.buildJourneyModel(null, none).recommended, null);
    assert.equal(Journey.buildTopicJourney(fixture, none, 'C1', 'nope'), null);
    assert.equal(Journey.buildTopicJourney(fixture, none, 'NOPE', 'm1_01_a'), null);
    assert.equal(Journey.buildExplorerTopicModel(fixture, none, 'C1', 'nope'), null);
    assert.equal(Journey.getRecommendationReason(fixture, none, null), 'curriculum_fallback');
    assert.deepEqual(Journey.filterTopicsByJourney(fixture, none, null, 'ready'), []);
    assert.deepEqual(Journey.getUnlockedDependents(fixture, none, 'C1', 'nope'), []);
  });

  it('treats bogus statuses as unfinished and keeps deterministic output', () => {
    const bogus = () => 'bogus';
    const model = Journey.buildJourneyModel(fixture, bogus);
    assert.equal(model.isEmpty, true);
    assert.equal(model.recommended.id, 'm1_01_a');
    assert.equal(Journey.buildJourneyModel({ version: 1, topics: [] }, none).totalTopics, 0);
  });
});

describe('cross-course boundaries', () => {
  it('recommends across courses in manifest order and tracks per-course progress', () => {
    const reader = readerFrom({
      'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed',
      'C1/m1_03_c': 'completed', 'C1/m1_04_d': 'completed',
    });
    const model = Journey.buildJourneyModel(fixture, reader);
    assert.equal(`${model.recommended.courseCode}/${model.recommended.id}`, 'C2/m1_01_z');
    assert.deepEqual(model.courseProgress.find((r) => r.courseCode === 'C1').completed, 4);
    assert.deepEqual(model.courseProgress.find((r) => r.courseCode === 'C2').completed, 0);
    const focus = Journey.buildTopicJourney(fixture, reader, 'C2', 'm1_01_z');
    assert.equal(focus.immediatePrev.id, 'm1_04_d');
    assert.equal(focus.immediateNext, null);
    assert.equal(focus.status, 'not_started');
  });
});

describe('deterministic ordering', () => {
  it('returns identical journey snapshots across runs', () => {
    const reader = readerFrom({ 'C1/m1_01_a': 'completed' });
    // Fixed clock: time-dependent analytics/review fields must not use the
    // real Date.now() when asserting determinism.
    const opts = { now: 1700000000000 };
    const first = JSON.stringify(Journey.buildJourneyModel(fixture, reader, opts));
    const second = JSON.stringify(Journey.buildJourneyModel(fixture, reader, opts));
    assert.equal(first, second);
    assert.deepEqual(
      ids(Journey.buildJourneyModel(fixture, reader).ready),
      ids(Journey.buildJourneyModel(fixture, reader).ready)
    );
  });
});

describe('dashboard model', () => {
  it('orders ready deterministically and sorts recent by timestamp', () => {
    const store = createLearnerState({ manifest: fixture, storage: memoryStorage() });
    store.markTopicCompleted('C1', 'm1_01_a', 1000);
    store.markTopicCompleted('C2', 'm1_01_z', 2000);
    store.markTopicStarted('C1', 'm1_02_b', 3000);
    const reader = (c, id) => store.getTopicState(c, id).status;
    const stamps = (c, id) => store.lastAccessed(c, id);
    const model = Journey.buildDashboardModel(fixture, reader, { getTimestamp: stamps });
    assert.deepEqual(ids(model.ready), ['C1/m1_02_b', 'C1/m1_03_c']);
    assert.deepEqual(ids(model.recentlyCompleted), ['C2/m1_01_z', 'C1/m1_01_a']);
    assert.deepEqual(ids(model.currentWork), ['C1/m1_02_b']);
  });

  it('extends (not replaces) the dashboard UI hierarchy', () => {
    const html = fs.readFileSync('dashboard.html', 'utf-8');
    assert.ok(html.includes('id="db-continue"'));
    assert.ok(html.includes('id="db-progress-list"'));
    assert.ok(html.includes('id="db-ready-list"'));
    assert.ok(html.includes('id="db-recent-list"'));
    assert.ok(html.includes('Continue learning') || fs.readFileSync('assets/dashboard.js', 'utf-8').includes('Continue learning'));
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    assert.ok(js.includes('buildDashboardModel'));
    assert.ok(js.includes('recommendationExplanation') || js.includes('recommendationReason'));
  });
});

describe('explorer model', () => {
  it('reports status, readiness, counts, and recommendation per topic', () => {
    const reader = readerFrom({ 'C1/m1_01_a': 'completed' });
    const beta = Journey.buildExplorerTopicModel(fixture, reader, 'C1', 'm1_02_b');
    assert.equal(beta.status, 'not_started');
    assert.equal(beta.isReady, true);
    assert.deepEqual(beta.prereqCompletion, { completed: 1, total: 1, percent: 100 });
    assert.equal(beta.remainingDependencies, 0);
    assert.equal(beta.isRecommended, true);
    assert.match(beta.readyLabel, /Ready/);
    const delta = Journey.buildExplorerTopicModel(fixture, reader, 'C1', 'm1_04_d');
    assert.equal(delta.isReady, false);
    assert.equal(delta.remainingDependencies, 2);
    assert.match(delta.readyLabel, /Not ready/);
    assert.match(delta.readyLabel, /informational only/);
  });

  it('filters by journey without duplicating the dashboard', () => {
    const reader = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'in_progress' });
    const scoped = fixture.topics.filter((t) => t.courseCode === 'C1');
    assert.deepEqual(ids(Journey.filterTopicsByJourney(fixture, reader, scoped, 'all')), ids(scoped));
    assert.deepEqual(ids(Journey.filterTopicsByJourney(fixture, reader, scoped, 'completed')), ['C1/m1_01_a']);
    assert.deepEqual(ids(Journey.filterTopicsByJourney(fixture, reader, scoped, 'in_progress')), ['C1/m1_02_b']);
    // Ready means unfinished with every direct prerequisite complete, so the
    // in-progress Beta (prereq Alpha done) stays ready alongside Gamma.
    assert.deepEqual(ids(Journey.filterTopicsByJourney(fixture, reader, scoped, 'ready')), ['C1/m1_02_b', 'C1/m1_03_c']);
    assert.equal(Journey.normalizeJourneyFilter('bogus'), 'all');
  });

  it('exposes the journey filter in the explorer UI via the canonical API', () => {
    const html = fs.readFileSync('explorer.html', 'utf-8');
    assert.ok(html.includes('id="xp-journey"'));
    const js = fs.readFileSync('assets/explorer.js', 'utf-8');
    assert.ok(js.includes('filterTopicsByJourney') || js.includes('getExplorerVisibleTopics'));
    assert.ok(js.includes('buildExplorerTopicModel'));
    // Pure explorer helper preserves manifest order through both filters.
    const reader = readerFrom({});
    const visible = getExplorerVisibleTopics(fixture, reader, { courseCode: 'C1', journey: 'ready' });
    assert.deepEqual(ids(visible), ['C1/m1_01_a']);
    const beta = getExplorerTopicJourney(fixture, reader, 'C1', 'm1_02_b');
    assert.equal(beta.remainingDependencies, 1);
  });
});

describe('topic context integration', () => {
  it('carries journey reasoning, navigation, and module neighbors', () => {
    const reader = readerFrom({ 'C1/m1_01_a': 'completed' });
    const model = buildStudyContextModel(fixture, reader, 'C1', 'm1_02_b');
    assert.equal(model.status, 'not_started');
    assert.equal(model.recommendationReason, 'unblocks_future_topic');
    assert.match(model.recommendationExplanation, /helps unlock/);
    assert.equal(model.isRecommended, true);
    assert.equal(model.remainingDependencies, 0);
    assert.equal(model.navigation.next.id, 'm1_03_c');
    assert.ok(Array.isArray(model.unlockedDependents));
    const html = renderStudyContext(model);
    assert.ok(html.includes('Study context') && html.includes('Continue learning'));
    assert.match(html, /data-journey-reason="unblocks_future_topic"/);
  });
});

describe('live 486-topic repository', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });

  it('covers all 486 topics with a deterministic curriculum-head recommendation', () => {
    assert.equal(manifest.topics.length, 486);
    const model = Journey.buildJourneyModel(manifest, none);
    assert.equal(model.totalTopics, 486);
    assert.equal(model.isEmpty, true);
    assert.equal(`${model.recommended.courseCode}/${model.recommended.id}`, 'GAMAT301/m1_01_random_variables_pmf_cdf');
    assert.equal(model.recommendationReason, 'unblocks_future_topic');
    assert.ok(model.recommendationExplanation.length > 0);
    assert.deepEqual(model.overall, { total: 486, completed: 0, inProgress: 0, notStarted: 486, percent: 0 });
    // Deterministic across runs.
    assert.equal(
      JSON.stringify(Journey.buildJourneyModel(manifest, none).recommended),
      JSON.stringify(Journey.buildJourneyModel(manifest, none).recommended)
    );
  });

  it('models every topic journey with well-formed navigation and progress', () => {
    let checked = 0;
    for (const t of manifest.topics) {
      const journey = Journey.buildTopicJourney(manifest, none, t.courseCode, t.id);
      assert.ok(journey, `${t.courseCode}/${t.id} has a journey`);
      assert.equal(journey.title, t.title);
      assert.ok(journey.courseProgress.total > 0);
      assert.ok(journey.moduleProgress.total > 0);
      assert.ok(journey.nearbyModuleTopics.length > 0);
      checked += 1;
    }
    assert.equal(checked, 486);
    const all = {};
    for (const t of manifest.topics) all[`${t.courseCode}/${t.id}`] = 'completed';
    const done = Journey.buildJourneyModel(manifest, readerFrom(all));
    assert.equal(done.isComplete, true);
    assert.equal(done.recommended, null);
  });

  it('keeps dashboard, explorer, and study context consistent on the live graph', () => {
    const dashboard = Journey.buildDashboardModel(manifest, none, { getTimestamp: () => null });
    assert.equal(dashboard.recommended.id, 'm1_01_random_variables_pmf_cdf');
    assert.ok(dashboard.readyToLearn.length > 0);
    const explorer = Journey.buildExplorerTopicModel(manifest, none, 'GAMAT301', 'm1_01_random_variables_pmf_cdf');
    assert.equal(explorer.isRecommended, true);
    assert.equal(explorer.isReady, true);
    const study = buildStudyContextModel(manifest, none, 'PCCST501', 'm1_07_domain_name_system_dns');
    assert.equal(study.prereqs.length, 1);
    assert.equal(study.chain.length, 7);
    assert.equal(study.remainingDependencies, 6);
  });
});
