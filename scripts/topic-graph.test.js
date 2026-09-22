/**
 * Dependency-free tests for scripts/topic-graph.js (fixture-driven,
 * node:test + node:assert only — no test framework). Covers: valid
 * chains, missing prerequisites, self-references, circular chains,
 * cross-course references, legacy topics, later-sequence warnings,
 * orphans, plus a live-repo integration baseline.
 *
 * Run: npm test  (node --test scripts/topic-graph.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeTopicGraph,
  buildTopicGraph,
  findTopic,
} from './topic-graph.js';
import { loadTopicSchema } from './topic-metadata.js';
import { loadCurriculum } from './curriculum.js';

// --- Minimal fixture builders (same { nodes, edges } shape as the repo graph).

function metaNode(course, id, mod, seq, prereqs = []) {
  const key = `${course}/${id}`;
  return [key, {
    key, id, courseCode: course, module: mod, sequence: seq,
    filename: `${id}.md`, sourcePath: `content/${course}/${id}.md`,
    kind: 'metadata', hasMetadata: true, title: id,
    difficulty: 'beginner', estimatedMinutes: 5, concepts: [],
    prerequisites: prereqs, examRelevance: 'medium', tags: [], depth: null,
  }];
}

function legacyNode(course, id, mod, seq) {
  const key = `${course}/${id}`;
  return [key, {
    key, id, courseCode: course, module: mod, sequence: seq,
    filename: `${id}.md`, sourcePath: `content/${course}/${id}.md`,
    kind: 'legacy', hasMetadata: false, title: id,
    difficulty: null, estimatedMinutes: null, concepts: [],
    prerequisites: [], examRelevance: null, tags: [], depth: null,
  }];
}

const edge = (from, to, kind = 'internal') => ({ from, to, kind });
const graph = (nodeEntries, edges) => ({ nodes: new Map(nodeEntries), edges });

describe('valid prerequisite chain', () => {
  it('reports no errors and computes depths', () => {
    const g = graph([
      metaNode('C', 'm1_01_a', 1, 1, []),
      metaNode('C', 'm1_02_b', 1, 2, ['m1_01_a']),
      metaNode('C', 'm1_03_c', 1, 3, ['m1_02_b']),
    ], [
      edge('C/m1_02_b', 'C/m1_01_a'),
      edge('C/m1_03_c', 'C/m1_02_b'),
    ]);
    const a = analyzeTopicGraph(g);
    assert.deepEqual(a.errors, []);
    assert.deepEqual(a.warnings, []);
    assert.equal(g.nodes.get('C/m1_01_a').depth, 0);
    assert.equal(g.nodes.get('C/m1_02_b').depth, 1);
    assert.equal(g.nodes.get('C/m1_03_c').depth, 2);
    assert.equal(a.coverage.metadata, 3);
  });
});

describe('missing prerequisite', () => {
  it('is an error, never valid coverage', () => {
    const g = graph([metaNode('C', 'm1_02_b', 1, 2, ['m9_99_gone'])], [
      edge('C/m1_02_b', 'C/m9_99_gone', 'missing'),
    ]);
    const a = analyzeTopicGraph(g);
    assert.equal(a.errors.length, 1);
    assert.match(a.errors[0], /missing topic/);
  });
});

describe('self-reference', () => {
  it('is exactly one error', () => {
    const g = graph([metaNode('C', 'm1_01_a', 1, 1, ['m1_01_a'])], [
      edge('C/m1_01_a', 'C/m1_01_a'),
    ]);
    const a = analyzeTopicGraph(g);
    assert.equal(a.errors.length, 1);
    assert.match(a.errors[0], /references itself/);
  });
});

describe('circular dependency', () => {
  it('reports two- and three-node cycles as errors', () => {
    const g = graph([
      metaNode('C', 'm1_01_a', 1, 1, ['m1_02_b']),
      metaNode('C', 'm1_02_b', 1, 2, ['m1_01_a']),
      metaNode('C', 'm1_03_c', 1, 3, ['m1_04_d']),
      metaNode('C', 'm1_04_d', 1, 4, ['m1_05_e']),
      metaNode('C', 'm1_05_e', 1, 5, ['m1_03_c']),
    ], [
      edge('C/m1_01_a', 'C/m1_02_b'),
      edge('C/m1_02_b', 'C/m1_01_a'),
      edge('C/m1_03_c', 'C/m1_04_d'),
      edge('C/m1_04_d', 'C/m1_05_e'),
      edge('C/m1_05_e', 'C/m1_03_c'),
    ]);
    const a = analyzeTopicGraph(g);
    assert.equal(a.errors.filter((e) => e.startsWith('circular')).length, 2);
  });
});

describe('cross-course prerequisite', () => {
  it('warns without failing', () => {
    const g = graph([metaNode('C1', 'm1_02_b', 1, 2, ['m1_01_a'])], [
      { from: 'C1/m1_02_b', to: 'C2/m1_01_a', kind: 'cross-course', candidates: ['C2'] },
    ]);
    const a = analyzeTopicGraph(g);
    assert.deepEqual(a.errors, []);
    assert.equal(a.warnings.length, 1);
    assert.match(a.warnings[0], /resolves only in/);
  });
});

describe('legacy topic without metadata', () => {
  it('stays supported: no errors, no orphan warning, null depth', () => {
    const g = graph([
      legacyNode('C', 'm1_01_a', 1, 1),
      metaNode('C', 'm1_02_b', 1, 2, ['m1_01_a']),
    ], [edge('C/m1_02_b', 'C/m1_01_a')]);
    const a = analyzeTopicGraph(g);
    assert.deepEqual(a.errors, []);
    assert.deepEqual(a.warnings, []);
    assert.equal(g.nodes.get('C/m1_01_a').depth, null);
    assert.equal(g.nodes.get('C/m1_02_b').depth, 1);
    assert.equal(a.coverage.metadata, 1);
    assert.equal(a.coverage.total, 2);
  });
});

describe('later-sequence prerequisite', () => {
  it('warns without failing', () => {
    const g = graph([
      metaNode('C', 'm1_01_a', 1, 1, ['m1_02_b']),
      metaNode('C', 'm1_02_b', 1, 2, []),
    ], [edge('C/m1_01_a', 'C/m1_02_b')]);
    const a = analyzeTopicGraph(g);
    assert.deepEqual(a.errors, []);
    assert.equal(a.warnings.length, 1);
    assert.match(a.warnings[0], /later topic/);
  });
});

describe('orphan metadata topic', () => {
  it('warns without failing', () => {
    const g = graph([
      metaNode('C', 'm1_01_a', 1, 1, []),
      metaNode('C', 'm1_02_b', 1, 2, []),
    ], []);
    const a = analyzeTopicGraph(g);
    assert.deepEqual(a.errors, []);
    assert.equal(a.warnings.length, 2);
  });
});

describe('live repo graph', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const built = buildTopicGraph({ curriculumDoc, schema });
  const analysis = analyzeTopicGraph(built);

  it('discovers all 486 topics with 486 metadata-bearing', () => {
    assert.equal(built.nodes.size, 486);
    assert.equal(analysis.coverage.metadata, 486);
    assert.deepEqual(built.metadataErrors, []);
  });

  it('represents the GAMAT301 and PCCST501 chains', () => {
    const kinds = new Map(built.edges.map((e) => [`${e.from} -> ${e.to}`, e.kind]));
    assert.equal(kinds.get('GAMAT301/m1_06_expectation_functions_m1_drill -> GAMAT301/m1_05_joint_pmf_marginals_independence'), 'internal');
    assert.equal(kinds.get('PCCST501/m1_08_peer_to_peer_bittorrent -> PCCST501/m1_04_world_wide_web_and_http'), 'internal');
    assert.equal(kinds.get('GZPHT121/m2_04_newtons_rings_liquid_air_wedge_thickness -> GZPHT121/m2_03_newtons_rings_wavelength'), 'internal');
    assert.equal(kinds.get('PCCST303/m3_06_bfs_dfs_shortest_paths -> PCCST303/m1_05_queues_circular_deque'), 'internal');
    assert.equal(kinds.get('PCCST503/m4_05_boosting_adaboost -> PCCST503/m4_04_ensemble_bagging_random_forests'), 'internal');
    assert.equal(kinds.get('PCCST502/m2_04_divide_and_conquer_merge_sort_and_strassen -> PCCST502/m1_08_master_theorem_and_cases'), 'internal');
    assert.equal(kinds.get('PECST522/m2_05_a_star_optimal_search -> PECST522/m2_04_greedy_best_first_search'), 'internal');
    assert.equal(kinds.get('PCCST601/m4_03_codegen_control_calls -> PCCST601/m4_02_codegen_boolean_relational'), 'internal');
    assert.equal(kinds.get('PCCST602/m3_05_virtual_clusters_live_migration -> PCCST602/m2_01_cluster_objectives_issues'), 'internal');
    assert.equal(kinds.get('PBCST604/m4_05_pbl_project_guide -> PBCST604/m1_05_vapt_burp_metasploit'), 'internal');
    assert.equal(kinds.get('PECST632/m3_05_lstm_gru -> PECST632/m3_03_rnn_bptt'), 'internal');
    assert.equal(kinds.get('PECST637/m4_04_key_mgmt_pki -> PECST637/m3_06_diffie_hellman_mitm'), 'internal');
    assert.equal(kinds.get('PECST631/m4_05_pex_symbolic_put -> PECST631/m2_04_junit_automation'), 'internal');
    assert.equal(kinds.get('GXEST605/m4_04_pilot_scaling -> GXEST605/m4_03_prototyping_alpha_beta'), 'internal');
    assert.equal(kinds.get('OECST614/m4_05_resampling_bias_variance_tradeoff -> OECST614/m2_03_overfitting_lasso_ridge'), 'internal');
    assert.equal(kinds.get('PCCST501/m4_99_practice_lab_management_physical_drills -> PCCST501/m4_01_network_management_snmp_architecture'), 'internal');
    assert.equal(kinds.get('PCCST502/m1_99_practice_lab_asymptotics_and_recurrences -> PCCST502/m1_08_master_theorem_and_cases'), 'internal');
    assert.equal(analysis.edgeCount, 655);
  });

  it('computes chain depths', () => {
    assert.equal(built.nodes.get('GAMAT301/m1_01_random_variables_pmf_cdf').depth, 0);
    assert.equal(built.nodes.get('GAMAT301/m1_06_expectation_functions_m1_drill').depth, 2);
    assert.equal(built.nodes.get('PCCST501/m1_07_domain_name_system_dns').depth, 6);
    assert.equal(built.nodes.get('GXEST104/m2_09_m2_mixed_drill').depth, 8);
    assert.equal(built.nodes.get('GZPHT121/m2_07_module2_mixed_numerical_drill').depth, 4);
    assert.equal(built.nodes.get('PCCST303/m4_07_m4_mixed_drill').depth, 5);
    assert.equal(built.nodes.get('PCCST503/m3_02_multilayer_networks_backpropagation').depth, 4);
    assert.equal(built.nodes.get('PCCST502/m2_04_divide_and_conquer_merge_sort_and_strassen').depth, 5);
    assert.equal(built.nodes.get('PECST522/m2_05_a_star_optimal_search').depth, 8);
    assert.equal(built.nodes.get('PCCST601/m2_07_m2_mixed_drill').depth, 5);
    assert.equal(built.nodes.get('PCCST602/m3_06_m3_mixed_drill').depth, 5);
    assert.equal(built.nodes.get('PBCST604/m1_06_m1_mixed_drill').depth, 2);
    assert.equal(built.nodes.get('PECST632/m4_06_m4_mixed_drill').depth, 5);
    assert.equal(built.nodes.get('PECST637/m3_07_m3_mixed_drill').depth, 6);
    assert.equal(built.nodes.get('PECST631/m3_07_m3_mixed_drill').depth, 5);
    assert.equal(built.nodes.get('GXEST605/m4_07_drill_journal_guide').depth, 11);
    assert.equal(built.nodes.get('OECST614/m4_06_m4_mixed_drill').depth, 6);
    assert.equal(built.nodes.get('PCCST502/m1_99_practice_lab_asymptotics_and_recurrences').depth, 5);
    assert.equal(analysis.maxDepth, 19);
  });

  it('has zero errors and only the known intro-topic warnings', () => {
    assert.deepEqual(analysis.errors, []);
    // Self-contained intro topics with no relationships yet warn (never
    // fail); the set is pinned so new orphans get noticed.
    assert.deepEqual(analysis.warnings, [
      'metadata topic "GXEST104/m4_01_comm_fibre_block_diagrams" has no prerequisite relationships',
      'metadata topic "GXEST104/m4_04_instrumentation_dmm_generator" has no prerequisite relationships',
      'metadata topic "PCCST501/m4_05_transmission_media_guided_unguided" has no prerequisite relationships',
      'metadata topic "PCCST502/m1_00_module_overview" has no prerequisite relationships',
      'metadata topic "PCCST602/m1_02_iot_cps" has no prerequisite relationships',
    ]);
  });

  it('supports lookup by course and module', () => {
    const node = findTopic(built, 'PCCST501', 'm1_02_protocol_layering_and_osi_tcpip');
    assert.ok(node && node.hasMetadata && node.module === 1);
    assert.equal(findTopic(built, 'PCCST501', 'm9_99_missing'), null);
    assert.equal(built.byCourse.get('GAMAT301').length, 24);
    assert.equal(built.byModule.get('PCCST501:M1').length, 10);
  });
});
