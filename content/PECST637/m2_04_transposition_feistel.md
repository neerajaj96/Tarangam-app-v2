# Transposition & Block Structure (Feistel)

**Scrambling positions, not letters — rail/order ciphers, then the Feistel shape modern blocks inherit.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Anagram Mail
**Transposition** writes the message into grids/rails and reads out by another route (same letters, shuffled addresses — frequency profiles *survive intact*!). **Rail fence** zigzags rows; **columnar** permutes numbered columns (key = column order, cribs anchor!). **Feistel** (DES ancestor!) splits blocks, stirs half through a keyed mixer $F$, XORs onto the other, swaps — repeat $16\times$ (confusion *and* diffusion accumulate round by round!; decryption = same machine backwards!).
:::

::: anim feistel-round Split, Stir, Swap
Right half dives through F with the key, XORs onto the left, halves trade places — decryption just rewinds the rounds.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Transposition mechanics + Feistel equations

* Rail fence (depth $d$, zigzag period $2d-2$!); columnar (write rows, read key-ordered columns; double transposition squares the trouble!).
* Feistel round: $L_{i+1}=R_i$, $R_{i+1}=L_i\oplus F(R_i,K_i)$; decrypt: same with reversed subkeys ($F$ needn't invert — structure inverts *around* it!).
* Confusion (key↔ciphertext complexity!) vs diffusion (plaintext spread! — Shannon twins driving all modern design!).

::: callout-formula KTU Formula Vault: Shuffle + Feistel
Transposition **permutes positions** · Feistel **$L'=R$, $R'=L\oplus F(R,K)$** · $F$ **needn't invert** · Shannon twins **confusion+diffusion**.
:::

::: callout-pitfall Transposition Preserves Frequencies Perfectly
Letter counts *identical* (only order moved!) — frequency analysis *confirms* transposition (flat-vs-English profiles match!) then anagram/crib techniques attack positions. Profile-match first (substitution-vs-transposition triage!) before method choice.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) Rail fence depth $3$ on `WEAREDISCOVERED`? (b) Columnar key $4$-$3$-$1$-$2$-$5$ on `ATTACKPOSTPONEDUNTIL` (pad Xs)? (c) One Feistel round forward+back on nibbles ($L=1010,R=0110$, $F\to1100$, toy!)?
:::

::: step [Step 2: Execution] Zigzag, Permute, Stir
1. (a) `WEAREDISCOVERED` has $15$ letters (index $0$–$14$); depth $3$ zigzag period $4$ (rows $0,1,2,1,\ldots$): row 0 ← indices $\{0,4,8,12\}$ = W,E,C,R → `WECR`; row 1 ← $\{1,3,5,7,9,11,13\}$ = E,R,D,S,O,E,E → `ERDSOEE`; row 2 ← $\{2,6,10,14\}$ = A,I,V,D → `AIVD`. Cipher `WECRERDSOEEAIVD`.
2. (b) $5$ columns, $18$ letters → $4$ rows ($20$ cells, pad `XX`): read columns $4,3,1,2,5$-ordered per key digits ($1$-first!): assemble row-wise grid then column-read (mechanical, show grid!).
3. (c) $L'=0110$, $R'=1010\oplus1100=0110$; decrypt: same $F$, reversed order restores (structure-inversion demo!).
:::

::: step [Step 3: Conclusion] Final Result
Zigzag-index sets, column-order reads, stir-and-swap round-trip. Index-set listing (which positions per row!) is the rail-fence evidence format.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Transposition-vs-substitution triage by frequency profile:
(A) Profiles differ always
(*B) Identical counts ⇒ transposition family (order moved, letters kept!); flattened/skewed ⇒ substitution family (letters remapped!) — profile-match routes methods (anagram/crib vs frequency/crib!)
(C) Profiles useless
(D) Always both applied
::: explanation
Conservation diagnostic (letter multiset preserved?) splits classical families in one tally. Triage-before-technique (profile first!) saves misapplied pipelines — measurement routes method.
:::

::: quiz Q2: Foundational Concept
Feistel decryption needs no $F^{-1}$ because:
(A) $F$ is always invertible
(*B) Structure inverts *around* $F$ (XOR-then-swap undone by swap-then-XOR with reversed subkeys — $F$ runs *forward* both ways!; round function arbitrary, even non-injective!)
(C) Keys reverse $F$
(D) Rounds cancel out
::: explanation
XOR self-inverse + swap symmetric = structural inversion independent of $F$'s own invertibility (DES's $F$ isn't invertible — by design freedom!). Structure-over-primitive moral (clever scaffolding beats strong parts!).
:::

::: quiz Q3: Foundational Concept
Double columnar transposition squares attacker trouble by:
(A) Doubling key length only
(*B) Composing permutations (product cipher embryo! — cribs must survive *two* shuffles; anagram search squares!) — composition principle preview (product > sum of parts, Shannon's other twin-team!)
(C) Doubling alphabet
(D) Nothing measurable
::: explanation
Composition (shuffle∘shuffle with independent keys!) prefigures product ciphers (DES rounds as iterated composition!). Composition-beats-length moral (two short keys > one long, structurally!) recurs in Feistel rounds.
:::
