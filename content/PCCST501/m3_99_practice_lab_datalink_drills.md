---
id: m3_99_practice_lab_datalink_drills
courseCode: PCCST501
module: 3
sequence: 99
title: 'Module 3 Practice Lab: Data-Link Drills'
difficulty: intermediate
estimatedMinutes: 40
learningObjectives:
  - Explain why frames need boundaries and apply bit stuffing and destuffing step by step.
  - Compute and check parity, 2D parity, Internet checksum, and CRC, including what each method can and cannot detect.
  - Work out ALOHA throughput and Ethernet minimum frame size from first principles.
  - Choose an appropriate medium-access method for a scenario and justify the choice.
  - Trace an ARP exchange and switch learning table, and diagnose LAN problems in the correct order.
concepts:
  - framing and bit stuffing
  - parity
  - 2D parity
  - Internet checksum
  - CRC
  - ALOHA
  - carrier sensing
  - MAC address
  - ARP
  - switch learning
prerequisites:
  - m3_01_datalink_layer_services_and_framing
  - m3_02_error_detection_crc_checksums_parity
  - m3_03_multiple_access_protocols
  - m3_04_lan_addressing_arp_switches_and_vlans
examRelevance: high
tags:
  - datalink-layer
  - m3-lab
---
# Module 3 Practice Lab: Data-Link Drills

**A teaching lab for the data-link layer: frame boundaries by hand, error-detection arithmetic with every intermediate value, medium-access reasoning from network conditions, ARP and switch traces, and ordered LAN diagnosis — each solvable from the reasoning taught here.**

<a id="purpose"></a>
## 1. Lab Purpose

This lab covers the five hands-on skills of Module 3: (1) framing data with bit stuffing and recovering it by destuffing; (2) detecting errors with parity, 2D parity, Internet checksum, and Cyclic Redundancy Check (CRC); (3) pricing shared-medium access with ALOHA mathematics and choosing access methods by scenario; (4) tracing Address Resolution Protocol (ARP) exchanges and switch learning tables; (5) diagnosing Local Area Network (LAN) faults in the correct order.

These concepts matter because every frame on every link is delimited, checked, and forwarded by exactly these mechanisms — exams test them as calculations and traces. After completion you will be able to: delimit payloads with flags and stuffing; compute all four error checks by hand; derive ALOHA throughput and Ethernet frame size from first principles; justify access-method choices; trace ARP and switch tables; and walk LAN faults down the diagnostic ladder.

<a id="bridge"></a>
## 2. Quick Prerequisite Bridge

You need only these ideas from the four prerequisite notes — refreshed here so you never leave the page:

- **Frame:** one data-link packet (headers + payload + trailer) travelling one hop. **Flag:** reserved pattern (here `01111110`) marking frame start/end.
- **Parity bit:** extra bit keeping word 1-count even (even) or odd (odd parity). **Checksum:** sum-based packet value, recomputed by the receiver. **CRC:** modulo-2 division remainder by an agreed generator, appended then rechecked.
- **Collision:** overlapping transmissions garbling each other on a shared medium. **Carrier sensing:** listening before talking. **MAC address:** permanent interface hardware address (e.g. `AA-AA-AA-AA-AA-AA`), used on one LAN; **IP address** (e.g. `192.168.1.10`) names hosts across networks. ARP maps IP→MAC per LAN; routing moves packets between LANs.
- **Switch vs hub:** a hub repeats every frame out of every port; a switch learns MAC→port mappings and forwards selectively, flooding only unknown/broadcast destinations.

<a id="framing"></a>
## 3. Framing + Bit Stuffing, Step by Step

**What.** A frame is the data-link unit on one hop. **Why boundaries matter.** The receiver sees one continuous bit stream; without marked start and end it cannot tell where one frame stops and the next begins. **How.** Protocols reserve a special flag pattern — here `01111110` — placed before the first payload bit and after the last. **The problem this creates.** Payloads are arbitrary bits and may *contain* the flag pattern, which would fake a boundary. **The solution.** Bit stuffing: the sender inserts an extra `0` after every run of five consecutive `1`s in the payload; the receiver, after seeing five consecutive `1`s, drops the following bit (which must be `0` unless the pattern is a real flag).

**Exact rule.** Scan payload left to right, counting consecutive `1`s. After the fifth consecutive `1`, output an extra `0` and reset the count. Destuffing mirrors it: after five consecutive `1`s, discard the next bit. A real flag (`01111110` = six 1s plus framing 0s) is never produced inside stuffed payload because the sixth 1 can never appear there.

