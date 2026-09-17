# Wired vs Wireless, GSM & Generations 3G–6G

**Guided vs unguided, the GSM call path, and the generation ladder from voices to everything.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Roads vs Radio Dispatch
**Wired** = paved roads (predictable, private, dug once — copper/fibre/coax). **Wireless** = radio dispatch (flexible, shared airwaves, weather/noise intrude). **GSM** organises the airwaves into cells with a base station per neighbourhood, switching calls as you roam. **Generations** pave wider highways each decade: voices (2G) → pocket internet (3G) → broadband video (4G) → millisecond industries (5G) → sensing+AI fabric (6G vision).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Wired vs wireless (exam table)

Wired: guided, high/consistent rates, secure, install-costly, immobile. Wireless: unguided (RF/microwave/satellite/IR), mobile/flexible, shared-spectrum limits, security-by-crypto, weather-sensitive.

### 2.2 GSM blocks + generation ladder

MS (handset+SIM) ↔ BTS (tower) ↔ BSC ↔ MSC (switching + registers HLR/VLR) ↔ PSTN/other networks. Ladder: 1G analog voice → 2G/GSM digital voice+SMS → 3G data (Mbps) → 4G/LTE all-IP broadband (100s Mbps, low ms tens) → 5G eMBB/URLLC/mMTC (Gbps, $\sim$ms, slicing) → 6G vision (Tbps dreams, sensing+AI-native, sub-ms).

::: callout-formula KTU Formula Vault: Generations
Wired = **guided/private** · wireless = **shared/mobile** · GSM: **MS-BTS-BSC-MSC** · ladder: **voice→SMS→Mbps→LTE→slicing→sensing**.
:::

::: callout-pitfall 5G ≠ Just Faster 4G
5G's triangle (eMBB speed, URLLC latency/reliability, mMTC density) plus slicing redefines *kinds* of service, not just bars. "5G = speedy 4G" misses two vertices — name the triangle.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Trace a mobile-to-mobile call through GSM blocks, then place a remote-surgery link and a farm sensor net on the generation ladder with reasons."
:::

::: step [Step 2: Execution] Path, Then Placement
1. Caller MS → serving BTS → BSC → MSC (HLR/VLR locate callee) → callee MSC/BSC/BTS → MS; handover chains BTSs mid-move.
2. Surgery → 5G URLLC (ms latency + reliability); sensors → 5G mMTC / NB-IoT (density + battery); neither fits 4G's best-effort broadband brief.
:::

::: step [Step 3: Conclusion] Final Result
Block-tracing proves GSM; requirement-matching proves generations. "Why not 4G" reasoning is the comparison mark — latency/reliability/density, not speed.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
HLR vs VLR in GSM:
(A) Both store SMS text
(*B) HLR = permanent home record (identity, services); VLR = temporary visitor copy at the current MSC area, enabling roaming location
(C) Both are handsets
(D) HLR routes data only
::: explanation
Permanent-vs-visiting split lets any MSC serve any subscriber: query HLR once, cache in VLR while visiting. Location updating *is* VLR bookkeeping — roaming made mundane.
:::

::: quiz Q2: Foundational Concept
Why does 4G's "all-IP" matter architecturally?
(A) Faster antennas only
(*B) Voice becomes just another data app (VoLTE) — one packet core replaces circuit+packet dual cores, simplifying and converging services
(C) Batteries last longer
(D) Towers disappear
::: explanation
Circuit-switched voice cores retire; everything rides IP bearers with QoS classes. Convergence (not raw speed) is 4G's structural leap — state it as architecture, not bars.
:::

::: quiz Q3: Foundational Concept
A factory wants $10^5$ sensors per km² on coin cells for a decade. Generation fit?
(A) 4G broadband
(*B) 5G mMTC (or NB-IoT family) — density + ultra-lean power profiles beat broadband's always-on appetite
(C) 2G voice channels
(D) Wi-Fi only
::: explanation
mMTC trades speed for scale and sip-power (sleepy radios, tiny payloads). Broadband would drain cells in weeks — match the triangle vertex (density), not the headline rate.
:::
