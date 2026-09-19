/**
 * Dependency-free tests for scripts/topic-manifest.js (node:test +
 * node:assert only — no test framework). Covers: full/corrupt-free
 * manifest contents, both prerequisite chains, query APIs, search,
 * legacy preservation, determinism, and build-blocking on graph errors.
 *
 * Run: npm test  (node --test scripts/topic-graph.test.js scripts/topic-manifest.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTopicManifest,
  buildTopicManifestFromGraph,
  validateTopicManifest,
  getTopic,
  getCourseTopics,
  getModuleTopics,
  getPrerequisites,
  getDependents,
  getTopicsByDifficulty,
  getTopicsByExamRelevance,
  searchTopics,
} from './topic-manifest.js';
import { analyzeTopicGraph } from './topic-graph.js';
import { loadTopicSchema } from './topic-metadata.js';
import { loadCurriculum } from './curriculum.js';

const schema = loadTopicSchema();
const curriculumDoc = loadCurriculum();
const manifest = buildTopicManifest({ curriculumDoc, schema });

describe('manifest contents', () => {
  it('contains all 432 current topics', () => {
    assert.equal(manifest.topics.length, 432);
    assert.equal(manifest.aggregates.totalTopics, 432);
  });

  it('contains exactly 14 metadata topics', () => {
    assert.equal(manifest.topics.filter((t) => t.hasMetadata).length, 14);
    assert.equal(manifest.aggregates.metadataTopics, 14);
  });

  it('represents the GAMAT301 prerequisite chain correctly', () => {
    const ids = (topics) => topics.map((t) => t.id);
    assert.deepEqual(ids(getPrerequisites(manifest, 'GAMAT301', 'm1_02_expectation_mean_variance')),
      ['m1_01_random_variables_pmf_cdf']);
    assert.deepEqual(ids(getPrerequisites(manifest, 'GAMAT301', 'm1_06_expectation_functions_m1_drill')),
      ['m1_02_expectation_mean_variance', 'm1_05_joint_pmf_marginals_independence']);
    assert.equal(getTopic(manifest, 'GAMAT301', 'm1_06_expectation_functions_m1_drill').prerequisiteDepth, 2);
  });

  it('represents the PCCST501 prerequisite chain correctly', () => {
    const ids = (topics) => topics.map((t) => t.id);
    assert.deepEqual(ids(getPrerequisites(manifest, 'PCCST501', 'm1_08_peer_to_peer_bittorrent')),
      ['m1_04_world_wide_web_and_http', 'm1_05_file_transfer_protocol_ftp']);
    assert.equal(getTopic(manifest, 'PCCST501', 'm1_07_domain_name_system_dns').prerequisiteDepth, 5);
  });

  it('getDependents() reverses prerequisite edges', () => {
    const ids = getDependents(manifest, 'PCCST501', 'm1_01_internet_overview_and_network_edge').map((t) => t.id).sort();
    assert.deepEqual(ids, ['m1_02_protocol_layering_and_osi_tcpip', 'm1_03_application_layer_paradigms']);
    const gamat = getDependents(manifest, 'GAMAT301', 'm1_01_random_variables_pmf_cdf').map((t) => t.id).sort();
    assert.deepEqual(gamat, [
      'm1_02_expectation_mean_variance',
      'm1_03_binomial_distribution_problems',
      'm1_05_joint_pmf_marginals_independence',
    ]);
  });

  it('course/module queries return the expected topics', () => {
    assert.equal(getCourseTopics(manifest, 'GAMAT301').length, 24);
    assert.equal(getModuleTopics(manifest, 'PCCST501', 1).length, 9);
    assert.deepEqual(getCourseTopics(manifest, 'NOPE'), []);
    assert.deepEqual(getModuleTopics(manifest, 'GAMAT301', 9), []);
  });

  it('searches case-insensitively across title, concepts, tags, and id', () => {
    assert.ok(searchTopics(manifest, 'POISSON').some((t) => t.id === 'm1_04_poisson_distribution_binomial_limit'));
    assert.ok(searchTopics(manifest, 'BitTorrent').some((t) => t.id === 'm1_08_peer_to_peer_bittorrent'));
    assert.ok(searchTopics(manifest, 'markov').length > 0); // legacy titles included
    assert.deepEqual(searchTopics(manifest, '   '), []);
  });

  it('keeps legacy topics present with hasMetadata: false', () => {
    const legacy = getTopic(manifest, 'GAMAT301', 'm2_01_continuous_rv_pdf_cdf_expectation');
    assert.ok(legacy && legacy.hasMetadata === false);
    assert.equal(legacy.difficulty, null);
    assert.equal(legacy.prerequisiteDepth, null);
    assert.deepEqual(legacy.prerequisites, []);
    assert.ok(legacy.title.length > 0 && legacy.filename.endsWith('.md'));
  });

  it('is deterministic across builds', () => {
    const again = buildTopicManifest({ curriculumDoc, schema });
    assert.equal(JSON.stringify(again), JSON.stringify(manifest));
  });

  it('passes structural validation with graph agreement', () => {
    assert.deepEqual(validateTopicManifest(manifest), []);
  });
});

describe('graph errors prevent manifest generation', () => {
  it('throws when the graph has integrity errors', () => {
    const graph = {
      nodes: new Map([
        ['C/m1_01_a', {
          key: 'C/m1_01_a', id: 'm1_01_a', courseCode: 'C', module: 1, sequence: 1,
          filename: 'm1_01_a.md', sourcePath: 'content/C/m1_01_a.md', kind: 'metadata',
          hasMetadata: true, title: 'A', difficulty: 'beginner', estimatedMinutes: 5,
          concepts: [], prerequisites: ['m9_99_gone'], examRelevance: 'low', tags: [], depth: null,
        }],
      ]),
      edges: [{ from: 'C/m1_01_a', to: 'C/m9_99_gone', kind: 'missing' }],
    };
    const analysis = analyzeTopicGraph(graph);
    assert.ok(analysis.errors.length > 0);
    assert.throws(() => buildTopicManifestFromGraph(graph, analysis), /graph error/);
  });
});
