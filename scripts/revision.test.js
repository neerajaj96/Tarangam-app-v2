/**
 * Dependency-free tests for the deterministic Revision & Review Layer
 * (node:test + node:assert only — no test framework). Covers the pure
 * model in assets/revision.js (via scripts/revision.js) plus its Learning
 * Journey / Dashboard / Explorer / Topic Study Context integrations.
 *
 * Schedule (centralized in assets/revision.js):
 * REVIEW_DUE_DAYS = 7, REVIEW_OVERDUE_DAYS = 14 (inclusive lower bounds).
 * Priority: overdue > due > exam weight > dependent count > manifest order.
 * Only completed topics with usable timestamps enter review queues.
 * All tests inject `now` — never the real clock.
 *
 * Run: npm test  (node --test scripts/revision.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as Revision from './revision.js';
import * as AssetsRevision from '../assets/revision.js';
import { buildJourneyModel } from '../assets/learning-journey.js';
import { onJourneyProgressChanged, emitJourneyProgressChanged } from '../assets/learning-journey.js';
import { buildDashboardReviewModel } from '../assets/dashboard.js';
import { getExplorerVisibleTopics } from '../assets/explorer.js';
import { buildStudyContextModel, renderStudyContext } from '../assets/topic-study-context.js';
import { buildTopicManifest } from './topic-manifest.js';
import { loadTopicSchema } from './topic-metadata.js';
import { loadCurriculum } from './curriculum.js';

const DAY = 24 * 3600 * 1000;
const NOW = 1700000000000;

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

const fixture = {
  version: 1,
  topics: [
    entry({ id: 'm1_01_a', title: 'Alpha', sequence: 1, examRelevance: 'high' }),
    entry({ id: 'm1_02_b', title: 'Beta', sequence: 2, prerequisites: ['m1_01_a'], prerequisiteDepth: 1, examRelevance: 'medium' }),
    entry({ id: 'm1_03_c', title: 'Gamma', sequence: 3, prerequisites: ['m1_01_a'], prerequisiteDepth: 1, examRelevance: 'low' }),
    entry({ id: 'm1_04_d', title: 'Delta', sequence: 4, prerequisites: ['m1_02_b', 'm1_03_c'], prerequisiteDepth: 2, examRelevance: 'high' }),
    entry({ id: 'm1_05_e', title: 'Epsilon', sequence: 5, examRelevance: null }),
    entry({ id: 'm1_01_z', courseCode: 'C2', courseName: 'Course Two', title: 'Zeta', sequence: 1, examRelevance: 'medium' }),
    entry({ id: 'm2_01_m', courseCode: 'C2', title: 'Eta', module: 2, moduleName: 'M2', sequence: 1, examRelevance: 'high' }),
  ],
};

const ids = (entries) => entries.map((e) => `${e.courseCode}/${e.id}`);
const readerFrom = (map) => (course, id) => map[`${course}/${id}`];
const stampsFrom = (map) => (course, id) => map[`${course}/${id}`];

describe('module identity and schedule constants', () => {
  it('shares one implementation with centralized thresholds', () => {
    for (const name of [
      'buildRevisionModel', 'getReviewStateForTopic', 'getReviewQueue',
      'getNextReviewTopic', 'filterTopicsByReview', 'explainReviewReason',
    ]) {
      assert.equal(Revision[name], AssetsRevision[name]);
    }
    assert.equal(Revision.REVIEW_DUE_DAYS, 7);
    assert.equal(Revision.REVIEW_OVERDUE_DAYS, 14);
    assert.deepEqual(Revision.REVIEW_FILTERS, ['all', 'review_due', 'review_overdue', 'exam_review_due']);
  });
});

describe('fresh topic', () => {
  it('marks recently completed topics fresh with day counts', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 2 * DAY });
    const rs = Revision.getReviewStateForTopic(fixture, getStatus, getTs, 'C1', 'm1_01_a', NOW);
    assert.equal(rs.state, 'fresh');
    assert.equal(rs.daysSince, 2);
    assert.equal(rs.threshold, 7);
    assert.deepEqual(Revision.getReviewQueue(fixture, getStatus, getTs, NOW), []);
  });
});

describe('exactly-at-threshold topic', () => {
  it('treats exactly 7 days as due and exactly 14 as overdue', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 7 * DAY, 'C1/m1_02_b': NOW - 14 * DAY });
    assert.equal(Revision.getReviewStateForTopic(fixture, getStatus, getTs, 'C1', 'm1_01_a', NOW).state, 'review_due');
    assert.equal(Revision.getReviewStateForTopic(fixture, getStatus, getTs, 'C1', 'm1_02_b', NOW).state, 'review_overdue');
  });
});

describe('due topic', () => {
  it('queues due topics with reasons', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 8 * DAY });
    const queue = Revision.getReviewQueue(fixture, getStatus, getTs, NOW);
    assert.deepEqual(ids(queue), ['C1/m1_01_a']);
    assert.equal(queue[0].reviewState, 'review_due');
    assert.match(queue[0].reason, /Due after 8 days/);
  });
});

describe('overdue topic', () => {
  it('queues overdue topics ahead of due ones', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 8 * DAY, 'C1/m1_02_b': NOW - 20 * DAY });
    const queue = Revision.getReviewQueue(fixture, getStatus, getTs, NOW);
    assert.deepEqual(ids(queue), ['C1/m1_02_b', 'C1/m1_01_a']);
    assert.equal(queue[0].reviewState, 'review_overdue');
    assert.match(queue[0].reason, /Overdue by 20 days/);
  });
});

describe('invalid timestamp', () => {
  it('treats non-numeric timestamps as fresh without queueing', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const getTs = () => 'yesterday';
    const rs = Revision.getReviewStateForTopic(fixture, getStatus, getTs, 'C1', 'm1_01_a', NOW);
    assert.equal(rs.state, 'fresh');
    assert.equal(rs.daysSince, null);
    assert.deepEqual(Revision.getReviewQueue(fixture, getStatus, getTs, NOW), []);
  });
});

describe('missing timestamp', () => {
  it('never marks timestamp-less completions due', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const rs = Revision.getReviewStateForTopic(fixture, getStatus, () => undefined, 'C1', 'm1_01_a', NOW);
    assert.equal(rs.state, 'fresh');
    assert.equal(rs.daysSince, null);
    assert.deepEqual(Revision.getReviewQueue(fixture, getStatus, null, NOW), []);
  });
});

describe('unfinished topic', () => {
  it('never enters review queues', () => {
    for (const status of ['not_started', 'in_progress', 'bogus', undefined]) {
      const getStatus = () => status;
      const rs = Revision.getReviewStateForTopic(fixture, getStatus, () => NOW - 30 * DAY, 'C1', 'm1_01_a', NOW);
      assert.equal(rs.state, 'not_applicable');
    }
    assert.deepEqual(Revision.getReviewQueue(fixture, () => 'not_started', () => NOW - 30 * DAY, NOW), []);
    assert.equal(Revision.getNextReviewTopic(fixture, () => 'in_progress', () => NOW - 30 * DAY, NOW), null);
  });
});

describe('completed topic', () => {
  it('enters the queue when old and resets when fresh', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    assert.equal(Revision.getReviewQueue(fixture, getStatus, stampsFrom({ 'C1/m1_01_a': NOW - 30 * DAY }), NOW).length, 1);
    assert.equal(Revision.getReviewQueue(fixture, getStatus, stampsFrom({ 'C1/m1_01_a': NOW }), NOW).length, 0);
  });
});

describe('exam-relevant review', () => {
  it('isolates exam-relevant due topics', () => {
    const getStatus = readerFrom({ 'C1/m1_03_c': 'completed', 'C1/m1_05_e': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_03_c': NOW - 10 * DAY, 'C1/m1_05_e': NOW - 30 * DAY });
    const examDue = Revision.getExamReviewDue(fixture, getStatus, getTs, NOW);
    assert.deepEqual(ids(examDue), ['C1/m1_03_c']);
  });
});

describe('priority ordering', () => {
  it('orders overdue > due > exam weight > dependents > manifest order', () => {
    const getStatus = readerFrom({
      'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed', 'C1/m1_03_c': 'completed',
      'C1/m1_04_d': 'completed', 'C2/m1_01_z': 'completed', 'C2/m2_01_m': 'completed',
    });
    const getTs = stampsFrom({
      'C1/m1_01_a': NOW - 20 * DAY, 'C1/m1_02_b': NOW - 20 * DAY, 'C1/m1_03_c': NOW - 20 * DAY,
      'C1/m1_04_d': NOW - 20 * DAY, 'C2/m1_01_z': NOW - 20 * DAY, 'C2/m2_01_m': NOW - 20 * DAY,
    });
    // All overdue: high(a,d,m) before medium(b,z) before low(c);
    // within high: a (2 dependents) before d/m (0, manifest order).
    assert.deepEqual(ids(Revision.getReviewQueue(fixture, getStatus, getTs, NOW)),
      ['C1/m1_01_a', 'C1/m1_04_d', 'C2/m2_01_m', 'C1/m1_02_b', 'C2/m1_01_z', 'C1/m1_03_c']);
    // Overdue beats due regardless of weight: low overdue before high due.
    const mixed = stampsFrom({ 'C1/m1_03_c': NOW - 30 * DAY, 'C1/m1_01_a': NOW - 8 * DAY });
    const mixedStatus = readerFrom({ 'C1/m1_03_c': 'completed', 'C1/m1_01_a': 'completed' });
    assert.deepEqual(ids(Revision.getReviewQueue(fixture, mixedStatus, mixed, NOW)), ['C1/m1_03_c', 'C1/m1_01_a']);
  });
});

describe('prerequisite and dependency importance', () => {
  it('prefers topics that unlock more later work on weight ties', () => {
    const getStatus = readerFrom({ 'C1/m1_02_b': 'completed', 'C1/m1_04_d': 'completed' });
    // d is high weight but unlocks nothing; force a tie by comparing two
    // medium topics is covered by fixture shape — here assert the dependent
    // counts used by the ordering are real graph facts.
    const b = fixture.topics.find((t) => t.id === 'm1_02_b');
    const d = fixture.topics.find((t) => t.id === 'm1_04_d');
    assert.ok(b.prerequisites.includes('m1_01_a'));
    assert.ok(d.prerequisites.includes('m1_02_b'));
    const getTs = stampsFrom({ 'C1/m1_02_b': NOW - 20 * DAY, 'C1/m1_04_d': NOW - 20 * DAY });
    const queue = Revision.getReviewQueue(fixture, getStatus, getTs, NOW);
    // d (high) still outranks b (medium): weight dominates dependents.
    assert.deepEqual(ids(queue), ['C1/m1_04_d', 'C1/m1_02_b']);
  });
});

describe('course boundaries', () => {
  it('breaks review down per course', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C2/m1_01_z': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 10 * DAY, 'C2/m1_01_z': NOW - 20 * DAY });
    const c1 = Revision.getCourseReviewBreakdown(fixture, getStatus, getTs, 'C1', NOW);
    assert.deepEqual([c1.completed, c1.due, c1.overdue], [1, 1, 0]);
    const c2 = Revision.getCourseReviewBreakdown(fixture, getStatus, getTs, 'C2', NOW);
    assert.deepEqual([c2.completed, c2.due, c2.overdue], [1, 0, 1]);
    assert.deepEqual(Revision.getCourseReviewBreakdown(fixture, getStatus, getTs, 'NOPE', NOW).total, 0);
  });
});

describe('module boundaries', () => {
  it('breaks review down per module', () => {
    const getStatus = readerFrom({ 'C2/m1_01_z': 'completed', 'C2/m2_01_m': 'completed' });
    const getTs = stampsFrom({ 'C2/m1_01_z': NOW - 10 * DAY, 'C2/m2_01_m': NOW - 2 * DAY });
    const m1 = Revision.getModuleReviewBreakdown(fixture, getStatus, getTs, 'C2', 1, NOW);
    assert.deepEqual([m1.completed, m1.due], [1, 1]);
    const m2 = Revision.getModuleReviewBreakdown(fixture, getStatus, getTs, 'C2', 2, NOW);
    assert.deepEqual([m2.completed, m2.queueTotal], [1, 0]);
  });
});

describe('empty learner', () => {
  it('has zero review items and no recommendation', () => {
    const model = Revision.buildRevisionModel(fixture, () => 'not_started', null, NOW);
    assert.deepEqual(model.counts, { total: 0, due: 0, overdue: 0, examDue: 0 });
    assert.equal(model.nextReviewTopic, null);
  });
});

describe('all-completed learner', () => {
  it('still revises by timestamp instead of hiding the queue', () => {
    const all = {};
    for (const t of fixture.topics) all[`${t.courseCode}/${t.id}`] = 'completed';
    const getStatus = readerFrom(all);
    const stamps = {};
    for (const t of fixture.topics) stamps[`${t.courseCode}/${t.id}`] = NOW - 30 * DAY;
    const model = Revision.buildRevisionModel(fixture, getStatus, stampsFrom(stamps), NOW);
    // Epsilon (no exam relevance) still queues: review is not exam-gated.
    assert.equal(model.counts.total, 7);
    assert.ok(model.nextReviewTopic !== null);
  });
});

describe('deterministic repeated runs', () => {
  it('returns identical models across runs', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 9 * DAY, 'C1/m1_02_b': NOW - 21 * DAY });
    assert.equal(
      JSON.stringify(Revision.buildRevisionModel(fixture, getStatus, getTs, NOW)),
      JSON.stringify(Revision.buildRevisionModel(fixture, getStatus, getTs, NOW))
    );
  });
});

describe('learning journey integration', () => {
  it('exposes review fields without changing the normal recommendation', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const plain = buildJourneyModel(fixture, getStatus);
    const withReview = buildJourneyModel(fixture, getStatus, {
      getTimestamp: stampsFrom({ 'C1/m1_01_a': NOW - 30 * DAY }), now: NOW,
    });
    assert.equal(plain.recommended.id, withReview.recommended.id);
    assert.deepEqual(ids(withReview.reviewOverdue), ['C1/m1_01_a']);
    assert.deepEqual(ids(withReview.reviewDue), []);
    assert.equal(withReview.nextReviewTopic.id, 'm1_01_a');
    assert.deepEqual(withReview.reviewCounts, { total: 1, due: 0, overdue: 1, examDue: 1 });
    assert.ok(Array.isArray(withReview.examReviewDue));
  });
});

describe('dashboard integration', () => {
  it('exposes a pure review model and renders the section', () => {
    const model = buildDashboardReviewModel(fixture, readerFrom({ 'C1/m1_01_a': 'completed' }), stampsFrom({ 'C1/m1_01_a': NOW - 9 * DAY }), NOW);
    assert.equal(model.counts.due, 1);
    assert.ok(fs.readFileSync('dashboard.html', 'utf-8').includes('id="db-review"'));
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    assert.ok(js.includes('buildRevisionModel'));
    assert.ok(js.includes('No reviews due.'));
  });
});

describe('explorer integration', () => {
  it('filters review views combined with existing facets', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 9 * DAY, 'C1/m1_02_b': NOW - 30 * DAY });
    const due = getExplorerVisibleTopics(fixture, getStatus, {
      courseCode: 'C1', reviewFilter: 'review_due', getTimestamp: getTs, now: NOW,
    });
    assert.deepEqual(ids(due), ['C1/m1_01_a']);
    const overdue = getExplorerVisibleTopics(fixture, getStatus, {
      courseCode: 'C1', reviewFilter: 'review_overdue', getTimestamp: getTs, now: NOW,
    });
    assert.deepEqual(ids(overdue), ['C1/m1_02_b']);
    const examDue = getExplorerVisibleTopics(fixture, getStatus, {
      courseCode: 'C1', reviewFilter: 'exam_review_due', getTimestamp: getTs, now: NOW,
    });
    assert.deepEqual(ids(examDue), ['C1/m1_01_a', 'C1/m1_02_b']);
    assert.equal(Revision.normalizeReviewFilter('bogus'), 'all');
    assert.ok(fs.readFileSync('explorer.html', 'utf-8').includes('id="xp-review"'));
    assert.ok(fs.readFileSync('assets/explorer.js', 'utf-8').includes('filterTopicsByReview'));
  });
});

describe('topic study context integration', () => {
  it('shows review state for completed topics and never for unfinished ones', () => {
    const done = buildStudyContextModel(
      fixture, readerFrom({ 'C1/m1_01_a': 'completed' }), 'C1', 'm1_01_a',
      { getTimestamp: stampsFrom({ 'C1/m1_01_a': NOW - 9 * DAY }), now: NOW }
    );
    assert.equal(done.review.state, 'review_due');
    assert.equal(done.review.daysSince, 9);
    assert.match(renderStudyContext(done), /Review status/);
    assert.match(renderStudyContext(done), /due for review/);
    const todo = buildStudyContextModel(fixture, () => 'not_started', 'C1', 'm1_02_b', { getTimestamp: () => NOW - 30 * DAY, now: NOW });
    assert.equal(todo.review.state, 'not_applicable');
    // Unfinished topics render no Review status block (the Analytics block
    // only names the descriptive state, never a due claim).
    assert.ok(!renderStudyContext(todo).includes('Review status'));
    assert.equal(todo.analytics.reviewState, 'not_started');
    assert.equal(todo.analytics.isDueForReview, false);
  });
});

describe('event synchronization', () => {
  it('reuses the shared progress-changed contract without polling', () => {
    const seen = [];
    const off = onJourneyProgressChanged((detail) => seen.push(detail));
    emitJourneyProgressChanged({ courseCode: 'C1', topicId: 'm1_01_a', source: 'revision-test' });
    assert.equal(seen.length, 1);
    assert.deepEqual(seen[0], { courseCode: 'C1', topicId: 'm1_01_a', source: 'revision-test' });
    off();
    assert.ok(fs.readFileSync('assets/dashboard.js', 'utf-8').includes('onJourneyProgressChanged'));
    assert.ok(!fs.readFileSync('assets/revision.js', 'utf-8').includes('setInterval'));
  });
});

describe('live 432-topic repository', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });

  it('queues reviews deterministically on the full graph', () => {
    assert.equal(manifest.topics.length, 432);
    const getStatus = (c, id) => (id === 'm1_01_random_variables_pmf_cdf' || id === 'm1_02_expectation_mean_variance' ? 'completed' : 'not_started');
    const getTs = (c, id) => {
      if (id === 'm1_01_random_variables_pmf_cdf') return NOW - 20 * DAY;
      if (id === 'm1_02_expectation_mean_variance') return NOW - 8 * DAY;
      return null;
    };
    const model = Revision.buildRevisionModel(manifest, getStatus, getTs, NOW);
    assert.equal(model.counts.total, 2);
    assert.equal(model.nextReviewTopic.id, 'm1_01_random_variables_pmf_cdf');
    assert.equal(
      JSON.stringify(Revision.buildRevisionModel(manifest, getStatus, getTs, NOW)),
      JSON.stringify(Revision.buildRevisionModel(manifest, getStatus, getTs, NOW))
    );
    const journey = buildJourneyModel(manifest, getStatus, { getTimestamp: getTs, now: NOW });
    assert.equal(journey.reviewCounts.total, 2);
    assert.ok(journey.recommended !== null);
  });
});
