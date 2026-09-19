# Topic Metadata Migration Plan

Generated 2026-09-19 from the repository itself (`data/curriculum.json` + `content/**/*.md`; front-matter detected with the same first-line-`---` rule as `scripts/topic-metadata.js`). No topic files were modified to produce this plan, and no metadata values below are invented — per-topic fields (difficulty, exam relevance, prerequisites, estimated time) are filled in at migration time from each topic's actual content.

## Summary

- Total topics: **432**
- Migrated: **160**
- Pending: **272**
- Coverage: **37.04%** (tracked by `npm run check`)

## Migration rules

- Metadata is authoritative when present: a topic with a valid front-matter block carries its canonical `title`/`estimatedMinutes` in the build model.
- Legacy topics remain supported during migration: topics without front matter build exactly as before from filename/content-derived values; metadata is never mandatory until the migration completes.
- Invalid front matter must fail QA: `npm run check` validates every front-matter block against `data/topic-schema.json` and fails the gate on any violation.
- Metadata coverage is tracked by `npm run check`, which prints `metadata coverage: X/432 topics (Y%)` with per-course and per-module breakdowns on every run.

## Recommended migration order

1. Finish the started modules first (both pilots sit in Module 1):
   - PCCST503 — Module 1 in progress (19 migrated); complete its remaining Module 1 topics in sequence order, then Modules 2-4.
   - PCCST303 — Module 1 in progress (27 migrated); complete its remaining Module 1 topics in sequence order, then Modules 2-4.
   - GZPHT121 — Module 1 in progress (26 migrated); complete its remaining Module 1 topics in sequence order, then Modules 2-4.
   - GXEST104 — Module 1 in progress (33 migrated); complete its remaining Module 1 topics in sequence order, then Modules 2-4.
   - GAMAT301 — Module 1 in progress (24 migrated); complete its remaining Module 1 topics in sequence order, then Modules 2-4.
   - PCCST501 — Module 1 in progress (31 migrated); complete its remaining Module 1 topics in sequence order, then Modules 2-4.
2. Then proceed course-by-course in dashboard order (module by module, sequence order within each module):
   1. PCCST503 — Machine Learning (started — see step 1)
   2. PCCST303 — Data Structures and Algorithms (started — see step 1)
   3. GZPHT121 — Physics for Physical Science and Life Science (started — see step 1)
   4. GXEST104 — Introduction to Electrical and Electronics Engineering (started — see step 1)
   5. GAMAT301 — Mathematics for Computer and Information Science-3 (started — see step 1)
   6. PCCST501 — Computer Networks (started — see step 1)
   7. PCCST502 — Design and Analysis of Algorithms
   8. PECST522 — Artificial Intelligence
   9. PCCST601 — Compiler Design
   10. PCCST602 — Advanced Computing Systems
   11. PBCST604 — Fundamentals of Cyber Security
   12. PECST632 — Deep Learning
   13. PECST637 — Fundamentals of Cryptography
   14. PECST631 — Software Testing
   15. GXEST605 — Design Thinking and Product Development
   16. OECST614 — Machine Learning for Engineers
3. Preserve prerequisite ordering: migrate in increasing `(module, sequence)` order so any `prerequisites` reference points at an already-migrated (or concurrently reviewed) topic; module `00` overviews before their numbered topics, `99` practice labs last.

## PCCST503 — Machine Learning (19/23 migrated)

| Module | Sequence | Filename | Topic ID | Status |
| --- | --- | --- | --- | --- |
| M1 Foundations & Regression | 01 | `m1_01_ml_definition_paradigms_and_types.md` | `m1_01_ml_definition_paradigms_and_types` | migrated |
| M1 Foundations & Regression | 02 | `m1_02_probability_mle_map_estimation.md` | `m1_02_probability_mle_map_estimation` | migrated |
| M1 Foundations & Regression | 03 | `m1_03_linear_regression_least_squares.md` | `m1_03_linear_regression_least_squares` | migrated |
| M1 Foundations & Regression | 04 | `m1_04_multiple_regression_model_assessment.md` | `m1_04_multiple_regression_model_assessment` | migrated |
| M1 Foundations & Regression | 99 | `m1_99_practice_lab_foundations_drills.md` | `m1_99_practice_lab_foundations_drills` | pending |
| M2 Classification & Trees | 01 | `m2_01_classification_boundaries_knn.md` | `m2_01_classification_boundaries_knn` | migrated |
| M2 Classification & Trees | 02 | `m2_02_logistic_regression_sigmoid_loss.md` | `m2_02_logistic_regression_sigmoid_loss` | migrated |
| M2 Classification & Trees | 03 | `m2_03_naive_bayes_generative_models.md` | `m2_03_naive_bayes_generative_models` | migrated |
| M2 Classification & Trees | 04 | `m2_04_decision_trees_entropy_information_gain.md` | `m2_04_decision_trees_entropy_information_gain` | migrated |
| M2 Classification & Trees | 05 | `m2_05_gradient_descent_training_engine.md` | `m2_05_gradient_descent_training_engine` | migrated |
| M2 Classification & Trees | 99 | `m2_99_practice_lab_classification_drills.md` | `m2_99_practice_lab_classification_drills` | pending |
| M3 Neural Nets & SVMs | 01 | `m3_01_perceptron_learning_rule.md` | `m3_01_perceptron_learning_rule` | migrated |
| M3 Neural Nets & SVMs | 02 | `m3_02_multilayer_networks_backpropagation.md` | `m3_02_multilayer_networks_backpropagation` | migrated |
| M3 Neural Nets & SVMs | 03 | `m3_03_maximum_margin_svm.md` | `m3_03_maximum_margin_svm` | migrated |
| M3 Neural Nets & SVMs | 04 | `m3_04_kernels_soft_margins.md` | `m3_04_kernels_soft_margins` | migrated |
| M3 Neural Nets & SVMs | 99 | `m3_99_practice_lab_networks_svm_drills.md` | `m3_99_practice_lab_networks_svm_drills` | pending |
| M4 PCA & Ensembles | 01 | `m4_01_clustering_kmeans.md` | `m4_01_clustering_kmeans` | migrated |
| M4 PCA & Ensembles | 02 | `m4_02_hierarchical_clustering.md` | `m4_02_hierarchical_clustering` | migrated |
| M4 PCA & Ensembles | 03 | `m4_03_pca_dimensionality_reduction.md` | `m4_03_pca_dimensionality_reduction` | migrated |
| M4 PCA & Ensembles | 04 | `m4_04_ensemble_bagging_random_forests.md` | `m4_04_ensemble_bagging_random_forests` | migrated |
| M4 PCA & Ensembles | 05 | `m4_05_boosting_adaboost.md` | `m4_05_boosting_adaboost` | migrated |
| M4 PCA & Ensembles | 06 | `m4_06_mds_multidimensional_scaling.md` | `m4_06_mds_multidimensional_scaling` | migrated |
| M4 PCA & Ensembles | 99 | `m4_99_practice_lab_unsupervised_ensemble_drills.md` | `m4_99_practice_lab_unsupervised_ensemble_drills` | pending |

## PCCST303 — Data Structures and Algorithms (27/27 migrated)

