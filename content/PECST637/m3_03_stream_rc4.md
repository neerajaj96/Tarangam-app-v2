---
id: m3_03_stream_rc4
courseCode: PECST637
module: 3
sequence: 3
title: Stream Ciphers & RC4
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Ballet keystream XOR with unpredictability as security
  - Shuffle KSA then drip PRGA in RC4 order
  - Condemn keystream reuse as two-time-pad catastrophe
concepts:
  - stream ciphers
  - RC4
  - keystream reuse
prerequisites:
  - m2_03_substitution_cryptanalysis
examRelevance: medium
tags:
  - stream-ciphers
  - rc4
---
# Stream Ciphers & RC4

**Keystream XOR ballet — one-time-pad dreams on keystream generators, LFSR basics, and RC4's rise-and-fall.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Endless OTP Tape (Almost!)
**Stream ciphers** stretch short keys into long pseudorandom **keystreams** (C = P ⊕ stream, bit-by-bit — OTP's *convenience* without OTP's key bulk!). Security = keystream unpredictability (next-bit-unpredictable given history, else breaks cascade!). **RC4** (Rivest's cipher): S-box shuffle (KSA!) then byte-dripping PRGA (i/j dance!) — beautifully simple, WEP-famous, bias-doomed (Fluhrer-Mantin-Shamir key-schedule leaks + broadcast-key reuse catastrophes → retired, TLS-banned!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Stream mechanics + RC4 anatomy + breaks

* Synchronous (keystream independent of text — needs sync!) vs self-synchronising (ciphertext feedback — resyncs, error-propagates!).
* RC4: KSA permutes $256$ bytes by key; PRGA emits (swap-and-output loop); biases (second-byte-zero-rate anomalies, key-dependent!) → WEP IV-reuse + key-concat breaks (PTW recovers keys from millions of frames!).
* Modern heirs: ChaCha20 (ARX, nonce-safe design!), eSTREAM portfolio (Grain/HC-128/Mickey/Salsa family!).

::: callout-formula KTU Formula Vault: Streams
C = **P ⊕ keystream** · security = **unpredictability** · RC4: **KSA-shuffle + PRGA-drip** · reuse = **catastrophe (two-time pad!)**.
:::

::: callout-pitfall Keystream Reuse = Two-Time Pad (XOR Cancels Keys!)
$C_1\oplus C_2 = P_1\oplus P_2$ (keys vanish, cribs drag through both!) — nonce/IV uniqueness per message is *the* stream-cipher commandment (WEP's $24$-bit IV collisions doomed it!). Uniqueness-per-encryption stated as law, always.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Toy-RC4 ($4$-element S-box, key $[1,2]$): KSA shuffle trace? Then: two WEP frames reuse IV — crib-drag sketch on known `GET ` prefix? Then: modern replacement prescription?"
:::

::: step [Step 2: Execution] Shuffle, Drag, Replace
1. KSA: $j=0$; $i=0$: $j=(0+S[0]+1)\bmod4$… trace swaps per $i$ (mechanical, show array states! — toy scale keeps it hand-traceable!).
2. $C_1\oplus C_2 = P_1\oplus P_2$: slide `GET /...` crib (known-plaintext wedge!) recovering sibling bytes positionally (crib-dragging demo!).
3. Replace: ChaCha20-Poly1305 (nonce-misuse-resistant-ish AEAD!) or AES-GCM (hardware-backed!) — RC4 retired everywhere (prohibition cited, not nostalgia!).
:::

::: step [Step 3: Conclusion] Final Result
Shuffle-trace, crib-drag, replace-with-reasons. Reuse-consequence demo (XOR-cancels!) is the visceral lesson — arithmetic makes policy memorable.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Synchronous vs self-synchronising streams differ on:
(A) Speed only
(*B) Error/sync behaviour (synchronous: bit-flip corrupts one bit, *loss* of sync cascades — needs framing!; self-sync: errors propagate finite windows then *re-sync automatically* — robustness vs precision tradeoff!)
(C) Key sizes
(D) Nothing operational
::: explanation
Sync-failure modes decide deployment (lossy radio loves self-sync recovery; storage demands synchronous exactness!). Failure-mode analysis (what breaks how!) picks families — state both columns.
:::

::: quiz Q2: Foundational Concept
WEP's RC4 downfall compounded *three* sins — name the fatal stack:
(A) Short keys only
(*B) $24$-bit IVs (collisions in hours!) + per-packet key = IV‖rootkey concat (related-key FMS attacks!) + CRC integrity (linear malleability!) — reuse + related-keys + no-authenticity triplekill (each alone wounding, together fatal!)
(C) Slow CPUs
(D) Big antennas
::: explanation
Triplekill anatomy (nonce-space, key-derivation, integrity-absence!) — WEP as anti-pattern museum (each flaw a lecture!). Layered-failure reading (three independent sins!) beats single-cause myths.
:::

::: quiz Q3: Foundational Concept
LFSR-based stream design needs (beyond maximal period):
(A) Long registers only
(*B) Nonlinear combining/filtering (pure-LFSR linearity falls to Berlekamp-Massey from $2n$ bits! — known-plaintext kills linear generators!) + irregular clocking (shrinking/self-shrinking!) + correlation-immunity (combiner tables vetted!)
(C) Bigger clocks
(D) More taps always
::: explanation
Linearity-is-death lesson (BM reconstructs from $2n$ observed bits!) — nonlinear output functions + clock control supply the actual security. Linearity audit (where's the nonlinear step?!) interrogates every stream proposal.
:::
