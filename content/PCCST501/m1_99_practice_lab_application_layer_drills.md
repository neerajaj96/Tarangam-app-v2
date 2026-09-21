---
id: m1_99_practice_lab_application_layer_drills
courseCode: PCCST501
module: 1
sequence: 99
title: 'Module 1 Practice Lab: Application-Layer Drills'
difficulty: intermediate
estimatedMinutes: 10
learningObjectives:
  - Trace full web fetches across DNS, TCP, HTTP and sockets
  - Contrast FTP per-file channels against persistent HTTP reuse
  - Decide client-server against peer-to-peer by workload shape
  - Self-test with the exam recap and active-recall checklist
concepts:
  - application-layer scenarios
  - connection economy
  - architecture selection
prerequisites:
  - m1_01_internet_overview_and_network_edge
  - m1_04_world_wide_web_and_http
  - m1_05_file_transfer_protocol_ftp
  - m1_07_domain_name_system_dns
  - m1_08_peer_to_peer_bittorrent
examRelevance: high
tags:
  - application-layer
  - m1-lab
---
# Module 1 Practice Lab: Application-Layer Drills

**Scenario dissections combining every M1 tool, do-not-confuse cheat tables, mixed active recall, and KTU 7-mark model solutions.**

<a id="the-intuition"></a>
## 1. Step-by-Step Scenario Analysis

Read each scenario as a chain: name every mechanism (DNS — Domain Name System; TCP — Transmission Control Protocol; HTTP — HyperText Transfer Protocol; FTP — File Transfer Protocol; P2P — peer-to-peer), in order, with the reason each link is needed. If you cannot justify a step aloud, re-read its home note first — this lab assumes the vocabulary of M1.1–M1.8 throughout.

### Scenario 1: The Full Web Fetch (Everything at Once)

You type `http://example.com/page.html` (one embedded image) into a browser on dorm Wi-Fi and press Enter. Name every M1 mechanism engaged, in order:

1. **DNS** (application, UDP — User Datagram Protocol — port 53): resolve `example.com` → IP (recursive query outward, cached answer back).
2. **TCP handshake** to port 80 (transport): SYN → SYNACK → ACK — reliable channel before a single HTTP byte.
3. **HTTP GET** (application, persistent): request line + headers over the TCP connection; server responds `200 OK` + HTML; the embedded image reuses the *same* connection (persistent — 1 connection total, not 2).
4. **Sockets**: browser's ephemeral port ↔ server port 80 (the 4-tuple demultiplexes the reply to the right tab).
5. **Access**: dorm Wi-Fi (wireless access) → FTTH (Fiber to the Home) fiber (guided) → core routers (packet switches) — nuts-and-bolts path hidden by the service view.

### Scenario 2: FTP Backup vs. HTTP Upload

Nightly backup of 100 small files to a campus server. FTP: **1 control connection** + **100 data connections** (one per file — connection churn dominates!). HTTP/1.1 persistent POSTs: **1 connection** reused 100 times. Verdict: FTP's per-file data channel is pure overhead here — HTTP wins on connection economy (though FTP's out-of-band control + statefulness serve interactive browsing better).

### Scenario 3: Dorm Movie Night (P2P or Server?)

50 students, one 4 GB movie file, one dorm server with 100 Mbps uplink. Client-server: server streams 4 GB × 50 = 200 GB through its 100 Mbps pipe (~4.4 hours wall-clock for the crowd). P2P: each downloader re-uploads — aggregate capacity *grows* with the crowd (self-scalability); the server seeds once and idles. Decision rule from M1: centralized control/consistency → client-server; bulk distribution to many → P2P.

<a id="the-dimensions"></a>
## 2. "Do Not Confuse" Cheat Table

| Pair | Distinction that earns marks |
|---|---|
| End system vs. packet switch | Hosts run apps at the edge (originate/consume); switches forward inside (never originate) |
| Client vs. server | *Roles*, not devices — one laptop plays both across two apps |
| Nuts-and-bolts vs. service view | How it's built (links/switches) vs. what apps get (byte-moving platform) |
| TCP vs. UDP | 4-tuple reliable streams vs. 2-tuple datagrams; handshake/state vs. fire-and-forget |
| Non-persistent vs. persistent HTTP | One TCP connection per object vs. one reused (6 vs. 1 in the worked example) |
| Stateless vs. stateful | HTTP remembers nothing (cookies work around it); FTP tracks directory + login per session |
| In-band vs. out-of-band | HTTP mixes control+data in one connection; FTP splits Port 21 control from Port 20 data (active-mode server side) |
| Active vs. passive FTP | Server connects back (firewall-blocked) vs. client always dials out (firewall-friendly) |
| PDU (Protocol Data Unit) names | Message → Segment → Datagram → Frame → Bits, top-down, never scrambled |
| OSI 7 vs. TCP/IP 5 | Model vocabulary (Presentation/Session named) vs. running code (top three merged) |
| HTTP transport versions | Classical HTTP (≤2) over TCP; HTTP/3 over QUIC (UDP-based) — qualify "always TCP" |

