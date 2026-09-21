---
id: m1_04_concurrent_server_select
courseCode: PCCSL507
module: 1
sequence: 4
title: 'Concurrent Server with select'
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State the slow-client stall in plain words first
  - Serve many clients in one thread with select
  - Prove readiness scheduling with staggered clients
concepts:
  - select multiplexing
  - single-thread server
  - readiness testing
prerequisites:
  - m1_03_udp_client_server_lab
examRelevance: high
tags:
  - select-server
  - concurrency-lab
---
# Concurrent Server with select

**Objective:** upgrade the iterative TCP server so one slow client cannot stall others — in a single thread, using `select`.

**What you should know first:** the M1.02 accept/recv loop (iterative = one client at a time); `select` watches many descriptors and reports the ready ones (PCCST501 socket-programming note for theory depth).

**Required software/tools:** Python 3; three terminals (server + two clients); `time` for stall measurement.

## 1. What Are We Doing, and Why

We prove the stall first (client A sends half a line and sleeps; client B's full line waits), then fix it: `select` sleeps until *some* socket is readable, and the loop serves exactly those — one thread, no starvation, no threads at all.

## 2. Concept in Very Simple Language

Give `select` three lists (readable-wanted, writable-wanted, exceptions) — it returns the ready subsets. New dial on the listener ⇒ `accept` it into the watch set. Data on a client ⇒ `recv` it now (guaranteed non-blocking). Disconnect (`recv == b''`) ⇒ close and drop from the set. Rebuild lists every loop (select overwrites them — in C; Python's wrapper takes fresh lists each call, same discipline).

## 3. Code and Line-by-Line Explanation

```python
# select_server.py — one thread, many uppercase clients
import socket, select
ls = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
ls.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
ls.bind(("127.0.0.1", 5002)); ls.listen(10)
ls.setblocking(False)                    # listener never stalls the loop
watch = [ls]                             # every socket we care about
bufs = {}                                # per-client partial lines
while True:
    ready, _, _ = select.select(watch, [], [], 5.0)  # sleep till some socket readable
    for s in ready:
        if s is ls:                      # readable listener = pending dial
            conn, addr = ls.accept()     # birth per-client socket...
            conn.setblocking(False)
            watch.append(conn); bufs[conn] = b""  # ...and watch it too
        else:                            # readable client = arrived bytes
            chunk = s.recv(1024)
            if not chunk:                # b'' = orderly hang-up
                watch.remove(s); del bufs[s]; s.close()
            else:
                bufs[s] += chunk
                while b"\n" in bufs[s]:  # serve complete lines only (slow client waits fairly)
                    line, bufs[s] = bufs[s].split(b"\n", 1)
                    s.sendall(line.upper() + b"\n")
```

Stall demo: client A sends `half-` (no newline) and sleeps 10 s; client B sends `full\n` — B answered instantly while A mid-line proves the fix (iterative version would stall B 10 s).

## 4. Expected Output and How to Verify

B's reply arrives in milliseconds despite A's open line; A's reply completes after its newline. Verify: `ss -tnp` shows 3 ESTABLISHED (listener + 2 clients); server log order shows B served before A finished — scheduling by readiness, not arrival.

::: callout-pitfall Set Amnesia
Forgetting a new `accept`ed socket in `watch` strands that client forever (never reported readable). Every birth joins the watch; every close leaves it — no exceptions.
:::

## 5. Common Errors and Viva Questions

| Error | Cause and cure |
|---|---|
| B still stalls behind A | Served without line buffering (recv→reply immediately per chunk) — buffer per client, reply per complete line |
| `ValueError: file descriptor out of range` (C) | `FD_SETSIZE` exceeded — use `poll`/epoll beyond ~1024 fds (viva contrast) |
| Busy 100% CPU | `select` timeout zero in a tight loop — block with a real timeout |

**Viva:** why non-blocking sockets with select (guarantee, not just politeness)? What does readable-listener vs readable-client mean? `select` vs threads (one stack vs N stacks, no race on `bufs` with care)?

**Exam/practical checklist:** stall reproduced on iterative server ☐; B fast despite A slow ☐; disconnect cleans watch+bufs ☐; no busy-loop (CPU idle when quiet) ☐.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz B answered while A slept mid-line. Which exact lines make this possible, and what would the iterative server have done?
() Threads — the GIL parallelises them
(*) Per-client `bufs` + reply-only-on-newline + `select` waking per-ready-socket: A's partial bytes wait in its buffer while B's complete line dispatches; iterative `recv`-then-reply would block 10 s inside A's read, starving B
() Python is faster than C here
() select reorders TCP bytes fairly
::: explanation
Fairness is buffered lines plus readiness dispatch: partial work waits, complete work jumps. Name the buffer, the newline gate, and the wake rule — the iterative stall is the contrast that earns marks.
:::

::: quiz Accepted socket never added to `watch`. Symptom from that client's view, and the one-line fix?
() Client gets faster service — fewer watched sockets
(*) Client connects then silence forever: readable bytes never reported, never read. Fix: `watch.append(conn)` (plus `bufs[conn] = b""`) at birth — every birth joins the watch, every close leaves
() Server crashes immediately with traceback
() select auto-discovers new sockets
::: explanation
Unwatched means invisible: the kernel reports only listed descriptors. Birth-join/close-leave is the invariant — state it as law, and stranded-client bugs confess instantly.
:::
