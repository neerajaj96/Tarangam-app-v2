---
id: m4_01_network_management_snmp_architecture
courseCode: PCCST501
module: 4
sequence: 1
title: Network Management & SNMP Architecture
difficulty: beginner
estimatedMinutes: 30
learningObjectives:
  - Explain why networks need remote management and the manager/agent/protocol roles
  - Read SMI grammar versus MIB entries versus OID addresses
  - Trace Get, GetNext, GetBulk, Set, Response, Trap, and Inform exchanges
  - Contrast polling with notifications and SNMPv1/v2c with SNMPv3 security
concepts:
  - SNMP
  - NMS manager agent
  - SMI MIB OID
  - SNMP operations polling notifications
  - SNMPv1 v2c v3 USM VACM
prerequisites: []
examRelevance: high
tags:
  - snmp
  - network-management
---
# Network Management & SNMP Architecture

**Manager–agent model, SMI/MIB/OID naming, all seven operations, polling versus notifications, and v3 security.**

<a id="the-intuition"></a>
## 1. The Real-World Situation — Start From Zero

A campus runs 500 routers, switches, printers, and servers across ten buildings. Nobody can stand beside each box — yet a failed link at 3 AM must page someone within seconds, and a technician must read any device's counters and push a fix from one desk.

The problem before the solution: monitor and control thousands of heterogeneous devices *remotely*, in one language cheap enough for a printer — while the managed network is itself sick. That language is SNMP (Simple Network Management Protocol), spoken between manager stations and per-device agents. "Simple" is a requirement: agents must fit on tiny CPUs, so messages stay short, stateless, and ride UDP (User Datagram Protocol).

::: callout-intuition Core Mental Model: The Hospital Monitor Wall
Nurses cannot stand beside every bed — each bed has a **monitor** (agent) reporting pulse to a **central wall** (manager), which raises alarms and pushes dosage changes back. Networks match: each device runs a lightweight **agent** exposing counters and knobs; **managers** poll readings, receive **traps**, push configurations — all *over the same network being watched* (in-band management).
Dropping the hospital now: agent = per-device reporter; manager/NMS (Network Management System) = console; SMI (Structure of Management Information) = grammar; MIB (Management Information Base) = OID dictionary; Trap = unconfirmed alarm; Inform = alarm with receipt.
:::

Almost every exam trap here is a swapped pair — SMI/MIB, Trap/Inform, polling/notification, v2c/v3 — each taught in the main prose; toggles hold only optional depth.

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Network management** | Remotely monitoring (reading state) and controlling (writing settings) devices from a central station. |
| **NMS (Network Management System) / manager** | The application, console, and analytics. SNMP is its language. |
| **Managed device + agent** | A router/switch/server/printer hosting an **agent** process that answers the manager and emits alarms. |
| **Managed object** | One exposed variable — uptime, packets forwarded, interface status — each with one OID. |
| **SNMP (Simple Network Management Protocol)** | The query/response/alarm language between manager and agents; application-layer, usually over UDP. |
| **SMI (Structure of Management Information)** | The *grammar*: allowed data types (wrapping counters, gauges, timeticks) and definition rules. |
| **MIB (Management Information Base)** | The *dictionary*: SMI-written definitions in a tree. Values come from live state per request — no stored "database". |
| **OID (Object Identifier)** | One object's numeric tree address, e.g. `1.3.6.1.2.1.1.1.0`. |
| **ASN.1 (Abstract Syntax Notation One) / BER (Basic Encoding Rules)** | The type language SNMP borrows, and its Tag–Length–Value wire stamping. SMI is the restricted subset. |
| **Polling / notification** | Manager-scheduled repeated reads vs. agent-initiated alarms. |
| **GetRequest / GetNextRequest / GetBulkRequest** | Reads: one named variable / next variable in OID order / a whole chunk at once. |
| **SetRequest / Response** | A configuration write; the answer (values or error) to any request — also the receipt for an Inform. |
| **Trap / InformRequest** | Unsolicited alarms: fire-and-forget (fast, losable) vs. receipt-demanding with retries. |
| **Community string** | v1/v2c cleartext password ("public"/"private") — lab-only. |
| **USM (User-based Security Model) / VACM (View-based Access Control Model)** | SNMPv3's per-user authentication + encryption layer and its who-may-touch-what rules. |
| **UDP ports 161 / 162** | Requests go to agents on 161; Trap/Inform notifications go to managers on 162. |

