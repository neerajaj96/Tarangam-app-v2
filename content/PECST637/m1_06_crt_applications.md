# Chinese Remainder Theorem & Applications

**Split moduli, conquer pieces, recombine — CRT construction, Garner-flavoured assembly, and RSA-speedup cameo.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Parallel Counters
Mod $35$ arithmetic *is* mod-$5$ *and* mod-$7$ arithmetic side by side (coprime moduli ⇒ independent counters!): solve small, glue via CRT recipe ($x = \sum a_iM_iy_i$, $M_i=M/m_i$, $y_i=M_i^{-1}\bmod m_i$!). RSA decrypts mod $p,q$ separately then glues ($4\times$ faster — half-size exponents *squared* savings, twice!). Sun-Tzu's generals counted soldiers this way (remainders $2,3,2$ mod $3,5,7$ ⇒ $23$ — the founding anecdote!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 CRT statement + construction + RSA-CRT

* Coprime $m_i$: system $x\equiv a_i$ has unique solution mod $M=\prod m_i$: $x=\sum a_iM_iy_i\bmod M$.
* RSA-CRT: $m_p=c^{d_p}\bmod p$, $m_q=c^{d_q}\bmod q$ ($d_p=d\bmod(p-1)$!), glue via Garner/CRT ($h=q^{-1}(m_p-m_q)\bmod p$!). Non-coprime moduli need compatibility checks (pairwise congruences agree on gcds!) — generalisation noted.

::: callout-formula KTU Formula Vault: CRT
Split **coprime** · solve **small** · glue **$\sum aMy$** · RSA **$4\times$ via halves**.
:::

::: callout-pitfall Inverses Mod the *Co-Factor* ($y_i\bmod m_i$!)
$M_i^{-1}$ computed modulo $m_i$ (the *other* modulus!), not $M$ — inverse-context errors silently assemble wrong $x$ (verify by substitution into *all* congruences!). Context-per-inverse labelled before computing.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Solve $x\equiv2\bmod3$, $x\equiv3\bmod5$, $x\equiv2\bmod7$ (Sun-Tzu!). Then: RSA toy ($p=5,q=11$) CRT-decrypt shape (symbols only)?
:::

::: step [Step 2: Execution] Recipe + Shape
1. $M=105$; $M_1=35$, $y_1=35^{-1}\bmod3=2^{-1}=2$; $M_2=21$, $y_2=21^{-1}\bmod5=1^{-1}=1$; $M_3=15$, $y_3=15^{-1}\bmod7=1^{-1}=1$. $x=2(35)(2)+3(21)(1)+2(15)(1)=140+63+30=233\equiv233-210=23$. Verify: $23\bmod3=2$ ✓, $\bmod5=3$ ✓, $\bmod7=2$ ✓.
2. $d_p,d_q$ halves; $m_p,m_q$ small-exponent powers; Garner glue ($q^{-1}$ mod $p$ precomputed once per key! — per-decryption savings thereafter!).
:::

::: step [Step 3: Conclusion] Final Result
$M_i/y_i$ table, weighted sum, mod-$M$ reduction, verify-all-congruences. Verify-every-congruence is the non-negotiable closer (assembly errors blare here!).
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$x\equiv1\bmod4$, $x\equiv2\bmod3$. Smallest positive?
(A) $7$
(*B) $M=12$; $M_1=3$, $y_1=3^{-1}\bmod4=3$ ($3\times3=9\equiv1$!); $M_2=4$, $y_2=4^{-1}\bmod3=1$; $x=1(3)(3)+2(4)(1)=9+8=17\equiv5$ (check: $5\bmod4=1$ ✓, $5\bmod3=2$ ✓!)
(C) $11$
(D) $1$
::: explanation
Table-then-sum-then-reduce-then-verify (four beats!). $17\bmod12=5$ reduction step unskippable (raw sum overshoots modulus!) — reduce, then verify both.
:::

::: quiz Q2: Foundational Concept
RSA-CRT's $\approx4\times$ speedup comes from:
(A) Better hardware
(*B) Halved exponents *and* halved moduli (cubic-ish cost in bits: $2\times((1/2)^3+(1/2)^3)=1/4$ work!) twice over — size-halving compounds cubically, glue negligible
(C) Skipping decryption
(D) Smaller keys overall
::: explanation
Modular-exponentiation cubic-ish scaling ($O(k^3)$!) makes halves quarter-work each ($\times2$ halves = half total? No: $2\times(1/8)=1/4$ — quarter!). Scaling-law arithmetic (halve-twice-compound!) is the performance literacy on display.
:::

::: quiz Q3: Foundational Concept
Non-coprime moduli CRT needs:
(A) Nothing extra, same recipe
(*B) Compatibility ($a_i\equiv a_j\bmod\gcd(m_i,m_j)$!) — contradictory remainders (e.g. $x\equiv1\bmod4$, $x\equiv2\bmod6$: $1$ vs $2\bmod2$ clash!) mean *no solution*; consistent ones merge via lcm (generalised CRT!)
(C) Bigger $M$ always
(D) Abandon CRT
::: explanation
Coprimality guaranteed consistency (recipe's precondition!); without it, check pairwise-gcd agreement first (solvability gate!). Gate-before-recipe (compatibility audit!) generalises the coprime-only habit safely.
:::
