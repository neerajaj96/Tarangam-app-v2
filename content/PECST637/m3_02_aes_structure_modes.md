---
id: m3_02_aes_structure_modes
courseCode: PECST637
module: 3
sequence: 2
title: 'AES Structure: Rijndael Rounds'
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Round four SPN transforms with ten, twelve or fourteen counts
  - Expand keys on schedule without Feistel habits
  - Place modes with never-ECB-data and GCM-default discipline
concepts:
  - AES structure
  - substitution-permutation network
  - block-cipher modes
prerequisites:
  - m3_01_des_structure_strength
examRelevance: high
tags:
  - block-ciphers
  - aes
---
# AES Structure: Rijndael Rounds

**The modern workhorse — SPN (not Feistel!), four transforms, key schedules, and mode discipline.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Bakery Assembly Line (Invertible!)
AES runs $128$-bit dough through $10$–$14$ stations (rounds by key size!): **SubBytes** (S-box flavour each byte — confusion!), **ShiftRows** (row offsets — diffusion starter!), **MixColumns** (column blender — diffusion completer!), **AddRoundKey** (key fold-in!). Every station *invertible* (decrypt = reverse line — unlike Feistel's free inversion!); final round skips MixColumns (symmetry bookkeeping!). **Modes** (ECB/CBC/CTR/GCM!) decide block-to-message composition (ECB-penguin infamy: identical blocks ⇒ identical images — never ECB data!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Round anatomy + key expansion + modes

* State $4\times4$ bytes; rounds: $10$ ($128$-bit keys), $12$ ($192$), $14$ ($256$); key expansion (RotWord/SubWord/Rcon g-function!).
* Modes: ECB (leaks patterns — penguin exhibits!), CBC (IV + chaining, padding oracles lurk!), CTR (nonce+counter stream-ish, parallelisable!), GCM (CTR + GMAC auth — AEAD modern default!).
* Strength: $2^{128}$ brute-force comfort + two decades of analysis without practical breaks (biclique nibbles only!).

::: callout-formula KTU Formula Vault: AES
SPN $4$ transforms · rounds **$10/12/14$** · modes: **never-ECB-data** · GCM = **modern default**.
:::

::: callout-pitfall ECB Penguin (Pattern Preservation!)
ECB encrypts equal blocks equally (deterministic per block!) — structured data (images, protocols!) leaks silhouettes visibly. Mode choice *is* security-relevant (primitive ≠ protocol!) — ECB-for-data fails instantly in grading.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Trace one AES round's four transforms on a named state purpose each, then place: penguin image (mode verdict!), login cookie (mode pick!), disk sector (mode pick with tweak note!)."
:::

::: step [Step 2: Execution] Stations + Placements
1. SubBytes (nonlinear flavour per byte!) → ShiftRows (spread across columns!) → MixColumns (blend within columns!) → AddRoundKey (key binding!). Purposes stated per station (confusion/diffusion/key-mix!).
2. Penguin: CBC/CTR (patterns must die — ECB convicted by exhibit!). Cookie: GCM (confidentiality + authenticity together — AEAD!). Disk: XTS (tweak-per-sector — same plaintext differs per sector!).
:::

::: step [Step 3: Conclusion] Final Result
Transform-purposes plus mode placements with reasons (pattern/auth/tweak needs!). Primitive-vs-protocol split (AES-the-math vs mode-the-system!) structures every symmetric answer.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
AES decrypts by inverse line (vs Feistel free-ride) because:
(A) AES is weaker structurally
(*B) SPN has no swap-XOR self-inverse scaffolding (every transform must invert explicitly — InvSubBytes/InvShiftRows/InvMixColumns scheduled backwards!). Design tradeoff: uniform rounds both ways (no Feistel plumbing!) at explicit-inverse cost.
(C) Keys differ per direction
(D) Rounds differ in count
::: explanation
Structure-vs-primitive inversion (Feistel scaffolds, SPN inverts parts!). Equivalent-inverse-ciphertext reorderings (implementation lore!) optimise the return trip — structure shapes implementation, quoted as bonus.
:::

::: quiz Q2: Foundational Concept
CBC padding oracles (Lucky-13 lineage) exploit:
(A) Weak AES math
(*B) *Error distinguishability* (pad-valid vs MAC-fail responses differ — decryption/verification order leaks a byte-testing oracle!): fix = uniform errors + encrypt-then-MAC (or AEAD modes sidestepping the pattern!).
(C) Short keys
(D) Fast networks
::: explanation
Oracle = distinguishable failure (valid-pad-but-bad-MAC vs bad-pad!) queried byte-by-byte. Uniform-error + verify-then-release discipline (or GCM-whole!) closes oracles — failure-indistinguishability as design rule.
:::

::: quiz Q3: Foundational Concept
GCM's AEAD advantage over CBC+HMAC composing:
(A) Speed only
(*B) Single-pass authenticated encryption (CTR speed + GMAC integrity, standardised composition — no order pitfalls!; nonce-misuse fragility noted honestly: repeated nonces leak XORs — random $96$-bit discipline!)
(C) Bigger blocks
(D) No keys needed
::: explanation
Composition-done-right (encrypt+authenticate jointly, nonce-gated!) vs DIY pitfalls (MAC-then-encrypt vs encrypt-then-MAC minefields!). Nonce discipline (unique-per-key!) is the stated price — free lunch nowhere, receipts everywhere.
:::
