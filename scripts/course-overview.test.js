/**
 * Dependency-free tests for the canonical Course & Module Overview Layer
 * (node:test + node:assert only — no test framework). Covers the pure
 * models in assets/course-overview.js (via scripts/course-overview.js),
 * the course page wiring (course.html + assets/course-page.js), and the
 * cross-surface navigation consistency: every course resolves, every
 * module resolves to its canonical topics, counts match the manifest,
 * progress agrees with learner-state data, Previous/Next navigation is
 * deterministic with correct boundaries (matching the static build order,
 * so generated topic pages agree with the intelligence layer), Pages and
 * local paths stay valid, no intelligence is duplicated, and all existing
 * suites remain unaffected.
 *
 * Run: npm test  (node --test scripts/course-overview.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as Course from './course-overview.js';
import * as AssetsCourse from '../assets/course-overview.js';
import * as Intel from './topic-intelligence.js';
import { createLearnerState, memoryStorage } from '../assets/learner-state.js';
import { getCourseExamReadiness, getModuleExamReadiness } from '../assets/exam-readiness.js';
import { getCourseReviewBreakdown, getModuleReviewBreakdown } from '../assets/revision.js';
import { getCourseAttention, getModuleAttention } from '../assets/weak-topic-analysis.js';
import { getCoveredTopicsPerCourse } from '../assets/assessment.js';
import { topicPageUrl } from '../assets/curriculum-data.js';
import { getCourseQueryCourse } from '../assets/course-page.js';
import { listTopicFiles } from './content.js';
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
    entry({ id: 'm1_01_a', title: 'Alpha', sequence: 1 }),
    entry({ id: 'm1_02_b', title: 'Beta', sequence: 2, prerequisites: ['m1_01_a'], prerequisiteDepth: 1 }),
    entry({ id: 'm2_01_c', title: 'Gamma', module: 2, moduleName: 'M2', sequence: 1 }),
    entry({ id: 'm1_01_z', courseCode: 'C2', courseName: 'Course Two', title: 'Zeta', sequence: 1 }),
  ],
};

const none = () => 'not_started';
const readerFrom = (map) => (course, id) => map[`${course}/${id}`];

describe('module identity and reuse contract', () => {
  it('shares one implementation and duplicates no intelligence', () => {
    for (const name of [
      'getCourseOverview', 'getModuleOverview', 'buildCourseOverviewList',
      'getTopicNeighbors', 'courseHrefFrom', 'parseCourseQuery',
    ]) {
      assert.equal(Course[name], AssetsCourse[name]);
    }
    const source = fs.readFileSync('assets/course-overview.js', 'utf-8');
    // Reuse, not duplication: every canonical dependency is imported.
    for (const dep of [
      "from './topic-intelligence.js'", "from './learner-state.js'",
      "from './exam-readiness.js'", "from './revision.js'",
      "from './weak-topic-analysis.js'", "from './assessment.js'",
    ]) {
      assert.ok(source.includes(dep), `missing ${dep}`);
    }
    // No second next-topic mechanism, no ratings, no AI, no polling, no storage.
    assert.ok(!/getRecommendedNextTopics|getNextRecommendedTopic/.test(source));
    assert.ok(!/mastery|weakness.?score|performance score|ability score|predicted/i.test(source));
    assert.ok(!/openai|anthropic|\bLLM\b|semantic\s+similarity/i.test(source));
    assert.ok(!source.includes('setInterval'));
    assert.ok(!source.includes('localStorage'));
  });
});

describe('course resolution', () => {
  it('resolves every course with identity, counts, and nested modules', () => {
    const a = Course.getCourseOverview(fixture, none, null, 'C1', undefined, null);
    assert.equal(a.courseCode, 'C1');
    assert.equal(a.courseName, 'Course One');
    assert.equal(a.moduleCount, 2);
    assert.equal(a.totalTopics, 3);
    assert.deepEqual(a.modules.map((m) => m.module), [1, 2]);
    const z = Course.getCourseOverview(fixture, none, null, 'C2', undefined, null);
    assert.equal(z.totalTopics, 1);
    assert.equal(Course.getCourseOverview(fixture, none, null, 'NOPE', undefined, null), null);
    assert.equal(Course.getCourseOverview(null, none, null, 'C1', undefined, null), null);
    assert.deepEqual(Course.buildCourseOverviewList(null, none, null, undefined, null), []);
  });

  it('invents no description field', () => {
    const a = Course.getCourseOverview(fixture, none, null, 'C1', undefined, null);
    assert.ok(!('description' in a));
    for (const m of a.modules) assert.ok(!('description' in m));
  });
});

describe('module resolution', () => {
  it('resolves every module to its canonical topics in manifest order', () => {
    const m1 = Course.getModuleOverview(fixture, none, null, 'C1', 1, undefined, null);
    assert.equal(m1.module, 1);
    assert.equal(m1.moduleName, 'M1');
    assert.equal(m1.totalTopics, 2);
    assert.deepEqual(m1.topics.map((t) => t.id), ['m1_01_a', 'm1_02_b']);
    assert.equal(m1.firstTopicId, 'm1_01_a');
    assert.equal(m1.lastTopicId, 'm1_02_b');
    assert.equal(Course.getModuleOverview(fixture, none, null, 'C1', 9, undefined, null), null);
    assert.equal(Course.getModuleOverview(fixture, none, null, 'NOPE', 1, undefined, null), null);
  });
});

describe('progress agreement with learner-state', () => {
  it('matches store progress, readiness-unrelated counts, and minutes', () => {
    const store = createLearnerState({ manifest: fixture, storage: memoryStorage() });
    store.markTopicCompleted('C1', 'm1_01_a');
    store.markTopicStarted('C1', 'm1_02_b');
    const reader = (c, id) => store.getTopicState(c, id).status;
    const course = Course.getCourseOverview(fixture, reader, null, 'C1', undefined, null);
    const overall = store.getCourseProgress('C1');
    assert.equal(course.completed, overall.completed);
    assert.equal(course.inProgress, overall.inProgress);
    assert.equal(course.notStarted, overall.notStarted);
    assert.equal(course.percent, overall.percent);
    assert.equal(course.totalTopics, 3);
    assert.equal(course.remaining, 2);
    // 5 min each for the two unfinished topics.
    assert.equal(course.remainingMinutes, 10);
    const module = Course.getModuleOverview(fixture, reader, null, 'C1', 1, undefined, null);
    const modProgress = store.getModuleProgress('C1', 1);
    assert.equal(module.completed, modProgress.completed);
    assert.equal(module.percent, modProgress.percent);
  });
});

describe('canonical signal reuse without duplication', () => {
  it('matches per-course/per-module exam, review, attention, and coverage APIs', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const course = Course.getCourseOverview(fixture, getStatus, null, 'C1', 1234, null);
    assert.deepEqual(course.exam, getCourseExamReadiness(fixture, getStatus, 'C1'));
    assert.deepEqual(course.review, getCourseReviewBreakdown(fixture, getStatus, null, 'C1', 1234));
    assert.deepEqual(course.attentionCounts, getCourseAttention(fixture, getStatus, null, 'C1', 1234, null).counts);
    const module = Course.getModuleOverview(fixture, getStatus, null, 'C1', 1, 1234, null);
    assert.deepEqual(module.exam, getModuleExamReadiness(fixture, getStatus, 'C1', 1));
    assert.deepEqual(module.review, getModuleReviewBreakdown(fixture, getStatus, null, 'C1', 1, 1234));
    assert.deepEqual(module.attentionCounts, getModuleAttention(fixture, getStatus, null, 'C1', 1, 1234, null).counts);
  });

  it('reports per-topic prerequisite and readiness facts from the intelligence layer', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const module = Course.getModuleOverview(fixture, getStatus, null, 'C1', 1, undefined, null);
    const beta = module.topics.find((t) => t.id === 'm1_02_b');
    assert.deepEqual(beta.prereqCompletion, { completed: 1, total: 1, percent: 100 });
    assert.equal(beta.remainingDependencies, 0);
    assert.equal(beta.isReady, true);
    assert.equal(beta.status, 'not_started');
    const alpha = module.topics.find((t) => t.id === 'm1_01_a');
    assert.equal(alpha.isReady, false);
    assert.equal(alpha.status, 'completed');
  });
});

describe('deterministic Previous/Next navigation', () => {
  it('follows canonical manifest order with null boundaries', () => {
    assert.deepEqual(Course.getTopicNeighbors(fixture, 'C1', 'm1_01_a').prev, null);
    assert.equal(Course.getTopicNeighbors(fixture, 'C1', 'm1_01_a').next.id, 'm1_02_b');
    assert.equal(Course.getTopicNeighbors(fixture, 'C1', 'm1_02_b').prev.id, 'm1_01_a');
    // In-course neighbors stay inside the course (Gamma is next in course
    // order after Beta here, matching getNextInCourse).
    const betaNext = Course.getTopicNeighbors(fixture, 'C1', 'm1_02_b').next;
    assert.equal(betaNext.id, Intel.getNextInCourse(fixture, 'C1', 'm1_02_b').id);
    assert.equal(Course.getTopicNeighbors(fixture, 'C1', 'nope'), null);
    // Repeated calls are identical.
    assert.equal(
      JSON.stringify(Course.getTopicNeighbors(fixture, 'C1', 'm1_02_b')),
      JSON.stringify(Course.getTopicNeighbors(fixture, 'C1', 'm1_02_b'))
    );
  });
});

describe('paths for local development and GitHub Pages', () => {
  it('builds course links relatively from any depth', () => {
    assert.equal(Course.courseHrefFrom(null, 'C1'), './course.html?course=C1');
    assert.equal(Course.courseHrefFrom('C1', 'C2'), '../course.html?course=C2');
    assert.equal(Course.courseHrefFrom('C1', null), '#');
    assert.deepEqual(Course.parseCourseQuery('?course=PCCST501'), { courseCode: 'PCCST501' });
    assert.deepEqual(Course.parseCourseQuery(''), { courseCode: null });
    assert.deepEqual(Course.parseCourseQuery('?course=  '), { courseCode: null });
    assert.deepEqual(getCourseQueryCourse('?course=GAMAT301'), 'GAMAT301');
  });

  it('resolves topic pages for both hosting modes', () => {
    const topic = fixture.topics[1];
    assert.equal(topicPageUrl('', 'C1', topic), 'C1/m1_02_b.html');
    assert.equal(topicPageUrl('/repo/', 'C1', topic), '/repo/C1/m1_02_b.html');
  });
});

describe('course page wiring', () => {
  it('ships the page, logic, and build plumbing with shared mechanisms', () => {
    assert.ok(fs.existsSync('course.html'));
    assert.ok(fs.existsSync('assets/course-page.js'));
    assert.ok(fs.existsSync('assets/course-overview.js'));
    const html = fs.readFileSync('course.html', 'utf-8');
    assert.ok(html.includes('assets/course-page.js'));
    assert.ok(html.includes('id="co-course"'));
    assert.ok(html.includes('id="co-modules"'));
    assert.ok(html.includes('name="viewport"'));
    assert.ok(/@media[^{]*max-width/.test(html), 'responsive rules required');
    const js = fs.readFileSync('assets/course-page.js', 'utf-8');
    assert.ok(js.includes('getCourseOverview'));
    assert.ok(js.includes('tarangam:progress-changed') || js.includes('PROGRESS_CHANGED_EVENT') || js.includes('onJourneyProgressChanged'));
    assert.ok(!js.includes('setInterval'));
    assert.ok(!/getRecommendedNextTopics|getNextRecommendedTopic/.test(js));
    assert.ok(fs.readFileSync('scripts/output.js', 'utf-8').includes('copyCoursePage'));
    assert.ok(fs.readFileSync('scripts/build.js', 'utf-8').includes('copyCoursePage'));
    // Cross-surface links reuse the shared helpers.
    assert.ok(fs.readFileSync('assets/dashboard.js', 'utf-8').includes('course.html?course='));
    assert.ok(fs.readFileSync('assets/explorer.js', 'utf-8').includes('course.html?course='));
    assert.ok(fs.readFileSync('assets/topic-study-context.js', 'utf-8').includes('courseHrefFrom'));
  });
});

describe('live 435-topic repository', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });

  it('resolves all 16 courses and 64 modules with manifest-matching counts', () => {
    assert.equal(manifest.topics.length, 435);
    const courses = Course.buildCourseOverviewList(manifest, none, null, undefined, null);
    assert.equal(courses.length, 16);
    assert.equal(courses.reduce((a, c) => a + c.totalTopics, 0), 435);
    let moduleCount = 0;
    for (const c of courses) {
      assert.equal(c.modules.length, c.moduleCount);
      for (const m of c.modules) {
        moduleCount += 1;
        const canonical = Intel.getModuleTopics(manifest, c.courseCode, m.module);
        assert.deepEqual(m.topics.map((t) => t.id), canonical.map((t) => t.id));
        assert.equal(m.totalTopics, canonical.length);
        assert.equal(m.firstTopicId, canonical[0].id);
        assert.equal(m.lastTopicId, canonical[canonical.length - 1].id);
      }
      const canonicalCourse = Intel.getCourseTopics(manifest, c.courseCode);
      assert.equal(c.totalTopics, canonicalCourse.length);
    }
    assert.equal(moduleCount, 64);
  });

  it('keeps static build order identical to canonical neighbors', () => {
    // Generated topic pages link prev/next by sorted-filename build order;
    // that order must equal the canonical in-course neighbor functions.
    for (const courseDir of fs.readdirSync('content')) {
      const files = listTopicFiles(`content/${courseDir}`).filter((f) => f.endsWith('.md'));
      const ids = files.map((f) => f.replace(/\.md$/, ''));
      for (let i = 0; i < ids.length; i += 1) {
        const neighbors = Course.getTopicNeighbors(manifest, courseDir, ids[i]);
        assert.ok(neighbors, `${courseDir}/${ids[i]} resolves`);
        assert.equal(neighbors.prev ? neighbors.prev.id : null, i > 0 ? ids[i - 1] : null, `${courseDir}/${ids[i]} prev`);
        assert.equal(neighbors.next ? neighbors.next.id : null, i < ids.length - 1 ? ids[i + 1] : null, `${courseDir}/${ids[i]} next`);
      }
    }
  });

  it('agrees with learner-state progress on the live graph', () => {
    const store = createLearnerState({ manifest, storage: memoryStorage() });
    store.markTopicCompleted('GAMAT301', 'm1_01_random_variables_pmf_cdf');
    store.markTopicStarted('GAMAT301', 'm1_02_expectation_mean_variance');
    const reader = (c, id) => store.getTopicState(c, id).status;
    const course = Course.getCourseOverview(manifest, reader, null, 'GAMAT301', undefined, null);
    const expected = store.getCourseProgress('GAMAT301');
    assert.equal(course.completed, expected.completed);
    assert.equal(course.inProgress, expected.inProgress);
    assert.equal(course.percent, expected.percent);
    assert.equal(course.totalTopics, 24);
    assert.equal(
      JSON.stringify(Course.getCourseOverview(manifest, reader, null, 'GAMAT301', 42, null)),
      JSON.stringify(Course.getCourseOverview(manifest, reader, null, 'GAMAT301', 42, null))
    );
  });

  it('matches canonical per-course coverage rows', () => {
    const liveBank = JSON.parse(fs.readFileSync('data/assessments.json', 'utf-8'));
    const assessment = { bank: liveBank, attempts: { version: 1, attempts: [] } };
    const rows = new Map(getCoveredTopicsPerCourse(liveBank, manifest).map((r) => [r.courseCode, r]));
    for (const c of Course.buildCourseOverviewList(manifest, none, null, undefined, assessment)) {
      assert.equal(c.assessment.coveredCount, rows.get(c.courseCode).coveredCount);
      assert.equal(c.assessment.totalTopics, c.totalTopics);
    }
  });
});