<a id="the-math"></a>
## 3. Purpose — Model, Naming, Operations, Versions

### 3.1 Network management and why it is needed

Network management is the continuous remote supervision of a network — observing state (is the link up? how many packets dropped?), detecting faults, measuring performance, changing configuration — from a management station instead of by visiting each box. It is unavoidable for three reasons: *scale* (hundreds of devices cannot be watched by hand), *speed* (a dead link must page someone in seconds), and *heterogeneity* (one vendor-neutral language beats a dozen proprietary consoles). The mechanism is always the same loop: each device's agent exposes standard variables, the NMS reads them on a schedule (**polling**), receives alarms the moment things break (**notifications**), and writes settings back (**configuration**). Example: a switch port starts dropping packets at 2 AM — a Trap pages the operator in seconds, a confirming poll shows the error counters, and a Set pushes the fix. Interpretation: the Trap gives one fact fast, polling gives the full picture, the Set closes the loop.

### 3.2 NMS/manager, managed device, and agent

The **managing entity** (manager, NMS) is the central software — dashboards, graphs, alert rules, operator console. The **managed device** is any supervised element; the **agent** is the small process *on* it that speaks SNMP, translating "what is OID X?" into live hardware/software reads. The split keeps intelligence centralised and cost distributed: one NMS stores history and analytics while thousands of cheap agents only map OIDs to local state — which is why SNMP must be "simple" enough for a printer's CPU. Only three interaction patterns exist: manager asks, agent answers (`Get`/`Set` plus `Response`); agent shouts unasked (`Trap`); agent shouts and waits for a receipt (`InformRequest` plus its `Response`). Example: manager 10.0.0.5 sends a read to UDP 161 on router 10.0.0.1; the agent reads its interface register and replies. Interpretation: the manager never touches hardware — every observation passes through the agent's OID mapping.

### 3.3 SNMP meaning and purpose

SNMP is an application-layer request/response/alarm protocol: fixed message types (PDUs — Protocol Data Units) carrying OID–value pairs called variable bindings ("varbinds"), each message bearing a request identifier so replies match requests. It exists because every vendor once had its own management protocol; SNMP standardises the *language* (operations), *naming* (OIDs), and *grammar* (SMI) once, so any manager talks to any agent. It runs over connectionless UDP — requests to port 161, notifications to port 162 — deliberately: no connection setup, tiny headers, fails fast on sick networks. The price is unreliability, handled explicitly: managers retry unanswered requests, and confirmed notifications (`Inform`) exist for alarms that must not die silently. Traffic normally travels *in-band* — over the links it supervises — so during a total outage management messages may die with everything else. Example: reading uptime costs one UDP packet each way. Interpretation: the round trip is cheap, so polling thousands of objects every few minutes is practical.

### 3.4 SNMP architecture and message flow

Four pieces plus the wire: (1) manager/NMS, (2) agent per device, (3) managed objects addressed by OIDs, (4) the MIB definitions both sides share — with SNMP messages as the only traffic between (1) and (2), encoded/decoded by each side's protocol entity. Objects are standardised separately from operations, so new device types add MIB modules without changing the protocol. A request carries: version, community string (v1/v2c) or v3 security parameters, PDU type, request-id, error fields (zero on the way out), and a varbind list (OIDs bare for reads, OID + value for writes). The agent checks access, reads or writes each OID's live state, fills values — or an error status plus the failing varbind's index — echoes the request-id, and returns the `Response`. A Trap/Inform flows the other way to port 162 bearing the alarm OID plus context varbinds (which interface, what state). Trace of one exchange:

```text
Manager ──GetRequest[req=7, sysUpTime.0]──> Agent (UDP 161)
Manager <──Response[req=7, ok, 3801224100]── Agent
```

Interpretation: the echoed `req=7` matches reply to request; `ok` plus the filled value means success, while any nonzero error status with an error index names the exact varbind that failed.

### 3.5 Managed objects

A managed object is one variable the agent exposes — a counter (bytes in), a status (interface up/down), a setting (hostname). Each OBJECT-TYPE definition states its syntax, access (read-only, read-write, not-accessible), status, and description. They exist to carve a stable, cross-vendor *reportable and settable* subset out of thousands of internal registers. Two shapes: *scalar* objects have one instance (uptime, hostname), addressed by appending `.0`; *tabular* objects have one row per entry (interfaces, routes) — each value addressed by appending the row index, e.g. `ifDescr.2` is row 2's description. Example: `sysUpTime.0` returns `3801224100` (hundredths of a second since reboot); `ifOperStatus.2` returns `down(2)`. Interpretation: the OID names *which* variable, the trailing instance names *which copy*, the typed value is the reading.

