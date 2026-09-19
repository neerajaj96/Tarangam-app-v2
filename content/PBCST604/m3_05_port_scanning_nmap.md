---
id: m3_05_port_scanning_nmap
courseCode: PBCST604
module: 3
sequence: 5
title: 'Port Scanning: TCP/UDP Techniques & Nmap'
difficulty: beginner
estimatedMinutes: 4
learningObjectives:
  - Knock with connect, SYN, FIN-family and UDP scan grammars
  - Read silence, resets and ICMP as open, closed or filtered
  - Drive Nmap flags with the Windows GUI counterpart named
concepts:
  - port scanning
  - Nmap grammar
  - scan interpretation
prerequisites: []
examRelevance: high
tags:
  - network-security
  - nmap
---
# Port Scanning: TCP/UDP Techniques & Nmap

**Knocking politely and otherwise — connect/SYN/FIN/Xmas/NULL/UDP scans, what each reveals, and reading Nmap output.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Door-Knock Codes
**Connect scan** rings the bell fully (completes handshake — logged loudly). **SYN scan** knocks and runs (half-open: SYN→SYN/ACK→RST — port state learned, app never woken — the stealth default). **FIN/Xmas/NULL** slip odd flags (open ports *ignore*; closed ones RST back — inverted logic!; useless vs stateful Windows which RST everything). **UDP** shouts into wells (open→silence-or-data, closed→ICMP-unreachable; slow, lossy, essential — DNS/SNMP live here). **Nmap** is the lockpick set automating all six plus version/OS guesses (`-sV -O`) — authorized maps only.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Scan table + Nmap grammar

| Scan | Mechanism | Open sign | Closed sign | Stealth/noise |
|---|---|---|---|---|
| Connect `-sT` | full handshake | connected | refused | loud (logged) |
| SYN `-sS` | half-open | SYN/ACK | RST | quiet-ish (default) |
| FIN/Xmas/NULL `-sF/-sX/-sN` | odd flags | silence | RST | IDS-evading (Unix-only logic) |
| UDP `-sU` | datagram | reply/silence | ICMP unreach | slow, retries needed |

Version `-sV` (banner+probe matching), OS `-O` (TCP/IP stack fingerprint quirks), timing `-T0..T5` (paranoia↔insane), output `-oN/-oX` (evidence files!).

### 2.2 SuperScan: the Windows GUI counterpart

**SuperScan** (Foundstone/McAfee, Windows-only) runs the *same* underlying techniques — TCP connect scans, SYN scans, ping sweeps, banner grabs — behind point-and-click presets with HTML reports, plus Windows-flavoured extras (NetBIOS/share enumeration). Tradeoff vs Nmap: approachable and report-ready out of the box, but narrower (no NSE scripting engine, no OS breadth, slower at scale). Exam rule: techniques transfer one-to-one (a SYN scan is a SYN scan); only the *interface and extensibility* differ — and both tools need the same written authorization, GUI or CLI.

::: callout-formula KTU Formula Vault: Knocks
SYN = **default half-open** · FIN-family = **silence-means-open** · UDP = **ICMP-or-silence** · Nmap flags **-sS/-sV/-O/-T**.
:::

::: callout-pitfall Open|Filtered vs Closed in UDP
Silence = open *or* filtered (dropped!) — UDP can't distinguish without app response; rescans + version probes disambiguate. Certain-verdict claims from one silent UDP probe overstate — report `open|filtered` honestly.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Authorised `nmap -sS -sV -O -T4 --top-ports 1000 lab-target` returns: $22$ open (OpenSSH 8.9), $80$ open (nginx 1.18), $443$ filtered, $53/udp$ open|filtered. Triage + next steps per finding."
:::

::: step [Step 2: Execution] Read, Rank, Probe (Consented Lab)
1. $22$: version→CVE check (8.9 dated? patch-note compare), brute-force policy (fail2ban? key-only?).
2. $80$:Nikto/dirb-style content audit next (version → app layer, separate task).
3. $443$ filtered: firewall/IPS shaping? — retry timing variants + path check (filter *rule* or *host-down-mid*? re-verify liveness first!).
4. $53/udp$: version/query probes (DNS role? zone-transfer attempt per M1 recon ladder) — silence reported as open|filtered, never "open, sure".
:::

::: step [Step 3: Conclusion] Final Result
State→version→implication→next-probe per port; honesty grades on uncertain states (filtered/open|filtered labelled, not wished). Port-row tables are the deliverable format.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
SYN scan is "half-open" and stealthier because:
(A) Packets are encrypted
(*B) It aborts pre-completion (RST after SYN/ACK) — target *application* never accepts (no logs there); only packet filters/IDS see the knocks (quieter, not silent)
(C) It uses no packets
(D) Firewalls allow it
::: explanation
Handshake economics: full-connect wakes apps (logged everywhere); half-open stops at TCP layer (fewer witnesses). Stealth is relative (IDS still sees SYN patterns — timing/fragmentation games further, never perfectly).
:::

::: quiz Q2: Foundational Concept
FIN scan: silence means open because:
(A) Open ports reply FIN-ACK
(*B) RFC behavior: closed ports RST unexpected bare-FINs; open ports *ignore* (no matching socket state) — inverted inference (silence=open); Windows stacks RST regardless (technique void there — OS-dependence stated!)
(C) Firewalls confirm it
(D) Open ports echo
::: explanation
Inversion logic (silence ⇒ open) flips connect-scan intuition — state the inversion explicitly or misread every result. OS-conditional validity (Unix-RFC vs Windows-always-RST) bounds the technique's scope.
:::

::: quiz Q3: Foundational Concept
`-T5 insane` timing risks:
(A) Nothing, always fastest-best
(*B) Packet loss (self-DoS noise), IDS alarms, missed slow replies (accuracy death), target strain (fragile embedded stacks crash — scope/consent jeopardy!) — speed trades accuracy, stealth, and safety together
(C) Slower results
(D) Wrong ports scanned
::: explanation
Timing is a three-way dial (speed/stealth/reliability): `-T5` maxes speed, craters the other two, and can harm targets (consent scope covers *effects*, not just addresses). Default `-T3`, escalate deliberately with cause logged.
:::
