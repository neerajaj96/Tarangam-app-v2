---
id: m2_03_naive_bayes_generative_models
courseCode: PCCST503
module: 2
sequence: 3
title: 'Naive Bayes: Generative Classification'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the generative classification problem in plain words first
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

**What problem generative classifiers solve, what count data they need, how Naive Bayes (NB) trains by counting with smoothing, and where independence helps or hurts.**

<a id="the-intuition"></a>
## 1. Start Here: The Problem Before Any Solution (Absolute Beginner)

A patient has fever and cough. Is it flu or cold? Instead of drawing a boundary, model each disease's symptom generator: how often does flu cause fever? Then flip with Bayes' rule to get disease given symptoms.

Tiny beginner example. Prior: 40% spam, 60% ham. Word "free" appears often in spam, rarely in ham. Mail says "free." Multiply prior times likelihood per class; the larger product wins. Two numbers in, one verdict out. That is the whole classifier.

Analogy as support, then dropped. Think of a symptom detective who knows each disease's habits, then reverses the question. From here on we use exact terms only: prior, likelihood, posterior, conditional independence, smoothing.

Abbreviations defined on first use: Naive Bayes (NB). Symbols are defined before use below.

| Question to ask | Meaning |
|---|---|
| What is $P(y=c)$? | Prior, how common class $c$ is |
| What is $P(x_j\mid y=c)$? | Likelihood of feature $j$ under class $c$ |
| What is naive? | Features independent given the class |

<a id="symbols-data-goal"></a>
## 2. Data, Goal and Symbols (Basic Understanding)

**Problem.** Classify discrete or continuous features when training data are scarce or features go missing.

**Data.** Labelled pairs with features $x=(x_1,\dots,x_d)$ and class $y=c$. Text uses counts; continuous features use per-class means and variances.

**Goal.** High accuracy via $\hat{y}=\arg\max_c P(y=c)\prod_j P(x_j\mid y=c)$. Here $\arg\max$ means pick the class with the largest score; denominator $P(x)$ is constant across classes and dropped. The naive independence $P(x\mid c)=\prod_j P(x_j\mid c)$ does all the work: it is usually false, usually harmless, always fast.

::: callout-intuition Core Mental Model: The Symptom Detective
A patient shows fever + cough. Instead of drawing a flu/no-flu *boundary* (discriminative), the detective models each disease's *symptom generator*: how often does flu produce fever? a cold? Then flips it with Bayes: $P(\text{flu} \mid \text{symptoms}) \propto P(\text{symptoms} \mid \text{flu})\,P(\text{flu})$. **Naive** Bayes makes one sweeping simplification — symptoms independent *given* the disease (fever tells nothing new about cough once flu is known) — usually false, usually harmless, always fast.
:::

<a id="the-math"></a>
## 3. Method, Model and Training (Formal Theory)

Canonical order: problem (classify with little data) → data (labelled feature vectors) → goal (correct argmax) → method (model each class generator) → model (prior times product) → training (count or average, one pass) → example → limitations.

### 3.1 The Classifier Equation, Symbol by Symbol

$$\hat{y} = \arg\max_c\; P(y=c) \prod_{j=1}^d P(x_j \mid y=c)$$

$P(y=c)$ is the prior; each $P(x_j\mid y=c)$ is one feature's evidence; the product is joint evidence under independence; $\arg\max$ picks the winner.

### 3.2 Three Flavors, One Per Feature Type

- **Multinomial and Bernoulli NB** (text, discrete counts): likelihoods are frequency tables with Laplace smoothing ($+\alpha$ pseudocounts, usually $\alpha=1$): $P(w\mid c)=(\text{count}(w,c)+\alpha)/(\sum_{w'}\text{count}(w',c)+\alpha|V|)$. Here $|V|$ is vocabulary size. Zero counts would veto entire classes (one unseen word zeroes the product); smoothing is load-bearing, not cosmetic.
- **Gaussian NB** (continuous features): $P(x_j\mid c)=\mathcal{N}(\mu_{jc},\sigma^2_{jc})$ with per-class MLE means and variances. Closed form, one pass.
- Training everywhere is counting or averaging: no iteration, no gradients, $O(nd)$ once.

Steps numbered:

1. Count priors and per-feature likelihoods on train.
2. Add $\alpha$ smoothing to every count.
3. For a query, multiply prior times likelihoods per class.
4. Argmax; optionally normalise for probabilities.

### 3.3 Generative versus Discriminative

- **Generative** (NB, Linear Discriminant Analysis (LDA), Hidden Markov Models (HMMs)): model how each class generates data $P(x\mid y)$ plus prior. Can sample new examples, handles missing features by marginalising, learns fast from little data.
- **Discriminative** (logistic regression, Support Vector Machines (SVMs), trees): model the boundary $P(y\mid x)$ directly. Asymptotically more accurate with big data (Ng-Jordan: logistic needs $O(n)$ samples to NB's $O(\log n)$ to approach its higher ceiling). Correct qualification: this is an asymptotic sample-complexity comparison under standard assumptions, not a guarantee on every dataset; with enough clean data the discriminative ceiling usually wins, with little data generative often wins sooner.

| Similar pair | Distinction that earns marks |
|---|---|
| Generative vs discriminative | Model $P(x\mid y)$ (fast, sampleable) vs $P(y\mid x)$ boundary (higher ceiling, hungrier) |
| Laplace $\alpha=1$ vs $\alpha=0$ | Priced rarity vs absolute veto; unseen is rare, not impossible |
| Independence given class vs overall | Only within-class independence assumed; overall correlation remains |

::: callout-formula KTU Formula Vault: NB Facts
Decide $\arg\max_c P(c)\prod P(x_j|c)$ · **naive** = features independent *given class* · smooth counts (**+α**, kills zero-vetoes) · Gaussian flavor = **per-class MLE** · generative: **fast to train, can sample**; discriminative: **higher ceiling, needs data**.
:::

::: callout-pitfall Independence Is Assumed of Features Given Class — Nothing Else
"Naive" never claims features are independent *overall* (fever and cough obviously correlate!) — only *within* a class. Correlated-given-class features (repeated synonyms in spam) get double-counted, skewing confidence — yet classifications often survive because only the *argmax order*, not calibrated odds, must be right.
:::

<a id="worked-example"></a>
## 4. KTU Worked Example Step by Step

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

<a id="watch-out-recap"></a>
## 5. Watch Out, Limitations and Exam Recap

Common mistakes and confusions:

- Dropping the prior. Priors decide close calls; ham won partly on 0.6 versus 0.4.
- Forgetting smoothing. One zero vetoes a class absolutely.
- Claiming independence holds in text. It does not; only argmax order survives double-counting.
- Expecting calibrated probabilities. NB ranks well but skews magnitudes under correlation.

Limitations: correlated-given-class features distort confidence; Gaussian flavour assumes per-class normality; no feature interaction is modelled.

Exam recap: decide argmax prior-times-product; naive means given-class independence; smooth with $+\alpha$; Gaussian flavour uses per-class MLE; generative is fast and sampleable, discriminative has higher asymptotic ceiling given data.

<a id="self-check"></a>
## 6. Active Recall Quizzes

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
