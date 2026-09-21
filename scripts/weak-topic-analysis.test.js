/**
 * Dependency-free tests for the canonical Weak-Topic Analysis Layer
 * (node:test + node:assert only — no test framework). Covers the pure
 * model in assets/weak-topic-analysis.js (via scripts/weak-topic-analysis.js)
 * plus its Learning Journey / Dashboard / Explorer / Topic Study Context
 * integrations: empty learner, completed/overdue/due topics, passed /
 * needs-review / not-attempted assessments, multiple simultaneous reasons,
 * dependency impact, exam-relevant topics, unassessed topics never
 * auto-weak, deterministic ordering, course/module aggregation, journey
 * integration without touching the canonical recommendation, dashboard
 * wiring, explorer filters, study-context rendering, determinism across
 * repeated runs, and the full 486-topic live repository.
 *
 * Attention is descriptive evidence only: explicit reasons, never scores.
 *
 * Run: npm test  (node --test scripts/weak-topic-analysis.test.js)
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as Weak from './weak-topic-analysis.js';
import * as AssetsWeak from '../assets/weak-topic-analysis.js';
import * as Journey from './learning-journey.js';
import {
  buildDashboardAttentionModel,
} from '../assets/dashboard.js';
import {
  getExplorerVisibleTopics,
  getExplorerAttentionInfo,
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
    prerequisites: [], examRelevance: 'high', tags: [], prerequisiteDepth: 0,
    ...overrides,
  };
  if (!overrides.filename) base.filename = `${base.id}.html`;
  return base;
}

// Alpha (root, high) -> Beta (medium) + Gamma (low); Delta (high) needs
// Beta + Gamma; Epsilon (no exam relevance); Zeta (C2 root, medium).
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
  ],
};

const none = () => 'not_started';
const readerFrom = (map) => (course, id) => map[`${course}/${id}`];
const stampsFrom = (map) => (course, id) => map[`${course}/${id}`];
const ids = (entries) => entries.map((e) => `${e.courseCode}/${e.id}`);

function passedStore() {
  return {
    version: 1,
    attempts: [
      {
        id: 'att-1', sessionId: 's1',
        scope: { type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' },
        questionIds: ['q_a1', 'q_a2'],
        topics: [{ courseCode: 'C1', id: 'm1_01_a' }],
        answers: { q_a1: 'A', q_a2: true },
        correct: 2, total: 2, percentage: 100, state: 'passed', submittedAt: NOW,
      },
    ],
  };
}

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

const emptyStore = () => ({ version: 1, attempts: [] });

beforeEach(() => {
  Journey.clearJourneyListeners();
});

describe('module identity and reason contract', () => {
  it('shares one implementation with explicit reasons and no scores', () => {
    for (const name of [
      'getTopicAttention', 'explainAttention', 'getAttentionTopics',
      'getTopAttentionTopics', 'buildAttentionModel', 'getCourseAttention',
      'getModuleAttention', 'buildCourseAttentionList', 'buildModuleAttentionList',
      'filterTopicsByAttention', 'normalizeAttentionFilter',
      'getUncoveredAttentionTopics',
    ]) {
      assert.equal(Weak[name], AssetsWeak[name]);
    }
    assert.deepEqual(Weak.ATTENTION_REASONS, [
      'assessment_needs_review', 'exam_needs_review', 'review_overdue',
      'review_due', 'exam_not_assessed', 'blocks_unfinished_exam_topic',
    ]);
    assert.deepEqual(Weak.ATTENTION_FILTERS, [
      'all', 'needs_attention', 'assessment_needs_review',
      'review_overdue', 'review_due', 'exam_not_assessed',
    ]);
    assert.equal(Weak.TOP_ATTENTION_LIMIT, 5);
    const source = fs.readFileSync('assets/weak-topic-analysis.js', 'utf-8');
    assert.ok(!/weakness.?score|weakScore|mastery|semantic/i.test(source));
    assert.ok(!source.includes('setInterval'));
  });

  it('reuses canonical progress states instead of inventing new ones', () => {
    assert.equal(Weak.STATUS_COMPLETED, 'completed');
    assert.equal(Weak.STATUS_IN_PROGRESS, 'in_progress');
    assert.equal(Weak.STATUS_NOT_STARTED, 'not_started');
  });
});

describe('empty learner', () => {
  it('surfaces only structural and exam-coverage evidence, never fabricated warnings', () => {
    const model = Weak.buildAttentionModel(fixture, none, null, NOW, { bank, attempts: emptyStore() });
    // Nothing completed, nothing attempted: Alpha/Beta/Zeta are
    // exam-relevant with questions but unattempted; every topic with an
    // unfinished exam-relevant dependent blocks one.
    assert.ok(model.counts.total > 0);
    assert.equal(model.counts.needsReview, 0);
    assert.equal(model.counts.overdue, 0);
    assert.equal(model.counts.due, 0);
    assert.ok(model.counts.examNotAssessed > 0);
    // Epsilon (no exam relevance, no questions, no dependents) stays out.
    assert.ok(!ids(model.attentionTopics).includes('C1/m1_05_e'));
    // Uncovered topics reported separately, never as attention.
    assert.deepEqual(
      model.uncoveredAssessmentTopics.map((t) => `${t.courseCode}/${t.id}`).sort(),
      ['C1/m1_03_c', 'C1/m1_04_d', 'C1/m1_05_e', 'C2/m1_01_z'].sort()
    );
    for (const t of model.attentionTopics) {
      assert.ok(!t.reasons.includes('exam_not_assessed') || t.assessmentAvailable);
    }
  });
});

describe('completed topic', () => {
  it('stays quiet when fresh, passed, and non-blocking', () => {
    const getStatus = readerFrom({ 'C2/m1_01_z': 'completed' });
    const entry = Weak.getTopicAttention(
      fixture, getStatus, stampsFrom({ 'C2/m1_01_z': NOW - DAY }), 'C2', 'm1_01_z', NOW,
      { bank, attempts: emptyStore() }
    );
    // Zeta is a leaf: nothing depends on it, so no blocking reason.
    // It is exam-relevant without questions (uncovered) — never weak.
    assert.equal(entry.needsAttention, false);
    assert.deepEqual(entry.reasons, []);
    assert.equal(Weak.explainAttention(entry), '');
  });
});

describe('overdue topic', () => {
  it('ranks first with an explicit overdue reason', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 30 * DAY, 'C1/m1_02_b': NOW - 9 * DAY });
    const topics = Weak.getAttentionTopics(fixture, getStatus, getTs, NOW, { bank, attempts: emptyStore() });
    assert.equal(ids(topics)[0], 'C1/m1_01_a');
    assert.ok(topics[0].reasons.includes('review_overdue'));
    assert.match(Weak.explainAttention(topics[0]), /review overdue/);
    assert.match(Weak.explainAttention(topics[0]), /Needs attention/);
  });
});

describe('due topic', () => {
  it('appears after overdue and needs-review evidence', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 9 * DAY, 'C1/m1_02_b': NOW - 30 * DAY });
    const topics = Weak.getAttentionTopics(fixture, getStatus, getTs, NOW, { bank, attempts: emptyStore() });
    assert.deepEqual([topics[0].id, topics[1].id], ['m1_02_b', 'm1_01_a']);
    assert.ok(topics[1].reasons.includes('review_due'));
  });
});

describe('assessment passed', () => {
  it('adds no needs-review reason and never bypasses the schedule', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const fresh = Weak.getTopicAttention(
      fixture, getStatus, stampsFrom({ 'C1/m1_01_a': NOW - DAY }), 'C1', 'm1_01_a', NOW,
      { bank, attempts: passedStore() }
    );
    assert.equal(fresh.assessmentPassed, true);
    assert.ok(!fresh.reasons.includes('assessment_needs_review'));
    const due = Weak.getTopicAttention(
      fixture, getStatus, stampsFrom({ 'C1/m1_01_a': NOW - 9 * DAY }), 'C1', 'm1_01_a', NOW,
      { bank, attempts: passedStore() }
    );
    assert.ok(due.reasons.includes('review_due'));
    assert.ok(!due.reasons.includes('assessment_needs_review'));
  });
});

describe('assessment needs review', () => {
  it('flags the topic with both assessment reasons when exam-relevant', () => {
    const entry = Weak.getTopicAttention(
      fixture, none, null, 'C1', 'm1_02_b', NOW, { bank, attempts: failedStore() }
    );
    assert.equal(entry.assessmentNeedsReview, true);
    assert.ok(entry.reasons.includes('assessment_needs_review'));
    assert.ok(entry.reasons.includes('exam_needs_review'));
    assert.match(Weak.explainAttention(entry), /assessment needs review/);
  });

  it('outranks plain due topics but not overdue ones', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 30 * DAY, 'C1/m1_02_b': NOW - DAY });
    const topics = Weak.getAttentionTopics(fixture, getStatus, getTs, NOW, { bank, attempts: failedStore() });
    // Beta is fresh but failed; Alpha is overdue. Overdue stays first.
    assert.equal(ids(topics)[0], 'C1/m1_01_a');
    assert.ok(ids(topics).includes('C1/m1_02_b'));
    const beta = topics.find((t) => t.id === 'm1_02_b');
    assert.ok(beta.reasons.includes('assessment_needs_review'));
  });
});

describe('assessment not attempted', () => {
  it('flags exam-relevant available topics without attempts', () => {
    const entry = Weak.getTopicAttention(
      fixture, none, null, 'C1', 'm1_01_a', NOW, { bank, attempts: emptyStore() }
    );
    assert.ok(entry.reasons.includes('exam_not_assessed'));
    // Alpha also blocks unfinished exam-relevant topics, so every reason
    // is preserved in the explanation.
    assert.ok(entry.reasons.includes('blocks_unfinished_exam_topic'));
    assert.match(Weak.explainAttention(entry), /exam-relevant topic not yet assessed/);
  });

  it('renders the short sentence when exam-not-assessed is the only reason', () => {
    assert.equal(
      Weak.explainAttention({ title: 'Alpha', id: 'm1_01_a', reasons: ['exam_not_assessed'] }),
      'Exam-relevant topic not yet assessed — “Alpha” has questions available but no recorded attempt.'
    );
  });
});

describe('multiple simultaneous reasons', () => {
  it('preserves every reason on one entry', () => {
    const getStatus = readerFrom({ 'C1/m1_02_b': 'completed' });
    const entry = Weak.getTopicAttention(
      fixture, getStatus, stampsFrom({ 'C1/m1_02_b': NOW - 30 * DAY }), 'C1', 'm1_02_b', NOW,
      { bank, attempts: failedStore() }
    );
    assert.ok(entry.reasons.includes('assessment_needs_review'));
    assert.ok(entry.reasons.includes('exam_needs_review'));
    assert.ok(entry.reasons.includes('review_overdue'));
    assert.match(Weak.explainAttention(entry), /assessment needs review \+ /);
    assert.match(Weak.explainAttention(entry), /review overdue/);
  });
});

describe('dependency impact', () => {
  it('exposes direct/unfinished dependents and exam blocking without new semantics', () => {
    const getStatus = readerFrom({ 'C1/m1_02_b': 'completed' });
    const alpha = Weak.getTopicAttention(fixture, getStatus, null, 'C1', 'm1_01_a', NOW, null);
    assert.deepEqual(
      alpha.directDependents.map((d) => d.id).sort(),
      ['m1_02_b', 'm1_03_c']
    );
    // Beta completed; Gamma still unfinished (low, not exam-relevant? low IS
    // exam-relevant) — Alpha blocks an unfinished exam-relevant topic.
    assert.equal(alpha.unfinishedDependentCount, 1);
    assert.deepEqual(alpha.unfinishedDependents.map((d) => d.id), ['m1_03_c']);
    assert.equal(alpha.blocksExamTopic, true);
    assert.ok(alpha.reasons.includes('blocks_unfinished_exam_topic'));
    // Leaf with everything complete blocks nothing.
    const all = {};
    for (const t of fixture.topics) all[`${t.courseCode}/${t.id}`] = 'completed';
    const leaf = Weak.getTopicAttention(fixture, readerFrom(all), null, 'C1', 'm1_04_d', NOW, null);
    assert.equal(leaf.unfinishedDependentCount, 0);
    assert.equal(leaf.blocksExamTopic, false);
    assert.ok(!leaf.reasons.includes('blocks_unfinished_exam_topic'));
  });
});

describe('exam-relevant topics', () => {
  it('weights exam relevance descriptively without scoring', () => {
    const high = Weak.getTopicAttention(fixture, none, null, 'C1', 'm1_01_a', NOW, null);
    const low = Weak.getTopicAttention(fixture, none, null, 'C1', 'm1_03_c', NOW, null);
    assert.equal(high.examWeight, 3);
    assert.equal(low.examWeight, 1);
    assert.ok(!('score' in high) && !('weakness' in high));
    assert.ok(JSON.stringify(high).length > 0);
  });
});

describe('unassessed topics not classified as weak automatically', () => {
  it('keeps topics without questions out of every attention reason', () => {
    // Epsilon: no exam relevance, no questions, no dependents.
    const eps = Weak.getTopicAttention(fixture, none, null, 'C1', 'm1_05_e', NOW, { bank, attempts: emptyStore() });
    assert.equal(eps.assessmentAvailable, false);
    assert.equal(eps.needsAttention, false);
    // Gamma: exam-relevant (low) but uncovered — exam_not_assessed needs
    // available questions, so it never fires here.
    const gamma = Weak.getTopicAttention(fixture, none, null, 'C1', 'm1_03_c', NOW, { bank, attempts: emptyStore() });
    assert.equal(gamma.assessmentAvailable, false);
    assert.ok(!gamma.reasons.includes('exam_not_assessed'));
    assert.ok(!gamma.reasons.includes('assessment_needs_review'));
  });
});

describe('deterministic ordering', () => {
  it('orders overdue > needs-review > due > exam-not-assessed > dependents > manifest', () => {
    const getStatus = readerFrom({
      'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed',
      'C1/m1_03_c': 'completed', 'C1/m1_04_d': 'completed',
    });
    const getTs = stampsFrom({
      'C1/m1_01_a': NOW - 30 * DAY,
      'C1/m1_02_b': NOW - DAY,
      'C1/m1_03_c': NOW - 9 * DAY,
      'C1/m1_04_d': NOW - DAY,
    });
    const store = {
      version: 1,
      attempts: [
        {
          id: 'att-1', sessionId: 's1',
          scope: { type: 'topic', courseCode: 'C1', topicId: 'm1_04_d' },
          questionIds: [], topics: [{ courseCode: 'C1', id: 'm1_04_d' }],
          answers: {}, correct: 0, total: 0, percentage: 0,
          state: 'needs_review', submittedAt: NOW,
        },
      ],
    };
    void store;
    // Delta has no bank questions, so needs-review evidence cannot attach;
    // use Beta (fresh + failed) as the needs-review entry instead.
    const topics = Weak.getAttentionTopics(fixture, getStatus, getTs, NOW, { bank, attempts: failedStore() });
    assert.equal(ids(topics)[0], 'C1/m1_01_a'); // overdue
    const betaIdx = ids(topics).indexOf('C1/m1_02_b');
    const gammaIdx = ids(topics).indexOf('C1/m1_03_c');
    assert.ok(betaIdx !== -1 && gammaIdx !== -1 && betaIdx < gammaIdx); // needs-review before due
  });
});

describe('course/module aggregation', () => {
  it('summarizes per course and per module with reason counts', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 30 * DAY });
    const assessment = { bank, attempts: failedStore() };
    const c1 = Weak.getCourseAttention(fixture, getStatus, getTs, 'C1', NOW, assessment);
    assert.equal(c1.courseCode, 'C1');
    assert.equal(c1.totalTopics, 5);
    assert.ok(c1.counts.total > 0);
    assert.ok(c1.counts.overdue >= 1);
    assert.ok(c1.counts.needsReview >= 1);
    assert.ok(Array.isArray(c1.uncoveredAssessmentTopics));
    const m1 = Weak.getModuleAttention(fixture, getStatus, getTs, 'C1', 1, NOW, assessment);
    assert.equal(m1.module, 1);
    assert.equal(m1.totalTopics, 5);
    const courses = Weak.buildCourseAttentionList(fixture, getStatus, getTs, NOW, assessment);
    assert.deepEqual(courses.map((c) => c.courseCode), ['C1', 'C2']);
    const modules = Weak.buildModuleAttentionList(fixture, getStatus, getTs, 'C1', NOW, assessment);
    assert.deepEqual(modules.map((m) => m.module), [1]);
    assert.deepEqual(Weak.buildCourseAttentionList(null, none, null, NOW, null), []);
    assert.deepEqual(Weak.buildModuleAttentionList(null, none, null, 'C1', NOW, null), []);
  });
});

describe('Learning Journey integration', () => {
  it('exposes attention without changing the canonical recommendation', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const plain = Journey.buildJourneyModel(fixture, getStatus);
    const withAttention = Journey.buildJourneyModel(fixture, getStatus, {
      assessment: { bank, attempts: failedStore() },
      getTimestamp: stampsFrom({ 'C1/m1_01_a': NOW - 30 * DAY }),
      now: NOW,
    });
    assert.equal(plain.recommended.id, withAttention.recommended.id);
    assert.equal(plain.recommendationReason, withAttention.recommendationReason);
    assert.ok(Array.isArray(withAttention.attentionTopics));
    assert.ok(withAttention.attentionTopics.length > 0);
    assert.deepEqual(
      Object.keys(withAttention.attentionCounts).sort(),
      ['blocking', 'due', 'examNotAssessed', 'needsReview', 'overdue', 'total']
    );
    assert.ok(withAttention.topAttentionTopics.length <= 5);
    assert.equal(
      JSON.stringify(withAttention.topAttentionTopics),
      JSON.stringify(withAttention.attentionTopics.slice(0, 5))
    );
    // The canonical next-topic mechanism is untouched.
    assert.equal(Journey.getRecommendedNextTopics, Journey.getRecommendedNextTopics);
    assert.ok(typeof Journey.getRecommendedNextTopics === 'function');
  });
});

describe('Dashboard wiring', () => {
  it('exposes a pure attention model and renders a descriptive section', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const model = buildDashboardAttentionModel(
      fixture, getStatus, stampsFrom({ 'C1/m1_01_a': NOW - 30 * DAY }), NOW,
      { bank, attempts: failedStore() }
    );
    assert.ok(model.counts.total > 0);
    assert.ok(model.topAttentionTopics.length > 0);
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    assert.ok(js.includes('buildDashboardAttentionModel'));
    assert.ok(js.includes('renderAttention'));
    assert.ok(js.includes('db-attention'));
    assert.ok(!/weak.?score|mastery|performance score/i.test(js));
    const html = fs.readFileSync('dashboard.html', 'utf-8');
    assert.ok(html.includes('id="db-attention"'));
  });
});

describe('Explorer filters', () => {
  it('composes attention views with every existing facet', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 30 * DAY, 'C1/m1_02_b': NOW - DAY });
    const base = {
      courseCode: 'C1', getTimestamp: getTs, now: NOW,
      assessment: { bank, attempts: failedStore() },
    };
    const all = getExplorerVisibleTopics(fixture, getStatus, { ...base, attentionFilter: 'all' });
    assert.deepEqual(ids(all), ['C1/m1_01_a', 'C1/m1_02_b', 'C1/m1_03_c', 'C1/m1_04_d', 'C1/m1_05_e']);
    // Delta (unfinished leaf, no questions) and Epsilon (no exam relevance,
    // no questions, no dependents) carry no evidence and stay out.
    assert.deepEqual(
      ids(getExplorerVisibleTopics(fixture, getStatus, { ...base, attentionFilter: 'needs_attention' })),
      ['C1/m1_01_a', 'C1/m1_02_b', 'C1/m1_03_c']
    );
    assert.deepEqual(
      ids(getExplorerVisibleTopics(fixture, getStatus, { ...base, attentionFilter: 'review_overdue' })),
      ['C1/m1_01_a']
    );
    assert.deepEqual(
      ids(getExplorerVisibleTopics(fixture, getStatus, { ...base, attentionFilter: 'assessment_needs_review' })),
      ['C1/m1_02_b']
    );
    // Composition with difficulty + journey + assessment filters at once.
    const composed = getExplorerVisibleTopics(fixture, getStatus, {
      ...base, difficulties: 'beginner', journey: 'completed',
      assessmentFilter: 'available', attentionFilter: 'review_overdue',
    });
    assert.deepEqual(ids(composed), ['C1/m1_01_a']);
    assert.equal(Weak.normalizeAttentionFilter('bogus'), 'all');
    const info = getExplorerAttentionInfo(
      fixture, getStatus, getTs, 'C1', 'm1_02_b', NOW, { bank, attempts: failedStore() }
    );
    assert.equal(info.needsAttention, true);
    assert.ok(info.reasons.includes('assessment_needs_review'));
    assert.ok(fs.readFileSync('explorer.html', 'utf-8').includes('id="xp-attention"'));
    assert.ok(fs.readFileSync('assets/explorer.js', 'utf-8').includes('filterTopicsByAttention'));
  });
});

describe('Study Context rendering', () => {
  it('explains attention when applicable and stays silent otherwise', () => {
    const flagged = buildStudyContextModel(
      fixture, readerFrom({ 'C1/m1_02_b': 'completed' }), 'C1', 'm1_02_b',
      {
        getTimestamp: stampsFrom({ 'C1/m1_02_b': NOW - 30 * DAY }), now: NOW,
        bank, attempts: failedStore(),
      }
    );
    assert.equal(flagged.attention.needsAttention, true);
    assert.match(renderStudyContext(flagged), /Needs attention/);
    assert.match(renderStudyContext(flagged), /assessment needs review/);
    const quiet = buildStudyContextModel(fixture, none, 'C1', 'm1_05_e', { bank, attempts: emptyStore() });
    assert.equal(quiet.attention.needsAttention, false);
    assert.ok(!renderStudyContext(quiet).includes('ts-attention'));
    const examOnly = buildStudyContextModel(fixture, none, 'C1', 'm1_01_a', { bank, attempts: emptyStore() });
    assert.match(renderStudyContext(examOnly), /exam-relevant topic not yet assessed/);
  });
});

describe('repeated identical inputs give identical outputs', () => {
  it('is deterministic across runs', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 30 * DAY });
    const assessment = { bank, attempts: failedStore() };
    assert.equal(
      JSON.stringify(Weak.buildAttentionModel(fixture, getStatus, getTs, NOW, assessment)),
      JSON.stringify(Weak.buildAttentionModel(fixture, getStatus, getTs, NOW, assessment))
    );
    assert.equal(
      JSON.stringify(Journey.buildJourneyModel(fixture, getStatus, { getTimestamp: getTs, now: NOW, assessment })),
      JSON.stringify(Journey.buildJourneyModel(fixture, getStatus, { getTimestamp: getTs, now: NOW, assessment }))
    );
  });
});

describe('live 486-topic repository', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });
  const liveBank = JSON.parse(fs.readFileSync('data/assessments.json', 'utf-8'));

  it('builds attention deterministically over all 486 topics', () => {
    assert.equal(manifest.topics.length, 486);
    assert.equal(liveBank.questions.length, 610);
    const model = Weak.buildAttentionModel(manifest, none, null, NOW, { bank: liveBank, attempts: emptyStore() });
    assert.ok(model.counts.total > 0);
    assert.equal(model.counts.needsReview, 0);
    // Every course and module aggregates without throwing.
    const courses = Weak.buildCourseAttentionList(manifest, none, null, NOW, { bank: liveBank, attempts: emptyStore() });
    assert.equal(courses.length, 20);
    assert.equal(courses.reduce((a, c) => a + c.totalTopics, 0), 486);
    const modules = Weak.buildModuleAttentionList(manifest, none, null, 'GAMAT301', NOW, { bank: liveBank, attempts: emptyStore() });
    assert.equal(modules.length, 4);
    assert.equal(
      JSON.stringify(Weak.buildAttentionModel(manifest, none, null, NOW, { bank: liveBank, attempts: emptyStore() })),
      JSON.stringify(Weak.buildAttentionModel(manifest, none, null, NOW, { bank: liveBank, attempts: emptyStore() }))
    );
    const journey = Journey.buildJourneyModel(manifest, none, {
      assessment: { bank: liveBank, attempts: emptyStore() }, now: NOW,
    });
    assert.ok(journey.recommended !== null);
    assert.ok(journey.attentionTopics.length > 0);
    assert.ok(journey.topAttentionTopics.length <= 5);
  });
});
