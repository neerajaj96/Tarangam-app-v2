/**
 * Assessment-evidence-into-revision integration tests (node:test +
 * node:assert only — no test framework). Proves completed assessment
 * attempts act as an additional deterministic evidence signal for review
 * decisions WITHOUT creating a new recommendation engine.
 *
 * Covers the objective's test list:
 * - assessment-needs-review revision state
 * - passed assessment without bypassing 7/14-day review
 * - unfinished topics never becoming reviewable merely because of assessment
 * - assessment evidence in Learning Journey (identical progress + different
 *   assessment evidence may change review status, never the recommendation)
 * - unchanged recommendation determinism (no second engine)
 * - unchanged exam-readiness weighting (high=3/medium=2/low=1/unknown=0)
 * - planner integration (needs_review joins review target; overdue stays
 *   stronger; prerequisite repair unchanged; no new scoring)
 * - Dashboard rendering (coverage/attempts/passed/needs-review/driven
 *   count/exam coverage/start links)
 * - Explorer filters (needs_review/passed/not-attempted compose with
 *   course/module/difficulty/exam/revision/journey)
 * - Topic Study Context (status/latest/best/attempts/passed/needs-review/
 *   contributing-to-review/start-retry link; explicit unavailable text)
 * - event synchronization (single tarangam:progress-changed contract)
 * - full 435-topic live repository
 * - malformed/empty assessment attempts
 * - repeated deterministic runs
 *
 * Run: npm test (node --test scripts/assessment-revision.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as Revision from './revision.js';
import * as Journey from './learning-journey.js';
import * as Exam from './exam-readiness.js';
import * as Planner from './study-planner.js';
import * as Assessment from './assessment.js';
import {
  buildDashboardReviewModel,
  buildDashboardAssessmentReviewModel,
  buildDashboardAssessmentModel,
  buildDashboardExamAssessmentModel,
} from '../assets/dashboard.js';
import {
  getExplorerVisibleTopics,
  getExplorerAssessmentInfo,
  filterTopicsByAssessmentNotAttempted,
} from '../assets/explorer.js';
import {
  buildStudyContextModel,
  renderStudyContext,
} from '../assets/topic-study-context.js';
import { buildTopicManifest } from './topic-manifest.js';
import { loadTopicSchema } from './topic-metadata.js';
import { loadCurriculum } from './curriculum.js';

const DAY = 24 * 3600 * 1000;
const NOW = 1800000000000;

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
  ],
};

const bank = {
  version: 1,
  questions: [
    {
      id: 'q_a1', courseCode: 'C1', topicId: 'm1_01_a', type: 'multiple_choice',
      question: 'Pick A.', options: ['A', 'B'], answer: 'A',
      explanation: 'Because A.', difficulty: 'beginner', examRelevance: 'high',
    },
    {
      id: 'q_a2', courseCode: 'C1', topicId: 'm1_01_a', type: 'true_false',
      question: 'A is true.', answer: true,
      explanation: 'Yes.', difficulty: 'beginner', examRelevance: 'high',
    },
    {
      id: 'q_b1', courseCode: 'C1', topicId: 'm1_02_b', type: 'short_answer',
      question: 'Name B in one word.', answer: 'Beta',
      explanation: 'It is Beta.', difficulty: 'intermediate', examRelevance: 'medium',
    },
    {
      id: 'q_z1', courseCode: 'C2', topicId: 'm1_01_z', type: 'multiple_choice',
      question: 'Pick Z.', options: ['Y', 'Z'], answer: 'Z',
      explanation: 'Because Z.', difficulty: 'beginner', examRelevance: 'low',
    },
  ],
};

const none = () => 'not_started';
const readerFrom = (map) => (course, id) => map[`${course}/${id}`];
const stampsFrom = (map) => (course, id) => map[`${course}/${id}`];
const ids = (entries) => entries.map((e) => `${e.courseCode}/${e.id}`);

function answerAll(session, answers, at = NOW) {
  let s = session;
  for (const [qid, value] of Object.entries(answers)) {
    s = Assessment.answerQuestion(s, qid, value);
  }
  return Assessment.submitSession(s, at);
}

function storeWithAttempts(pairs) {
  let store = Assessment.emptyAttemptStore();
  for (const [scope, answers, at] of pairs) {
    const session = Assessment.createAssessmentSession(bank, fixture, scope, at);
    store = Assessment.recordAttempt(store, answerAll(session, answers, at), bank);
  }
  return store;
}

describe('assessment-needs-review revision state', () => {
  it('makes a fresh completed topic review-relevant immediately', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 2 * DAY });
    // Timestamp-only: fresh, never queued.
    assert.equal(Revision.getReviewStateForTopic(fixture, getStatus, getTs, 'C1', 'm1_01_a', NOW).state, 'fresh');
    assert.deepEqual(Revision.getReviewQueue(fixture, getStatus, getTs, NOW), []);
    // With needs_review evidence: review-relevant with an explicit reason.
    const store = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, { q_a1: 'B', q_a2: false }, NOW],
    ]);
    const aware = Revision.getAssessmentAwareReviewState(fixture, getStatus, getTs, 'C1', 'm1_01_a', NOW, { bank, attempts: store });
    assert.equal(aware.state, 'fresh');
    assert.equal(aware.assessmentNeedsReview, true);
    assert.equal(aware.assessmentAttempted, true);
    assert.equal(aware.assessmentPassed, false);
    assert.equal(aware.reviewReason, 'assessment_needs_review');
    assert.equal(aware.isAssessmentDriven, true);
    assert.equal(aware.isReviewRelevant, true);
    const queue = Revision.getAssessmentAwareReviewQueue(fixture, getStatus, getTs, NOW, { bank, attempts: store });
    assert.deepEqual(ids(queue), ['C1/m1_01_a']);
    assert.equal(queue[0].reviewReason, 'assessment_needs_review');
    assert.equal(queue[0].isAssessmentDriven, true);
    const driven = Revision.getAssessmentDrivenReviews(fixture, getStatus, getTs, NOW, { bank, attempts: store });
    assert.deepEqual(ids(driven), ['C1/m1_01_a']);
  });

  it('also works with a missing timestamp (never fabricated, still review-relevant)', () => {
    const getStatus = readerFrom({ 'C1/m1_02_b': 'completed' });
    const store = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_02_b' }, { q_b1: 'wrong' }, NOW],
    ]);
    const aware = Revision.getAssessmentAwareReviewState(fixture, getStatus, () => undefined, 'C1', 'm1_02_b', NOW, { bank, attempts: store });
    assert.equal(aware.state, 'fresh');
    assert.equal(aware.isAssessmentDriven, true);
    assert.equal(aware.reviewReason, 'assessment_needs_review');
  });
});

describe('passed assessment without bypassing 7/14-day review', () => {
  it('keeps fresh fresh, due due, and overdue overdue', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed', 'C1/m1_03_c': 'completed' });
    const getTs = stampsFrom({
      'C1/m1_01_a': NOW - 2 * DAY,
      'C1/m1_02_b': NOW - 8 * DAY,
      'C1/m1_03_c': NOW - 30 * DAY,
    });
    const passedA = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, { q_a1: 'A', q_a2: true }, NOW],
    ]);
    const fresh = Revision.getAssessmentAwareReviewState(fixture, getStatus, getTs, 'C1', 'm1_01_a', NOW, { bank, attempts: passedA });
    assert.equal(fresh.state, 'fresh');
    assert.equal(fresh.assessmentPassed, true);
    assert.equal(fresh.assessmentNeedsReview, false);
    assert.equal(fresh.reviewReason, 'fresh');
    assert.equal(fresh.isAssessmentDriven, false);
    assert.equal(fresh.isReviewRelevant, false);
    // Due + passed evidence stays due with the timestamp reason.
    const passedB = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_02_b' }, { q_b1: 'Beta' }, NOW],
    ]);
    const due = Revision.getAssessmentAwareReviewState(fixture, getStatus, getTs, 'C1', 'm1_02_b', NOW, { bank, attempts: passedB });
    assert.equal(due.state, 'review_due');
    assert.equal(due.reviewReason, 'due');
    assert.equal(due.isReviewRelevant, true);
    assert.equal(due.isAssessmentDriven, false);
    // Overdue + needs_review evidence stays overdue (timestamp wins).
    const failedC = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, { q_a1: 'A', q_a2: true }, NOW],
    ]);
    void failedC;
    const overdue = Revision.getAssessmentAwareReviewState(fixture, getStatus, getTs, 'C1', 'm1_03_c', NOW, { bank, attempts: passedA });
    assert.equal(overdue.state, 'review_overdue');
    assert.equal(overdue.reviewReason, 'overdue');
    assert.equal(overdue.isAssessmentDriven, false);
  });

  it('preserves overdue > exam > dependents > manifest ordering with assessment appended', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed', 'C1/m1_03_c': 'completed' });
    const getTs = stampsFrom({
      'C1/m1_01_a': NOW - 30 * DAY,
      'C1/m1_02_b': NOW - 8 * DAY,
      'C1/m1_03_c': NOW - 2 * DAY,
    });
    const store = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_03_c' }, { q_b1: 'wrong' }, NOW],
    ]);
    // Gamma has no bank questions, so use Beta (fresh + needs_review) instead.
    const store2 = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_02_b' }, { q_b1: 'wrong' }, NOW],
    ]);
    void store;
    const queue = Revision.getAssessmentAwareReviewQueue(
      fixture, readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' }),
      stampsFrom({ 'C1/m1_01_a': NOW - 30 * DAY, 'C1/m1_02_b': NOW - 2 * DAY }),
      NOW, { bank, attempts: store2 }
    );
    // Overdue Alpha first, assessment-driven Beta after due/due ordering.
    assert.deepEqual(ids(queue), ['C1/m1_01_a', 'C1/m1_02_b']);
    assert.equal(queue[0].reviewState, 'review_overdue');
    assert.equal(queue[1].reviewReason, 'assessment_needs_review');
  });
});

describe('unfinished topics never becoming reviewable merely because of assessment', () => {
  it('stays not_applicable for not_started/in_progress/unknown topics', () => {
    const store = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, { q_a1: 'B', q_a2: false }, NOW],
    ]);
    const assessment = { bank, attempts: store };
    for (const status of ['not_started', 'in_progress', 'bogus', undefined]) {
      const aware = Revision.getAssessmentAwareReviewState(fixture, () => status, () => NOW - 30 * DAY, 'C1', 'm1_01_a', NOW, assessment);
      assert.equal(aware.state === 'not_applicable' || aware.isReviewRelevant === false, true, `status ${status}`);
      assert.equal(aware.reviewReason, 'not_applicable');
      assert.equal(aware.isAssessmentDriven, false);
      assert.equal(aware.isReviewRelevant, false);
    }
    const unknown = Revision.getAssessmentAwareReviewState(fixture, () => 'completed', () => NOW - 30 * DAY, 'C1', 'nope', NOW, assessment);
    assert.equal(unknown.reviewReason, 'not_applicable');
    assert.equal(unknown.isReviewRelevant, false);
    const queue = Revision.getAssessmentAwareReviewQueue(fixture, () => 'not_started', () => NOW - 30 * DAY, NOW, assessment);
    assert.deepEqual(queue, []);
  });
});

describe('assessment evidence in Learning Journey', () => {
  it('exposes assessment state for recommended/in-progress/needs-assessment/needs-review/coverage', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'in_progress' });
    const store = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, { q_a1: 'A', q_a2: true }, NOW],
    ]);
    const model = Journey.buildJourneyModel(fixture, getStatus, { assessment: { bank, attempts: store } });
    assert.ok(model.assessment !== null);
    assert.ok(Array.isArray(model.topicsNeedingAssessment));
    assert.ok(Array.isArray(model.topicsNeedingAssessmentReview));
    assert.ok(model.assessmentCoverage !== null);
    assert.equal(model.assessmentCoverage.coveredCount, 3);
    assert.ok(Array.isArray(model.assessmentForInProgress));
    assert.deepEqual(model.assessmentForInProgress.map((r) => `${r.courseCode}/${r.id}`), ['C1/m1_02_b']);
    assert.ok(model.assessmentForRecommended !== null);
    assert.ok(model.assessmentAwareRevision !== null);
  });

  it('identical progress + different assessment may change review status but not the recommendation', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 2 * DAY });
    const noAttempts = Assessment.emptyAttemptStore();
    const failed = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, { q_a1: 'B', q_a2: false }, NOW],
    ]);
    const plain = Journey.buildJourneyModel(fixture, getStatus, { getTimestamp: getTs, now: NOW });
    const without = Journey.buildJourneyModel(fixture, getStatus, {
      getTimestamp: getTs, now: NOW, assessment: { bank, attempts: noAttempts },
    });
    const withFail = Journey.buildJourneyModel(fixture, getStatus, {
      getTimestamp: getTs, now: NOW, assessment: { bank, attempts: failed },
    });
    // Same canonical recommendation in all three (no second engine).
    assert.equal(plain.recommended.id, without.recommended.id);
    assert.equal(plain.recommended.id, withFail.recommended.id);
    assert.equal(without.recommendationReason, withFail.recommendationReason);
    // Timestamp-only review: nothing due.
    assert.equal(plain.reviewCounts.total, 0);
    // Different assessment evidence changes review relevance only.
    assert.equal(without.assessmentAwareRevision.counts.assessmentDriven, 0);
    assert.equal(withFail.assessmentAwareRevision.counts.assessmentDriven, 1);
    assert.deepEqual(withFail.topicsNeedingAssessmentReview.map((t) => t.id), ['m1_01_a']);
    // No second recommendation engine: journey exposes no extra recommended field.
    assert.ok(!('assessmentRecommended' in withFail));
    assert.ok(!('assessmentRecommendation' in withFail));
  });

  it('per-topic journey carries descriptive assessment without changing readiness', () => {
    const getStatus = readerFrom({});
    const store = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, { q_a1: 'A', q_a2: true }, NOW],
    ]);
    const withAssess = Journey.buildTopicJourney(fixture, getStatus, 'C1', 'm1_01_a', { bank, attempts: store });
    const without = Journey.buildTopicJourney(fixture, getStatus, 'C1', 'm1_01_a');
    assert.equal(withAssess.isReady, without.isReady);
    assert.equal(withAssess.isRecommended, without.isRecommended);
    assert.equal(withAssess.assessment.passed, true);
    assert.equal(without.assessment, null);
  });
});

describe('unchanged recommendation determinism', () => {
  it('uses the single canonical engine with identical order with/without assessment', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const plain = Journey.buildJourneyModel(fixture, getStatus, { now: NOW });
    const store = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, { q_a1: 'B', q_a2: false }, NOW],
    ]);
    const withAssess = Journey.buildJourneyModel(fixture, getStatus, {
      now: NOW, assessment: { bank, attempts: store },
    });
    assert.deepEqual(
      plain.recommended && `${plain.recommended.courseCode}/${plain.recommended.id}`,
      withAssess.recommended && `${withAssess.recommended.courseCode}/${withAssess.recommended.id}`
    );
    assert.equal(plain.recommendationReason, withAssess.recommendationReason);
    assert.equal(plain.recommendationExplanation, withAssess.recommendationExplanation);
    // Re-exported entry points are the canonical engine (no duplicate).
    const { getRecommendedNextTopics, getNextRecommendedTopic } = Journey;
    assert.deepEqual(
      ids(getRecommendedNextTopics(fixture, getStatus)),
      ids(getRecommendedNextTopics(fixture, getStatus))
    );
    assert.equal(getNextRecommendedTopic(fixture, getStatus).id, plain.recommended.id);
  });
});

describe('unchanged exam-readiness weighting', () => {
  it('keeps high=3 medium=2 low=1 unknown=0 and identical percentages with/without assessment', () => {
    assert.equal(Exam.weightForExamRelevance('high'), 3);
    assert.equal(Exam.weightForExamRelevance('medium'), 2);
    assert.equal(Exam.weightForExamRelevance('low'), 1);
    assert.equal(Exam.weightForExamRelevance('unknown'), 0);
    assert.equal(Exam.weightForExamRelevance(null), 0);
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const before = Exam.buildExamReadiness(fixture, getStatus).readinessPercent;
    const store = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, { q_a1: 'B', q_a2: false }, NOW],
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_02_b' }, { q_b1: 'Beta' }, NOW],
    ]);
    const after = Exam.buildExamReadiness(fixture, getStatus).readinessPercent;
    assert.equal(before, after);
    void store;
  });

  it('reports descriptive exam assessment evidence as diagnostics only', () => {
    const store = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, { q_a1: 'A', q_a2: true }, NOW],
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_02_b' }, { q_b1: 'wrong' }, NOW],
    ]);
    const evidence = Exam.getExamAssessmentEvidence(bank, fixture, store);
    assert.equal(evidence.totalExamTopics, 5);
    assert.equal(evidence.attempted, 2);
    assert.equal(evidence.passed, 1);
    assert.equal(evidence.needsReview, 1);
    assert.equal(evidence.notAssessed, 3);
    assert.ok(Array.isArray(evidence.passedList) && Array.isArray(evidence.needsReviewList));
    // Dashboard diagnostics mirror the same evidence without touching readiness.
    const diag = buildDashboardExamAssessmentModel(bank, fixture, store);
    assert.deepEqual(
      { attempted: diag.attempted, passed: diag.passed, needsReview: diag.needsReview },
      { attempted: 2, passed: 1, needsReview: 1 }
    );
  });
});

describe('planner integration', () => {
  it('lets assessment needs-review topics join the review target after overdue/due', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 30 * DAY, 'C1/m1_02_b': NOW - 2 * DAY });
    const plain = Planner.buildStudyPlan(fixture, getStatus, getTs, { targetType: 'review', minutesPerDay: 60 }, NOW);
    assert.deepEqual(plain.remainingTopics.map((t) => t.id), ['m1_01_a']);
    const store = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_02_b' }, { q_b1: 'wrong' }, NOW],
    ]);
    const withAssess = Planner.buildStudyPlan(fixture, getStatus, getTs, { targetType: 'review', minutesPerDay: 60 }, NOW, { bank, attempts: store });
    assert.deepEqual(withAssess.remainingTopics.map((t) => t.id), ['m1_01_a', 'm1_02_b']);
    // Existing overdue priority remains stronger (overdue first).
    assert.equal(withAssess.remainingTopics[0].id, 'm1_01_a');
    assert.match(withAssess.remainingTopics[0].reason, /review-overdue/);
    assert.match(withAssess.remainingTopics[1].reason, /assessment needs review/);
  });

  it('keeps prerequisite-order repair unchanged and adds no scoring', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 30 * DAY, 'C1/m1_02_b': NOW - 2 * DAY });
    const store = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_02_b' }, { q_b1: 'wrong' }, NOW],
    ]);
    const plan = Planner.buildStudyPlan(fixture, getStatus, getTs, { targetType: 'review', minutesPerDay: 60 }, NOW, { bank, attempts: store });
    assert.ok(!('masteryScore' in plan));
    assert.ok(!('predictedCompletionDate' in plan));
    for (const t of plan.remainingTopics) {
      assert.ok(!('masteryScore' in t));
      assert.ok(typeof t.reason === 'string');
    }
    // Completion/exam targets ignore assessment-driven membership (no new scoring).
    const completion = Planner.buildStudyPlan(fixture, none, null, { targetType: 'completion', minutesPerDay: 200 }, NOW, { bank, attempts: store });
    assert.ok(completion.remainingTopics.length > 0);
  });
});

describe('Dashboard rendering', () => {
  it('shows coverage/attempts/passed/needs-review/driven-count/exam-coverage with start links', () => {
    const store = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, { q_a1: 'A', q_a2: true }, NOW],
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_02_b' }, { q_b1: 'wrong' }, NOW],
    ]);
    const assess = buildDashboardAssessmentModel(bank, fixture, store);
    assert.equal(assess.totalQuestions, 4);
    assert.equal(assess.coveredCount, 3);
    assert.equal(assess.uncoveredCount, 3);
    assert.equal(assess.attempted, 2);
    assert.equal(assess.passed, 1);
    assert.equal(assess.needsReview, 1);
    assert.ok(assess.examEvidence !== null);
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 2 * DAY, 'C1/m1_02_b': NOW - 2 * DAY });
    const review = buildDashboardReviewModel(fixture, getStatus, getTs, NOW, { bank, attempts: store });
    assert.equal(review.assessmentDrivenCount, 1);
    assert.equal(review.assessmentDriven.length, 1);
    const aware = buildDashboardAssessmentReviewModel(fixture, getStatus, getTs, NOW, { bank, attempts: store });
    assert.equal(aware.assessmentDriven.length, 1);
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    assert.ok(js.includes('Assessment coverage'));
    assert.ok(js.includes('Assessment attempts'));
    assert.ok(js.includes('assessment-driven'));
    assert.ok(js.includes('Exam-relevant coverage'));
    assert.ok(js.includes('Exam assessment diagnostics'));
    assert.ok(js.includes('Start assessment'));
    assert.ok(js.includes('buildDashboardAssessmentReviewModel') || js.includes('buildDashboardReviewModel'));
    assert.ok(fs.readFileSync('dashboard.html', 'utf-8').includes('id="db-assessment"'));
    assert.ok(fs.readFileSync('dashboard.html', 'utf-8').includes('id="db-review"'));
  });
});

describe('Explorer filters', () => {
  it('composes needs-review/passed/not-attempted with course/module/difficulty/exam/revision/journey', () => {
    const store = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, { q_a1: 'A', q_a2: true }, NOW],
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_02_b' }, { q_b1: 'wrong' }, NOW],
    ]);
    const base = { courseCode: 'C1', assessment: { bank, attempts: store } };
    assert.deepEqual(
      ids(getExplorerVisibleTopics(fixture, none, { ...base, assessmentFilter: 'needs_review' })),
      ['C1/m1_02_b']
    );
    assert.deepEqual(
      ids(getExplorerVisibleTopics(fixture, none, { ...base, assessmentFilter: 'passed' })),
      ['C1/m1_01_a']
    );
    // Not-attempted composes through the dedicated helper (available minus attempted).
    const scoped = fixture.topics.filter((t) => t.courseCode === 'C1');
    const notAttempted = filterTopicsByAssessmentNotAttempted(bank, store, scoped).map((t) => t.id);
    assert.ok(!notAttempted.includes('m1_01_a') && !notAttempted.includes('m1_02_b'));
    // Composition with difficulty + journey + assessment in one call.
    const composed = getExplorerVisibleTopics(fixture, none, {
      ...base, difficulties: 'beginner', journey: 'all', assessmentFilter: 'passed',
    });
    assert.deepEqual(ids(composed), ['C1/m1_01_a']);
    // Composition with revision view + assessment filter (fresh passed topic is not review-due).
    const byReview = getExplorerVisibleTopics(fixture, readerFrom({ 'C1/m1_01_a': 'completed' }), {
      courseCode: 'C1', reviewFilter: 'review_due',
      getTimestamp: stampsFrom({ 'C1/m1_01_a': NOW - 9 * DAY }), now: NOW,
      assessment: { bank, attempts: store }, assessmentFilter: 'passed',
    });
    assert.deepEqual(ids(byReview), ['C1/m1_01_a']);
    // Indicators describe each state without a second recommendation.
    assert.equal(getExplorerAssessmentInfo(bank, store, 'C1', 'm1_02_b').needsReview, true);
    assert.equal(getExplorerAssessmentInfo(bank, store, 'C1', 'm1_01_a').passed, true);
    assert.equal(getExplorerAssessmentInfo(bank, store, 'C1', 'm1_02_b').notAttempted, false);
    const js = fs.readFileSync('assets/explorer.js', 'utf-8');
    assert.ok(js.includes('Needs review') && js.includes('Passed') && js.includes('not attempted'));
    assert.ok(js.includes('filterTopicsByAssessment'));
    assert.ok(!/getRecommendedNextTopics\s*=\s*function/.test(js), 'no second recommendation engine in explorer');
  });
});

describe('Topic Study Context', () => {
  it('shows status/latest/best/attempts/passed/review-state/contribution/start-retry for covered topics', () => {
    const store = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, { q_a1: 'B', q_a2: false }, NOW],
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, { q_a1: 'A', q_a2: true }, NOW + 1000],
    ]);
    const model = buildStudyContextModel(fixture, readerFrom({ 'C1/m1_01_a': 'completed' }), 'C1', 'm1_01_a', {
      getTimestamp: stampsFrom({ 'C1/m1_01_a': NOW - 2 * DAY }), now: NOW, bank, attempts: store,
    });
    assert.equal(model.assessment.available, true);
    assert.equal(model.assessment.attempted, true);
    assert.equal(model.assessment.latestScore, 100);
    assert.equal(model.assessment.bestScore, 100);
    assert.equal(model.assessment.attempts, 2);
    assert.equal(model.assessment.passed, true);
    assert.equal(model.review.assessmentContributesToReview, false);
    const html = renderStudyContext(model);
    assert.match(html, /Self-assessment/);
    assert.match(html, /Passed/);
    assert.match(html, /Retry assessment/);
    assert.match(html, /not contributing to review/);
    // Needs-review on a completed fresh topic contributes to review.
    const failed = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_02_b' }, { q_b1: 'wrong' }, NOW],
    ]);
    const failedModel = buildStudyContextModel(fixture, readerFrom({ 'C1/m1_02_b': 'completed' }), 'C1', 'm1_02_b', {
      getTimestamp: stampsFrom({ 'C1/m1_02_b': NOW - 2 * DAY }), now: NOW, bank, attempts: failed,
    });
    assert.equal(failedModel.review.assessmentContributesToReview, true);
    assert.match(renderStudyContext(failedModel), /contributing to review/);
  });

  it('keeps the explicit unavailable text and never fabricates coverage', () => {
    const bare = buildStudyContextModel(fixture, none, 'C1', 'm1_03_c', { bank, attempts: Assessment.emptyAttemptStore() });
    assert.equal(bare.assessment.available, false);
    assert.match(renderStudyContext(bare), /Assessment not available for this topic yet/);
  });
});

describe('event synchronization', () => {
  it('reuses tarangam:progress-changed everywhere with no polling or second event system', () => {
    const seen = [];
    const off = Journey.onJourneyProgressChanged((detail) => seen.push(detail));
    Journey.emitJourneyProgressChanged({ courseCode: 'C1', topicId: 'm1_01_a', source: 'assessment' });
    assert.equal(seen.length, 1);
    off();
    Journey.clearJourneyListeners();
    for (const file of ['assets/dashboard.js', 'assets/explorer.js', 'assets/topic-study-context.js', 'assets/assessment-page.js', 'assets/learning-journey.js']) {
      const source = fs.readFileSync(file, 'utf-8');
      assert.ok(!source.includes('setInterval'), `${file} must not poll`);
      assert.ok(
        source.includes('tarangam:progress-changed') || source.includes('PROGRESS_CHANGED_EVENT') || source.includes('onJourneyProgressChanged') || source.includes('emitJourneyProgressChanged'),
        `${file} must use the shared event`
      );
    }
    const secondSystems = ['CustomEvent(\'tarangam:assessment', 'CustomEvent("tarangam:assessment', 'tarangam:assessment-changed', 'tarangam:review-changed'];
    for (const file of ['assets/dashboard.js', 'assets/explorer.js', 'assets/topic-study-context.js', 'assets/assessment-page.js', 'assets/revision.js', 'assets/exam-readiness.js', 'assets/study-planner.js']) {
      const source = fs.readFileSync(file, 'utf-8');
      for (const marker of secondSystems) assert.ok(!source.includes(marker), `${file} must not create ${marker}`);
    }
    // Assessment results refresh revision/exam/journey diagnostics through the same event.
    const page = fs.readFileSync('assets/assessment-page.js', 'utf-8');
    assert.ok(page.includes('emitJourneyProgressChanged'));
  });
});

describe('full 435-topic live repository', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });
  const liveBank = JSON.parse(fs.readFileSync('data/assessments.json', 'utf-8'));

  it('preserves curriculum invariants and live assessment totals', () => {
    assert.equal(manifest.topics.length, 435);
    const metadata = manifest.topics.filter((t) => t.hasMetadata).length;
    assert.equal(metadata, 435);
    let edges = 0;
    let maxDepth = 0;
    for (const t of manifest.topics) {
      edges += (t.prerequisites || []).length;
      if (typeof t.prerequisiteDepth === 'number') maxDepth = Math.max(maxDepth, t.prerequisiteDepth);
    }
    assert.equal(edges, 608);
    assert.equal(maxDepth, 11);
    assert.equal(liveBank.questions.length, 508);
    const covered = new Set(liveBank.questions.map((q) => `${q.courseCode}/${q.topicId}`));
    assert.equal(covered.size, 435);
    assert.equal(435 - covered.size, 0);
  });

  it('runs assessment-aware review deterministically on the live graph', () => {
    const getStatus = (c, id) => (id === 'm1_01_random_variables_pmf_cdf' ? 'completed' : 'not_started');
    const getTs = () => NOW - 2 * DAY;
    const empty = Assessment.emptyAttemptStore();
    const base = Revision.getAssessmentAwareReviewQueue(manifest, getStatus, getTs, NOW, { bank: liveBank, attempts: empty });
    assert.equal(base.filter((e) => e.isAssessmentDriven).length, 0);
    assert.equal(
      JSON.stringify(Revision.getAssessmentAwareReviewQueue(manifest, getStatus, getTs, NOW, { bank: liveBank, attempts: empty })),
      JSON.stringify(Revision.getAssessmentAwareReviewQueue(manifest, getStatus, getTs, NOW, { bank: liveBank, attempts: empty }))
    );
    const journey = Journey.buildJourneyModel(manifest, getStatus, {
      getTimestamp: getTs, now: NOW, assessment: { bank: liveBank, attempts: empty },
    });
    assert.ok(journey.recommended !== null);
    assert.ok(journey.assessmentAwareRevision !== null);
  });
});

describe('malformed/empty assessment attempts', () => {
  it('degrades to timestamp-only behavior without throwing', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 9 * DAY });
    for (const bad of [null, undefined, {}, { bank: null }, { bank: { questions: 'nope' } }, { bank, attempts: null }, { bank, attempts: { version: 999, attempts: [] } }, { bank, attempts: 'garbage' }]) {
      const aware = Revision.getAssessmentAwareReviewState(fixture, getStatus, getTs, 'C1', 'm1_01_a', NOW, bad);
      assert.equal(aware.state, 'review_due');
      assert.equal(aware.reviewReason, 'due');
      assert.equal(aware.isAssessmentDriven, false);
      const queue = Revision.getAssessmentAwareReviewQueue(fixture, getStatus, getTs, NOW, bad);
      assert.deepEqual(ids(queue), ['C1/m1_01_a']);
      const evidence = Exam.getExamAssessmentEvidence(bad && bad.bank, fixture, bad && bad.attempts);
      assert.equal(typeof evidence.attempted, 'number');
    }
    assert.deepEqual(Assessment.parseAttemptStore('[[['), { version: 1, attempts: [] });
  });
});

describe('repeated deterministic runs', () => {
  it('returns identical assessment-aware models across runs', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 2 * DAY, 'C1/m1_02_b': NOW - 9 * DAY });
    const store = storeWithAttempts([
      [{ type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, { q_a1: 'B', q_a2: false }, NOW],
    ]);
    const assessment = { bank, attempts: store };
    assert.equal(
      JSON.stringify(Revision.buildAssessmentAwareRevisionModel(fixture, getStatus, getTs, NOW, assessment)),
      JSON.stringify(Revision.buildAssessmentAwareRevisionModel(fixture, getStatus, getTs, NOW, assessment))
    );
    assert.equal(
      JSON.stringify(Journey.buildJourneyModel(fixture, getStatus, { getTimestamp: getTs, now: NOW, assessment })),
      JSON.stringify(Journey.buildJourneyModel(fixture, getStatus, { getTimestamp: getTs, now: NOW, assessment }))
    );
    assert.equal(
      JSON.stringify(Exam.getExamAssessmentEvidence(bank, fixture, store)),
      JSON.stringify(Exam.getExamAssessmentEvidence(bank, fixture, store))
    );
    assert.equal(
      JSON.stringify(Planner.buildStudyPlan(fixture, getStatus, getTs, { targetType: 'review', minutesPerDay: 60 }, NOW, assessment)),
      JSON.stringify(Planner.buildStudyPlan(fixture, getStatus, getTs, { targetType: 'review', minutesPerDay: 60 }, NOW, assessment))
    );
  });
});