### 3.6 SMI — what it is and why it exists

SMI is the rulebook for *defining* managed objects: allowed base types, OBJECT-TYPE declarations, table INDEX clauses — the "grammar of the dictionary". SMIv1 serves SNMPv1 MIBs; SMIv2 adds Counter64, MODULE-IDENTITY, NOTIFICATION-TYPE, and sharper access labels. It exists for interoperability-by-subtraction: full ASN.1 is too expressive for tiny parsers, so SMI permits only INTEGER/Integer32, Unsigned32, Counter32, Counter64 (SMIv2), Gauge32, TimeTicks, IpAddress, OCTET STRING, OBJECT IDENTIFIER, plus SEQUENCE scaffolding. A definition states SYNTAX, MAX-ACCESS, STATUS, DESCRIPTION, and any INDEX. The classic distinction is Counter versus Gauge: a Counter only rises and wraps to zero (bytes sent — *differences* between polls give the rate), a Gauge floats (queue length — the value itself is the reading). Example: `ifInOctets` is Counter32 — polls of 4,000,000 then 4,090,000 mean 90,000 bytes arrived between polls.

### 3.7 MIB — what it is and how it differs from SMI

A MIB module is a text file of SMI definitions for one subject — MIB-2 (standard device objects), IF-MIB (interfaces), vendor modules; collectively "the MIB" is the OID tree an agent implements. SMI alone names nothing; the MIB publishes the shared vocabulary, so `1.3.6.1.2.1.1.1` means "system description" on every vendor's box. The distinction: **SMI** = rules for writing definitions (grammar); **MIB** = the definitions (dictionary entries); **OID** = one entry's address. Alphabet versus book versus page number. Managers load MIB modules to turn numbers into names (`sysDescr`) and learn types and access before Sets. Example: the MIB declares `sysDescr` read-only OCTET STRING at `1.3.6.1.2.1.1.1`; polling `…1.1.1.0` returns `"Cisco IOS 15.2"` — the definition set expectations, the live string came from the device.

### 3.8 OID hierarchy with a simple example

The OID tree is a global naming hierarchy: each arc (number) descends one level and the full dotted path is unique. The standard prefix `1.3.6.1` = iso(1).org(3).dod(6).internet(1); below sit `mgmt(2)` (standard MIBs) and `private(4)` (vendor subtrees). Hierarchy prevents collisions and delegates allocation — IANA assigns enterprise numbers under `1.3.6.1.4.1`, vendors extend below, standard objects stay fixed. Read left to right, then the instance: `1.3.6.1.2.1.1.1.0` = iso.org.dod.internet.mgmt.mib-2.system.sysDescr.instance-0, answering `"Router U-plink, IOS 15.2"` (OCTET STRING, read-only); table columns append the row index — `1.3.6.1.2.1.2.2.1.2.2` = …ifDescr.row-2. The wire carries numbers; managers display names by loading MIBs. Interpretation: each arc narrows exactly one level, and the trailing `.0` turns "the sysDescr object" into "the one value of sysDescr on this device".

### 3.9 ASN.1 relationship where relevant

ASN.1 is the general type-description standard; BER is its wire encoding (each value stamped Tag–Length–Value). SNMP reuses both: PDU layouts and MIB syntaxes are specified in ASN.1 and every message travels BER-encoded. That is *why* SMI exists: full ASN.1 is too expressive for tiny agents, so SMI permits only the subset management data needs. For this note only three facts matter: SMI types are borrowed ASN.1 types; values travel as BER TLV bytes; full byte layouts (e.g. INTEGER 5 as `02 01 05`) live in the companion ASN.1/SMI/MIB note.

### 3.10 GetRequest

The manager sends `GetRequest` to read *named* OIDs it already knows — the routine "current value?" operation. Per varbind the agent checks access, reads live state, and fills the value; any unknown or inaccessible OID yields a `Response` with an error status and the failing varbind's index. One `Response` echoes the request-id with all values. Flow: `Manager ──GetRequest[req=11, sysUpTime.0, sysName.0]──> Agent` → agent reads clock and hostname → `Manager <──Response[req=11, ok, 3801224100, "core-sw-1"]── Agent`. Interpretation: two known scalars in, two typed values out.

