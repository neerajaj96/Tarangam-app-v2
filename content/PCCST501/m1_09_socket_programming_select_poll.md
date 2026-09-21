---
id: m1_09_socket_programming_select_poll
courseCode: PCCST501
module: 1
sequence: 9
title: 'Socket Programming: TCP/UDP Client-Server, Select, Poll & Packet Sockets'
difficulty: beginner
estimatedMinutes: 14
learningObjectives:
  - State the multi-client serving problem in plain words first
  - Name every socket-API call and its exact role in TCP and UDP flows
  - Trace a TCP client-server exchange call by call
  - Multiplex many clients with select and poll without threads
  - Contrast blocking, non-blocking, and readiness-based advanced I/O
  - Place SOCK_PACKET and PF_PACKET packet sockets correctly
concepts:
  - socket API
  - TCP client-server calls
  - select and poll
  - non-blocking I/O
  - packet sockets
prerequisites:
  - m1_03_application_layer_paradigms
examRelevance: high
tags:
  - sockets
  - select-poll
  - client-server
---
# Socket Programming: TCP/UDP Client-Server, Select, Poll & Packet Sockets

**What problem one server serving many clients poses, what a socket (a communication endpoint) plus its Address Family names, how Transmission Control Protocol (TCP) and User Datagram Protocol (UDP) client-server calls sequence, how `select` and `poll` multiplex without threads, what non-blocking and readiness-based advanced Input/Output (I/O) add, and where `SOCK_PACKET` and `PF_PACKET` packet sockets sit.**

<a id="situation"></a>
## 1. The Real-World Situation — Start From Zero

A web server handles a hundred browsers at once with one program. The problem before any solution: the network delivers bytes, but programs need named endpoints, ordered conversations, and a way to wait on many conversations simultaneously without hiring a thread per browser.

Tiny beginner example. Browser wants page from server at Internet Protocol (IP) address `93.184.216.34`, port `80`. The browser creates a socket (its end of the wire), connects it to that address plus port, sends `GET /`, reads the reply, closes. The server earlier created a listening socket bound to port `80`, and for this browser it accepts a fresh connected socket dedicated to exactly this conversation. One listening socket births one connected socket per browser — the pattern every flow below repeats.

::: callout-intuition Core Mental Model: Telephones With Many Lines
A socket is a telephone handset: `socket()` buys the handset, `bind()` prints your number on it, `listen()` puts it on the hook waiting for rings, `accept()` picks up one ringing line onto a fresh handset (the original keeps ringing for others), `connect()` dials out, `send`/`recv` talk, `close()` hangs up. `select`/`poll` is the receptionist watching fifty blinking lines and tapping you only for the ones with someone speaking — one clerk, many calls, no thread per line.

Dropping the phones now: socket = kernel communication endpoint indexed by a file descriptor; address = (IP, port) pair; connection = bound pair of sockets with TCP state; multiplexing = one thread serving many ready descriptors.
:::

<a id="terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **Socket** | Kernel endpoint for communication, named by an integer file descriptor; created per conversation end. |
| **Address family (`AF_INET` vs `AF_INET6`)** | Which address format the socket speaks: `AF_INET` = IPv4 32-bit addresses, `AF_INET6` = IPv6 128-bit addresses. Chosen at `socket()` and fixed for life. |
| **Socket type (`SOCK_STREAM` vs `SOCK_DGRAM`)** | Conversation semantics: `SOCK_STREAM` = TCP byte stream (connected, reliable, ordered); `SOCK_DGRAM` = UDP datagrams (connectionless, one message per call). |
| **Port** | 16-bit process apartment number on a host (web servers conventionally listen on port 80); IP names the building, port the door. |
| **`bind` / `listen` / `accept` / `connect`** | Server claims a port (`bind`), queues incoming dials (`listen`), adopts one dial onto a new socket (`accept`); client dials (`connect`). |
| **`select` / `poll`** | Single-thread multiplexers: block until some descriptor in a watched set is readable/writable, then report which — no busy loop, no thread per client. |
| **Blocking vs non-blocking I/O** | Blocking calls sleep until done; non-blocking calls return immediately with `EWOULDBLOCK` when nothing is ready (polled or multiplexed instead). |
| **`SOCK_PACKET` / `PF_PACKET`** | Packet sockets bypassing TCP/UDP to read/write raw link-layer frames: legacy `SOCK_PACKET` vs modern `PF_PACKET` family with `SOCK_RAW`. Sniffers live here, not in applications. |

