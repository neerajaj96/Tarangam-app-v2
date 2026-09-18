# M3 Drill: Ciphers at Exam Pace

**Feistel-to-RSA in one sitting — structure traces, mode placements, keygen sprints, protocol narrations.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Four-Station Sprint
Structure (Feistel/AES rounds!) → mode (placement!) → keygen sprint (gates+inverses!) → protocol narration (swap/verify/derive!). Sprint stations in syllabus order — M3's arc in miniature.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Sprint sheet

Feistel $L'=R$ · AES $4$-transforms+modes · stream uniqueness law · hybrid labour split · RSA gate-inverse-power-verify · DH swap-then-sign.

::: callout-formula KTU Formula Vault: Sprint
Structure → mode → keygen → protocol (gates between!).
:::

::: callout-exam KTU Exam Focus
M3's 9-markers stage DES/AES mechanics *or* RSA/DH numerics fully (toy-complete with verifications!) plus a comparison chaser (Feistel-vs-SPN, stream-vs-block, RSA-vs-DH purposes!). Toy-complete (all steps verified!) plus chaser is the shape.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"RSA sprint: $p=7,q=11$, $e=7$. (a) Valid? $d$? (b) Encrypt $m=5$? (c) Round-trip receipt line?"
:::

::: step [Step 2: Execution] Gate, Invert, Power, Receipt
1. $\phi=60$; $\gcd(7,60)=1$ ✓ valid.
2. $7d\equiv1\bmod60$: $7\times43=301=5(60)+1$ → $d=43$ (verify $301-300=1$ ✓!).
3. $c=5^7\bmod77$: $5^2=25$, $5^4=625\bmod77$: $77\times8=616$ → $9$; $5^7=5^4\cdot5^2\cdot5\equiv9\cdot25\cdot5=1125$; $77\times14=1078$ → $47$. $c=47$.
4. Receipt: $ed=301=5(60)+1$ ⇒ $m^{301}=(m^{60})^5\cdot m\equiv m$ (Euler, $\gcd(5,77)=1$ ✓!).
:::

::: step [Step 3: Conclusion] Final Result
Gate-inverse-power-receipt in four beats with verifications attached per beat. Sprint format (beats labelled!) trains exam pacing directly.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Cookie encryption: AES-CBC vs AES-GCM pick?
(A) CBC (classic!)
(*B) GCM (AEAD: confidentiality + authenticity jointly; CBC-alone malleable without MAC layering — padding-oracle lineage!; GCM's nonce discipline stated as price!)
(C) ECB (simple!)
(D) DES (heritage!)
::: explanation
Authenticity gap decides (CBC-without-MAC malleable!): GCM closes structurally. ECB/DES options test veto reflexes (pattern-leak/dead-cipher instant rejects!) — veto-first triage before comparing survivors.
:::

::: quiz Q2: Mixed Drill
Stream cipher, nonce reused once across two messages. Damage?
(A) None observable
(*B) Two-time-pad: $C_1\oplus C_2=P_1\oplus P_2$ (crib-draggable both ways!) — uniqueness-law violation, severity by plaintext guessability (known headers fatal!)
(C) Key recovery directly
(D) Only metadata leaks
::: explanation
XOR-cancellation arithmetic (keys vanish!) plus crib-drag mechanics (guessable bytes peel siblings!) quantify damage. Law-then-arithmetic-then-exploitability is the reuse-answer spine.
:::

::: quiz Q3: Mixed Drill
RSA ($e$ small) vs DH (ephemeral) for forward-secret chat:
(A) Either works identically
(*B) Ephemeral-DH (+signatures!): per-session randomness (past-safe!); static-RSA-transport reuses long-term key (compromise decrypts history!) — secrecy-horizon decides (past-protection demands ephemerality!)
(C) RSA always (simpler!)
(D) DH without signatures suffices (MITM feasts! — authentication mandatory!)
::: explanation
Horizon analysis (what does *later* compromise reveal?) picks mechanisms (ephemeral-transport + static-auth split!). (D)'s parenthetical veto (unauthenticated-DH MITM!) shows veto-reflexes firing inside comparisons.
:::
