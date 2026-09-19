---
id: m1_04_format_string_vuln_drill
courseCode: PBCST604
module: 1
sequence: 4
title: Format Strings & Vuln-Class Drill
difficulty: beginner
estimatedMinutes: 3
learningObjectives:
  - Read with percent-x and write with percent-n primitives
  - Freeze format strings constant against untrusted text
  - Round up the module's vulnerability classes by shape
concepts:
  - format-string primitives
  - vulnerability classes
prerequisites:
  - m1_03_buffer_stack_overflow
examRelevance: medium
tags:
  - vulnerabilities
  - format-strings
---
# Format Strings & Vuln-Class Drill

**When your text becomes their code — `%x/%n` primitives, plus the module's vulnerability roundup.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Mad-Libs Receipt Printer
`printf(user_input)` hands strangers the *format string* (the Mad-Libs template with `%x` blanks): `%x` leaks stack words (peeking at others' receipts), `%n` *writes* the printed-count into an address you name (editing the ledger!). Fix: template stays yours (`printf("%s", input)`) — user ink never becomes instructions. Same disease as SQLi/XSS (M2 previews): untrusted text promoted to code.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Format primitives and vuln roll-call

* `%x/%p`: stack disclosure (canary/ASLR leaks fuel further exploits).
* `%n`: arbitrary write (count-so-far → chosen address: GOT overwrite classics).
* Vuln classes drill: overflow (spatial), format-string (interpretation), UAF/double-free (temporal), integer bugs (width/sign → mis-sized allocs), injection family (SQL/OS/LDAP/XSS — M2), race conditions (TOCTOU), defaults/creds.
* Discovery: source audit (dangerous APIs), fuzzing (coverage-guided), static analysers, patch-diffing.

::: callout-formula KTU Formula Vault: Format Bugs
`%x` **reads**, `%n` **writes** · fix: **format stays constant** · untrusted text ≠ **code, ever**.
:::

::: callout-pitfall `%n` Disabled Is Not a Fix
Modern hardening may neuter `%n` — but `%x` disclosure chains into ASLR/canary defeats enabling *other* bugs. Partial mitigation narrows, never closes, the class — fix the pattern (constant formats), not the specifier.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Logger does `printf(buf)` with user-controlled `buf`. (a) Show a leak probe + what it reveals. (b) Show the `%n` write shape (conceptual). (c) Fix + regression test sketch.
:::

::: step [Step 2: Execution] Peek, Poke, Patch
1. Input `%x.%x.%x.%x` → response prints stack words (canary bytes? libc pointers defeating ASLR? — note *which* words matter, not just leakage).
2. Crafted `%<N>c%<k>$n`-style (positional) writes byte-count $N$ to aimed address (GOT entry → shellcode/PLT pivot, classic flow).
3. Fix: `printf("%s", buf)` (or logging APIs with separate template/data channels); test: feed `%x/%n` battery, assert verbatim echo + no crash/hang.
:::

::: step [Step 3: Conclusion] Final Result
Leak-probe, write-shape, constant-format fix + adversarial regression battery. Channel-separation (template vs data) is the cross-family cure — cite SQLi/XSS kinship to show pattern mastery.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
`printf(user)` vs `printf("%s", user)` — the security difference:
(A) Speed
(*B) Who controls the *format string* (the program): attacker ink stays data in the second; first promotes ink to directives (`%x` leaks, `%n` writes)
(C) Buffer sizes
(D) Locale handling
::: explanation
Interpretation authority is the vulnerability: variadic `printf` trusts its format arg absolutely. Constant-format discipline (or type-safe logging) revokes attacker authority at the API boundary.
:::

::: quiz Q2: Foundational Concept
UAF (use-after-free) vs overflow — temporal vs spatial:
(A) Same bug renamed
(*B) Spatial: out-of-bounds *place* (wrong address); temporal: out-of-lifetime *time* (dangling pointer to freed/reused heap) — defences differ (bounds vs lifetime/heap hygiene like zeroing, safe allocators)
(C) UAF is milder always
(D) Overflows need heap
::: explanation
Place-vs-time taxonomy routes mitigations: bounds-checking/cookies vs quarantine/zero-on-free/type-safe reuse. Classify first (where vs when), then prescribe — taxonomy drives defence choice.
:::

::: quiz Q3: Foundational Concept
Coverage-guided fuzzing (AFL-style) beats blind random testing because:
(A) More CPU used
(*B) Instrumentation feedback (new edge ⇒ keep input, mutate further) steers generation toward unexplored code — evolutionary search vs lottery; corpus + sanitizers (ASan/UBSan) convert finds into reports
(C) It proves absence of bugs
(D) Dictionaries suffice alone
::: explanation
Feedback closes the loop: coverage novelty selects parents, mutations explore neighbours. Sanitizers make silent corruption *crash-loud* (detection), coverage makes search *directed* — loop + lens, the fuzzer's two halves (never a proof — absence unprovable).
:::
