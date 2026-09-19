# KNN: Lazy Learning by Neighbourhood Vote

**No training phase at all — memorize every point, and at query time let the $k$ nearest neighbours vote, distances computed by hand.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Newcomer at the Canteen
KNN seats a newcomer with whoever sits closest: look at the $k$ nearest occupied tables and join the majority. $k = 1$ copies the single nearest neighbour (jagged, nervous boundaries); large $k$ polls the whole canteen (smooth, possibly deaf to local flavour). Odd $k$ dodges binary ties.
:::

Lazy like no other syllabus classifier: training is free, each query scans the dataset — the mirror image of eager Naive Bayes (M2.1), which trains once and predicts fast.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The vote mechanics

Store all training points. For query $q$, compute Euclidean distances $d(x, q) = \sqrt{\sum (x_i - q_i)^2}$, take the $k$ smallest, majority-vote (weight by $1/d$ optionally). **Scale features first**: a kilometre-axis silently outvotes a millimetre-axis without normalization.

### 2.2 Choosing $k$

Small $k$ overfits noise; huge $k$ underfits structure. Cross-validation (M2.4) picks $k$; ties broken by nearest-first or odd $k$ in binary tasks.

::: callout-formula KTU Formula Vault: KNN
$d = \sqrt{\sum (x_i-q_i)^2}$ · $k$ smallest vote · odd $k$ avoids binary ties · scale before measuring · big $k$ smooths, small $k$ memorizes.
:::

Curse of dimensionality (also in `PECST632` M1) bites KNN first: in high dimensions every neighbour is far, and "nearest" stops meaning much.

::: callout-pitfall Unscaled Axes Swindle
A feature spanning $[0, 1000]$ contributes a million times the squared distance of one spanning $[0, 1]$. Any worked answer computed on raw mixed-scale axes without a scaling remark loses the method mark.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Training points: $A(1,1) = +$, $B(2,2) = +$, $C(5,5) = -$, $D(6,6) = -$. Query $Q(3,3)$. Compute all distances and classify with $k = 3$, then state $k = 1$.
:::

::: step [Step 2: Execution] Measuring and Voting
$d(A,Q) = \sqrt{4+4} \approx 2.828$; $d(B,Q) = \sqrt{1+1} \approx 1.414$; $d(C,Q) \approx 2.828$; $d(D,Q) = \sqrt{9+9} \approx 4.243$. Three nearest: $B(+)$, $A(+)$, $C(-)$ — vote $2$ to $1$ for $+$. With $k = 1$, nearest is $B$, also $+$.
:::

::: step [Step 3: Conclusion] Final Result
$k = 3$ predicts $+$ (2-vs-1), $k = 1$ predicts $+$ via $B$. Note the symmetry trap: $A$ and $C$ tie at $2.828$ but $B$ breaks it — always sort fully before voting, never eyeball "closest cluster".
:::

::: anim knn-tiebreak A and C Tie, B Breaks It
Watch all four arrows land with the A–C tie at 2.828 in the open — sorted fully, never eyeballed, with B breaking the symmetry.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Tie Discipline
Query equidistant to one $+$ and one $-$ point with $k = 2$. Correct handling?
(A) Always predict $+$
(*B) Declare the tie explicitly, then break it by rule (nearest-first, odd $k$, or distance weighting) rather than silently picking a side
(C) Ties are impossible in KNN
(D) Average the labels into $0$
::: explanation
$k = 2$ binary votes can split $1$-$1$ with no majority. A stated tie-break is method; a silent pick is luck. Examiners plant equidistant queries deliberately.
:::

::: quiz Q2: Scaling Verdict
Features: age $[0, 100]$, salary $[0, 100000]$. Raw Euclidean KNN. Problem?
(A) None, Euclidean handles scales
(*B) Salary differences dominate squared distance — salary terms reach $10^{10}$-scale while age terms peak at $10^4$-scale, so age is effectively ignored until both axes are standardized
(C) Age dominates instead
(D) KNN cannot use numeric features
::: explanation
Distance has no notion of units — $10{,}000$ salary gap dwarfs a $10$-year age gap numerically, not semantically. Standardize (or min-max scale) so axes compete fairly.
:::

::: quiz Q3: Lazy vs Eager
Which statement about KNN training cost is exam-safe?
(A) KNN fits weights over many epochs
(*B) KNN has no training phase beyond storing data, shifting all compute to query time, unlike eager methods that pay upfront and predict cheaply
(C) KNN cannot predict at all
(D) Storing data counts as gradient descent
::: explanation
Lazy means defer: memorize now, compute later. That is why KNN scales badly to millions of queries yet adapts instantly to new points — no retraining, just append.
:::
