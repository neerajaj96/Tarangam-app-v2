# Module 2 Practice Lab: Classification Drills

**Classifier selection under constraints, loss arithmetic races, veto autopsies, split decisions, and divergence triage.**

<a id="the-intuition"></a>
## 1. Step-by-Step Scenario Analysis

### Scenario 1: The Startup Triage (Pick the Classifier, Defend It)

Constraints: (a) 300 labeled medical scans, 2M unlabeled, must ship in a week → **Gaussian NB / simple generative**: converges in $O(\log n)$ samples, no tuning marathons, calibrated-enough probabilities for review queues. (b) 10M labeled ad clicks, accuracy is revenue → **logistic regression / trees**: data-rich regime where discriminative ceilings win; NB's bias would leave money. (c) Credit decisions requiring *reasons* for regulators → **shallow decision tree**: auditable splits beat black-box points when the examiner is a lawyer. Method follows data budget + stakeholder, never fashion.

### Scenario 2: Cross-Entropy Race (Feel the Curve)

True label $y=1$. Model A predicts $0.9$: loss $-\ln 0.9 \approx 0.105$. Model B predicts $0.5$: $0.693$. Model C predicts $0.1$: $2.303$. Same correct *direction* (all > 0.5 → all classify right!), wildly different *losses* (22× spread) — accuracy sees three ties; cross-entropy sees confidence quality. Train on the loss, report the accuracy, and never confuse which game each number scores.

### Scenario 3: The Veto Autopsy

Spam {win:2, money:2}/4 words, ham {win:0, money:1}/3 words, priors 50/50, $|V|=2$, $\alpha=1$. Classify "win money": spam $0.5 \times 0.5 \times 0.5 = 0.125$; ham $0.5 \times 0.2 \times 0.4 = 0.04$ → **spam**, 3:1. Now delete smoothing: $P(\text{win}|\text{ham}) = 0/3 = 0$ — ham's score zeroes *regardless*; worse, any *unseen-in-both* word zeroes *both* classes and argmax ties on nothing. Autopsy conclusion: unsmoothed NB doesn't degrade gracefully — it holds vetoes, and vetoes detonate.

### Scenario 4: Divergence Triage in 30 Seconds

Symptoms → verdicts: loss NaN after healthy epochs → halve $\eta$, clip, resume from checkpoint (divergence, not data). Loss plateaued high from epoch 1 → $\eta$ too small *or* model too weak — raise $\eta$ first (cheapest test), then capacity. Train/test gap yawning → variance disease (regularize, more data, simpler model). Train *and* test both bad → bias disease (bigger model, better features, longer training). Four symptoms, four prescriptions — triage before tuning, always.

---

<a id="the-dimensions"></a>
## 2. "Do Not Confuse" Cheat Table

| Pair | Distinction that earns marks |
|---|---|
| 0/1 loss vs. surrogate | Judge with 0/1, train the smooth stand-in (CE/hinge/Gini) |
| Sigmoid vs. boundary | $\sigma$ rescales confidence; $w^Tx=0$ still cuts linear and flat |
| $(p-y)$ gradient meaning | Surprise-proportional updates: mistakes shout, certainties whisper |
| Generative vs. discriminative | Model $P(x\|y)$ (fast, sampleable) vs. $P(y\|x)$ boundary (higher ceiling, hungrier) |
| Smoothing purpose | Kills zero-vetoes (unseen ≠ impossible), not a performance topping |
| Gain vs. gain ratio | Raw mess-removed vs. normalized (IDs shatter gain, ratio resists) |
| Pre- vs. post-pruning | Stop early (risks under-shoot) vs. grow + validation-snip (costs a split) |
| Batch vs. SGD vs. mini-batch | $O(nd)$ smooth vs. $O(d)$ noisy-fast vs. GPU default middle |
| Convex vs. non-convex training | Guaranteed arrival vs. crafted local success (init/schedules/momentum) |
| k ties | Even-$k$ symmetric distances need tie rules — odd $k$ or $1/d$ weights |

---

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz Three models all classify a validation point correctly with probabilities 0.9, 0.6, and 0.51. Accuracy says tie-tie-tie. What does cross-entropy say, and which number should drive the next training decision?
() All three are equally good; stop training immediately
(*) Losses ≈ 0.105 / 0.511 / 0.673 — the 0.51 model is barely confident (near-boundary, fragile) while 0.9 is robust; training decisions follow the loss (confidence quality), deployment reports follow accuracy
() Accuracy should drive training because it is the final metric
() Probabilities above 0.5 are all identically perfect
::: explanation
Accuracy binarizes away confidence; loss preserves it. A 0.51-correct point flips under breath-sized perturbations — the model is *right by luck* there. Train on losses (they see fragility), evaluate on accuracy (the contract), and let the 22× spread between 0.105 and 2.303-like extremes allocate effort.
:::

