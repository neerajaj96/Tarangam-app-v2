# SHA-3 Sponge & MACs (HMAC)

**Squeeze-and-absorb hashing plus keyed integrity — sponge mechanics and the nested-MAC fix.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Kitchen Sponge & Wax Seals
**SHA-3/Keccak** soaks input in (absorb: XOR blocks into state, permute $f$!) then wrings output out (squeeze: read off, permute more — arbitrary lengths, same sponge!). Capacity half stays secret (security dial!). **MACs** wax-seal messages (keyed tag — forgery needs the key!). Naive `hash(key\|m)` seals leak (length-extension forgeries!). **HMAC** double-dips ($H(K\oplus opad\|H(K\oplus ipad\|m))$ — nested envelopes, extension-proofed by construction!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Sponge params + HMAC construction + verify discipline

* Keccak-$f[1600]$ ($24$ rounds of $\theta\rho\pi\chi\iota$ step-mappings!); rate $r$ + capacity $c$ ($r+c=1600$; SHA3-256: $r=1088,c=512$ — capacity/2 = $256$-bit strength!).
* HMAC keys (hash-down long keys! block-sized pads!), verify by recompute-and-compare-*constant-time* (timing side-channels punish early-exit compares!).
* Use rule: encrypt-then-MAC (authenticate ciphertext! — M2/M3 reunion: order matters, padding oracles die here!).

::: callout-formula KTU Formula Vault: Sponge + Seal
Absorb **XOR+permute** · squeeze **read+permute** · HMAC **nested envelopes** · compare **constant-time**.
:::

::: callout-pitfall Non-Constant-Time Compare Leaks Tags Bytewise
Early-exit `==` times out at first mismatch (timing oracle: fix bytes left-to-right remotely!). Constant-time compare (XOR-accumulate!) is *the* MAC-verify discipline — side-channel awareness in two lines of code review.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"API authenticates via `SHA256(secret‖request)` tokens. (a) Forge without secret (shape!)? (b) HMAC migration sketch? (c) Verify-side timing audit note?"
:::

::: step [Step 2: Execution] Extend, Nest, Time-Evenly
1. (a) Length-extend: $token'=$ valid for `request‖pad‖admin=true` (state-continuation forgery — secret unneeded!).
2. (b) Migrate: `HMAC-SHA256(key, request)` (nested envelopes kill extension!; key via KMS/secrets manager, rotated!).
3. (c) Verify with constant-time compare (XOR-fold!) + replay window (nonce/timestamp — freshness beyond integrity!).
:::

::: step [Step 3: Conclusion] Final Result
Forge-shape, nested-migration, timing-plus-freshness audit. Extension-demo (no secret needed!) is the visceral convincer — arithmetic makes policy stick.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Sponge capacity $c$ sets strength because:
(A) Bigger state always faster
(*B) Unknown-to-attacker state fraction ($c/2$-bit security claim — rate trades speed for strength: bigger $r$ = faster absorbs, smaller $c$ = weaker margin!). Tunable dial, not fixed fate (SHAKE XOFs exploit: arbitrary lengths!).
(C) Capacity stores keys
(D) Rounds scale it
::: explanation
Rate/capacity split ($r+c$ fixed!) is the speed-strength frontier (SHA3-256: $1088/512$!). Tunability (XOF lengths!) vs fixed-output heritage — sponge flexibility as design virtue, quoted with numbers.
:::

::: quiz Q2: Foundational Concept
Encrypt-then-MAC ordering wins because:
(A) Alphabetical convention
(*B) Ciphertext verified *before* decryption (forgeries die pre-parse — padding oracles starve, no decryption oracle offered!; MAC-then-encrypt decrypts attacker text (oracle surface!), encrypt-and-MAC leaks equality patterns!)
(C) Faster pipelines
(D) Standards mandate blindly
::: explanation
Verify-before-touch (untrusted bytes never reach parsers!) kills oracle classes structurally. Order-is-security (composition discipline!) — MAC-then-decrypt-never-touches-unverified is the mantra.
:::

::: quiz Q3: Foundational Concept
Nonces vs keys in MAC land (distinct roles!):
(A) Interchangeable secrets
(*B) Nonce: uniqueness-per-message (freshness/replay defense, public ok!); key: secrecy (forgery barrier!). Reused nonce + stream-ish MACs leak (equality patterns!); leaked key forges everything (total break!). Role-split clarity (fresh vs secret!) prevents conflation bugs.
(C) Both must hide
(D) Both public-safe
::: explanation
Freshness-vs-secrecy axis split (nonce public-unique, key secret-stable!) — conflation (secret nonce wasted, public key fatal!) is the design error class. Role labels per value, always.
:::
