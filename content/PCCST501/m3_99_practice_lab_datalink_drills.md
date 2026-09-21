---
id: m3_99_practice_lab_datalink_drills
courseCode: PCCST501
module: 3
sequence: 99
title: 'Module 3 Practice Lab: Data-Link Drills'
difficulty: intermediate
estimatedMinutes: 10
learningObjectives:
  - Stuff, check and convict frames in sprint verdicts
  - Triage shared media with Aloha math and carrier discipline
  - Map silent-printer symptoms to ARP and switch behavior
  - Self-test with the exam recap and active-recall checklist
concepts:
  - data-link scenarios
  - error-control sprint
  - medium-access triage
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

**Stuffing and CRC by hand, access-method selection, ARP traces, wireless scenarios, and exam essay models.**

<a id="the-intuition"></a>
## 1. Step-by-Step Scenario Analysis

Each scenario is a sprint verdict: compute, then convict. Abbreviations: CRC (Cyclic Redundancy Check), ARP (Address Resolution Protocol), CSMA/CD (Carrier Sense Multiple Access with Collision Detection), CSMA/CA (… with Collision Avoidance), RTS/CTS (Request to Send / Clear to Send), NAV (Network Allocation Vector), AP (Access Point), BER (Bit Error Rate).

### Scenario 1: Stuff-and-Check Sprint

Data `11011111110` (11 bits). Bit-stuff it: indices 3–9 hold seven consecutive 1s — insert `0` after the fifth (index 7); indices 8–9 are only two more 1s (no second run). Stuffed: `11011111` + `0` + `110` = `110111110110` (12 bits). Destuff check: strip the 0 after the five-run → original restored. One inserted bit, zero ambiguity.

### Scenario 2: CRC Courtroom

Claim: "data `1010001101` with generator `110101` yields CRC `01110`." Verify like an examiner: recompute the division (alignments `101000`→`011101`→`111011`→`001110`→`111010`→`001111`→`111110`→`001011`→`101100`→`011001`→`110010`→`000111`, remainder `01110` ✓), then divide $\langle D, R \rangle$ = `101000110101110` by the generator → `00000` ✓. Claim upheld twice — computation plus receiver check, the belt-and-suspenders standard.

### Scenario 3: Shared-Medium Triage