**Watch out:** (1) Counting data connections while ignoring the control channel (or vice versa) — tally both, every question. (2) Sending DNS straight to the root — users ask resolvers. (3) Recommending POP3-style single-device habits for multi-device scenarios — match state location to the workload.

<a id="self-check"></a>
## 3. Active Recall Quizzes

::: quiz A page has HTML + 4 images over HTTP/1.1 persistent. An identical page loads over FTP-style per-object data connections (1 control + fresh data channel per file). Count user-data connections each way, ignoring control.
() 5 vs. 5 — identical by conservation of data
(*) HTTP: 1 reused connection; FTP-style: 5 fresh data connections — same bytes, 5× the handshakes
() HTTP: 5; FTP-style: 1
() Both use exactly 2 connections always
::: explanation
Persistent HTTP amortizes one handshake across all objects ($N$ objects, 1 connection); per-file channels pay $N$ handshakes + teardowns for identical payloads. Connection economy, not byte economy, is the persistent advantage — Scenario 2's verdict generalized.
:::

::: quiz Two laptops run a video call (UDP) and a file download (TCP) simultaneously on one host. A packet arrives at the host's IP. What decides whether it reaches the call or the download, and which header field does the job?
() Arrival order — first packet goes to whichever app asked first
(*) Destination port (+ protocol): the UDP datagram's port steers to the call's socket, the TCP segment's port to the download's socket — demultiplexing keys, with TCP additionally separating by full 4-tuple
() The IP address alone, since each app has its own IP
() Packet size — video packets are always larger
::: explanation
One IP, many processes: ports disambiguate (UDP 2-tuple, TCP 4-tuple). Same-port-different-protocol traffic even coexists (DNS:53/UDP vs. hypothetical :53/TCP) because the protocol number joins the key. Scenario 1's tab-routing, restated.
:::

::: quiz "FTP is stateful, HTTP is stateless, therefore FTP servers always outperform HTTP servers." Identify every error in this claim.
() There are no errors — the claim is textbook-correct
(*) Direction inverted (statefulness costs scalability: per-session memory caps simultaneous users — stateless HTTP scales better), plus a category error (performance follows workload/architecture, never the stateful label alone)
() FTP is actually stateless and HTTP stateful
() Performance is identical for all protocols by law
::: explanation
State is *overhead*: FTP's per-user directory/auth memory grows with connections, bounding scale; HTTP's amnesia is precisely what lets one server juggle thousands of independent requests. "Stateful ⇒ faster" reverses the engineering tradeoff — state buys *continuity*, statelessness buys *scale*.
:::

::: quiz An FTP client behind a strict firewall must download files; active mode fails. What exactly fails, and what is the minimal fix preserving all functionality?
() The control connection fails; fix by switching to HTTP
(*) The server's inbound data connection to the client's random port is rejected as unsolicited traffic; fix with PASV — the client opens the data connection outbound to a server-provided port, same files, same control channel
() The client's login credentials expire behind firewalls
() Nothing fails; active mode ignores firewalls by design
::: explanation
Active's server→client data leg looks exactly like an attack to a stateful firewall. PASV inverts initiation (client always dials out — permitted) while changing nothing semantically: same control connection, same bytes, same commands, zero firewall exceptions needed.
:::

<a id="exam-focus"></a>
## 4. High-Yield University Exam Questions

::: callout-exam KTU University Exam Focus
**Target Areas:**
* **3 Marks:** Any single row of the §2 cheat table (PDU order and demux keys are the most asked).
* **7 Marks:** Scenario traces (fetch/IPC decision like Scenarios 1–3) demanding multi-concept chains with justification.
:::

### Essay Question 1 (7 Marks)
**Q: A browser fetches a page with 3 embedded images over persistent HTTP/1.1 on dorm Wi-Fi. (a) How many TCP connections? Contrast with non-persistent. (b) Name the access networks, the socket 4-tuple roles, and where statelessness matters.**

**Model Answer:** (a) Persistent: **1** connection reused for HTML + 3 images; non-persistent: **4** (one per object) — each extra handshake costs an RTT (Round-Trip Time). (b) Wi-Fi (unguided access) → FTTH (guided) → core packet switches; client ephemeral port + server port 80 demultiplex the reply (4-tuple); statelessness means the server keeps no inter-request memory — cookies would be needed for any login/cart state across the four fetches.

### Essay Question 2 (7 Marks)
**Q: "FTP separates control and data; HTTP mixes them." Explain both designs, compare connection counts for downloading 3 files plus browsing, and justify when each design wins.**

**Model Answer:** FTP: Port-21 control (login/CWD — change working directory /RETR — retrieve, session-long) + one data channel per file → 1 control + 3 data for the task; browsing state (directory, auth) persists server-side. HTTP: each request/response (headers + payload) shares one TCP connection, stateless. FTP wins interactive file management (stateful navigation, separate heavy channel); HTTP wins object fetching (no per-file handshake tax, massive stateless scale). Design follows workload — the module's master lesson.