**Complete worked example.** Flag `01111110`. Payload (17 bits): `0 1 1 0 1 1 1 1 1 1 0 1 1 1 1 1 0`, i.e. `01101111110111110`.

- Run 1: six `1`s (positions 5–10). After the first five, insert `0`; the sixth `1` restarts the count, then a payload `0` ends the run.
- Run 2: five `1`s (positions 12–16). Insert `0` after them; the payload's final `0` follows.
- Stuffed payload (19 bits): `0110 11111 0 1 0 11111 0 0` = `0110111110101111100` (17 + 2 stuffed).
- Frame: `01111110` + `0110111110101111100` + `01111110`.
- Destuffing: after each five-`1` run drop the `0`; recovered `01101111110111110` — identical. **Result:** two inserted bits, zero ambiguity. **Interpretation:** the flag pattern then occurs only at true boundaries — framing stays self-synchronizing.

::: toggle Exam trap: stuffing the flag itself
Never scan the flags you add — stuffing applies to the payload only. A common error is re-scanning the whole transmitted frame (flags included) and "finding" runs inside `01111110`. Stuff once, on payload bits, before adding flags.
:::

<a id="error-detection"></a>
## 4. Error Detection Drills

No method here detects *every* possible error — each section ends with what escapes it.

### 4.1 Parity

**What/Why/How.** One redundant bit per word catches odd-count flips: even parity keeps word 1-count even (odd count → even bit `1`). Receiver: odd total ⇒ error.

**Numerical example.** Data `1011001` (four 1s) → even-parity bit `0`, transmit `10110010` (odd parity would use `1`). Received `1011011` + `0` has five 1s → error flagged. Two flips keep parity → silent. **Interpretation:** all odd-count errors caught (incl. every single-bit error); all even-count errors escape.

### 4.2 2D Parity

**What/Why.** One-dimensional parity is blind to even-count patterns: arrange data in rows + columns, guard both — a single error then fails exactly one row and one column check, locating it. **How.** For an $r \times c$ block (even parity): one parity bit per row, one per column, plus overall parity of all parity bits.

**Complete matrix example.** Data (4 rows × 4 columns):

```text
row 1:  1 0 1 1   (three 1s → row parity 1)
row 2:  0 1 0 1   (two 1s → row parity 0)
row 3:  1 1 0 0   (two 1s → row parity 0)
row 4:  0 0 1 1   (two 1s → row parity 0)
col parity: 0 0 0 1   (column 1s: 2,2,2,3 → parities 0,0,0,1)
overall parity: data 1s (3+2+2+2 = 9) + row parities (1) + column parities (1) = 11, odd → overall bit 1
```

**Detection trace.** Flip cell (2,3) (`0` → `1`): row 2 holds three 1s vs parity `0` → fails; column 3 holds three 1s vs `0` → fails; rest pass. Failing row × failing column = cell (2,3). **Limitation (trace it).** Flip rectangle corners (1,1), (1,2), (2,1), (2,2): every involved row/column gains two flips (parity preserved), overall gains four (preserved) → all checks pass silently. **Interpretation:** single errors locate exactly; even-per-row-and-column patterns defeat counting.

### 4.3 Internet Checksum

**What/Why.** Packets need a cheap whole-header check; the Internet checksum sums fixed-width words with end-around carry. **How.** Sender: add all words with one's-complement addition (carry wraps back), complement the sum; transmit as checksum. Receiver: add all words *including* checksum the same way; correct packets yield all-ones, complementing to zero.

**Full arithmetic (8-bit words here for hand calculation; real IP uses 16-bit words — identical procedure).** Words: `10101010` (170) and `01101100` (108).

- Add: `10101010 + 01101100 = 100010110` ($170 + 108 = 278$, 9 bits).
- End-around carry: low 8 bits `00010110` (22) + carried `1` → `00010111` (23).
- Complement → checksum `11101000` (232). Transmit it.
- Receiver: `10101010 + 01101100` → wrap → `00010111`; add checksum: `00010111 + 11101000 = 11111111` (255) → complement `00000000`. **Result:** zero means accept. **Interpretation:** any single-word change breaks all-ones and is caught; compensating multi-word changes can cancel out and escape.

