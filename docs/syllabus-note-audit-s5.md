# S5 Syllabus ↔ Note Audit (KTU-2024, absolute-beginner rewrite)

Method: every mapping below was produced by keyword-scanning the actual
Markdown bodies under `content/<COURSE>/` and then opening the hit files to
confirm depth — never by filename matching. Status meanings: **Covered** =
a dedicated note teaches the item; **Partial** = mentioned or framed
without being taught (needs deepening in the rewrite); **Missing** = no
note teaches it (needs a new topic file, listed in §5).

Baseline counts at audit time: PCCST501 36 topics, PCCST502 31,
PCCST503 23, PECST522 30.

## 1. PCCST503 — Machine Learning

| KTU syllabus item | Existing note(s) | Status |
| --- | --- | --- |
| Feature representation | incidental mentions only (labs) | Partial |
| Problem formulation (T/E/P) | `m1_01`, labs | Covered |
| Loss functions | `m2_02`, `m3_01`, `m3_03` | Covered |
| Optimization | `m2_05` + usages | Covered |
| Gradient descent | `m2_05` (dedicated) | Covered |
| Matrix solution / normal equations | `m1_03` | Covered |
| Logistic regression | `m2_02` (dedicated) | Covered |
| Naive Bayes | `m2_03` (dedicated) | Covered |
| KNN | `m2_01` (dedicated) | Covered |
| ID3 | `m2_04` (dedicated) | Covered |
| Generalisation | `m1_04`, `m2_01`, ensembles | Covered |
| Overfitting | `m1_04`, `m2_01`, `m2_04`, ensembles | Covered |
| LASSO | MAP-duality framing in `m1_02` only | Partial |
| RIDGE | penalty mentions in `m1_03`/`m1_04` | Partial |
| Training/testing/validation discipline | `m1_04` (train/test, nested validation, LOO) | Covered |
| Precision (classification metric) | hits are Bayesian precision (1/variance), not the metric | Missing |
| Recall (classification metric) | hits are "Active Recall Quizzes" headers, not the metric | Missing |
| Accuracy | `m2_01`, `m2_03`, `m2_04`, drills | Covered |
| F-measure / F1 | no hits anywhere | Missing |
| ROC | no hits anywhere | Missing |
| AUC | no hits anywhere | Missing |
| MAE | no hits anywhere | Missing |
| RMSE | no hits anywhere | Missing |
| R-squared | `m1_04` (dedicated treatment) | Covered |
| SVM / hyperplane / margin | `m3_03` (dedicated) | Covered |
| Perceptron | `m3_01` (dedicated) | Covered |
| Multilayer networks | `m3_02` (dedicated) | Covered |
| Sigmoid / ReLU / Tanh | `m2_02`, `m3_02` | Covered |
| Backpropagation | `m3_02` (dedicated) | Covered |
| Similarity measures | `m4_01`, `m4_02`, `m4_06` usages | Covered |
| Hierarchical clustering | `m4_02` (dedicated) | Covered |
| Partitional clustering | K-means (`m4_01`) *is* partitional but the term is never named | Partial |
| K-means | `m4_01` (dedicated) | Covered |
| PCA | `m4_03` (dedicated) | Covered |
| MDS | `m4_06` (dedicated) | Covered |
| Bagging | `m4_04` (dedicated) | Covered |
| Boosting | `m4_05` (dedicated) | Covered |
| Bootstrapping | `m4_04`, `m4_05` | Covered |
| Cross-validation | single treatment in `m1_04` (LOO/nested); k-fold mechanics not taught | Partial |
| Bias–variance trade-off | `m1_04`, `m2_01` | Covered |

## 2. PCCST501 — Computer Networks

| KTU syllabus item | Existing note(s) | Status |
| --- | --- | --- |
| Application-layer paradigms | `m1_03` + HTTP/FTP/mail/DNS/P2P notes | Covered |
| TCP / UDP | M2 notes (`m2_01`–`m2_06`) | Covered |
| Sockets (concept) | `m1_03`, `m2_01` | Covered |
| TCP client/server programming (API level) | no `bind`/`listen`/`accept`/address-family content anywhere | Missing |
| `select` / `poll` multiplexed I/O | no hits anywhere | Missing |
| Advanced I/O (non-blocking, readiness) | no hits anywhere | Missing |
| Routing (concepts + algorithms) | `m2_10`, `m2_07` | Covered |
| Multicast | `m2_07` (dedicated) | Covered |
| IPv4 / IPv6 | `m2_09`, `m2_11` | Covered |
| QoS | `m2_08` (dedicated) | Covered |
| Linux routing and `ip` command (hands-on) | no `ip route`/`netstat`/Linux routing content | Missing |
| Data-link protocols (framing, PPP/HDLC family) | `m3_01` | Covered |
| Ethernet | `m3_03`, `m3_04` | Covered |
| WLAN / 802.11 | `m3_05` (dedicated) | Covered |
| Mobile IP | `m3_06` (dedicated) | Covered |
| `SOCK_PACKET` / `PF_PACKET` packet sockets | no hits anywhere | Missing |
| SNMP | `m4_01` (dedicated) | Covered |
| ASN.1 / SMI / MIB | `m4_07` (dedicated) | Covered |
| Digital/analog transmission, sampling, modulation | `m4_02`, `m4_03`, `m4_04` | Covered |
| Bandwidth / channel capacity | `m4_02`, `m4_06` | Covered |
| Transmission media | `m4_05` (dedicated) | Covered |