### 3.11 GetNextRequest

The manager sends `GetNextRequest` when it knows a *starting point* but not the next name — the discovery operation: walking unknown-length tables, finding the first object under a subtree, recovering when a documented OID is absent here. Per varbind the agent returns the *lexicographically next implemented instance* after the supplied OID, not that OID's value. An empty/table OID yields the first leaf below it; the last leaf of a subtree yields the first leaf of the next subtree — the "walk finished" signal. Repeating GetNext with each reply's OID crawls one leaf per exchange. Walk over three interfaces wanting all descriptions: `GetNext[ifDescr] → ifDescr.1="eth0" → GetNext[ifDescr.1] → ifDescr.2="eth1" → GetNext[ifDescr.2] → ifDescr.3="eth2" → GetNext[ifDescr.3] → ifInOctets.1` — stop, the prefix left `ifDescr`. Interpretation: the manager never knew there were three interfaces; the OID prefix change is the standard end-of-table signal.

### 3.12 GetBulkRequest

The manager sends `GetBulkRequest` (v2c/v3 only — absent in v1) to pull *many* leaves in one round trip — the efficient table-download operation. Two parameters steer it: N (NonRepeaters — first N varbinds act like GetNext) and M (MaxRepetitions — each remaining varbind returns up to M successive leaves); the agent packs what fits, truncating on size limits. One large `Response` carries up to N + M-per-repeater values; overshoot past the table end is normal and stops at the prefix change like GetNext. Example: `GetBulk[N=0, M=4, ifDescr]` on the 3-interface agent returns `ifDescr.1/.2/.3` plus the next leaf beyond in a single reply. Interpretation: four round trips collapse into one; the extra value is the terminator, not an error. Exam rule: hundreds of rows always means GetBulk.

### 3.13 SetRequest

The manager sends `SetRequest` to *write* configuration — hostname, interface up/down, route entry; the only state-changing operation. The agent validates every varbind *before* touching anything: exists, writable, correct type, in range, principal authorised — applying all-or-nothing, else rejecting with noAccess, wrongType, wrongValue, or notWritable naming the culprit via the error index. The `Response` echoes OIDs with new values on success, an error otherwise. Flow: `Manager ──SetRequest[req=21, sysName.0="core-sw-2"]──> Agent` → agent checks writable, applies → `Manager <──Response[req=21, ok, "core-sw-2"]── Agent`. Interpretation: the echoed value is the commit confirmation. Security consequence: Sets reconfigure routers, so production restricts them to SNMPv3 with write views — a v2c "private" string hands attackers the keys.

### 3.14 Response

The agent sends `Response` to answer Get/GetNext/GetBulk/Set; any receiver of an `InformRequest` (manager or agent) sends one as its receipt. Nothing else generates a Response — Traps never get one. It carries the echoed request-id, an error-status (ok, tooBig, noSuchObject, noSuchInstance, noAccess, wrongType, genErr), an error-index pointing at the offending varbind, and the varbind list (values on success). Example: `Response[req=11, err=noSuchInstance, index=2]` means "your second OID names no instance here". Interpretation: read error-status first — values are meaningless when nonzero, and the index says which OID to fix.

### 3.15 Trap

The agent sends `Trap` the instant something noteworthy happens (linkDown, linkUp, coldStart, authenticationFailure) — the "don't wait for the next poll" path: agent-to-manager, UDP 162, no prior request. It fires the PDU (trap OID plus context varbinds: which interface, what state) and forgets it — no timer, no retry, no acknowledgement. Delivery rides connectionless UDP with no receipt, so a Trap can die in the very outage it reports. Flow: `02:14:07 eth1 drops → Agent ──Trap[linkDown, ifIndex=2]──> Manager` (no reply). Interpretation: the manager learns in milliseconds instead of at the next 5-minute poll — but must *confirm by polling* (`Get ifOperStatus.2`). Version footnote: v1 Traps use a special Trap-PDU layout; v2c/v3 unify them into the standard PDU shape (Trapv2) — same purpose, uniform parsing.

### 3.16 InformRequest

