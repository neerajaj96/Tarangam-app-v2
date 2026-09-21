---
id: m3_02_error_detection_crc_checksums_parity
courseCode: PCCST501
module: 3
sequence: 2
title: 'Error Detection: Parity, Checksums & CRC'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - State what parity, 2D parity, and checksums each miss
  - Divide out CRC remainders by hand in GF(2)
  - Separate detection verdicts from correction ability
  - Self-test with the exam recap and active-recall checklist
concepts:
  - parity
  - checksum
  - CRC
prerequisites:
  - m2_02_udp_segment_structure_and_checksum
examRelevance: high
tags:
  - data-link
  - error-detection
---
# Error Detection: Parity, Checksums & CRC

**Single/2D parity limits, Internet checksum reuse, polynomial CRC division with a hand-worked trace, and what each method can and cannot catch.**

<a id="the-intuition"></a>
## 1. The Real-World Situation — Start From Zero

Noise flips bits on every real link. The receiver must answer one question per frame — "did this arrive intact?" — without seeing the original. The trick: the sender tapes a small computed **tally** to the data; the receiver recomputes and compares. Mismatch means corruption; match (almost surely) means intact.

The problem before the solution: tallies differ in strength and cost. A 1-bit tally is cheap but blind to paired errors; a polynomial remainder costs shift-register hardware but catches bursts. This note climbs the ladder — parity, checksum, CRC (Cyclic Redundancy Check) — naming exactly what each misses.