::: toggle Exam trap: forgetting the end-around carry
Adding `170 + 108 = 278` and truncating to 8 bits (22) without adding the carried 1 back gives sum 22 and checksum `11101001` — a wrong answer that looks almost right. The carry wrap is load-bearing: one's-complement addition *is* plain addition plus end-around carry. Always show the wrap line explicitly.
:::

### 4.4 CRC From First Principles

**What/Why.** CRC treats bits as polynomial coefficients and uses the division remainder as the check: far stronger than parity (all bursts up to generator length, all odd-count errors with standard generators) at hardware-shift-register cost. **How.** Agree on generator $G$ of length $r+1$ (degree $r$). Sender: append $r$ zeros to $D$, divide by $G$ modulo-2 (subtraction = XOR, no borrows), take the $r$-bit remainder $R$; transmit $\langle D, R\rangle$. Receiver: divide the whole word by $G$; zero means accept.

**Complete small binary example.** Data $D = 1011$, generator $G = 101$ ($r = 2$). Append two zeros: `101100`. Modulo-2 division by `101`:

```text
          1 0 1          <- quotient (not transmitted)
        _________
101 )   1 0 1 1 0 0
        1 0 1            <- XOR under first 1
        -------
        0 0 0 1          <- bring down 1; leading 0: shift
              0
        -------
        0 0 1 0          <- bring down 0; leading 0: shift
              0
        -------
        0 1 0 0          <- bring down 0; window 100
          1 0 1          <- leading 1: XOR
          -----
          0 0 1          <- remainder R = 01
```

Remainder $R = 01$. Codeword: `1011` + `01` = `101101`. Receiver divides `101101` by `101`: `101 XOR 101 = 000`, shifts through, final window `101 XOR 101 = 000` → remainder `00` → accept. **Result:** $R = 01$, verified twice. **Interpretation:** any single-bit error changes the remainder (nonzero → discard + retransmit); the method detects all bursts shorter than $r+1 = 3$ bits and — since $x^2+1 = (x+1)^2$ carries the $(x+1)$ factor — all odd-count errors. Longer bursts escape with probability $2^{-r} = 1/4$ here: strong, never perfect.

**Comparison (no method is perfect).**

| Method | Basic idea | Good at detecting | Important limitation |
|---|---|---|---|
| Parity (1D) | One bit keeps word parity even/odd | All odd-count errors incl. every single-bit error | Blind to all even-count errors |
| 2D parity | Row + column + overall parity | Single errors (locates them); most small patterns | Even-per-row-and-column patterns (rectangles) pass silently |
| Internet checksum | One's-complement sum + complement | Single-word corruption; cheap whole-header tripwire | Compensating multi-word changes cancel out |
| CRC ($r$-bit) | Modulo-2 remainder as check | Single-bit, odd-count (with $(x+1)$ factor), bursts $< r+1$ | Longer bursts escape with probability $2^{-r}$ |

<a id="aloha"></a>
## 5. ALOHA + Carrier Sensing, Derived

**What/Why.** On a shared medium with no coordinator, transmissions collide and garble. **Vulnerable period** = the window in which another start destroys a frame. **Pure ALOHA:** transmit whenever ready — a frame of duration $T$ collides with any start in the $2T$ window around it. **Slotted ALOHA:** starts only at slot boundaries — window halves to $T$. **Carrier sensing (CSMA):** listen first, defer on busy — the window shrinks to propagation delay, since only starts during the brief deaf interval still collide.

**Throughput derivation (not just the formula).** Let $G$ = offered load (attempts per frame time, incl. retransmissions) and $S$ = carried load (successes per frame time). Poisson arrivals at rate $G$ leave a window of $k$ frame times silent with probability $e^{-kG}$ (the exponential = silence probability). Success needs silence across the vulnerable window: pure ALOHA $k = 2$, so $S = G\cdot e^{-2G}$; slotted $k = 1$, so $S = G\cdot e^{-G}$.

- **What $S$ means:** useful throughput (frames delivered per frame time). **What $G$ means:** total attempted traffic per frame time. **Why exponential:** Poisson silence probability over the vulnerable window. **Numerical substitution:** pure ALOHA at $G = 0.5$: $S = 0.5 \times e^{-1} \approx 0.5 \times 0.3679 \approx 0.184$ (18.4% — the maximum; the peak sits at $G = 0.5$ by differentiation). At $G = 0.2$: $S = 0.2 \times e^{-0.4} \approx 0.2 \times 0.6703 \approx 0.134$. **Interpretation:** pushing load past the peak *reduces* delivered traffic — maxima are $1/(2e) \approx 18\%$ pure and $1/e \approx 37\%$ slotted at $G = 1$.

