# Error Detection: Parity, Checksums & CRC

**Single/2D parity limits, Internet checksum reuse, polynomial CRC division with a hand-worked trace, and what each method can and cannot catch.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Cashier's Tally
A cashier counting a stack of bills announces the total alongside the stack — the customer recounts, and a mismatch means *something* went wrong (though not *which* bill). Error detection is that tally taped to the data: a few redundant bits, computed by the sender and rechecked by the receiver. Stronger tallies (CRC) catch sneakier damage; no tally *fixes* anything — detection asks for retransmission, correction needs far heavier codes (beyond this module's scope, used on Wi-Fi/physical layers).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Parity: 1D Catches Odd, 2D Catches Bursts (Mostly)

* **Single parity bit:** even parity makes the total 1-count even. Catches any **odd** number of bit errors; **blind to even** flips (two errors cancel). Overhead: 1 bit per byte/word.
* **2D parity:** arrange data in rows/columns, add a parity bit per row *and* per column. Catches all 1-, 2-, and 3-bit errors and *most* bursts; a 4-bit rectangle of errors (even per row *and* column) slips through — the classic counterexample to memorize.

### 2.2 Internet Checksum (Module 2 Reused)

1s-complement sum of 16-bit words + pseudoheader; receiver expects all-1s. Lightweight, software-friendly — and weak: swapped 16-bit words produce the *identical* sum (reordering invisible), and many multi-bit patterns cancel.

### 2.3 CRC: Polynomial Division in Hardware

Treat bits as coefficients of a binary polynomial (all arithmetic mod 2 = XOR, no carries). With an $r+1$-bit **generator** $G$:

1. Append $r$ zero bits to data $D$.
2. Divide by $G$ (XOR long division); the $r$-bit **remainder** $R$ is the CRC.
3. Transmit $\langle D, R \rangle$. Receiver divides the whole thing by $G$: remainder **zero** = intact.
4. Power: catches **all single-bit errors**, all **odd-count** errors (if $G$ has an $(x+1)$ factor, as standard generators do), all bursts shorter than $r+1$ bits, and all but a $2^{-r}$ fraction of longer bursts.

::: callout-formula KTU Formula Vault: Detection Ladder
Parity: odd-count only · 2D parity: +bursts except even-rectangles · checksum: cheap, blind to word swaps · **CRC**: single + odd + bursts $< r+1$, misses only $2^{-r}$ of longer ones. Exam numerical = CRC division (below) or "which errors escape 2D parity" (the 4-bit rectangle).
:::

::: callout-pitfall Detection ≠ Correction (and Remainder ≠ Error Location)
A failed check says *corrupt*, never *where* — none of these codes locate or fix bits (that needs Hamming/Reed-Solomon territory). And CRC's zero-remainder verdict is probabilistic armor ($2^{-r}$ leak), not a proof of intactness.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

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

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
(*) The frame is corrupt (detection only); discard it and rely on retransmission (link ARQ or TCP) — location and repair are beyond CRC
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