<a id="purpose-flows"></a>
## 3. Purpose — The Call Sequences (Operation Flow)

### 3.1 TCP Server and Client, Call by Call

Server (passive, serves many), numbered:

1. `sock = socket(AF_INET, SOCK_STREAM, 0)` — buy a TCP handset (IPv4).
2. `bind(sock, address, port)` — print your number (claim the port; needs privilege below 1024).
3. `listen(sock, backlog)` — hook the phone, queue up to `backlog` unaccepted dials.
4. Loop: `conn = accept(sock)` — sleep until a dial arrives, then birth a fresh connected socket `conn` for exactly this client (listening socket stays open for the next dial).
5. `recv(conn)` / `send(conn)` — talk until done; `close(conn)` — hang up this conversation only.

Client (active, dials once):

1. `sock = socket(AF_INET, SOCK_STREAM, 0)` — buy a handset (no `bind` needed; the kernel picks an ephemeral port).
2. `connect(sock, serverIP, serverPort)` — dial; blocks through the three-way handshake (SYN, SYN-ACK, ACK).
3. `send(sock, request)` / `recv(sock, reply)` — talk; `close(sock)` — hang up.

Message structure note: TCP exposes a byte stream, not packets — one `send` may arrive as several `recv` chunks (or several sends coalesce). Framing (where one reply ends) is the application's job (length prefix or delimiter), unlike UDP below.

### 3.2 UDP, Call by Call (Connectionless Contrast)

No handshake, no `listen`/`accept`, no streams. Server: `socket(AF_INET, SOCK_DGRAM, 0)`, `bind(port)`, then loop `recvfrom(sock)` (returns data plus sender address) and `sendto(sock, reply, clientAddress)`. Client: `socket(SOCK_DGRAM)`, then `sendto(server)` / `recvfrom()` directly. Each call is one datagram: sent whole, delivered whole or not at all, possibly lost or reordered. Domain Name System (DNS) lives here precisely because one question plus one answer fits one round trip with no setup cost.

| Similar pair | Distinction that earns marks |
|---|---|
| TCP vs UDP sockets | `SOCK_STREAM` + `listen`/`accept`/`connect` + streams vs `SOCK_DGRAM` + `sendto`/`recvfrom` + datagrams |
| Listening vs connected socket | Original stays ringing for new dials vs `accept`'s child talks to exactly one client |
| `bind` on server vs client | Server must `bind` its famous port; client usually skips it (ephemeral auto-port) |

```c
/* Minimal TCP server skeleton (IPv4, error checks omitted for reading). */
int ls = socket(AF_INET, SOCK_STREAM, 0);
bind(ls, &server_addr, sizeof(server_addr));
listen(ls, 16);
for (;;) {
    int conn = accept(ls, &cli_addr, &cli_len);
    recv(conn, buf, sizeof(buf), 0);
    send(conn, reply, reply_len, 0);
    close(conn);
}
```

Read it line by line: buy, name, queue, then forever adopt-talk-hangup per client. The loop is iterative (one conversation at a time) until §3.3 multiplexes it.

### 3.3 Multiplexing With `select` and `poll` (One Thread, Many Clients)

The iterative loop above stalls: while talking to a slow client, new dials queue unanswered. Threads are one cure; multiplexing is the cheaper one — ask the kernel "which of these fifty descriptors is ready?" and touch only those.

`select` mechanics, numbered:

1. Build watched sets (`fd_set` for readable, writable, exceptional) plus `maxfd + 1` (highest descriptor plus one — the kernel scans `0..maxfd`).
2. Call `select(maxfd+1, &readfds, &writefds, NULL, &timeout)` — sleep until some descriptor is ready or the timeout expires.
3. Scan the returned sets; every still-set bit is ready now — `accept`/`recv`/`send` on it without blocking.
4. Rebuild sets before every call (`select` overwrites them) — the classic exam trap.

