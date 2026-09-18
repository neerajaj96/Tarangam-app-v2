# Wireshark: Capture, Display Filters & Analysis

**Reading the wire — capture setup, BPF vs display filters, follow-streams, and plaintext-password autopsies.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Wiretap Transcript Desk
**Capture filters** (BPF: `tcp port 80`) decide what the *tape records* (pre-filter, lean files, commitment!). **Display filters** (`http.request.method==POST`) decide what the *analyst sees* (post-filter, re-slice freely — non-destructive). **Follow TCP stream** reassembles one conversation (passwords pop out of POST bodies like diary entries). **Expert infos** flag retransmits/resets/anomalies (the machine's first-pass diagnosis). I/O graphs turn floods into *pictures* (spikes confess DoS/volume anomalies at a glance).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Filter grammars + analysis moves

* Capture (BPF): `host/net/port/src/dst`, qualifiers (`tcp`, `udp`, `icmp`); committed at record time (missed traffic gone forever — capture wide, filter late when unsure!).
* Display: fields + comparators (`==,!=,>,contains,matches`), boolean (`&&,||,!`), functions (`len()>…`); coloring rules triage visually.
* Moves: follow stream (TCP/HTTP/file carve via export objects), expert infos (warnings/errors/notes/chat), I/O + TCP-stream graphs (throughput/loss pictures), credential hunt (`http contains password`-style + form decoding), handshake/TLS inspection (versions/ciphers offered — downgrade spotting).

::: callout-formula KTU Formula Vault: Wiretap
Capture = **BPF, committed** · display = **re-sliceable** · follow **streams** · graph **volumes**.
:::

::: callout-pitfall Capture-Filter Regret (Gone Forever)
Over-narrow BPF (`tcp port 80` during a DNS-tunnel incident) records *nothing* of the incident — analysis can't conjure unrecorded packets. Default: capture wide (storage permitting), display narrow; narrow captures only with stated rationale + ring buffers as safety.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Lab capture (consented): find plaintext logins, chart a suspected burst, and rule on TLS health — filter strings + findings format each."
:::

::: step [Step 2: Execution] Hunt, Chart, Handshake (Lab Data)
1. `http.request.method==POST` → follow top streams → `user=…&pass=…` in clear (finding: credential exposure, severity high, fix: HTTPS+HSTS — M2 reunion!).
2. I/O graph $1$-s buckets: flat $50$ pps, $12{:}03$ spike $8$k pps UDP $53$ — burst shape (square onset = tool, not organic) → suspected flood/test traffic, correlate with tickets.
3. `tls.handshake` filter: ClientHello offers TLS $1.0$ (!) + weak ciphers — downgrade-risk finding (disable legacy, prefer $1.2+$) even where padlocks show.
:::

::: step [Step 3: Conclusion] Final Result
Filter-string + finding + severity + fix per hunt; graphs for volumes, streams for content, handshakes for crypto posture. Strings quoted verbatim (reproducibility) — filters are evidence citations.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Capture vs display filters differ fundamentally by:
(A) Syntax flavour only
(*B) Commitment: capture decides *recorded* (irreversible, lean), display decides *shown* (reversible, rich) — record wide when unsure, slice narrow when certain
(C) Speed of typing
(D) Color support
::: explanation
Irreversibility is the axis: unrecorded packets are unanalyzable forever. Storage-vs-regret economics set capture breadth; curiosity sets display depth — different decisions, different moments.
:::

::: quiz Q2: Foundational Concept
I/O graphs catch what packet lists hide:
(A) Passwords
(*B) Volume/shape anomalies (bursts, beacons, diurnal breaks) — human eyes miss rate-shapes across $10^5$ rows; pictures surface floods/exfil/C2 cadences instantly (then zoom to packets for proof)
(C) Payloads
(D) MAC addresses
::: explanation
Aggregation reveals behaviour (rates over time); packets prove instances. Graph-first (shape suspicion) then filter-down (packet proof) is the hunt workflow — pictures hypothesise, packets convict.
:::

::: quiz Q3: Foundational Concept
TLS $1.0$ offered in handshakes matters because:
(A) Nostalgia value
(*B) Downgrade/beast-class exposure + compliance failure (PCI forbids) — offered-weak = negotiable-weak vs active attackers; disable legacy, pin $1.2+$ minimums, watch handshake telemetry
(C) Handshakes are slow
(D) Certificates expire faster
::: explanation
Negotiation floors at the weakest *mutual* option — attackers force it there (downgrade dance). Offered-suites telemetry audits posture continuously — handshake watching is crypto hygiene, not trivia.
:::
