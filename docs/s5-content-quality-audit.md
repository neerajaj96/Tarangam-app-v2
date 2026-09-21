# S5 Content Quality Audit (accuracy, reproducibility, deep beginner explanation)

Quality-control pass over all S5 material for the "S5 Technical Accuracy, Reproducibility & Deep Beginner-Explanation Audit" task. Standard: `docs/beginner-notes-standard.md` rule 19 (every difficult element explainable in place). Method: full-text greps for universal words and non-English tokens, per-note re-reads of all 51 new topics plus the previously added RMSE section, assessment-bank review of all 102 new questions, widget/behavior verification via build + test suite.

## 1. Technical corrections (concrete inaccuracies fixed)

- PBCST504/m1_03 (ARM registers): the PC description implied it points at the executing instruction. Corrected — on Cortex-M the pipeline makes PC read ahead (current + 4); flagged as an exam trap with a dedicated toggle.
- PBCST504/m1_01 (MC vs MP): power/speed contrasts were stated for all MPs (phone-class processors sip power too). Qualified to desktop-class MPs with an SoC carve-out; "instant" boot reworded to microseconds-to-milliseconds with the no-OS reason.
- PBCST504/m1_02 (`uint32_t`): "guaranteed on every compiler" overstated the C standard (exact-width types are optional). Qualified to toolchains providing them (virtually all ARM toolchains).
- PBCST504/m2_02 (power): "instantly-wakeable"/"answer instantly" softened to microsecond-scale wake with the interrupt-wire mechanism named.
- PCCSL507/m1_01 (diagnosis): "lowest broken layer is always the true cause" ignored firewall-filtered ICMP on healthy stacks. Now "first suspect" with the filter caveat.
- PCCSL507/m1_02: "rebind instantly" comment reworded to "without waiting out TIME_WAIT".
- PCCSL507/m1_04: "guaranteed non-blocking" reworded to reported-ready plus non-blocking set (the actual two-part guarantee); "answered instantly" → "within milliseconds".
- PCCSL507/m2_03: "always test IPs" → "test IPs first" (order advice, not law).
- PCCSL507/m3_01: "breaks ping instantly" → "at once".
- PCCSL508/m1_01: REPL "instantly" → "line by line"; "types never declared" qualified (annotations exist, optional at this level).
- PCCSL508/m1_02: shape convention marked as course convention with transposed-layout caveat.
- UCHUM506/m1_02: "never accepted as an excuse anywhere" → "accepted almost nowhere" with the final-deadline reason.
- PCCST503/m2_06 (prior task, verified clean): no change needed; RMSE per-symbol expansion added per this task's explicit requirement.

## 2. Beginner-clarity corrections (expandable coverage added)

Mechanism: existing `::: toggle` widget (`<details><summary>`, inspected in `scripts/widgets.js`; no new widget system — toggle bodies carry plain markdown only, never nested widgets). Added ~110 toggles total:

- PBCST504 (20 notes, ~45 toggles): firmware/real-time/non-volatile, hex reading, volatile mechanics, read-modify-write steps, `uint32_t`/`1UL<<31` spelling, interrupts, architecture-vs-core-vs-chip, SP/LR/PC roles, ARM instruction reading, worlds/veneers, bus masters, units table, push/pop mechanics, part-number decoding, series-vs-line, charge-vs-time formula logic, duty-cycle/wake-source, HAL line contracts, push-pull vs open-drain, common-cathode physics, RS/EN signals, ADC formula operations, timer-vs-counter-vs-interrupt-vs-RTC, 8N1 spelling, COM-port wiring, USART register names, overrun mechanics, I2C address/R-W/repeated-START, pull-up physics, EEPROM opcodes, CPOL/CPHA contracts, CAN frame fields, HID descriptors, QoS ladder costs, retain/will, link-budget/duty-cycle, spoof-vs-replay-vs-extraction, task states, xTaskCreate fields, IPC selection table, Delay-vs-Until, partition acronyms (SAU/IDAU/MPC/PPC/SecureFault), five-step debug method.
- PCCSL507 (12 notes, ~28 toggles): per-command/per-argument expansion for `ip addr/route`, `ping`, `ss`, socket calls (`socket`, `setsockopt`, `bind`, `listen`, `accept`, `sendall`, `recv`, `connect`, `sendto`, `recvfrom`, `settimeout`), `tc/netem`, `select`, blocking vs non-blocking, packet/frame/segment vocabulary with capture-field meanings, FIN/RST/dup-ACK/retransmission rows, `dig` flags, DORA phases, GBN variables, timeout rule, full word-by-word `ip netns exec … route add` breakdown (as specified), iptables/NAT chains, ns-3 helpers/seeds, DNAT rule.
- PCCSL508 (15 notes, ~32 toggles): Python constructs, NumPy shape/dtype/axis/broadcasting, Pandas inspection/cleaning verbs, plot parameters, residual reading, split/scale/leakage vocabulary, fit/predict/score contracts, dataset cards (housing/mpg/hlass/mall: file location, row meaning, column meanings, units, missing values, censoring, split implications, verification), classifier mechanics, metric-code reading, clustering/ensemble parameters, capstone staging.
- UCHUM506 (4 notes, 4 toggles): MOOC/listing/evidence, graded-items/forums/re-attempts, proctored-exams/credit-mapping/acknowledgment, outcomes/transcripts/closed-book terms.
- PCCST503/m1_05: per-symbol RMSE expansion (RMSE, n, i, y_i, ŷ_i, −, ², Σ, ÷, √) with why-structure and tiny numbers, as explicitly required.

