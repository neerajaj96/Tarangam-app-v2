---
id: m2_04_decision_trees_entropy_information_gain
courseCode: PCCST503
module: 2
sequence: 4
title: 'Decision Trees: Entropy & Information Gain'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the recursive-splitting problem in plain words first
  - Split recursively on maximum information gain from Shannon entropy
  - Verify gains on the PlayTennis computation
  - Control overfitting with pre- and post-pruning
concepts:
  - Shannon entropy
  - information gain
  - pruning
prerequisites: []
examRelevance: high
tags:
  - classification
  - decision-trees
---
# Decision Trees: Entropy & Information Gain

**What problem trees solve with axis-aligned questions, what labelled data they need, how entropy ranks questions, and how pruning stops memorisation.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

You play Twenty Questions to guess an animal. Each question should remove as much uncertainty as possible. "Is it bigger than a breadbox?" beats "does it like rain?" A decision tree asks the best question, then the next best given the answer, until leaves are pure enough to decide.

Tiny beginner example. Four animals: two cats, two dogs. Question "barks?" splits into {two dogs} and {two cats}: perfect, uncertainty removed. Question "is brown?" splits into mixed groups: weak. Information gain scores exactly this difference in bits.

Analogy as support, then dropped. Mess means mixed labels; gain means mess removed. From here on we use exact terms only: entropy, information gain, Iterative Dichotomiser 3 (ID3), pruning.

Abbreviations defined on first use: Iterative Dichotomiser 3 (ID3), Classification and Regression Trees (CART). Symbols are defined before use below.

| Question to ask | Meaning |
|---|---|
| What is $H(S)$? | Entropy of set $S$, mess in bits |
| What is $p_i$? | Proportion of class $i$ in $S$ |
| What is Gain? | Parent mess minus weighted child mess |

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

**Problem.** Build readable if-then rules that classify by asking few questions.

**Data.** Labelled rows with discrete or binned features (Outlook, Humidity, Wind, Temperature) and a label (Play Yes or No).

**Goal.** Small tree with high held-out accuracy. Greedy top-down induction picks max gain per node; pruning then trades purity for generalisation.

Symbols: for class proportions $p_i$, $H(S)=-\sum_i p_i\log_2 p_i$ in bits. Here $\log_2$ means base-2 log so the unit is bits. Gain of attribute $A$ with values $v$: $\text{Gain}(S,A)=H(S)-\sum_v(|S_v|/|S|)H(S_v)$. Here $S_v$ is the subset with value $v$.

::: callout-intuition Core Mental Model: Twenty Questions, Optimized
A decision tree plays Twenty Questions: each node asks the single question slicing remaining possibilities most unevenly ("is it bigger than a breadbox?"). **Entropy** measures the current mess (all-yes/all-no = 0 mess; 50/50 = maximum mess); **information gain** scores each candidate question by *mess removed*. Ask the biggest-gain question, recurse per answer, stop when leaves are pure (or patience runs out). Overfitting = asking until every training example gets its own private leaf — memorizing the crowd instead of learning the pattern.
:::

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (readable classification) → data (labelled rows) → goal (compact, generalising tree) → method (gain-guided splits plus pruning) → model (tree of tests) → training (greedy induction) → example → limitations.

### 3.1 Entropy and Information Gain, Symbol by Symbol

$H(S)=-\sum_i p_i\log_2 p_i$. Pure set ($p=1$) gives $0$ bits; 50/50 binary gives $1$ bit maximum. Gain subtracts weighted child entropy from parent entropy. Steps numbered:

1. Compute parent entropy $H(S)$.
2. For each attribute, split into value groups $S_v$.
3. Compute weighted child entropy $\sum(|S_v|/|S|)H(S_v)$.
4. Pick max gain; recurse per child.

CART uses Gini impurity $1-\sum p_i^2$ instead: same instinct, cheaper arithmetic.

### 3.2 The PlayTennis Computation

14 days, 9 Play-Yes and 5 No: $H(S)=-(9/14\log_2 9/14+5/14\log_2 5/14)\approx\mathbf{0.940}$ bits. Gains: **Outlook 0.247**, Humidity 0.151, Wind 0.048, Temperature 0.029. Outlook splits the root (Sunny branch, Overcast instant Yes-leaf, Rain branch); recurse within Sunny and Rain subsets.

### 3.3 Taming Overfit: Pruning and Honest Cousins

- **Pre-pruning:** stop early (max depth, min samples per leaf, gain threshold). Fast, risks stopping before useful structure.
- **Post-pruning:** grow fully, then snip subtrees that do not pay on validation data (reduced-error pruning, cost-complexity or CART $\alpha$-pruning).
- Gain's bias footnote: many-valued attributes (dates, IDs) score inflated gains by shattering data. **Gain ratio** (C4.5) normalises by split entropy. A Date root with one example per leaf is memorisation wearing mathematics.

| Similar pair | Distinction that earns marks |
|---|---|
| Gain vs gain ratio | Raw mess removed vs normalised; IDs shatter gain, ratio resists |
| Pre- vs post-pruning | Stop early risking under-shoot vs grow then validation-snip costing a split |
| Entropy vs Gini | Log-based bits vs squared-probability shortcut; same ranking instinct |

