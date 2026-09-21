---
id: m2_01_wireshark_capture_basics
courseCode: PCCSL507
module: 2
sequence: 1
title: 'Wireshark Capture Basics'
difficulty: beginner
estimatedMinutes: 12
learningObjectives:
  - State what a capture proves in plain words first
  - Capture on loopback and Ethernet with correct filters
  - Read one packet's layers top to bottom
concepts:
  - packet capture
  - display filters
  - layer dissection
prerequisites:
  - m1_04_concurrent_server_select
examRelevance: high
tags:
  - wireshark
  - capture-filters
---
# Wireshark Capture Basics

**Objective:** capture your own lab traffic and read any packet's Ethernet/IP/TCP-UDP layers with filters — the microscope for every later experiment.

**What you should know first:** packets wrap layers (frames carry IP carries TCP/UDP); loopback (`lo`) carries your Python lab traffic.

**Required software/tools:** Wireshark (needs root/capture group for interfaces; `lo` works for labs); your M1 servers/clients as traffic generators.

## 1. What Are We Doing, and Why

We capture the M1.02 TCP exchange on `lo`, filter to it, and dissect one data packet layer by layer. Why: every claim in later experiments ("handshake happened", "retransmission fired") is proved here, not asserted.

## 2. Concept in Very Simple Language

- **Capture filter** (chosen before start, e.g. `tcp port 5000`) decides what the net *records* — wrong filter, empty file.
- **Display filter** (typed after, e.g. `tcp.flags.syn==1`) decides what you *see* — non-destructive, retype freely.
- **Dissection panes**: packet list (one line each) → headers tree (expand Ethernet/IPv4/TCP) → hex bytes (click a field, watch bytes highlight).

## 3. Commands and Line-by-Line Explanation

```bash
$ sudo wireshark &            # launch with capture rights (or add user to wireshark group)
# In GUI: Capture → Options → interface lo → capture filter "tcp port 5000" → Start
# Terminal 2: run M1.02 client once. Back in Wireshark: stop (square button).
```

- Interface `lo` — loopback carries 127.0.0.1 lab traffic; Ethernet (e.g. `eth0`) carries LAN traffic (needs promiscuous care on switched nets — you see mostly your own).
- Capture filter `tcp port 5000` — kernel drops non-matching first (small files, set before Start; cannot change mid-capture).
- Display filter `tcp` then `tcp.flags.syn==1` — narrows the view after capture; mistakes cost nothing, retype and continue.
- Click packet 1 → expand `Transmission Control Protocol` → read `Source/Destination Port`, `Sequence/Acknowledgment numbers`, `Flags (SYN)`; click the SYN flag → hex pane highlights its byte (field↔bytes binding proved).

::: toggle Packet vs frame vs segment vs datagram — which word when?
Frame = link-layer unit (Ethernet: MACs + payload). Datagram/packet = network-layer unit (IP: source/destination addresses). Segment = TCP's piece of the stream (sequence numbers); UDP's piece keeps "datagram". Use: frame on the wire, packet/IP in routing, segment for TCP flows. Wireshark's panes show all three stacked — read top (frame) to bottom (TCP/UDP/data) to follow encapsulation outward-in.
:::

::: toggle What do sequence number, acknowledgment number, SYN, and ACK mean on this capture?
Sequence number = this segment's first byte position in the stream (SYN consumes one: `Seq=0` synchronises the start). Acknowledgment number = next byte expected (cumulative coffee-stub: everything below arrived). SYN flag = "synchronise with my starting number" (connection birth). ACK flag = "this ack-number is valid" (set on everything after the first SYN). On your capture: SYN `Seq=0` → SYN-ACK `Seq=0 Ack=1` → ACK `Ack=1` = both directions synchronised, zero data yet.
:::

## 4. Expected Output and How to Verify

One client run yields ≈ 7 packets: SYN, SYN-ACK, ACK, data→, ACK, data←, ACK (+ FIN teardown). Verify: packet count matches expectation; `tcp.flags.syn==1` shows exactly 1 (client's) — plus `tcp.flags.syn==1 && tcp.flags.ack==1` shows the server's one; follow `tcp.stream eq 0` isolates the conversation.

::: callout-pitfall Filter Amnesia
Typing the display filter into the *capture* filter box (or vice versa) — syntax differs (`port 5000` vs `tcp.port==5000`). Capture box errors warn before Start; display box turns red on mistakes. Red box? You're in the wrong box or syntax.
:::

## 5. Common Errors and Viva Questions

| Error | Cause and cure |
|---|---|
| Empty capture | Wrong interface (eth0 vs lo) or over-narrow capture filter — capture `lo` unfiltered first, narrow later |
| `You don't have permission` | User outside `wireshark` group and no root — `sudo dpkg-reconfigure wireshark-common`, re-login |
| Everything is `TCP Retransmission` on Wi-Fi | Real loss captured faithfully — capture is honest; the network is lossy |

**Viva:** capture vs display filter (record vs view)? What does clicking a field prove (dissector↔bytes binding)? Why `lo` for lab traffic (loopback never leaves the kernel)?

**Exam/practical checklist:** correct interface ☐; capture filter set pre-start ☐; 7-packet exchange isolated ☐; one packet dissected field-by-field ☐.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Capture shows zero packets though the client printed its reply. Name the two most likely causes in order.
() Wireshark is broken; reinstall
(*) (1) Wrong interface (captured eth0 while traffic rode lo); (2) over-narrow capture filter set before Start. Traffic proved itself (reply printed) — so the microscope, not the patient, is mispointed
() TCP hides from Wireshark by encryption
() Loopback traffic is uncatchable by design
::: explanation
Working traffic plus empty capture isolates the observer: interface first (where?), filter second (what was recorded?). The reply is the alibi — blame the lens, never the packets.
:::

::: quiz Display filter box turned red after typing `port 5000`. What happened and where does that syntax belong?
() Wireshark crashed on the number 5000
(*) `port 5000` is capture-filter (BPF) syntax, mistyped as a display filter — display needs `tcp.port==5000`. Red means rejected syntax in the current box; each box has its own language
() Ports above 1024 cannot be filtered
() Red is the normal colour; ignore it
::: explanation
Two boxes, two grammars: BPF records, display-language views. Red is the grammar alarm — translate the intent into the box's own tongue.
:::