::: toggle Exam trap: quoting 37% for pure ALOHA
37% ($1/e$) is slotted ALOHA's maximum at $G = 1$. Pure ALOHA peaks at $1/(2e) \approx 18\%$ at $G = 0.5$ — the factor 2 in the exponent (two frame times of vulnerability) is the entire difference. Name the exponent before the percentage.
:::

<a id="ethernet-size"></a>
## 6. Ethernet Minimum Frame Size From First Principles

**What/Why.** Ethernet detects collisions by hearing its own transmission garbled — but a sender that finishes too quickly hangs up before the collision echo returns, mistaking collision for success. **The relationship:** frame transmission time must cover the worst-case detection time: $T_{\text{trans}} \ge 2\tau$ (plus margins), with $\tau$ one-way propagation delay across the maximum segment.

**Step-by-step calculation (classic 10 Mbps Ethernet).** Define: $R = 10 \times 10^6$ bits/s (bit rate); $L_{\max} = 2500$ m (maximum segment length); $v = 2 \times 10^8$ m/s (signal speed in copper); $\tau = L_{\max}/v$ (one-way delay).

- $\tau = 2500 / (2 \times 10^8) = 12.5$ µs (microseconds).
- Round trip $2\tau = 25$ µs; with repeater/processing margins the standard slot time is $T_{\text{slot}} = 51.2$ µs.
- $L_{\min} = R \times T_{\text{slot}} = (10 \times 10^6) \times (51.2 \times 10^{-6}) = 512$ bits $= 64$ bytes.
- **Result:** 64 bytes. **Interpretation:** shorter frames could finish before a far-end collision returns, so Ethernet pads to 64 bytes — transmission time *is* the detection window. Distinct concepts: bit rate $R$ (bits/s, pushing speed) vs transmission time $L/R$ (seconds occupied).

<a id="scenarios"></a>
## 7. Medium-Access Scenario Questions

For each scenario: situation → problem → constraints → candidates → selection → why → why not the alternatives. This is reasoning from network conditions, never a "best technology" ranking.

**Scenario A — 50 wired desktops, bursty traffic.** Unpredictable stations share one wire; idle capacity must not be wasted. Constraints: bursty arrivals, wire sensing available. Selection: **CSMA/CD** — idle listening is free, abort caps waste at $2\tau$ gaps plus backoff retries. Not TDMA (fixed turns idle during bursts). Not ALOHA (18–37% ceilings waste a sensable wire).

**Scenario B — 3 always-backlogged machines needing guaranteed shares.** Each machine must be assured throughput. Constraints: tiny fixed population, continuous demand. Selection: **TDMA** — collision-free shares give deterministic guarantees. Not CSMA/CD: backoff randomness cannot promise shares. Guarantees beat averages where contracts exist.

**Scenario C — warehouse handhelds roaming behind shelving (hidden terminals).** Senders cannot hear each other, so transmissions collide unheard at the Access Point (AP). Constraints: radio self-deafness, hidden pairs, mobility. Selection: **CSMA/CA with RTS/CTS** — the CTS echo informs precisely the hidden nodes (heard CTS, no RTS ⇒ set NAV — Network Allocation Vector — timer, stay silent). Not CSMA/CD (no radio equivalent of wire sensing). Not plain CA (data-frame collisions still cost full frames; short reservations collide cheaply instead).

<a id="arp"></a>
## 8. MAC Address + ARP Trace, Fully Worked

**What/Why.** To send an IP packet on a LAN, the sender needs the destination's MAC for the frame header — IP says *which host*, MAC says *which interface on this wire*. ARP resolves IP → MAC on demand. **Why broadcast the request:** the sender does not know who holds the IP, so it asks everyone (`FF-FF-FF-FF-FF-FF`). **Why the reply is unicast:** only the owner answers, directly to the requester.

**Concrete trace.** Host A: IP `192.168.1.10`, MAC `AA-AA-AA-AA-AA-AA`. Host B: IP `192.168.1.20`, MAC `BB-BB-BB-BB-BB-BB`. A wants to send to B.

