---
id: m2_03_naive_bayes_generative_models
courseCode: PCCST503
module: 2
sequence: 3
title: 'Naive Bayes: Generative Classification'
difficulty: beginner
estimatedMinutes: 6
learningObjectives:
  - Classify with Bayes rule under the conditional-independence bet
  - Smooth counts with Laplace correction against zero vetoes
  - Contrast generative and discriminative training stories
concepts:
  - naive Bayes
  - Laplace smoothing
  - generative models
prerequisites:
  - m1_02_probability_mle_map_estimation
examRelevance: medium
tags:
  - classification
  - naive-bayes
---
# Naive Bayes: Generative Classification

**Bayes' rule as classifier, the conditional-independence bet, Gaussian vs. multinomial flavors, Laplace smoothing, and discriminative vs. generative framing.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Symptom Detective
A patient shows fever + cough. Instead of drawing a flu/no-flu *boundary* (discriminative), the detective models each disease's *symptom generator*: how often does flu produce fever? a cold? Then flips it with Bayes: $P(\text{flu} \mid \text{symptoms}) \propto P(\text{symptoms} \mid \text{flu})\,P(\text{flu})$. **Naive** Bayes makes one sweeping simplification — symptoms independent *given* the disease (fever tells nothing new about cough once flu is known) — usually false, usually harmless, always fast.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The Classifier Equation

$$\hat{y} = \arg\max_c\; P(y=c) \prod_{j=1}^d P(x_j \mid y=c)$$

— prior × per-feature likelihoods, with the **naive independence** $P(x \mid c) = \prod_j P(x_j \mid c)$ doing all the work. Decide by argmax; the denominator $P(x)$ is constant across classes and dropped.

### 2.2 Three Flavors (One Per Feature Type)

* **Multinomial/Bernoulli NB** (text, discrete counts): likelihoods are frequency tables with **Laplace smoothing** ($+\alpha$ pseudocounts — usually $\alpha=1$): $P(w \mid c) = \frac{\text{count}(w,c) + \alpha}{\sum_{w'}\text{count}(w',c) + \alpha|V|}$. Zero counts would *veto* entire classes (one unseen word zeroes the product) — smoothing is load-bearing, not cosmetic.
* **Gaussian NB** (continuous features): $P(x_j \mid c) = \mathcal{N}(\mu_{jc}, \sigma^2_{jc})$ with per-class MLE means/variances — closed form, one pass.
* Training everywhere = counting (or averaging): no iteration, no gradients, $O(nd)$ once.

### 2.3 Generative vs. Discriminative

* **Generative** (NB, LDA, HMMs): model *how each class generates data* $P(x \mid y)$ (+ prior) — can *sample* new emails, handles missing features by marginalizing, learns fast from little data.
* **Discriminative** (logistic regression, SVMs, trees): model the *boundary* $P(y \mid x)$ directly — asymptotically *more accurate* with big data (Ng–Jordan: logistic needs $O(n)$ samples to NB's $O(\log n)$ to approach its *higher* ceiling).

::: callout-formula KTU Formula Vault: NB Facts
Decide $\arg\max_c P(c)\prod P(x_j|c)$ · **naive** = features independent *given class* · smooth counts (**+α**, kills zero-vetoes) · Gaussian flavor = **per-class MLE** · generative: **fast to train, can sample**; discriminative: **higher ceiling, needs data**.
:::

::: callout-pitfall Independence Is Assumed of Features Given Class — Nothing Else
"Naive" never claims features are independent *overall* (fever and cough obviously correlate!) — only *within* a class. Correlated-given-class features (repeated synonyms in spam) get double-counted, skewing confidence — yet classifications often survive because only the *argmax order*, not calibrated odds, must be right.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Vocabulary {free, money, lunch}; training word counts — spam {free:4, money:3, lunch:0} over 7 spam-words; ham {free:1, money:0, lunch:3} over 4 ham-words. Priors from 4 spam / 6 ham docs: $P(S)=0.4$, $P(H)=0.6$. Classify "free lunch" with Laplace $\alpha=1$, $|V|=3$. (Arithmetic verified.)
:::

::: step [Step 2: Execution] Scoring Both Classes
Likelihoods — spam: $P(\text{free}|S)=(4+1)/(7+3)=0.5$, $P(\text{lunch}|S)=(0+1)/10=0.1$. Ham: $P(\text{free}|H)=(1+1)/(4+3)=2/7\approx0.286$, $P(\text{lunch}|H)=(3+1)/7=4/7\approx0.571$.
Scores: $S: 0.4 \times 0.5 \times 0.1 = 0.020$; $H: 0.6 \times 0.286 \times 0.571 \approx 0.098$. **Ham wins ~5:1** — "lunch" (unseen in spam training, rescued by smoothing from a zero-veto) plus the ham prior carry the verdict.
:::

::: step [Step 3: Conclusion] Final Result
Without smoothing, $P(\text{lunch}|S)=0$ would zero spam's score *regardless* of "free" — one unseen word holding the whole class hostage. Laplace's $+1$ prices ignorance gracefully instead: unseen ≠ impossible, merely rare. That single $+1$ is doing more classification work than the entire independence assumption.
:::

::: anim nb-scores Ham Wins 5 to 1 on Free Lunch
Watch the two products build factor by factor — 0.020 against 0.098 — with the +1-rescued lunch likelihood doing the heaviest lifting in the smaller bar.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz In the worked example, what exactly would break without Laplace smoothing, and why is the breakage catastrophic rather than mild?
() Nothing — smoothing only speeds up computation
(*) P(lunch|spam) = 0/7 = 0 zeroes spam's entire product no matter how spammy the other words are — a single unseen feature holds an absolute veto over the class
() The priors would fail to sum to one
() Ham's score would also become exactly zero
::: explanation
Products amplify zeros absolutely: any $P(x_j|c)=0$ annihilates the class score irrespective of all other evidence. Smoothing replaces "never seen" (probability 0) with "rare" (small positive) — the difference between a veto and a vote. Load-bearing $+1$.
:::

::: quiz Naive Bayes assumes features independent given the class — yet it thrives on text, where words obviously correlate. How is this not fatal?
() Text words are actually statistically independent; the correlation is a myth
(*) Classification needs only the correct argmax order, not calibrated probabilities — correlated features skew confidence magnitudes while usually preserving which class scores highest
() Naive Bayes secretly models all correlations via the prior
() It is fatal; NB never works on text in practice
::: explanation
Decision quality $\neq$ probability quality: double-counted synonyms inflate *both*... precisely, inflate scores unevenly yet the *ranking* typically survives (Domingos–Pazzani's classic result: NB is optimal under far weaker conditions than independence, including functional dependencies). Wrong odds, right answers — good enough for argmax.
:::

::: quiz When should you prefer a generative classifier (NB) over a discriminative one (logistic regression), and vice versa?
() Always prefer NB — it is strictly more accurate with any data size
(*) Little data / missing features / need to sample new examples → generative (fast, robust, marginalizes); big data and pure accuracy → discriminative (higher asymptotic ceiling — Ng–Jordan O(log n) vs O(n) sample complexity)
() Discriminative models cannot handle text at all
() Generative models cannot output probabilities
::: explanation
NB converges to *its* (lower) ceiling in $O(\log n)$ samples; logistic needs $O(n)$ to reach its *higher* one — they cross. Small-data regime: NB wins. Big-data regime: logistic wins. Missing features: only generative marginalizes gracefully. Match the model to the data budget.
:::
