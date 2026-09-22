# Tarangam Visualization Mapping Audit — Session 6

Authoritative roadmap input for visualization work. Generated from repository HEAD `5f9df76` (M1T4 reference implementation, 548/548 tests). The machine-readable companion is `data/viz-map.json` (one row per topic: representation, priority, reason, complexity, primitive dependencies). Consult the JSON before adding any visual to any topic.

Principle (binding): **every concept should use the representation that best supports learning — never visuals for decoration.** Criterion 9 is mandatory: if static text communicates equally well, do not visualize.

## 1. Content inventory (generated, not assumed)

- **20 courses, 486 topics.** Largest: PCCST501 (37), GXEST104 (33), PCCST502/PECST522 (31/30).
- **Widget/representation counts across all topics:** quizzes 1,462 (all 486 topics), callouts 1,401, `::: step` cards 1,254, toggles 388, Markdown table rows 2,012 (191 files), `$$` formula blocks 147 (85 files), fenced code blocks 155 files.
- **Motion/interactive today:** `::: anim` SVG scenes used in 114 topic files (107 of 113 registry scenes wired; registry also serves steppers/flows); `::: viz` interactive widgets in 1 topic (M1T4, 12 widgets); Mermaid in 8 files (34 blocks, all PCCST501 M1/M2 except one PCCST502 decision tree).
- **Scene registry health:** all curriculum-relevant scenes are wired exactly where they belong (TCP handshake, DNS resolve, GBN window, CRC divide, AIMD sawtooth, Dijkstra settle, minimax/alpha-beta, gradient descent, k-means, compiler pipeline, virt/docker arch, hash chain, …). Genuinely unused: `dv-count` (distance-vector counting — belongs to PCCST501/m2_10), `fb-profiles`, plus `http-exchange`/`http-timing` spares from the M1T4 set (`http-cookie`, `http-full` are live via `::: viz`).

## 2. Representation taxonomy (starting vocabulary = current system)

| Code | Representation | Mechanism |
|---|---|---|
| A | Static explanation | Normal Markdown suffices |
| B | Table | Existing Markdown tables |
| C | Tabs | `::: viz tabs` |
| D | Compare | `::: viz compare` |
| E | Flow | `::: viz flow` (+ scenes) |
| F | Stepper | `::: viz stepper` |
| G | Timeline | Use flow (chronology is staging); **no separate primitive** |
| H | Graph/Lab | `::: viz rtt` today; generalized formula lab later |
| I | SVG Scene | `::: anim` registry |
| J | Structure/Packet | **Needs `struct` primitive** (annotated field layout) |
| K | Quiz/recall | Existing quiz widgets |
| L | Existing special | Whatever the repo already does better |
| keep | Already served | Do not add anything |

## 3. Coverage

- Total topics: **486**. Already visually enhanced beyond prose: **121** (114 with SVG scenes, 8 with Mermaid, 1 with interactive viz; overlaps).
- **P0 (implement early): 7 topics.** **P1 (meaningful backlog): 119 rows in JSON, ~22 curated below.** **P2 (later): 48.** **NONE (do not visualize): 312** — prose, tables, and quizzes already carry these; this is a verdict, not a gap.

### P0 — the early list (major learning improvement each)

| Topic | Concept | Rep | Why | Complexity | Needs |
|---|---|---|---|---|---|
| PCCST501/m2_09_ipv4_addressing_forwarding_nat_icmp | Subnet arithmetic | H | The classic interactive calculation; static tables cannot drill it | M | lab-generalized |
| PCCST501/m4_02_nyquist_shannon_channel_capacity | Channel-capacity formulas | H | User-varying inputs are the canonical lab | M | lab-generalized |
| PCCST501/m2_02_udp_segment_structure_and_checksum | UDP header layout | J | Spatial field layout must be seen and probed | M | struct |
| PCCST501/m2_03_tcp_segment_structure_and_rtt | TCP header layout | J | Same as above (RTT estimation can ride the lab later) | M | struct |
| PCCST303/m2_01_singly_linked_list_operations | Pointer surgery | F | Execution order IS the concept | S | — (stepper exists) |
| PCCST303/m3_06_bfs_dfs_shortest_paths | Frontier expansion | F | Wire the unused `bfs-layers` scene + stepper | S | — |
| PCCST502/m1_09_balanced_search_trees_avl_foundations | Balance-factor computation | F | Bottom-up BF tracing reads as stages (rotations already have scenes) | S | — |

### P1 — curated shortlist (highest value first; full backlog in JSON)

- **Protocol flows (E, S, no new primitive):** PCCST501/m1_05 FTP session, m1_06 SMTP dialogue, m2_05 handshake upgrade reusing `tcp-handshake`, m2_10 DV exchange + wire unused `dv-count`, m3_04 ARP/switch-table learning, PBCST504/m3_03 I2C transaction.
- **Execution steppers (F, S):** PCCST502/m2_04 merge/Strassen, m2_05 topo sort, m3_02 Kruskal/Prim; PCCST303/m1_04 stacks, m1_05 queues, m2_02/m2_03 linked structures; PECST522/m2_05 A*, m3_03 resolution, m4_01 RL backups; PECST637/m3_05 RSA; PCCST502/m1_08 master-theorem chooser (upgrade existing Mermaid decision tree); PBCST504/m4_04 FreeRTOS timing; PBCST604/m1_03 stack-smash trace.
- **Labs (H, need lab-generalized):** PCCST501/m3_03 ALOHA efficiency; PCCST503/m3_02 backprop blame numbers.
- **Structures (J, need struct):** PBCST504/m1_05 registers/memory map.
- **Architectures (I, scene authoring only):** PBCST504/m1_03 ARM (no new primitive).
- **Timelines (G via flow, S):** cellular generations, HTTP-style version flows where a topic needs one (e.g. PCCST501/m3_05 Wi-Fi generations — P2).

