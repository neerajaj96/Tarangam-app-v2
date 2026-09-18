# Symmetric Cipher Model

**Two parties, one secret — the model diagram plus what each arrow demands (and what it can't give).**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Shared Diary Lock
Alice and Bob share one diary key (**secret key**, pre-shared somehow — the model's *assumption*, its hardest problem!). Alice locks (**encrypt**: plaintext + key → ciphertext!), ships over hostile banshees (attackers read/copy!), Bob unlocks (**decrypt** — inverse with same key!). Opponent goals: read messages (confidentiality break!) or forge them (authenticity gap — symmetric alone *doesn't* authenticate! MACs/signatures later!). Key distribution (M4!) is the model's IOU — assumed here, solved there.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Five ingredients + two requirements + attack menu

* Ingredients: plaintext, encryption algorithm, secret key, ciphertext, decryption algorithm (Stallings' five! — draw with arrows!).
* Requirements: strong algorithm (even known-plaintext resistance!) + secret key (secure channel once! — bootstrapping paradox noted!).
* Attacks on model: ciphertext-only (weakest!), known-plaintext, chosen-plaintext/CPA (lunchtime+ adaptive!), chosen-ciphertext/CCA (padding oracles live here!), brute force (key-size economics!).

::: callout-formula KTU Formula Vault: Symmetric Model
Five **ingredients** · two **requirements** (strong algo + secret key!) · attacks **escalate by attacker power** · distribution **IOU→M4**.
:::

::: callout-pitfall Encryption ≠ Authentication (Model Gap!)
Ciphertext garbling goes *undetected* by bare decryption (malleability — bit-flips become predictable plaintext shifts in stream modes!) — authenticity needs MACs/signatures (M4!), never assumed from secrecy. Gap named per answer (encrypt-then-MAC doctrine previewed!).
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Draw the model for Alice→Bob salary slips (label five ingredients + opponent taps). Then: attacker knows one plaintext/ciphertext pair — attack class? What more would CPA grant?"
:::

::: step [Step 2: Execution] Diagram + Ladder
1. Plaintext (slip) → [Enc + K] → ciphertext → hostile wire (Eve reads/copies!) → [Dec + K] → slip; K via prior secure meeting (IOU flagged!).
2. Known-plaintext (crib-assisted analysis — WWII Bombe heritage!). CPA adds *chosen* inputs ( lunchtime: encrypt anything briefly!; adaptive: iterate on answers — strictly stronger, modern security *demands* CPA-resistance at least!).
:::

::: step [Step 3: Conclusion] Final Result
Five labels + taps drawn; attack ladder climbed (ciphertext→known→chosen→CCA!); IOU flagged (distribution→M4). Ladder position per scenario is the analysis reflex.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Ciphertext-only vs known-plaintext vs chosen-plaintext order by power:
(A) Equal strength models
(*B) Ciphertext-only ⊂ known ⊂ chosen (each grants strictly more: bare intercepts → cribs → encryption oracle access!) — modern schemes must survive *adaptive* CPA minimum (CCA for active attackers!)
(C) Reverse order
(D) Only brute force matters
::: explanation
Attacker-capability ladder (what's handed over!) grades scheme claims (CPA-secure ⊃ known-secure ⊃ ciphertext-secure — nested guarantees!). Claim-scope matching (proved-against-what?) is the evaluation literacy.
:::

::: quiz Q2: Foundational Concept
The model's bootstrapping paradox (needing a secure channel to make one):
(A) Unsolvable, give up
(*B) Solved *outside* the model (couriers/face-meetings/PKI-key-exchange/DH — M3/M4 machinery!): symmetric model *assumes* shared key, distribution infrastructure *delivers* it (assumption documented, not hand-waved!)
(C) Keys travel plaintext
(D) Paradox is mythical
::: explanation
Assumption-vs-infrastructure split (model needs it; PKI/DH builds it!) — honest layering (each layer's IOUs named!). Bootstrapping named as *the* symmetric problem (vs asymmetric's compute costs!) balances the families.
:::

::: quiz Q3: Foundational Concept
Brute-force economics vs $56$-bit DES keys (M3 preview!):
(A) Impossible forever
(*B) $2^{56}\approx7\times10^{16}$ tries (1998 EFF cracker: days!; today: hours/cloud-loose-change!) — key-size arithmetic ($2^k$ work, Moore halving!) sets floor debates (112/128-bit modern minimums!)
(C) Instant always
(D) Key size irrelevant
::: explanation
Work-factor math ($2^k$ tries, parallelisable embarrassingly!) plus Moore projections prices key lengths (56→dead, 128→safe-ish margin!). Economics, not absolutes, retire key sizes — arithmetic quoted per verdict.
:::
