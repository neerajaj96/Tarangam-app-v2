# DoS & DDoS: Exhaustion Economics

**Killing availability by the numbers — volumetric/protocol/app-layer floods, botnets, and absorb/scrub/disperse defenses.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Siege Catering
**DoS** (one catapult) vs **DDoS** (ten thousand slingshots — botnet conscripts, reflection amplifiers like open DNS/NTP multiplying fire). Targets: **pipes** (volumetric Gbps floods), **tables** (SYN half-opens eating connection memory), **brains** (Slowloris sipping app threads, expensive queries). Defense triad: **absorb** (overprovision/CDN edge), **scrub** (clean-pipe filtering upstream), **disperse** (anycast: one address, many fortresses).
:::

::: anim ddos-flood One Arrow Blocked, Ten Thousand Not
Single source? Filter it. Botnet? Absorb at the edge, scrub upstream, anycast the target — distribution answers distribution.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Flood taxonomy + defense mapping

* Volumetric (UDP/DNS-amplified floods: spoofed queries → big answers at victim — amplification *factor* the metric) → absorb/disperse (CDN/anycast soak).
* Protocol (SYN floods: backlog exhaustion; mitigations: SYN cookies, backlog tuning, rate-limit) → state-reduction tricks.
* Application (HTTP floods, Slowloris/RUDY: legit-looking, low-bandwidth, connection-slot starvation) → WAF behaviour rules, timeouts, proof-of-work/captcha gates.
* Botnets: C2 (central/P2P/DGA-resilient), conscription hygiene (the IoT-betrayal link to M1 IoT/CPS topic!).

::: callout-formula KTU Formula Vault: Floods
Pipes/tables/**brains** · amplification = **answer/query ratio** · defend: **absorb/scrub/disperse**.
:::

::: callout-pitfall SYN Cookies Break TCP Options (Classic Trade)
Cookies encode state in sequence numbers (stateless!) but shed window-scaling/SACK options (fallback performance) — mitigation with a limp. Modern stacks use them as *under-attack mode*, not always-on — mode-gated, stated tradeoff.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Campus portal (10k legit rps capacity) faces: (a) $40$ Gbps UDP flood on $10$ Gbps uplinks, (b) Slowloris holding $5$k app threads. Per-vector triage + playbook with metrics to watch."
:::

::: step [Step 2: Execution] Pipe vs Brain, Separately
1. (a) Volumetric $4\times$ pipe: on-prem dead on arrival — BGP-anycast/CDN absorb upstream (scrub centre advertises, clean trickle returns); watch: edge drops vs clean-pass ratio, upstream telemetry.
2. (b) Slowloris: thread-pool exhaustion at *low* bandwidth (volume metrics blind!) — WAF request-timeout/completeness rules + async/evented server range-requests handling; watch: thread occupancy + incomplete-request rate (the telling metric).
:::

::: step [Step 3: Conclusion] Final Result
Vector-typed triage (pipe/table/brain) → mapped defense → telling metric per vector. Volume-blindness to slow attacks is the insight to foreground — metrics must match vectors.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
DNS amplification factor ~$50\times$ means:
(A) DNS is $50\times$ faster
(*B) Each spoofed query byte yields ~$50$ answer bytes at the victim (open resolver + ANY/large records) — attacker leverage metric; fixes: close resolvers, RRL, BCP38 anti-spoofing at sources
(C) Caches are $50\times$ bigger
(D) Queries cost more
::: explanation
Leverage lives in protocol asymmetry (small ask, big answer) + spoofed source. Kill any leg (closed resolvers, response-rate-limiting, source validation) and leverage collapses — fix-menu, not single patch.
:::

::: quiz Q2: Foundational Concept
Slowloris needs little bandwidth because it attacks:
(A) Pipes
(*B) Server *state* (connection/thread slots held by partial requests) — table/brains, not pipes; volumetric defenses stare past it while the pool drains
(C) DNS caches
(D) Client browsers
::: explanation
Resource-type diagnosis (bandwidth vs slots vs CPU) routes defenses: slot-starvation wants timeouts/completeness rules + evented architectures, not bigger pipes. Type-first triage, always.
:::

::: quiz Q3: Foundational Concept
Anycast helps DDoS by:
(A) Hiding the IP
(*B) Dispersing one destination prefix across many scrub-capable sites (BGP nearest-wins) — flood *splits* geographically; each site absorbs its share, scrubbed centrally as needed
(C) Encrypting traffic
(D) Blocking bots
::: explanation
Distribution answers distribution: topological diffusion divides the flood before any box chokes. Combined with scrubbing (clean return paths), anycast is the absorb-and-cleanse architecture — state both halves.
:::
