# Primality Testing: Miller–Rabin & Deterministic

**Probably-prime vs proven-prime — Fermat liars, Miller–Rabin witnesses, and AKS in the honours corner.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Counterfeit Detectors
**Fermat test** ($a^{n-1}\stackrel?=1$): quick pen that *liars* pass (Carmichael numbers fool *all* bases coprime — professional fakes!). **Miller–Rabin** adds square-root interrogation (nontrivial roots of $1\bmod n$ betray compositeness — each random base catches fakes with probability $\ge3/4$!; $k$ rounds: error $\le4^{-k}$ — repeat to taste!). **AKS/deterministic**: lab assay (polynomial-time *proof* — slower, principled; crypto ships Miller–Rabin + trial division in practice!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 MR mechanics + AKS note

* Write $n-1=2^sd$ ($d$ odd); compute $a^d, a^{2d},\ldots$ mod $n$: pass if $1$ first, or $-1$ appears (proper square-root chain!); else composite (witness found!).
* Error $\le(1/4)^k$ per $k$ random bases (adversarial worst-case; random-input odds far better!).
* AKS (Agrawal–Kayal–Saxena): deterministic polynomial ($(n-1)^a\equiv(x^n-1)$-style binomial check mod polynomials!) — theoretical crown, Miller–Rabin practical scepter.

::: callout-formula KTU Formula Vault: Primality
Fermat **liar-prone** · MR **$3/4$-catch per base** · error **$4^{-k}$** · AKS **proof-crown**.
:::

::: callout-pitfall Carmichael vs MR-Witness Immunity
Carmichaels fool *Fermat* universally but *not* Miller–Rabin (nontrivial roots expose them — MR strictly stronger!). "Carmichael = undetectable" overclaims (Fermat-undetectable only!) — test-strength hierarchy quoted precisely.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) Miller–Rabin $n=25$, base $a=2$ (write $24=2^3\cdot3$; trace powers)? (b) Carmichael $561$ vs Fermat base $2$ vs MR? (c) $k$ for error $<10^{-6}$?
:::

::: step [Step 2: Execution] Trace, Contrast, Count Rounds
1. $2^3=8\not\equiv\pm1(25)$; square: $8^2=64\equiv14$; square: $14^2=196\equiv21\not\equiv\pm1$ — never $1$-first or $-1$ ⇒ composite (witness $2$ convicts $25$!).
2. $2^{560}\equiv1\bmod561$ (Fermat fooled — Carmichael signature!) but MR finds nontrivial roots (convicted properly!).
3. $4^{-k}<10^{-6}$: $k=10$ ($4^{-10}\approx10^{-6}$) — ten rounds, crypto-standard-ish counts.
:::

::: step [Step 3: Conclusion] Final Result
Trace-the-chain (first-$1$ or $-1$-appearance verdict!), contrast-the-tests (Fermat-fooled vs MR-convicted!), count-the-rounds ($4^{-k}$ budgeting!). Verdict vocabulary (witness/liar!) per finding.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Witness vs liar in Miller–Rabin:
(A) Courtroom roles
(*B) Witness base *proves* composite (chain misbehaves!); liar base *passes* despite compositeness (chain clean-looking!) — verdicts attach to (base, $n$) pairs, and one witness outweighs any liar-count (guilt proven once!)
(C) Fixed per number
(D) Interchangeable terms
::: explanation
Asymmetric logic (guilt provable, innocence only probable!) — witnesses convict outright; liars merely fail to convict (more bases dilute liar-luck to $4^{-k}$!). Asymmetry stated (probable-prime vocabulary, never proven-prime from MR!).
:::

::: quiz Q2: Numerical Drill
$n=9$, base $2$: MR verdict? ($8=2^3\cdot1$.)
(A) Probably prime
(*B) $2^1=2$; square: $4$; square: $16\equiv7$ — never $1$-first ($1$ absent!) nor $-1\equiv8$ ⇒ composite, witness $2$ (indeed $9=3^2$!)
(C) Inconclusive forever
(D) Prime (odd!)
::: explanation
Chain $2\to4\to7$ (mod $9$): no $1$-start, no $8$-appearance ⇒ guilty. Small-odd ≠ prime (oddness screens evens only!) — chain verdicts overrule parity hunches, always.
:::

::: quiz Q3: Foundational Concept
Production RSA keygen primality stack (practice!):
(A) Single Fermat, ship it
(*B) Trial-divide small primes (cheap composites first!) → Miller–Rabin $k\approx10$–$40$ rounds (error astronomically small!) → (optionally Lucas-strong/BPSW belt-and-suspenders!) — layered sieve-then-probe economics
(C) AKS every candidate
(D) Trust oddness
::: explanation
Cost-ordered pipeline (cheap filters first, pricey probes on survivors!) — trial division + MR rounds is the industry shape (AKS too slow per-candidate!). Economics-of-testing (filter cascade!) generalises beyond primes.
:::