## 3. PCCST502 — Design and Analysis of Algorithms

Every item below has a dedicated teaching note: algorithm characteristics
(`m1_01`), time/space/best/worst/average (`m1_02`), asymptotic notations
(`m1_03`), iterative analysis (`m1_04`), recurrence methods
(`m1_05`–`m1_08`), AVL (`m1_09`–`m1_10`), disjoint sets/union-find with rank
+ path compression (`m2_01`), connected components via BFS/DFS (`m2_02`),
SCC/Kosaraju (`m2_03`), divide-and-conquer + merge sort + Strassen
(`m2_04`), topological sorting (`m2_05`), greedy abstraction + fractional
knapsack (`m3_01`), Kruskal/Prim (`m3_02`), Dijkstra (`m3_03`), DP +
optimality + matrix-chain (`m3_04`), backtracking + N-Queens (`m3_05`),
Floyd-Warshall (`m3_06`), branch-and-bound + TSP (`m4_01`–`m4_02`),
P/NP/NP-hard/NP-complete + reductions (`m4_03`), clique + vertex cover as
NPC exemplars (`m4_03` catalog + Clique proof), bin packing (`m4_04`),
Monte Carlo/Las Vegas + randomized quicksort (`m4_05`). Status: **Covered**
throughout. Two deepen-in-rewrite actions (no new files): name vertex
cover with a one-paragraph definition + reduction sketch inside `m4_03`
(it currently rides on the Clique proof), and keep little-o/little-omega
exactly where the existing syllabus mapping requires them (`m1_03`).

## 4. PECST522 — Artificial Intelligence

Every item below has a dedicated teaching note: AI definition/history
(`m1_01`), agents/environments/PEAS (`m1_02`), rationality (`m1_03`), task
environments (`m1_04`), agent architectures (`m1_05`), problem formulation
+ state space/search trees (`m1_06`–`m1_07`, labs), DFS/BFS/UCS (`m2_01`),
depth-limited/iterative deepening (`m2_02`), heuristics (`m2_03`), greedy
best-first (`m2_04`), A* (`m2_05`), generate-and-test (`m2_06`), CSP/AC-3
(`m2_07`), minimax (`m2_08`), alpha-beta (`m2_09`), Wumpus World (`m3_01`),
propositional logic (`m3_02`), entailment/inference/resolution/Horn
(`m3_03`), FOL/unification/forward/backward chaining (`m3_04`–`m3_05`),
passive RL/ADP/TD (`m4_02`), active RL/Q-learning/exploration–exploitation
(`m4_03`), policy search/apprenticeship/inverse RL (`m4_04`),
generalisation/applications (`m4_05`). Status: **Covered** throughout; no
new files. Rewrite focus is beginner-layering, not coverage.

## 5. Genuine gaps → new topics (added by this task)

1. `PCCST503/m2_06_classification_evaluation_metrics` — precision, recall,
   F1, ROC/AUC, confusion matrix (prereq: `m2_04`).
2. `PCCST503/m1_05_regression_metrics_regularisation` — MAE, RMSE, RIDGE,
   LASSO, k-fold cross-validation mechanics (prereq: `m1_04`).
3. `PCCST501/m1_09_socket_programming_select_poll` — socket API, TCP/UDP
   client–server flow, `select`/`poll`, non-blocking I/O,
   `SOCK_PACKET`/`PF_PACKET` (prereq: `m1_03`).
4. Linux `ip`-command routing practice folds into the `m2_10` rewrite
   (routing is its natural home, not a new file); the word "partitional"
   is named inside the `m4_01` rewrite; vertex-cover depth is added inside
   the `m4_03` rewrite.

No other Missing/Partial items remain unexplained: every other Partial is
deepened inside its existing note during the rewrite.
