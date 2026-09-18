# Naive Bayes: Independence That Pays

**Flip the conditional with Bayes' rule, pretend features are independent given the class, multiply — and a spam filter you can compute by hand.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Naive Witnesses
Each word testifies independently about spam-ness, and Naive Bayes **multiplies the testimonies** instead of modelling their conspiracies. The independence assumption is usually false (words collude), yet the classifier wins because ranking needs only the right winner, not exact probabilities.
:::

Generative thinking (model each class, then flip with Bayes) contrasts with the discriminative logistic regression of `PCCST503` M2 — same classification job, opposite direction of attack.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The decision rule

Bayes' rule gives $P(c \mid x) \propto P(c)\prod_i P(x_i \mid c)$ under the conditional-independence assumption. Predict the class with the largest score; work in log-space ($\log P(c) + \sum \log P(x_i \mid c)$) to avoid underflow. Zero counts need Laplace smoothing (add-one) so one unseen word cannot veto everything.

### 2.2 When it shines

Tiny data, huge vocabularies, text and categorical features. Correlated features double-count evidence — the known price of naivety.

::: callout-formula KTU Formula Vault: Naive Bayes
Score$(c) = P(c)\prod_i P(x_i \mid c)$ · log form adds · unseen word → smooth, never zero · argmax wins, calibration optional.
:::

Priors matter: balanced lab data hides them, but real inboxes are 95 percent ham, and the prior carries that base rate.

::: callout-pitfall Dropping the Prior
Comparing only $\prod P(x_i \mid c)$ and forgetting $P(c)$ silently assumes balanced classes. With $P(\text{spam}) = 0.3$ versus $0.7$, the prior alone is a $0.3/0.7$ head start examiners love to test.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$P(\text{spam}) = 0.3$, $P(\text{ham}) = 0.7$. Word likelihoods: $P(\text{offer} \mid \text{spam}) = 0.4$, $P(\text{offer} \mid \text{ham}) = 0.05$, $P(\text{meeting} \mid \text{spam}) = 0.1$, $P(\text{meeting} \mid \text{ham}) = 0.5$. A mail contains both "offer" and "meeting". Classify it.
:::

::: step [Step 2: Execution] Multiplying Testimonies
Spam score $= 0.3 \times 0.4 \times 0.1 = 0.012$. Ham score $= 0.7 \times 0.05 \times 0.5 = 0.0175$. Total $= 0.0295$, so $P(\text{spam} \mid \text{words}) = 0.012/0.0295 \approx 0.4068$. "Offer" screams spam but "meeting" plus the ham-heavy prior outvote it.
:::

::: step [Step 3: Conclusion] Final Result
Ham wins ($0.5932$ vs $0.4068$). Lesson: strong single clues lose to prior-plus-two-mild-clues — always multiply all three factors, never eyeball one word.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$P(S) = 0.5$, $P(w \mid S) = 0.8$, $P(w \mid H) = 0.2$. Mail with $w$ only. $P(S \mid w)$?
(A) $0.8$ by likelihood alone
(*B) Scores $0.5 \times 0.8 = 0.4$ vs $0.5 \times 0.2 = 0.1$, so $0.4/0.5 = 0.8$ — equal priors let likelihoods decide, but the prior was still multiplied
(C) $0.5$ always with one word
(D) $0.2$ by ham likelihood
::: explanation
Equal priors cancel numerically but not conceptually — the $0.5$ factors were multiplied before dividing. Dropping them as "irrelevant" fails the next question where priors differ.
:::

::: quiz Q2: Zero-Count Trap
A test word never appeared in ham training data. Unsmoothed $P(w \mid \text{ham}) = 0$. Consequence?
(A) Nothing, other words compensate
(*B) The entire ham score becomes $0$ regardless of other evidence, so every such mail is called spam — Laplace smoothing exists precisely to prevent this veto
(C) The spam score also becomes $0$
(D) Priors auto-correct it
::: explanation
Multiplication by zero is absolute: one unseen word annihilates all other testimony. Add-one smoothing gives unseen events a small nonzero share and removes the veto.
:::

::: quiz Q3: Independence Honesty
"Naive Bayes assumes features are independent." What is the precise (exam-safe) version?
(A) Features are fully independent, period
(*B) Features are assumed independent given the class, which still permits correlation through the class while ignoring direct word-to-word conspiracies
(C) Classes are independent of features
(D) Priors are independent of likelihoods
::: explanation
"Given the class" is doing all the work: spam-ness may correlate words, but given spam, words are treated as separate witnesses. The qualifier is worth the mark.
:::
