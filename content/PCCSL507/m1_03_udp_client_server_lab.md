---
id: m1_03_udp_client_server_lab
courseCode: PCCSL507
module: 1
sequence: 3
title: 'UDP Client-Server & Loss Demo'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State the datagram bet in plain words first
  - Run a UDP request-reply pair with no handshake
  - Demonstrate and explain loss on loopback vs netem
concepts:
  - UDP datagrams
  - sendto recvfrom
  - loss demonstration
prerequisites:
  - m1_02_tcp_client_server_lab
examRelevance: high
tags:
  - udp-sockets
  - loss-demo
---
# UDP Client-Server & Loss Demo

**Objective:** run a handshake-free UDP exchange, contrast every line against the TCP program, and watch datagrams drop on demand.

**What you should know first:** TCP's `listen/accept/connect` from the previous experiment (UDP deletes all three).

**Required software/tools:** Python 3; two terminals; optional `netem` (`tc qdisc ... loss 20%`) for the loss demo on loopback (needs root; else simulate loss in code).

## 1. What Are We Doing, and Why

We rebuild the uppercase service over UDP: same behaviour, no connection. Why: DNS, games, and streaming live here — and the missing calls teach what handshakes actually buy by their absence.

## 2. Concept in Very Simple Language

No dialling, no ringing: server `bind`s port 5001 and loops `recvfrom` (returns data *plus sender address*) then `sendto(reply, sender)`. Client just `sendto(server)` + `recvfrom`. Each call is one whole datagram — delivered whole, or never.

## 3. Code and Line-by-Line Explanation

```python
# udp_server.py
import socket
srv = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)  # datagram handset, no streams
srv.bind(("127.0.0.1", 5001))       # claim port; NO listen/accept exist for UDP
print("udp serving on 5001")
while True:
    data, addr = srv.recvfrom(1024)  # one datagram + who sent it (address per message!)
    srv.sendto(data.upper(), addr)   # reply to that exact sender (no connection needed)
```

```python
# udp_client.py
import socket, sys, random
cli = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
cli.settimeout(2.0)                  # datagrams may never arrive — never wait forever
if random.random() < 0.0: pass       # hook: raise to e.g. 0.3 to simulate sender-side drops
cli.sendto(sys.argv[1].encode(), ("127.0.0.1", 5001))  # destination per message, not per connection
print(cli.recvfrom(1024)[0].decode())  # raises socket.timeout on loss — catch and retry in real code
```

Loss demo: `sudo tc qdisc add dev lo root netem loss 20%` then run 10 requests — ~2 time out; remove with `tc qdisc del dev lo root`.

## 4. Expected Output and How to Verify

No loss: every request answered, uppercase correct. With 20% netem: some `socket.timeout` exceptions — count ≈ 2/10. Verify no handshake: `ss -unp` shows UDP sockets with no ESTABLISHED state; Wireshark shows lone datagrams, zero SYN.

::: callout-pitfall Timeoutless UDP
Blocking `recvfrom` with no timeout hangs forever on the first lost datagram — the #1 frozen-demo cause. Always `settimeout`; always plan the retry.
:::

## 5. Common Errors and Viva Questions

| Error | Cause and cure |
|---|---|
| `socket.timeout` every time | Server down/wrong port, or 100% loss rule left on — check server, `tc qdisc show` |
| Reply goes nowhere | Replied to stale `addr` after client restart — always use the fresh `recvfrom` address |
| Truncated >64 KB payloads | Datagram size limits — fragment at the app layer or switch to TCP |

**Viva:** why no `listen/accept` (nothing to connect)? `sendto` needs the address every time because…? What does netem prove about upper layers (reliability must live above UDP)?

**Exam/practical checklist:** uppercase correct with no loss ☐; timeout counted ≈ loss% ☐; `ss` shows no connection state ☐; qdisc removed after demo ☐.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Same service over TCP never timed out but UDP with netem 20% times out ~2/10. What does this prove about where reliability lives?
() UDP is broken and unusable
(*) Reliability (retries/ordering) lived in TCP's machinery, absent in UDP — the app (or QUIC/RTP above) must supply it; netem only exposed the missing layer by dropping datagrams TCP would have repaired
() Netem damages TCP too but hides it
() Loopback never drops without netem, so the demo is fake
::: explanation
Loss is normal on networks; TCP repairs it invisibly, UDP reports it honestly. The experiment's moral: name the layer that repairs, and who inherits the job when it's gone.
:::

::: quiz Client `recvfrom` hangs forever on first request, server logs nothing, TCP version works. Two suspects in order?
() Python is too slow for UDP
(*) (1) Server not running/wrong port (datagram to nobody vanishes silently — no refused error like TCP); (2) missing `settimeout` turned one loss into eternity. Connectionless means silent failure — timeouts are mandatory, not polite
() UDP needs `connect()` first always
() Loopback blocks UDP by policy
::: explanation
No handshake ⇒ no refusal signal: refused-TCP errors become silent-UDP hangs. Prove the server first (`ss -unp`), then armor the client with timeouts — order saves the demo.
:::
