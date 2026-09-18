# Activations: ReLU, LReLU, ELU & Classics

**Squash menu — sigmoid/tanh heritage, ReLU revolution, leaky/exponential fixes, and the dying-unit ward.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Bouncer Personalities
**Sigmoid** (velvet rope: $0$–$1$ squeeze, saturates both ends — gradients die at extremes!). **Tanh** (zero-centred sibling: $-1$–$1$, still saturates). **ReLU** ($\max(0,x)$: open door for positives (gradient exactly $1$ — vanishing cured!), brick wall for negatives (cheap, sparse!). **Leaky** (wall seeps $\alpha x$ — dying units resuscitate!). **ELU** (smooth negative curve to $-\alpha$ — mean-activations near zero, smoother landings, exp cost!). Default: ReLU; debug: leaky; squeeze outputs: sigmoid/tanh at heads.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Menu + derivatives + pathologies

* $\sigma$: $\sigma(1-\sigma)$, max $1/4$ (vanish seed!); tanh: $1-\tanh^2$ (stronger grads, still saturates).
* ReLU: $1_{x>0}$ (subgradient $0$ at kink); dying ReLU (negative-bias trap: zero grad forever — LR/He-init/leaky cures!).
* LReLU: $1$/$ \alpha$ slopes; ELU: $1$/$\alpha e^x$ (negative saturation to $-\alpha$, noise-robust-ish).
* Desiderata: nonlinearity, cheap $f,f'$, gradient-preserving ranges, zero-centred-ish outputs (tanh/ELU edge!).

::: callout-formula KTU Formula Vault: Activations
Sigmoid **$1/4$-capped** · tanh **centred, saturates** · ReLU **$1$-or-$0$** · leaky/ELU **revive negatives**.
:::

::: callout-pitfall Dying ReLU Misdiagnosed as "Converged"
Dead-unit plateaus (large dead fractions, stalled loss!) mimic convergence — audit activation histograms (dead share!) before celebrating; cures: lower LR, He (not Xavier!), leaky swap. Histogram-first debugging is the triage reflex.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Unit gets $x = -2$ always (stuck batch): outputs + grads under sigmoid/tanh/ReLU/LReLU($0.01$)/ELU($\alpha=1$)? Then: prescribe for a dying-prone deep stack."
:::

::: step [Step 2: Execution] Five Fates
1. Sigmoid: $0.119$, grad $0.105$ (trickle). Tanh: $-0.964$, grad $0.071$ (trickle). ReLU: $0$, grad $0$ (dead if persistent!). LReLU: $-0.02$, grad $0.01$ (whisper lives!). ELU: $e^{-2}-1 \approx -0.865$, grad $\approx 0.135$ (healthiest whisper!).
2. Prescription: He init + moderate LR + LReLU (or ELU if exp budget allows) + dead-share monitoring.
:::

::: step [Step 3: Conclusion] Final Result
Same stuck input, five fates — gradient-at-extremes is the comparison axis. Prescription bundles (init+LR+family+monitoring) beat single swaps.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
ReLU network, unit pre-activation $-3$ on all data. Output, gradient, verdict?
(A) $-3$, $1$, healthy
(*B) $0$, $0$, dead (no signal, no learning — permanent unless inputs/weights shift it positive; audit dead-share!)
(C) $0.05$, $0.05$
(D) $-3$, $0$, fine
::: explanation
Negative-flatland: zero output *and* zero gradient (nothing to learn from, nothing to teach). Persistence (all-data) = death; transient negatives = healthy sparsity. Data-conditional verdicts, not blanket ones.
:::

::: quiz Q2: Foundational Concept
ELU's $-\alpha$ floor vs LReLU's line differ practically by:
(A) Nothing observable
(*B) Bounded negatives (saturation → noise-robust, mean-activation push) vs unbounded linear seep (simpler, cheaper, no exp) — robustness-vs-cost trade with task-dependent winner (noisy data favours ELU!)
(C) ELU always wins
(D) LReLU always wins
::: explanation
Floor (saturating, robust, pricey exp) vs seep (linear, cheap, unbounded-below) — noise regime picks. No universal crown (benchmark folklore varies!) — task-conditioned picks with cost cited.
:::

::: quiz Q3: Foundational Concept
Softmax (output head) vs sigmoid (hidden) roles split by:
(A) Interchangeable everywhere
(*B) Softmax normalises *across* classes (mutually-exclusive distribution + cross-entropy pairing!); sigmoid squashes *per-unit* (multi-label independence or heritage hidden use) — competition vs independence semantics
(C) Softmax is faster
(D) Sigmoid is modern
::: explanation
Across-vs-per-unit is the semantic line (single-winner vs many-toggles). Loss pairing follows (cross-entropy/BCE respectively) — head+loss co-designed, never mixed blindly.
:::
