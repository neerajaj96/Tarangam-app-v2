# Stochastic & Contractive Encoders

**Latents with dice and shock absorbers — variational sampling and penalty-smoothed mappings.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Dice Memos + Padded Walls
**Stochastic encoders** (VAE flavour!) write memos by *dice* ($z\sim q(z|x)$ — sample, don't deterministically stamp!): noise forces *neighbourhood* meaning (nearby latents decode similarly — smooth, sampleable space! plus KL-to-prior leash!). **Contractive encoders** pad the office walls (Frobenius penalty on encoder Jacobian — tiny input jitters change *nothing*: invariance armour!). Dice for *generation*, padding for *robustness* — two lotteries, two virtues.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 VAE sketch + contractive penalty

* VAE: $q_\phi(z|x)=\mathcal N(\mu,\sigma^2)$ (encoder emits *params*!), reparameterize $z=\mu+\sigma\odot\epsilon$ (gradients *through* sampling!), loss = recon + $KL(q\|p)$ (prior leash, usually $\mathcal N(0,I)$!); generate: sample prior → decode!
* Contractive: $\|J_f(x)\|_F^2$ penalty added (flat-around-data mappings — analytical denoising kin!); stacked variants pretrain similarly.

::: callout-formula KTU Formula Vault: Dice + Padding
VAE: **sample latents, KL-leash prior** · reparam **$z=\mu+\sigma\epsilon$** · contractive: **penalise Jacobian**.
:::

::: callout-pitfall KL Collapse (Decoder Ignores Latents!)
Over-mighty decoders + weak KL weight ⇒ posterior = prior (latents carry nothing — generate mushy sameness!). KL-annealing/free-bits/capacity-scheduling keep latents *employed* — collapse diagnosed via dead-KL + ignored-$z$ ablations, fixed structurally.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"VAE on digits: encoder outputs $\mu=2.0,\log\sigma^2=0$ for an input. (a) Sample $z$ (given $\epsilon=0.5$)? (b) KL term value? (c) Decoder ignores $z$ anyway (KL≈$0$ in logs) — diagnosis + two fixes?"
:::

::: step [Step 2: Execution] Sample, Price, Revive
1. $\sigma = e^{0/2} = 1$; $z = 2.0+1(0.5) = 2.5$ (reparameterized draw!).
2. $KL = -\tfrac12(1+0-e^0-2^2) = -\tfrac12(1+0-1-4) = 2.0$ nats (leash price for straying!).
3. Collapse (powerful decoder + latents unemployed!): fixes — KL annealing (ramp weight $0\to1$!), weaker decoder / stronger encoder asymmetry, free-bits floor per dimension (minimum employment quota!).
:::

::: step [Step 3: Conclusion] Final Result
Reparam arithmetic, KL pricing, collapse triage with structural fixes. Employment-auditing latents (KL-per-dim + ablation!) is the VAE-ops habit.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Reparameterization ($z=\mu+\sigma\epsilon$) exists because:
(A) Sampling is fun
(*B) Backprop can't flow through *random draws* (non-differentiable sampling!) — externalise randomness ($\epsilon$ fixed source!) so gradients reach $\mu,\sigma$ deterministically (pathwise derivatives!)
(C) Faster sampling
(D) Better priors
::: explanation
Differentiability laundering (randomness moved outside the gradient path!) — the trick enabling stochastic nets to train by SGD at all. Gradient-path auditing (what flows where?) is the variational-inference literacy check.
:::

::: quiz Q2: Foundational Concept
Contractive penalty $\|J\|_F^2$ buys:
(A) Sparser weights
(*B) Local invariance (flat mappings around data — jitter-proof features, analytical cousin of denoising's empirical armour!) — robustness *proved* (penalty certificates flatness!) vs denoising's *practiced* robustness
(C) Deeper nets
(D) Faster epochs
::: explanation
Certificate-vs-practice pairing (penalty guarantees local flatness; corruption trains it!) — sibling methods, complementary evidence. Theory/practice handshake framing suits comparison answers.
:::

::: quiz Q3: Foundational Concept
VAE sampling (generate novel digits) procedure:
(A) Encode a test digit
(*B) Draw $z\sim\mathcal N(0,I)$ (prior!) → decode (no input needed — prior space *is* the generator's dice cup, smoothness from training neighbourhoods!) — interpolation walks ($z_1\to z_2$ morphs!) demo continuity
(C) Random pixels
(D) Nearest-neighbour lookup
::: explanation
Prior-as-generator (trained smoothness makes random draws meaningful!) — morph-walks *prove* continuity (intermediate faces, no jumps!). Sample-then-morph is the generative demo duet (novelty + coherence shown together).
:::
