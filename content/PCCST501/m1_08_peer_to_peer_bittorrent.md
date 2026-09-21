---
id: m1_08_peer_to_peer_bittorrent
courseCode: PCCST501
module: 1
sequence: 8
title: 'P2P & BitTorrent: Distribution That Scales Itself'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Name swarm roles from overlay and tracker to seeds
  - Match rarest-first and tit-for-tat to the failures they fix
  - Evaluate the client-server versus P2P distribution-time bounds
  - Explain why P2P distribution time flattens as crowds grow
  - Self-test with the exam recap and active-recall checklist
concepts:
  - swarms
  - trackers
  - rarest-first
  - tit-for-tat
  - distribution-time bound
prerequisites:
  - m1_04_world_wide_web_and_http
  - m1_05_file_transfer_protocol_ftp
examRelevance: high
tags:
  - p2p
  - bittorrent
  - scalability
---
# P2P & BitTorrent: Distribution That Scales Itself

**Uploaders who multiply — overlays, trackers, rarest-first, tit-for-tat, and the distribution-time math where client-server collapses and P2P holds.**

<a id="the-intuition"></a>
## 1. The Real-World Situation — Start From Zero

A new 6 GB movie release drops. One million fans want it tonight. A single company server would have to upload 6 million GB — its pipe would choke for days. But what if every fan who finishes downloading immediately starts uploading to other fans? Then each arrival *adds* capacity, and the crowd serves itself.

The problem before the solution: bulk distribution to huge crowds breaks the client-server budget (server upload is fixed; demand is not). BitTorrent's answer is to convert downloaders into uploaders and organize them into a self-serving **swarm** — plus two clever rules that stop freeloading and starvation.

::: callout-intuition Core Mental Model: Potluck vs Soup Kitchen
Client-server is a **soup kitchen**: one stove (server upload $u_s$) feeds every hungry arrival — double the crowd, double the wait. P2P is a **potluck**: each arrival brings a dish (its own upload $u_i$) and shares bites immediately (rarest-first), so the crowd *is* the capacity. BitTorrent's miracle is arithmetic, not altruism: total upload grows with $N$ while the file stays fixed.

Dropping the kitchen now: $u_s$ = server upload rate, $u_i$ = peer $i$'s upload rate, $F$ = file size, $N$ = number of peers — the symbols of the bound derived below.
:::

Pure P2P (no always-on server) versus the client-server Web/FTP of M1.4–M1.5 — same files moving, inverted capacity economics.

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Swarm** | The set of all peers currently sharing one file. |
| **Overlay (network)** | The logical peer-to-peer links running on top of ordinary TCP connections. |
| **Tracker** | A matchmaking server that introduces peers to each other — it never carries file bytes. Decentralized alternatives (magnet links, DHT — Distributed Hash Table) remove even this server. |
| **Torrent** | The metadata file (piece list + cryptographic hashes) describing the shared content. |
| **Peer / leech** | A participant still downloading (leech = historical term for incomplete peers). |
| **Seed** | A peer holding the complete file and uploading only. |
| **Rarest-first (piece selection)** | Always fetch the piece fewest neighbours hold — keeps piece diversity high, preventing last-piece starvation. |
| **Tit-for-tat / choking** | Upload preferentially to peers that upload back to you; **choke** (refuse) freeloaders; **optimistic unchoke** periodically tries newcomers. |
| **Distribution time $D$** | Seconds until the *last* peer holds the full file — the quantity both architectures bound below. |

<a id="the-math"></a>
## 3. Purpose — Swarm Mechanics, Then the Bound Symbol by Symbol

### 3.1 Operation Flow: Swarm Anatomy

**Overlay** (logical links atop TCP), **tracker** (introduces peers; magnet/DHT links decentralize even this), **torrent** (metadata + piece hashes), **peers/leeches** (downloading), **seeds** (complete, uploading). **Rarest-first** piece selection keeps diversity high (no last-piece starvation); **tit-for-tat/choking** uploads to the fastest reciprocators (optimistic unchoke probes newcomers) — freeloaders get choked by design.

