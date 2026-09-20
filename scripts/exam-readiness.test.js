/**
 * Dependency-free tests for the deterministic Exam Readiness Layer
 * (node:test + node:assert only — no test framework). Covers the pure
 * model in assets/exam-readiness.js (via scripts/exam-readiness.js) plus
 * its Learning Journey / Dashboard / Explorer / Topic Study Context
 * integrations: weighting correctness, empty/partial/completed learners,
 * high/medium/low relevance, course and module boundaries, prerequisite
 * gaps, in-progress and next exam topics, deterministic ordering and
 * repeated-run stability, invalid metadata/status handling, all-completed
 * state, surface integrations, and the full 432-topic repository.
 *
 * Weighting (documented in assets/exam-readiness.js):
 * high -> 3, medium -> 2, low -> 1, unknown -> 0 (excluded).
 * readinessPercent = round(100 * weightedCompleted / weightedTotal).
 *
 * Run: npm test  (node --test scripts/exam-readiness.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as Exam from './exam-readiness.js';
import * as AssetsExam from '../assets/exam-readiness.js';
import { buildJourneyModel } from '../assets/learning-journey.js';
import { buildDashboardExamModel } from '../assets/dashboard.js';
import { getExplorerVisibleTopics } from '../assets/explorer.js';
import { buildStudyContextModel, renderStudyContext } from '../assets/topic-study-context.js';
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

const ids = (topics) => topics.map((t) => `${t.courseCode}/${t.id}`);
const readerFrom = (map) => (course, id) => map[`${course}/${id}`];
const none = () => 'not_started';

describe('module identity and weighting contract', () => {
  it('shares one implementation across entry points with documented weights', () => {
    for (const name of [
      'buildExamReadiness', 'getCourseExamReadiness', 'getModuleExamReadiness',
      'buildCourseExamReadinessList', 'buildModuleExamReadinessList',
      'getNextExamTopic', 'getExamGaps', 'explainExamContribution',
      'buildTopicExamModel', 'filterTopicsByExam',
    ]) {
      assert.equal(Exam[name], AssetsExam[name]);
    }
    assert.deepEqual(Exam.EXAM_WEIGHTS, { high: 3, medium: 2, low: 1 });
  });

  it('weights high/medium/low deterministically and excludes unknown', () => {
    assert.equal(Exam.weightForExamRelevance('high'), 3);
    assert.equal(Exam.weightForExamRelevance('medium'), 2);
    assert.equal(Exam.weightForExamRelevance('low'), 1);
    assert.equal(Exam.weightForExamRelevance('bogus'), 0);
    assert.equal(Exam.weightForExamRelevance(null), 0);
    // weighted readiness: (3)/(3+2+1+3+2+3) = 3/14 -> 21%
    const reader = readerFrom({ 'C1/m1_01_a': 'completed' });
    const model = Exam.buildExamReadiness(fixture, reader);
    assert.equal(model.weightedTotal, 14);
    assert.equal(model.weightedCompleted, 3);
    assert.equal(model.readinessPercent, 21);
  });
});

describe('empty learner', () => {
  it('reports 0% with the first deterministic exam target', () => {
    const model = Exam.buildExamReadiness(fixture, none);
    assert.equal(model.readinessPercent, 0);
    assert.equal(model.percent, 0);
    assert.equal(model.totalExamTopics, 6);
    assert.equal(model.completedExamTopics, 0);
    assert.equal(model.isEmpty, true);
    assert.equal(model.isComplete, false);
    assert.equal(model.nextExamTopic.id, 'm1_01_a');
  });
});

describe('partially completed learner', () => {
  it('counts weighted completion and remaining sets', () => {
    const reader = readerFrom({ 'C1/m1_01_a': 'completed', 'C2/m1_01_z': 'completed' });
    const model = Exam.buildExamReadiness(fixture, reader);
    // completed weights 3 + 2 = 5 of 14 -> 36%
    assert.equal(model.weightedCompleted, 5);
    assert.equal(model.readinessPercent, 36);
    assert.equal(model.completedExamTopics, 2);
    assert.equal(model.remainingExamTopics, 4);
    assert.deepEqual(ids(model.remainingList), ['C1/m1_02_b', 'C1/m1_03_c', 'C1/m1_04_d', 'C2/m2_01_m']);
    // non-exam topic never counted
    assert.ok(!ids(model.remainingList).includes('C1/m1_05_e'));
  });
});

describe('completed learner', () => {
  it('reports 100% without locking', () => {
    const all = {};
    for (const t of fixture.topics) {
      if (t.examRelevance) all[`${t.courseCode}/${t.id}`] = 'completed';
    }
    const model = Exam.buildExamReadiness(fixture, readerFrom(all));
    assert.equal(model.readinessPercent, 100);
    assert.equal(model.percent, 100);
    assert.equal(model.isComplete, true);
    assert.equal(model.nextExamTopic, null);
    assert.deepEqual(model.examGaps, []);
  });
});

describe('high/medium/low relevance', () => {
  it('breaks down each level with weighted math', () => {
    const reader = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_03_c': 'completed' });
    const bd = Exam.getRelevanceBreakdown(fixture, reader);
    assert.deepEqual([bd.high.total, bd.high.completed, bd.high.weightedTotal, bd.high.weightedCompleted], [3, 1, 9, 3]);
    assert.deepEqual([bd.medium.total, bd.medium.completed], [2, 0]);
    assert.deepEqual([bd.low.total, bd.low.completed, bd.low.weightedCompleted], [1, 1, 1]);
  });
});

describe('course boundaries', () => {
  it('scores per-course readiness on the same manifest', () => {
    const reader = readerFrom({ 'C1/m1_01_a': 'completed' });
    const c1 = Exam.getCourseExamReadiness(fixture, reader, 'C1');
    // C1 exam topics: high,medium,low,high (weights 3+2+1+3=9); completed 3 -> 33%
    assert.equal(c1.total, 4);
    assert.equal(c1.completed, 1);
    assert.equal(c1.readinessPercent, 33);
    const c2 = Exam.getCourseExamReadiness(fixture, reader, 'C2');
    assert.equal(c2.total, 2);
    assert.equal(c2.completed, 0);
    assert.equal(Exam.getCourseExamReadiness(fixture, reader, 'NOPE').total, 0);
    const list = Exam.buildCourseExamReadinessList(fixture, reader);
    assert.deepEqual(list.map((r) => r.courseCode), ['C1', 'C2']);
  });
});

describe('module boundaries', () => {
  it('scores per-module readiness deterministically', () => {
    const reader = readerFrom({ 'C2/m1_01_z': 'completed' });
    const m1 = Exam.getModuleExamReadiness(fixture, reader, 'C2', 1);
    assert.equal(m1.total, 1);
    assert.equal(m1.completed, 1);
    assert.equal(m1.readinessPercent, 100);
    const m2 = Exam.getModuleExamReadiness(fixture, reader, 'C2', 2);
    assert.equal(m2.total, 1);
    assert.equal(m2.completed, 0);
    const list = Exam.buildModuleExamReadinessList(fixture, reader, 'C2');
    assert.deepEqual(list.map((r) => r.module), [1, 2]);
    assert.deepEqual(Exam.buildModuleExamReadinessList(fixture, reader, 'NOPE'), []);
  });
});

describe('prerequisite gaps', () => {
  it('lists unfinished exam-relevant direct prerequisites of remaining exam topics', () => {
    const gaps = Exam.getExamGaps(fixture, none);
    // Remaining exam topics need a (high) and b,c (medium/low) for d (high).
    assert.deepEqual(ids(gaps), ['C1/m1_01_a', 'C1/m1_02_b', 'C1/m1_03_c']);
    const after = Exam.getExamGaps(fixture, readerFrom({ 'C1/m1_01_a': 'completed' }));
    assert.deepEqual(ids(after), ['C1/m1_02_b', 'C1/m1_03_c']);
    // Non-exam prerequisites never appear as gaps.
    assert.ok(!ids(after).includes('C1/m1_05_e'));
  });
});

describe('in-progress exam topic', () => {
  it('tracks in-progress and ready exam subsets', () => {
    const reader = readerFrom({ 'C1/m1_02_b': 'in_progress' });
    assert.deepEqual(ids(Exam.getInProgressExamTopics(fixture, reader)), ['C1/m1_02_b']);
    // Ready exam topics with nothing completed: roots a (high), z (medium), m (high).
    assert.deepEqual(ids(Exam.getReadyExamTopics(fixture, none)), ['C1/m1_01_a', 'C2/m1_01_z', 'C2/m2_01_m']);
  });
});

describe('next exam topic', () => {
  it('follows canonical recommendation order filtered to exam topics', () => {
    assert.equal(Exam.getNextExamTopic(fixture, none).id, 'm1_01_a');
    const reader = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'in_progress' });
    // In-progress Beta is head of canonical order and exam-relevant.
    assert.equal(Exam.getNextExamTopic(fixture, reader).id, 'm1_02_b');
    const done = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed', 'C1/m1_03_c': 'completed', 'C1/m1_04_d': 'completed', 'C2/m1_01_z': 'completed', 'C2/m2_01_m': 'completed' });
    assert.equal(Exam.getNextExamTopic(fixture, done), null);
  });
});

describe('deterministic ordering', () => {
  it('is stable across repeated runs', () => {
    const reader = readerFrom({ 'C1/m1_01_a': 'completed' });
    assert.equal(
      JSON.stringify(Exam.buildExamReadiness(fixture, reader)),
      JSON.stringify(Exam.buildExamReadiness(fixture, reader))
    );
    assert.equal(
      JSON.stringify(Exam.getExamGaps(fixture, reader)),
      JSON.stringify(Exam.getExamGaps(fixture, reader))
    );
  });
});

describe('invalid metadata and statuses', () => {
  it('never throws and treats bogus input as unfinished', () => {
    assert.deepEqual(Exam.buildExamReadiness(null, none).totalExamTopics, 0);
    assert.equal(Exam.buildExamReadiness(null, none).readinessPercent, 0);
    assert.equal(Exam.getNextExamTopic(null, none), null);
    assert.equal(Exam.buildTopicExamModel(fixture, none, 'C1', 'nope'), null);
    assert.deepEqual(Exam.filterTopicsByExam(fixture, none, null, 'exam_remaining'), []);
    assert.equal(Exam.normalizeExamFilter('bogus'), 'all');
    const bogus = () => 'bogus';
    const model = Exam.buildExamReadiness(fixture, bogus);
    assert.equal(model.completedExamTopics, 0);
    assert.equal(model.nextExamTopic.id, 'm1_01_a');
    const explained = Exam.explainExamContribution(fixture, bogus, 'C1', 'm1_01_a');
    assert.match(explained.message, /High exam relevance/);
  });
});

describe('all-completed state', () => {
  it('states full coverage without hiding anything', () => {
    const all = {};
    for (const t of fixture.topics) {
      if (t.examRelevance) all[`${t.courseCode}/${t.id}`] = 'completed';
    }
    const model = Exam.buildExamReadiness(fixture, readerFrom(all));
    assert.equal(model.isComplete, true);
    assert.equal(model.remainingExamTopics, 0);
    assert.equal(model.readinessPercent, 100);
  });
});

describe('dashboard integration', () => {
  it('exposes a pure dashboard exam model and renders the section', () => {
    const model = buildDashboardExamModel(fixture, none);
    assert.equal(model.totalExamTopics, 6);
    assert.equal(model.nextExamTopic.id, 'm1_01_a');
    const html = fs.readFileSync('dashboard.html', 'utf-8');
    assert.ok(html.includes('id="db-exam"'));
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    assert.ok(js.includes('buildExamReadiness'));
    assert.ok(js.includes('db-exam'));
  });
});

describe('explorer integration', () => {
  it('filters exam views without duplicating logic', () => {
    const reader = readerFrom({ 'C1/m1_01_a': 'completed' });
    const scoped = fixture.topics.filter((t) => t.courseCode === 'C1');
    assert.deepEqual(ids(Exam.filterTopicsByExam(fixture, reader, scoped, 'all')), ids(scoped));
    assert.deepEqual(ids(Exam.filterTopicsByExam(fixture, reader, scoped, 'exam_relevant')), ['C1/m1_01_a', 'C1/m1_02_b', 'C1/m1_03_c', 'C1/m1_04_d']);
    assert.deepEqual(ids(Exam.filterTopicsByExam(fixture, reader, scoped, 'exam_completed')), ['C1/m1_01_a']);
    assert.deepEqual(ids(Exam.filterTopicsByExam(fixture, reader, scoped, 'exam_remaining')), ['C1/m1_02_b', 'C1/m1_03_c', 'C1/m1_04_d']);
    const visible = getExplorerVisibleTopics(fixture, reader, { courseCode: 'C1', examView: 'exam_remaining' });
    assert.deepEqual(ids(visible), ['C1/m1_02_b', 'C1/m1_03_c', 'C1/m1_04_d']);
    const html = fs.readFileSync('explorer.html', 'utf-8');
    assert.ok(html.includes('id="xp-examview"'));
    assert.ok(fs.readFileSync('assets/explorer.js', 'utf-8').includes('filterTopicsByExam'));
  });
});

describe('topic study context integration', () => {
  it('shows relevance, contribution, and remaining exam prerequisites', () => {
    const remaining = Exam.buildTopicExamModel(fixture, none, 'C1', 'm1_04_d');
    assert.equal(remaining.examRelevance, 'high');
    assert.equal(remaining.contributes, false);
    assert.equal(remaining.remainingExamPrereqCount, 2);
    assert.match(remaining.explanation, /High exam relevance/);
    assert.match(remaining.explanation, /not a guarantee/);
    const done = Exam.buildTopicExamModel(fixture, readerFrom({ 'C1/m1_04_d': 'completed' }), 'C1', 'm1_04_d');
    assert.equal(done.contributes, true);
    assert.match(done.explanation, /counted in readiness/);
    const model = buildStudyContextModel(fixture, none, 'C1', 'm1_04_d');
    assert.equal(model.exam.examRelevance, 'high');
    const html = renderStudyContext(model);
    assert.match(html, /Exam readiness/);
    assert.match(html, /not a guarantee/);
  });
});

describe('learning journey integration', () => {
  it('exposes exam state without changing the normal recommendation', () => {
    const reader = readerFrom({ 'C1/m1_01_a': 'completed' });
    const journey = buildJourneyModel(fixture, reader);
    assert.equal(journey.recommended.id, 'm1_02_b');
    assert.equal(journey.nextExamTopic.id, 'm1_02_b');
    assert.deepEqual(ids(journey.examGaps), ['C1/m1_02_b', 'C1/m1_03_c']);
    assert.deepEqual(journey.examRelevantInProgress, []);
    assert.equal(journey.examReadiness.readinessPercent, 21);
    const busy = buildJourneyModel(fixture, readerFrom({ 'C1/m1_02_b': 'in_progress' }));
    assert.deepEqual(ids(busy.examRelevantInProgress), ['C1/m1_02_b']);
    // Normal recommendation unchanged by exam fields.
    assert.equal(busy.recommended.id, 'm1_02_b');
  });
});

describe('live 432-topic repository', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });

  it('scores the full curriculum deterministically', () => {
    assert.equal(manifest.topics.length, 432);
    const model = Exam.buildExamReadiness(manifest, none);
    assert.equal(model.totalExamTopics, 432);
    assert.deepEqual([model.breakdown.high.total, model.breakdown.medium.total, model.breakdown.low.total], [253, 179, 0]);
    assert.equal(model.weightedTotal, 253 * 3 + 179 * 2);
    assert.equal(model.readinessPercent, 0);
    assert.equal(model.isEmpty, true);
    assert.equal(`${model.nextExamTopic.courseCode}/${model.nextExamTopic.id}`, 'GAMAT301/m1_01_random_variables_pmf_cdf');
    assert.equal(
      JSON.stringify(Exam.buildExamReadiness(manifest, none)),
      JSON.stringify(Exam.buildExamReadiness(manifest, none))
    );
  });

  it('keeps journey, dashboard, explorer, and context consistent live', () => {
    const journey = buildJourneyModel(manifest, none);
    assert.equal(journey.examReadiness.totalExamTopics, 432);
    assert.equal(journey.nextExamTopic.id, 'm1_01_random_variables_pmf_cdf');
    const dashboard = buildDashboardExamModel(manifest, none);
    assert.equal(dashboard.readinessPercent, 0);
    const visible = getExplorerVisibleTopics(manifest, none, { courseCode: 'GAMAT301', examView: 'exam_remaining' });
    assert.equal(visible.length, 24);
    const study = buildStudyContextModel(manifest, none, 'GAMAT301', 'm1_01_random_variables_pmf_cdf');
    assert.equal(study.exam.examRelevance, 'high');
    const all = {};
    for (const t of manifest.topics) all[`${t.courseCode}/${t.id}`] = 'completed';
    const done = Exam.buildExamReadiness(manifest, readerFrom(all));
    assert.equal(done.readinessPercent, 100);
    assert.equal(done.isComplete, true);
  });
});
