# GAN Dynamics Drill: Stability at Pace

**Diagnose-and-tame reflexes — collapse, dominance, oscillation — plus evaluation pairs.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Ringside Doctor
Watch the bout (loss curves! sample sheets! diversity meters!), call the injury (collapse/dominance/oscillation!), apply the corner fix (TTUR/spectral/R1/unroll!), score both cards (quality *and* coverage!). Doctor, not fan — diagnose between rounds.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Ringside sheet

Signals: G-loss flat + samples samey (collapse!) · D-loss ≈ $0$ (dominance!) · losses seesawing (oscillation!) · FID down + recall down (quality-up-coverage-down split!). Fixes: TTUR (D slower!), spectral norm (Lipschitz D!), R1/gradient penalties (smoothness!), minibatch-discrimination/unrolled G (diversity pressure!), WGAN-critic reframe (meaningful curves!).

::: callout-formula KTU Formula Vault: Ringside
Signals → injury → corner-fix · score **quality+coverage**.
:::

::: callout-pitfall Loss Curves Lie Solo (GANs Especially!)
Falling G-loss can mean fooling *or* collapsed-one-trick (same curve, opposite health!) — sample sheets + diversity meters *with* curves, never curves alone. Multi-instrument ringside (curves+sheets+meters!) is the monitoring doctrine.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Logs: D-loss $0.01$, G-loss $4.2$ flat, samples: sharp identical cats. (a) Injuries? (b) Corner plan, ordered? (c) Success meters?"
:::

::: step [Step 2: Execution] Call It, Corner It, Meter It
1. Dominance (D near-perfect → G starves!) + collapse (identical cats!) — double injury, common pairing (starved G narrows to one trick!).
2. Corner: spectral-norm D + TTUR (tame cop first!) → R1 penalty (smooth more!) → minibatch-discrimination (diversity pressure!) → WGAN reframe if stubborn (new game!).
3. Meters: FID *plus* recall/diversity (per-class counts un-spike!) + sample sheets (eyeballs over scalars!) — declare victory on pairs, never solo.
:::

::: step [Step 3: Conclusion] Final Result
Injury-call (paired!), ordered corner (tame-then-diversify!), paired meters (quality+coverage!). Ringside format (call/corner/meter!) is the dynamics answer shape.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Spectral normalization tames training by:
(A) Bigger learning rates
(*B) Lipschitz-capping D (singular-value rescaling per layer! — bounded cop aggression: gradients stay informative, dominance capped structurally!) — architecture-level taming (not schedule fiddling!)
(C) More parameters
(D) Faster sampling
::: explanation
Lipschitz leash (each layer's stretch ≤ $1$!) bounds D's sharpness (no cliff-faced cops starving G!). Structural (built-in!) vs procedural (TTUR scheduling!) taming pairing — both drawers stocked.
:::

::: quiz Q2: Mixed Drill
TTUR (D slower than G) logic:
(A) D deserves less compute
(*B) Two-timescale separation (slow cop, faster forger!): D tracks quasi-static target while G climbs (differential-game stability folklore formalised!) — rate *ratio* as stabiliser, tuned not defaulted
(C) Halves training time
(D) Tradition from 2014
::: explanation
Timescale separation lets the fast player best-respond to slow-moving rival (approaching Stackelberg-ish stability!) — ratio-tuned (typical $4$:$1$-ish G-favoured!) not blind. Game-theoretic framing (who moves at what speed!) generalises beyond GANs.
:::

::: quiz Q3: Mixed Drill
FID improving while per-class counts stay spiked means:
(A) Train longer, fine
(*B) Quality-up/coverage-flat split (prettier same-tricks — collapse *persisting* under a flattering scalar!) — escalate diversity pressure (minibatch/unroll/WGAN!), not training time (more of same ≠ better!)
(C) Success, ship it
(D) Lower learning rate only
::: explanation
Scalar-flattery trap (FID blind to missing modes at fixed quality!) — paired meters (recall/diversity!) veto solo celebrations. Split-reading (which half moved?) directs fixes (diversity tools, not duration!) — meter literacy in action.
:::
