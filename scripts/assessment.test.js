/**
 * Dependency-free tests for the canonical Assessment & Knowledge
 * Verification Layer (node:test + node:assert only — no test framework).
 * Covers the pure model in assets/assessment.js (via scripts/assessment.js)
 * plus its bank validation, session engine, evaluation, persistence, and
 * Learning Journey / Dashboard / Explorer / Topic Study Context /
 * assessment-page integrations against the full 432-topic repository.
 * Current time is always injected — never the real clock.
 *
 * Run: npm test  (node --test scripts/assessment.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as Assessment from './assessment.js';
import * as AssetsAssessment from '../assets/assessment.js';
import { buildJourneyModel } from '../assets/learning-journey.js';
import { buildDashboardAssessmentModel } from '../assets/dashboard.js';
import {
  getExplorerVisibleTopics,
  getExplorerAssessmentInfo,
} from '../assets/explorer.js';
import { buildStudyContextModel, renderStudyContext } from '../assets/topic-study-context.js';
import { parseAssessmentHash } from '../assets/assessment-page.js';
import { buildTopicManifest } from './topic-manifest.js';
import { loadTopicSchema } from './topic-metadata.js';
import { loadCurriculum } from './curriculum.js';

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
    entry({ id: 'm2_01_c', title: 'Gamma', module: 2, moduleName: 'M2', sequence: 1, examRelevance: 'low' }),
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

function answerAll(session, answers, at = NOW) {
  let s = session;
  for (const [qid, value] of Object.entries(answers)) {
    s = Assessment.answerQuestion(s, qid, value);
  }
  return Assessment.submitSession(s, at);
}

describe('module identity and constants', () => {
  it('shares one implementation across entry points', () => {
    for (const name of [
      'validateAssessmentBank', 'getQuestionsForTopic', 'createAssessmentSession',
      'evaluateAnswer', 'scoreSession', 'submitSession', 'parseAttemptStore',
      'recordAttempt', 'getTopicAssessmentState', 'buildAssessmentSummary',
      'filterTopicsByAssessment',
    ]) {
      assert.equal(Assessment[name], AssetsAssessment[name]);
    }
    assert.equal(Assessment.PASS_THRESHOLD, 70);
    assert.equal(Assessment.ASSESSMENT_STORAGE_KEY, 'tarangam_assessments_v1');
    assert.deepEqual(Assessment.ASSESSMENT_FILTERS, ['all', 'available', 'attempted', 'passed', 'needs_review']);
  });
});

describe('schema validation', () => {
  it('accepts a valid bank against the manifest', () => {
    assert.deepEqual(Assessment.validateAssessmentBank(bank, fixture), []);
  });

  it('rejects a non-bank shape without throwing', () => {
    assert.ok(Assessment.validateAssessmentBank(null, fixture).length > 0);
    assert.ok(Assessment.validateAssessmentBank({ questions: 'nope' }, fixture).length > 0);
  });

  it('rejects invalid question types', () => {
    const bad = { version: 1, questions: [{ ...bank.questions[0], id: 'q_x', type: 'essay' }] };
    const errors = Assessment.validateAssessmentBank(bad, fixture);
    assert.ok(errors.some((e) => e.includes('invalid type')));
  });

  it('rejects duplicate IDs', () => {
    const dup = { version: 1, questions: [bank.questions[0], { ...bank.questions[1], id: 'q_a1' }] };
    const errors = Assessment.validateAssessmentBank(dup, fixture);
    assert.ok(errors.some((e) => e.includes('duplicate question id')));
  });

  it('rejects orphan topic references', () => {
    const orphan = { version: 1, questions: [{ ...bank.questions[0], id: 'q_o', topicId: 'm9_99_ghost' }] };
    const errors = Assessment.validateAssessmentBank(orphan, fixture);
    assert.ok(errors.some((e) => e.includes('orphan reference')));
  });

  it('rejects an MCQ answer outside its options', () => {
    const bad = { version: 1, questions: [{ ...bank.questions[0], id: 'q_m', answer: 'C' }] };
    const errors = Assessment.validateAssessmentBank(bad, fixture);
    assert.ok(errors.some((e) => e.includes('must belong to "options"')));
  });

  it('rejects missing required fields', () => {
    const { explanation, ...rest } = bank.questions[0];
    void explanation;
    const bad = { version: 1, questions: [{ ...rest, id: 'q_r' }] };
    const errors = Assessment.validateAssessmentBank(bad, fixture);
    assert.ok(errors.some((e) => e.includes('missing required field "explanation"')));
  });
});

describe('MCQ evaluation', () => {
  it('compares exact option identity', () => {
    const q = bank.questions[0];
    assert.equal(Assessment.evaluateAnswer(q, 'A').correct, true);
    assert.equal(Assessment.evaluateAnswer(q, 'B').correct, false);
    assert.equal(Assessment.evaluateAnswer(q, 'a').correct, false);
    assert.equal(Assessment.evaluateAnswer(q, ' A ').correct, false);
  });
});

describe('true/false evaluation', () => {
  it('compares normalized booleans', () => {
    const q = bank.questions[1];
    assert.equal(Assessment.evaluateAnswer(q, true).correct, true);
    assert.equal(Assessment.evaluateAnswer(q, 'TRUE').correct, true);
    assert.equal(Assessment.evaluateAnswer(q, ' true ').correct, true);
    assert.equal(Assessment.evaluateAnswer(q, false).correct, false);
    assert.equal(Assessment.evaluateAnswer(q, 'false').correct, false);
    assert.equal(Assessment.evaluateAnswer(q, 'maybe').correct, false);
  });
});

describe('short-answer normalization', () => {
  it('trims, lowercases, and collapses whitespace', () => {
    const q = bank.questions[2];
    assert.equal(Assessment.evaluateAnswer(q, 'Beta').correct, true);
    assert.equal(Assessment.evaluateAnswer(q, '  beta ').correct, true);
    assert.equal(Assessment.evaluateAnswer(q, 'BETA').correct, true);
    assert.equal(Assessment.evaluateAnswer(q, '  BeTa\t').correct, true);
    assert.equal(Assessment.evaluateAnswer(q, 'Alpha').correct, false);
    assert.equal(Assessment.evaluateAnswer(q, '').correct, false);
    assert.equal(Assessment.evaluateAnswer(q, '   ').correct, false);
  });
});

describe('correct/incorrect/unanswered scoring', () => {
  it('counts each bucket deterministically', () => {
    let s = Assessment.createAssessmentSession(bank, fixture, { type: 'course', courseCode: 'C1' }, NOW);
    s = Assessment.answerQuestion(s, 'q_a1', 'A');
    s = Assessment.answerQuestion(s, 'q_b1', 'wrong');
    const result = Assessment.scoreSession(Assessment.submitSession(s, NOW));
    assert.deepEqual(
      { total: result.total, answered: result.answered, correct: result.correct, incorrect: result.incorrect, unanswered: result.unanswered },
      { total: 3, answered: 2, correct: 1, incorrect: 1, unanswered: 1 }
    );
  });
});

describe('pass threshold', () => {
  it('passes at 70% and above', () => {
    // 10-question session: 7 correct -> exactly 70%.
    const big = {
      version: 1,
      questions: Array.from({ length: 10 }, (_, i) => ({
        id: `q_t${i}`, courseCode: 'C1', topicId: 'm1_01_a', type: 'true_false',
        question: `Statement ${i}.`, answer: true,
        explanation: 'E.', difficulty: 'beginner', examRelevance: 'high',
      })),
    };
    const answers = {};
    for (let i = 0; i < 7; i += 1) answers[`q_t${i}`] = true;
    const result = Assessment.scoreSession(answerAll(
      Assessment.createAssessmentSession(big, fixture, { type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, NOW),
      answers
    ));
    assert.equal(result.percentage, 70);
    assert.equal(result.state, 'passed');
  });
});

describe('needs-review threshold', () => {
  it('flags below 70% for review', () => {
    let s = Assessment.createAssessmentSession(bank, fixture, { type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, NOW);
    s = Assessment.answerQuestion(s, 'q_a1', 'B');
    s = Assessment.answerQuestion(s, 'q_a2', false);
    const result = Assessment.scoreSession(Assessment.submitSession(s, NOW));
    assert.equal(result.percentage, 0);
    assert.equal(result.state, 'needs_review');
  });
});

describe('deterministic session creation', () => {
  it('preserves bank order with fixed limits and stable ids', () => {
    const a = Assessment.createAssessmentSession(bank, fixture, { type: 'course', courseCode: 'C1', limit: 2 }, NOW);
    const b = Assessment.createAssessmentSession(bank, fixture, { type: 'course', courseCode: 'C1', limit: 2 }, NOW);
    assert.deepEqual(a.questionIds, ['q_a1', 'q_a2']);
    assert.deepEqual(b.questionIds, a.questionIds);
    assert.equal(a.id, b.id);
    assert.equal(a.currentIndex, 0);
    assert.equal(a.submitted, false);
  });
});

describe('course assessment', () => {
  it('selects a whole course deterministically', () => {
    const s = Assessment.createAssessmentSession(bank, fixture, { type: 'course', courseCode: 'C2' }, NOW);
    assert.deepEqual(s.questionIds, ['q_z1']);
    assert.deepEqual(Assessment.getSessionTopics(s), [{ courseCode: 'C2', id: 'm1_01_z' }]);
  });
});

describe('module assessment', () => {
  it('selects a whole module deterministically', () => {
    const s = Assessment.createAssessmentSession(bank, fixture, { type: 'module', courseCode: 'C1', module: 1 }, NOW);
    assert.deepEqual(s.questionIds, ['q_a1', 'q_a2', 'q_b1']);
  });
});

describe('topic assessment', () => {
  it('selects a single topic deterministically', () => {
    const s = Assessment.createAssessmentSession(bank, fixture, { type: 'topic', courseCode: 'C1', topicId: 'm1_02_b' }, NOW);
    assert.deepEqual(s.questionIds, ['q_b1']);
  });
});

describe('exam-relevant assessment', () => {
  it('selects exam-relevant questions across the bank', () => {
    const s = Assessment.createAssessmentSession(bank, fixture, { type: 'exam', limit: 10 }, NOW);
    assert.deepEqual(s.questionIds, ['q_a1', 'q_a2', 'q_b1', 'q_z1']);
  });
});

describe('malformed localStorage', () => {
  it('degrades to an empty store without throwing', () => {
    assert.deepEqual(Assessment.parseAttemptStore(null), { version: 1, attempts: [] });
    assert.deepEqual(Assessment.parseAttemptStore(''), { version: 1, attempts: [] });
    assert.deepEqual(Assessment.parseAttemptStore('[[['), { version: 1, attempts: [] });
    assert.deepEqual(Assessment.parseAttemptStore({ version: 999, attempts: [] }), { version: 1, attempts: [] });
    assert.deepEqual(Assessment.parseAttemptStore({ version: 1, attempts: 'nope' }), { version: 1, attempts: [] });
    assert.deepEqual(
      Assessment.parseAttemptStore({ version: 1, attempts: [{ id: 'x' }, null, 42] }),
      { version: 1, attempts: [] }
    );
  });
});

describe('persistence round-trip', () => {
  it('serializes and restores attempts with only identifiers and results', () => {
    let store = Assessment.emptyAttemptStore();
    const submitted = answerAll(
      Assessment.createAssessmentSession(bank, fixture, { type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, NOW),
      { q_a1: 'A', q_a2: true }
    );
    store = Assessment.recordAttempt(store, submitted, bank);
    const raw = Assessment.serializeAttemptStore(store);
    const restored = Assessment.parseAttemptStore(raw);
    assert.equal(restored.attempts.length, 1);
    assert.equal(restored.attempts[0].percentage, 100);
    assert.ok(!('progress' in restored.attempts[0]));
    // Unsubmitted sessions are never recorded.
    const draft = Assessment.answerQuestion(
      Assessment.createAssessmentSession(bank, fixture, { type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, NOW),
      'q_a1', 'A'
    );
    assert.equal(Assessment.recordAttempt(store, draft, bank).attempts.length, 1);
  });
});

describe('assessment state derivation', () => {
  it('derives attempted/latest/best/passed from attempts only', () => {
    const store = Assessment.emptyAttemptStore();
    const fresh = Assessment.getTopicAssessmentState(bank, store, 'C1', 'm1_01_a');
    assert.deepEqual(
      { available: fresh.available, attempted: fresh.attempted, state: fresh.state },
      { available: true, attempted: false, state: 'not_attempted' }
    );
    let s = store;
    s = Assessment.recordAttempt(s, answerAll(
      Assessment.createAssessmentSession(bank, fixture, { type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, 1000),
      { q_a1: 'B', q_a2: false }, 1000
    ), bank);
    s = Assessment.recordAttempt(s, answerAll(
      Assessment.createAssessmentSession(bank, fixture, { type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, 2000),
      { q_a1: 'A', q_a2: true }, 2000
    ), bank);
    const derived = Assessment.getTopicAssessmentState(bank, s, 'C1', 'm1_01_a');
    assert.deepEqual(
      { attempted: derived.attempted, attempts: derived.attempts, latestScore: derived.latestScore, bestScore: derived.bestScore, passed: derived.passed, needsReview: derived.needsReview, lastTimestamp: derived.lastTimestamp },
      { attempted: true, attempts: 2, latestScore: 100, bestScore: 100, passed: true, needsReview: false, lastTimestamp: 2000 }
    );
    const missing = Assessment.getTopicAssessmentState(bank, s, 'C1', 'nope');
    assert.equal(missing.state, 'not_attempted');
  });
});

describe('revision integration', () => {
  it('names needs-review topics without touching the timestamp schedule', () => {
    let store = Assessment.emptyAttemptStore();
    store = Assessment.recordAttempt(store, answerAll(
      Assessment.createAssessmentSession(bank, fixture, { type: 'topic', courseCode: 'C1', topicId: 'm1_02_b' }, NOW),
      { q_b1: 'wrong' }
    ), bank);
    const flagged = Assessment.getAssessmentReviewTopics(bank, fixture, store);
    assert.deepEqual(flagged.map((t) => `${t.courseCode}/${t.id}`), ['C1/m1_02_b']);
    assert.match(flagged[0].reason, /needs review/);
    assert.equal(Assessment.isAssessmentReviewDue(bank, store, 'C1', 'm1_02_b'), true);
    assert.equal(Assessment.isAssessmentReviewDue(bank, store, 'C1', 'm1_01_a'), false);
  });
});

describe('exam-readiness integration', () => {
  it('counts alongside the weighted readiness without changing it', () => {
    let store = Assessment.emptyAttemptStore();
    store = Assessment.recordAttempt(store, answerAll(
      Assessment.createAssessmentSession(bank, fixture, { type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, NOW),
      { q_a1: 'A', q_a2: true }
    ), bank);
    store = Assessment.recordAttempt(store, answerAll(
      Assessment.createAssessmentSession(bank, fixture, { type: 'topic', courseCode: 'C1', topicId: 'm1_02_b' }, NOW),
      { q_b1: 'wrong' }
    ), bank);
    const stats = Assessment.getExamAssessmentStats(bank, fixture, store);
    assert.deepEqual(
      { attempted: stats.attempted, passed: stats.passed, needsReview: stats.needsReview },
      { attempted: 2, passed: 1, needsReview: 1 }
    );
    // Covered exam-relevant topics: a, b, z (c has no bank question).
    assert.equal(stats.coveredExamTopics, 3);
    assert.equal(stats.totalExamTopics, 4);
  });
});

describe('learning journey integration', () => {
  it('exposes assessment status without changing the recommendation', () => {
    const plain = buildJourneyModel(fixture, none);
    const withBank = buildJourneyModel(fixture, none, { assessment: { bank, attempts: Assessment.emptyAttemptStore() } });
    assert.equal(plain.recommended.id, withBank.recommended.id);
    assert.equal(withBank.assessment.coveredCount, 3);
    assert.deepEqual(withBank.assessment.needsAssessment.map((t) => t.id), ['m1_01_a', 'm1_02_b', 'm1_01_z']);
    assert.equal(plain.assessment, null);
  });
});

describe('dashboard wiring', () => {
  it('exposes a pure model and renders the assessment section', () => {
    const summary = buildDashboardAssessmentModel(bank, fixture, Assessment.emptyAttemptStore());
    assert.equal(summary.totalQuestions, 4);
    assert.ok(fs.readFileSync('dashboard.html', 'utf-8').includes('id="db-assessment"'));
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    assert.ok(js.includes('renderAssessment'));
    assert.ok(js.includes('Start assessment'));
  });
});

describe('explorer wiring', () => {
  it('derives indicators and composes filters without duplicating logic', () => {
    let store = Assessment.emptyAttemptStore();
    store = Assessment.recordAttempt(store, answerAll(
      Assessment.createAssessmentSession(bank, fixture, { type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, NOW),
      { q_a1: 'A', q_a2: true }
    ), bank);
    const info = getExplorerAssessmentInfo(bank, store, 'C1', 'm1_01_a');
    assert.deepEqual({ available: info.available, passed: info.passed, attempted: info.attempted }, { available: true, passed: true, attempted: true });
    const missing = getExplorerAssessmentInfo(bank, store, 'C1', 'm2_01_c');
    assert.equal(missing.available, false);
    const scoped = fixture.topics.filter((t) => t.courseCode === 'C1');
    const attemptOpts = { assessment: { bank, attempts: store } };
    assert.deepEqual(
      getExplorerVisibleTopics(fixture, none, { ...attemptOpts, courseCode: 'C1', assessmentFilter: 'available' }).map((t) => t.id),
      ['m1_01_a', 'm1_02_b']
    );
    assert.deepEqual(
      getExplorerVisibleTopics(fixture, none, { ...attemptOpts, courseCode: 'C1', assessmentFilter: 'passed' }).map((t) => t.id),
      ['m1_01_a']
    );
    assert.deepEqual(
      getExplorerVisibleTopics(fixture, none, { ...attemptOpts, courseCode: 'C1', assessmentFilter: 'attempted' }).map((t) => t.id),
      ['m1_01_a']
    );
    assert.deepEqual(
      getExplorerVisibleTopics(fixture, none, { ...attemptOpts, courseCode: 'C1', assessmentFilter: 'needs_review' }).map((t) => t.id),
      []
    );
    assert.ok(fs.readFileSync('explorer.html', 'utf-8').includes('id="xp-assessment"'));
    const js = fs.readFileSync('assets/explorer.js', 'utf-8');
    assert.ok(js.includes('filterTopicsByAssessment'));
  });
});

describe('topic study context wiring', () => {
  it('reports availability, scores, and start links without fabricating coverage', () => {
    let store = Assessment.emptyAttemptStore();
    store = Assessment.recordAttempt(store, answerAll(
      Assessment.createAssessmentSession(bank, fixture, { type: 'topic', courseCode: 'C1', topicId: 'm1_01_a' }, NOW),
      { q_a1: 'A', q_a2: true }
    ), bank);
    const covered = buildStudyContextModel(fixture, none, 'C1', 'm1_01_a', { bank, attempts: store });
    assert.equal(covered.assessment.available, true);
    assert.equal(covered.assessment.passed, true);
    assert.match(renderStudyContext(covered), /Start assessment/);
    const bare = buildStudyContextModel(fixture, none, 'C1', 'm2_01_c', { bank, attempts: store });
    assert.equal(bare.assessment.available, false);
    assert.match(renderStudyContext(bare), /Assessment not available for this topic yet/);
  });
});

describe('assessment page wiring', () => {
  it('parses deep-link hashes and ships the static page', () => {
    assert.deepEqual(parseAssessmentHash('#scope=topic&course=C1&topic=m1_01_a'), {
      scope: 'topic', courseCode: 'C1', topicId: 'm1_01_a', module: 'all', limit: 5,
    });
    assert.deepEqual(parseAssessmentHash('#scope=exam&course=C2&limit=3'), {
      scope: 'exam', courseCode: 'C2', topicId: null, module: 'all', limit: 3,
    });
    assert.deepEqual(parseAssessmentHash(''), {
      scope: 'topic', courseCode: null, topicId: null, module: 'all', limit: 5,
    });
    assert.ok(fs.existsSync('assessment.html'));
    assert.ok(fs.readFileSync('assessment.html', 'utf-8').includes('assets/assessment-page.js'));
    assert.ok(fs.existsSync('assets/assessment-page.js'));
  });
});

describe('event synchronization', () => {
  it('reuses the shared progress-change event without polling', () => {
    const js = fs.readFileSync('assets/assessment-page.js', 'utf-8');
    assert.ok(js.includes('tarangam:progress-changed') || js.includes('PROGRESS_CHANGED_EVENT') || js.includes('emitJourneyProgressChanged'));
    assert.ok(!js.includes('setInterval'));
    const core = fs.readFileSync('assets/assessment.js', 'utf-8');
    assert.ok(!core.includes('setInterval'));
    assert.ok(!core.includes('addEventListener'));
  });
});

describe('live 432-topic repository', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });
  const liveBank = JSON.parse(fs.readFileSync('data/assessments.json', 'utf-8'));

  it('validates the shipped bank with deterministic live coverage', () => {
    assert.equal(manifest.topics.length, 432);
    assert.deepEqual(Assessment.validateAssessmentBank(liveBank, manifest), []);
    const coverage = Assessment.getAssessmentCoverage(liveBank, manifest);
    assert.equal(coverage.totalQuestions, 12);
    assert.equal(coverage.coveredCount, 6);
    assert.equal(coverage.totalTopics, 432);
    assert.equal(coverage.uncoveredTopics.length, 426);
    assert.equal(
      JSON.stringify(Assessment.getAssessmentCoverage(liveBank, manifest)),
      JSON.stringify(Assessment.getAssessmentCoverage(liveBank, manifest))
    );
  });

  it('runs sessions, attempts, and integrations on live topics', () => {
    const s = Assessment.createAssessmentSession(liveBank, manifest, {
      type: 'topic', courseCode: 'GAMAT301', topicId: 'm1_01_random_variables_pmf_cdf',
    }, NOW);
    assert.equal(s.questionIds.length, 2);
    let store = Assessment.emptyAttemptStore();
    let answered = s;
    answered = Assessment.answerQuestion(answered, s.questionIds[0], 'Probability mass function (pmf)');
    answered = Assessment.answerQuestion(answered, s.questionIds[1], true);
    store = Assessment.recordAttempt(store, Assessment.submitSession(answered, NOW), liveBank);
    const state = Assessment.getTopicAssessmentState(liveBank, store, 'GAMAT301', 'm1_01_random_variables_pmf_cdf');
    assert.equal(state.passed, true);
    const journey = buildJourneyModel(manifest, none, { assessment: { bank: liveBank, attempts: store } });
    assert.equal(journey.assessment.attempted, 1);
    assert.ok(journey.recommended !== null);
    const stats = Assessment.getExamAssessmentStats(liveBank, manifest, store);
    assert.equal(stats.attempted, 1);
  });
});
