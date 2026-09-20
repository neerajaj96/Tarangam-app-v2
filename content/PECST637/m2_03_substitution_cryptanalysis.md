---
id: m2_03_substitution_cryptanalysis
courseCode: PECST637
module: 2
sequence: 3
title: Substitution Techniques & Cryptanalysis
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Run Caesar, monoalphabetic, Playfair and Vigenere by hand
  - Break monoalphabets with frequency and periods with leaks
  - State one-time-pad perfection terms exactly
concepts:
  - substitution ciphers
  - frequency analysis
  - one-time pad
prerequisites:
  - m2_02_symmetric_model
examRelevance: high
tags:
  - classical-ciphers
  - cryptanalysis
---
# Substitution Techniques & Cryptanalysis

**Letter swaps from Caesar to Vigenère — ciphers, keyspaces, and frequency cheerfully breaking them.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Costume Alphabets
**Caesar** shifts every letter by $3$ (25 possible costumes — try all by teatime!). **Monoalphabetic** permutes freely ($26!$ costumes — huge closet, same *face*: letter frequencies survive! E ≈ $13\%$ English betrays!). **Playfair** pairs letters in $5\times5$ squares (digram rules: row/column/rectangle!). **Vigenère** cycles keyword shifts (polyalphabetic — flattens single-letter stats, but *repeating* key leaks period via Kasiski/friedman — autokey tries to heal by eating plaintext!). **Vernam/OTP** with truly-random never-reused key as long as message = *unbreakable* (Shannon!) — and utterly impractical (key-distribution paradox squared!).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Cipher specs + breaks + OTP terms

* Caesar $C\equiv P+3$ (brute $25$!); mono $C=\pi(P)$ ($26!$ keys, frequency/crib breaks!); Playfair digram geometry; Hill matrix cipher (linear algebra + inverse-mod-$26$ requirement — M1 inverses return!); Vigenère $C_i=P_i+K_{i\bmod m}$ (Kasiski repeats → period → Caesar-columns!); transposition next topic (permutation, not substitution!).
* OTP: $C=P\oplus K$, random $K$, use-once ($|K|=|M|$!) ⇒ perfect secrecy (only unbreakable, key-size = message-size price!).

::: callout-formula KTU Formula Vault: Classical Map
Caesar **shift-3/25** · mono **permute ($26!$, freq-broken!)** · Playfair **digram-square** · Vigenère **keyword-cycle (period leaks!)** · OTP **random+once+as-long = perfect**.
:::

::: callout-pitfall Keyspace Size ≠ Security (Monoalphabetic Lesson!)
$26!$ keys *feels* vast yet frequency + cribs dissolve it (structure leaks past key-count!). Security lives in *statistical flatness*, not key tallies — keyspace-alone arguments fail grading (cite the break, not the factorial!).
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) Caesar-shift-3 `ATTACK`? Decrypt `DWWDFN`? (b) Vigenère key `LEMON`, plaintext `ATTACKATDAWN` (first $6$)? (c) Break plan for monoalphabetic intercept (steps!)?
:::

::: step [Step 2: Execution] Shifts, Cycles, Frequencies
1. (a) `DWWDFN`; reverse: `ATTACK` (shift arithmetic both ways, mod $26$!).
2. (b) Key stream `LEMONL` = $11,4,12,14,13,11$; plaintext $0,19,19,0,2,10$: sums mod $26$ = $11,23,5,14,15,21$ → `LXFOPV` (textbook vector — cross-check memorised pairs like this to catch modular slips!).
3. (c) Tally frequencies (E/T/A/O leaders!) → cribs (the/and!) → digram patterns (th/he!) → fill → verify English (frequency-first pipeline!).
:::

::: step [Step 3: Conclusion] Final Result
Shift tables, keyword cycling (repeat key to length first!), frequency pipeline. Known-answer cross-checks (LXFOPV...!) catch modular slips — verify against memorised vectors.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
Caesar $k=5$ encrypt `HELLO`?
(A) `HELLO` (unshifted!)
(*B) $H{=}7+5=12{=}M$, $E{=}4+5=9{=}J$, $L{=}11+5=16{=}Q$, $L\to Q$, $O{=}14+5=19{=}T$ → `MJQQT`
(C) `JGNNQ` ($k=2$ residue!)
(D) `MJQQU` (last-letter slip!)
::: explanation
Shift-each mod $26$ with letter-math shown per letter. Working shown outscores bare answers (method marks need visible arithmetic!) — and near-miss options ($k=2$, off-by-one tail) punish blind guessing.
:::

::: quiz Q2: Foundational Concept
Kasiski examination finds Vigenère period via:
(A) Frequency tables directly
(*B) Repeated ciphertext chunks $\approx$ key-length apart (same plaintext + same key-phase alignment!) — distances' gcd votes the period (then Caesar-per-column!)
(C) Brute-forcing keys
(D) Guessing keywords
::: explanation
Repeat-distance gcd logic (alignments repeat every key-length!) turns repetition into measurement. Period-first (Kasiski/Friedman IC!) then per-column Caesar — two-stage pipeline ordered strictly.
:::

::: quiz Q3: Foundational Concept
OTP's impracticality despite perfect secrecy:
(A) Weak math
(*B) Key = message-length truly-random never-reused bits *securely shared in advance* (distribution paradox: secure channel for key $\approx$ channel for message!; reuse/leakage catastrophes — two-time-pad breaks xor-recoverably!)
(C) Slow encryption
(D) Large ciphertexts (same size — fine!)
::: explanation
Key-management cost (generate/share/store/destroy message-sized secrets!) dwarfs message value usually (exceptions: hotlines/spies with couriers!). Price-of-perfection analysis (when worth it?) completes OTP answers.
:::
