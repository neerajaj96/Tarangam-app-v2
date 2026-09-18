# DES: Structure, Avalanche & Strength

**The Data Encryption Standard — Feistel at scale, S-box soul, avalanche drama, and why $56$ bits died.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Laundry Mangle, 16 Passes
DES feeds $64$-bit blocks through $16$ Feistel rounds (M2 reunion!): halves split, right half stretched ($32\to48$ bits!), XORed with round subkeys (from the $56$-bit master via rotations!), squeezed through **S-boxes** (the only nonlinear parts — confusion's beating heart!), permuted straight (P-box diffusion!). **Avalanche**: flip one input bit → half the output flips (S-box nonlinearity amplifies!). **Strength**: $2^{56}$ keys (EFF cracker days in '98, giggles today!) + key-complementation quirks + triple-DES bandage ($112$-bit effective, slow!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Round pipeline + key schedule + verdicts

* IP → $16\times$[expand $E$, XOR $K_i$, $8$ S-boxes ($6\to4$!), $P$-permute, swap halves] → $IP^{-1}$. Key: $64$ (parity!) → $56$ (PC-1 drops parity!) → $16\times48$ subkeys (rotations $1$-or-$2$!).
* Avalanche demo numbers (Stallings' classic: 1-bit plaintext/key flip → $\approx32$-bit output change!).
* Verdicts: brute-force economics killed it (not cryptanalysis! — differential/linear need $2^{47}$-ish texts, impractical-ish!); 3DES ($E$-$D$-$E$, $2$-$3$ keys) legacy bridge; AES replaced (next!).

::: callout-formula KTU Formula Vault: DES
$64$-bit blocks · $16$ Feistel rounds · $56$-bit keys · S-boxes = **nonlinear soul** · avalanche **$\approx 1/2$ bits flip**.
:::

::: callout-pitfall S-Boxes Carry the Security (Not the Permutations!)
$E$/P/IP are *linear* (diffusion plumbing!) — all confusion lives in S-box nonlinearity (differential/linear cryptanalysis targets *their* biases!). "More rounds of permuting" without S-box strength adds theater, not security — nonlinear-core doctrine.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Toy-Feistel (M2.4 nibbles) scaled mentally to DES: (a) subkey count/size from $56$-bit master? (b) Avalanche-meaning demo ($1$-bit flip consequence)? (c) 3DES effective strength with $2$ keys ($112$ stored bits!)?"
:::

::: step [Step 2: Execution] Schedule, Amplify, Bandage
1. (a) $16$ subkeys $\times 48$ bits (rotations schedule them all from $56$!).
2. (b) One flipped input bit → S-box cascades → $\approx32$ of $64$ output bits differ (avalanche *measured*, not claimed!).
3. (c) Meet-in-the-middle halves $168\to112$ effective ($2$-key; $3$-key $168$ nominal!). Stored-bits $\ne$ strength — attack-math prices keys, not labels.
:::

::: step [Step 3: Conclusion] Final Result
Schedule-count, avalanche-measure, effective-strength arithmetic. Nominal-vs-effective key strength (meet-in-the-middle discount!) is the evaluation literacy on display.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why $16$ rounds (not $4$)?
(A) Round numbers are traditional
(*B) Confusion/diffusion *accumulate* per round (single-round statistics leak badly — differential trails need depth to flatten!); $16$ margins against known analyses (fewer fall to differential/linear breaks in reduced-round demos!)
(C) Speed demands it
(D) Keys need homes
::: explanation
Statistical flattening compounds (each round mixes further — avalanche *needs* depth!). Round-count = security margin quantified (breaks at $N-k$ rounds ⇒ ship $N$ with margin $k$!). Margin reasoning (not round-count worship!) is the design literacy.
:::

::: quiz Q2: Foundational Concept
Parity bits in DES keys ($64$ stored, $56$ used):
(A) Extra security bits
(*B) Error-*detection* (ancient key-transmission hygiene!), discarded pre-schedule (PC-1 drops them — zero cryptographic role!). Stored $\ne$ strength, again (effective $56$ from the start!).
(C) Second key hidden
(D) S-box inputs
::: explanation
Hygiene-vs-strength split (parity detects typos, adds no work-factor!). Nominal-size literacy ($64$ labelled, $56$ working — count *working* bits!) recurs in 3DES ($168$/$112$) — count effective, always.
:::

::: quiz Q3: Foundational Concept
DES died of brute force, not math breaks, because:
(A) Math is perfect
(*B) $2^{56}$ crossed affordability (EFF '98 days → cloud pocket-change!) while best cryptanalysis needed impractical data ($2^{43}$+ chosen texts — data-hungry vs compute-cheap reality!). Economics, not theorems, retire ciphers (AES margin quoted as $2^{128}$-comfort!).
(C) Nobody tried math
(D) S-boxes proved optimal
::: explanation
Attack-menu economics (cheapest practical break wins!): brute force undercut analysis. Data-vs-compute cost split decides real-world mortality (impractical-data attacks are academic laurels!). Price-the-menu framing for cipher obituaries.
:::