| Module | Sequence | Filename | Topic ID | Status |
| --- | --- | --- | --- | --- |
| M1 Basic Concepts, Stacks & Queues | 01 | `m1_01_data_structures_adt_abstraction.md` | `m1_01_data_structures_adt_abstraction` | migrated |
| M1 Basic Concepts, Stacks & Queues | 02 | `m1_02_complexity_asymptotic_notations.md` | `m1_02_complexity_asymptotic_notations` | migrated |
| M1 Basic Concepts, Stacks & Queues | 03 | `m1_03_polynomial_sparse_matrix_arrays.md` | `m1_03_polynomial_sparse_matrix_arrays` | migrated |
| M1 Basic Concepts, Stacks & Queues | 04 | `m1_04_stacks_multistacks_applications.md` | `m1_04_stacks_multistacks_applications` | migrated |
| M1 Basic Concepts, Stacks & Queues | 05 | `m1_05_queues_circular_deque.md` | `m1_05_queues_circular_deque` | migrated |
| M1 Basic Concepts, Stacks & Queues | 06 | `m1_06_infix_postfix_evaluation.md` | `m1_06_infix_postfix_evaluation` | migrated |
| M1 Basic Concepts, Stacks & Queues | 07 | `m1_07_m1_mixed_drill.md` | `m1_07_m1_mixed_drill` | migrated |
| M2 Linked Lists & Memory Management | 01 | `m2_01_singly_linked_list_operations.md` | `m2_01_singly_linked_list_operations` | migrated |
| M2 Linked Lists & Memory Management | 02 | `m2_02_stacks_queues_polynomial_linked.md` | `m2_02_stacks_queues_polynomial_linked` | migrated |
| M2 Linked Lists & Memory Management | 03 | `m2_03_doubly_linked_list.md` | `m2_03_doubly_linked_list` | migrated |
| M2 Linked Lists & Memory Management | 04 | `m2_04_circular_linked_list_variations.md` | `m2_04_circular_linked_list_variations` | migrated |
| M2 Linked Lists & Memory Management | 05 | `m2_05_memory_allocation_fits.md` | `m2_05_memory_allocation_fits` | migrated |
| M2 Linked Lists & Memory Management | 06 | `m2_06_garbage_compaction_m2_drill.md` | `m2_06_garbage_compaction_m2_drill` | migrated |
| M3 Trees, Heaps & Graphs | 01 | `m3_01_trees_binary_foundations.md` | `m3_01_trees_binary_foundations` | migrated |
| M3 Trees, Heaps & Graphs | 02 | `m3_02_traversals_operations.md` | `m3_02_traversals_operations` | migrated |
| M3 Trees, Heaps & Graphs | 03 | `m3_03_expression_trees_bst.md` | `m3_03_expression_trees_bst` | migrated |
| M3 Trees, Heaps & Graphs | 04 | `m3_04_binary_heaps_priority_queue.md` | `m3_04_binary_heaps_priority_queue` | migrated |
| M3 Trees, Heaps & Graphs | 05 | `m3_05_graphs_definitions_representation.md` | `m3_05_graphs_definitions_representation` | migrated |
| M3 Trees, Heaps & Graphs | 06 | `m3_06_bfs_dfs_shortest_paths.md` | `m3_06_bfs_dfs_shortest_paths` | migrated |
| M3 Trees, Heaps & Graphs | 07 | `m3_07_m3_mixed_drill.md` | `m3_07_m3_mixed_drill` | migrated |
| M4 Sorting, Searching & Hashing | 01 | `m4_01_selection_insertion_sort.md` | `m4_01_selection_insertion_sort` | migrated |
| M4 Sorting, Searching & Hashing | 02 | `m4_02_quick_sort_analysis.md` | `m4_02_quick_sort_analysis` | migrated |
| M4 Sorting, Searching & Hashing | 03 | `m4_03_merge_heap_sort.md` | `m4_03_merge_heap_sort` | migrated |
| M4 Sorting, Searching & Hashing | 04 | `m4_04_radix_sort_comparison_drill.md` | `m4_04_radix_sort_comparison_drill` | migrated |
| M4 Sorting, Searching & Hashing | 05 | `m4_05_linear_binary_search.md` | `m4_05_linear_binary_search` | migrated |
| M4 Sorting, Searching & Hashing | 06 | `m4_06_hashing_functions_collisions.md` | `m4_06_hashing_functions_collisions` | migrated |
| M4 Sorting, Searching & Hashing | 07 | `m4_07_m4_mixed_drill.md` | `m4_07_m4_mixed_drill` | migrated |

## GZPHT121 — Physics for Physical Science and Life Science (26/26 migrated)

| Module | Sequence | Filename | Topic ID | Status |
| --- | --- | --- | --- | --- |
| M1 Laser & Fibre Optics | 01 | `m1_01_optical_processes_absorption_spontaneous_stimulated.md` | `m1_01_optical_processes_absorption_spontaneous_stimulated` | migrated |
| M1 Laser & Fibre Optics | 02 | `m1_02_laser_principle_population_inversion_pumping.md` | `m1_02_laser_principle_population_inversion_pumping` | migrated |
| M1 Laser & Fibre Optics | 03 | `m1_03_ruby_co2_semiconductor_lasers.md` | `m1_03_ruby_co2_semiconductor_lasers` | migrated |
| M1 Laser & Fibre Optics | 04 | `m1_04_optical_fibre_types_propagation.md` | `m1_04_optical_fibre_types_propagation` | migrated |
| M1 Laser & Fibre Optics | 05 | `m1_05_numerical_aperture_acceptance_angle_problems.md` | `m1_05_numerical_aperture_acceptance_angle_problems` | migrated |
| M1 Laser & Fibre Optics | 06 | `m1_06_fibre_communication_block_diagram_drill.md` | `m1_06_fibre_communication_block_diagram_drill` | migrated |
| M2 Interference & Diffraction | 01 | `m2_01_superposition_path_difference_cosine_law.md` | `m2_01_superposition_path_difference_cosine_law` | migrated |
| M2 Interference & Diffraction | 02 | `m2_02_thin_films_colours_wedge_fringes.md` | `m2_02_thin_films_colours_wedge_fringes` | migrated |
| M2 Interference & Diffraction | 03 | `m2_03_newtons_rings_wavelength.md` | `m2_03_newtons_rings_wavelength` | migrated |
| M2 Interference & Diffraction | 04 | `m2_04_newtons_rings_liquid_air_wedge_thickness.md` | `m2_04_newtons_rings_liquid_air_wedge_thickness` | migrated |
| M2 Interference & Diffraction | 05 | `m2_05_single_slit_diffraction_width.md` | `m2_05_single_slit_diffraction_width` | migrated |
| M2 Interference & Diffraction | 06 | `m2_06_diffraction_grating_equation_powers.md` | `m2_06_diffraction_grating_equation_powers` | migrated |
| M2 Interference & Diffraction | 07 | `m2_07_module2_mixed_numerical_drill.md` | `m2_07_module2_mixed_numerical_drill` | migrated |
| M3 Quantum Mechanics | 01 | `m3_01_uncertainty_principle_conjugate_observables.md` | `m3_01_uncertainty_principle_conjugate_observables` | migrated |
| M3 Quantum Mechanics | 02 | `m3_02_uncertainty_applications_nucleus_broadening.md` | `m3_02_uncertainty_applications_nucleus_broadening` | migrated |
| M3 Quantum Mechanics | 03 | `m3_03_wavefunction_schrodinger_equations.md` | `m3_03_wavefunction_schrodinger_equations` | migrated |
| M3 Quantum Mechanics | 04 | `m3_04_particle_in_box_derivation.md` | `m3_04_particle_in_box_derivation` | migrated |
| M3 Quantum Mechanics | 05 | `m3_05_box_numericals_energy_probability.md` | `m3_05_box_numericals_energy_probability` | migrated |
| M3 Quantum Mechanics | 06 | `m3_06_quantum_tunnelling_concept_drill.md` | `m3_06_quantum_tunnelling_concept_drill` | migrated |
| M4 Waves & Acoustics | 01 | `m4_01_wave_types_frequency_wavelength.md` | `m4_01_wave_types_frequency_wavelength` | migrated |
| M4 Waves & Acoustics | 02 | `m4_02_stretched_string_velocity_laws.md` | `m4_02_stretched_string_velocity_laws` | migrated |
| M4 Waves & Acoustics | 03 | `m4_03_reverberation_sabine_hall_acoustics.md` | `m4_03_reverberation_sabine_hall_acoustics` | migrated |
| M4 Waves & Acoustics | 04 | `m4_04_sabine_numerical_drill.md` | `m4_04_sabine_numerical_drill` | migrated |
| M4 Waves & Acoustics | 05 | `m4_05_ultrasonics_piezoelectric_diffractometer.md` | `m4_05_ultrasonics_piezoelectric_diffractometer` | migrated |
| M4 Waves & Acoustics | 06 | `m4_06_sonar_ndt_pulse_echo.md` | `m4_06_sonar_ndt_pulse_echo` | migrated |
| M4 Waves & Acoustics | 07 | `m4_07_medical_ultrasound_revision_drill.md` | `m4_07_medical_ultrasound_revision_drill` | migrated |

## GXEST104 — Introduction to Electrical and Electronics Engineering (33/33 migrated)