::: callout-intuition Core Mental Model: The Cashier's Tally
A cashier counting a stack of bills announces the total alongside the stack — the customer recounts, and a mismatch means *something* went wrong (though not *which* bill). Error detection is that tally taped to the data: a few redundant bits, computed by the sender and rechecked by the receiver. Stronger tallies (CRC) catch sneakier damage; no tally *fixes* anything — detection asks for retransmission, correction needs far heavier codes (beyond this module's scope, used on Wi-Fi/physical layers).

Dropping the cashier now: parity = 1-bit odd/even tally; checksum = 1s-complement word sum; CRC = polynomial remainder in GF(2) (Galois Field of 2 elements — XOR arithmetic); all three detect, none corrects.
:::

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Parity bit** | One redundant bit making the total 1-count even (even parity) — catches any odd number of flips, blind to even counts. |
| **2D (two-dimensional) parity** | Parity per row *and* per column of a data block — catches 1–3 bit errors and most bursts; misses even-per-row-and-column patterns (the 4-bit rectangle). |
| **Internet checksum** | 1s-complement sum of 16-bit words (M2.2's algorithm reused) — cheap, software-friendly; blind to word swaps and cancelling patterns. |
| **CRC (Cyclic Redundancy Check)** | $r$-bit remainder of polynomial division by an $(r+1)$-bit generator $G$, all arithmetic in GF(2) (XOR, no carries). |
| **GF(2) (Galois Field with 2 elements)** | Bit arithmetic where addition = subtraction = XOR and there are no carries. |
| **Burst error** | A run of consecutively corrupted bits — the damage mode CRC is built to catch. |

<a id="the-math"></a>
## 3. Purpose — The Ladder, Strongest Last

### 3.1 Parity: 1D Catches Odd, 2D Catches Bursts (Mostly)

* **Single parity bit:** even parity makes the total 1-count even. Catches any **odd** number of bit errors; **blind to even** flips (two errors cancel). Overhead: 1 bit per byte/word.
* **2D parity:** arrange data in rows/columns, add a parity bit per row *and* per column. Catches all 1-, 2-, and 3-bit errors and *most* bursts; a 4-bit rectangle of errors (even per row *and* column) slips through — the classic counterexample to memorize.

### 3.2 Internet Checksum (Module 2 Reused)

1s-complement sum of 16-bit words + pseudoheader; receiver expects all-1s. Lightweight, software-friendly — and weak: swapped 16-bit words produce the *identical* sum (reordering invisible), and many multi-bit patterns cancel.

### 3.3 Operation Flow: CRC — Polynomial Division in Hardware, Step by Step

Treat bits as coefficients of a binary polynomial (all arithmetic mod 2 = XOR, no carries). With an $r+1$-bit **generator** $G$ (symbols: $D$ = data bits, $r$ = CRC length, $R$ = remainder):

1. Append $r$ zero bits to data $D$.
2. Divide by $G$ (XOR long division, aligning $G$ under each leading 1); the $r$-bit **remainder** $R$ is the CRC.
3. Transmit $\langle D, R \rangle$. Receiver divides the whole thing by $G$: remainder **zero** = intact.
4. Power: catches **all single-bit errors**, all **odd-count** errors (standard generators include an $(x+1)$ factor, which is exactly the condition that guarantees odd-count detection), all bursts shorter than $r+1$ bits, and all but a $2^{-r}$ fraction of longer bursts.

::: callout-formula KTU Formula Vault: Detection Ladder
Parity: odd-count only · 2D parity: +bursts except even-rectangles · checksum: cheap, blind to word swaps · **CRC**: single + odd + bursts $< r+1$, misses only $2^{-r}$ of longer ones. Exam numerical = CRC division (below) or "which errors escape 2D parity" (the 4-bit rectangle).
:::

::: callout-pitfall Detection ≠ Correction (and Remainder ≠ Error Location)
A failed check says *corrupt*, never *where* — none of these codes locate or fix bits (that needs Hamming/Reed-Solomon territory). And CRC's zero-remainder verdict is probabilistic armor ($2^{-r}$ leak), not a proof of intactness.
:::

<a id="worked-example"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

Data `101`, generator `11` ($r = 1$). Append one zero → `1010`. XOR-divide: `1010` vs `11` aligned left → `01` remainder... worked bitwise: `10` XOR `11` = `01`, bring down `1` → `011`, align `11` under leading 1 → `00`, bring down `0` → `00`. Remainder `0`. Transmit `1010`; receiver divides → `0000`, accept. One division, four XORs — the real thing is longer, not different.

### 4.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
Data $D = 1010001101$ (10 bits), generator $G = 110101$ ($r = 5$). Compute the CRC, form the transmitted codeword, and verify it at the receiver.
:::

::: step [Step 2: Execution] Dividing (XOR, No Carries)
Append five zeros: `101000110100000`. Successive 6-bit alignments against $G = 110101$:

`101000` → `011101` → `111011` → `001110` → `111010` → `001111` → `111110` → `001011` → `101100` → `011001` → `110010` → `000111`

Leftover 5-bit remainder: $R = 01110$. Transmit $\langle D, R \rangle$ = `1010001101 01110`.
:::

::: step [Step 3: Conclusion] Final Result
Receiver divides `101000110101110` by `110101` → remainder `00000`: **accept**. Flip any single transmitted bit and the remainder goes nonzero. (Machine-verified: polynomial long division in GF(2) gives exactly $R = 01110$ with zero receiver remainder.)
:::

::: anim crc-divide Six Alignments to 01110
Watch each 6-bit window XOR against the generator in turn — alignments appearing in division order until the 5-bit remainder stands alone, then the receiver's all-zero verdict.
:::

<a id="exam-recap"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| Parity vs. 2D parity | Odd-only vs. +bursts except the even rectangle. |
| Checksum vs. CRC | Word-sum (swap-blind, software-cheap) vs. polynomial remainder (burst-proof, shift-register hardware). |
| Detection vs. correction | Says corrupt (retransmit) vs. locates + fixes (Hamming and beyond). |
| Remainder zero vs. proof | Overwhelming evidence ($2^{-r}$ leak), not logical certainty. |

**Watch out:** (1) "CRC locates the bad bit" — it only convicts. (2) Forgetting the $r$ appended zeros before dividing. (3) Using normal subtraction — GF(2) means XOR, no borrows.

::: callout-exam KTU Exam Focus: One-Paragraph Recap
Ladder: single parity (odd-only) → 2D parity (fails even rectangles) → checksum (swap-blind) → CRC (single + odd + bursts $< r+1$, $2^{-r}$ leak). CRC recipe: append $r$ zeros, XOR-divide by $G$, transmit $\langle D,R\rangle$, receiver expects zero. Detection never locates; failures mean discard + retransmit.
:::

**Active-recall checklist:** Which 4-bit pattern defeats 2D parity? Why are swapped words checksum-invisible? Recite the four CRC steps. What does a nonzero remainder license?

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Two bits flip in a byte protected by a single even-parity bit. What happens, and why is 2D parity better here?
() The error is always caught because two is even
(*) The flips cancel in the parity count, so the error is invisible; 2D parity catches it because the two flips disturb row/column tallies asymmetrically (unless they form an even rectangle)
() Parity bits self-destruct on double errors
() Nothing — parity only protects text, not binary
::: explanation
Even parity sees *parity*, not errors: an even number of flips preserves it. 2D parity adds an orthogonal tally dimension — two flips break row parity, column parity, or both, except the 4-bit even-rectangle case (even flips per row *and* column) that every exam asks about.
:::

::: quiz A receiver's CRC division yields a nonzero remainder. What is licensed to conclude, and what must happen next?
() Exactly which bit flipped — flip it back and accept
(*) The frame is corrupt (detection only); discard it and rely on retransmission (link ARQ — Automatic Repeat reQuest — or TCP) — location and repair are beyond CRC
() The generator polynomial was wrong — renegotiate it
() Nonzero remainders are normal; accept anyway
::: explanation
Detection codes answer a yes/no question ("intact?"), never a where-question. The nonzero remainder triggers discard + recovery elsewhere. Only forward-error-correction codes (Hamming and beyond) both locate and repair — at far higher redundancy cost.
:::

::: quiz Why do real adapters use CRC in hardware rather than just a bigger checksum, given both detect errors?
() Checksums are patented and expensive to license
(*) CRC's polynomial structure catches burst errors and odd-count errors that checksums miss (e.g. swapped words are checksum-invisible), and XOR-shift division maps directly onto cheap shift-register hardware at line speed
() CRC headers are smaller than checksum headers
() Checksums cannot be computed in hardware at all
::: explanation
Two wins compound: *stronger math* (bursts, reorderings caught) and *cheaper physics* (shift registers tick per bit with no carry chains). Checksums survive only where software simplicity beats strength (UDP/TCP/IP headers, computed by CPUs, not adapters).
:::
