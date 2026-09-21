/**
 * Dependency-free tests for the canonical Deterministic Study Planning
 * Layer (node:test + node:assert only — no test framework). Covers the pure
 * model in assets/study-planner.js (via scripts/study-planner.js) plus its
 * Learning Journey / Dashboard / Explorer / Topic Study Context
 * integrations. Planning is arithmetic over recorded facts only: no
 * prediction, no retention models, no gamification. Current time and dates
 * are always injected — never the real clock.
 *
 * Run: npm test  (node --test scripts/study-planner.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as Planner from './study-planner.js';
import * as AssetsPlanner from '../assets/study-planner.js';
import { memoryStorage } from '../assets/learner-state.js';
import { buildJourneyModel, onJourneyProgressChanged, emitJourneyProgressChanged } from '../assets/learning-journey.js';
import { buildDashboardPlanModel } from '../assets/dashboard.js';
import { getExplorerPlanInfo } from '../assets/explorer.js';
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

const fixture = {
  version: 1,
  topics: [
    entry({ id: 'm1_01_a', title: 'Alpha', sequence: 1, examRelevance: 'high', estimatedMinutes: 10 }),
    entry({ id: 'm1_02_b', title: 'Beta', sequence: 2, prerequisites: ['m1_01_a'], prerequisiteDepth: 1, examRelevance: 'medium', estimatedMinutes: 20 }),
    entry({ id: 'm1_03_d', title: 'Delta', sequence: 3, prerequisites: ['m1_02_b'], prerequisiteDepth: 2, examRelevance: 'high', estimatedMinutes: 40 }),
    entry({ id: 'm2_01_c', title: 'Gamma', module: 2, moduleName: 'M2', sequence: 1, examRelevance: 'low', estimatedMinutes: 30 }),
    entry({ id: 'm2_02_e', title: 'Epsilon', module: 2, moduleName: 'M2', sequence: 2, examRelevance: 'medium', estimatedMinutes: null }),
    entry({ id: 'm2_03_f', title: 'Phi', module: 2, moduleName: 'M2', sequence: 3, examRelevance: null, estimatedMinutes: 12 }),
    entry({ id: 'm1_01_z', courseCode: 'C2', courseName: 'Course Two', title: 'Zeta', sequence: 1, examRelevance: 'medium', estimatedMinutes: 15 }),
  ],
};

const planIds = (plan) => plan.remainingTopics.map((t) => `${t.courseCode}/${t.id}`);
const readerFrom = (map) => (course, id) => map[`${course}/${id}`];
const stampsFrom = (map) => (course, id) => map[`${course}/${id}`];
const none = () => 'not_started';

describe('module identity and config validation', () => {
  it('shares one implementation across entry points', () => {
    for (const name of [
      'buildStudyPlan', 'normalizePlanConfig', 'savePlanConfig',
      'loadPlanConfig', 'clearPlanConfig', 'getTopicPlanDay',
      'isTopicPlanned', 'explainTopicPlanMembership',
    ]) {
      assert.equal(Planner[name], AssetsPlanner[name]);
    }
    assert.equal(Planner.PLAN_CONFIG_KEY, 'tarangam_study_plan_v1');
  });

  it('rejects invalid configs without throwing', () => {
    assert.equal(Planner.normalizePlanConfig(null), null);
    assert.equal(Planner.normalizePlanConfig({ targetType: 'grades' }), null);
    assert.equal(Planner.buildStudyPlan(fixture, none, null, null, NOW).status, 'no_plan');
    assert.equal(Planner.buildStudyPlan(fixture, none, null, { targetType: 'bogus' }, NOW).status, 'no_plan');
  });
});

describe('no plan', () => {
  it('reports no_plan for a new learner without configuration', () => {
    const plan = Planner.buildStudyPlan(fixture, none, null, undefined, NOW);
    assert.equal(plan.status, 'no_plan');
    assert.deepEqual(plan.remainingTopics, []);
    assert.deepEqual(plan.planNextTopics, []);
    assert.equal(plan.requiredMinutesPerDay, null);
    assert.match(plan.explanation, /configure an explicit study target first/);
  });
});

describe('completion target', () => {
  it('plans all unfinished topics with minute arithmetic', () => {
    const plan = Planner.buildStudyPlan(fixture, none, null, { targetType: 'completion', minutesPerDay: 30 }, NOW);
    assert.equal(plan.status, 'on_track');
    assert.deepEqual(planIds(plan), ['C1/m1_01_a', 'C1/m2_01_c', 'C1/m2_02_e', 'C1/m2_03_f', 'C2/m1_01_z', 'C1/m1_02_b', 'C1/m1_03_d']);
    assert.equal(plan.remainingMinutes, 10 + 30 + 20 + 40 + 15 + 12);
    assert.equal(plan.unknownMinutesCount, 1);
    assert.deepEqual(plan.currentState, { completed: 0, total: 7 });
  });

  it('honours an explicit topic-count goal', () => {
    const done = readerFrom({ 'C1/m1_01_a': 'completed' });
    const plan = Planner.buildStudyPlan(fixture, done, null, { targetType: 'completion', targetValue: 3, minutesPerDay: 60 }, NOW);
    assert.deepEqual(plan.targetState, { goal: 3, unit: 'topics' });
    assert.equal(plan.remainingTopics.length, 2);
  });
});

describe('exam target', () => {
  it('selects an exam-relevant prefix reaching the target percent', () => {
    const plan = Planner.buildStudyPlan(fixture, none, null, { targetType: 'exam', targetValue: 50, minutesPerDay: 60 }, NOW);
    // weights total 3+2+3+1+2+0+2 = 13; need ceil(6.5) = 7: a(3)+c(4)+e(6)+z(8).
    assert.deepEqual(planIds(plan), ['C1/m1_01_a', 'C1/m2_01_c', 'C1/m2_02_e', 'C2/m1_01_z']);
    assert.deepEqual(plan.targetState, { goalPercent: 50, unit: 'readiness percent' });
    for (const t of plan.remainingTopics) {
      assert.ok(['high', 'medium', 'low'].includes(t.examRelevance));
    }
  });

  it('defaults an exam target to full readiness', () => {
    const plan = Planner.buildStudyPlan(fixture, none, null, { targetType: 'exam', minutesPerDay: 60 }, NOW);
    assert.deepEqual(plan.targetState, { goalPercent: 100, unit: 'readiness percent' });
    assert.equal(plan.remainingTopics.length, 6);
  });
});

describe('review target', () => {
  it('plans only the due/overdue queue in revision priority order', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m2_01_c': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 20 * DAY, 'C1/m2_01_c': NOW - 8 * DAY });
    const plan = Planner.buildStudyPlan(fixture, getStatus, getTs, { targetType: 'review', minutesPerDay: 60 }, NOW);
    assert.equal(plan.status, 'on_track');
    assert.deepEqual(planIds(plan), ['C1/m1_01_a', 'C1/m2_01_c']);
    assert.deepEqual(plan.targetState, { goal: 0, unit: 'remaining due topics' });
  });
});

describe('daily minutes', () => {
  it('buckets topics by budget without splitting and rides unknown minutes along', () => {
    const plan = Planner.buildStudyPlan(fixture, none, null, { targetType: 'completion', minutesPerDay: 30 }, NOW);
    // day1 a(10); day2 c(30)+e(unknown); day3 f(12)+z(15); day4 b(20); day5 d(40).
    assert.equal(plan.estimatedDays, 5);
    assert.deepEqual(plan.dailyPlan.map((d) => d.topics.map((t) => t.id)),
      [['m1_01_a'], ['m2_01_c', 'm2_02_e'], ['m2_03_f', 'm1_01_z'], ['m1_02_b'], ['m1_03_d']]);
    assert.equal(plan.requiredMinutesPerDay, 127 / 5);
    assert.equal(plan.requiredMinutesPerDay, 127 / 5);
    assert.deepEqual(plan.todayTopics.map((t) => t.id), ['m1_01_a']);
    assert.equal(plan.upcomingDays.length, 4);
  });

  it('never splits a topic larger than the whole budget', () => {
    const plan = Planner.buildStudyPlan(
      fixture, none, null, { targetType: 'completion', targetValue: 1, minutesPerDay: 5 }, NOW
    );
    assert.equal(plan.dailyPlan.length, 1);
    assert.equal(plan.dailyPlan[0].topics.length, 1);
  });
});

describe('target dates', () => {
  it('computes available days and feasibility arithmetically', () => {
    const date = new Date(NOW + 2 * DAY).toISOString();
    const feasible = Planner.buildStudyPlan(fixture, none, null,
      { targetType: 'completion', minutesPerDay: 100, targetDate: date }, NOW);
    assert.equal(feasible.availableDays, 2);
    assert.equal(feasible.requiredMinutesPerDay, 127 / 2);
    assert.equal(feasible.status, 'on_track');
    assert.equal(feasible.dateFeasibility, 'feasible');
    const tight = Planner.buildStudyPlan(fixture, none, null,
      { targetType: 'completion', minutesPerDay: 30, targetDate: date }, NOW);
    assert.equal(tight.status, 'requires_more_time');
    assert.equal(tight.dateFeasibility, 'requires_more_time');
  });

  it('treats past dates as needing more time and garbage dates as insufficient data', () => {
    const past = Planner.buildStudyPlan(fixture, none, null,
      { targetType: 'completion', minutesPerDay: 100, targetDate: new Date(NOW - DAY).toISOString() }, NOW);
    assert.equal(past.availableDays, 0);
    assert.equal(past.status, 'requires_more_time');
    const garbage = Planner.buildStudyPlan(fixture, none, null,
      { targetType: 'completion', minutesPerDay: 100, targetDate: 'not-a-date' }, NOW);
    assert.equal(garbage.status, 'insufficient_data');
    assert.equal(garbage.dateFeasibility, 'insufficient_data');
  });
});

describe('already reached', () => {
  it('reports target_reached when nothing remains', () => {
    const all = {};
    for (const t of fixture.topics) all[`${t.courseCode}/${t.id}`] = 'completed';
    const plan = Planner.buildStudyPlan(fixture, readerFrom(all), null, { targetType: 'completion', minutesPerDay: 30 }, NOW);
    assert.equal(plan.status, 'target_reached');
    assert.deepEqual(plan.dailyPlan, []);
    assert.equal(plan.estimatedDays, 0);
    const dated = Planner.buildStudyPlan(fixture, readerFrom(all), null,
      { targetType: 'completion', minutesPerDay: 30, targetDate: new Date(NOW + DAY).toISOString() }, NOW);
    assert.equal(dated.dateFeasibility, 'already_reached');
  });
});

describe('insufficient data', () => {
  it('requires a usable daily budget for scheduling', () => {
    assert.equal(Planner.buildStudyPlan(fixture, none, null, { targetType: 'completion' }, NOW).status, 'insufficient_data');
    assert.equal(Planner.buildStudyPlan(fixture, none, null, { targetType: 'completion', minutesPerDay: 0 }, NOW).status, 'insufficient_data');
    assert.equal(Planner.buildStudyPlan(fixture, none, null, { targetType: 'completion', minutesPerDay: -5 }, NOW).status, 'insufficient_data');
  });
});

describe('feasible and infeasible arithmetic', () => {
  it('compares required pace against the budget exactly', () => {
    // 127 remaining minutes, 1 available day: 127/day required.
    const date = new Date(NOW + DAY).toISOString();
    const exact = Planner.buildStudyPlan(fixture, none, null,
      { targetType: 'completion', minutesPerDay: 127, targetDate: date }, NOW);
    assert.equal(exact.requiredMinutesPerDay, 127);
    assert.equal(exact.status, 'on_track');
    const short = Planner.buildStudyPlan(fixture, none, null,
      { targetType: 'completion', minutesPerDay: 126.9, targetDate: date }, NOW);
    assert.equal(short.status, 'requires_more_time');
  });
});

describe('prerequisite ordering', () => {
  it('never schedules a topic before its unfinished in-plan prerequisites', () => {
    const plan = Planner.buildStudyPlan(fixture, none, null, { targetType: 'completion', minutesPerDay: 200 }, NOW);
    const dayOf = {};
    for (const day of plan.dailyPlan) {
      for (const t of day.topics) dayOf[`${t.courseCode}/${t.id}`] = day.day;
    }
    assert.ok(dayOf['C1/m1_01_a'] <= dayOf['C1/m1_02_b']);
    assert.ok(dayOf['C1/m1_02_b'] <= dayOf['C1/m1_03_d']);
    const order = planIds(plan);
    assert.ok(order.indexOf('C1/m1_01_a') < order.indexOf('C1/m1_02_b'));
    assert.ok(order.indexOf('C1/m1_02_b') < order.indexOf('C1/m1_03_d'));
  });
});

describe('review-overdue priority', () => {
  it('orders overdue review topics first with documented reasons', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m2_01_c': 'completed' });
    const getTs = stampsFrom({ 'C1/m1_01_a': NOW - 8 * DAY, 'C1/m2_01_c': NOW - 30 * DAY });
    const plan = Planner.buildStudyPlan(fixture, getStatus, getTs, { targetType: 'review', minutesPerDay: 60 }, NOW);
    assert.deepEqual(planIds(plan), ['C1/m2_01_c', 'C1/m1_01_a']);
    assert.match(plan.remainingTopics[0].reason, /review-overdue/);
  });
});

describe('exam relevance', () => {
  it('keeps non-exam topics out of exam plans but in completion plans', () => {
    const exam = Planner.buildStudyPlan(fixture, none, null, { targetType: 'exam', minutesPerDay: 200 }, NOW);
    assert.ok(!planIds(exam).includes('C1/m2_03_f'));
    const full = Planner.buildStudyPlan(fixture, none, null, { targetType: 'completion', minutesPerDay: 200 }, NOW);
    assert.ok(planIds(full).includes('C1/m2_03_f'));
  });
});

describe('unknown estimated minutes', () => {
  it('rides unknown-minute topics along without consuming budget', () => {
    const scoped = Planner.buildStudyPlan(
      fixture, none, null, { targetType: 'completion', courseScope: 'C1', moduleScope: 2, minutesPerDay: 30 }, NOW
    );
    // c(30) fills day 1; e (unknown) rides along on day 1; f(12) starts day 2.
    assert.deepEqual(scoped.dailyPlan.map((d) => d.topics.map((t) => t.id)), [['m2_01_c', 'm2_02_e'], ['m2_03_f']]);
    assert.equal(scoped.unknownMinutesCount, 1);
    assert.equal(scoped.remainingMinutes, 42);
  });
});

describe('course scope', () => {
  it('restricts candidates and reports cross-scope exclusions', () => {
    const plan = Planner.buildStudyPlan(fixture, none, null,
      { targetType: 'completion', minutesPerDay: 60, courseScope: 'C2' }, NOW);
    assert.deepEqual(planIds(plan), ['C2/m1_01_z']);
    assert.ok(plan.excludedTopics.some((t) => t.courseCode === 'C1'));
    assert.ok(plan.explanation.includes('C2'));
  });
});

describe('module scope', () => {
  it('restricts to one module within the scoped course', () => {
    const plan = Planner.buildStudyPlan(fixture, none, null,
      { targetType: 'completion', minutesPerDay: 60, courseScope: 'C1', moduleScope: 2 }, NOW);
    assert.deepEqual(planIds(plan), ['C1/m2_01_c', 'C1/m2_02_e', 'C1/m2_03_f']);
  });
});

describe('deterministic repeated runs', () => {
  it('produces identical plans for identical inputs', () => {
    const config = { targetType: 'exam', targetValue: 80, minutesPerDay: 45, courseScope: 'C1' };
    const first = JSON.stringify(Planner.buildStudyPlan(fixture, none, null, config, NOW));
    const second = JSON.stringify(Planner.buildStudyPlan(fixture, none, null, config, NOW));
    assert.equal(first, second);
  });
});

describe('new learner', () => {
  it('creates no fabricated target and keeps journey recommendations', () => {
    const journey = buildJourneyModel(fixture, none);
    assert.equal(journey.planStatus, 'no_plan');
    assert.deepEqual(journey.planNextTopics, []);
    assert.ok(journey.recommended !== null);
  });
});

describe('all-completed learner', () => {
  it('reports completion reached while review planning still works', () => {
    const all = {};
    for (const t of fixture.topics) all[`${t.courseCode}/${t.id}`] = 'completed';
    const done = Planner.buildStudyPlan(fixture, readerFrom(all), null, { targetType: 'completion', minutesPerDay: 30 }, NOW);
    assert.equal(done.status, 'target_reached');
    const stamps = {};
    for (const t of fixture.topics) stamps[`${t.courseCode}/${t.id}`] = NOW - 30 * DAY;
    const review = Planner.buildStudyPlan(fixture, readerFrom(all), stampsFrom(stamps), { targetType: 'review', minutesPerDay: 60 }, NOW);
    assert.equal(review.status, 'on_track');
    assert.ok(review.remainingTopics.length > 0);
  });
});

describe('persistence', () => {
  it('stores only the explicit configuration round-trip', () => {
    const store = memoryStorage();
    const config = { targetType: 'exam', targetValue: 80, minutesPerDay: 45, courseScope: 'C1', targetDate: new Date(NOW + 3 * DAY).toISOString() };
    assert.equal(Planner.savePlanConfig(config, store), true);
    const loaded = Planner.loadPlanConfig(store);
    assert.equal(loaded.targetType, 'exam');
    assert.equal(loaded.targetValue, 80);
    assert.equal(loaded.minutesPerDay, 45);
    assert.equal(loaded.courseScope, 'C1');
    assert.equal(Planner.clearPlanConfig(store), true);
    assert.equal(Planner.loadPlanConfig(store), null);
  });
});

describe('learning journey integration', () => {
  it('exposes plan fields without changing any recommendation', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const plain = buildJourneyModel(fixture, getStatus);
    const config = { targetType: 'completion', minutesPerDay: 30 };
    const planned = buildJourneyModel(fixture, getStatus, { planConfig: config, now: NOW });
    assert.equal(plain.recommended.id, planned.recommended.id);
    assert.equal(plain.nextExamTopic.id, planned.nextExamTopic.id);
    assert.equal(planned.planStatus, 'on_track');
    assert.ok(planned.planNextTopics.length > 0);
    assert.equal(planned.planRemainingMinutes, planned.studyPlan.remainingMinutes);
    assert.equal(planned.planRequiredMinutesPerDay, planned.studyPlan.requiredMinutesPerDay);
    assert.equal(plain.planStatus, 'no_plan');
  });
});

describe('dashboard wiring', () => {
  it('exposes a pure plan model and renders the plan section', () => {
    const plan = buildDashboardPlanModel(fixture, none, null, { targetType: 'completion', minutesPerDay: 30 }, NOW);
    assert.equal(plan.status, 'on_track');
    assert.ok(fs.readFileSync('dashboard.html', 'utf-8').includes('id="db-plan"'));
    const js = fs.readFileSync('assets/dashboard.js', 'utf-8');
    assert.ok(js.includes('buildStudyPlan'));
    assert.ok(js.includes('renderPlan'));
    assert.ok(js.includes('savePlanConfig'));
  });
});

describe('explorer wiring', () => {
  it('derives planned indicators without per-topic state', () => {
    const config = { targetType: 'completion', minutesPerDay: 200 };
    const info = getExplorerPlanInfo(fixture, none, null, config, 'C1', 'm1_01_a', NOW);
    assert.equal(info.planned, true);
    assert.equal(info.day, 1);
    assert.match(info.reason, /Planned for day 1/);
    const missing = getExplorerPlanInfo(fixture, none, null, null, 'C1', 'm1_01_a', NOW);
    assert.equal(missing.planned, false);
    const js = fs.readFileSync('assets/explorer.js', 'utf-8');
    assert.ok(js.includes('In study plan'));
    assert.ok(js.includes('Add course to study plan'));
  });
});

describe('topic study context wiring', () => {
  it('marks planned topics with day and reason, others with nothing', () => {
    const config = { targetType: 'completion', minutesPerDay: 200 };
    const planned = buildStudyContextModel(fixture, none, 'C1', 'm1_01_a', { planConfig: config, now: NOW });
    assert.equal(planned.planned.planned, true);
    assert.equal(planned.planned.day, 1);
    assert.match(renderStudyContext(planned), /Study plan/);
    const unplanned = buildStudyContextModel(fixture, none, 'C1', 'm1_01_a', { now: NOW });
    assert.equal(unplanned.planned.planned, false);
    assert.ok(!renderStudyContext(unplanned).includes('ts-plan'));
  });
});

describe('progress-change synchronization', () => {
  it('reuses the shared event contract without polling', () => {
    const seen = [];
    const off = onJourneyProgressChanged((detail) => seen.push(detail));
    emitJourneyProgressChanged({ courseCode: 'C1', topicId: 'm1_01_a', source: 'planner-test' });
    assert.equal(seen.length, 1);
    off();
    const js = fs.readFileSync('assets/study-planner.js', 'utf-8');
    assert.ok(!js.includes('setInterval'));
    assert.ok(!js.includes('addEventListener'));
  });
});

describe('live 486-topic repository', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });

  it('schedules the full curriculum deterministically with intact prerequisites', () => {
    assert.equal(manifest.topics.length, 486);
    const config = { targetType: 'completion', minutesPerDay: 60 };
    const first = Planner.buildStudyPlan(manifest, none, null, config, NOW);
    const second = Planner.buildStudyPlan(manifest, none, null, config, NOW);
    assert.equal(JSON.stringify(first), JSON.stringify(second));
    assert.equal(first.status, 'on_track');
    assert.equal(first.remainingTopics.length, 486);
    assert.ok(first.estimatedDays > 0);
    // Prerequisite order holds across every daily bucket.
    const dayOf = new Map();
    for (const day of first.dailyPlan) {
      for (const t of day.topics) dayOf.set(`${t.courseCode}/${t.id}`, day.day);
    }
    for (const t of manifest.topics) {
      for (const p of t.prerequisites || []) {
        const dep = dayOf.get(`${t.courseCode}/${t.id}`);
        const pre = dayOf.get(`${t.courseCode}/${p}`);
        if (dep !== undefined && pre !== undefined) assert.ok(pre <= dep, `${p} before ${t.id}`);
      }
    }
    // No topic is ever split across days.
    const seen = new Set();
    for (const day of first.dailyPlan) {
      for (const t of day.topics) {
        const key = `${t.courseCode}/${t.id}`;
        assert.ok(!seen.has(key));
        seen.add(key);
      }
    }
    // Exam and review targets stay meaningful on the live graph.
    const exam = Planner.buildStudyPlan(manifest, none, null, { targetType: 'exam', targetValue: 50, minutesPerDay: 60 }, NOW);
    assert.ok(exam.remainingTopics.length > 0 && exam.remainingTopics.length < 486);
    const journey = buildJourneyModel(manifest, none, { planConfig: config, now: NOW });
    assert.equal(journey.planStatus, 'on_track');
    assert.ok(journey.recommended !== null);
  });
});