| Module | Sequence | Filename | Topic ID | Status |
| --- | --- | --- | --- | --- |
| M1 DC Circuits & Magnetic Circuits | 01 | `m1_01_ohms_kcl_kvl.md` | `m1_01_ohms_kcl_kvl` | migrated |
| M1 DC Circuits & Magnetic Circuits | 02 | `m1_02_voltage_current_division_relative_potential.md` | `m1_02_voltage_current_division_relative_potential` | migrated |
| M1 DC Circuits & Magnetic Circuits | 03 | `m1_03_capacitors_inductors_energy.md` | `m1_03_capacitors_inductors_energy` | migrated |
| M1 DC Circuits & Magnetic Circuits | 04 | `m1_04_star_delta_conversion.md` | `m1_04_star_delta_conversion` | migrated |
| M1 DC Circuits & Magnetic Circuits | 05 | `m1_05_mesh_analysis_matrices.md` | `m1_05_mesh_analysis_matrices` | migrated |
| M1 DC Circuits & Magnetic Circuits | 06 | `m1_06_nodal_analysis_matrices.md` | `m1_06_nodal_analysis_matrices` | migrated |
| M1 DC Circuits & Magnetic Circuits | 07 | `m1_07_magnetic_circuits_basics.md` | `m1_07_magnetic_circuits_basics` | migrated |
| M1 DC Circuits & Magnetic Circuits | 08 | `m1_08_composite_parallel_magnetic.md` | `m1_08_composite_parallel_magnetic` | migrated |
| M1 DC Circuits & Magnetic Circuits | 09 | `m1_09_mixed_drill.md` | `m1_09_mixed_drill` | migrated |
| M2 EMI, AC & Three-Phase Systems | 01 | `m2_01_emi_faraday_lenz_inductance.md` | `m2_01_emi_faraday_lenz_inductance` | migrated |
| M2 EMI, AC & Three-Phase Systems | 02 | `m2_02_ac_fundamentals_rms_average.md` | `m2_02_ac_fundamentals_rms_average` | migrated |
| M2 EMI, AC & Three-Phase Systems | 03 | `m2_03_phasors_forms_operations.md` | `m2_03_phasors_forms_operations` | migrated |
| M2 EMI, AC & Three-Phase Systems | 04 | `m2_04_pure_r_l_c_circuits.md` | `m2_04_pure_r_l_c_circuits` | migrated |
| M2 EMI, AC & Three-Phase Systems | 05 | `m2_05_rl_rc_rlc_series.md` | `m2_05_rl_rc_rlc_series` | migrated |
| M2 EMI, AC & Three-Phase Systems | 06 | `m2_06_series_resonance_q_factor_bandwidth.md` | `m2_06_series_resonance_q_factor_bandwidth` | migrated |
| M2 EMI, AC & Three-Phase Systems | 07 | `m2_07_ac_power_pf_correction.md` | `m2_07_ac_power_pf_correction` | migrated |
| M2 EMI, AC & Three-Phase Systems | 08 | `m2_08_three_phase_star_delta.md` | `m2_08_three_phase_star_delta` | migrated |
| M2 EMI, AC & Three-Phase Systems | 09 | `m2_09_m2_mixed_drill.md` | `m2_09_m2_mixed_drill` | migrated |
| M3 Electronic Devices & Circuits | 01 | `m3_01_passive_active_pn_diode.md` | `m3_01_passive_active_pn_diode` | migrated |
| M3 Electronic Devices & Circuits | 02 | `m3_02_zener_avalanche_regulator.md` | `m3_02_zener_avalanche_regulator` | migrated |
| M3 Electronic Devices & Circuits | 03 | `m3_03_dc_supply_rectifiers.md` | `m3_03_dc_supply_rectifiers` | migrated |
| M3 Electronic Devices & Circuits | 04 | `m3_04_ripple_factor_filters.md` | `m3_04_ripple_factor_filters` | migrated |
| M3 Electronic Devices & Circuits | 05 | `m3_05_bjt_construction_characteristics.md` | `m3_05_bjt_construction_characteristics` | migrated |
| M3 Electronic Devices & Circuits | 06 | `m3_06_configs_biasing_loadline.md` | `m3_06_configs_biasing_loadline` | migrated |
| M3 Electronic Devices & Circuits | 07 | `m3_07_switch_amplifier.md` | `m3_07_switch_amplifier` | migrated |
| M3 Electronic Devices & Circuits | 08 | `m3_08_rc_coupled_fet_mosfet.md` | `m3_08_rc_coupled_fet_mosfet` | migrated |
| M3 Electronic Devices & Circuits | 09 | `m3_09_m3_mixed_drill.md` | `m3_09_m3_mixed_drill` | migrated |
| M4 Modern Electronics & Applications | 01 | `m4_01_comm_fibre_block_diagrams.md` | `m4_01_comm_fibre_block_diagrams` | migrated |
| M4 Modern Electronics & Applications | 02 | `m4_02_am_fm_superhet.md` | `m4_02_am_fm_superhet` | migrated |
| M4 Modern Electronics & Applications | 03 | `m4_03_wired_wireless_gsm_generations.md` | `m4_03_wired_wireless_gsm_generations` | migrated |
| M4 Modern Electronics & Applications | 04 | `m4_04_instrumentation_dmm_generator.md` | `m4_04_instrumentation_dmm_generator` | migrated |
| M4 Modern Electronics & Applications | 05 | `m4_05_cro_lissajous.md` | `m4_05_cro_lissajous` | migrated |
| M4 Modern Electronics & Applications | 06 | `m4_06_iot_case_studies_revision.md` | `m4_06_iot_case_studies_revision` | migrated |

## GAMAT301 — Mathematics for Computer and Information Science-3 (24/24 migrated)

| Module | Sequence | Filename | Topic ID | Status |
| --- | --- | --- | --- | --- |
| M1 Discrete Random Variables | 01 | `m1_01_random_variables_pmf_cdf.md` | `m1_01_random_variables_pmf_cdf` | migrated |
| M1 Discrete Random Variables | 02 | `m1_02_expectation_mean_variance.md` | `m1_02_expectation_mean_variance` | migrated |
| M1 Discrete Random Variables | 03 | `m1_03_binomial_distribution_problems.md` | `m1_03_binomial_distribution_problems` | migrated |
| M1 Discrete Random Variables | 04 | `m1_04_poisson_distribution_binomial_limit.md` | `m1_04_poisson_distribution_binomial_limit` | migrated |
| M1 Discrete Random Variables | 05 | `m1_05_joint_pmf_marginals_independence.md` | `m1_05_joint_pmf_marginals_independence` | migrated |
| M1 Discrete Random Variables | 06 | `m1_06_expectation_functions_m1_drill.md` | `m1_06_expectation_functions_m1_drill` | migrated |
| M2 Continuous Random Variables | 01 | `m2_01_continuous_rv_pdf_cdf_expectation.md` | `m2_01_continuous_rv_pdf_cdf_expectation` | migrated |
| M2 Continuous Random Variables | 02 | `m2_02_uniform_distribution_problems.md` | `m2_02_uniform_distribution_problems` | migrated |
| M2 Continuous Random Variables | 03 | `m2_03_normal_distribution_standardisation.md` | `m2_03_normal_distribution_standardisation` | migrated |
| M2 Continuous Random Variables | 04 | `m2_04_exponential_distribution_memoryless.md` | `m2_04_exponential_distribution_memoryless` | migrated |
| M2 Continuous Random Variables | 05 | `m2_05_joint_pdf_marginals_independence.md` | `m2_05_joint_pdf_marginals_independence` | migrated |
| M2 Continuous Random Variables | 06 | `m2_06_m2_mixed_drill_model_selection.md` | `m2_06_m2_mixed_drill_model_selection` | migrated |
| M3 Limit Theorems & Stochastic Processes | 01 | `m3_01_markov_chebyshev_inequalities.md` | `m3_01_markov_chebyshev_inequalities` | migrated |
| M3 Limit Theorems & Stochastic Processes | 02 | `m3_02_slln_clt_approximations.md` | `m3_02_slln_clt_approximations` | migrated |
| M3 Limit Theorems & Stochastic Processes | 03 | `m3_03_stochastic_counting_processes.md` | `m3_03_stochastic_counting_processes` | migrated |
| M3 Limit Theorems & Stochastic Processes | 04 | `m3_04_poisson_process_interarrival.md` | `m3_04_poisson_process_interarrival` | migrated |
| M3 Limit Theorems & Stochastic Processes | 05 | `m3_05_poisson_process_drill.md` | `m3_05_poisson_process_drill` | migrated |
| M3 Limit Theorems & Stochastic Processes | 06 | `m3_06_m3_mixed_drill.md` | `m3_06_m3_mixed_drill` | migrated |
| M4 Markov Chains | 01 | `m4_01_markov_chains_transition_matrix.md` | `m4_01_markov_chains_transition_matrix` | migrated |
| M4 Markov Chains | 02 | `m4_02_random_walk_gambler_ruin.md` | `m4_02_random_walk_gambler_ruin` | migrated |
| M4 Markov Chains | 03 | `m4_03_chapman_kolmogorov_equations.md` | `m4_03_chapman_kolmogorov_equations` | migrated |
| M4 Markov Chains | 04 | `m4_04_classification_states_irreducible_recurrent.md` | `m4_04_classification_states_irreducible_recurrent` | migrated |
| M4 Markov Chains | 05 | `m4_05_long_run_stationary_distribution.md` | `m4_05_long_run_stationary_distribution` | migrated |
| M4 Markov Chains | 06 | `m4_06_m4_mixed_drill.md` | `m4_06_m4_mixed_drill` | migrated |

## PCCST501 — Computer Networks (31/36 migrated)