::: callout-formula KTU Formula Vault: Tree Facts
$H = -\sum p\log_2 p$ (0 = pure, 1 = 50/50 binary max) · $\text{Gain} = H(parent) - \sum\frac{|S_v|}{|S|}H(S_v)$ · root = **max gain** (Tennis: Outlook 0.247) · prune **pre** (early stop) or **post** (validation snip) · many-valued attributes need **gain ratio**, not raw gain.
:::

::: callout-pitfall Pure Leaves Memorize Noise (and IDs Memorize Everything)
A tree grown to 100% training purity on noisy data encodes the noise as law — test accuracy collapses while train sits at 1.0 (the k-NN $k=1$ disease, arboreal form). And any near-unique attribute (ID, date) "wins" gain by isolation, not insight. Prune by validation; distrust splits that merely enumerate.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

::: step [Step 1: Setup] Formulating the Problem
Using the PlayTennis counts, verify $H(S) = 0.940$ and Gain(Wind) $= 0.048$, and decide the root split among Outlook (0.247), Humidity (0.151), Wind (0.048), Temperature (0.029).
:::

::: step [Step 2: Execution] Computing Mess Removed
$H(S) = -(0.6429 \times \log_2 0.6429 + 0.3571 \times \log_2 0.3571) = -(-0.4098 - 0.5305) = 0.940$ bits. Wind splits 8 weak ($6{+},2{-}$) / 6 strong ($3{+},3{-}$): $H_{weak} = 0.811$, $H_{strong} = 1.0$; weighted $(8/14)(0.811) + (6/14)(1.0) = 0.892$; gain $= 0.940 - 0.892 = \mathbf{0.048}$. Root = max gain = **Outlook (0.247)** — Sunny and Rain branches recurse; Overcast ($4{+},0$) is an instant Yes-leaf.
:::

::: step [Step 3: Conclusion] Final Result
One number per attribute ranks the questions; the ranking *is* the tree's skeleton. Outlook first because nothing else removes nearly as much mess (0.247 vs runner-up Humidity 0.151) — greedy gain-chasing builds the whole tree one best-question-at-a-time, with pruning (not shown) as the adult supervision.
:::

::: anim gain-bars Outlook Outbids Wind Five to One
Watch the gain bars rank the questions — Outlook crowned root, Wind a later conditional — with the instant Overcast Yes-leaf as the payoff for asking best-first.
:::

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Splitting on CustomerID because gain is highest. Singleton leaves are pure by construction and learn nothing transferable.
- Growing to 100% train purity on noisy data. Train 1.0 with weak test is memorisation.
- Reading low gain as useless. Low-gain attributes can matter deeper, conditionally.
- Confusing pre- and post-pruning costs. Early stop risks underfit; validation snip costs a split.

Limitations: greedy splits are myopic, axis-aligned cuts struggle on diagonal truth, and deep trees are high-variance until ensembled.

Exam recap: $H=-\sum p\log_2 p$; gain is parent minus weighted children; Tennis root Outlook 0.247; prune pre or post; IDs need gain ratio.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Gain(Wind) = 0.048 while Gain(Outlook) = 0.247. In plain terms, what do these numbers say about the two attributes?
() Wind is useless and should be deleted from the dataset
(*) Splitting on Outlook removes ~5× more uncertainty (0.247 bits) than splitting on Wind (0.048) — Outlook is the far more informative root question, though Wind may still help deeper in the tree
() Wind must be the root because smaller gains are always better
() Gains below 0.1 indicate corrupted data
::: explanation
Gain prices *questions in bits of mess removed*: 0.247 vs 0.048 means Outlook clarifies roughly five times more. Root goes to the top bidder; low-gain attributes aren't trash — they're later, conditional questions (Wind matters *within* rainy days, say). Ranking, not exile.
:::

::: quiz A "CustomerID" attribute (unique per row) achieves the highest gain on a churn dataset. Split on it?
() Yes — max gain is max gain; the tree is optimal
(*) No — it shatters data into singletons (zero child entropy, vacuous "perfect" gain) that memorize rows instead of patterns; use gain ratio or drop ID-like attributes — pure training purity, zero generalization
() Yes, but only with pre-pruning disabled
() Split on it twice for extra confidence
::: explanation
Unique identifiers maximize gain *mechanically* (each leaf pure by construction) while learning literally nothing transferable. Gain ratio divides by split entropy to punish shattering; better still, exclude IDs from features — the model equivalent of refusing to memorize phone books.
:::

::: quiz A fully grown tree hits 100% train accuracy but 62% test accuracy. Name the disease and two cures from opposite directions.
() Underfitting; cures: grow deeper, add more features
(*) Overfitting (variance disease — leaves memorizing noise); cures: constrain (max depth / min-leaf / gain threshold — pre-pruning) or grow-then-snip against validation data (post-pruning); the exam also accepts ensembling (forests average the variance away)
() Data leakage; cures: delete the test set
() The tree is optimal; 62% is the Bayes limit here
::: explanation
Train 1.0 + test 0.62 = memorization signature (same disease as 1-NN). Pre-pruning stops the growth early (risks under-shooting); post-pruning grows fully then validates each snip (costs a validation split); forests sidestep both by averaging many overfit trees. Three exits, one diagnosis.
:::
