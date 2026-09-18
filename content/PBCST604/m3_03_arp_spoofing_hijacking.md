# ARP Spoofing & Session Hijacking

**Lying on the LAN — poisoned bindings, traffic detours, and riding live sessions.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Fake Name Tags at a Party
**ARP** maps IP→MAC by *shouted claims with no ID check* (gratuitous replies accepted!). Attacker shouts "I'm the gateway!" (and "I'm the victim!" to the gateway) — traffic detours through attacker (MITM: read/modify/relay). **Session hijacking** then pickpockets the *conversation*: sniff the session token (or predict TCP sequence numbers, blind variant) and inject as the victim — ride authenticated sessions (CSRF's LAN cousin with full duplex!). Defenses: static ARP/Dynamic ARP Inspection (switch binds + validates), encrypted protocols (no plaintext tokens to sniff), short timeouts + re-auth on anomaly.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Poison mechanics + hijack ladder

* ARP: stateless cache updates on *any* reply (even unsolicited) → bidirectional poison (victim↔gateway both lied to) → forward-or-selectively-edit relay (stealth: forward most, alter targets).
* Hijack: passive sniff token (LAN/Wi-Fi plaintext) → sidejacking (ride alongside) vs full takeover (desync victim: RST/DoS the client, adopt sequence) → blind (sequence-guess, harder post-randomisation).
* Defenses: DAI + DHCP snooping bindings (switch enforces truth), VPN/TLS everywhere (nothing rideable in clear), HttpOnly+Secure+SameSite cookies (M2 reunion!), anomaly re-auth.

::: callout-formula KTU Formula Vault: LAN Lies
ARP: **claims without ID** · poison **both directions** · hijack = **ride tokens/sequences** · fix: **DAI + encrypt + harden cookies**.
:::

::: callout-pitfall HTTPS Alone Doesn't Stop LAN MITM (Fully)
Encryption protects *content*, but SSL-stripping/downgrade tricks (HSTS preload gaps, first-contact) plus traffic-shape leakage persist — HSTS + preload + cert vigilance complete the story. Layer claims precisely (content-confidential vs metadata-visible).
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Lab LAN (consented): victim $192.168.1.10$ (MAC :AA), gateway $.1$ (:GG), attacker (:EE). (a) Poison packets (who tells whom what)? (b) Session ride demo shape? (c) Three-layer fix?"
:::

::: step [Step 2: Execution] Lies, Ride, Locks (Lab-Scoped)
1. To victim: "192.168.1.1 is at :EE" (gratuitous ARP reply, op=2). To gateway: "192.168.1.10 is at :EE". Both caches lied; attacker enables forwarding (victim stays online = stealth).
2. Sniff HTTP cookie (lab app plaintext) → replay in attacker browser (sidejack: same session, two drivers) — logged, benign lab accounts only.
3. Switch DAI + DHCP-snooping table (lies dropped at port) · app to HTTPS+HSTS (nothing sniffable) · cookies HttpOnly+Secure+SameSite (ride surface shrunk).
:::

::: step [Step 3: Conclusion] Final Result
Bidirectional lies, forwarding discipline (stealth), cookie replay proof, switch+TLS+cookie-flag fixes. Direction-pairs (both victims lied to) are the detail that separates full from half answers.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Gratuitous ARP accepted unasked enables spoofing because:
(A) ARP is encrypted weakly
(*B) Caches update on *any* ARP reply (no request needed, no authentication) — protocol trusts first reporters; attacker simply reports fastest/loudest
(C) Switches forward it specially
(D) IP addresses change often
::: explanation
Stateless trust-by-assertion is the design flaw (1980s LAN innocence). DAI replaces trust with switch-kept truth tables (DHCP-snooped bindings) — infrastructure, not etiquette, fixes it.
:::

::: quiz Q2: Foundational Concept
Sidejacking vs full session takeover differ by:
(A) Tools used
(*B) Coexistence: sidejack rides *alongside* (victim unaware, both valid); takeover *evicts* (desync/RST the victim, adopt sequences solo) — stealth-vs-exclusivity tradeoff with different detection footprints
(C) Encryption needs
(D) Nothing operational
::: explanation
Alongside is quieter (no anomaly at victim!) but races victim actions; eviction is cleaner control but noisier (victim disconnects = alarm). Stealth/exclusivity frontier chosen per objective — state the tradeoff.
:::

::: quiz Q3: Foundational Concept
Sequence-number randomisation (RFC 6528-style) kills which hijack?
(A) LAN sniffing
(*B) *Blind* off-path injection (can't see traffic to learn seqs — must guess $2^{32}$, infeasible) — on-path sniffers read seqs directly (randomness irrelevant); defense layers acknowledged per attacker position
(C) All hijacking forever
(D) ARP spoofing
::: explanation
Position-dependent defenses: randomness stops the blind (off-path), encryption stops the reader (on-path). Threat-position labelled per fix — no fix floats unscoped.
:::