Either an agent (alarm needing proof) or a manager (forwarding events up a hierarchy) sends `InformRequest` when the event is important enough to confirm — the reliable notification, new in v2c and kept in v3. The receiver logs the event and returns a `Response` echoing the request-id; silence means loss, so the sender retransmits until the receipt arrives or a retry limit hits. Cost: two-plus packets with sender-side timers, versus one fire-and-forget Trap. Flow: `Agent ──Inform[req=55, linkDown, ifIndex=2]──> Manager` (lost) → retry with same id → `Manager <──Response[req=55, ok]── Agent`. Interpretation: the duplicate request-id marks the retry; delivery is now *confirmed* — the guarantee Trap cannot give.

### 3.17 Polling versus notifications

Polling = manager asks on a schedule (Get families). Notifications = agent speaks up alone (Trap/Inform). Every deployment uses both, because polling sees everything but late and at a cost (packets × objects × devices per cycle), while notifications are instant but narrow (one event each) and — for Traps — losable. Robust design treats Traps as *hints* and polling as *truth*: the Trap accelerates detection, the confirming poll establishes state, continued polling heals any lost Trap within one cycle. Poll state you must eventually know exactly (link status, counters); notify events you must know fast (linkDown, reboot) — Inform where confirmation is worth the overhead, Trap plus polling backstop otherwise. Example: 5-minute polls, link dies 02:14:07 — Trap arrives 02:14:08, confirming Get at 02:14:09 reads `down`; had the Trap died, the 02:15:00 poll still catches it — late, never silently missed.

### 3.18 Complete manager-agent examples

Read each line as who-sends → why → agent-does → result. Trace A is the manager-driven poll/configure loop; Trace B the agent-triggered notify/verify loop.

```text
Trace A — supervision plus a write:
1. Manager ──GetRequest[req=31, sysUpTime.0]──> Agent
   Manager <──Response[req=31, 3801224100]── Agent
2. Manager ──GetBulk[N=0,M=10, ifDescr, ifOperStatus]──> Agent
   Manager <──Response[5 descr + 5 status]── Agent; ifOperStatus.3 = down(2)
3. Manager ──SetRequest[req=33, ifAdminStatus.3=up(1)]──> Agent
   Manager <──Response[req=33, up(1)]── Agent
4. Manager ──GetRequest[req=34, ifOperStatus.3]──> Agent
   Manager <──Response[req=34, up(1)]── Agent

Trace B — 3 AM link failure:
1. 03:00:12 eth1 drops → Agent ──Trap[linkDown, ifIndex=2]──> Manager
2. Manager ──GetRequest[req=41, ifOperStatus.2]──> Agent
   Manager <──Response[req=41, down(2)]── Agent
3. Fibre fixed → Agent ──Inform[req=56, linkUp, ifIndex=2]──> Manager
   Manager <──Response[req=56, err=ok]── Agent
```

Interpretation: Trace A downloads a table in one round trip, writes, and verifies; Trace B detects in seconds and confirms — the manager polls *after* every Trap.

### 3.19 SNMPv1, v2c, and v3

Three generations sharing the same objects but differing in operations and security. SNMPv1 (1988): Get/GetNext/Set/Response/Trap, community strings, 32-bit counters, distinct Trap-PDU, sparse errors. SNMPv2c (1996, "community-based v2"): same communities plus GetBulk and Inform, Counter64, richer errors, unified Trapv2 PDU. SNMPv3 (1998/2004): all v2c operations, communities replaced by users, engine IDs, cryptographic parameters — USM plus VACM. v1 crawled tables one leaf per round trip, wrapped 32-bit counters in minutes on fast links, and could not confirm alarms — v2c fixed *efficiency*; cleartext passwords — v3 fixed *security*. Tell them apart: GetBulk or Inform → v2c+ (never v1); Counter64, Trapv2 → v2c+; users, auth/priv, USM, VACM → v3; "public/private" → v1/v2c.

| Generation | Operations | Counters | Trap shape | Security |
|---|---|---|---|---|
| SNMPv1 | Get/GetNext/Set/Response/Trap | 32-bit only | Special Trap-PDU (enterprise, agent-addr, generic/specific, timestamp) | Community, cleartext |
| SNMPv2c | Adds GetBulk + Inform; richer errors | Adds Counter64 | Unified Trapv2/Notification PDU | Community, cleartext (same weakness) |
| SNMPv3 | Same PDUs as v2c | Same as v2c | Same Trapv2/Inform as v2c | USM auth + privacy, VACM views, 3 levels |

