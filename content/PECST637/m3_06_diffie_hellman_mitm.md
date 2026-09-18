# Diffie–Hellman Key Exchange & MITM

**Strangers agree secretly over shouting channels — paint-mixing protocol, toy arithmetic, and the authentication hole.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Public Paint-Mixing
Agree on public yellow paint ($p,g$!). Alice secretly stirs red ($a$ → sends orange $g^a$!); Bob secretly stirs blue ($b$ → sends $g^b$!). Both mix received + secret (Alice: $(g^b)^a$; Bob: $(g^a)^b$ — same muddy $g^{ab}$!). Eavesdroppers see yellows and oranges (discrete-log wall blocks unmixing!). **Hole**: no identities (Mallory intercepts *both* swaps — separate secrets with each, relays transparently — authentication absent, MITM feasts!). Fix: sign the swap (signatures/PKI — M4!) or password-authenticated variants.
:::

::: anim dh-exchange Swap Public, Keep Secret
$g^a$ and $g^b$ cross in the open; $g^{ab}$ blooms privately at both ends — eavesdroppers keep paint, never secrets.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Protocol + toy + MITM anatomy

* Public $(p,g)$; secrets $a,b$; exchange $A=g^a,B=g^b$; shared $B^a=A^b=g^{ab}$ (session keys derived via KDF, never raw!).
* Toy: $p=23,g=5$, $a=6$ ($5^6\bmod23=8$), $b=15$ ($5^{15}\bmod23=19$); shared $19^6\equiv8^{15}\equiv2\bmod23$ (verify both routes!).
* MITM: Mallory swaps separately ($g^{am}$ with Alice, $g^{bm}$ with Bob — transparent relay, full read/write!). Station-to-station (signatures!) closes it.

::: callout-formula KTU Formula Vault: DH
Public **$(p,g)$** · swap **$g^a,g^b$** · share **$g^{ab}$** · hole **no-auth** · fix **sign it**.
:::

::: callout-pitfall Raw $g^{ab}$ as Key (Never!)
Shared secret needs KDF-stretching/hashing (structure + related-key hygiene!) plus key-confirmation round (both prove possession!) — raw-group-element keys leak structure and skip liveness proof. Derive-and-confirm discipline, always.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Toy above: verify both shared-secret routes equal $2$, then narrate Mallory's MITM message-by-message, then state the station-to-station fix line."
:::

::: step [Step 2: Execution] Routes, Relay, Signatures
1. Alice: $19^6\bmod23$: $19\equiv-4$; $(-4)^6=4096$; $4096\bmod23$: $23\times178=4094$ → $2$ ✓. Bob: $8^{15}\bmod23=2$ (square-chain: $8^2=64\equiv18$, $8^4\equiv18^2=324\equiv2$, $8^8\equiv4$, $8^{15}=8^8\cdot8^4\cdot8^2\cdot8\equiv4\cdot2\cdot18\cdot8=1152\equiv1152-23\cdot50=2$ ✓!). Agreement verified both ways.
2. Mallory↔Alice ($m_1$) and Mallory↔Bob ($m_2$) swaps; relays re-encrypted both directions (transparent bridge, full plaintext at middle!).
3. Fix: sign $g^a,g^b$ under long-term identity keys (station-to-station: signatures verified *before* deriving — authentication bootstraps the unauthenticated dance!).
:::

::: step [Step 3: Conclusion] Final Result
Dual-route verification (arithmetic honesty!), relay narration (message-level!), signature fix (layered defense!). Verification-before-trust ordering (verify, *then* derive!) is the protocol moral.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$p=23,g=5,a=6$. Alice sends?
(A) $30$
(*B) $5^6=15625$; $15625\bmod23$: $23\times679=15617$ → $8$ (square-chain: $5^2\equiv2$, $5^4\equiv4$, $5^6=5^4\cdot5^2\equiv4\cdot2=8$ ✓ — chain beats division!)
(C) $6$
(D) $11$
::: explanation
Square-and-combine ($5^6=5^4\cdot5^2\equiv4\cdot2=8$!) over long-division drudgery (error-prone!). Chain-discipline (powers-of-two table, then combine!) is the exam arithmetic shape.
:::

::: quiz Q2: Foundational Concept
MITM succeeds against textbook DH fundamentally because:
(A) Math is weak
(*B) No authentication binds messages to identities (keys float authorless — Mallory's swaps verify *as well as* Alice's, nothing distinguishes!) — key-exchange ≠ authenticated-key-exchange (missing identity layer, not broken math!)
(C) Primes too small
(D) Exponents leak
::: explanation
Authorlessness (protocol carries no identity!) is the hole class affecting all unauthenticated key exchange generally. Fix adds identity (signatures/passwords/channels!) — layer named, math absolved.
:::

::: quiz Q3: Foundational Concept
Forward secrecy (ephemeral DH) buys past-protection by:
(A) Bigger keys
(*B) Per-session throwaway exponents (long-term key compromise decrypts *nothing* past — session keys never encrypted under long-term keys, only *authenticated* by them!) — breach blast bounded to live sessions (present-only damage!)
(C) Faster handshakes
(D) Shorter exponents
::: explanation
Ephemerality severs past from present compromise (each session independent randomness!) — long-term keys authenticate, never transport. Transport-vs-auth split (ephemeral transport, static auth!) is the modern handshake shape (TLS 1.3 echoes it!).
:::