Three deployments, one choice each: (a) 50 wired desktops, bursty traffic — **CSMA/CD** (listen+abort wastes only $2\tau$ per collision; partitioning would idle most slots). (b) 3 always-backlogged lab machines needing guarantees — **TDMA** (Time Division Multiple Access) (collision-free shares beat contention odds). (c) warehouse handhelds roaming around shelving (hidden terminals everywhere) — **CSMA/CA with RTS/CTS** (radios can't detect; reservations inform the hidden). Rule: bursty-wired → CD, guaranteed-shares → partition, wireless → CA.

### Scenario 4: The Silent Printer

A printer (known IP — Internet Protocol) stops responding. ARP table shows no entry; pinging gives "no route"-style silence *within* the LAN (Local Area Network). Diagnosis chain: (1) ARP query broadcast heard? Check switch flooding/cabling. (2) Reply sent but table still empty? TTL (Time To Live) expiry loop or spoofed replies (poisoning suspect — verify MAC — Media Access Control — against the asset tag). (3) Reply cached yet ping fails? Problem is above ARP (IP/config, not addressing). Layered elimination: resolve addressing *before* blaming routing.

<a id="the-dimensions"></a>
## 2. "Do Not Confuse" Cheat Table

| Pair | Distinction that earns marks |
|---|---|
| Byte vs. bit stuffing | Escape FLAG bytes vs. 0-after-five-1s with 01111110 flags (self-synchronizing) |
| Parity vs. CRC | Odd-count-only / rectangle-blind vs. bursts + odd + $2^{-r}$ leakage |
| Detection vs. correction | Says corrupt (retransmit) vs. locates+fixes (Hamming territory, heavier codes) |
| Pure vs. slotted Aloha | 18% ($1/2e$, 2-frame vulnerability) vs. 37% ($1/e$, slotted alignment) |
| CSMA vs. CSMA/CD | Listen-before-talk vs. +abort-while-talking, jam, backoff, $2\tau$ min-frame rule |
| CD vs. CA | Wired voltage-sensing vs. wireless RTS/CTS avoidance (self-deaf + hidden terminals) |
| Hub vs. switch | One collision domain, floods always vs. learned table, per-port domains, flood-if-unknown |
| ARP scope | LAN-local broadcast/unicast/TTL; routers need gateway-ARP per hop, never end-to-end |
| Hidden vs. exposed terminals | Unheard colliders at AP (needs CTS echo) vs. needlessly silenced parallel pairs (lost reuse) |
| Baud vs. bit rate | Symbols/s vs. data/s ($R = S\log_2 N$ — M4 bridge, same confusion family) |

**Watch out:** (1) Stuffing flag bits instead of data — scan payload only. (2) Quoting 37% for pure Aloha. (3) "Switches never flood" — unknowns flood once. (4) Blaming routing before ARP resolves — addressing first, always.

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz A 2D-parity checker receives a block with errors at four cells forming a rectangle (even per row and column). What happens, and what does this prove about parity?
() All four errors are corrected automatically
(*) They pass silently — even-per-row-and-column preserves every tally; proves parity detects but never locates, and structured error patterns defeat dimensional redundancy
() The checker crashes on rectangular inputs
() 2D parity always catches 4-bit errors regardless of geometry
::: explanation
Tallies count parity, not errors: two flips per involved row *and* column leave all counts legal. Geometry defeats counting — the canonical blind spot proving detection ≠ correction and motivating CRC's polynomial armor for real links.
:::

::: quiz Rank by efficiency and state the mechanism behind each step: pure Aloha, slotted Aloha, CSMA, CSMA/CD (wired).
() All four achieve 100% under light load, so ranking is meaningless
(*) 18% → 37% (slot alignment halves vulnerability) → higher (sensing shrinks it to propagation delay) → highest useful (abort converts wasted frames into 2τ gaps + backoff spreads retries)
() CSMA/CD is worst because aborting wastes completed frames
() Slotted Aloha underperforms pure Aloha due to sync overhead
::: explanation
One ladder, one mechanism repeated: shrink the collision-vulnerable window (2 frames → 1 frame → propagation delay → abort gap), then schedule the retries (backoff). Each rung attacks the previous rung's dominant waste — the whole topic as a single ascending argument.
:::

::: quiz A wireless station hears the AP's CTS but never heard any RTS. What must it do, and which classic problem does this solve?
() Transmit immediately — CTS is an invitation to race
(*) Set its NAV timer and stay silent for the reserved duration — it is precisely the hidden terminal the CTS echo exists to inform (sender-unreachable, AP-reachable)
() Reply with its own RTS to confirm receipt
() Ignore CTS frames not addressed to it personally
::: explanation
"Heard CTS, no RTS" *defines* hidden-terminal geometry (in AP range, out of sender range). The NAV silence converts the sender's one-sided announcement into cell-wide reservation — the echo doing the job the original shout physically cannot.
:::

::: quiz An Ethernet frame arrives at a switch port with an unknown destination MAC. Contrast the switch's action with a hub's, and state what the reply changes.
() Both drop unknown frames as security policy
(*) Switch floods once (hub-like, this once) while learning the source; the destination's reply teaches its location, so only the first frame floods — hub floods identically forever, learning nothing
() Switches never flood under any circumstances
() Hubs learn forwarding tables faster than switches
::: explanation
Unknown-unicast flooding is the bootstrap both share; learning is what separates them afterward. First frame: identical behavior. Second frame onward: surgical forwarding vs. eternal shouting. The table is the difference between a device and a repeater.
:::

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Any cheat-table row (Aloha efficiencies and CD-vs-CA lead); bit-stuffing or CRC short numericals.
* **7 Marks:** Full CRC division with verification, access-method selection with justification, or ARP/troubleshooting traces.
:::

### Essay Question 1 (7 Marks)
**Q: For D = 1010001101, G = 110101: compute the CRC, form the codeword, and verify at the receiver. State exactly which error classes this CRC catches.**

**Model Answer:** Append 5 zeros; XOR long division yields $R = 01110$ (alignments as in Scenario 2); transmit `1010001101 01110`; receiver division gives `00000` → accept. Catches: all single-bit errors, all odd-count errors (standard generators carry the $(x+1)$ factor that guarantees this), all bursts $< 6$ bits, all but $2^{-5}$ of longer bursts. Detection only — failures mean discard + retransmit.

### Essay Question 2 (7 Marks)
**Q: A wired lab (30 desktops, bursty) and a warehouse Wi-Fi deployment (hidden terminals) need shared-medium access. Choose each method, derive the efficiency argument, and explain why they cannot swap.**

**Model Answer:** Lab: CSMA/CD — sensing + abort keeps waste at $2\tau$ per collision with backoff-spread retries; partitioning would idle bursty slots; CA's reservations add needless overhead on wire. Warehouse: CSMA/CA + RTS/CTS — radios can't detect (self-deaf) and hidden pairs collide unheard; CTS echo informs the hidden. Swap fails physically: CD needs measurable wire voltage; CA's control overhead buys nothing where detection already works. Medium physics picks the protocol.
