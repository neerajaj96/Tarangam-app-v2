# Primitive Roots & Discrete Logarithms

**Generators of the multiplicative world — who generates, who doesn't, and the one-way street guarding DH.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Pied Pipers vs One-Trick Players
Mod $p$, most numbers' powers cycle through *subgroups* (small loops!); a **primitive root** $g$ pipes the *whole* flock ($g^1\ldots g^{p-1}$ hits every nonzero residue — full cycle!). **Discrete log** ($g^x\equiv h$: find $x$) reverses piping — easy forward (square-and-multiply!), brutal backward (no better than $\sqrt p$-ish generic attacks — the *asymmetry* DH/RSA-adjacent schemes bank on!). Existence: cyclic for primes (guaranteed pipers!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Generation test + discrete log hardness

* $g$ primitive mod $p$ iff $g^{(p-1)/q}\not\equiv1$ for every prime factor $q\mid(p-1)$ (order test — factor $p-1$ first!).
* $\phi(p-1)$ primitive roots exist (primes guaranteed!).
* DLP: given $g,h$, find $x$: $O(\sqrt p)$ generic (baby-step-giant-step!), subexponential index-calculus for prime fields — hardness scales with $p$ size ($2048$+ bits!).

::: callout-formula KTU Formula Vault: Generators
Test **$g^{(p-1)/q}\not\equiv1\ \forall q$** · count **$\phi(p-1)$** · DLP **easy→, hard←**.
:::

::: callout-pitfall Order-Test Needs *Prime* Factors of $p-1$
Testing all divisors (not prime factors) wastes effort but works; testing *composite-only* subsets misses (subgroup orders divide — prime-factor coverage is necessary *and* sufficient!). Factor-then-test-per-prime-factor, exactly.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) Is $2$ primitive mod $11$? (b) How many primitive roots mod $11$? (c) Solve $2^x\equiv9\bmod11$ by baby-step reasoning (small: brute-force honestly)?
:::

::: step [Step 2: Execution] Test, Count, Search
1. $p-1=10=2\cdot5$: $2^5=32\equiv10\not\equiv1$ ✓; $2^2=4\not\equiv1$ ✓ → primitive (both prime-factor checks pass!).
2. $\phi(10)=4$ primitive roots ($2,6,7,8$ — verify one more: $6^5\bmod11$? $6^2=36\equiv3$, $6^4\equiv9$, $6^5\equiv54\equiv10\not\equiv1$ ✓ sample!).
3. Powers: $2^1=2,2^2=4,2^3=8,2^4=5,2^5=10,2^6=9$ → $x=6$ (tiny-field brute force stands in for BSGS logic: meet-in-the-middle tables!).
:::

::: step [Step 3: Conclusion] Final Result
Factor-$p-1$, test-per-prime-factor, count-by-$\phi$, search-by-structure. Test-then-count-then-search is the generator-question pipeline.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Is $3$ primitive mod $7$?
(A) Yes trivially
(*B) $p-1=6=2\cdot3$: $3^3=27\equiv6\not\equiv1$ ✓; $3^2=9\equiv2\not\equiv1$ ✓ → primitive (both pass!)
(C) No ($3^6\equiv1$ disproves — no: *everything* satisfies that by Fermat! Test is on *proper* divisors!)
(D) Untestable
::: explanation
Fermat ($g^{p-1}\equiv1$ always!) never disproves — proper-divisor checks do (order exactly $p-1$ iff no smaller exponent works, prime-factor coverage suffices!). (C)'s reasoning inverts the test — flag it as the classic error.
:::

::: quiz Q2: Foundational Concept
Baby-step-giant-step's $\sqrt p$ meet-in-the-middle idea:
(A) Brute force faster hardware
(*B) Rewrite $x=im+j$ ($m\approx\sqrt p$): precompute baby steps ($g^j$), then giant-step ($h\cdot g^{-im}$) seeking collision — time-memory tradeoff (table vs recompute!)
(C) Quantum speedup
(D) Factor $p$ first
::: explanation
Split exponent (high/low halves!), table one half (memory!), stride the other (time!) — collision solves. Square-root complexity (generic DLP floor-ish!) motivates $256$-bit+ groups (128-bit security needs $\sqrt{2^{256}}=2^{128}$ work!).
:::

::: quiz Q3: Foundational Concept
Why do DH groups need *large prime* moduli (not $p=11$-toy)?
(A) Aesthetics
(*B) DLP hardness scales with $p$ (generic $\sqrt p$ + index-calculus subexponential!): toy $p$ falls to hand/BSGS instantly (M3 DH demo uses toys *labelled* as toys!); $2048$-bit primes push attacks past physics (with ECC alternatives at $256$-bit via harder curves!)
(C) Small primes lack roots
(D) Protocols pad to size
::: explanation
Security = attack-cost arithmetic ($\sqrt p$ generic floor, index-calculus reality!) vs parameter size. Toy-vs-production labelling discipline (demos toy, deployments $2048$+!) is the crypto-pedagogy honesty rule.
:::