| Module | Sequence | Filename | Topic ID | Status |
| --- | --- | --- | --- | --- |
| M1 Application Layer | 01 | `m1_01_internet_overview_and_network_edge.md` | `m1_01_internet_overview_and_network_edge` | migrated |
| M1 Application Layer | 02 | `m1_02_protocol_layering_and_osi_tcpip.md` | `m1_02_protocol_layering_and_osi_tcpip` | migrated |
| M1 Application Layer | 03 | `m1_03_application_layer_paradigms.md` | `m1_03_application_layer_paradigms` | migrated |
| M1 Application Layer | 04 | `m1_04_world_wide_web_and_http.md` | `m1_04_world_wide_web_and_http` | migrated |
| M1 Application Layer | 05 | `m1_05_file_transfer_protocol_ftp.md` | `m1_05_file_transfer_protocol_ftp` | migrated |
| M1 Application Layer | 06 | `m1_06_electronic_mail_smtp_pop3_imap.md` | `m1_06_electronic_mail_smtp_pop3_imap` | migrated |
| M1 Application Layer | 07 | `m1_07_domain_name_system_dns.md` | `m1_07_domain_name_system_dns` | migrated |
| M1 Application Layer | 08 | `m1_08_peer_to_peer_bittorrent.md` | `m1_08_peer_to_peer_bittorrent` | migrated |
| M1 Application Layer | 99 | `m1_99_practice_lab_application_layer_drills.md` | `m1_99_practice_lab_application_layer_drills` | pending |
| M2 Transport & Network Layer | 01 | `m2_01_transport_layer_services_and_multiplexing.md` | `m2_01_transport_layer_services_and_multiplexing` | migrated |
| M2 Transport & Network Layer | 02 | `m2_02_udp_segment_structure_and_checksum.md` | `m2_02_udp_segment_structure_and_checksum` | migrated |
| M2 Transport & Network Layer | 03 | `m2_03_tcp_segment_structure_and_rtt.md` | `m2_03_tcp_segment_structure_and_rtt` | migrated |
| M2 Transport & Network Layer | 04 | `m2_04_reliable_transfer_gbn_and_sr.md` | `m2_04_reliable_transfer_gbn_and_sr` | migrated |
| M2 Transport & Network Layer | 05 | `m2_05_tcp_flow_control_and_connection_management.md` | `m2_05_tcp_flow_control_and_connection_management` | migrated |
| M2 Transport & Network Layer | 06 | `m2_06_congestion_control_principles_and_tcp.md` | `m2_06_congestion_control_principles_and_tcp` | migrated |
| M2 Transport & Network Layer | 07 | `m2_07_multicast_routing_trees_rpf.md` | `m2_07_multicast_routing_trees_rpf` | migrated |
| M2 Transport & Network Layer | 08 | `m2_08_quality_of_service_qos_mechanisms.md` | `m2_08_quality_of_service_qos_mechanisms` | migrated |
| M2 Transport & Network Layer | 09 | `m2_09_ipv4_addressing_forwarding_nat_icmp.md` | `m2_09_ipv4_addressing_forwarding_nat_icmp` | migrated |
| M2 Transport & Network Layer | 10 | `m2_10_unicast_routing_link_state_distance_vector.md` | `m2_10_unicast_routing_link_state_distance_vector` | migrated |
| M2 Transport & Network Layer | 11 | `m2_11_ipv6_next_generation_transition.md` | `m2_11_ipv6_next_generation_transition` | migrated |
| M2 Transport & Network Layer | 99 | `m2_99_practice_lab_transport_drills.md` | `m2_99_practice_lab_transport_drills` | pending |
| M3 Data Link Layer | 01 | `m3_01_datalink_layer_services_and_framing.md` | `m3_01_datalink_layer_services_and_framing` | migrated |
| M3 Data Link Layer | 02 | `m3_02_error_detection_crc_checksums_parity.md` | `m3_02_error_detection_crc_checksums_parity` | migrated |
| M3 Data Link Layer | 03 | `m3_03_multiple_access_protocols.md` | `m3_03_multiple_access_protocols` | migrated |
| M3 Data Link Layer | 04 | `m3_04_lan_addressing_arp_switches_and_vlans.md` | `m3_04_lan_addressing_arp_switches_and_vlans` | migrated |
| M3 Data Link Layer | 05 | `m3_05_wireless_lan_802_11.md` | `m3_05_wireless_lan_802_11` | migrated |
| M3 Data Link Layer | 06 | `m3_06_mobile_ip_agents_tunneling.md` | `m3_06_mobile_ip_agents_tunneling` | migrated |
| M3 Data Link Layer | 99 | `m3_99_practice_lab_datalink_drills.md` | `m3_99_practice_lab_datalink_drills` | pending |
| M4 Physical Layer & SNMP | 01 | `m4_01_network_management_snmp_architecture.md` | `m4_01_network_management_snmp_architecture` | migrated |
| M4 Physical Layer & SNMP | 02 | `m4_02_nyquist_shannon_channel_capacity.md` | `m4_02_nyquist_shannon_channel_capacity` | migrated |
| M4 Physical Layer & SNMP | 03 | `m4_03_pcm_digitization_sampling_quantization.md` | `m4_03_pcm_digitization_sampling_quantization` | migrated |
| M4 Physical Layer & SNMP | 04 | `m4_04_modulation_ask_fsk_psk_qam.md` | `m4_04_modulation_ask_fsk_psk_qam` | migrated |
| M4 Physical Layer & SNMP | 05 | `m4_05_transmission_media_guided_unguided.md` | `m4_05_transmission_media_guided_unguided` | migrated |
| M4 Physical Layer & SNMP | 06 | `m4_06_bandwidth_utilization_multiplexing_spread.md` | `m4_06_bandwidth_utilization_multiplexing_spread` | migrated |
| M4 Physical Layer & SNMP | 07 | `m4_07_asn1_smi_mib_language.md` | `m4_07_asn1_smi_mib_language` | pending |
| M4 Physical Layer & SNMP | 99 | `m4_99_practice_lab_management_physical_drills.md` | `m4_99_practice_lab_management_physical_drills` | pending |

## PCCST502 — Design and Analysis of Algorithms (0/31 migrated)

| Module | Sequence | Filename | Topic ID | Status |
| --- | --- | --- | --- | --- |
| M1 Analysis & Recurrences | 00 | `m1_00_module_overview.md` | `m1_00_module_overview` | pending |
| M1 Analysis & Recurrences | 01 | `m1_01_algorithm_definition_and_criteria.md` | `m1_01_algorithm_definition_and_criteria` | pending |
| M1 Analysis & Recurrences | 02 | `m1_02_time_space_complexity_best_worst_average.md` | `m1_02_time_space_complexity_best_worst_average` | pending |
| M1 Analysis & Recurrences | 03 | `m1_03_asymptotic_notations_and_properties.md` | `m1_03_asymptotic_notations_and_properties` | pending |
| M1 Analysis & Recurrences | 04 | `m1_04_complexity_calculation_of_iterative_algorithms.md` | `m1_04_complexity_calculation_of_iterative_algorithms` | pending |
| M1 Analysis & Recurrences | 05 | `m1_05_recurrence_equations_and_substitution_method.md` | `m1_05_recurrence_equations_and_substitution_method` | pending |
| M1 Analysis & Recurrences | 06 | `m1_06_recurrence_iteration_method.md` | `m1_06_recurrence_iteration_method` | pending |
| M1 Analysis & Recurrences | 07 | `m1_07_recursion_tree_method.md` | `m1_07_recursion_tree_method` | pending |
| M1 Analysis & Recurrences | 08 | `m1_08_master_theorem_and_cases.md` | `m1_08_master_theorem_and_cases` | pending |
| M1 Analysis & Recurrences | 09 | `m1_09_balanced_search_trees_avl_foundations.md` | `m1_09_balanced_search_trees_avl_foundations` | pending |
| M1 Analysis & Recurrences | 10 | `m1_10_avl_tree_rotations_insertion_and_deletion.md` | `m1_10_avl_tree_rotations_insertion_and_deletion` | pending |
| M1 Analysis & Recurrences | 99 | `m1_99_practice_lab_asymptotics_and_recurrences.md` | `m1_99_practice_lab_asymptotics_and_recurrences` | pending |
| M2 Graphs & Divide/Conquer | 01 | `m2_01_disjoint_sets_and_union_find.md` | `m2_01_disjoint_sets_and_union_find` | pending |
| M2 Graphs & Divide/Conquer | 02 | `m2_02_graph_traversals_bfs_and_dfs.md` | `m2_02_graph_traversals_bfs_and_dfs` | pending |
| M2 Graphs & Divide/Conquer | 03 | `m2_03_strongly_connected_components_kosaraju.md` | `m2_03_strongly_connected_components_kosaraju` | pending |
| M2 Graphs & Divide/Conquer | 04 | `m2_04_divide_and_conquer_merge_sort_and_strassen.md` | `m2_04_divide_and_conquer_merge_sort_and_strassen` | pending |
| M2 Graphs & Divide/Conquer | 05 | `m2_05_topological_sorting_dag_linearization.md` | `m2_05_topological_sorting_dag_linearization` | pending |
| M2 Graphs & Divide/Conquer | 99 | `m2_99_practice_lab_graphs_divide_drills.md` | `m2_99_practice_lab_graphs_divide_drills` | pending |
| M3 Greedy, DP & Backtracking | 01 | `m3_01_greedy_strategy_control_abstraction.md` | `m3_01_greedy_strategy_control_abstraction` | pending |
| M3 Greedy, DP & Backtracking | 02 | `m3_02_minimum_spanning_trees_kruskal_prim.md` | `m3_02_minimum_spanning_trees_kruskal_prim` | pending |
| M3 Greedy, DP & Backtracking | 03 | `m3_03_single_source_shortest_paths_dijkstra.md` | `m3_03_single_source_shortest_paths_dijkstra` | pending |
| M3 Greedy, DP & Backtracking | 04 | `m3_04_dynamic_programming_matrix_chain_knapsack.md` | `m3_04_dynamic_programming_matrix_chain_knapsack` | pending |
| M3 Greedy, DP & Backtracking | 05 | `m3_05_backtracking_n_queens_state_space.md` | `m3_05_backtracking_n_queens_state_space` | pending |
| M3 Greedy, DP & Backtracking | 06 | `m3_06_floyd_warshall_all_pairs_shortest.md` | `m3_06_floyd_warshall_all_pairs_shortest` | pending |
| M3 Greedy, DP & Backtracking | 99 | `m3_99_practice_lab_greedy_dp_backtracking_drills.md` | `m3_99_practice_lab_greedy_dp_backtracking_drills` | pending |
| M4 Branch/Bound & Complexity | 01 | `m4_01_branch_and_bound_control_abstraction.md` | `m4_01_branch_and_bound_control_abstraction` | pending |
| M4 Branch/Bound & Complexity | 02 | `m4_02_tsp_branch_and_bound.md` | `m4_02_tsp_branch_and_bound` | pending |
| M4 Branch/Bound & Complexity | 03 | `m4_03_np_completeness_p_np_reductions.md` | `m4_03_np_completeness_p_np_reductions` | pending |
| M4 Branch/Bound & Complexity | 04 | `m4_04_bin_packing_approximation_algorithms.md` | `m4_04_bin_packing_approximation_algorithms` | pending |
| M4 Branch/Bound & Complexity | 05 | `m4_05_randomized_algorithms_las_vegas_monte_carlo.md` | `m4_05_randomized_algorithms_las_vegas_monte_carlo` | pending |
| M4 Branch/Bound & Complexity | 99 | `m4_99_practice_lab_branchbound_complexity_drills.md` | `m4_99_practice_lab_branchbound_complexity_drills` | pending |