1. A checks its ARP cache for `192.168.1.20` → no entry (miss).
2. A broadcasts ARP Request (sender `AA…`/`192.168.1.10`, target-HW unknown, target `192.168.1.20`, opcode request). Switch floods it out of all ports.
3. B recognizes its own IP; other hosts ignore it.
4. B unicasts ARP Reply to A (sender `BB…`/`192.168.1.20`, target `AA…`/`192.168.1.10`, opcode reply).
5. A stores (`192.168.1.20` → `BB…`, Time-To-Live expiry) and sends the data frame to `BB…`.
6. **Result:** one broadcast, one unicast, one cached mapping. **Interpretation:** ARP is LAN-local (routers re-ARP per hop — never end-to-end); IP routes across networks while MAC delivers across one wire.

<a id="switch"></a>
## 9. Switch Learning Table, Fully Walked

**What/Why.** A switch forwards by destination but learns by source: arriving frames teach (source MAC → port); known destinations forward selectively (**known unicast**); unknown destinations and broadcasts **flood**; entries **age** out (typically ~300 s) so moves heal.

**Complete walkthrough.** Empty 4-port switch. A (`AA…`) on port 1, B (`BB…`) on port 2, C (`CC…`) on port 3.

| Time | Incoming port | Source MAC | Destination MAC | Switch action | Learning-table change |
|---|---|---|---|---|---|
| t1 | 1 | AA… | BB… | Flood (unknown) | Learn AA…→1 |
| t2 | 2 | BB… | AA… | Forward port 1 (known) | Learn BB…→2 |
| t3 | 3 | CC… | BB… | Forward port 2 (known) | Learn CC…→3 |
| t4 | 1 | AA… | CC… | Forward port 3 (known) | Refresh AA…→1 (age reset) |

**Result:** after t3 the table is complete; t4 needs no flood. **Interpretation:** learning reads sources, forwarding reads destinations — the standard confusion, resolved.

**Trace problem (solve, then check).** Continuing above: t5 B→C, t6 C→A, t7 new host D (`DD…`) on port 4 sends to A. Answers: t5 forward port 3 (both known, refresh BB…); t6 forward port 1 (refresh CC…); t7 learn DD…→4, forward port 1 (only the source is new — no flood needed). Unknown destinations would flood while learning — one flood, one lesson, as always.

<a id="troubleshooting"></a>
## 10. LAN Troubleshooting Drill, In Order

**The ladder (each stage before the next, with why).** Lower stages precondition upper ones: no link voids addresses; no address voids ARP; unresolved ARP exonerates routing; unanswered gateway localizes the fault.

1. **Physical/link:** cable seated? Carrier (`UP` without `LOWER_UP` = unplugged)? Dead physical voids everything above.
2. **Local configuration:** interface enabled, speed/duplex sane? Wrong VLAN (Virtual LAN) strands hosts silently.
3. **IP configuration:** address, mask, gateway present and consistent? Missing gateway = no off-LAN path by definition.
4. **ARP:** cache entry for target/gateway? Missing → is the request heard (cabling/flooding)? Reply sent but table empty → expiry loop or spoofing (check MAC vs asset tag).
5. **Switch/MAC:** table correct? Unknown-unicast flooding once is normal; persistent flooding means learning failed (loop, full table, spoofed sources).
6. **Routing/gateway:** only after local ARP resolves — ping the gateway before any remote host.
7. **Higher layers:** DNS, firewall, service ports — last, with the network path already exonerated.

**Walked scenario.** Printer (known IP) stops responding; ARP shows no entry; LAN-local silence. Stages 1–3 pass (link up, addresses sane). Stage 4: broadcast the request, watch the flood — no reply arrives. Verdict: printer-side (powered off, unplugged, wrong VLAN) — not routing, not DNS. Had a reply arrived with ping still failing, the ladder moves up (IP mismatch, then service ports), each stage spending only its own suspects.

<a id="problems"></a>
## 11. Integrated Practice Problems

For every solution: Given → Asked → Concept → Why it applies → Rule/formula → Step-by-step work → Result → Interpretation.

**P1 (bit stuffing + destuffing).** Flag `01111110`, payload `01101111110111110`. Runs of six and five 1s → insert `0` after each five-run → `0110111110101111100` (19 bits); destuff drops each post-five `0`. Result: recovered data identical. Interpretation: two inserted bits buy unambiguous boundaries.

