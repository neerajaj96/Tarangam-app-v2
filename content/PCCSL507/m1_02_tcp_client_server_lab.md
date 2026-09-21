---
id: m1_02_tcp_client_server_lab
courseCode: PCCSL507
module: 1
sequence: 2
title: 'TCP Client-Server in Python'
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State the conversation pattern in plain words first
  - Run a TCP server and client on loopback
  - Prove reliability by killing and restarting ends
concepts:
  - TCP sockets Python
  - server accept loop
  - loopback testing
prerequisites:
  - m1_01_linux_network_toolkit
examRelevance: high
tags:
  - tcp-sockets
  - python-lab
---
# TCP Client-Server in Python

**Objective:** run a working TCP conversation between two programs on one machine, and prove each API call's role by breaking it.

**What you should know first:** sockets are conversation endpoints; server binds a famous port, listens, accepts per-client sockets (PCCST501 socket concepts — one line: listening socket rings, accepted socket talks).

**Required software/tools:** Python 3 (any recent); two terminals; no packages, no root (use port 5000+, loopback `127.0.0.1`).

## 1. What Are We Doing, and Why

We build the smallest honest network program: a server that uppercases one line per client, and a client that sends a line and prints the reply. Why: every later experiment (UDP, concurrent servers, Wireshark captures) reuses this exact skeleton.

## 2. Concept in Very Simple Language

Server: `socket` (buy phone) → `bind` (print number 5000) → `listen` (hook it, queue dials) → loop `accept` (adopt each caller onto a fresh socket) → `recv`/`sendall` (talk) → `close` (hang up that caller). Client: `socket` → `connect(127.0.0.1:5000)` → `sendall` → `recv` → `close`.

## 3. Code and Line-by-Line Explanation

```python
# server.py — uppercase line server
import socket
srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # TCP/IPv4 handset
srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  # rebind instantly after restart
srv.bind(("127.0.0.1", 5000))      # claim port 5000 on loopback only
srv.listen(5)                      # queue up to 5 unaccepted dials
print("serving on 127.0.0.1:5000")
while True:
    conn, addr = srv.accept()      # sleep till a dial; birth per-client socket
    print("call from", addr)
    data = conn.recv(1024)         # read up to 1 KB (blocks till bytes arrive)
    conn.sendall(data.upper())     # reply fully (sendall loops partial sends)
    conn.close()                   # hang up this caller; listener keeps ringing
```

```python
# client.py — one-line customer
import socket, sys
cli = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
cli.connect(("127.0.0.1", 5000))   # dial: SYN/SYN-ACK/ACK under the hood
cli.sendall((sys.argv[1] if len(sys.argv) > 1 else "hello").encode())
print(cli.recv(1024).decode())     # print the uppercased reply
cli.close()
```

Run: terminal 1 `python3 server.py`; terminal 2 `python3 client.py hello` → prints `HELLO`.

## 4. Expected Output and How to Verify

Client prints the uppercase of its argument; server logs `call from ('127.0.0.1', <ephemeral>)`. Verify with `ss -tnp` mid-call (ESTABLISHED pair), and Wireshark on `lo` (next experiment's preview: SYN/SYN-ACK/ACK then data).

::: callout-pitfall Address in Use
Restarting the server fast fails with `OSError: [Errno 98]` — the old socket lingers in TIME_WAIT. `SO_REUSEADDR` (line 4) is the cure; without it, wait ~60 s or change ports.
:::

## 5. Common Errors and Viva Questions

| Error | Cause and cure |
|---|---|
| `Connection refused` | No listener on that port — start server first, match port numbers |
| Client hangs on `recv` | Server never replied/closed direction — check server logic reaches `sendall` |
| Reply truncated | Used `send` once (partial) — `sendall` loops till complete |

**Viva:** why does `accept` return a *new* socket (listener keeps ringing for others)? `send` vs `sendall`? What does the ephemeral port in `addr` prove (client's return address)?

**Exam/practical checklist:** server binds+listens without error ☐; client reply correct ☐; second client served after first closes ☐; `ss` shows ESTABLISHED during call ☐.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Server restarted quickly fails Errno 98 while the old client is gone. What lingers, and which line cures it?
() The port is burnt forever — pick another
(*) Old connection in TIME_WAIT holds the port; `SO_REUSEADDR` (line 4) permits immediate rebind — lingering state, not broken code
() Python caches ports per file name
() Loopback ports need root after first use
::: explanation
TIME_WAIT guards late duplicates after close; rebind policy is the socket option. Name the state and the line — examiners award both halves.
:::

::: quiz Client connects but `recv` returns `b''` instantly instead of the reply. What did the server do, and what does empty bytes mean?
() Network is too fast; add sleep
(*) Server `close()`d without `sendall` (or crashed) — empty `recv` means orderly shutdown, the peer hung up. Fix server path to reply before close; empty bytes are the EOF signal, never data
() Empty means uppercase of nothing — send more
() Loopback cannot carry replies by design
::: explanation
`b''` is TCP's hang-up notice, not a message. Read returns data, then zero bytes at close — protocol over, debug the server's reply path.
:::