::: quiz A teammate "fixes" NB zero-vetoes by deleting every word unseen in either class from the vocabulary. Why is Laplace smoothing strictly better?
() Deletion is actually superior and smoothing is obsolete
(*) Deletion destroys test-time information (new words in future mail vanish silently); smoothing prices ignorance ($+α$) while keeping the feature — unseen-today words still score tomorrow, rare but non-zero
() Smoothing is faster to compute than deletion
() Deletion changes the priors while smoothing preserves them
::: explanation
Deletion amputates the feature space to fit the training sample — future mail containing those words becomes unscorable evidence. Smoothing instead assigns calibrated rarity: the vocabulary stays complete, and today's unseen word is tomorrow's weak (not vetoed) signal. Robustness lives in kept-but-discounted features.
:::

::: quiz Your tree model must be explained to non-technical regulators who will veto black boxes. You have logistic regression (89%) and a depth-4 tree (87%). Which ships, and what principle decides?
() Logistic regression — 2% accuracy is sacrosanct regardless of context
(*) The depth-4 tree — auditability (readable splits, traceable decisions) is a hard constraint here, and 2% is its explicit price; model selection optimizes the *stakeholder* objective, not accuracy in a vacuum
() Neither — only neural networks satisfy regulators
() Flip a coin; interpretability has no monetary value
::: explanation
Accuracy is one term in the real objective; auditability, latency, and maintainability are others. A 2% accuracy tax buying full inspectability is cheap where regulators (or doctors, or judges) consume the model. State the tradeoff explicitly — "87% and explainable" beats "89% and inscrutable" *for this stakeholder*.
:::

::: quiz Mini-batch training shows healthy falling loss; switching to full-batch (same η) stalls almost immediately at a mediocre plateau. Diagnose.
() Full-batch is mathematically incapable of optimizing anything
(*) Full-batch takes few giant exact steps that settle into the nearest sharp minimum/plateau, losing SGD noise that previously rattled through saddle regions — plus far fewer updates per epoch; remedies: raise η cautiously, restore mini-batch noise, or improve conditioning (scaling/normalization)
() The dataset shrank when switching modes
() Full-batch requires a different loss function by definition
::: explanation
Noise is a feature (escape dynamics) and step-count is budget: full-batch spends $O(nd)$ per single exact step. Same-$\eta$ switching removes both advantages at once — stall diagnosed. Mini-batch's jitter-plus-frequency is the default precisely because it sidesteps both traps simultaneously.
:::

---

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Any cheat-table row (surrogate-vs-0/1 and smoothing lead); sigmoid/CE single-point arithmetic.
* **7 Marks:** NB scoring traces with smoothing autopsy, tree split computations (entropy/gain), or GD divergence diagnosis with fixes.
:::

### Essay Question 1 (7 Marks)
**Q: With the Scenario-3 counts, classify "win money" with Laplace α=1, then show exactly what breaks with α=0.**

**Model Answer:** Smoothed: $P(\text{win}|S)=P(\text{money}|S)=3/6=0.5$ → score $0.5^3=0.125$; $P(\text{win}|H)=1/5=0.2$, $P(\text{money}|H)=2/5=0.4$ → $0.5(0.2)(0.4)=0.04$. **Spam** (~3:1). Unsmoothed ($\alpha=0$): ham's $P(\text{win}|H)=0/3=0$ vetoes ham regardless — and any word unseen in *both* classes zeroes *both* scores (argmax over zeros). Smoothing converts vetoes into votes: ignorance priced, never absolute.

### Essay Question 2 (7 Marks)
**Q: Training diverges to NaN at epoch 40 after an η hike; separately, a colleague's run plateaus high from epoch 1. Diagnose both with ordered fixes.**

**Model Answer:** Case 1 (healthy→NaN after hike): divergence signature — updates overshot into overflow. Fix order: halve $\eta$, add gradient clipping, resume from last good checkpoint; investigate data/model only if sane $\eta$ still explodes. Case 2 (plateau from start): underpowered steps or capacity — raise $\eta$ first (cheapest experiment), then model size/features/schedule. Same symptom family (bad training), opposite ends of the $\eta$ dial — read the *onset pattern* before touching anything.
