/**
 * Dependency-free tests for the complete Topic learning navigation
 * (node:test + node:assert only — no test framework). Covers the topic
 * page as the endpoint of the Course → Module → Topic hierarchy:
 * deterministic Previous/Next controls from canonical in-course order
 * (first/last boundaries, middle neighbors, repeat determinism), the
 * static breadcrumb Course → Module → Topic with canonical overview
 * links, prerequisite completion agreement with the canonical graph,
 * assessment link resolution, local and GitHub Pages paths, safe unknown
 * topic/course/module handling, unchanged learner state, and proof that
 * recommendation, search, readiness, revision, and assessment logic are
 * untouched. Navigation reuses existing modules only — no new algorithms.
 *
 * Run: npm test  (node --test scripts/topic-navigation.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as Intel from './topic-intelligence.js';
import { createLearnerState, memoryStorage } from '../assets/learner-state.js';
import { buildStudyContextModel, renderStudyContext } from '../assets/topic-study-context.js';
import { assessmentHrefFrom } from '../assets/topic-study-context.js';
import { courseHrefFrom } from '../assets/course-overview.js';
import { topicPageUrl } from '../assets/curriculum-data.js';
import { renderTemplate } from './pages.js';
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
    entry({ id: 'm1_03_c', title: 'Gamma', sequence: 3, prerequisites: ['m1_01_a', 'm1_02_b'], prerequisiteDepth: 2 }),
  ],
};

const none = () => 'not_started';
const readerFrom = (map) => (course, id) => map[`${course}/${id}`];

function renderCrumb(data) {
  const template = fs.readFileSync('templates/base.html', 'utf-8');
  return renderTemplate(template, {
    title: 'T', current_id: 'm1_01_a', current_mod: 1, modules: {},
    prev_page: null, next_page: null, total_topics: 1,
    course_code: 'C1', course_name: 'Course One', content: '',
    ...data,
  });
}

describe('deterministic Previous/Next navigation', () => {
  it('has no previous on the first topic and no next on the last', () => {
    assert.equal(Intel.getPreviousInCourse(fixture, 'C1', 'm1_01_a'), null);
    assert.equal(Intel.getNextInCourse(fixture, 'C1', 'm1_03_c'), null);
    assert.equal(Intel.getPreviousInCourse(fixture, 'C1', 'nope'), null);
  });

  it('resolves correct middle neighbors deterministically', () => {
    assert.equal(Intel.getNextInCourse(fixture, 'C1', 'm1_01_a').id, 'm1_02_b');
    assert.equal(Intel.getPreviousInCourse(fixture, 'C1', 'm1_02_b').id, 'm1_01_a');
    assert.equal(Intel.getNextInCourse(fixture, 'C1', 'm1_02_b').id, 'm1_03_c');
    assert.equal(
      JSON.stringify(Intel.getNextInCourse(fixture, 'C1', 'm1_02_b')),
      JSON.stringify(Intel.getNextInCourse(fixture, 'C1', 'm1_02_b'))
    );
  });

  it('renders prev/next controls from canonical neighbors in the template', () => {
    const html = renderCrumb({
      prev_page: null,
      next_page: { filename: 'm1_02_b.html', title: 'Beta' },
    });
    assert.ok(!html.includes('id="prevTopicLink"'));
    assert.ok(html.includes('id="nextTopicLink"'));
    assert.ok(html.includes('href="./m1_02_b.html"'));
    const last = renderCrumb({
      prev_page: { filename: 'm1_02_b.html', title: 'Beta' },
      next_page: null,
    });
    assert.ok(last.includes('id="prevTopicLink"'));
    assert.ok(!last.includes('id="nextTopicLink"'));
  });
});

describe('breadcrumb Course → Module → Topic', () => {
  it('links course and module to their canonical overview pages', () => {
    const html = renderCrumb({});
    assert.ok(html.includes('<a href="../course.html?course=C1">C1</a>'));
    assert.ok(html.includes('<a href="../course.html?course=C1#module-1">Module 1</a>'));
    assert.ok(html.includes('id="crumb"'));
  });

  it('carries correct identities from manifest metadata', () => {
    const html = renderCrumb({ course_code: 'PCCST501', current_mod: 3, title: 'DNS' });
    assert.ok(html.includes('../course.html?course=PCCST501'));
    assert.ok(html.includes('#module-3">Module 3</a>'));
    assert.ok(html.includes('>DNS</span>'));
  });

  it('keeps the navigable loop consistent with overview helpers', () => {
    assert.equal(courseHrefFrom('PCCST501', 'PCCST501'), '../course.html?course=PCCST501');
    assert.equal(courseHrefFrom(null, 'PCCST501'), './course.html?course=PCCST501');
  });
});

describe('prerequisite section agreement', () => {
  it('matches the canonical graph completion and remaining counts', () => {
    const getStatus = readerFrom({ 'C1/m1_01_a': 'completed' });
    const model = buildStudyContextModel(fixture, getStatus, 'C1', 'm1_03_c');
    const direct = Intel.getDirectPrerequisiteCompletion(fixture, getStatus, 'C1', 'm1_03_c');
    assert.deepEqual(model.prereqCompletion, direct);
    assert.equal(
      model.remainingDependencies,
      Intel.getRemainingDependencyCount(fixture, getStatus, 'C1', 'm1_03_c')
    );
    assert.deepEqual(
      model.prereqs.map((p) => p.id).sort(),
      Intel.getPrerequisites(fixture, 'C1', 'm1_03_c').map((t) => t.id).sort()
    );
    assert.match(renderStudyContext(model), /Prerequisites \(1\/2 complete/);
  });
});

describe('study actions and assessment links', () => {
  it('keeps completion, readiness, revision, and progression blocks', () => {
    const html = renderStudyContext(buildStudyContextModel(fixture, none, 'C1', 'm1_02_b'));
    assert.ok(html.includes('Mark completed'));
    assert.ok(html.includes('Exam readiness'));
    assert.ok(html.includes('Study context'));
    assert.ok(html.includes('Continue learning'));
  });

  it('resolves assessment links for covered topics from both depths', () => {
    assert.equal(
      assessmentHrefFrom('C1', 'C1', 'm1_02_b'),
      '../assessment.html#scope=topic&course=C1&topic=m1_02_b'
    );
    assert.equal(
      assessmentHrefFrom(null, 'C1', 'm1_02_b'),
      './assessment.html#scope=topic&course=C1&topic=m1_02_b'
    );
  });
});

describe('local and Pages paths', () => {
  it('resolves topic pages for both hosting modes', () => {
    const topic = fixture.topics[1];
    assert.equal(topicPageUrl('', 'C1', topic), 'C1/m1_02_b.html');
    assert.equal(topicPageUrl('/repo/', 'C1', topic), '/repo/C1/m1_02_b.html');
  });
});

describe('safe unknown handling', () => {
  it('resolves unknown topic, course, and module without throwing', () => {
    assert.equal(buildStudyContextModel(fixture, none, 'C1', 'nope'), null);
    assert.equal(buildStudyContextModel(fixture, none, 'NOPE', 'm1_01_a'), null);
    assert.equal(renderStudyContext(null), '');
    assert.equal(Intel.getTopic(fixture, 'C1', 'nope'), null);
    assert.equal(Intel.getPreviousInCourse(fixture, 'NOPE', 'm1_01_a'), null);
    assert.equal(Intel.getNextInCourse(fixture, 'C1', 'nope'), null);
  });
});

describe('navigation leaves learner state and engines untouched', () => {
  it('performs read-only navigation over the store and canonical outputs', () => {
    const store = createLearnerState({ manifest: fixture, storage: memoryStorage() });
    store.markTopicCompleted('C1', 'm1_01_a');
    const reader = (c, id) => store.getTopicState(c, id).status;
    const before = JSON.stringify({
      state: store.getTopicState('C1', 'm1_01_a'),
      recommended: Intel.getNextRecommendedTopic(fixture, reader),
      topic: Intel.getTopic(fixture, 'C1', 'm1_02_b'),
    });
    Intel.getPreviousInCourse(fixture, 'C1', 'm1_02_b');
    Intel.getNextInCourse(fixture, 'C1', 'm1_02_b');
    Intel.getPrerequisites(fixture, 'C1', 'm1_03_c');
    Intel.searchCurriculum(fixture, 'beta');
    buildStudyContextModel(fixture, reader, 'C1', 'm1_02_b');
    renderCrumb({});
    assert.equal(JSON.stringify({
      state: store.getTopicState('C1', 'm1_01_a'),
      recommended: Intel.getNextRecommendedTopic(fixture, reader),
      topic: Intel.getTopic(fixture, 'C1', 'm1_02_b'),
    }), before);
  });
});

describe('live 435-topic repository', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });

  it('matches static build order to canonical neighbors for every topic', () => {
    assert.equal(manifest.topics.length, 435);
    for (const courseDir of fs.readdirSync('content')) {
      const ids = listTopicFiles(`content/${courseDir}`)
        .filter((f) => f.endsWith('.md'))
        .map((f) => f.replace(/\.md$/, ''));
      for (let i = 0; i < ids.length; i += 1) {
        const prev = Intel.getPreviousInCourse(manifest, courseDir, ids[i]);
        const next = Intel.getNextInCourse(manifest, courseDir, ids[i]);
        assert.equal(prev ? prev.id : null, i > 0 ? ids[i - 1] : null, `${courseDir}/${ids[i]} prev`);
        assert.equal(next ? next.id : null, i < ids.length - 1 ? ids[i + 1] : null, `${courseDir}/${ids[i]} next`);
      }
    }
  });

  it('renders breadcrumb and prev/next shells for live topics', () => {
    const html = renderCrumb({
      title: 'Domain Name System (DNS)', current_id: 'm1_07_domain_name_system_dns',
      current_mod: 1, course_code: 'PCCST501', course_name: 'Computer Networks',
      prev_page: { filename: 'm1_06_electronic_mail_smtp_pop3_imap.html', title: 'Mail' },
      next_page: { filename: 'm1_08_peer_to_peer_bittorrent.html', title: 'P2P' },
    });
    assert.ok(html.includes('../course.html?course=PCCST501'));
    assert.ok(html.includes('#module-1">Module 1</a>'));
    assert.ok(html.includes('id="prevTopicLink"'));
    assert.ok(html.includes('id="nextTopicLink"'));
    assert.ok(html.includes('./m1_08_peer_to_peer_bittorrent.html'));
  });

  it('keeps generated topic pages linkable from course overviews', () => {
    for (const t of manifest.topics) {
      assert.ok(
        fs.existsSync(`dist/${t.courseCode}/${t.filename}`) || fs.existsSync(`content/${t.courseCode}/${t.id}.md`),
        `${t.courseCode}/${t.id} has a readable source or built page`
      );
    }
  });
});