::: toggle What do `swarm`, `tracker` and `seed` mean?
A `swarm` is all peers sharing one file right now, linked by an `overlay` of logical TCP connections.
A `tracker` only introduces peers to each other and never carries file bytes, while a `seed` holds the full file and uploads only.
Tiny example: a new peer asks the tracker for 50 neighbours, then downloads pieces from them, not from the tracker.
:::

::: toggle What do `rarest-first` and `tit-for-tat` fix?
`Rarest-first` always fetches the piece fewest neighbours hold, so no last rare piece starves the swarm.
`Tit-for-tat` uploads preferentially to peers that upload back, choking freeloaders, with `optimistic unchoke` probing newcomers.
Tiny example: a peer with only common pieces hunts the one rare chunk first, and a leecher that shares nothing soon gets choked.
:::

### 3.2 Distribution-Time Bound — Symbols First

Symbols: $F$ = file size (bits), $u_s$ = server/seed upload rate (bits/s), $u_i$ = upload rate of peer $i$, $N$ = number of peers, $d_{min}$ = slowest peer download rate.

* Client-server lower bound: $D_{cs} \ge \max(NF/u_s, F/d_{min})$. Term 1: the lone server must push $N$ copies. Term 2: the slowest downloader cannot finish before one file's worth at its own rate.
* P2P lower bound: $D_{p2p} \ge \max(F/u_s, F/d_{min}, NF/(u_s + \sum u_i))$. Terms 1–2 as above (seed must inject one copy; slowest peer still slowest). Term 3 is the potluck: *aggregate* upload (server + all peers) absorbs the crowd's $N$ copies.

::: toggle What do `F`, `u_s`, `u_i` and `D` mean?
`F` is file size in bits, `u_s` is the server or seed upload rate, each `u_i` is peer `i` upload rate, and `D` is seconds until the last peer finishes.
Why they matter: client-server needs `N` copies from `u_s` alone, while P2P spreads `N` copies over `u_s` plus all `u_i`.
Tiny example: `F` 6 units with `u_s` 2 and three peers at 1 gives P2P `max(3, 3.6)` equals 3.6 seconds.
:::

::: callout-formula KTU Formula Vault: P2P
Tracker introduces, DHT decentralizes · rarest-first diversifies · tit-for-tat rewards reciprocators, chokes freeloaders · $D_{p2p} \ge \max(F/u_s, NF/(u_s+\sum u_i))$ (downloads ample).
:::

Choking is *not* punishment of slow links per se — it rations upload toward contributors; a slow-but-sharing peer still eats via optimistic unchokes.

::: callout-pitfall Tracker Worship
The tracker introduces peers; it never touches file bytes (data flows peer-to-peer). An option routing downloads *through* the tracker mistakes the matchmaker for the warehouse — kill the tracker mid-swarm and transfers continue.
:::

<a id="worked-example"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

File $F = 2$ units, server $u_s = 1$/s, $N = 1$ peer uploading $1$/s. Client-server: $D_{cs} = \max(2/1) = 2$s. P2P: aggregate $= 2$/s, $D_{p2p} = \max(2/1, 2/2) = \max(2, 1) = 2$s — with one peer the seed term binds and both tie. Add a second peer ($+1$/s): kitchen $D_{cs} = 4/1 = 4$s; potluck $D_{p2p} = \max(2, 4/3) = 2$s — the gap opens exactly when the crowd arrives.

### 4.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
File $F = 6$ units, server upload $u_s = 2$/s, $N = 3$ peers each uploading $1$/s, downloads ample ($d_{min} = \infty$ effectively). Compute client-server vs P2P lower-bound distribution times.
:::

::: step [Step 2: Execution] Kitchen vs Potluck
Client-server: $D_{cs} = \max(3 \times 6/2, \dots) = \max(9, \dots) = 9$s — the lone stove serves $18$ unit-servings at rate $2$. P2P: aggregate upload $= 2 + 3 = 5$/s; $D_{p2p} = \max(6/2, 18/5) = \max(3, 3.6) = 3.6$s. Same file, same wires — $9$s vs $3.6$s purely from counting peer uploads as capacity.
:::