## PECST522 — Artificial Intelligence (0/30 migrated)

| Module | Sequence | Filename | Topic ID | Status |
| --- | --- | --- | --- | --- |
| M1 Agents & Problem Solving | 01 | `m1_01_ai_definition_foundations_and_history.md` | `m1_01_ai_definition_foundations_and_history` | pending |
| M1 Agents & Problem Solving | 02 | `m1_02_agents_and_environments_peas.md` | `m1_02_agents_and_environments_peas` | pending |
| M1 Agents & Problem Solving | 03 | `m1_03_concept_of_rationality.md` | `m1_03_concept_of_rationality` | pending |
| M1 Agents & Problem Solving | 04 | `m1_04_nature_of_task_environments.md` | `m1_04_nature_of_task_environments` | pending |
| M1 Agents & Problem Solving | 05 | `m1_05_agent_architectures_reflex_to_learning.md` | `m1_05_agent_architectures_reflex_to_learning` | pending |
| M1 Agents & Problem Solving | 06 | `m1_06_problem_solving_agents_and_search_trees.md` | `m1_06_problem_solving_agents_and_search_trees` | pending |
| M1 Agents & Problem Solving | 07 | `m1_07_classic_ai_toy_problems.md` | `m1_07_classic_ai_toy_problems` | pending |
| M1 Agents & Problem Solving | 99 | `m1_99_practice_lab_agents_and_problem_formulation.md` | `m1_99_practice_lab_agents_and_problem_formulation` | pending |
| M2 Search & Game Playing | 01 | `m2_01_uninformed_search_dfs_bfs_ucs.md` | `m2_01_uninformed_search_dfs_bfs_ucs` | pending |
| M2 Search & Game Playing | 02 | `m2_02_iterative_deepening_and_depth_limited.md` | `m2_02_iterative_deepening_and_depth_limited` | pending |
| M2 Search & Game Playing | 03 | `m2_03_informed_heuristic_search_and_functions.md` | `m2_03_informed_heuristic_search_and_functions` | pending |
| M2 Search & Game Playing | 04 | `m2_04_greedy_best_first_search.md` | `m2_04_greedy_best_first_search` | pending |
| M2 Search & Game Playing | 05 | `m2_05_a_star_optimal_search.md` | `m2_05_a_star_optimal_search` | pending |
| M2 Search & Game Playing | 06 | `m2_06_generate_and_test.md` | `m2_06_generate_and_test` | pending |
| M2 Search & Game Playing | 07 | `m2_07_csp_arc_consistency_ac3.md` | `m2_07_csp_arc_consistency_ac3` | pending |
| M2 Search & Game Playing | 08 | `m2_08_games_minimax_optimal_play.md` | `m2_08_games_minimax_optimal_play` | pending |
| M2 Search & Game Playing | 09 | `m2_09_alpha_beta_pruning.md` | `m2_09_alpha_beta_pruning` | pending |
| M2 Search & Game Playing | 99 | `m2_99_practice_lab_search_strategies_drills.md` | `m2_99_practice_lab_search_strategies_drills` | pending |
| M3 Knowledge & Logic | 01 | `m3_01_knowledge_based_agents_and_wumpus_world.md` | `m3_01_knowledge_based_agents_and_wumpus_world` | pending |
| M3 Knowledge & Logic | 02 | `m3_02_propositional_logic_syntax_semantics.md` | `m3_02_propositional_logic_syntax_semantics` | pending |
| M3 Knowledge & Logic | 03 | `m3_03_inference_resolution_and_horn_clauses.md` | `m3_03_inference_resolution_and_horn_clauses` | pending |
| M3 Knowledge & Logic | 04 | `m3_04_first_order_logic_unification_and_lifting.md` | `m3_04_first_order_logic_unification_and_lifting` | pending |
| M3 Knowledge & Logic | 05 | `m3_05_propositional_vs_fol_inference.md` | `m3_05_propositional_vs_fol_inference` | pending |
| M3 Knowledge & Logic | 99 | `m3_99_practice_lab_logic_drills.md` | `m3_99_practice_lab_logic_drills` | pending |
| M4 Reinforcement Learning | 01 | `m4_01_reinforcement_learning_learning_from_rewards.md` | `m4_01_reinforcement_learning_learning_from_rewards` | pending |
| M4 Reinforcement Learning | 02 | `m4_02_passive_rl_utility_adp_and_td.md` | `m4_02_passive_rl_utility_adp_and_td` | pending |
| M4 Reinforcement Learning | 03 | `m4_03_active_rl_q_learning_and_exploration.md` | `m4_03_active_rl_q_learning_and_exploration` | pending |
| M4 Reinforcement Learning | 04 | `m4_04_policy_search_and_inverse_rl.md` | `m4_04_policy_search_and_inverse_rl` | pending |
| M4 Reinforcement Learning | 05 | `m4_05_generalization_applications_rl.md` | `m4_05_generalization_applications_rl` | pending |
| M4 Reinforcement Learning | 99 | `m4_99_practice_lab_rl_drills.md` | `m4_99_practice_lab_rl_drills` | pending |

## PCCST601 — Compiler Design (0/29 migrated)

| Module | Sequence | Filename | Topic ID | Status |
| --- | --- | --- | --- | --- |
| M1 Front End & Scanners | 01 | `m1_01_compiler_structure_phases.md` | `m1_01_compiler_structure_phases` | pending |
| M1 Front End & Scanners | 02 | `m1_02_regex_fsa_brushup.md` | `m1_02_regex_fsa_brushup` | pending |
| M1 Front End & Scanners | 03 | `m1_03_re_to_scanner_construction.md` | `m1_03_re_to_scanner_construction` | pending |
| M1 Front End & Scanners | 04 | `m1_04_lex_hands_on.md` | `m1_04_lex_hands_on` | pending |
| M1 Front End & Scanners | 05 | `m1_05_m1_mixed_drill.md` | `m1_05_m1_mixed_drill` | pending |
| M2 Top-Down Parsing | 01 | `m2_01_parsing_grammars_ambiguity.md` | `m2_01_parsing_grammars_ambiguity` | pending |
| M2 Top-Down Parsing | 02 | `m2_02_left_recursion_factoring.md` | `m2_02_left_recursion_factoring` | pending |
| M2 Top-Down Parsing | 03 | `m2_03_recursive_descent_predictive.md` | `m2_03_recursive_descent_predictive` | pending |
| M2 Top-Down Parsing | 04 | `m2_04_ll1_first_follow_tables.md` | `m2_04_ll1_first_follow_tables` | pending |
| M2 Top-Down Parsing | 05 | `m2_05_ll1_traces_errors.md` | `m2_05_ll1_traces_errors` | pending |
| M2 Top-Down Parsing | 06 | `m2_06_grammar_transform_drill.md` | `m2_06_grammar_transform_drill` | pending |
| M2 Top-Down Parsing | 07 | `m2_07_m2_mixed_drill.md` | `m2_07_m2_mixed_drill` | pending |
| M3 Bottom-Up Parsing & IR | 01 | `m3_01_shift_reduce_handles.md` | `m3_01_shift_reduce_handles` | pending |
| M3 Bottom-Up Parsing & IR | 02 | `m3_02_lr1_algorithm_items.md` | `m3_02_lr1_algorithm_items` | pending |
| M3 Bottom-Up Parsing & IR | 03 | `m3_03_lr_tables_lalr_shrinking.md` | `m3_03_lr_tables_lalr_shrinking` | pending |
| M3 Bottom-Up Parsing & IR | 04 | `m3_04_yacc_calculator_conflicts.md` | `m3_04_yacc_calculator_conflicts` | pending |
| M3 Bottom-Up Parsing & IR | 05 | `m3_05_lr_drill.md` | `m3_05_lr_drill` | pending |
| M3 Bottom-Up Parsing & IR | 06 | `m3_06_ir_taxonomy_graphical.md` | `m3_06_ir_taxonomy_graphical` | pending |
| M3 Bottom-Up Parsing & IR | 07 | `m3_07_linear_ir_tac.md` | `m3_07_linear_ir_tac` | pending |
| M3 Bottom-Up Parsing & IR | 08 | `m3_08_sdt_expressions_control.md` | `m3_08_sdt_expressions_control` | pending |
| M3 Bottom-Up Parsing & IR | 09 | `m3_09_m3_mixed_drill.md` | `m3_09_m3_mixed_drill` | pending |
| M4 Code Generation & Optimization | 01 | `m4_01_codegen_arithmetic.md` | `m4_01_codegen_arithmetic` | pending |
| M4 Code Generation & Optimization | 02 | `m4_02_codegen_boolean_relational.md` | `m4_02_codegen_boolean_relational` | pending |
| M4 Code Generation & Optimization | 03 | `m4_03_codegen_control_calls.md` | `m4_03_codegen_control_calls` | pending |
| M4 Code Generation & Optimization | 04 | `m4_04_optimization_opportunities_scope.md` | `m4_04_optimization_opportunities_scope` | pending |
| M4 Code Generation & Optimization | 05 | `m4_05_local_lvn_balancing.md` | `m4_05_local_lvn_balancing` | pending |
| M4 Code Generation & Optimization | 06 | `m4_06_regional_superlocal_unrolling.md` | `m4_06_regional_superlocal_unrolling` | pending |
| M4 Code Generation & Optimization | 07 | `m4_07_global_live_placement.md` | `m4_07_global_live_placement` | pending |
| M4 Code Generation & Optimization | 08 | `m4_08_m4_mixed_drill.md` | `m4_08_m4_mixed_drill` | pending |

