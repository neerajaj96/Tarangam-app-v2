# Buffer & Stack Overflows

**Writing past the end — stack anatomy, smashing the return address, and the mitigations that bite back.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Hotel Register Prank
A hotel form has $8$ boxes for your name; you write $200$ letters — ink spills into *room number* and *checkout date* fields below. On the stack, locals sit above the saved frame pointer and **return address**: overflow the buffer and you rewrite where the function *returns to* — point it at your ink (shellcode) and the program "returns" into your orders. Mitigations: smaller pens (bounds checks), canary birds between fields (stack cookies die squawking), shuffled hotel floors (ASLR), non-ink paper (non-executable stacks).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Vulnerable pattern and exploit shape

`strcpy/gets/sprintf` into fixed stack buffers (no length check) → overwrite saved EBP → overwrite RET with shellcode address → sled (NOPs) absorbs aim error. Payload anatomy: [padding][RET→shellcode][NOP sled][shellcode (execve /bin/sh class)].

### 2.2 Mitigation stack (defense in depth)

Safe APIs/bounds (`strncpy`, FORTIFY) · canaries (`-fstack-protector`: secret checked pre-return) · ASLR (randomised bases) · DEP/NX (stack non-executable ⇒ ret2libc/ROP answers) ·RELRO/PIE · fuzzing to *find* (AFL-style) before attackers do.

::: callout-formula KTU Formula Vault: Overflow
Spill **buffer→EBP→RET** · payload **pad+RET+sled+shell** · defenses: **checks/canary/ASLR/NX**.
:::

::: callout-pitfall One Mitigation ≠ Immunity
Canaries fall to leaks/brute-force (forking servers!), ASLR to info-leaks/partial overwrites, NX to ROP (code reuse needs no injection). Bypass-chains (leak + ROP) are the modern norm — defense-in-depth assumed, single walls never trusted.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
`char buf[64]; strcpy(buf, argv[1]);` (x86, no protections lab build). (a) Minimum input to touch RET? (b) Payload layout to pop a shell? (c) Which single mitigation breaks this exact attempt?
:::

::: step [Step 2: Execution] Measure, Aim, Break
1. $64$ (fill) $+ 4$ (saved EBP) $= 68$ bytes to reach RET; bytes $68$–$71$ overwrite it.
2. `[68×'A'][RET = sled addr][NOP×32][shellcode]` — sled tolerates address guess wobble; RET points mid-sled.
3. Any one of: canary (rewrite detected pre-return → abort), ASLR (sled address unguessable), NX (sled unexecutable → segfault instead of shell). Lab toggles each to feel the break.
:::

::: step [Step 3: Conclusion] Final Result
Offset math, payload anatomy, mitigation-break mapping — the overflow answer triple. Offsets measured (pattern tools), never guessed, in writeups.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
NOP sled's job in the payload:
(A) Exploit the CPU bug
(*B) Absorb return-address imprecision — landing anywhere in the sled slides into shellcode, widening a 1-byte-exact jump into a 32+-byte target
(C) Hide from antivirus
(D) Pad to MTU size
::: explanation
Guessed stack addresses wobble (env sizes, ASLR jitter); sleds convert exact-aim into zone-aim. Reliability engineering for exploits — success probability per attempt climbs with sled length (to page limits).
:::

::: quiz Q2: Foundational Concept
Stack canary defeated by (lab-sanctioned concept):
(A) Longer sleds
(*B) Leaking/reading the canary (format-string read, brute-force per-byte on forking daemons that don't re-randomise) then re-emitting it intact in the payload — secrecy, not strength, guards it
(C) Bigger buffers
(D) Faster CPUs
::: explanation
Canaries authenticate stack integrity with a *secret*; exposed secrets verify fine. Fork-without-reexec reuses one canary across attempts (byte-by-byte brute force) — randomness lifecycle matters as much as presence.
:::

::: quiz Q3: Foundational Concept
NX/DEP pushes attackers toward ROP because:
(A) ROP disables NX
(*B) Injected code can't execute, but *existing* executable gadgets can chain (returns into libc/system routines with stacked args) — reuse beats injection under non-executable stacks
(C) Shellcode runs faster
(D) Canaries vanish
::: explanation
W⊕X (write-xor-execute) kills code *injection*; return-oriented programming reuses resident code *sequences* ending in ret. Mitigation-escalation ladder: inject → reuse → blind/info-leak-assisted — each wall reroutes, none ends, the arms-race moral.
:::
