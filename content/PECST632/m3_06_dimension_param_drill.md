# CNN/RNN Parameter & Dimension Drill

**Count everything — conv params, FC heads, RNN/LSTM tallies, and output-shape chains.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Architect's Ledger
Every layer pays params (shared or not!) and reshapes tensors (size formulae!). Ledger in order: conv count (shared!), pool (free!), FC (dense!), recurrent (tied-across-time, counted once!). Audit totals vs budgets (overfit watch!) and shapes vs code (runtime mismatch hunt!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Count/shape kit

* Conv: $(F^2C_{in}+1)C_{out}$; size $(W-F+2P)/S+1$; pool: $0$ params.
* FC: $(n_{in}+1)n_{out}$.
* RNN cell: $(n_{in}+n_h+1)n_h$; LSTM: $4\times$ that (four gate-matrices!); GRU: $3\times$.
* Embedding: $V\times d$ (often the *biggest* line item!).

::: callout-formula KTU Formula Vault: Ledger
Conv **shared-count** · pool **free** · FC **dense** · RNN **once** · LSTM **$\times4$** · embeddings **watch the vocab!**.
:::

::: callout-pitfall LSTM $\times4$ Forgetting
Single-gate math ($WH+xh+b$ once) undercounts LSTMs $4\times$ (f/i/o/candidate matrices each!) — GRU $3\times$ similarly. Gate-multiplicity stated before any LSTM tally, always.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Net: $64\times64\times3$ in → conv $32\times3\times3,S1,P1$ → pool $2\times2,S2$ → flatten → FC $128$ → FC $10$. Totals? Then: LSTM ($n_{in}=50,n_h=100$) params?"
:::

::: step [Step 2: Execution] Ledger Lines
1. Conv: $(27+1)32 = 896$; shape stays $64\times64\times32$ (same-pad!). Pool → $32\times32\times32$ ($32768$ flat!). FC1: $32769\times128$?? No: $(32768+1)\times128 = 4{,}194{,}432$ (head dominates — classic!). FC2: $129\times10 = 1290$. Total $\approx 4.2$M (FC head $99.9\%$ — modern nets global-pool *precisely* to dodge this!).
2. LSTM: $4\times(50+100+1)\times100 = 4\times15100 = 60{,}400$.
:::

::: step [Step 3: Conclusion] Final Result
Head-dominance spotted (GAP remedy named!), gate-multiplicity applied, same-pad verified. Ledger answers end with *insights* (dominance/remedy), not just totals.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Conv $64$ filters $3\times3$ on $128$ channels ($S1$, same). Params?
(A) $64\times3\times3 = 576$
(*B) $(9\times128+1)\times64 = 1153\times64 = 73{,}792$ (depth-multiplied! +bias) — channel depth dominates filter area here
(C) $73{,}728$ (bias-blind!)
(D) $128\times64$
::: explanation
$F^2C_{in}$ first ($9\times128 = 1152$!), $+1$, $\times C_{out}$. Depth-blind ($576$) and bias-blind ($73{,}728$) traps bracket the careless — three-factor discipline (area×depth+bias)×filters.
:::

::: quiz Q2: Mixed Drill
RNN $n_{in}=20,n_h=30$ vs GRU same size: params?
(A) Equal counts ($1530$ each)
(*B) RNN $(20+30+1)30 = 1530$; GRU $3\times1530 = 4590$ (reset/update/candidate matrices!) — gate count multiplies the base cell
(C) GRU fewer than RNN ($510$)
(D) $51\times30\times30$ each
::: explanation
Base cell $(n_{in}+n_h+1)n_h$, then gate-multiple ($1/3/4$ for RNN/GRU/LSTM). Right number with wrong scope (e.g. $1530$ claimed for *both*) is the classic half-right trap — scope every number to its architecture.
:::

::: quiz Q3: Mixed Drill
Flatten $16\times16\times64$ → FC $256$: params?
(A) $16{,}384$
(*B) $(16384+1)\times256 = 16{,}385\times256 = 4{,}194{,}560$ (flatten-fan arithmetic: spatial×channels first!)
(C) $256$
(D) $65{,}792$
::: explanation
$16\times16\times64 = 16384$ inputs (multiply *all* dims first!); $(+1)\times256$. Flatten-dimension assembly (all-axes product!) precedes the $(n+1)m$ rule — two-step discipline.
:::
