# Digital Signatures: RSA, ElGamal & DSS

**Asymmetric authorship — hash-then-sign, verification algebra, and why raw textbook signing dies.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Wax Seal with Public Notary
**Sign**: hash the letter (fingerprint!), stamp with *private* key (RSA: $s = H(m)^d$ — only you can!). **Verify**: anyone hashes + public-checks ($s^e \stackrel?= H(m)$ — notary confirms!). **ElGamal/DSS** randomise per signature (fresh $k$ each time — reuse leaks keys famously, Sony-PS3-grade catastrophes!). Raw-message signing (no hash!) enables existential forgeries (multiplicative malleability: $s_1s_2$ signs $m_1m_2$!) — hash-then-sign (PSS padding!) mandatory.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 RSA-sign + ElGamal/DSS sketch + hash-mandate

* RSA: $s = H(m)^d \bmod n$; verify $s^e \equiv H(m)$ (PSS padding: randomised, provable-ish!).
* ElGamal: ephemeral $k$, $(r,s)$ pair; DSS/DSA standardised variant (SHA + $160$–$256$-bit $q$ subgroup!).
* $k$-reuse leaks $x$ (two equations, two unknowns $k,x$ — solved!); RFC 6979 deterministic-$k$ (HMAC-derived — randomness without RNG trust!).

::: callout-formula KTU Formula Vault: Signatures
Sign **hash+private** · verify **hash+public** · $k$ **fresh-always** · raw-signing **forgivable**.
:::

::: callout-pitfall Textbook-RSA-Sign Malleability ($s_1s_2$ Signs $m_1m_2$!)
Unpadded RSA signatures multiply homomorphically (forgeries from thin air on *random* messages — existential, then chosen-message extensions!). Hashing (+PSS structure!) breaks multiplicativity — padding is authenticity's load-bearing wall, again.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Toy RSA ($n=33,e=3,d=7$ from M3!): (a) Sign $H(m)=4$? Verify? (b) Forge demo from signatures on $2$ and $3$ (raw!)? (c) $k$-reuse leak sketch (ElGamal-shape)?"
:::

::: step [Step 2: Execution] Stamp, Forge, Leak
1. (a) $s = 4^7\bmod33$: $4^2=16$, $4^4=256\bmod33$: $33\times7=231$ → $25$; $4^7=4^4\cdot4^2\cdot4\equiv25\cdot16\cdot4=1600$; $33\times48=1584$ → $16$. Verify $16^3=4096\bmod33$: $33\times124=4092$ → $4$ ✓ ($H(m)$ returns!).
2. (b) Sigs $s_2,s_3$ on $2,3$ ⇒ $s_2s_3\bmod n$ verifies as $6$'s signature (multiplicative malleability demo — hashless danger!).
3. (c) Two sigs, same $k$: subtract equations → $k$ falls → $x$ falls (Sony-class catastrophe in miniature — fresh-$k$-per-signature law!).
:::

::: step [Step 3: Conclusion] Final Result
Stamp-verify round trip, malleability demo, $k$-reuse autopsy. Toy-complete verification chains (M3 numbers reused!) turn modules into one story.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Hash-then-sign (vs sign-raw-message) also buys:
(A) Nothing but speed
(*B) Domain separation (fixed-size hash input tames malleability + message-size limits!) *and* efficiency (sign short digests, not gigabytes!) — security + performance twin wins (neither alone suffices as rationale!)
(C) Deniability
(D) Smaller keys
::: explanation
Malleability-kill (hash breaks multiplicative structure!) plus size-normalisation (constant-time-ish signing!) — twin rationale quoted together (security *and* practicality, inseparable here!).
:::

::: quiz Q2: Foundational Concept
Deterministic-$k$ (RFC 6979) answers which failure?
(A) Slow signing
(*B) RNG failures leaking/repeating $k$ (embedded devices, VM snapshots resetting entropy! — Sony/PS3-class disasters!) — HMAC-derived $k$ (deterministic per message+key, verifier-blind difference!) removes trusted-randomness dependency
(C) Large signatures
(D) Quantum attacks
::: explanation
Randomness-dependency amputated (deterministic yet unpredictable-to-others!) — VM-snapshot/embedded entropy starvation can't recur the catastrophe. Trust-surface shrink (fewer moving parts!) is the design moral.
:::

::: quiz Q3: Foundational Concept
Signature *verification* needs no secrets, enabling:
(A) Nothing new (symmetric MACs verify too — with the key!)
(*B) Public adjudication (judges/auditors/strangers verify authorship — non-repudiation's third-party leg!; timestamped logs + PKI (M4.4!) complete evidentiary chains!)
(C) Faster signing
(D) Shorter hashes
::: explanation
Verifiability-by-strangers (key-free checking!) is *the* asymmetric signature dividend (MACs can't third-party-adjudicate — shared secrets!). Evidentiary stack (sign+timestamp+cert!) listed as the courtroom-ready bundle.
:::
