# RNNs & BPTT: Memory That Loops

**Sequences need state — recurrence, unrolling through time, and gradients that fade across steps.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Rumour Chain with Notes
**RNN** passes a note ($h_t$) down the line: each person reads the word ($x_t$) + yesterday's note, writes today's ($h_t = \tanh(Wh_{t-1}+Ux_t)$ — *same* $W,U$ every step, sharing across time like CNNs share across space!). **BPTT** unrolls the chain (copy the cell per timestep!) then backprops through the copies (shared weights sum gradients!). Long chains whisper-fade (vanishing across steps — same $1/4$-ish disease, temporal!) or shout (exploding — clip!). Memory with amnesia gradient — LSTMs fix next.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Recurrence + BPTT + pathologies

* $h_t = \phi(Wh_{t-1}+Ux_t+b)$, $y_t = Vh_t$; unroll $T$ copies (weight-tied!); BPTT sums $\partial\mathcal{L}/\partial W$ across copies (truncated BPTT bounds the unfold for streams!).
* Vanishing (long dependencies die — gradient $\prod$ Jacobians!), exploding (clip norm!), remedies preview (gates/LSTM, orthogonal init, truncation windows).

::: callout-formula KTU Formula Vault: RNN
State **$h_t(W h_{t-1}, x_t)$** · sharing **across time** · BPTT = **unroll + sum grads** · long links **fade (gates next!)**.
:::

::: callout-pitfall Teacher-Forcing/Test Mismatch (Exposure Bias)
Train-fed truth vs test-fed guesses (error compounds at inference — scheduled sampling/beam discipline mitigate!). Train/test regime gap named (exposure bias!) with mitigations — regime honesty in sequence answers.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Scalar RNN: $h_t = \tanh(0.8h_{t-1}+x_t)$, $h_0=0$, inputs $[1,0,1]$. Forward states? Gradient factor per step (max)? Verdict on $50$-step memory?"
:::

::: step [Step 2: Execution] Unroll, Bound, Judge
1. $h_1=\tanh(1)\approx0.762$; $h_2=\tanh(0.8\cdot0.762+0)=\tanh(0.610)\approx0.544$; $h_3=\tanh(0.8\cdot0.544+1)=\tanh(1.435)\approx0.892$.
2. Per-step Jacobian $\le 0.8\cdot\tanh'\le0.8$ (tanh' $\le1$!) — $50$ steps: $0.8^{50}\approx10^{-5}$ (whisper!). Verdict: recent-ish memory only (tens of steps max, optimistically!) — gates needed for longer (next topic!).
:::

::: step [Step 3: Conclusion] Final Result
Unroll-then-bound (Jacobian product!) then memory-horizon verdict. Bound arithmetic ($w\cdot\phi'$, compounded!) is the RNN-analysis move — quote the product.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Weight sharing across time buys RNNs:
(A) More parameters
(*B) Length-generality (any $T$, same $W$!) + statistical efficiency (every step trains the same weights — sample reuse across positions!) — CNN-space-sharing's temporal twin
(C) Faster per-step compute
(D) Longer memory automatically
::: explanation
Tying turns variable-length streams into fixed-parameter models (no per-position weights to starve!). Generality + efficiency twin wins — sharing moral restated temporally (M3.1 reunion!).
:::

::: quiz Q2: Foundational Concept
Truncated BPTT ($k_1$ forward/$k_2$ backward windows) trades:
(A) Nothing, free lunch
(*B) Memory/compute bounds (no $T$-length unroll!) for gradient horizon ($>k_2$ dependencies invisible!) — streaming necessity with a myopia price, tuned per dependency length
(C) Accuracy for speed always-worth
(D) Nothing observable
::: explanation
Unbounded unrolls drown streams (memory grows with $T$!); truncation caps cost, blinds beyond window. Window-vs-dependency matching (know your longest link!) sets $k$ — measurement first.
:::

::: quiz Q3: Numerical Drill
Jacobian factor $0.9$/step, $100$ steps. Gradient survival?
(A) $90\%$
(*B) $0.9^{100} \approx 2.7\times10^{-5}$ (near-total fade!) — even gentle $<1$ factors annihilate across long chains (exponential honesty!); $>1$ mirrors upward (clip!)
(C) $0.9$
(D) $9\%$
::: explanation
$0.9^{100} = e^{100\ln0.9} \approx e^{-10.5} \approx 10^{-5}$-scale. Sub-unity compounding is merciless at length (vanishing *inevitable* without gates!) — product, not factor, judges memory.
:::
