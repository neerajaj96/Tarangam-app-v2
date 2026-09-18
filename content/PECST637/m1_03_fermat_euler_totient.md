# Fermat, Euler Totient & Euler Theorem

**Exponent collapsers — little theorem, totient counting, and the big reduction powering RSA.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Carousel Periods
Fermat: prime-$p$ carousels return every $p-1$ rides ($a^{p-1}\equiv1$ for $a$ not multiple of $p$ — full cycles!). Euler generalises: modulo $n$, units ride a $\phi(n)$-carousel ($\phi$ counts co-travellers $\le n$!). Huge exponents collapse mod the period (RSA decrypts *because* exponents wrap predictably!). Totient multiplicativity ($\phi(mn)=\phi(m)\phi(n)$ coprime!) plus prime formula ($\phi(p^k)=p^k-p^{k-1}$) computes periods fast.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Theorems + totient computation

* Fermat: $a^{p-1}\equiv1\pmod p$ ($p\nmid a$); corollary $a^p\equiv a$.
* $\phi(n)=|\{1\le k\le n:\gcd(k,n)=1\}|$; $\phi(p)=p-1$; $\phi(p^k)=p^k-p^{k-1}$; multiplicative over coprimes.
* Euler: $a^{\phi(n)}\equiv1\pmod n$ ($\gcd(a,n)=1$!) — exponent reduction mod $\phi(n)$ licensed (RSA's engine room!).

::: callout-formula KTU Formula Vault: Collapse
Fermat **$a^{p-1}\equiv1$** · $\phi(p^k)=p^k-p^{k-1}$ · Euler **$a^{\phi(n)}\equiv1$** · reduce exponents **mod period**.
:::

::: callout-pitfall Euler Needs Coprimality (Fermat Needs $p\nmid a$!)
$a^{\phi(n)}$ collapse with $\gcd\neq1$ misfires (periods differ/subgroup!) — gate check ($\gcd=1$?) precedes every Euler reduction. Unconditional exponent-modding is the silent killer of these numerics.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) $\phi(36)$? (b) $2^{100}\bmod21$? (c) Last two digits of $3^{100}$ (mod $100$)?
:::

::: step [Step 2: Execution] Count, Gate, Collapse
1. $36=2^2\cdot3^2$: $\phi=36(1-\tfrac12)(1-\tfrac13)=36\cdot\tfrac12\cdot\tfrac23=12$.
2. $\phi(21)=\phi(3)\phi(7)=2\cdot6=12$; $\gcd(2,21)=1$ ✓; $2^{100}=2^{96}\cdot2^4\equiv1\cdot16=16$.
3. $\phi(100)=40$; $\gcd(3,100)=1$ ✓; $3^{100}=(3^{40})^2\cdot3^{20}\equiv3^{20}$; $3^{20}=(3^{10})^2$, $3^{10}=59049\equiv49$; $49^2=2401\equiv1$?? $2401\bmod100=1$ — so $3^{100}\equiv1\bmod100$ (Carmichael $\lambda(100)=20$ shortcut agrees: $3^{20}\equiv1$!). Last two digits $01$.
:::

::: step [Step 3: Conclusion] Final Result
Factor-then-totient, gate-then-collapse, cross-check via Carmichael where slick. Gate-first ordering (coprime?) before reduction, always.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$\phi(1000)$?
(A) $1000$
(*B) $1000=2^3\cdot5^3$: $1000(1-\tfrac12)(1-\tfrac15)=1000\cdot\tfrac12\cdot\tfrac45=400$
(C) $500$
(D) $998$
::: explanation
Product formula over prime powers ($p^k-p^{k-1}$ each: $8-4=4$? No: $\phi(8)=4$, $\phi(125)=100$, product $400$ ✓ cross-check!). Factor-then-multiply is the computation shape — never enumerate.
:::

::: quiz Q2: Foundational Concept
$2^{10}\equiv1\bmod11$ (Fermat) vs mod $9$: $2^6\bmod9$?
(A) $1$ by Fermat ($9$ not prime — inapplicable!)
(*B) $\phi(9)=6$, $\gcd(2,9)=1$: Euler gives $2^6\equiv1$ (Euler covers composite moduli — Fermat's big sibling!)
(C) $0$
(D) $2$
::: explanation
Fermat needs prime modulus ($11$ ✓, $9$ ✗); Euler needs coprimality ($\gcd(2,9)=1$ ✓). Theorem-applicability check (prime? coprime?) precedes every collapse — gate, then reduce.
:::

::: quiz Q3: Numerical Drill
$5^{100}\bmod13$?
(A) $5$
(*B) $5^{12}\equiv1$ ⇒ $5^{96}\equiv1$; $5^{100}\equiv5^4=625\equiv625-13\cdot48=625-624=1$
(C) $25$
(D) $12$
::: explanation
$100=12\cdot8+4$; $5^4=625$; $13\times48=624$ remainder $1$. Period-division ($100\div12$) then small power then mod — the three-beat collapse dance.
:::
