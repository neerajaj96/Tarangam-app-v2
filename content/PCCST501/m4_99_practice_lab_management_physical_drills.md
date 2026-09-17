# Module 4 Practice Lab: Management & Physical-Layer Drills

**SNMP operation traces, capacity numericals, digitization chains, modulation arithmetic, and exam essay models.**

<a id="the-intuition"></a>
## 1. Step-by-Step Scenario Analysis

### Scenario 1: The Midnight Link Failure (SNMP in Action)

A leased line drops at 2 AM. Reconstruct the management traffic: (1) the router agent fires a **Trap** (linkDown) — arrives in seconds *if* it survives (unacknowledged); (2) the NMS, doubting traps, **polls** interface status via **GetRequest** on the ifOperStatus OID — confirms down; (3) after repair, the NMS **walks** the interface table with **GetNextRequest** to re-inventory all ports (unknown count → walk until the OID prefix changes); (4) it pushes the restored config via **SetRequest** over **SNMPv3** (auth+priv — never v2c cleartext for writes). Trap for speed, poll for truth, walk for discovery, v3 for safety — the four-idiom drill.

### Scenario 2: Capacity Court (Both Laws, One Verdict)

A 5 kHz line, 8-level signaling available, measured SNR 25 dB. Nyquist (noiseless): $2 \times 5000 \times \log_2 8 = 30{,}000$ bps $= 30$ kbps. Shannon: SNR $= 10^{2.5} \approx 316$; $C = 5000 \times \log_2(317) \approx 5000 \times 8.31 \approx 41{,}547$ bps $\approx 41.5$ kbps. Verdict: 8-level signaling achieves 30 kbps (below Shannon's roof, so error-free is feasible); nothing on this line exceeds $\approx 41.5$ kbps regardless of cleverness. Note the reversal from the M4 worked example (there Shannon bound tighter at 30) — *compute both every time; either can bind*.

### Scenario 3: Digitize This (End to End)

A 10 kHz instrumentation signal, 10-bit quantization, QAM-16 modem over a 2400-baud line. Sampling floor: $f_s \ge 20{,}000$/s. Bit rate: $20{,}000 \times 10 = 200$ kbps generated. Modem capacity: $2400 \times \log_2 16 = 9600$ bps $\ll 200$ kbps — the digitized stream **cannot** ride this modem live (compress ~21:1, store-and-forward, or upgrade the line). Three M4 formulas chained: sample floor → bit rate → modem check. Miss any link and the design fails silently on paper, loudly in production.

---

<a id="the-dimensions"></a>
## 2. "Do Not Confuse" Cheat Table

| Pair | Distinction that earns marks |
|---|---|
| SMI vs. MIB | Grammar for defining objects vs. OID tree of actual variables |
| Get vs. GetNext vs. Trap | Known read vs. table walk vs. unsolicited alarm (unreliable by design) |
| SNMPv2c vs. v3 | Cleartext communities (lab-only) vs. auth + encryption + access control |
| Nyquist rate vs. Nyquist bit rate | $2f_{max}$ sampling floor vs. $2B\log_2L$ symbol ceiling — different theorems |
| Nyquist vs. Shannon | Noiseless ideal vs. noisy law; answer = min of the two |
| dB vs. linear SNR | $10\log_{10}$ scale (30 dB = 1000×); convert before Shannon, never after |
| Sampling vs. quantization | Time discretization ($f_s$) vs. amplitude discretization (levels/bits) |
| Aliasing cause vs. cure | Undersampling folds spectra (incurable after) vs. prefilter + $f_s \ge 2f_{max}$ |
| ASK vs. FSK vs. PSK | Amplitude (fragile) vs. frequency (hungry) vs. phase (toughest) |
| Baud vs. bit rate | Symbols/s vs. $S\log_2N$ data/s — equal only for binary |

---

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz A 5 kHz channel offers 8-level signaling with 25 dB SNR. A student reports "capacity = 30 kbps by Nyquist, done." What is missing, and what is the true verdict?
() Nothing — Nyquist alone always suffices
(*) The Shannon check: 25 dB → SNR ≈ 316 → C ≈ 41.5 kbps; verdict = min(30, 41.5) = 30 kbps achievable, ~41.5 kbps absolute roof — the student got lucky (Nyquist binds here) but skipped the binding law
() The student must also add both laws together (71.5 kbps)
() dB values are irrelevant to capacity
::: explanation
Two laws, one verdict: compute *both*, take the *min*. Here Nyquist's 30 kbps binds and Shannon permits it — but on a noisier line Shannon would overrule. Reporting one law is half an answer wearing full marks' clothing.
:::

::: quiz An NMS shows a router "up" via polling while linkDown traps arrived an hour ago for the same link. Which source do you trust, and what explains the split?
() Trust the traps — polling is decorative
(*) Trust the poll (current state read on demand); the trap reported a transient flap long since recovered — traps are event rumors, polls are present-tense truth
() Both are always perfectly consistent by protocol law
() Discard both and reboot the NMS
::: explanation
Trap = "it went down at 2 AM" (event, possibly stale); poll = "it is up *now*" (state, current). Transients resolve between trap and poll routinely — which is exactly why robust designs pair unsolicited alarms with periodic truth-reads instead of choosing one.
:::

::: quiz A 200 kbps digitized stream must cross a 2400-baud QAM-16 modem live. Can it, and what are the three honest options?
() Yes — modems accept any rate transparently
(*) No (9600 bps capacity ≪ 200 kbps need): compress the stream ~21:1, buffer-and-forward with delay, or provision a fatter pipe — physics first, then economics
() Yes, by raising the modem to 200 kbaud on the same line
() No, and nothing can ever fix it — abandon digitization
::: explanation
$2400 \times 4 = 9600$ bps is the modem's Shannon-adjacent reality; 200 kbps of source won't fit. Options: shrink the source (compression), accept latency (store-forward), or buy bandwidth. "Hope" is not on the list — Scenario 3's chain ends in arithmetic, not optimism.
:::

::: quiz Uniform 8-bit quantization is proposed for faint biosignals with occasional huge spikes. What goes wrong, and what is the standard fix?
() Nothing — uniform steps suit all signals equally
(*) Fine detail near silence drowns in coarse steps sized for the spikes (SNR collapses where the information lives); fix with companding (μ-law: fine near zero, coarse at extremes), matching resolution to perceptual/ informational density
() Biosignals cannot be digitized at all
() More bits always fix distribution mismatch efficiently
::: explanation
Uniform steps spend resolution evenly; information isn't even — biosignals live near zero with rare excursions. μ-law concentrates levels at small amplitudes (fine where it matters), exactly like ears do. Match quantizer to signal statistics, not to symmetry aesthetics.
:::

---

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Any cheat-table row (SNMP ops and dB conversion lead); single-law numericals.
* **7 Marks:** Both-laws verdicts, digitization chains, or SNMP scenario traces with version justification.
:::

### Essay Question 1 (7 Marks)
**Q: A 5 kHz channel with 25 dB SNR considers 8-level signaling. Compute both capacity laws, state the verdict with reasoning, and explain what changes at 10 dB SNR.**

**Model Answer:** Nyquist: $2(5000)(3) = 30$ kbps. SNR $= 10^{2.5} \approx 316$; Shannon: $5000\log_2 317 \approx 41.5$ kbps. Verdict: 30 kbps achievable (under the roof). At 10 dB (SNR $= 10$): Shannon $= 5000\log_2 11 \approx 17.3$ kbps $< 30$ — now *Shannon* binds and 8-level signaling's 30 kbps is *unachievable* error-free; drop levels or accept errors. Either law can bind — compute both, every time.

### Essay Question 2 (7 Marks)
**Q: Trace the SNMP traffic when a monitored link fails and recovers, naming each operation, its direction, and why v3 is required for the write step.**

**Model Answer:** Failure: agent → manager **Trap** (fast, unacknowledged — may itself die). NMS → agent **GetRequest** on ifOperStatus (poll = truth). Recovery audit: **GetNextRequest** walk re-inventories ports (unknown count idiom). Reconfiguration: manager → agent **SetRequest** — over **SNMPv3** because v1/v2c communities cross in cleartext, handing device control to any sniffer; v3's auth+encryption+access control close exactly that hole. Four idioms, four justifications, one version rule.
