/**
 * Dependency-free tests for the Topic Study Context layer
 * (node:test + node:assert only — no test framework). Covers the pure model
 * builder and renderer in assets/topic-study-context.js plus its static
 * template wiring: root vs prerequisite topics, multi-ancestor chains,
 * completed/incomplete states, ancestor completion, root/leaf flags,
 * navigation boundaries, invalid ids, static URL generation, learner-state
 * updates with next-recommendation advance, representative template checks,
 * and a full 486-topic compatibility sweep over the live repository.
 *
 * Run: npm test  (node --test scripts/topic-study-context.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  STUDY_CONTEXT_MOUNT_ID,
  PROGRESS_CHANGED_EVENT,
  TOPIC_MANIFEST_CANDIDATES,
  topicHrefFrom,
  buildStudyContextModel,
  renderStudyContext,
} from '../assets/topic-study-context.js';
import { createLearnerState, memoryStorage } from '../assets/learner-state.js';
import { buildTopicManifest } from './topic-manifest.js';
import { loadTopicSchema } from './topic-metadata.js';
import { loadCurriculum } from './curriculum.js';

function entry(overrides) {
  const base = {
    id: 'x', courseCode: 'C1', courseName: 'Course One', module: 1, moduleName: 'M1',
    sequence: 1, title: 'X', filename: 'x.html', hasMetadata: true,
    difficulty: 'beginner', estimatedMinutes: 5, concepts: ['x concept'],
    learningObjectives: ['Do X'], tags: ['t'],
    prerequisites: [], examRelevance: 'medium', prerequisiteDepth: 0,
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
    entry({ id: 'm1_03_c', title: 'Gamma', sequence: 3, prerequisites: ['m1_01_a', 'm1_02_b'], prerequisiteDepth: 2, module: 1 }),
    entry({ id: 'm2_01_l', title: 'Lambda', module: 2, moduleName: 'M2', sequence: 1 }),
  ],
};

const none = () => 'not_started';
const readerFrom = (map) => (course, id) => map[`${course}/${id}`];

describe('static URL generation', () => {
  it('links same-course siblings relatively and climbs otherwise', () => {
    assert.equal(topicHrefFrom('C1', { courseCode: 'C1', id: 'm1_02_b' }), './m1_02_b.html');
    assert.equal(topicHrefFrom('C1', { courseCode: 'C2', id: 'm1_01_z' }), '../C2/m1_01_z.html');
    assert.equal(topicHrefFrom('C1', null), '#');
    assert.equal(topicHrefFrom('C1', { id: 'm1_02_b' }), './m1_02_b.html');
  });
});

describe('root topic context', () => {
  it('represents no-prerequisite state explicitly, not as an empty list', () => {
    const model = buildStudyContextModel(fixture, none, 'C1', 'm1_01_a');
    assert.ok(model && model.isRoot && !model.isLeaf);
    assert.deepEqual(model.prereqs, []);
    assert.deepEqual(model.prereqCompletion, { completed: 0, total: 0, percent: 100 });
    assert.equal(model.remainingDependencies, 0);
    assert.equal(model.depth, 0);
    const html = renderStudyContext(model);
    assert.match(html, /start here/);
    assert.match(html, /None — this topic stands alone/);
  });
});

describe('topic with prerequisites', () => {
  it('splits completed vs incomplete with live states and counts', () => {
    const reader = readerFrom({ 'C1/m1_01_a': 'completed' });
    const model = buildStudyContextModel(fixture, reader, 'C1', 'm1_03_c');
    assert.equal(model.prereqs.length, 2);
    assert.deepEqual(model.prereqs.map((p) => p.state), ['completed', 'not_started']);
    assert.deepEqual(model.prereqCompletion, { completed: 1, total: 2, percent: 50 });
    assert.equal(model.remainingDependencies, 1);
    assert.equal(model.status, 'not_started');
    assert.ok(model.navigation.nextInModule === null && model.navigation.moduleLast.id === 'm1_03_c');
    const html = renderStudyContext(model);
    assert.match(html, /1\/2 complete/);
  });
});

describe('multi-ancestor chains and leaf states', () => {
  it('exposes the full chain, ancestor completion, and leaf flags', () => {
    const reader = readerFrom({ 'C1/m1_01_a': 'completed', 'C1/m1_02_b': 'completed' });
    const model = buildStudyContextModel(fixture, reader, 'C1', 'm1_03_c');
    assert.deepEqual(model.chain.map((t) => t.id), ['m1_01_a', 'm1_02_b', 'm1_03_c']);
    assert.ok(model.chain[2].current);
    assert.deepEqual(model.ancestorCompletion, { completed: 2, total: 2, percent: 100 });
    assert.equal(model.remainingDependencies, 0);
    assert.equal(model.isLeaf, true);
    assert.equal(buildStudyContextModel(fixture, reader, 'C1', 'm1_01_a').isLeaf, false);
  });
});

describe('navigation boundaries and invalid ids', () => {
  it('returns null neighbors at edges and null models for unknown topics', () => {
    const first = buildStudyContextModel(fixture, none, 'C1', 'm1_01_a');
    assert.equal(first.navigation.prev, null);
    assert.equal(first.navigation.prevInModule, null);
    assert.equal(first.navigation.next.id, 'm1_02_b');
    assert.equal(first.navigation.courseFirst.id, 'm1_01_a');
    assert.equal(first.navigation.courseLast.id, 'm2_01_l');
    assert.equal(first.navigation.moduleLast.id, 'm1_03_c');
    const last = buildStudyContextModel(fixture, none, 'C1', 'm2_01_l');
    assert.equal(last.navigation.next, null);
    assert.equal(last.navigation.nextInCourse, null);
    assert.equal(buildStudyContextModel(fixture, none, 'C1', 'nope'), null);
    assert.equal(buildStudyContextModel(fixture, none, 'NOPE', 'm1_01_a'), null);
    assert.equal(renderStudyContext(null), '');
  });
});

describe('learner-state updates and next recommendation', () => {
  it('reflects completion immediately and advances the recommendation', () => {
    const store = createLearnerState({ manifest: fixture, storage: memoryStorage() });
    const reader = (c, id) => store.getTopicState(c, id).status;
    let model = buildStudyContextModel(fixture, reader, 'C1', 'm1_02_b');
    assert.equal(model.status, 'not_started');
    assert.equal(model.recommended.id, 'm1_01_a');
    store.markTopicCompleted('C1', 'm1_01_a');
    model = buildStudyContextModel(fixture, reader, 'C1', 'm1_02_b');
    assert.equal(model.status, 'not_started');
    assert.deepEqual(model.prereqCompletion, { completed: 1, total: 1, percent: 100 });
    assert.equal(model.recommended.id, 'm1_02_b');
    store.markTopicCompleted('C1', 'm1_02_b');
    model = buildStudyContextModel(fixture, reader, 'C1', 'm1_02_b');
    assert.equal(model.status, 'completed');
    const html = renderStudyContext(model);
    assert.match(html, /aria-pressed="true"/);
  });
});

describe('static template wiring', () => {
  const template = fs.readFileSync('templates/base.html', 'utf-8');

  it('mounts one hidden study-context section per topic page', () => {
    assert.match(template, new RegExp(`id="${STUDY_CONTEXT_MOUNT_ID}"`));
    assert.match(template, /<section class="ts-context"[^>]*hidden><\/section>/);
  });

  it('initializes the layer with template identity, no manifest inline', () => {
    assert.ok(template.includes('topic-study-context.js'));
    assert.ok(template.includes('initStudyContext'));
    assert.ok(template.includes('{{ course_code }}'));
    assert.ok(template.includes('{{ current_id }}'));
    assert.ok(!template.includes('topic-manifest.json'));
  });

  it('syncs progress both ways on the shared event name', () => {
    assert.ok(template.includes(`new CustomEvent('${PROGRESS_CHANGED_EVENT}'`), 'topic pages dispatch the unified progress event');
    assert.ok(template.includes(`document.addEventListener('${PROGRESS_CHANGED_EVENT}'`), 'topic pages listen for peer progress changes');
  });
});

describe('live 486-topic repository', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });

  it('builds a valid model for a root, a mid-chain, and a leaf topic', () => {
    const root = buildStudyContextModel(manifest, none, 'GAMAT301', 'm1_01_random_variables_pmf_cdf');
    assert.ok(root && root.isRoot && root.chain.length === 1);
    const mid = buildStudyContextModel(manifest, none, 'PCCST501', 'm1_07_domain_name_system_dns');
    assert.equal(mid.prereqs.length, 1);
    assert.equal(mid.chain.length, 7);
    assert.equal(mid.remainingDependencies, 6);
    const leaf = buildStudyContextModel(manifest, none, 'GXEST104', 'm2_09_m2_mixed_drill');
    assert.ok(leaf && leaf.isLeaf && leaf.chain.length === 10);
    for (const model of [root, mid, leaf]) {
      const html = renderStudyContext(model);
      assert.ok(html.includes('Study context') && html.includes('Continue learning'));
    }
  });

  it('models every topic with well-formed links and manifest agreement', () => {
    let checked = 0;
    for (const t of manifest.topics) {
      const model = buildStudyContextModel(manifest, none, t.courseCode, t.id);
      assert.ok(model, `${t.courseCode}/${t.id} has a model`);
      assert.equal(model.title, t.title);
      assert.equal(model.chain[model.chain.length - 1].id, t.id);
      for (const entry of [...model.prereqs, ...model.dependents, ...model.chain]) {
        assert.match(entry.href, /^(\.\/[A-Za-z0-9_]+\.html|\.\.\/[A-Za-z0-9]+\/[A-Za-z0-9_]+\.html|#)$/);
      }
      checked += 1;
    }
    assert.equal(checked, 486);
  });
});