**P2 (parity).** Byte `1011001`, even parity → bit `0`; received `1011011` (five 1s, odd) → error flagged. Interpretation: single-bit errors always caught; a second flip would escape.

**P3 (2D parity location).** §4.2 matrix, cell (2,3) flipped → row 2 and column 3 checks fail, rest pass → cell (2,3). Interpretation: single errors locate exactly; rectangles stay silent.

**P4 (checksum).** Words `10101010`, `01101100`: $170+108 = 278$ → wrap $22+1 = 23$ → complement `11101000`. Receiver: $23 + 232 = 255$ → complement zero → accept. Interpretation: one-word changes break all-ones; compensating pairs escape.

**P5 (CRC).** $D = 1010001101$, $G = 110101$: append five zeros, XOR division → $R = 01110$; codeword `101000110101110`; receiver → `00000` → accept. Catches single-bit, odd-count, bursts $< 6$ bits, all but $2^{-5}$ of longer bursts. Interpretation: computed twice — belt and suspenders.

**P6 (ALOHA).** $G = 0.5$ pure: $S = 0.5 \times e^{-1} \approx 0.184$ (the maximum). Interpretation: past the peak, more load reduces delivery; slotted gives $\approx 0.303$ at the same $G$.

**P7 (Ethernet size).** 10 Mbps, 2500 m: $\tau = 12.5$ µs, slot $51.2$ µs, $L_{\min} = 512$ bits $= 64$ B → pad short frames. Interpretation: transmission time is the detection window.

**P8 (ARP trace).** A (`192.168.1.10`/`AA…`) to B (`192.168.1.20`/`BB…`), empty caches: miss → broadcast request → flood → B answers unicast → A caches → data to `BB…`. Interpretation: IP routed, MAC delivered, ARP asked locally.

**P9 (switch table).** §9 plus t5 B→C, t6 C→A, t7 D(`DD…`, port 4)→A: forward port 3; forward port 1; learn `DD…`→4, forward port 1. Interpretation: floods happen only for unknown/broadcast.

**P10 (troubleshooting).** §10 printer: link → config → IP → ARP (heard? sent? cached?) → switch → gateway → services → printer-side fault isolated. Interpretation: each stage exonerates a layer.

**P11 (access choice).** 30 bursty desktops → CSMA/CD; warehouse hidden Wi-Fi → CSMA/CA + RTS/CTS (swap fails physically). Interpretation: bursty-wired → CD, guaranteed → partition, wireless-hidden → CA.

<a id="exam-summary"></a>
## 12. Exam-Oriented Summary (Revision Only)

**Definitions:** frame (one-hop unit); flag `01111110`; stuffing (0 after five 1s); parity/2D/checksum/CRC checks; vulnerable period; $G$ vs $S$; slot time; ARP (IP→MAC, LAN-local); learning (source) vs forwarding (destination).

**Rules:** stuff payload only; $T_{\text{trans}} \ge 2\tau$ (+ margins → 64 B at 10 Mbps); unknown/broadcast floods once; ARP before routing; lower ladder stages first.

**Formulas:** $S = G e^{-2G}$ pure (max $1/2e$ at $G=0.5$), $S = G e^{-G}$ slotted (max $1/e$ at $G=1$); $\tau = L/v$; $L_{\min} = R \times T_{\text{slot}}$; checksum = complement of end-around sum; CRC = modulo-2 remainder, verify-to-zero.

**Distinctions:** detection vs correction; parity vs CRC strength; CD (wired abort) vs CA (wireless avoid); hub (always flood) vs switch (learn then forward); ARP (local who) vs routing (global which-way); bit rate (bits/s) vs transmission time (seconds); baud vs bit rate ($R = S\log_2 N$ symbols bridge).

**Common mistakes:** scanning flags for stuffing; dropping the end-around carry; 37%-for-pure-ALOHA; switches-never-flood; routing-before-ARP; averaging attempts into ALOHA (throughput = offered × silence probability).

**Calculation patterns:** stuffing counts (runs of five); CRC division with alignment list; checksum wrap line; ALOHA substitution at given $G$; $\tau$ → slot → 64 B chain; switch-table walkthroughs; ARP field listing.

::: toggle Enrichment: why `2τ` and not `τ`?
A sender must hear a collision *it* caused: the latest possible start collides at the far end, and that news needs a full trip back. One $\tau$ out, one $\tau$ back — the frame must still be on the wire after $2\tau$, or it hangs up before the echo returns.
:::

