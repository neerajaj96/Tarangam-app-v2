# SQL Injection: Queries Gone Rogue

**Untrusted ink inside SQL — tautologies, unions, blind inference, and the parameterized cure.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Ventriloquist at the Teller
Login builds `SELECT * FROM users WHERE name='INPUT' AND pass='INPUT2'`. Typing `admin' --` makes *your ink* the teller's voice (comment eats the password check); `' OR '1'='1` turns the condition permanently true (every row qualifies — first row logs you in, often admin!). **UNION** grafts foreign tables (password hashes ride along); **blind** variants ask yes/no questions (page differences/timing) when output hides. Cure: **parameters** (ink quarantined as data, never parsed) + least-privilege DB users (stolen queries see little).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Injection ladder + fixes

* Tautology/auth-bypass → error-based (DB errors narrate schema) → UNION (column-count matching via ORDER BY probing, then exfiltration) → blind boolean/time-based (binary search per byte: `SUBSTRING` + `SLEEP` oracles).
* Fixes: parameterized/prepared statements (primary), ORM-safe usage (no raw concatenation!), least privilege (read-only where apt), WAF as belt-and-suspenders (never primary), error-message discipline.

::: callout-formula KTU Formula Vault: SQLi
Ink ≠ **query structure** · parameters **quarantine** · UNION needs **column-count match** · blind = **oracle binary-search**.
:::

::: callout-pitfall Escaping Is Not Parameterizing
Addslashes/blacklists chase dialects (encodings, comments, stacked queries slip through) — parameters separate *channels* (code vs data) structurally. Blacklist-vs-parameterization is the fix-hierarchy question: structure beats strings.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Login query as above (lab DVWA). (a) Bypass string? (b) Confirm column count for UNION with `ORDER BY`? (c) Harden (two code-level + one DB-level moves)?
:::

::: step [Step 2: Execution] Bypass, Count, Harden
1. User `admin' -- ` (trailing space for comment syntax): query becomes `... name='admin' -- ...` → password clause commented → logs in as admin (evidence: welcome-admin response).
2. `' ORDER BY 1--`, `2--`, … until error: error at $k$ ⇒ $k-1$ columns. Then `UNION SELECT` with matched arity (null-padded) to pull `user,password`-style columns.
3. Prepared statements with bound params (code), input validation allow-lists (code), DB user stripped to SELECT-only on needed tables (DB) + generic error pages.
:::

::: step [Step 3: Conclusion] Final Result
Bypass proves, ORDER-BY counts, UNION extracts, parameters cure. Ladder order (each rung needs the last) is the writeup spine — show every rung's evidence.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
`' OR '1'='1` logs in because:
(A) Password hashing broke
(*B) Injected tautology makes WHERE true for every row — query returns rows (first, often admin) regardless of supplied password; logic subverted, crypto untouched
(C) DB crashed open
(D) Usernames leaked
::: explanation
Authentication *logic* (`name=X AND pass=Y`) evaluates attacker-shaped: `... OR TRUE` short-circuits the password conjunct. Crypto never engaged — structure, not math, failed.
:::

::: quiz Q2: Foundational Concept
UNION extraction needs matching column counts because:
(A) DBAs like symmetry
(*B) UNION is set operation over same-arity tuples — arity mismatch errors (which attackers *use* via ORDER BY probing to discover counts first)
(C) Networks require it
(D) HTML tables need it
::: explanation
Errors-as-oracles: ORDER BY $k$ errors reveal arity $k-1$; then null-pad (`NULL,NULL,…`) to fit. Error discipline (generic pages) kills the oracle — fix lists it deliberately.
:::

::: quiz Q3: Foundational Concept
Why do parameters beat escaping?
(A) Faster queries
(*B) Channel separation: parameters travel outside the SQL text (never parsed as code) across *all* dialects/encodings; escaping patches strings per-dialect (bypassable via encoding tricks, second-order paths)
(C) Less code to write
(D) ORMs forbid escaping
::: explanation
Structural vs textual fixes: parameters remove the *class* (ink can't become code by construction); escaping plays whack-a-mole per context. Hierarchy quoted in every SQLi answer: parameters > allow-lists > escaping (last resort) > blacklists (never alone).
:::