## 3. Concepts requiring deeper explanation (handled by design)

- TrustZone gate mechanics, bus arbitration, and RTOS inversion each span 2–3 notes by intent (M1.04 → M4.05; M1.05 → M4.03/04); cross-links are prose pointers since prerequisites are course-local by graph design.
- Lab code assumes the previous experiment's session variables where stated (M2.03→M2.05 chain); each note's step 1 names the handoff explicitly so no hidden prerequisite survives.

## 4. Lab reproducibility corrections

- Offline-first policy enforced and re-verified in every PCCSL508 note (local CSVs, `./data/` relative paths, no URL fetching; file-existence checks named).
- PCCSL507: mandatory `tc qdisc del` cleanup after every netem demo; namespace teardown (`ip netns del`) in checklists; frozen-code discipline in capstones.
- Dataset numbers qualified: housing shapes noted as version-dependent ratios; MPG row count recorded-as-yours; diabetes smoke R² given as modest range; mall row count recorded-as-yours; U575 specs as class ranges.
- Stray non-English tokens: full-repo scan for Cyrillic/CJK after editing — zero hits (two authoring slips caught and removed during this task).

## 5. Assessment corrections

All 102 new S5 questions re-audited: every explanation now teaches in the shape "correct because X; distractors fail because Y" (previously reason-only). Spot-checked for terminology leakage: questions test only note-taught terms (e.g. veneer, WIP, ravel order, staged scores). Bank integrity: 610 questions, 0 orphans, 486/486 coverage.

## 6. MOOC corrections

No syllabus invention (re-verified); "never/always" platform claims qualified to notification-specific language; every platform term (certificate, proctored, credit mapping, forum, re-attempt, outcomes) carries a beginner toggle; anti-fabrication rule restated in the revision note.

## 7. Beginner Friction Audit (found → fixed or justified)

- Unexplained words: firmware, veneer, attestation, qdisc, pcap, ravel, OOB, QoS, DLC — all fixed via toggles at first use.
- Unexplained symbols: ŷ, Σ, √, 0x, <<, UL, axis, ravel order — fixed via toggles.
- Unexplained commands: `ip`, `ss`, `tc`, `dig`, `dhclient`, `iptables` flags — fixed via per-argument toggles with verify/undo lines.
- Skipped reasoning steps: timer configuration decomposed across M2.05 toggles (prescaler/counter/interrupt/value/aftermath named in text; full 14-step expansion lives in the procedure + toggles); page-boundary arithmetic worked; DNAT two-rule structure expanded.
- Hidden prerequisites: lab-to-lab handoffs now named in each step 1; PCCST501/503 theory pointers are prose (graph forbids cross-course edges — justified, not fixable without redesign, and explicitly out of scope).
- Unexplained outputs: `ss` lines, `dig` sections, `Query time: 0`, confusion `ravel()`, staged scores, OOB numbers — all expanded.
- External-search risks: part numbers, column meanings, error messages (`Errno 98`, overrun flag, SecureFault, NACK positions) — all answered on-page.
- Justified (not fixed): cross-course formal prerequisites (architecture constraint §17); single-runner ` Mall`/`hlass` canonical row counts (record-yours pattern instead — lab files vary by design).

## 8. Remaining limitations

- Toggle depth is bounded (~2 per concept): a learner confused by the toggle itself must use the main text or quizzes; nested toggles are unsupported by design (widget parsing stays unambiguous).
- Lab commands assume Ubuntu-class Linux with root for netem/namespaces/iptables; other environments need translation (noted in checklists, not scripted).
- ns-3/scisim install weight is environmental (lab machines preinstalled); the note teaches use, not installation.
- MOOC correctness ultimately depends on the live externally-notified session; guide pages expire in relevance if notifications change (re-verification is the learner's week-one job, as taught).

## 9. Verification results

- `npm run build:notes`: pass — 486/486 metadata, graph 655 edges / 0 errors (5 pre-existing warnings), assessment 610/486/0, exam 486/486.
- `npm test`: 512/512 pass, 348 suites.
- `npm run lint` (`tsc --noEmit`): clean.
- Extra checks: every S5 page renders (486 HTML files); toggles render as `<details>` (spot-checked in output HTML); no malformed/nested widgets (check.js widget rules pass); no duplicate anchors; no broken links; no orphaned topics; prerequisites valid; zero orphan assessment questions; no visible debug text (language scan clean).
- Architecture: no changes to learner state, adaptive learning, privacy, PWA, search, server, assessment, prerequisite-graph, or AI/RAG designs; no new widget system (existing toggle reused, reusable S1–S8).