### P2 — later (families, details in JSON)

Tree visualizer demand (BST/heaps/parse/decision trees, 8 topics), code-trace demand (PCCSL507/508 lab drills, socket programs, SQL/payload traces), state-machine demand (TCP states, process states, privilege modes), matrix/table explorers (confusion matrices, routing/page tables), formula-heavy physics/math overflow (GZPHT121, GAMAT301 spillover — scenes already cover most), service-stack diagrams (PCCST602/m4_02).

## 4. Missing-primitive analysis

| Primitive | Verdict | Reason |
|---|---|---|
| Timeline | **Not needed** | Chronology is staging; `flow` covers it (M1T4 evolution proves the pattern) |
| Graph / generalized lab | **Needed later** | `rtt` proves the pattern; generalize to formula-driven inputs for P0/P1 H rows (subnet, Shannon, ALOHA, backprop) |
| Annotated structure (`struct`) | **Needed next** | 2× P0 + 2× P1 packet/register/header rows cannot be served well by tabs or prose |
| Tree visualizer | **Needed later** | 8 topics; stepper text suffices until then |
| Code execution/trace viewer | **Needed later** | Lab-course scope; larger than a widget extension |
| State-machine visualizer | **Needed later** | No topic strictly requires it today |
| Matrix/table explorer | **Not needed** | Markdown tables already serve exact lookup |
| Concept map | **Not needed** | No demonstrated demand; risks decoration |

## 5. Reusable patterns (prefer primitives over one-offs)

protocol exchange → flow · algorithm execution → stepper/trace · version evolution → timeline-as-flow · header/packet structure → annotated structure · numerical formula → interactive lab · complexity/capacity → graph · architecture → SVG scene · comparison → comparison component · A-vs-B reference → table · retrieval → quiz.

## 6. Mermaid audit (all 34 blocks, 8 files)

| Location | Blocks | Verdict |
|---|---|---|
| PCCST501/m1_01 (10 flowcharts: path/access/architecture) | keep | Static architecture is adequate; offline fallback shows code (acceptable). P2: optionally convert 1–2 core path diagrams to scenes. |
| PCCST501/m1_02 (8: OSI stack, encap, mapping, addressing) | keep | P2 candidates for scene/stepper conversion. |
| PCCST501/m1_03 (7: arch/paradigm flows) | keep | P2 candidates. |
| PCCST501/m1_04 (2 sequence + 2 flow) | **P1: replace the 2 sequenceDiagrams** | Content now duplicated by interactive flow/stepper widgets; remove CDN dependence on the reference page. Keep the 2 flowcharts. |
| PCCST501/m1_05 (1 flowchart + 1 session sequence) | **P1: sequence → flow** | Mirrors the HTTP showcase pattern directly. Keep the architecture flowchart. |
| PCCST501/m2_01 (1 demux flowchart) | keep | Tiny static mapping; tabs would add little. |
| PCCST501/m2_05 (1 handshake sequence) | **P1: flow reusing `tcp-handshake`** | Interactive staging beats the static strip. |
| PCCST502/m1_08 (1 decision tree) | **P1: stepper/tabs chooser** | Decision procedure with 3 cases + gap. |

Global rule: **do not remove Mermaid.** It stays for static flowcharts (CDN with readable-code fallback). Native SVG/steppers win only where sequence, staging, or offline robustness matters — the table above is the complete list.

## 7. Architecture recommendation

Viz-planning metadata must **not** go in topic front matter: `data/topic-schema.json` sets `additionalProperties: false`, so any `visualizations:` key would fail build validation and churn the manifest. The smallest scalable mechanism is exactly what this session produces: **a separate map file (`data/viz-map.json`) keyed by topic id**, consulted by implementation sessions, never consumed by the build. No CMS, no manifest wiring, no front-matter changes. If a future session needs build-time awareness, revisit then — with a schema change, not a hack.

## 8. Accessibility and performance implications

- All current families inherit tested contracts: native controls, keyboard operation, screen-reader labels/live regions, static no-JS fallback with full information, reduced-motion handling, print reveal, theme-var styling.
- **Acceptance criteria for the two future primitives (`struct`, generalized `lab`):** same contract — static fallback, keyboard operability, text alternative, reduced-motion safety, no new dependencies, per-widget (not global) cost.
- Page-size watch: M1T4 precedent is ~100 KB generated HTML against the 163,840-byte expanded budget; mapping-driven sessions must keep each page under it. Reject any representation whose educational benefit does not justify its DOM/byte cost (applies today to matrix explorers and concept maps).

## 9. Dependency-aware implementation order (future sessions)

- **Session A (no new primitives):** wire unused scenes (`dv-count`→m2_10, `bfs-layers`→m3_06); flows for FTP/SMTP/handshake-upgrade/ARP/I2C; steppers for linked lists, AVL foundations, merge/topo sort, RSA, A*, resolution, Kruskal/Prim.
- **Session B (`struct` primitive):** UDP/TCP/IP headers, registers/memory map, VLAN/AES overflow from P1/P2.
- **Session C (generalized `lab`):** subnetting, Shannon/Nyquist, ALOHA, backprop, TCP RTO.
- **Session D (later, on demand):** tree visualizer, code-trace viewer, state-machine visualizer — only when a session's P-row requires them.
- Never a "visualize everything" pass: each session picks rows from `data/viz-map.json` and stops.

## 10. Validation and files

- `npm test`, `npm run lint`, `npm run build:notes` all green at commit time; working tree clean except the two intentional artifacts below.
- Files added: `data/viz-map.json` (machine-readable, 486 rows), `docs/visualization-map.md` (this report). No content, build, test, or style file touched.
