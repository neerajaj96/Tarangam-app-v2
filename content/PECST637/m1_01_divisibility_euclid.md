# Divisibility, Euclid & Extended Euclid

**Remainders that rule crypto — division algorithm, gcd by repeated remainder, and inverses via back-substitution.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Tiling Corridors
**Divisibility** ($d\mid n$): corridor length $n$ tiles exactly with $d$-tiles (no offcuts!). **Division algorithm**: $n = qd+r$ measures offcut $r<d$ (the remainder *is* the news!). **Euclid**: gcd hides in remainders — replace $(a,b)$ with $(b, r)$ repeatedly; last nonzero remainder *is* the gcd (corridors share only that tile size!). **Extended**: back-substitute the remainder chain to write $gcd = sa+tb$ (Bézout — the $s,t$ *are* modular inverses in disguise, RSA's key-maker!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Division, gcd, extended

* $a = qb+r$, $0\le r<b$ (unique $q,r$).
* Euclid: $\gcd(a,b)=\gcd(b,a\bmod b)$ → terminates (remainders strictly fall!).
* Extended: unwind to $d = sa+tb$; if $d=1$, $s\equiv a^{-1}\pmod b$ (inverse exists iff coprime!).

::: callout-formula KTU Formula Vault: Euclid
$a=qb+r$ · gcd = **last nonzero remainder** · $d=sa+tb$ · inverse iff **$\gcd=1$**.
:::

::: callout-pitfall Back-Substitution Sign Drift
Extended Euclid signs flip per unwind level (alternating!) — track signs per line, verify by $sa+tb=d$ at the end. Sign-slipped inverses fail silently downstream (RSA decrypts to garbage!) — verify-first discipline.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) $\gcd(240,46)$ by Euclid. (b) Inverse of $7\bmod40$ via extended Euclid. (c) Does $6^{-1}\bmod9$ exist?
:::

::: step [Step 2: Execution] Remainders Then Unwind
1. $240=5(46)+10$; $46=4(10)+6$; $10=1(6)+4$; $6=1(4)+2$; $4=2(2)+0$ → gcd $2$.
2. $40=5(7)+5$; $7=1(5)+2$; $5=2(2)+1$; unwind: $1=5-2(2)=5-2(7-5)=3(5)-2(7)=3(40-5\cdot7)-2(7)=3(40)-17(7)$. So $-17\equiv23\bmod40$: check $7\times23=161=4(40)+1$ ✓. Inverse $23$.
3. $\gcd(6,9)=3\ne1$ — no inverse (division by $6\bmod9$ undefined!).
:::

::: step [Step 3: Conclusion] Final Result
Remainder-chain, unwind-with-signs, coprimality gate. Inverse-existence checked *before* computing — gate-first saves doomed arithmetic.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$\gcd(1071,462)$?
(A) $21$
(*B) $1071=2(462)+147$; $462=3(147)+21$; $147=7(21)+0$ → $21$
(C) $7$
(D) $3$
::: explanation
Chain: $147$, $21$, $0$ — last nonzero $21$. Classic Euclid demo numbers (used since textbooks immortalised them!) — run remainders, read the tail.
:::

::: quiz Q2: Numerical Drill
Inverse of $3\bmod11$?
(A) $7$ ($3\times7=21\equiv10$ ✗)
(*B) $4$ ($3\times4=12\equiv1$ ✓ — or extended: $11=3(3)+2$, $3=1(2)+1$ → $1=3-1(11-3\cdot3)=4(3)-1(11)$)
(C) $3$
(D) None exists ($\gcd=1$, exists!)
::: explanation
$3\times4=12\equiv1\bmod11$. (A) fails the multiply-check ($21\equiv10$); (D) ignores coprimality ($\gcd=1$ ⇒ exists). Multiply-verify every inverse claim — one line, total certainty.
:::

::: quiz Q3: Foundational Concept
Why must RSA's $e$ be coprime to $\phi(n)$?
(A) Speed regulation
(*B) Decryption needs $d=e^{-1}\bmod\phi(n)$ — inverses exist iff $\gcd(e,\phi)=1$; shared factors brick keygen (no $d$ exists, whole scheme stillborn!)
(C) Standards fashion
(D) Padding demands it
::: explanation
Coprimality gate (this topic!) guards RSA keygen (M3!): $\gcd\neq1$ ⇒ no inverse ⇒ no private key. Number-theory gates upstream, cryptosystems downstream — dependency named early.
:::
