# Deep Feedforward Nets: Depth, Init & Normalization

**Going truly deep — why depth beats width, how to initialise, and keeping signals alive (normalization + residuals preview).**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Skyscraper Plumbing
Deep nets stack floors (layers): water (signal) must reach top floors *and* complaints (gradients) must reach the basement — bad plumbing (poor init, saturating activations) starves both (vanishing) or bursts pipes (exploding). **Xavier/He init** sizes pipes per floor (variance-preserving flows); **normalization** (batch/layer norm) re-pressurises each floor (stable distributions!); **residual shortcuts** (ResNet preview, M3) add express elevators (gradients ride past floors). Depth works when plumbing holds.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Init + normalization + depth pathologies

* Xavier/Glorot: $Var(W) = 1/n_{in}$ (sigmoid/tanh symmetric regimes); He: $2/n_{in}$ (ReLU's halved survivors need doubling!).
* BatchNorm: per-mini-batch mean/var normalise + learnable $\gamma,\beta$ (internal-covariate-shift taming, smoothing side-effects debated — cite both!); LayerNorm (per-example, sequence-friendly).
* Vanishing/exploding: Jacobian products $\prod$ shrink/blow (sigmoid $1/4$ bound compounds!); mitigations: ReLU family, careful init, norms, residuals, gating (LSTM preview!).

::: callout-formula KTU Formula Vault: Deep Plumbing
Xavier **$1/n$** · He **$2/n$ (ReLU!)** · norms **re-pressurise floors** · shortcuts **gradient elevators**.
:::

::: callout-pitfall Init–Activation Mismatch
Xavier + ReLU starves (variance halves per layer — He doubles to compensate!); He + tanh overshoots (symmetric activations want Xavier's $1/n$). Pair deliberately (He↔ReLU, Xavier↔tanh/sigmoid) — mismatches rot depth silently from layer one.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"10-layer ReLU MLP, layer width $100$, naive $Var(W)=1$ init vs He. Signal-variance journey? Then: gradients vanish anyway at layer 2 — two suspects + fixes?"
:::

::: step [Step 2: Execution] Variance Trip + Autopsy
1. Naive: variance compounds $\times(100\cdot1\cdot\tfrac12)=50\times$/layer (ReLU halves!) — activations explode ($50^{10}$ absurdity) → NaNs. He ($2/100$): factor $100\cdot(2/100)\cdot\tfrac12 = 1$/layer — steady plumbing ✓.
2. Vanish suspects: (i) stray saturating activations (sigmoid leftovers — swap ReLU!), (ii) unnormalised ill-conditioned inputs (standardise!); fixes: He+ReLU, BatchNorm floors, residual bypasses if still stuck.
:::

::: step [Step 3: Conclusion] Final Result
Variance-factor arithmetic ($n\cdot Var\cdot\tfrac12$ for ReLU) predicts plumbing fate; suspect-list (saturations, scales, missing shortcuts) autopsies failures. Depth questions want factors, not vibes.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
ReLU layer, width $64$, He init. Weight variance? Signal factor/layer?
(A) $1/64$, factor $32$
(*B) $2/64 = 1/32$; factor $64\times(1/32)\times\tfrac12 = 1$ — variance preserved exactly (He's design point!)
(C) $1/64$, factor $1$
(D) $2$, factor $64$
::: explanation
He doubles Xavier ($2/n$) precisely to offset ReLU's half-kill: $n\cdot(2/n)\cdot\tfrac12 = 1$. Design-point arithmetic (not memorised constants) is the init answer shape — derive the $1$.
:::

::: quiz Q2: Foundational Concept
BatchNorm's learnable $\gamma,\beta$ exist because:
(A) More parameters impress
(*B) Pure normalisation could *erase* representable functions (forced zero-mean/unit-variance every layer!) — $\gamma,\beta$ restore affine freedom (network can learn identity/un-normalise when optimal; stability retained, expressivity preserved)
(C) They speed GPUs
(D) Tradition
::: explanation
Constraint (stable distributions) vs freedom (any function) tension resolved by learnable undo. Normalise-then-denormalise-learnably: stability scaffolded, expressivity intact — both halves quoted.
:::

::: quiz Q3: Foundational Concept
Depth's practical edge over width (same budget) is:
(A) Fewer parameters always
(*B) Compositional reuse (edges→motifs→objects share sub-features exponentially efficiently — wide-shallow must memorise compositions separately, parameter-hungry)
(C) Faster training always
(D) No vanishing ever
::: explanation
Hierarchy matches compositional world structure (vision, language) — shared parts amortise. Same-budget depth generalises via reuse where width memorises — efficiency thesis, M2's representation story continues it.
:::