Example: a 10 Gbps interface moves ~1.25 GB/s, wrapping a 32-bit byte counter in under 4 seconds — 5-minute polls alias badly, while Counter64 lasts centuries.

### 3.20 Authentication, integrity, encryption/privacy, and access control

Four distinct jobs, tested as a set. *Authentication* = proving who sent it (really from manager Alice). *Integrity* = proving it was not altered or replayed (keyed hash plus engine-time checks). *Confidentiality/privacy* = keeping content unreadable to eavesdroppers (encryption — SNMP's word is "privacy"). *Authorization/access control* = deciding what the principal may do (Alice reads interface stats but never writes hostnames) — enforced by VACM views. Without integrity an attacker flips "up" to "down" mid-flight; without privacy configs leak; without access control every authenticated user reconfigures every router. USM provides the first three (HMAC-MD5/SHA authentication, DES/AES privacy, engine-ID plus time-window replay protection); VACM provides the fourth (users → groups → MIB views → read/write/notify rights). Three security levels select per-message protection: noAuthNoPriv (username only), authNoPriv (authenticated, still readable), authPriv (authenticated plus encrypted). Example: sniffing a v2c Set exposes "private" — game over, the attacker forges Sets. Against v3 authPriv the sniffer sees ciphertext, cannot forge (no auth key), cannot replay (engine time rejects), cannot escalate (VACM denies the view).

::: callout-formula KTU Formula Vault: SNMP in 10 Lines
Agents **expose**, managers **poll/configure** (UDP 161/162) · SMI = **grammar**, MIB = **dictionary**, OID = **address** · **Get** (known) / **GetNext** (discover) / **GetBulk** (chunk, v2c+) · **Set** writes · **Response** answers · **Trap** (unconfirmed) / **Inform** (confirmed) · notify fast, **poll to confirm** · v1/v2c = **cleartext** · v3 = **USM auth+priv, VACM**.
:::

<a id="worked-example"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

One router, one manager. `GetRequest` uptime → `Response 440 days`. Unknown 3-port table: one `GetBulk` returns all descriptions plus statuses at once. Link dies → `Trap linkDown`; manager confirms `Get ifOperStatus.2 = down`, pushes `Set ifAdminStatus.2 = up` — over SNMPv3 authPriv in production.

### 4.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
An NMS must (a) read one counter, (b) discover all interface descriptions of unknown count, (c) download a 500-row table fast, (d) push a new hostname, (e) learn of link failure instantly with confirmation. Name each operation and the securing version.
:::

::: step [Step 2: Execution] Mapping Tasks to Operations
(a) Known OID → **GetRequest**. (b) Unknown length → **GetNextRequest** walk (stop at the prefix change) or GetBulk. (c) 500 rows → **GetBulkRequest** (v2c+). (d) Write → **SetRequest** on sysName.0. (e) Instant alarm → **Trap** for speed, **InformRequest** where confirmation is demanded — plus polling backstop.
:::

::: step [Step 3: Conclusion] Final Result
Get (reads), GetNext-walk (discovery), GetBulk (bulk, v2c+), Set (writes), Trap/Inform plus poll (fast vs confirmed alarms). Production rides **SNMPv3** — v2c cleartext fails any security question.
:::

<a id="distinctions"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| SMI vs. MIB vs. OID | Grammar for defining objects vs. OID tree of definitions vs. address of one object. |
| Get vs. GetNext vs. GetBulk | Known-OID read vs. next-OID discovery walk (one leaf, any version) vs. multi-leaf chunk (v2c+, N/M). |
| Trap vs. Inform | Unconfirmed fire-and-forget alarm (no Response) vs. confirmed alarm with Response receipt and retries. |
| Polling vs. notification | Scheduled reads (complete, late, costly) vs. agent alarms (instant, narrow; Trap losable). Hints vs. truth. |
| SNMP vs. NMS | Protocol language vs. the managing system that speaks it. |
| v2c vs. v3 | Same operations (Bulk/Inform/Counter64 in both); different security — cleartext vs. USM auth+priv with VACM. |
| Authentication vs. authorization vs. confidentiality vs. integrity | Who sent it (USM auth) vs. what they may do (VACM) vs. who can read it (privacy) vs. was it altered/replayed (hash + engine time). |

**Common misconceptions:** (1) The MIB is a stored database — it is a *virtual* naming agreement over live state. (2) Trap is the only unsolicited message — since v2c, Inform is equally unsolicited; the difference is confirmation. (3) Traps guarantee delivery — they are unacknowledged by design; Inform confirms, polling eventually discovers. (4) GetNext reads the next row — it returns the next OID in *lexicographic order*. (5) GetBulk is just faster GetNext — it changes round-trip complexity and needs N/M plus overshoot handling. (6) SMI adds types — it *removes* them for compatibility. (7) v2c is secure — its security equals v1's; only v3 adds auth/priv/access control. (8) Authentication implies authorization — VACM's separate job.

**Watch out:** (1) Trusting a Trap as delivered — pair with polling or use Inform. (2) Swapping SMI/MIB — grammar versus dictionary. (3) GetNext where hundreds of rows stress efficiency — that asks GetBulk. (4) v2c where security is mentioned — v3 authPriv only. (5) Setting a read-only object — check MAX-ACCESS first.

::: callout-exam KTU Exam Focus: One-Paragraph Recap
Agents expose, managers poll/configure in-band over UDP 161/162. SMI = grammar (counters wrap, gauges float); MIB = OID dictionary on live state (scalars end .0, tables append row indices). Idioms: Get (reads), GetNext-walk (discovery), GetBulk with N/M (bulk, v2c+), Set (writes), Response (values or error + index), Trap (unconfirmed), Inform (confirmed, retried). v1/v2c = cleartext (lab-only); v3 = USM auth + privacy with VACM views.
:::

**Active-recall checklist:** Which operation walks a table one leaf at a time, and which downloads it in chunks? What signal ends both walks? Which alarm is acknowledged, and what answers it? Why poll if Traps exist? What must never cross the wire in production? Mapping or database — what does an agent store?

::: toggle Counter32 wrap arithmetic (optional depth)
Counter32 holds 0 to 4294967295 then wraps; rate from two polls is `(new - old) mod 2^32 / seconds`. At 10 Gbps a byte counter wraps in seconds, so v2c added Counter64.
:::

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz What is the difference between SMI, MIB, and OID, and why do all three exist?
() Three competing protocols, one runs at a time
(*) SMI = defining grammar, MIB = OID-addressed dictionary, OID = one object's address
() MIB defines syntax; SMI stores live values
() SMI replaced MIB in SNMPv3
::: explanation
SMI standardizes specification (allowed types, OBJECT-TYPE fields, INDEX rules); each MIB module declares real counters and knobs in those rules; each declaration's OID addresses it globally.
:::

::: quiz A manager must download a 500-row table quickly and discover an unknown number of interfaces. Which operations fit?
() GetRequest for both, one OID at a time
(*) GetBulkRequest for the 500 rows, GetNextRequest walking for discovery — both stop at the OID prefix change
() SetRequest for both, then read back the echo
() Trap for both, since traps are fastest
::: explanation
Get reads known OIDs only. GetNext discovers one leaf per exchange — hundreds of round trips for 500 rows. GetBulk (v2c/v3 only) packs up to MaxRepetitions leaves per reply; the prefix change ends either walk. Traps never carry table contents.
:::

::: quiz A link fails at 3 AM. The NMS must learn within seconds AND be sure the alarm arrived. Which mechanism, and how does it differ from a Trap?
() GetNextRequest walk running continuously
(*) InformRequest — unsolicited but demands a Response receipt with retries; Traps fire unacknowledged
() SetRequest — write the link back up first
() Community-string rotation triggering alarms
::: explanation
Trap gives speed without confirmation; Inform gives speed with confirmation (receipt plus retries, costing state and packets). Use Trap hints plus polling truth, and Inform where one lost alarm is unacceptable.
:::

::: quiz Why did SNMPv3 become mandatory in security-conscious networks despite v2c working fine functionally?
() v3 transmits data faster than v2c
(*) v1/v2c communities cross the wire in cleartext with no encryption or access control; v3 adds USM auth plus privacy and VACM views
() v3 uses fewer packets per operation
() v2c cannot address more than 256 devices
::: explanation
Functionally v2c suffices; security-wise it ships keys with locks. USM fixes who-sent-it, was-it-altered (hash plus engine-time checks), can-anyone-read-it (DES/AES); VACM fixes what-they-may-do (views). Levels: noAuthNoPriv, authNoPriv, authPriv.
:::