`poll` mechanics (same idea, cleaner interface): fill an array of `struct pollfd { fd, events, revents }` with wanted `events` (`POLLIN` readable, `POLLOUT` writable); call `poll(fds, nfds, timeout)`; read back `revents` per descriptor. No `maxfd` scan bound, no set-rebuild ritual, same readiness contract. Both are level-triggered (a still-ready descriptor reports ready on every call until drained — contrast edge-triggered `epoll`, out of syllabus but examinable as a named contrast).

Worked trace (30 seconds): descriptors `{3: listener, 5: clientA, 7: clientB}`. `select` returns readable `{3, 7}`. Step 1: `accept(3)` births `conn 9` for the new dial. Step 2: `recv(7)` reads clientB's arrived bytes. Step 3: descriptor 5 untouched (nothing ready — no wasted thread, no busy spin). Loop rebuilds sets and sleeps again.

### 3.4 Advanced I/O: Non-Blocking and Readiness Discipline

**Non-blocking sockets** (`O_NONBLOCK` via `fcntl`) never sleep: `accept`/`recv`/`send` return immediately, with `-1`/`EWOULDBLOCK` when nothing is ready. Discipline: pair them with `select`/`poll` (wait for readiness, then issue exactly the ready calls), never with spin loops (burns CPU for zero bytes). Partial sends complete the picture: non-blocking `send` may write fewer bytes than asked — loop on the remainder, still readiness-gated. Blocking-plus-multiplexing is the KTU default (simple, correct); non-blocking-plus-multiplexing is the scale pattern (many idle connections, one thread).

### 3.5 Packet Sockets: `SOCK_PACKET` and `PF_PACKET`

Applications normally see TCP/UDP payloads; sniffers and custom stacks need raw frames (Ethernet headers included). Legacy Linux offered `socket(AF_INET, SOCK_PACKET, ...)` — deprecated, link-layer access through an IPv4-mapped hack. Modern code uses the `PF_PACKET` family: `socket(PF_PACKET, SOCK_RAW, htons(ETH_P_ALL))` delivers every received frame with its link header, and `sendto` transmits crafted frames. Examinable placement: packet sockets bypass the transport layer entirely (no ports, no TCP state — the program parses Ethernet/IP/TCP itself), require privilege, and belong to measurement tools (`tcpdump` family), never to web or mail applications. Confusing `SOCK_STREAM` with `SOCK_RAW` mistakes streams for frames — the exam's favourite one-word trap.

<a id="examples"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

One server port `80`, two browsers. Browser A connects → server `accept` returns `connA`; browser B connects → `accept` returns `connB`; listening socket never talks, only births. `select` watches `{listener, connA, connB}` and wakes only for ready ones — the whole multi-client trick in three descriptors.

### 4.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
A TCP server's `select` watches listener `fd 3` plus connected clients `fd 5` and `fd 7`. `select` returns readable `{3, 7}`. (a) Which calls run next, in what order discipline? (b) A UDP peer instead wants one question plus one answer with no setup — which calls, and why no `listen`?
:::

::: step [Step 2: Execution] Dispatching Readiness
(a) Readable listener means a pending dial: `accept(3)` first (birth `conn 9`, keep listening). Readable `7` means arrived bytes: `recv(7)` next. Descriptor `5` is untouched — readiness, not round-robin, schedules work. Sets are rebuilt before the next `select` (overwrite trap). (b) UDP: `socket(SOCK_DGRAM)` + `sendto(server)` + `recvfrom()` — datagrams need no handshake, so `listen`/`accept`/`connect` have nothing to set up; DNS-scale single exchanges ride exactly this triple.
:::

::: step [Step 3: Conclusion] Final Result
Three ready bits became two exact calls (`accept`, `recv`) with zero thread wakeups and zero spins — multiplexing's contract. UDP's triple is the connectionless mirror: name the destination per message, skip every stream call, accept loss as the price of zero setup.
:::

<a id="exam-recap"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| `SOCK_STREAM` vs `SOCK_DGRAM` | TCP streams + `listen`/`accept`/`connect` vs UDP datagrams + `sendto`/`recvfrom` |
| Listening vs connected socket | Rings for all vs talks to one; `accept` births the talker |
| `select` vs `poll` | `fd_set` + `maxfd` + rebuild ritual vs `pollfd` array + `revents`, same level-triggered contract |
| Blocking vs non-blocking | Sleep until done vs instant `EWOULDBLOCK`; pair non-blocking with readiness, never spins |
| `SOCK_PACKET` vs `PF_PACKET` | Deprecated IPv4-mapped hack vs modern raw-frame family (`SOCK_RAW`, needs privilege) |

