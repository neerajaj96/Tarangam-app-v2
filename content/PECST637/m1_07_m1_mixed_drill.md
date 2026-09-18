# M1 Drill: Number Theory at Exam Pace

**Gcd-to-CRT in one sitting — the computation circuit with gates at every station.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Six-Gate Circuit
Euclid → inverse-gate → mod-ops → collapse-gate → generator-test → primality-verdict → CRT-glue. Gates (coprime? prime? compatible?) before computations — gated circuit, no exceptions.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Gate checklist

$\gcd{=}1$? (inverses/Euler!) · prime? (Fermat-scope!) · compatible? (CRT!) · proper-divisors? (generator test!) · chain-verdict? (MR witness/liar!) · verify-all? (CRT close!).

::: callout-formula KTU Formula Vault: Gates
Gate **first**, compute **second**, verify **third**.
:::

::: callout-exam KTU Exam Focus
M1's 9-markers chain computations (Euclid→inverse→RSA-setup-step!) or stage one algorithm fully (MR trace / CRT assembly with verification!). Gate citations (why each step legal!) earn method marks beyond arithmetic.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Mini-RSA setup: $p=7,q=13$, $e=5$. (a) $\phi$? (b) $e$ valid? (c) $d$? (d) Encrypt $m=2$? (e) Which M1 gates fired?"
:::

::: step [Step 2: Execution] Setup Sprint
1. $\phi=6\cdot12=72$. (b) $\gcd(5,72)=1$ ✓ valid. (c) $5d\equiv1\bmod72$: extended ($72=14(5)+2$, $5=2(2)+1$ → $1=5-2(72-14\cdot5)=29(5)-2(72)$) → $d=29$ (verify $145\bmod72=1$ ✓!). (d) $c=2^5=32$. (e) Gates: totient-product, coprime-validity, inverse-existence, verify-multiply — four gates, all passed.
:::

::: step [Step 3: Conclusion] Final Result
Setup sprints chain four M1 stations (totient→gate→inverse→power!) — RSA keygen *is* the M1 final exam in disguise. Gate-calling aloud (naming each!) demonstrates mastery, not just answers.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
$7^{-1}\bmod26$?
(A) $7$ ($49\bmod26=23$ ✗)
(*B) $15$ ($7\times15=105=4(26)+1$ ✓ — extended: $26=3(7)+5$, $7=1(5)+2$, $5=2(2)+1$ unwinds to $15(7)-4(26)$!)
(C) $11$ ($77\bmod26=25$ ✗)
(D) None ($\gcd=1$, exists!)
::: explanation
Multiply-verify kills (A)/(C) instantly ($23$/$25\ne1$!); extended unwinds to $15$. Verify-first triage (test options by multiplication!) beats full Euclid when options exist — exam-tactics honesty.
:::

::: quiz Q2: Mixed Drill
$4^{100}\bmod15$?
(A) $4$
(*B) $\phi(15)=8$, $\gcd=1$ ✓: $4^{100}=(4^8)^{12}\cdot4^4\equiv4^4=256\equiv256-255=1$
(C) $0$ ($\gcd\neq$? No: $\gcd(4,15)=1$ — zero impossible for units!)
(D) $16$
::: explanation
Gate ($\gcd=1$!) → period ($8$) → divide ($100=96+4$) → small power ($256\bmod15=1$). (C) self-refutes (units never $0\bmod n$!) — option absurdity as free elimination.
:::

::: quiz Q3: Mixed Drill
$x\equiv3\bmod7$, $x\equiv5\bmod11$. Smallest positive solution?
(A) $31$ ($31\bmod7=3$ ✓ but $31\bmod11=9\ne5$ ✗ — half-pass trap!)
(*B) $38$: scan $3,10,17,24,31,38$ mod $11$ ($3,10,6,2,9,5$ — first hit at $38$!) and CRT recipe ($M=77$: $y_1=11^{-1}\bmod7=2$, $y_2=7^{-1}\bmod11=8$; $x=3(11)(2)+5(7)(8)=346\equiv38$) converge ✓
(C) $10$
(D) $17$
::: explanation
Brute-scan ($+7$ steps testing mod $11$!) and CRT recipe converge on $38$ (verify both congruences: $38\bmod7=3$ ✓, $38\bmod11=5$ ✓!). Dual-route agreement (scan finds, recipe proves!) is the gold-standard answer shape.
:::
