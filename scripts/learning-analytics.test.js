/**
 * Dependency-free tests for the canonical Deterministic Learning Analytics
 * Layer (node:test + node:assert only — no test framework). Covers the pure
 * model in assets/learning-analytics.js (via scripts/learning-analytics.js)
 * plus its Learning Journey / Dashboard / Explorer / Topic Study Context
 * integrations. Descriptive analytics only: no prediction, no mastery
 * scores, no gamification. All timestamps/current time are injected —
 * never the real clock.
 *
 * Run: npm test  (node --test scripts/learning-analytics.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as Analytics from './learning-analytics.js';
import * as AssetsAnalytics from '../assets/learning-analytics.js';
import { buildJourneyModel } from '../assets/learning-journey.js';
import { buildDashboardAnalyticsModel } from '../assets/dashboard.js';
import { getExplorerCourseAnalytics, getExplorerModuleAnalytics } from '../assets/explorer.js';
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
    difficulty: 'beginner', estimatedMinutes: 10, concepts: [], learningObjectives: ['Do X'],
    prerequisites: [], examRelevance: 'high', tags: [], prerequisiteDepth: 0,
    ...overrides,
  };
  if (!overrides.filename) base.filename = `${base.id}.html`;
  return base;
}

// C1: a(high,10) -> b(medium,20,needs a) -> d(high,40,needs b); c(low,30 standalone, module 2)
// C2: z(medium,15); C1 unknown-minutes topic u (null minutes).
const fixture = {
  version: 1,
  topics: [
    entry({ id: 'm1_01_a', title: 'Alpha', sequence: 1, examRelevance: 'high', estimatedMinutes: 10 }),
    entry({ id: 'm1_02_b', title: 'Beta', sequence: 2, prerequisites: ['m1_01_a'], prerequisiteDepth: 1, examRelevance: 'medium', estimatedMinutes: 20, difficulty: 'intermediate' }),
    entry({ id: 'm1_03_d', title: 'Delta', sequence: 3, prerequisites: ['m1_02_b'], prerequisiteDepth: 2, examRelevance: 'high', estimatedMinutes: 40 }),
    entry({ id: 'm2_01_c', title: 'Gamma', module: 2, moduleName: 'M2', sequence: 1, examRelevance: 'low', estimatedMinutes: 30, difficulty: 'beginner' }),
    entry({ id: 'm2_02_u', title: 'Upsilon', module: 2, moduleName: 'M2', sequence: 2, examRelevance: 'medium', estimatedMinutes: null, difficulty: 'beginner' }),
    entry({ id: 'm1_01_z', courseCode: 'C2', courseName: 'Course Two', title: 'Zeta', sequence: 1, examRelevance: 'medium', estimatedMinutes: 15 }),
  ],
};

const readerFrom = (map) => (course, id) => map[`${course}/${id}`];
const stampsFrom = (map) => (course, id) => map[`${course}/${id}`];
const none = () => 'not_started';

describe('module identity and descriptive states', () => {
  it('shares one implementation across entry points', () => {
    for (const name of [
      'buildLearningAnalytics', 'getCompletionSummary', 'getCourseAnalytics',
      'getModuleAnalytics', 'getCoverageAreas', 'buildTopicAnalyticsContribution',
      'getTopicDescriptiveState',
    ]) {
      assert.equal(Analytics[name], AssetsAnalytics[name]);
    }
  });

  it('derives descriptive states transparently from existing facts', () => {
    const done = readerFrom({ 'C1/m1_01_a': 'completed' });
    const fresh = stampsFrom({ 'C1/m1_01_a': NOW - DAY });
    assert.equal(Analytics.getTopicDescriptiveState(fixture, done, fresh, 'C1', 'm1_01_a', NOW), 'completed');
    const due = stampsFrom({ 'C1/m1_01_a': NOW - 8 * DAY });
    assert.equal(Analytics.getTopicDescriptiveState(fixture, done, due, 'C1', 'm1_01_a', NOW), 'review_due');
    const overdue = stampsFrom({ 'C1/m1_01_a': NOW - 20 * DAY });
    assert.equal(Analytics.getTopicDescriptiveState(fixture, done, overdue, 'C1', 'm1_01_a', NOW), 'review_overdue');
    assert.equal(Analytics.getTopicDescriptiveState(fixture, () => 'in_progress', null, 'C1', 'm1_02_b', NOW), 'in_progress');
    assert.equal(Analytics.getTopicDescriptiveState(fixture, none, null, 'C1', 'm1_02_b', NOW), 'not_started');
    assert.equal(Analytics.getTopicDescriptiveState(fixture, none, null, 'C1', 'nope', NOW), 'not_started');
    assert.deepEqual(Analytics.DESCRIPTIVE_STATES, ['not_started', 'in_progress', 'completed', 'review_due', 'review_overdue']);
  });
});

describe('empty learner', () => {
  it('reports zeros with a truthful summary', () => {
    const a = Analytics.buildLearningAnalytics(fixture, none, null, NOW);
    assert.deepEqual(a.totals, { total: 6, completed: 0, inProgress: 0, notStarted: 6, percent: 0 });
    assert.equal(a.summary, '0 of 6 topics completed — 0% curriculum coverage.');
    assert.equal(a.examReadiness.readinessPercent, 0);
    assert.deepEqual(a.reviewCounts, { total: 0, due: 0, overdue: 0, examDue: 0 });
    assert.deepEqual(a.recent, []);
    assert.deepEqual(a.active, []);
  });
});

describe('partially completed learner', () => {
  it('counts completion, minutes, exam, and review descriptively', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'in_progress', 'C2/m1_01_z': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 20 * DAY, 'C2/m1_01_z': NOW - DAY });
    const a = Analytics.buildLearningAnalytics(fixture, getStatus, getTs, NOW);
    assert.deepEqual([a.totals.completed, a.totals.inProgress, a.totals.notStarted], [2, 1, 3]);
    assert.equal(a.summary, '2 of 6 topics completed — 33.3% curriculum coverage.');
    // study time: completed 10+15=25 (2 known); remaining 20+40+30=90 (3 known, u excluded).
    assert.deepEqual([a.studyTime.completedMinutes, a.studyTime.remainingMinutes, a.studyTime.totalMinutes], [25, 90, 115]);
    assert.equal(a.studyTime.avgCompleted, 12.5);
    assert.equal(a.examReadiness.completedExamTopics, 2);
    assert.equal(a.reviewOverdue, 1);
    assert.equal(a.reviewDue, 0);
    assert.equal(a.active.length, 1);
  });
});

describe('all-completed learner', () => {
  it('reports full coverage while review still applies', () => {
    const all = {};
    for (const t of fixture.topics) all[`${t.courseCode}/${t.id}`] = 'completed';
    const getTs = () => NOW - 30 * DAY;
    const a = Analytics.buildLearningAnalytics(fixture, readerFrom(all), getTs, NOW);
    assert.equal(a.totals.percent, 100);
    assert.equal(a.summary, '6 of 6 topics completed — 100% curriculum coverage.');
    assert.equal(a.examReadiness.readinessPercent, 100);
    assert.equal(a.reviewCounts.total, 6);
  });
});

describe('mixed course progress', () => {
  it('scores each course in curriculum order', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const a = Analytics.buildLearningAnalytics(fixture, getStatus, null, NOW);
    assert.deepEqual(a.courses.map((c) => c.courseCode), ['C1', 'C2']);
    const c1 = a.courses[0];
    assert.deepEqual([c1.total, c1.completed, c1.inProgress, c1.remaining, c1.percent], [5, 2, 0, 3, 40]);
    assert.equal(c1.examReadiness, a.courses[0].examReadiness);
    assert.equal(a.courses[1].completed, 0);
  });
});

describe('mixed module progress', () => {
  it('scores each module with exam distribution and review counts', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const m1 = Analytics.getModuleAnalytics(fixture, getStatus, null, 'C1', 1, NOW);
    assert.deepEqual([m1.total, m1.completed, m1.percent], [3, 1, 33]);
    assert.equal(m1.examRelevance.high.total, 2);
    const m2 = Analytics.getModuleAnalytics(fixture, getStatus, null, 'C1', 2, NOW);
    assert.deepEqual([m2.total, m2.completed], [2, 0]);
    assert.deepEqual(Analytics.getModuleAnalytics(fixture, getStatus, null, 'C1', 9, NOW).total, 0);
  });
});

describe('exact percentage calculations', () => {
  it('rounds whole percents and one-decimal coverage', () => {
    const one = readerFrom({ 'C1/m1_01_a': 'completed' });
    const a = Analytics.buildLearningAnalytics(fixture, one, null, NOW);
    assert.equal(a.totals.percent, 17);
    assert.equal(a.coveragePercent, 16.7);
  });
});

describe('estimated minutes', () => {
  it('excludes unknown minutes from sums and averages', () => {
    const a = Analytics.buildLearningAnalytics(fixture, none, null, NOW);
    assert.equal(a.studyTime.totalMinutes, 115);
    assert.equal(a.studyTime.avgTotal, 23);
    assert.equal(a.studyTime.avgCompleted, 0);
    const c1 = a.courses[0];
    assert.equal(c1.remainingMinutes, 100);
  });
});

describe('exam readiness integration', () => {
  it('reuses the canonical exam module without duplicating math', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const a = Analytics.buildLearningAnalytics(fixture, getStatus, null, NOW);
    // weights: high a(3)+d(3), medium b(2)+u(2)+z(2), low c(1) = 13; done 3 -> 23%.
    assert.equal(a.examReadiness.weightedCompleted, 3);
    assert.equal(a.examReadiness.weightedTotal, 13);
    assert.equal(a.examReadiness.readinessPercent, 23);
    assert.equal(a.examCompleted, 1);
    assert.equal(a.examRemaining, 5);
  });
});

describe('revision integration', () => {
  it('reuses canonical review counts', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 9 * DAY, 'C1/m1_02_b': NOW - 30 * DAY });
    const a = Analytics.buildLearningAnalytics(fixture, getStatus, getTs, NOW);
    assert.deepEqual([a.reviewDue, a.reviewOverdue], [1, 1]);
    assert.deepEqual(a.reviewCounts, { total: 2, due: 1, overdue: 1, examDue: 2 });
  });
});

describe('difficulty distribution', () => {
  it('splits totals by difficulty with completion', () => {
    const d = Analytics.getDifficultyDistribution(fixture, readerFrom({ 'C1/m1_01_a': 'completed' }));
    assert.deepEqual([d.beginner.total, d.beginner.completed], [5, 1]);
    assert.deepEqual([d.intermediate.total, d.intermediate.completed], [1, 0]);
  });
});

describe('exam relevance distribution', () => {
  it('splits totals by exam relevance with completion', () => {
    const d = Analytics.getExamRelevanceDistribution(fixture, readerFrom({ 'C2/m1_01_z': 'completed' }));
    assert.deepEqual([d.high.total, d.high.completed, d.high.remaining], [2, 0, 2]);
    assert.deepEqual([d.medium.total, d.medium.completed], [3, 1]);
    assert.deepEqual([d.low.total, d.low.completed], [1, 0]);
  });
});

describe('recently completed topics', () => {
  it('orders newest first with manifest-order tiebreak and no fabrication', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const same = stampsFrom({ 'C1/m1_01_a': NOW - 5 * DAY, 'C1/m1_02_b': NOW - 5 * DAY });
    const recent = Analytics.getRecentTopics(fixture, getStatus, same);
    assert.deepEqual(recent.map((t) => t.id), ['m1_02_b', 'm1_01_a']);
    assert.deepEqual(Analytics.getRecentTopics(fixture, getStatus, null), []);
    assert.deepEqual(Analytics.getRecentTopics(fixture, getStatus, () => 'nope'), []);
  });
});

describe('deterministic repeated runs', () => {
  it('returns identical analytics across runs', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 9 * DAY });
    assert.equal(
      JSON.stringify(Analytics.buildLearningAnalytics(fixture, getStatus, getTs, NOW)),
      JSON.stringify(Analytics.buildLearningAnalytics(fixture, getStatus, getTs, NOW))
    );
  });
});

describe('course ordering', () => {
  it('preserves curriculum (manifest) order', () => {
    const reversed = { version: 1, topics: [...fixture.topics].reverse() };
    const a = Analytics.buildLearningAnalytics(reversed, none, null, NOW);
    assert.deepEqual(a.courses.map((c) => c.courseCode), ['C2', 'C1']);
  });
});

describe('module ordering', () => {
  it('orders modules numerically within a course', () => {
    const mods = Analytics.getModuleAnalyticsList(fixture, none, null, 'C1', NOW);
    assert.deepEqual(mods.map((m) => m.module), [1, 2]);
    assert.deepEqual(Analytics.getModuleAnalyticsList(fixture, none, null, 'NOPE', NOW), []);
  });
});

describe('coverage areas', () => {
  it('ranks highest/lowest completion descriptively with order tiebreak', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed', 'C1/m2_01_c': 'completed' });
    const cov = Analytics.getCoverageAreas(fixture, getStatus, null, NOW, 3);
    assert.ok(cov.highestCourses[0].percent >= cov.highestCourses[1].percent);
    assert.ok(cov.lowestCourses[0].percent <= cov.lowestCourses[1].percent);
    const html = JSON.stringify(cov);
    assert.ok(!/best|worst/i.test(html));
    for (const m of [...cov.highestModules, ...cov.lowestModules]) {
      assert.ok(typeof m.percent === 'number' && typeof m.courseCode === 'string');
    }
  });
});

describe('learning journey integration', () => {
  it('exposes analytics without changing any recommendation', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const plain = buildJourneyModel(fixture, getStatus);
    const withAnalytics = buildJourneyModel(fixture, getStatus, {
      getTimestamp: stampsFrom({ 'C1/m1_01_a': NOW - DAY }), now: NOW,
    });
    assert.equal(plain.recommended.id, withAnalytics.recommended.id);
    assert.equal(plain.nextExamTopic.id, withAnalytics.nextExamTopic.id);
    assert.equal(withAnalytics.analytics.summary, '1 of 6 topics completed — 16.7% curriculum coverage.');
    assert.equal(withAnalytics.analytics.totals.completed, 1);
  });
});

describe('dashboard wiring', () => {
  it('exposes a pure model and renders the analytics section', () => {
    const a = buildDashboardAnalyticsModel(fixture, none, null, NOW);
    assert.equal(a.totals.total, 6);
    assert.ok(fs.readFileSync('dashboard.html', 'utf-8').includes('id="db-analytics"'));
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    assert.ok(js.includes('buildLearningAnalytics'));
    assert.ok(js.includes('renderAnalytics'));
    assert.ok(!/XP|streak|badge|leaderboard|level/i.test(a.summary + a.activity.message));
  });
});

describe('explorer wiring', () => {
  it('reuses canonical analytics for course/module indicators', () => {
    const c = getExplorerCourseAnalytics(fixture, none, null, 'C1', NOW);
    assert.deepEqual([c.total, c.completed, c.percent, c.remainingMinutes], [5, 0, 0, 100]);
    const m = getExplorerModuleAnalytics(fixture, none, null, 'C1', 1, NOW);
    assert.deepEqual([m.total, m.percent], [3, 0]);
    assert.equal(getExplorerCourseAnalytics(fixture, none, null, null, NOW), null);
    assert.equal(getExplorerModuleAnalytics(fixture, none, null, 'C1', 'all', NOW), null);
    assert.ok(fs.readFileSync('assets/explorer.js', 'utf-8').includes('getExplorerCourseAnalytics'));
  });
});

describe('topic study context wiring', () => {
  it('shows a small analytics contribution for the current topic', () => {
    const model = buildStudyContextModel(fixture, readerFrom({ 'C1/m1_01_a': 'completed' }), 'C1', 'm1_02_b');
    assert.deepEqual(model.analytics.courseCompletion, { completed: 1, total: 5, percent: 20 });
    assert.deepEqual(model.analytics.moduleCompletion, { module: 1, completed: 1, total: 3, percent: 33 });
    assert.equal(model.analytics.contributesToExam, true);
    const html = renderStudyContext(model);
    assert.match(html, /Analytics/);
    assert.match(html, /Course 1\/5 complete/);
    assert.equal(buildStudyContextModel(fixture, none, 'C1', 'nope'), null);
  });
});

describe('live 432-topic repository', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });

  it('scores the full curriculum deterministically', () => {
    assert.equal(manifest.topics.length, 432);
    const a = Analytics.buildLearningAnalytics(manifest, none, null, NOW);
    assert.equal(a.totals.total, 432);
    assert.equal(a.courses.length, 16);
    assert.ok(a.studyTime.totalMinutes > 0);
    assert.ok(a.summary.includes('0 of 432 topics completed'));
    assert.equal(
      JSON.stringify(Analytics.buildLearningAnalytics(manifest, none, null, NOW)),
      JSON.stringify(Analytics.buildLearningAnalytics(manifest, none, null, NOW))
    );
    const half = {};
    manifest.topics.slice(0, 216).forEach((t) => { half[`${t.courseCode}/${t.id}`] = 'completed'; });
    const partial = Analytics.buildLearningAnalytics(manifest, readerFrom(half), null, NOW);
    assert.equal(partial.totals.completed, 216);
    assert.equal(partial.summary, '216 of 432 topics completed — 50% curriculum coverage.');
  });
});