## PCCST602 — Advanced Computing Systems (0/23 migrated)

| Module | Sequence | Filename | Topic ID | Status |
| --- | --- | --- | --- | --- |
| M1 Distributed Models & Enablers | 01 | `m1_01_hpc_htc_paradigms.md` | `m1_01_hpc_htc_paradigms` | pending |
| M1 Distributed Models & Enablers | 02 | `m1_02_iot_cps.md` | `m1_02_iot_cps` | pending |
| M1 Distributed Models & Enablers | 03 | `m1_03_multicore_gpu.md` | `m1_03_multicore_gpu` | pending |
| M1 Distributed Models & Enablers | 04 | `m1_04_vms_system_models.md` | `m1_04_vms_system_models` | pending |
| M1 Distributed Models & Enablers | 05 | `m1_05_m1_mixed_drill.md` | `m1_05_m1_mixed_drill` | pending |
| M2 Clusters & Job Management | 01 | `m2_01_cluster_objectives_issues.md` | `m2_01_cluster_objectives_issues` | pending |
| M2 Clusters & Job Management | 02 | `m2_02_cluster_arch_gpu_ssi.md` | `m2_02_cluster_arch_gpu_ssi` | pending |
| M2 Clusters & Job Management | 03 | `m2_03_ha_fault_checkpoint.md` | `m2_03_ha_fault_checkpoint` | pending |
| M2 Clusters & Job Management | 04 | `m2_04_job_scheduling.md` | `m2_04_job_scheduling` | pending |
| M2 Clusters & Job Management | 05 | `m2_05_job_management_migration.md` | `m2_05_job_management_migration` | pending |
| M2 Clusters & Job Management | 06 | `m2_06_m2_mixed_drill.md` | `m2_06_m2_mixed_drill` | pending |
| M3 Virtualization | 01 | `m3_01_virtualization_levels_comparison.md` | `m3_01_virtualization_levels_comparison` | pending |
| M3 Virtualization | 02 | `m3_02_vmm_requirements_os_level.md` | `m3_02_vmm_requirements_os_level` | pending |
| M3 Virtualization | 03 | `m3_03_structures_cpu_virtualization.md` | `m3_03_structures_cpu_virtualization` | pending |
| M3 Virtualization | 04 | `m3_04_memory_io_virtualization.md` | `m3_04_memory_io_virtualization` | pending |
| M3 Virtualization | 05 | `m3_05_virtual_clusters_live_migration.md` | `m3_05_virtual_clusters_live_migration` | pending |
| M3 Virtualization | 06 | `m3_06_m3_mixed_drill.md` | `m3_06_m3_mixed_drill` | pending |
| M4 Cloud, Microservices & Containers | 01 | `m4_01_cloud_models_cost.md` | `m4_01_cloud_models_cost` | pending |
| M4 Cloud, Microservices & Containers | 02 | `m4_02_iaas_paas_saas.md` | `m4_02_iaas_paas_saas` | pending |
| M4 Cloud, Microservices & Containers | 03 | `m4_03_microservices_pros_cons.md` | `m4_03_microservices_pros_cons` | pending |
| M4 Cloud, Microservices & Containers | 04 | `m4_04_ipc_discovery_gateway.md` | `m4_04_ipc_discovery_gateway` | pending |
| M4 Cloud, Microservices & Containers | 05 | `m4_05_containers_docker.md` | `m4_05_containers_docker` | pending |
| M4 Cloud, Microservices & Containers | 06 | `m4_06_m4_mixed_drill.md` | `m4_06_m4_mixed_drill` | pending |

## PBCST604 — Fundamentals of Cyber Security (0/26 migrated)

| Module | Sequence | Filename | Topic ID | Status |
| --- | --- | --- | --- | --- |
| M1 InfoSec, Recon & VAPT | 01 | `m1_01_infosec_threats_risk.md` | `m1_01_infosec_threats_risk` | pending |
| M1 InfoSec, Recon & VAPT | 02 | `m1_02_reconnaissance_gathering.md` | `m1_02_reconnaissance_gathering` | pending |
| M1 InfoSec, Recon & VAPT | 03 | `m1_03_buffer_stack_overflow.md` | `m1_03_buffer_stack_overflow` | pending |
| M1 InfoSec, Recon & VAPT | 04 | `m1_04_format_string_vuln_drill.md` | `m1_04_format_string_vuln_drill` | pending |
| M1 InfoSec, Recon & VAPT | 05 | `m1_05_vapt_burp_metasploit.md` | `m1_05_vapt_burp_metasploit` | pending |
| M1 InfoSec, Recon & VAPT | 06 | `m1_06_m1_mixed_drill.md` | `m1_06_m1_mixed_drill` | pending |
| M2 Web & DNS Security | 01 | `m2_01_sql_injection.md` | `m2_01_sql_injection` | pending |
| M2 Web & DNS Security | 02 | `m2_02_xss_types_fixes.md` | `m2_02_xss_types_fixes` | pending |
| M2 Web & DNS Security | 03 | `m2_03_csrf_defenses.md` | `m2_03_csrf_defenses` | pending |
| M2 Web & DNS Security | 04 | `m2_04_dns_security_dnssec.md` | `m2_04_dns_security_dnssec` | pending |
| M2 Web & DNS Security | 05 | `m2_05_zap_webgoat_dvwa_mirror.md` | `m2_05_zap_webgoat_dvwa_mirror` | pending |
| M2 Web & DNS Security | 06 | `m2_06_email_security.md` | `m2_06_email_security` | pending |
| M2 Web & DNS Security | 07 | `m2_07_m2_mixed_drill.md` | `m2_07_m2_mixed_drill` | pending |
| M3 Network Security | 01 | `m3_01_netsec_terms_devices.md` | `m3_01_netsec_terms_devices` | pending |
| M3 Network Security | 02 | `m3_02_dos_ddos.md` | `m3_02_dos_ddos` | pending |
| M3 Network Security | 03 | `m3_03_arp_spoofing_hijacking.md` | `m3_03_arp_spoofing_hijacking` | pending |
| M3 Network Security | 04 | `m3_04_traffic_capture_tricks.md` | `m3_04_traffic_capture_tricks` | pending |
| M3 Network Security | 05 | `m3_05_port_scanning_nmap.md` | `m3_05_port_scanning_nmap` | pending |
| M3 Network Security | 06 | `m3_06_wireshark_analysis.md` | `m3_06_wireshark_analysis` | pending |
| M3 Network Security | 07 | `m3_07_m3_attack_chain_drill.md` | `m3_07_m3_attack_chain_drill` | pending |
| M4 System Security & Projects | 01 | `m4_01_windows_attacks_hardening.md` | `m4_01_windows_attacks_hardening` | pending |
| M4 System Security & Projects | 02 | `m4_02_windows_safe_defender.md` | `m4_02_windows_safe_defender` | pending |
| M4 System Security & Projects | 03 | `m4_03_linux_attacks_physical_config.md` | `m4_03_linux_attacks_physical_config` | pending |
| M4 System Security & Projects | 04 | `m4_04_linux_auth_selinux.md` | `m4_04_linux_auth_selinux` | pending |
| M4 System Security & Projects | 05 | `m4_05_pbl_project_guide.md` | `m4_05_pbl_project_guide` | pending |
| M4 System Security & Projects | 06 | `m4_06_m4_mixed_drill.md` | `m4_06_m4_mixed_drill` | pending |

## PECST632 — Deep Learning (0/25 migrated)

