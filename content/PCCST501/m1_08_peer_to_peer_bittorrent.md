# P2P & BitTorrent: Distribution That Scales Itself

**Uploaders who multiply — overlays, trackers, rarest-first, tit-for-tat, and the distribution-time math where client-server collapses and P2P holds.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Potluck vs Soup Kitchen
Client-server is a **soup kitchen**: one stove (server upload $u_s$) feeds every hungry arrival — double the crowd, double the wait. P2P is a **potluck**: each arrival brings a dish (its own upload $u_i$) and shares bites immediately (rarest-first), so the crowd *is* the capacity. BitTorrent's miracle is arithmetic, not altruism: total upload grows with $N$ while the file stays fixed.
:::

Pure P2P (no always-on server) versus the client-server Web/FTP of M1.4–M1.5 — same files moving, inverted capacity economics.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Swarm anatomy

**Overlay** (logical links atop TCP), **tracker** (introduces peers; magnet/DHT links decentralize even this), **torrent** (metadata + piece hashes), **peers/leeches** (downloading), **seeds** (complete, uploading). **Rarest-first** piece selection keeps diversity high (no last-piece starvation); **tit-for-tat/choking** uploads to the fastest reciprocators (optimistic unchoke probes newcomers) — freeloaders get choked by design.

### 2.2 Distribution-time bound

File $F$, server $u_s$, $N$ peers with uploads $u_i$ (downloads assumed ample): client-server $D_{cs} \ge \max(NF/u_s, F/d_{min})$; P2P lower bound $D_{p2p} \ge \max(F/u_s, F/d_{min}, NF/(u_s + \sum u_i))$. The third term is the potluck: aggregate upload absorbs the crowd.

::: callout-formula KTU Formula Vault: P2P
Tracker introduces, DHT decentralizes · rarest-first diversifies · tit-for-tat rewards reciprocators, chokes freeloaders · $D_{p2p} \ge \max(F/u_s, NF/(u_s+\sum u_i))$ (downloads ample).
:::

Choking is *not* punishment of slow links per se — it rations upload toward contributors; a slow-but-sharing peer still eats via optimistic unchokes.

::: callout-pitfall Tracker Worship
The tracker introduces peers; it never touches file bytes (data flows peer-to-peer). An option routing downloads *through* the tracker mistakes the matchmaker for the warehouse — kill the tracker mid-swarm and transfers continue.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
File $F = 6$ units, server upload $u_s = 2$/s, $N = 3$ peers each uploading $1$/s, downloads ample ($d_{min} = \infty$ effectively). Compute client-server vs P2P lower-bound distribution times.
:::

::: step [Step 2: Execution] Kitchen vs Potluck
Client-server: $D_{cs} = \max(3 \times 6/2, \dots) = \max(9, \dots) = 9$s — the lone stove serves $18$ unit-servings at rate $2$. P2P: aggregate upload $= 2 + 3 = 5$/s; $D_{p2p} = \max(6/2, 18/5) = \max(3, 3.6) = 3.6$s. Same file, same wires — $9$s vs $3.6$s purely from counting peer uploads as capacity.
:::

::: step [Step 3: Conclusion] Final Result
$9$s client-server against $3.6$s P2P lower bound. Add a fourth peer ($+1$/s): kitchen stays $12$s ($24/2$), potluck drops toward $24/6 = 4$s... check: $NF = 24$, aggregate $6$ → $4$s vs kitchen $12$s — the gap *widens* with $N$: self-scalability, quantified.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
