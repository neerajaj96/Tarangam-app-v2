# Decision Trees: Entropy, Gain & Gain Ratio

**Impurity as surprise, splits as surprise-removal — entropy arithmetic, information gain, and why gain ratio dethrones cheat attributes.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Twenty Questions, Played Greedily
Each tree node asks the question removing the most uncertainty. **Entropy** measures the current confusion; **information gain** measures confusion destroyed by a candidate split. **Gain ratio** then discounts questions that "cheat" by inventing a branch per sample (like ID numbers) — great gain, zero wisdom.
:::

Trees trade the smooth geometry of M3.1–M3.3 for crisp rules engineers can print on a safety placard — different machinery, same classification job as M2.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Entropy and gain

For class fractions $p_i$, entropy $H = -\sum p_i \log_2 p_i$ (bits of surprise). Split gain: $Gain = H(parent) - \sum (n_v/n) H(child_v)$. Pure nodes score $0$; balanced binary nodes score $1$.

### 2.2 Gain ratio's correction

$SplitInfo = -\sum (n_v/n)\log_2(n_v/n)$ prices the split's fragmentation; $GainRatio = Gain / SplitInfo$. ID-like attributes with huge $SplitInfo$ see their inflated gain deflated — C4.5's fix for ID3's bias toward many-valued attributes.

::: callout-formula KTU Formula Vault: Splits
$H = -\sum p\log_2 p$ · $Gain = H - \sum (n_v/n)H_v$ · $SplitInfo$ prices fragmentation · ratio $= Gain/SplitInfo$ · pure $= 0$ bits.
:::

$\log_2$ values worth memorizing: $\log_2(1/3) \approx -1.585$, $\log_2(2/3) \approx -0.585$, $\log_2(0.3) \approx -1.737$, $\log_2(0.4) \approx -1.322$.

::: callout-pitfall Gain Favours Fragmentation
Raw gain elects customer-ID-style attributes (one branch per row, gain maximal, generalization zero). Any 3-marker answer picking the ID column by gain alone without the ratio correction repeats ID3's famous bias.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
10 play-tennis days: $6$ Yes, $4$ No. Split on Outlook: Sunny $3$ ($1$Y/$2$N), Overcast $3$ ($3$Y/$0$N), Rain $4$ ($2$Y/$2$N). Compute parent entropy, weighted child entropy, gain, SplitInfo, and gain ratio.
:::

::: step [Step 2: Execution] Bits In, Bits Out
Parent $H = -(0.6\log_2 0.6 + 0.4\log_2 0.4) = 0.4422 + 0.5288 = 0.9710$. Children: $H(\text{Sunny}) = 0.918$, $H(\text{Overcast}) = 0$, $H(\text{Rain}) = 1.0$. Weighted $= 0.3(0.918) + 0.3(0) + 0.4(1.0) = 0.6754$. Gain $= 0.9710 - 0.6754 = 0.2956$. SplitInfo $= -(0.3\log_2 0.3 + 0.3\log_2 0.3 + 0.4\log_2 0.4) = 0.5211 + 0.5211 + 0.5288 = 1.5710$. Ratio $= 0.2956/1.5710 \approx 0.1882$.
:::

::: step [Step 3: Conclusion] Final Result
Gain $0.2956$, ratio $0.1882$. Overcast's pure node contributed zero entropy — pure children are free certainty, and the ratio keeps fragmented-but-shallow splits honest.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Entropy Extremes
Entropy of a $5$Y/$5$N node versus a $10$Y/$0$N node?
(A) $0$ and $1$ respectively
(*B) $1.0$ bit for the balanced node and $0$ bits for the pure node — maximum confusion versus none at all
(C) Both $0.5$
(D) Undefined for pure nodes
::: explanation
$-(0.5\log_2 0.5 + 0.5\log_2 0.5) = 1$; pure $-(1\log_2 1) = 0$. Extremes first: balance maximizes surprise, purity kills it.
:::

::: quiz Q2: ID-Column Trap
An ID attribute gives gain $0.97$ (maximal) on $10$ samples. Trust it?
(A) Yes, maximal gain rules
(*B) No — one branch per sample memorizes rows with zero transfer, and gain ratio's huge SplitInfo ($\log_2 10 \approx 3.32$) deflates it to $\approx 0.29$, exposing the cheat
(C) Yes for ID3, no for humans
(D) SplitInfo is irrelevant here
::: explanation
Gain rewards fragmentation; the ID column is pure fragmentation. Ratio divides by the fragmentation price — that correction is the entire C4.5 lesson.
:::

::: quiz Q3: Log Discipline
A student computes entropy with natural log. Status?
(A) Wrong, always
(*B) Valid up to units (nats vs bits) — rankings and gains are consistent within one base, but KTU expects base $2$ (bits), so convert or relabel explicitly
(C) Gains become negative
(D) Log base changes the argmax split
::: explanation
Base scales all entropies by a constant, preserving comparisons. Marks need bits though — state the base, and mixed-base arithmetic across nodes is the real error.
:::