**Watch out:** (1) Forgetting `select` overwrites its sets — rebuild every loop. (2) Expecting TCP message boundaries — streams coalesce and split; frame in the application. (3) `bind`ing the client to a famous port — ephemeral auto-ports are the norm. (4) Calling `SOCK_PACKET` modern — it is legacy; `PF_PACKET` + `SOCK_RAW` is the current answer. (5) Spinning on non-blocking sockets — readiness-gate every retry.

::: callout-exam KTU Exam Focus: One-Paragraph Recap
TCP server: `socket` → `bind` → `listen` → loop `accept`/`recv`/`send`/`close`; client: `socket` → `connect` → `send`/`recv` → `close`. UDP: `socket` → `bind` (server) → `sendto`/`recvfrom`, no handshake. `select(maxfd+1, sets, timeout)` / `poll(fds, nfds, timeout)` multiplex level-triggered readiness in one thread (rebuild `select` sets per call). Non-blocking returns `EWOULDBLOCK` instead of sleeping — gate retries on readiness. `SOCK_PACKET` is legacy; `PF_PACKET` + `SOCK_RAW` sniffs raw frames with privilege, bypassing transport entirely.
:::

**Active-recall checklist:** Recite the five TCP server calls in order. Why does `accept` return a new descriptor? When does `select` need its sets rebuilt? Which UDP calls replace the whole handshake? What privilege and layer does `PF_PACKET` bypass?

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz A TCP server calls socket, bind, listen, then loops accept/recv/send/close. A student proposes handling each accepted connection in the same loop iteration with blocking recv. What breaks with two simultaneous clients, and which two cures does this note teach?
() Nothing — blocking calls serve all clients instantly
(*) The first client's slow recv stalls the loop, starving the second client's queued dial and arrived bytes; cures are threads per connection or (this note) single-thread readiness multiplexing with select/poll plus optionally non-blocking I/O gated on readiness
() The listening socket stops ringing after one accept
() UDP must replace TCP for any multi-client server
::: explanation
Iterative blocking service is head-of-line blocked at the application: one slow peer holds the only thread. Multiplexing inverts scheduling — the kernel reports exactly which descriptors are ready, and the loop touches only those; non-blocking makes each touch instant. Listening survives every accept; the stall is purely the loop's naivety.
:::

::: quiz select watches fds 3 (listener), 5, 7 and returns readable {5}. The student then calls recv(7) "to be fair" and reuses last loop's fd_set without rebuilding. Name both errors and the correct next calls.
() Both are correct — fairness and set reuse are required
(*) Error 1: touching 7 without readiness risks a blocking stall (readiness schedules, not round-robin); correct is recv(5) only. Error 2: select overwrites its sets, so stale sets misreport; rebuild sets (and maxfd) before every call
() Sets persist, so rebuilding corrupts them
() Fairness requires polling all fds every loop
::: explanation
Readiness is a permission slip per descriptor per call: 5 is permitted, 7 is not. And select consumes its inputs — the returned sets are results, not reusable watchlists. Rebuild-then-wait is the ritual; violate either half and the multiplexer lies or stalls.
:::

::: quiz A sniffer needs Ethernet headers of every received frame. A student opens socket(AF_INET, SOCK_STREAM, 0) and reads. Why does this fail, and what is the syllabus-correct call?
() Stream sockets include Ethernet headers when read twice
(*) SOCK_STREAM delivers TCP byte streams with all lower headers stripped; raw frames need packet sockets — legacy SOCK_PACKET is deprecated, so the correct modern call is socket(PF_PACKET, SOCK_RAW, ...) with privilege, parsing Ethernet/IP/TCP in the program
() Packet sockets are UDP-only
() No privilege is ever needed for raw frames
::: explanation
Layer determines headers: transport sockets start above TCP/UDP, packet sockets start at the link. SOCK_PACKET names the legacy hack; PF_PACKET plus SOCK_RAW is the current family — privileged, header-inclusive, and the exclusive home of sniffers, never of web applications.
:::
