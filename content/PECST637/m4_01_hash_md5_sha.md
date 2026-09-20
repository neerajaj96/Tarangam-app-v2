---
id: m4_01_hash_md5_sha
courseCode: PECST637
module: 4
sequence: 1
title: 'Hash Functions: Uses, MD5 & SHA'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Grade preimage against birthday-halved collision resistance
  - Apply hashes across fingerprinting uses exactly
  - Retire MD5 and SHA-1 onto the SHA-2 workhorse
concepts:
  - hash resistance grades
  - birthday bound
  - SHA family
prerequisites: []
examRelevance: high
tags:
  - hashing
  - sha
---
# Hash Functions: Uses, MD5 & SHA

**Fingerprinting data — preimage/collision resistance grades, applications, and why MD5 fell.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Meat Grinder with Manners
**Hash** grinds any-size meat into fixed-size mince ($256$-bit digest!) — one-way (mince→cow impossible: preimage resistance!), distinctive (twin cows never mince alike: collision resistance!), avalanche-seasoned (speck change, total mince change!). **Uses**: password vaults (salted hashes, never plaintext!), integrity seals (download digests!), commitments, blockchain links, PRNG stretching. **MD5** ($128$-bit!) fell to engineered collisions (2004+: identical-prefix engines mass-produce twins!) — legacy-HMAC niches aside, retired from security duty.
:::

::: anim hash-chain Tamper Anywhere, Glow Everywhere
Each block cradles the last digest — edit early history and every downstream fingerprint screams.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Resistance grades + MD5/SHA anatomy

* Preimage ($2^n$), second-preimage ($2^n$), collision ($2^{n/2}$ birthday bound! — grade by use: passwords need preimage+, signatures need collision!).
* MD5: Merkle–Damgård ($512$-bit blocks, $4\times16$ op rounds, $128$-bit state!) — collision-broken (chosen-prefix engines!), preimage limping (use retired!).
* SHA-1: similar fate ($160$-bit, SHAttered $2^{63}$-ish practical!) → SHA-2 family ($224$–$512$, same skeleton, wider margins!) → SHA-3 (sponge, next topic!).

::: callout-formula KTU Formula Vault: Hash Grades
Preimage **$2^n$** · collision **$2^{n/2}$ (birthday!)** · MD5/SHA-1 **retired** · SHA-2 **current workhorse**.
:::

::: callout-pitfall Pass-the-Hash Confusion (Password Storage!)
Unsalted fast hashes (MD5/SHA-256-*raw*!) fall to rainbow tables (precomputed chains!) + GPU brute force — passwords need *slow salted* KDFs (bcrypt/scrypt/Argon2: salt-per-user + work factor!) — hash-choice ≠ password-storage-choice (layered answer!).
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"128-bit hash: (a) collision effort by birthday bound? (b) Meaning for certificates? (c) Password upgrade path from raw-MD5 store (no plaintext known!)?"
:::

::: step [Step 2: Execution] Bounds, Impact, Migration
1. (a) $\approx2^{64}$ operations (birthday square-root!) — feasible-ish for nations then clouds (MD5's death certificate math!).
2. (b) Colliding certs (same signature, different identities — chosen-prefix engines weaponised this historically!) — trust-anchor betrayal class.
3. (c) Opportunistic rehash (verify-against-MD5 on login → immediately bcrypt+salt, retire legacy field after grace sweep!) — migration *without* knowing passwords (transitional verification!).
:::

::: step [Step 3: Conclusion] Final Result
Bound-arithmetic, impact-class, migration-without-plaintext — hash answers span math, blast radius, and logistics. Logistics (how to upgrade the living!) is the senior third.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Birthday bound halves effective collision bits because:
(A) Hashes are weak by half
(*B) Pairwise comparisons grow quadratically ($\approx\sqrt N$ samples collide among $N$ slots — pigeonhole statistics!) — $n$-bit digests need $2^{n/2}$ trials, not $2^n$ (preimage stays $2^n$ — per-target vs any-pair split!)
(C) Implementations halve output
(D) Moore's law adjustment
::: explanation
Any-pair (collision!) vs fixed-target (preimage!) search spaces differ by square root (birthday paradox math!). $128$-bit ⇒ $64$-bit collision comfort (retire!) while preimage holds ($128$!) — grade-per-use split decisions.
:::

::: quiz Q2: Foundational Concept
Salt per password defeats rainbow tables by:
(A) Encrypting hashes
(*B) Personalising the hash function per user (same password ⇒ different digests — precomputation can't amortise across users!; attacker pays per-salt full price!) — uniqueness, not secrecy (salts stored plaintext, fine!)
(C) Slowing logins hugely
(D) Hiding usernames
::: explanation
Amortisation-killing (precompute once, crack all → crack each singly!) — salt economics, plus slowness economics (KDF work factors!) layered. Two-axis password economics (unique + slow!) is the complete prescription.
:::

::: quiz Q3: Foundational Concept
Merkle–Damgård length-extension (SHA-256($key\|m$) MACs broken!) works because:
(A) Keys leak directly
(*B) Output *is* the internal state (continue hashing appended data sans key — forge $H(key\|m\|pad\|extra)$ from $H(key\|m)$ alone!) — state-exposure flaw (HMAC's nested construction exists precisely to kill it!)
(C) Collisions found first
(D) Keys too short
::: explanation
State-equals-output designs extend (length-extension property!) — naive keyed hashes forgeable without keys. HMAC (double-hash nesting!) as the structural fix — flaw-then-construction pairing.
:::
