---
id: m2_02_tcp_teardown_retransmission
courseCode: PCCSL507
module: 2
sequence: 2
title: 'TCP Handshake, Teardown & Retransmission'
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State what each flag proves in plain words first
  - Verify SYN/SYN-ACK/ACK and FIN/ACK on your own capture
  - Force and identify one retransmission with netem
concepts:
  - TCP flags
  - connection teardown
  - retransmission
prerequisites:
  - m2_01_wireshark_capture_basics
examRelevance: high
tags:
  - tcp-analysis
  - retransmission-lab
---
# TCP Handshake, Teardown & Retransmission

**Objective:** prove the three-way handshake and graceful teardown packet-by-packet from your capture, then manufacture a loss and watch TCP repair it.

**What you should know first:** capture + display filters (previous experiment); `SYN/ACK/FIN` flag meanings in one line each.

**Required software/tools:** Wireshark; M1.02 programs; `tc netem` (root) for the loss half.

## 1. What Are We Doing, and Why

We turn the 7-packet capture into a verified story (who synchronised what, who closed how), then add 15% loss on `lo` and find Wireshark's black `TCP Retransmission` lines plus duplicate ACKs — reliability made visible.

## 2. Concept in Very Simple Language

- **Handshake:** SYN (here is my starting number) → SYN-ACK (yours noted, here is mine) → ACK (both noted) — sequence numbers synchronised both ways before data.
- **Teardown:** FIN (I am done sending) → ACK, then the other side's FIN → ACK — each direction closes independently (half-close legal).
- **Repair:** unacked data re-sent after timeout (`TCP Retransmission`); receiver's repeated ACKs (`TCP Dup ACK`) beg for the missing piece — fast retransmit on three dups.

## 3. Procedure and Line-by-Line Reading

```bash
$ sudo tc qdisc add dev lo root netem loss 15%   # manufacture loss on loopback
# Capture (filter: tcp port 5000), run client with a 5 KB message, stop, inspect:
#   display filter 1: tcp.flags.syn==1            -> count SYNs (expect 1 + its SYN-ACK)
#   display filter 2: tcp.analysis.retransmission -> black lines = repaired data
#   display filter 3: tcp.analysis.duplicate_ack  -> begging ACKs before repair
$ sudo tc qdisc del dev lo root                  # ALWAYS remove the loss rule after
```

- SYN lines: `Seq=0` both ways with mirrored ACKs — starting numbers exchanged, not data.
- Data + `Len=5120`: one logical send, several TCP segments (MSS slicing visible) — streams, not messages.
- Black retransmission: same Seq sent twice, second after a gap — timeout repair proved.
- Dup ACKs: same Ack number repeated — receiver saying "still waiting for X".
- FIN pair per direction: `FIN, ACK` each way — orderly close, compare against RST (abort: instant, data at risk).

::: toggle What do FIN, RST, "dup ACK", and black "retransmission" rows prove?
FIN = "I am done sending" (half-close legal — the other direction may continue). RST = abort now, discard unread receive data (kill/crash signature — data at risk). Dup ACK (same Ack number repeated) = "still waiting for byte X" (the begging signal). Black retransmission row = same sequence re-sent after timeout/dup threshold (the repair receipt). On your lossy capture: dups diagnose the gap, black rows cure it, byte-identical output certifies it.
:::

## 4. Expected Output and How to Verify

Lossless run: exactly 3 handshake + data/ACKs + 4 teardown packets, zero black lines. 15% run: ≥1 black retransmission + dup ACKs, yet client output byte-identical — reliability proved by identical bytes despite red-black capture. Verify teardown directionality: FINs originate from closer first (client's `close`), server's after.

::: callout-pitfall Forgotten netem
Leaving the loss rule on poisons every later experiment (mysterious timeouts for weeks). `tc qdisc show dev lo` before each lab; `del` after each loss demo — ritual, not reminder.
:::

## 5. Common Errors and Viva Questions

| Error | Cause and cure |
|---|---|
| No black lines despite 15% loss | Small message fit few segments — send kilobytes, loss needs targets |
| RST instead of FIN close | Killed server (Ctrl-C) — abort vs orderly; rerun with clean `close()` |
| `TCP Out-Of-Order` confusion | Reordered (different path timing), not lost — retransmission flag is the loss proof |

**Viva:** why three handshake messages (both directions synchronise)? FIN per direction because…? Dup ACKs trigger what (fast retransmit)? What does byte-identical output under loss prove (repair layer works)?

**Exam/practical checklist:** handshake counted SYN/SYN-ACK/ACK ☐; FINs both directions ☐; ≥1 retransmission + dups under loss ☐; output identical ☐; qdisc removed ☐.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Capture under 15% loss shows dup ACKs then a black retransmission, and the client still prints the full correct reply. Explain the full repair chain.
() The reply was lucky; loss usually corrupts
(*) Receiver's dup ACKs (same Ack number) signal the missing Seq; sender's timeout/fast-retransmit resends exactly it; reassembly delivers ordered bytes — black lines are the repair receipts, identical output the proof it worked
() Wireshark repairs packets itself
() Retransmissions duplicate the reply text
::: explanation
Three witnesses, one verdict: dups diagnose, black resends cure, identical bytes certify. Reliability is this loop — quote all three phases, never just "TCP handles it."
:::

::: quiz Close shows FIN/ACK one way but RST the other. What happened on the RST side, and what risk did it take?
() Normal close — RST means Really Swift Termination
(*) That side aborted (killed/crashed socket): RST discards in-flight receive buffers — unreceived bytes die unread. Orderly FIN drains first; RST is the emergency exit with data-loss risk
() RST is faster and always preferable
() Both sides must send RST symmetrically
::: explanation
FIN = "done, drain me"; RST = "destroy now, data be damned." The asymmetry tells the story: one side finished politely, the other died mid-sentence — read closes like endings, not packets.
:::
