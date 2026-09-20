---
id: m2_05_m2_mixed_drill
courseCode: PECST637
module: 2
sequence: 5
title: 'M2 Drill: Classical Cipher Triage'
difficulty: intermediate
estimatedMinutes: 3
learningObjectives:
  - Profile cipher families from ciphertext symptoms
  - Decrypt with period and inverse checks in order
  - Sprint Hill-matrix cameos without derailing
concepts:
  - cipher triage
  - family verdicts
prerequisites:
  - m2_02_symmetric_model
  - m2_03_substitution_cryptanalysis
  - m2_04_transposition_feistel
examRelevance: high
tags:
  - classical-ciphers
  - m2-drill
---
# M2 Drill: Classical Cipher Triage

**Profile, decrypt, cycle — family verdicts plus Hill-matrix cameo at exam pace.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Three-Gate Sprint
Gate 1 (profile!): counts match → transposition; skewed → substitution. Gate 2 (decrypt the given!). Gate 3 (period math for Vigenère/Hill-inverse check!). Sprint gates in order — triage before techniques, always.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Sprint kit + Hill cipher note

Profile-triage · Caesar/Vigenère arithmetic · rail/columnar mechanics · Feistel round-trip · **Hill**: $C=KP\bmod26$ (decrypt needs $K^{-1}\bmod26$ — determinant coprime to $26$! M1 inverses strike again!).

::: callout-formula KTU Formula Vault: Sprint
Profile → decrypt → period/inverse-check.
:::

::: callout-exam KTU Exam Focus
M2's 9-markers encrypt/decrypt fully (named ciphers!) plus one cryptanalysis reasoning (frequency/Kasiski/profile-triage!). Shown arithmetic per letter plus triage line per intercept — method *and* judgment graded.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Intercept `WECRERDSOEEAIVD` with English-like counts: (a) family? (b)Rail depth-$3$ decipher sketch? (c) Hill key $\begin{pmatrix}3&3\\2&5\end{pmatrix}$ invertible mod $26$?"
:::

::: step [Step 2: Execution] Triage, Unzigzag, Determinant
1. (a) Counts English-plausible *and* the string is our M2.4 rail output — transposition family (profile conserved!).
2. (b) Length $15$, depth $3$: row lengths $4,7,4$ (period-$4$ split!) → refill rows → zigzag-read columns → `WEAREDISCOVERED` (reverse mechanics!).
3. (c) $\det = 15-6 = 9$; $\gcd(9,26)=1$ ✓ invertible (M1 gate!) — Hill usable; else key rejected (determinant-shares-factor = dead key!).
:::

::: step [Step 3: Conclusion] Final Result
Profile-verdict, reverse-mechanics, determinant-gate — triage-to-algebra pipeline. Determinant-coprimality (M1 reunion!) closes classical crypto's loop neatly.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Vigenère key length $4$, ciphertext `EFGH…`. First step?
(A) Frequency-tally whole text
(*B) Split into $4$ Caesar columns (positions $\bmod4$!) — period-first (Kasiski-confirmed!), then per-column frequency (each column monoalphabetic!).
(C) Brute-force $26^4$ keys
(D) Hill-decrypt it
::: explanation
Period structures everything downstream (columns = Caesar instances!). Kasiski-then-split-then-frequency is the ordered pipeline — stage-skipping (whole-text stats on polyalphabetic!) misleads.
:::

::: quiz Q2: Mixed Drill
Hill $2\times2$ key determinant $13$ mod $26$. Verdict?
(A) Fine, odd number
(*B) Dead key: $\gcd(13,26)=13\ne1$ (no inverse — decryption impossible!; even/13-sharing determinants all die mod $26$!)
(C) Double it
(D) Transpose fixes it (transpose keeps determinant — same death!)
::: explanation
Invertibility gate ($\gcd(\det,26)=1$!) pre-screens Hill keys (M1 inverses, third reunion!). Transpose-doesn't-change-det is the linear-algebra footnote blocking the dodge.
:::

::: quiz Q3: Mixed Drill
`DWWDFN` with Caesar context unknown shift. Fastest read?
(A) Try all $25$ (fine but slow!)
(*B) Frequency-anchor ($W$ repeats? positions of doubles!) + cribs, or brute $25$ mechanically — $25$ tries is *cheap* (Caesar's whole weakness!); method-choice by keyspace size (tiny ⇒ brute acceptable, even elegant!)
(C) Kasiski it (needs repeats+length — overkill!)
(D) Give up
::: explanation
Keyspace-size honesty ($25$ = trivial!) licenses brute force *as the smart play* (elegance = matching method to scale!). Scale-matched methods (brute-tiny, stats-medium, math-big!) is the meta-lesson.
:::