::: step [Step 3: Conclusion] Final Result
$9$s client-server against $3.6$s P2P lower bound. Add a fourth peer ($+1$/s): kitchen stays $12$s ($24/2$), potluck drops toward $24/6 = 4$s... check: $NF = 24$, aggregate $6$ → $4$s vs kitchen $12$s — the gap *widens* with $N$: self-scalability, quantified.
:::

<a id="exam-recap"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| Tracker vs. seed | Tracker introduces (no bytes); seeds/peers carry bytes. |
| Rarest-first vs. tit-for-tat | Cures piece starvation (diversity) vs. cures freeloading (incentives). |
| $D_{cs}$ vs. $D_{p2p}$ | Kitchen scales as $N$ (fixed server); potluck's crowd term flattens toward $F/\bar{u}$. |
| Choking vs. punishing slowness | Rations toward contributors; slow sharers still eat via optimistic unchoke. |

**Watch out:** (1) Routing bytes through the tracker — it only introduces. (2) Applying the aggregate term without the seed term — take the max of *all* terms; either can bind. (3) Calling tit-for-tat a starvation fix — starvation is rarest-first's disease.

::: callout-exam KTU Exam Focus: One-Paragraph Recap
Swarm = overlay + tracker (or DHT) + torrent metadata + peers + seeds. Rarest-first diversifies pieces; tit-for-tat/choking enforces reciprocity. Bounds: $D_{cs} \ge NF/u_s$ vs. $D_{p2p} \ge \max(F/u_s, NF/(u_s+\sum u_i))$ — source load $O(N)$ vs. $O(1)$, the economic argument for P2P live distribution.
:::

**Active-recall checklist:** What does the tracker never touch? Which mechanism fixes freeloading vs. last-piece starvation? Write both bounds from memory and name each term. Why does the potluck gap widen with $N$?

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Q1: Bound Arithmetic
$F = 10$, $u_s = 5$/s, $4$ peers at $5$/s each, ample downloads. P2P lower bound?
(A) $8$s, kitchen math
(*B) $\max(10/5, 40/25) = \max(2, 1.6) = 2$s — the server-seed term ($2$s) binds here, since aggregate upload ($25$/s) already outruns the seed's own injection
(C) $1.6$s, aggregate term always wins
(D) $10$s, file size alone
::: explanation
Evaluate all three terms and take the max — binding terms vary by regime. Here the seed injects at $5$/s so nothing finishes before $2$s; the crowd term ($1.6$s) is slack. Max, never cherry-pick.
:::

::: quiz Q2: Mechanism Matching
Last-piece starvation (everyone waits on one rare chunk) versus freeloading (download, never upload). Fixes?
(A) Faster tracker for both
(*B) Rarest-first cures starvation (diversity pressure spreads rare pieces first); tit-for-tat choking cures freeloading (upload buys download) — one mechanism per disease, mismatched pairs fix nothing
(C) Bigger pieces for both
(D) More seeds, no protocol needed
::: explanation
Starvation is a *diversity* failure, freeloading an *incentive* failure. Piece policy fixes the first, reciprocity the second — naming which-breaks-what is the whole P2P design story.
:::

::: quiz Q3: Scaling Contrast
$N$ doubles with fixed file and fixed per-peer upload. Kitchen vs potluck trend?
(A) Both flat
(*B) Kitchen time doubles ($NF/u_s$ linear in $N$); potluck's crowd term $NF/(u_s + N\bar{u})$ flattens toward $F/\bar{u}$ — servers choke on crowds, swarms absorb them
(C) Both double
(D) Potluck doubles faster
::: explanation
Limits tell the tale: kitchen $\sim N$, potluck $\sim F/\bar{u}$ asymptotically. One architecture's cost driver is the other's capacity — the single exam sentence that earns the scaling marks.
:::