::: toggle Enrichment: CRC vs checksum — when does each win?
Checksum wins on cost (one adder — headers at line rate in software). CRC wins on strength (burst/odd-count polynomial guarantees). Headers use checksums where errors are rare; frames and disks use CRC where corruption bursts. Strength follows mathematics; ubiquity follows cost.
:::

<a id="self-check"></a>
## 13. Active Recall Quizzes

::: quiz A 2D-parity checker receives a block with errors at four cells forming a rectangle (even per row and column). What happens, and what does this prove about parity?
() All four errors are corrected automatically
(*) They pass silently — even-per-row-and-column preserves every tally; proves parity detects but never locates, and structured error patterns defeat dimensional redundancy
() The checker crashes on rectangular inputs
() 2D parity always catches 4-bit errors regardless of geometry
::: explanation
Tallies count parity, not errors: two flips per involved row *and* column leave all counts legal. Geometry defeats counting — the blind spot proving detection ≠ correction.
:::

::: quiz Rank by efficiency and state the mechanism behind each step: pure Aloha, slotted Aloha, CSMA, CSMA/CD (wired).
() All four achieve 100% under light load, so ranking is meaningless
(*) 18% → 37% (slot alignment halves vulnerability) → higher (sensing shrinks it to propagation delay) → highest useful (abort converts wasted frames into 2τ gaps + backoff spreads retries)
() CSMA/CD is worst because aborting wastes completed frames
() Slotted Aloha underperforms pure Aloha due to sync overhead
::: explanation
One ladder, one mechanism repeated: shrink the vulnerable window (2 frames → 1 frame → propagation delay → abort gap), then spread retries (backoff). Each rung attacks the previous rung's dominant waste.
:::

::: quiz A wireless station hears the AP's CTS but never heard any RTS. What must it do, and which classic problem does this solve?
() Transmit immediately — CTS is an invitation to race
(*) Set its NAV timer and stay silent for the reserved duration — it is precisely the hidden terminal the CTS echo exists to inform (sender-unreachable, AP-reachable)
() Reply with its own RTS to confirm receipt
() Ignore CTS frames not addressed to it personally
::: explanation
"Heard CTS, no RTS" *defines* hidden-terminal geometry (in AP range, out of sender range). The NAV silence turns one-sided announcement into cell-wide reservation.
:::

::: quiz An Ethernet frame arrives at a switch port with an unknown destination MAC. Contrast the switch's action with a hub's, and state what the reply changes.
() Both drop unknown frames as security policy
(*) Switch floods once (hub-like, this once) while learning the source; the destination's reply teaches its location, so only the first frame floods — hub floods identically forever, learning nothing
() Switches never flood under any circumstances
() Hubs learn forwarding tables faster than switches
::: explanation
Unknown-unicast flooding is the bootstrap both share; learning separates them afterward. First frame: identical behavior. Second frame onward: surgical forwarding vs. eternal shouting.
:::

<a id="exam-focus"></a>
## 14. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Any exam-summary row (ALOHA efficiencies and CD-vs-CA lead); bit-stuffing or CRC short numericals.
* **7 Marks:** Full CRC division with verification, access-method selection with justification, or ARP/troubleshooting traces.
:::

### Essay Question 1 (7 Marks)
**Q: For D = 1010001101, G = 110101: compute the CRC, form the codeword, and verify at the receiver. State exactly which error classes this CRC catches.**

**Model Answer:** Append 5 zeros; XOR division yields $R = 01110$; transmit `101000110101110`; receiver gives `00000` → accept. Catches: single-bit, odd-count ($(x+1)$ factor), bursts $< 6$ bits, all but $2^{-5}$ of longer bursts. Detection only — failures mean discard + retransmit.

### Essay Question 2 (7 Marks)
**Q: A wired lab (30 desktops, bursty) and a warehouse Wi-Fi deployment (hidden terminals) need shared-medium access. Choose each method, derive the efficiency argument, and explain why they cannot swap.**

**Model Answer:** Lab: CSMA/CD — sensing + abort caps waste at $2\tau$ per collision with backoff retries; partitioning idles bursty slots; CA overhead wasted on wire. Warehouse: CSMA/CA + RTS/CTS — self-deaf radios with unheard hidden pairs; CTS echo informs the hidden. Swap fails physically: CD needs wire voltage; CA overhead buys nothing where detection works.
