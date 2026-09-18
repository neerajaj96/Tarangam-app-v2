# Modular Arithmetic: Congruences & Operations

**Clock math that runs crypto — congruence classes, arithmetic mod $n$, and exponent juggling.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Clock Faces
Mod $12$, $14\equiv2$ (same clock position!). **Congruence** ($a\equiv b\pmod n$ iff $n\mid(a-b)$) sorts integers into $n$ hour-bins; arithmetic *within* bins stays consistent (add/multiply representatives freely — the bin, not the pick, decides!). Exponentiation by squaring climbs powers in $\log$ steps (crypto-sized exponents *demand* it — naive multiply dies at $2048$ bits!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Congruence + operations + fast powers

* $a\equiv b\pmod n \iff n\mid(a-b)$; classes $[0]\ldots[n-1]$ partition $\mathbb Z$.
* $(a+b),(a-b),(ab)\bmod n$ computed mod-first freely; division needs inverses (M1.1 gate!).
* Square-and-multiply: $x^{13}=x^{8}x^{4}x^{1}$ via binary expansion ($O(\log e)$ multiplies!).

::: callout-formula KTU Formula Vault: Mod Math
$a\equiv b\iff n\mid(a-b)$ · reduce **early, often** · powers by **squaring** · divide via **inverses only**.
:::

::: callout-pitfall Reduce-Then-Multiply Forgets Nothing, Delays-Nothing
Intermediate swell ($97^{100}$ direct!) overflows brains/pages — reduce mod $n$ *every* step (congruence licenses it!). Unreduced chains are the arithmetic faceplant of this topic — mod early, mod often.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) $5^{20}\bmod7$ smartly? (b) Last digit of $7^{100}$? (c) Solve $4x\equiv3\pmod{11}$?
:::

::: step [Step 2: Execution] Fermat-Preview, Cycles, Inverse
1. $5\equiv-2$: $(-2)^{20}=2^{20}=1{,}048{,}576$; mod $7$: $2^3=8\equiv1$ ⇒ $2^{20}=2^{18}\cdot2^2\equiv1\cdot4=4$. (Fermat: $5^6\equiv1$ ⇒ $5^{20}=5^{18}\cdot25\equiv25\equiv4$ ✓ cross-check!)
2. Powers of $7$ cycle $7,9,3,1$ (period $4$!); $100\bmod4=0$ ⇒ ends $1$.
3. $4^{-1}\bmod11 = 3$ ($4\times3=12\equiv1$); $x\equiv3\cdot3=9$ (check: $36\bmod11=3$ ✓).
:::

::: step [Step 3: Conclusion] Final Result
Cycle-spot, Fermat-shrink, inverse-multiply — three moves, all modular arithmetic. Cross-checks (two routes, one answer) are the exam-hall insurance.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$3^{100}\bmod7$?
(A) $3$
(*B) $3^6\equiv1$ (Fermat, $7$ prime!) ⇒ $3^{100}=3^{96}\cdot3^4\equiv1\cdot81\equiv81\bmod7 = 4$ ($77+4$!)
(C) $1$
(D) $0$
::: explanation
Period-$6$ collapse ($100 = 6\cdot16+4$), then $3^4=81\equiv4$. Exponent-mod-period reduction (Fermat preview, M1.3 full!) is the big-exponent reflex — reduce exponent first, power second.
:::

::: quiz Q2: Foundational Concept
Why may you reduce *intermediate* products mod $n$?
(A) Approximation accepted
(*B) Congruence respects $+,-,\times$ (ring homomorphism!): $(a\bmod n)(b\bmod n)\bmod n \equiv ab\bmod n$ — exact, not approximate (division excluded — inverses gate it!)
(C) Small numbers nicer
(D) Always for division too
::: explanation
Homomorphism license (operations commute with modding!) — exactness preserved, swell avoided. Division's exclusion (needs inverse existence!) is the boundary line, stated with the license.
:::

::: quiz Q3: Numerical Drill
$2^{10}\bmod11$ by squaring steps (show count)?
(A) $10$ multiplies
(*B) $2^2=4$, $2^4=16\equiv5$, $2^8\equiv25\equiv3$; $2^{10}=2^8\cdot2^2\equiv3\cdot4=12\equiv1$ ($4$ multiplies — log-scale!)
(C) $1$ multiply
(D) $1024$ then mod (brute!)
::: explanation
Binary expansion ($10=8+2$): square-chain to $2^8$, combine. $4$ multiplies vs $9$ naive ($2048$-bit exponents: thousands vs $10^{600}$ impossibilities!) — log-vs-linear is the crypto-enabling gap.
:::