| Module | Sequence | Filename | Topic ID | Status |
| --- | --- | --- | --- | --- |
| M1 MLP, Backprop & SGD | 01 | `m1_01_mlp_forward_pass.md` | `m1_01_mlp_forward_pass` | pending |
| M1 MLP, Backprop & SGD | 02 | `m1_02_backprop_variants.md` | `m1_02_backprop_variants` | pending |
| M1 MLP, Backprop & SGD | 03 | `m1_03_sgd_schedules.md` | `m1_03_sgd_schedules` | pending |
| M1 MLP, Backprop & SGD | 04 | `m1_04_curse_dimensionality.md` | `m1_04_curse_dimensionality` | pending |
| M1 MLP, Backprop & SGD | 05 | `m1_05_deep_feedforward_init.md` | `m1_05_deep_feedforward_init` | pending |
| M1 MLP, Backprop & SGD | 06 | `m1_06_m1_mixed_drill.md` | `m1_06_m1_mixed_drill` | pending |
| M2 Depth, Activations & Autoencoders | 01 | `m2_01_ml_vs_dl_representation.md` | `m2_01_ml_vs_dl_representation` | pending |
| M2 Depth, Activations & Autoencoders | 02 | `m2_02_activations_relu_family.md` | `m2_02_activations_relu_family` | pending |
| M2 Depth, Activations & Autoencoders | 03 | `m2_03_unsupervised_rbm.md` | `m2_03_unsupervised_rbm` | pending |
| M2 Depth, Activations & Autoencoders | 04 | `m2_04_autoencoders.md` | `m2_04_autoencoders` | pending |
| M2 Depth, Activations & Autoencoders | 05 | `m2_05_dl_applications.md` | `m2_05_dl_applications` | pending |
| M2 Depth, Activations & Autoencoders | 06 | `m2_06_m2_mixed_drill.md` | `m2_06_m2_mixed_drill` | pending |
| M3 CNNs & RNNs | 01 | `m3_01_cnn_layers_filters.md` | `m3_01_cnn_layers_filters` | pending |
| M3 CNNs & RNNs | 02 | `m3_02_regularization_alexnet_resnet.md` | `m3_02_regularization_alexnet_resnet` | pending |
| M3 CNNs & RNNs | 03 | `m3_03_rnn_bptt.md` | `m3_03_rnn_bptt` | pending |
| M3 CNNs & RNNs | 04 | `m3_04_birnn_seq2seq.md` | `m3_04_birnn_seq2seq` | pending |
| M3 CNNs & RNNs | 05 | `m3_05_lstm_gru.md` | `m3_05_lstm_gru` | pending |
| M3 CNNs & RNNs | 06 | `m3_06_dimension_param_drill.md` | `m3_06_dimension_param_drill` | pending |
| M3 CNNs & RNNs | 07 | `m3_07_m3_mixed_drill.md` | `m3_07_m3_mixed_drill` | pending |
| M4 Applications, GANs & Advanced AEs | 01 | `m4_01_cv_speech_nlp_cases.md` | `m4_01_cv_speech_nlp_cases` | pending |
| M4 Applications, GANs & Advanced AEs | 02 | `m4_02_regularized_autoencoders.md` | `m4_02_regularized_autoencoders` | pending |
| M4 Applications, GANs & Advanced AEs | 03 | `m4_03_stochastic_contractive.md` | `m4_03_stochastic_contractive` | pending |
| M4 Applications, GANs & Advanced AEs | 04 | `m4_04_gan_variants.md` | `m4_04_gan_variants` | pending |
| M4 Applications, GANs & Advanced AEs | 05 | `m4_05_gan_dynamics_drill.md` | `m4_05_gan_dynamics_drill` | pending |
| M4 Applications, GANs & Advanced AEs | 06 | `m4_06_m4_mixed_drill.md` | `m4_06_m4_mixed_drill` | pending |

## PECST637 — Fundamentals of Cryptography (0/25 migrated)

| Module | Sequence | Filename | Topic ID | Status |
| --- | --- | --- | --- | --- |
| M1 Number Theory | 01 | `m1_01_divisibility_euclid.md` | `m1_01_divisibility_euclid` | pending |
| M1 Number Theory | 02 | `m1_02_modular_arithmetic.md` | `m1_02_modular_arithmetic` | pending |
| M1 Number Theory | 03 | `m1_03_fermat_euler_totient.md` | `m1_03_fermat_euler_totient` | pending |
| M1 Number Theory | 04 | `m1_04_primitive_roots_discrete_log.md` | `m1_04_primitive_roots_discrete_log` | pending |
| M1 Number Theory | 05 | `m1_05_miller_rabin_primality.md` | `m1_05_miller_rabin_primality` | pending |
| M1 Number Theory | 06 | `m1_06_crt_applications.md` | `m1_06_crt_applications` | pending |
| M1 Number Theory | 07 | `m1_07_m1_mixed_drill.md` | `m1_07_m1_mixed_drill` | pending |
| M2 Classical Ciphers | 01 | `m2_01_attacks_services_principles.md` | `m2_01_attacks_services_principles` | pending |
| M2 Classical Ciphers | 02 | `m2_02_symmetric_model.md` | `m2_02_symmetric_model` | pending |
| M2 Classical Ciphers | 03 | `m2_03_substitution_cryptanalysis.md` | `m2_03_substitution_cryptanalysis` | pending |
| M2 Classical Ciphers | 04 | `m2_04_transposition_feistel.md` | `m2_04_transposition_feistel` | pending |
| M2 Classical Ciphers | 05 | `m2_05_m2_mixed_drill.md` | `m2_05_m2_mixed_drill` | pending |
| M3 Modern Ciphers & RSA | 01 | `m3_01_des_structure_strength.md` | `m3_01_des_structure_strength` | pending |
| M3 Modern Ciphers & RSA | 02 | `m3_02_aes_structure_modes.md` | `m3_02_aes_structure_modes` | pending |
| M3 Modern Ciphers & RSA | 03 | `m3_03_stream_rc4.md` | `m3_03_stream_rc4` | pending |
| M3 Modern Ciphers & RSA | 04 | `m3_04_publickey_principles.md` | `m3_04_publickey_principles` | pending |
| M3 Modern Ciphers & RSA | 05 | `m3_05_rsa_keygen_decrypt.md` | `m3_05_rsa_keygen_decrypt` | pending |
| M3 Modern Ciphers & RSA | 06 | `m3_06_diffie_hellman_mitm.md` | `m3_06_diffie_hellman_mitm` | pending |
| M3 Modern Ciphers & RSA | 07 | `m3_07_m3_mixed_drill.md` | `m3_07_m3_mixed_drill` | pending |
| M4 Hashes, Signatures & PKI | 01 | `m4_01_hash_md5_sha.md` | `m4_01_hash_md5_sha` | pending |
| M4 Hashes, Signatures & PKI | 02 | `m4_02_sha3_hmac.md` | `m4_02_sha3_hmac` | pending |
| M4 Hashes, Signatures & PKI | 03 | `m4_03_digital_signatures.md` | `m4_03_digital_signatures` | pending |
| M4 Hashes, Signatures & PKI | 04 | `m4_04_key_mgmt_pki.md` | `m4_04_key_mgmt_pki` | pending |
| M4 Hashes, Signatures & PKI | 05 | `m4_05_protocol_drill.md` | `m4_05_protocol_drill` | pending |
| M4 Hashes, Signatures & PKI | 06 | `m4_06_m4_mixed_drill.md` | `m4_06_m4_mixed_drill` | pending |

## PECST631 — Software Testing (0/26 migrated)

| Module | Sequence | Filename | Topic ID | Status |
| --- | --- | --- | --- | --- |
| M1 Testing Foundations & Automation | 01 | `m1_01_concepts_quality_failures.md` | `m1_01_concepts_quality_failures` | pending |
| M1 Testing Foundations & Automation | 02 | `m1_02_processes_terminology.md` | `m1_02_processes_terminology` | pending |
| M1 Testing Foundations & Automation | 03 | `m1_03_test_types_pyramid.md` | `m1_03_test_types_pyramid` | pending |
| M1 Testing Foundations & Automation | 04 | `m1_04_box_methods.md` | `m1_04_box_methods` | pending |
| M1 Testing Foundations & Automation | 05 | `m1_05_automation_ai_trends.md` | `m1_05_automation_ai_trends` | pending |
| M1 Testing Foundations & Automation | 06 | `m1_06_m1_mixed_drill.md` | `m1_06_m1_mixed_drill` | pending |
| M2 Unit & Mutation Testing | 01 | `m2_01_unit_static_dynamic_control.md` | `m2_01_unit_static_dynamic_control` | pending |
| M2 Unit & Mutation Testing | 02 | `m2_02_dataflow_domain.md` | `m2_02_dataflow_domain` | pending |
| M2 Unit & Mutation Testing | 03 | `m2_03_mutation_operators_score.md` | `m2_03_mutation_operators_score` | pending |
| M2 Unit & Mutation Testing | 04 | `m2_04_junit_automation.md` | `m2_04_junit_automation` | pending |
| M2 Unit & Mutation Testing | 05 | `m2_05_ai_testing_tools.md` | `m2_05_ai_testing_tools` | pending |
| M2 Unit & Mutation Testing | 06 | `m2_06_m2_mixed_drill.md` | `m2_06_m2_mixed_drill` | pending |
| M3 White-Box & Security Testing | 01 | `m3_01_graph_coverage_prime_paths.md` | `m3_01_graph_coverage_prime_paths` | pending |
| M3 White-Box & Security Testing | 02 | `m3_02_dataflow_subsumption.md` | `m3_02_dataflow_subsumption` | pending |
| M3 White-Box & Security Testing | 03 | `m3_03_cfg_loops_exceptions.md` | `m3_03_cfg_loops_exceptions` | pending |
| M3 White-Box & Security Testing | 04 | `m3_04_design_call_inheritance.md` | `m3_04_design_call_inheritance` | pending |
| M3 White-Box & Security Testing | 05 | `m3_05_security_owasp_burp.md` | `m3_05_security_owasp_burp` | pending |
| M3 White-Box & Security Testing | 06 | `m3_06_coverage_numerics_drill.md` | `m3_06_coverage_numerics_drill` | pending |
| M3 White-Box & Security Testing | 07 | `m3_07_m3_mixed_drill.md` | `m3_07_m3_mixed_drill` | pending |
| M4 Black-Box, Grey-Box & PEX | 01 | `m4_01_isp_ecp_bva.md` | `m4_01_isp_ecp_bva` | pending |
| M4 Black-Box, Grey-Box & PEX | 02 | `m4_02_decision_random_domain.md` | `m4_02_decision_random_domain` | pending |
| M4 Black-Box, Grey-Box & PEX | 03 | `m4_03_grey_matrix_regression_oa.md` | `m4_03_grey_matrix_regression_oa` | pending |
| M4 Black-Box, Grey-Box & PEX | 04 | `m4_04_performance_responsive.md` | `m4_04_performance_responsive` | pending |
| M4 Black-Box, Grey-Box & PEX | 05 | `m4_05_pex_symbolic_put.md` | `m4_05_pex_symbolic_put` | pending |
| M4 Black-Box, Grey-Box & PEX | 06 | `m4_06_genai_advanced_case.md` | `m4_06_genai_advanced_case` | pending |
| M4 Black-Box, Grey-Box & PEX | 07 | `m4_07_m4_mixed_drill.md` | `m4_07_m4_mixed_drill` | pending |

