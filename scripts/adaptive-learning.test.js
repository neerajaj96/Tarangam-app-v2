/**
 * Dependency-free tests for the canonical Adaptive Learning Views
 * (node:test + node:assert only — no test framework). Covers the pure
 * presentation layer in assets/adaptive-learning.js (via
 * scripts/adaptive-learning.js) plus its Dashboard / Explorer / Topic Study
 * Context integrations: new learner, partially completed learner,
 * prerequisite-blocked topics, completed prerequisites, assessment-passed
 * topics, assessment-needs-review topics, review-due/overdue topics,
 * exam-relevant topics, mixed evidence, all-completed learner, repeated
 * identical inputs, and the full live repository (432 topics, 502
 * questions). Also proves the critical invariants: exactly one canonical
 * next-topic mechanism, no second engine, no ratings, no AI/ML.
 *
 * Run: npm test  (node --test scripts/adaptive-learning.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as Adaptive from './adaptive-learning.js';
import * as AssetsAdaptive from '../assets/adaptive-learning.js';
import * as Journey from './learning-journey.js';
import * as Exam from './exam-readiness.js';
import { buildDashboardAdaptiveModel } from '../assets/dashboard.js';
import { getExplorerVisibleTopics } from '../assets/explorer.js';
import { buildStudyContextModel, renderStudyContext } from '../assets/topic-study-context.js';
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
    prerequisites: [], examRelevance: 'high', tags: [], prerequisiteDepth: 0,
    ...overrides,
  };
  if (!overrides.filename) base.filename = `${base.id}.html`;
  return base;
}

// Alpha (beginner root, high) -> Beta (intermediate, medium) -> Delta
// (advanced, high); Gamma (beginner, low, needs Alpha); Epsilon (no exam
// relevance, no questions); Zeta (C2 beginner root, medium).
const fixture = {
  version: 1,
  topics: [
    entry({ id: 'm1_01_a', title: 'Alpha', sequence: 1, examRelevance: 'high', difficulty: 'beginner' }),
    entry({ id: 'm1_02_b', title: 'Beta', sequence: 2, prerequisites: ['m1_01_a'], prerequisiteDepth: 1, examRelevance: 'medium', difficulty: 'intermediate' }),
    entry({ id: 'm1_03_c', title: 'Gamma', sequence: 3, prerequisites: ['m1_01_a'], prerequisiteDepth: 1, examRelevance: 'low', difficulty: 'beginner' }),
    entry({ id: 'm1_04_d', title: 'Delta', sequence: 4, prerequisites: ['m1_02_b'], prerequisiteDepth: 2, examRelevance: 'high', difficulty: 'advanced' }),
    entry({ id: 'm1_05_e', title: 'Epsilon', sequence: 5, examRelevance: null, difficulty: 'beginner' }),
    entry({ id: 'm1_01_z', courseCode: 'C2', courseName: 'Course Two', title: 'Zeta', sequence: 1, examRelevance: 'medium', difficulty: 'beginner' }),
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
      id: 'q_b1', courseCode: 'C1', topicId: 'm1_02_b', type: 'short_answer',
      question: 'Name B in one word.', answer: 'Beta',
      explanation: 'It is Beta.', difficulty: 'intermediate', examRelevance: 'medium',
    },
  ],
};

const none = () => 'not_started';
const readerFrom = (map) => (course, id) => map[`${course}/${id}`];
const stampsFrom = (map) => (course, id) => map[`${course}/${id}`];
const ids = (entries) => entries.map((e) => `${e.courseCode}/${e.id}`);
const emptyStore = () => ({ version: 1, attempts: [] });

function failedStore() {
  return {
    version: 1,
    attempts: [
      {
        id: 'att-1', sessionId: 's1',
        scope: { type: 'topic', courseCode: 'C1', topicId: 'm1_02_b' },
        questionIds: ['q_b1'],
        topics: [{ courseCode: 'C1', id: 'm1_02_b' }],
        answers: { q_b1: 'wrong' },
        correct: 0, total: 1, percentage: 0, state: 'needs_review', submittedAt: NOW,
      },
    ],
  };
}

function passedStore() {
  return {
    version: 1,
    attempts: [
      {
        id: 'att-1', sessionId: 's1',
        scope: { type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' },
        questionIds: ['q_a1'],
        topics: [{ courseCode: 'C1', id: 'm1_01_a' }],
        answers: { q_a1: 'A' },
        correct: 1, total: 1, percentage: 100, state: 'passed', submittedAt: NOW,
      },
    ],
  };
}

describe('module identity and presentation-only contract', () => {
  it('shares one implementation and introduces no engine, ratings, or AI', () => {
    for (const name of [
      'getAdaptiveNext', 'getStrengthenList', 'getProgressionState',
      'getProgressionBreakdown', 'getCourseProgression', 'getModuleProgression',
      'getProgressionPath', 'getDifficultyProgression', 'getExamFocus',
      'getRevisionFocus', 'buildAdaptiveModel',
    ]) {
      assert.equal(Adaptive[name], AssetsAdaptive[name]);
    }
    assert.deepEqual(Adaptive.PROGRESSION_STATES, ['completed', 'available', 'blocked', 'future']);
    const source = fs.readFileSync('assets/adaptive-learning.js', 'utf-8');
    assert.ok(!/function\s+getRecommendedNextTopics|function\s+getNextRecommendedTopic/.test(source));
    assert.ok(!/mastery|weakness.?score|weakScore|performance score|ability score|predicted/i.test(source));
    assert.ok(!/openai|anthropic|\bLLM\b|semantic\s+(grad|similarity|scor)/i.test(source));
    assert.ok(!source.includes('setInterval'));
    assert.ok(!source.includes('localStorage'));
  });

  it('reuses every canonical layer by import', () => {
    const source = fs.readFileSync('assets/adaptive-learning.js', 'utf-8');
    for (const dep of [
      "from './topic-intelligence.js'", "from './learning-journey.js'",
      "from './exam-readiness.js'", "from './revision.js'",
      "from './weak-topic-analysis.js'", "from './learning-analytics.js'",
      "from './assessment.js'", "from './study-planner.js'",
    ]) {
      assert.ok(source.includes(dep), `missing ${dep}`);
    }
  });
});

describe('exactly one canonical next-topic mechanism', () => {
  it('delegates next to the canonical engine with identical results', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_03_c': 'in_progress' });
    const adaptive = Adaptive.getAdaptiveNext(fixture, getStatus);
    const canonical = Journey.getNextRecommendedTopic(fixture, getStatus);
    assert.equal(`${adaptive.topic.courseCode}/${adaptive.topic.id}`, `${canonical.courseCode}/${canonical.id}`);
    const journey = Journey.buildJourneyModel(fixture, getStatus);
    assert.equal(journey.recommended.id, adaptive.topic.id);
    assert.equal(journey.recommendationExplanation, adaptive.explanation);
    // No ordering logic of its own: same output, same reason vocabulary.
    assert.ok(['continue_in_progress', 'unblocks_future_topic', 'ready_curriculum_order', 'curriculum_fallback'].includes(adaptive.reason));
  });
});

describe('new learner', () => {
  it('starts at the curriculum head with roots available and the rest future', () => {
    const next = Adaptive.getAdaptiveNext(fixture, none);
    assert.equal(next.topic.id, 'm1_01_a');
    const breakdown = Adaptive.getProgressionBreakdown(fixture, none);
    // Roots (Alpha, Epsilon, Zeta) are available; Beta/Gamma/Delta wait on
    // untouched prerequisites and are future; nothing is underway.
    assert.deepEqual(breakdown.counts, { total: 6, completed: 0, available: 3, blocked: 0, future: 3 });
    assert.deepEqual(ids(breakdown.available), ['C1/m1_01_a', 'C1/m1_05_e', 'C2/m1_01_z']);
    assert.deepEqual(ids(breakdown.future), ['C1/m1_02_b', 'C1/m1_03_c', 'C1/m1_04_d']);
    const model = Adaptive.buildAdaptiveModel(fixture, none);
    assert.equal(model.next.topic.id, 'm1_01_a');
    assert.ok(model.difficulty.length > 0);
    assert.equal(model.exam.nextExamTopic.id, 'm1_01_a');
    assert.equal(model.revision.total, 0);
    assert.equal(model.planStatus, 'no_plan');
  });
});

describe('partially completed learner', () => {
  it('prefers continuing in-progress work and advances progression states', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'in_progress' });
    const next = Adaptive.getAdaptiveNext(fixture, getStatus);
    assert.equal(next.topic.id, 'm1_02_b');
    assert.equal(next.reason, 'continue_in_progress');
    const breakdown = Adaptive.getProgressionBreakdown(fixture, getStatus);
    assert.deepEqual(ids(breakdown.completed), ['C1/m1_01_a']);
    // Beta started but unfinished: its prereq is complete, so available.
    assert.ok(ids(breakdown.available).includes('C1/m1_02_b'));
    // Delta's prereq Beta is underway (in progress) -> blocked, not future.
    assert.equal(Adaptive.getProgressionState(fixture, getStatus, 'C1', 'm1_04_d'), 'blocked');
  });
});

describe('prerequisite-blocked topics', () => {
  it('distinguishes blocked (work underway) from future (untouched chain)', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    // Beta: prereq complete -> available. Delta: prereq Beta untouched -> future.
    assert.equal(Adaptive.getProgressionState(fixture, getStatus, 'C1', 'm1_02_b'), 'available');
    assert.equal(Adaptive.getProgressionState(fixture, getStatus, 'C1', 'm1_04_d'), 'future');
    const started = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'in_progress' });
    assert.equal(Adaptive.getProgressionState(fixture, started, 'C1', 'm1_04_d'), 'blocked');
    assert.equal(Adaptive.getProgressionState(fixture, none, 'C1', 'nope'), null);
  });

  it('shows the progression path with per-node states', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const path = Adaptive.getProgressionPath(fixture, getStatus, 'C1', 'm1_04_d');
    assert.equal(path.state, 'future');
    assert.deepEqual(path.path.map((s) => s.id), ['m1_01_a', 'm1_02_b', 'm1_04_d']);
    assert.deepEqual(path.path.map((s) => s.state), ['completed', 'available', 'future']);
    assert.equal(Adaptive.getProgressionPath(fixture, getStatus, 'C1', 'nope'), null);
  });

  it('partitions every topic into exactly one bucket per course and module', () => {
    const course = Adaptive.getCourseProgression(fixture, none, 'C1');
    assert.equal(course.total, 5);
    assert.equal(
      course.counts.completed + course.counts.available + course.counts.blocked + course.counts.future,
      5
    );
    const module = Adaptive.getModuleProgression(fixture, none, 'C1', 1);
    assert.equal(module.total, 5);
    assert.deepEqual(Adaptive.getCourseProgression(fixture, none, 'NOPE').counts.total, 0);
  });
});

describe('completed prerequisites', () => {
  it('marks dependents available once every direct prerequisite is complete', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed', 'C1/m1_03_c': 'completed' });
    assert.equal(Adaptive.getProgressionState(fixture, getStatus, 'C1', 'm1_04_d'), 'available');
    const breakdown = Adaptive.getProgressionBreakdown(fixture, getStatus);
    assert.ok(ids(breakdown.available).includes('C1/m1_04_d'));
  });
});

describe('assessment-passed topics', () => {
  it('carries no strengthen reason from a passed attempt', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const list = Adaptive.getStrengthenList(
      fixture, getStatus, stampsFrom({ 'C1/m1_01_a': NOW - DAY }), NOW,
      { bank, attempts: passedStore() }
    );
    assert.ok(!list.some((e) => e.id === 'm1_01_a' && e.reasons.includes('assessment_needs_review')));
  });
});

describe('assessment-needs-review topics', () => {
  it('strengthens with explicit preserved reasons', () => {
    const list = Adaptive.getStrengthenList(fixture, none, null, NOW, { bank, attempts: failedStore() });
    const beta = list.find((e) => e.id === 'm1_02_b');
    assert.ok(beta);
    assert.ok(beta.reasons.includes('assessment_needs_review'));
    assert.match(beta.explanation, /assessment needs review/);
    assert.ok(!('score' in beta));
  });
});

describe('review-due and review-overdue topics', () => {
  it('surfaces both through the revision focus with existing thresholds', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 30 * DAY, 'C1/m1_02_b': NOW - 9 * DAY });
    const focus = Adaptive.getRevisionFocus(fixture, getStatus, getTs, NOW, null);
    assert.equal(focus.dueDays, 7);
    assert.equal(focus.overdueDays, 14);
    assert.equal(focus.total, 2);
    assert.equal(focus.nextReviewTopic.id, 'm1_01_a');
    assert.deepEqual(focus.orderedTopics.map((e) => e.id), ['m1_01_a', 'm1_02_b']);
    // Assessment evidence joins without changing the schedule.
    const aware = Adaptive.getRevisionFocus(fixture, getStatus, getTs, NOW, { bank, attempts: failedStore() });
    assert.ok(aware.total >= 2);
    assert.equal(aware.nextReviewTopic.id, 'm1_01_a');
  });
});

describe('exam-relevant topics', () => {
  it('reuses weights and readiness math while ordering over the canonical list', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const focus = Adaptive.getExamFocus(fixture, getStatus);
    const readiness = Exam.buildExamReadiness(fixture, getStatus);
    assert.equal(focus.readinessPercent, readiness.readinessPercent);
    assert.equal(focus.weightedCompleted, readiness.weightedCompleted);
    assert.equal(focus.weightedTotal, readiness.weightedTotal);
    assert.equal(focus.nextExamTopic.id, 'm1_02_b');
    assert.ok(focus.orderedTopics.every((t) => t.weight > 0));
    // Canonical order filtered to exam-relevant: blockers Beta/Gamma first
    // (manifest order), then ready Zeta; Delta is not yet recommendable.
    assert.deepEqual(focus.orderedTopics.map((t) => t.id), ['m1_02_b', 'm1_03_c', 'm1_01_z']);
  });
});

describe('difficulty progression without ability math', () => {
  it('groups by metadata difficulty with counts and ordered remaining lists', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const rows = Adaptive.getDifficultyProgression(fixture, getStatus);
    assert.deepEqual(rows.map((r) => r.difficulty), ['beginner', 'intermediate', 'advanced']);
    const beginner = rows[0];
    assert.equal(beginner.total, 4);
    assert.equal(beginner.completed, 1);
    assert.equal(beginner.remaining, 3);
    assert.ok(beginner.remainingMinutes >= 0);
    assert.ok(rows.every((r) => !('ability' in r) && !('level' in r) && !('prediction' in r)));
  });
});

describe('mixed evidence', () => {
  it('combines every view deterministically in one model', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'in_progress' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 30 * DAY });
    const assessment = { bank, attempts: failedStore() };
    const model = Adaptive.buildAdaptiveModel(fixture, getStatus, { getTimestamp: getTs, now: NOW, assessment });
    assert.equal(model.next.topic.id, 'm1_02_b');
    assert.ok(model.strengthen.length > 0);
    assert.equal(model.progression.counts.total, 6);
    assert.ok(model.difficulty.length > 0);
    assert.ok(model.exam.readinessPercent >= 0);
    assert.ok(model.revision.total > 0);
    assert.ok(model.remainingMinutes === null || typeof model.remainingMinutes === 'number');
    assert.ok(model.assessmentCoverage !== null);
    assert.equal(model.assessmentCoverage.coveredCount, 2);
  });
});

describe('all-completed learner', () => {
  it('reports curriculum-complete next with everything completed', () => {
    const all = {};
    for (const t of fixture.topics) all[`${t.courseCode}/${t.id}`] = 'completed';
    const model = Adaptive.buildAdaptiveModel(fixture, readerFrom(all), { now: NOW });
    assert.equal(model.next.topic, null);
    assert.match(model.next.explanation, /Curriculum complete/);
    assert.equal(model.progression.counts.completed, 6);
    assert.deepEqual(model.progression.counts, { total: 6, completed: 6, available: 0, blocked: 0, future: 0 });
  });
});

describe('repeated identical inputs give identical outputs', () => {
  it('is deterministic across runs', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const opts = {
      getTimestamp: stampsFrom({ 'C1/m1_01_a': NOW - 9 * DAY }),
      now: NOW, assessment: { bank, attempts: failedStore() },
    };
    assert.equal(
      JSON.stringify(Adaptive.buildAdaptiveModel(fixture, getStatus, opts)),
      JSON.stringify(Adaptive.buildAdaptiveModel(fixture, getStatus, opts))
    );
  });
});

describe('Dashboard wiring', () => {
  it('exposes a pure adaptive model and renders a descriptive section', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const model = buildDashboardAdaptiveModel(fixture, getStatus, stampsFrom({ 'C1/m1_01_a': NOW - 30 * DAY }), NOW, { bank, attempts: failedStore() });
    assert.equal(model.next.topic.id, 'm1_02_b');
    assert.ok(model.strengthen.length > 0);
    assert.equal(model.progression.counts.total, 6);
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    assert.ok(js.includes('buildDashboardAdaptiveModel'));
    assert.ok(js.includes('renderAdaptive'));
    assert.ok(js.includes('db-adaptive'));
    assert.ok(!/mastery|weakness.?score|performance score|ability score/i.test(js));
    assert.ok(fs.readFileSync('dashboard.html', 'utf-8').includes('id="db-adaptive"'));
  });
});

describe('Explorer wiring', () => {
  it('shows progression chips and paths without new filters or engines', () => {
    const js = fs.readFileSync('assets/explorer.js', 'utf-8');
    assert.ok(js.includes('getProgressionState'));
    assert.ok(js.includes('getProgressionPath'));
    assert.ok(js.includes('Blocked'));
    assert.ok(!/function\s+getRecommendedNextTopics/.test(js));
    const blocked = Adaptive.getProgressionState(fixture, readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'in_progress' }), 'C1', 'm1_04_d');
    assert.equal(blocked, 'blocked');
    // Existing filters keep working unchanged (both prereq-free C1 topics ready).
    const visible = getExplorerVisibleTopics(fixture, none, { courseCode: 'C1', journey: 'ready' });
    assert.deepEqual(ids(visible), ['C1/m1_01_a', 'C1/m1_05_e']);
  });
});

describe('Study Context wiring', () => {
  it('renders progression state and path from recorded evidence', () => {
    const model = buildStudyContextModel(fixture, none, 'C1', 'm1_04_d');
    assert.equal(model.progression.state, 'future');
    assert.deepEqual(model.progression.steps.map((s) => s.id), ['m1_01_a', 'm1_02_b', 'm1_04_d']);
    assert.match(renderStudyContext(model), /Future topic/);
    assert.match(renderStudyContext(model), /ts-progression/);
    const done = buildStudyContextModel(fixture, readerFrom({ 'C1/m1_01_a': 'completed' }), 'C1', 'm1_01_a');
    assert.equal(done.progression.state, 'completed');
  });
});

describe('live 432-topic repository with 502 questions', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });
  const liveBank = JSON.parse(fs.readFileSync('data/assessments.json', 'utf-8'));

  it('partitions all 432 topics and builds every view deterministically', () => {
    assert.equal(manifest.topics.length, 432);
    assert.equal(liveBank.questions.length, 502);
    const breakdown = Adaptive.getProgressionBreakdown(manifest, none);
    assert.equal(
      breakdown.counts.completed + breakdown.counts.available + breakdown.counts.blocked + breakdown.counts.future,
      432
    );
    // Fresh learner: roots available, everything else future (nothing underway).
    assert.equal(breakdown.counts.completed, 0);
    assert.equal(breakdown.counts.blocked, 0);
    assert.ok(breakdown.counts.available > 0);
    assert.ok(breakdown.counts.future > 0);
    const difficulty = Adaptive.getDifficultyProgression(manifest, none);
    assert.equal(difficulty.reduce((a, r) => a + r.total, 0), 432);
    const model = Adaptive.buildAdaptiveModel(manifest, none, {
      now: NOW, assessment: { bank: liveBank, attempts: emptyStore() },
    });
    assert.ok(model.next.topic !== null);
    assert.ok(model.strengthen.length > 0);
    assert.equal(model.exam.totalExamTopics, 432);
    assert.equal(
      JSON.stringify(Adaptive.buildAdaptiveModel(manifest, none, { now: NOW })),
      JSON.stringify(Adaptive.buildAdaptiveModel(manifest, none, { now: NOW }))
    );
    // Adaptive next always equals the canonical recommendation (one mechanism).
    const journey = Journey.buildJourneyModel(manifest, none);
    assert.equal(`${model.next.topic.courseCode}/${model.next.topic.id}`, `${journey.recommended.courseCode}/${journey.recommended.id}`);
  });
});
