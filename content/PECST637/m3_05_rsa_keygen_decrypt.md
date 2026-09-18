# RSA: Keygen, Encrypt, Decrypt & Proofs

**Multiply easy, factor hard — full toy walkthroughs plus why decryption returns the message.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Paint-Mixing Locks
Multiply two secret paints ($p,q$ → $n$ — easy stir!); unmixing dried paint (factoring $n$!) defeats labs. Publish the mixed colour ($n$) + stir-count ($e$!); keep unmixer ($d$, from $\phi$-arithmetic only factors reveal!). Encrypt: message-to-power-$e$ mod $n$ (anyone stirs!); decrypt: power-$d$ (unmixer restores — Euler guarantees the round trip when $\gcd(m,n)=1$, CRT padding extends!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Keygen/ops + correctness sketch + pitfalls

* Pick $p,q$ (MR-tested!); $n=pq$, $\phi=(p-1)(q-1)$; $e$ coprime ($\gcd=1$ gate!); $d=e^{-1}\bmod\phi$ (extended Euclid!); public $(e,n)$, private $(d,n)$.
* $c=m^e\bmod n$; $m=c^d\bmod n$ (Euler: $m^{ed}=m^{k\phi+1}\equiv m$!).
* Pitfalls: small-$e$ broadcast (Håstad!), textbook malleability (signatures need hashing/padding — M4!), textbook-RSA-never-deploys (OAEP padding mandatory!).

::: callout-formula KTU Formula Vault: RSA
$n=pq$, $\phi$ product · $ed\equiv1$ (gate $\gcd=1$!) · $c=m^e$, $m=c^d$ · deploy with **OAEP**.
:::

::: callout-pitfall Textbook RSA Everywhere Is the Exercise, Nowhere the Deployment
Unpadded RSA leaks structure (malleable! deterministic! small-$e$ broadcast-crackable!) — OAEP (randomised padding!) mandatory in practice. Exercise-vs-deployment labelling (toy naked, prod padded!) is the honesty discipline.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Toy: $p=3,q=11$, $e=3$. (a) Keys? (b) Encrypt $m=4$? (c) Decrypt back? (d) Why does it round-trip (Euler line)?"
:::

::: step [Step 2: Execution] Full Circle, Tiny Numbers
1. $n=33$, $\phi=2\cdot10=20$; $\gcd(3,20)=1$ ✓; $d=3^{-1}\bmod20=7$ ($21\equiv1$ ✓!).
2. $c=4^3=64\equiv64-33=31$.
3. $m=31^7\bmod33$: $31\equiv-2$; $(-2)^7=-128$; $-128\bmod33$: $-128+132=4$ ✓ ($4$ returns!).
4. $ed=21=1(20)+1$: $m^{21}=(m^{20})m\equiv1\cdot m$ (Euler, $\gcd(4,33)=1$ ✓!) — round trip *is* Euler wearing keygen clothes.
:::

::: step [Step 3: Conclusion] Final Result
Gate ($\gcd$!), inverse, power, unpower, Euler-receipt. Round-trip receipt (Euler line!) closes RSA answers — mechanism *and* reason, both shown.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$p=5,q=11$, $e=3$. $d$?
(A) $3$
(*B) $\phi=4\cdot10=40$; $3d\equiv1\bmod40$: $3\times27=81=2(40)+1$ → $d=27$ (extended: $40=13(3)+1$ ⇒ $1=40-13(3)$ ⇒ $d\equiv-13\equiv27$ ✓!)
(C) $13$
(D) $40$
::: explanation
Extended unwind ($40=13\cdot3+1$ gives $-13\equiv27$!) then multiply-verify ($81\bmod40=1$!). Unwind-plus-verify duet (compute, then prove!) is the inverse-answer shape.
:::

::: quiz Q2: Foundational Concept
Euler's line in RSA correctness ($m^{ed}\equiv m$):
(A) Decorative citation
(*B) $ed=1+k\phi$ ⇒ $m^{ed}=(m^{\phi})^k\cdot m\equiv1^k\cdot m$ (needs $\gcd(m,n)=1$!; CRT extends past it — edge-case honesty noted!) — the *reason* decryption inverts, not incantation
(C) Only for prime $n$
(D) Approximate identity
::: explanation
Exponent-split ($k\phi+1$!) plus Euler collapse equals round trip (coprime-gated, CRT-generalised!). Proof-sketch literacy (split-collapse-gate-extend!) outranks rote keygen in grading.
:::

::: quiz Q3: Foundational Concept
Håstad broadcast ($e=3$, same $m$ to $3$ moduli) breaks because:
(A) Small keys used
(*B) CRT across three $m^3$-ciphertexts recovers $m^3$ *over integers* (cube-root the plaintext! — padding absence lets textbook math invert!); randomised padding (OAEP!) breaks sameness (each encryption differs!)
(C) Factoring got easy
(D) $e$ must be large always (small $e$ fine *with* padding! — padding, not bigness, is the fix!)
::: explanation
Same-plaintext-same-ciphertext determinism enables cross-modulus CRT assembly (integer cube root, no factoring!). Randomised padding (freshness per encryption!) dissolves determinism — fix named precisely (padding, not $e$-size!).
:::