## GXEST605 — Design Thinking and Product Development (0/24 migrated)

| Module | Sequence | Filename | Topic ID | Status |
| --- | --- | --- | --- | --- |
| M1 Fundamentals & Self-Check | 01 | `m1_01_lifecycle_dt_defined.md` | `m1_01_lifecycle_dt_defined` | pending |
| M1 Fundamentals & Self-Check | 02 | `m1_02_social_hcd_inclusion.md` | `m1_02_social_hcd_inclusion` | pending |
| M1 Fundamentals & Self-Check | 03 | `m1_03_sustainability_trl.md` | `m1_03_sustainability_trl` | pending |
| M1 Fundamentals & Self-Check | 04 | `m1_04_idea_self_check.md` | `m1_04_idea_self_check` | pending |
| M1 Fundamentals & Self-Check | 05 | `m1_05_m1_mixed_drill.md` | `m1_05_m1_mixed_drill` | pending |
| M2 Empathize & Define | 01 | `m2_01_phases_empathy_role.md` | `m2_01_phases_empathy_role` | pending |
| M2 Empathize & Define | 02 | `m2_02_why_wh_maps.md` | `m2_02_why_wh_maps` | pending |
| M2 Empathize & Define | 03 | `m2_03_journey_personas.md` | `m2_03_journey_personas` | pending |
| M2 Empathize & Define | 04 | `m2_04_define_story_items_success.md` | `m2_04_define_story_items_success` | pending |
| M2 Empathize & Define | 05 | `m2_05_workshop_drill.md` | `m2_05_workshop_drill` | pending |
| M2 Empathize & Define | 06 | `m2_06_m2_mixed_drill.md` | `m2_06_m2_mixed_drill` | pending |
| M3 Ideate & PoC | 01 | `m3_01_ideation_tools.md` | `m3_01_ideation_tools` | pending |
| M3 Ideate & PoC | 02 | `m3_02_research_trends.md` | `m3_02_research_trends` | pending |
| M3 Ideate & PoC | 03 | `m3_03_feasibility_sessions.md` | `m3_03_feasibility_sessions` | pending |
| M3 Ideate & PoC | 04 | `m3_04_poc_objectives_validation.md` | `m3_04_poc_objectives_validation` | pending |
| M3 Ideate & PoC | 05 | `m3_05_ideation_workshop_drill.md` | `m3_05_ideation_workshop_drill` | pending |
| M3 Ideate & PoC | 06 | `m3_06_m3_mixed_drill.md` | `m3_06_m3_mixed_drill` | pending |
| M4 Design, Prototype & Pilot | 01 | `m4_01_detailed_design_srd_dfmea.md` | `m4_01_detailed_design_srd_dfmea` | pending |
| M4 Design, Prototype & Pilot | 02 | `m4_02_standards_code_future.md` | `m4_02_standards_code_future` | pending |
| M4 Design, Prototype & Pilot | 03 | `m4_03_prototyping_alpha_beta.md` | `m4_03_prototyping_alpha_beta` | pending |
| M4 Design, Prototype & Pilot | 04 | `m4_04_pilot_scaling.md` | `m4_04_pilot_scaling` | pending |
| M4 Design, Prototype & Pilot | 05 | `m4_05_bmc_production_visit.md` | `m4_05_bmc_production_visit` | pending |
| M4 Design, Prototype & Pilot | 06 | `m4_06_usability_testing_iteration.md` | `m4_06_usability_testing_iteration` | pending |
| M4 Design, Prototype & Pilot | 07 | `m4_07_drill_journal_guide.md` | `m4_07_drill_journal_guide` | pending |

## OECST614 — Machine Learning for Engineers (0/24 migrated)

| Module | Sequence | Filename | Topic ID | Status |
| --- | --- | --- | --- | --- |
| M1 ML Basics & Regression | 01 | `m1_01_ml_vs_traditional_paradigms.md` | `m1_01_ml_vs_traditional_paradigms` | pending |
| M1 ML Basics & Regression | 02 | `m1_02_mle_map_bayesian_estimation.md` | `m1_02_mle_map_bayesian_estimation` | pending |
| M1 ML Basics & Regression | 03 | `m1_03_features_problem_loss_optimization.md` | `m1_03_features_problem_loss_optimization` | pending |
| M1 ML Basics & Regression | 04 | `m1_04_linear_regression_single_variable.md` | `m1_04_linear_regression_single_variable` | pending |
| M1 ML Basics & Regression | 05 | `m1_05_multivariate_gradient_matrix_method.md` | `m1_05_multivariate_gradient_matrix_method` | pending |
| M1 ML Basics & Regression | 06 | `m1_06_m1_mixed_drill.md` | `m1_06_m1_mixed_drill` | pending |
| M2 Classification & Evaluation | 01 | `m2_01_naive_bayes_classifier.md` | `m2_01_naive_bayes_classifier` | pending |
| M2 Classification & Evaluation | 02 | `m2_02_knn_lazy_learning.md` | `m2_02_knn_lazy_learning` | pending |
| M2 Classification & Evaluation | 03 | `m2_03_overfitting_lasso_ridge.md` | `m2_03_overfitting_lasso_ridge` | pending |
| M2 Classification & Evaluation | 04 | `m2_04_train_test_validation_splits.md` | `m2_04_train_test_validation_splits` | pending |
| M2 Classification & Evaluation | 05 | `m2_05_classification_regression_metrics.md` | `m2_05_classification_regression_metrics` | pending |
| M2 Classification & Evaluation | 06 | `m2_06_m2_mixed_drill.md` | `m2_06_m2_mixed_drill` | pending |
| M3 Neural Nets & Trees | 01 | `m3_01_perceptron_learning.md` | `m3_01_perceptron_learning` | pending |
| M3 Neural Nets & Trees | 02 | `m3_02_mlp_activations_forward.md` | `m3_02_mlp_activations_forward` | pending |
| M3 Neural Nets & Trees | 03 | `m3_03_backpropagation_algorithm.md` | `m3_03_backpropagation_algorithm` | pending |
| M3 Neural Nets & Trees | 04 | `m3_04_decision_trees_info_gain_ratio.md` | `m3_04_decision_trees_info_gain_ratio` | pending |
| M3 Neural Nets & Trees | 05 | `m3_05_id3_algorithm_worked.md` | `m3_05_id3_algorithm_worked` | pending |
| M3 Neural Nets & Trees | 06 | `m3_06_m3_mixed_drill.md` | `m3_06_m3_mixed_drill` | pending |
| M4 Clustering & Ensembles | 01 | `m4_01_similarity_hierarchical_clustering.md` | `m4_01_similarity_hierarchical_clustering` | pending |
| M4 Clustering & Ensembles | 02 | `m4_02_kmeans_partitional_clustering.md` | `m4_02_kmeans_partitional_clustering` | pending |
| M4 Clustering & Ensembles | 03 | `m4_03_pca_dimensionality_reduction.md` | `m4_03_pca_dimensionality_reduction` | pending |
| M4 Clustering & Ensembles | 04 | `m4_04_mds_ensemble_bagging_boosting.md` | `m4_04_mds_ensemble_bagging_boosting` | pending |
| M4 Clustering & Ensembles | 05 | `m4_05_resampling_bias_variance_tradeoff.md` | `m4_05_resampling_bias_variance_tradeoff` | pending |
| M4 Clustering & Ensembles | 06 | `m4_06_m4_mixed_drill.md` | `m4_06_m4_mixed_drill` | pending |
