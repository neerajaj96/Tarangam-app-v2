---
id: m2_04_reliability_protocols_lab
courseCode: PCCSL507
module: 2
sequence: 4
title: 'Stop-and-Wait & Sliding Window in Code'
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State what sequence numbers buy in plain words first
  - Implement stop-and-wait with timeouts over UDP
  - Extend to Go-Back-N windows and measure the speedup
concepts:
  - stop-and-wait
  - Go-Back-N
  - throughput math
prerequisites:
  - m2_03_dns_dhcp_experiment
examRelevance: high
tags:
  - reliability-lab
  - sliding-window
---
# Stop-and-Wait & Sliding Window in Code

**Objective:** build reliability yourself over lossy UDP — first one-at-a-time, then windowed — and measure exactly what pipelining buys.

**What you should know first:** UDP drops without notice (M1.03 + netem); sequence numbers tag each packet's identity.

**Required software/tools:** Python 3; `tc netem` (root) with delay+loss (e.g. `delay 50ms loss 10%`); `time` for measurement.

## 1. What Are We Doing, and Why

We send 20 numbered packets across damaging netem twice: stop-and-wait (one outstanding, timeout resends) versus Go-Back-N window 4 (four outstanding, cumulative ACKs, timeout rewinds to oldest unacked). Why: TCP's core is no longer magic — you wrote a small one, and the speedup number is yours.

## 2. Concept in Very Simple Language

- **Sequence + ACK:** every packet numbered; receiver ACKs the next-wanted number (cumulative: ACK 7 confirms all below 7).
- **Timeout:** sender's alarm per oldest unacked — expiry resends (stop-and-wait: the one; GBN: the whole window from the gap).
- **Window:** how many unacked packets may fly — 1 = stop-and-wait; N = pipelined; throughput ≈ window × size / RTT.

## 3. Code and Line-by-Line Explanation

```python
# sender core (receiver: recv packet, send ACK next-wanted; drop nothing, reorder ignored for GBN)
import socket, time
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.settimeout(0.5)
base, nxt, N, TOTAL = 0, 0, 1, 20          # N=1 stop-and-wait; N=4 for GBN
t0 = time.time()
while base < TOTAL:
    while nxt < base + N and nxt < TOTAL:  # fill window with fresh packets
        s.sendto(f"{nxt}".encode(), DST); nxt += 1
    try:
        ack = int(s.recvfrom(64)[0])       # cumulative ACK: next wanted
        if ack > base: base = ack          # slide window forward only
    except socket.timeout:                 # oldest unacked expired...
        nxt = base                         # ...rewind to gap (GBN) / resend one (N=1)
print("done in", round(time.time() - t0, 2), "s")
```

- Window-fill loop sends while under `base+N` — pipelining lives here (N=1 degenerates to stop-and-wait honestly).
- Cumulative ACK slides `base` — one number confirms everything below (GBN's efficiency and its rewinding curse).
- Timeout rewinds `nxt = base` — resend from the gap; with N=1 that's exactly one packet (stop-and-wait falls out, not bolted on).

::: toggle What do `base`, `nxt`, `N`, cumulative ACK, and timeout each govern?
`base` = oldest unacknowledged packet (window's left edge — everything below arrived). `nxt` = next fresh packet to send (window's right edge grows here). `N` = window size (max unacked in flight; N=1 degenerates to stop-and-wait). Cumulative ACK ("next wanted", e.g. 7) = confirms all below + paces the window (one number does both jobs). Timeout = alarm on the oldest unacked (expiry rewinds `nxt = base` — resend from the gap; GBN resends the whole tail, stop-and-wait resends the one).
:::

::: toggle Why must the timeout exceed RTT, and how do you set it?
Timeout < RTT fires while healthy packets still fly (needless resends = self-made congestion). Timeout ≫ RTT naps through real loss (throughput bleeds waiting). Rule: measure RTT first, set 2–4× it. Below RTT storms, above wastes — the exam's favourite "why slow?" diagnosis in one multiplication.
:::

## 4. Expected Output and How to Verify

20 packets over `delay 50ms loss 10%`: stop-and-wait ≈ 20×RTT+ (≥2 s with resends); GBN-4 ≈ 4–5× fewer RTTs (measure ~4× speedup). Verify: receiver log shows in-order delivery both ways; sender log shows rewind events only under loss; zero-loss control run shows no rewinds (mechanism idle, not broken).

::: callout-pitfall Timeout Tuning
Timeout below RTT resends perfectly good packets (congestion from kindness); far above RTT naps through loss. Set ≈ 2–4× measured RTT — the exam's favourite "why slow?" diagnosis.
:::

## 5. Common Errors and Viva Questions

| Error | Cause and cure |
|---|---|
| GBN slower than stop-and-wait | Timeout < RTT (storm of needless resends) — measure RTT first, set 2–4× |
| Receiver delivers gaps | Accepted out-of-order (Selective-Repeat behaviour) mislabelled GBN — GBN buffers nothing, drops post-gap |
| Deadlock at end | Final ACKs lost, sender expired-done — add end-of-stream ACK-retry (FIN-like care) |

**Viva:** cumulative ACK's two jobs (confirm + pace)? Why rewind wastes (good packets after the gap resent)? Window 1 = which protocol (stop-and-wait, exactly)?

**Exam/practical checklist:** 20/20 in order both modes ☐; rewinds only under loss ☐; speedup ≈ N× measured ☐; qdisc removed ☐.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz GBN-4 measured barely faster than stop-and-wait with timeout 20 ms on a 100 ms RTT link. Diagnose with numbers.
() Window too big — shrink to 1
(*) Timeout (20 ms) fires mid-flight every packet (RTT 100 ms): sender resends in-flight goods continuously — storm, not speed. Set ≈200–400 ms; pipelining needs patience longer than one round trip
() Loss too low to matter
() Python too slow for windows
::: explanation
Timeout must exceed RTT or every packet "dies" while healthy — kindness becomes congestion. Measure RTT, multiply by 2–4, then judge windows. Numbers first, architecture second.
:::

::: quiz Receiver got packets 5,6,8 (7 lost). GBN-correct behaviour and what the sender does next?
() Deliver 8, ACK 8 — keep the good news
(*) Drop 8 (GBN buffers nothing post-gap), keep ACKing 7 (begging the gap); sender timeout rewinds to 7, resending 7,8,… — waste is the price of receiver simplicity, ACKs the begging mechanism
() Ask the user to resend manually
() Skip 7 forever; gaps are decorative
::: explanation
GBN's contract: receiver simplicity (no buffers) for sender waste (rewind all). Cumulative ACK 7 is both diagnosis and pace — the gap rules until filled.
:::
