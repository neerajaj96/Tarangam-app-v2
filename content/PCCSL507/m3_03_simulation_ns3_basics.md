---
id: m3_03_simulation_ns3_basics
courseCode: PCCSL507
module: 3
sequence: 3
title: 'Network Simulation with ns-3'
difficulty: beginner
estimatedMinutes: 13
learningObjectives:
  - State what simulation buys over hardware in plain words first
  - Build a two-node ns-3 script and read its trace
  - Sweep one parameter and plot the effect
concepts:
  - discrete-event simulation
  - ns-3 helpers
  - trace analysis
prerequisites:
  - m3_02_nat_firewall_lab
examRelevance: high
tags:
  - ns3-simulation
  - parameter-sweep
---
# Network Simulation with ns-3

**Objective:** simulate what hardware cannot cheaply show — hundred-node topologies, exact loss sweeps, repeatable congestion — with one honest two-node script first.

**What you should know first:** real ping/loss behaviour from M1–M2 (simulation must reproduce reality before extending it).

**Required software/tools:** ns-3 installed (ns-3.3x via bake/source; heavyweight — lab machines preinstalled); Python or basic C++; FlowMonitor or ASCII traces + a plotting tool.

## 1. What Are We Doing, and Why

We build point-to-point node0→node1, install a UDP echo, run, and read throughput from traces. Then we sweep loss 0→20% and plot delivery collapse. Why: simulators answer "what if" at scales and precisions hardware labs cannot afford — but only calibrated models earn trust.

## 2. Concept in Very Simple Language

- **Helpers stack:** NodeContainer (cast) → PointToPointHelper (stage) → InternetStackHelper (costumes: IP) → addresses → Applications (script: echo talk) → Simulator::Run (action!).
- **Traces:** ASCII (every event, huge) vs pcap (Wireshark-readable!) vs FlowMonitor (statistics XML: tx/rx/loss per flow).
- **Sweep discipline:** change ONE parameter per run, seed-controlled randomness, same simulated seconds — else graphs lie.

## 3. Code and Line-by-Line Explanation

```cpp
// two-node.cc — the smallest honest simulation
#include "ns3/core-module.h"
#include "ns3/network-module.h"
#include "ns3/internet-module.h"
#include "ns3/point-to-point-module.h"
#include "ns3/applications-module.h"
using namespace ns3;
int main(int argc, char *argv[]) {
  NodeContainer nodes; nodes.Create(2);                       // cast: two nodes
  PointToPointHelper p2p; p2p.SetDeviceAttribute("DataRate", StringValue("5Mbps"));
  p2p.SetChannelAttribute("Delay", StringValue("2ms"));       // stage: 5 Mb/s, 2 ms wire
  NetDevices devs = p2p.Install(nodes);                       // wire them together
  InternetStackHelper stack; stack.Install(nodes);            // costumes: TCP/IP each
  Ipv4AddressHelper addr; addr.SetBase("10.1.1.0", "255.255.255.0");
  Ipv4InterfaceContainer ifs = addr.Assign(devs);             // addresses: who is who
  UdpEchoServerHelper srv(9);                                 // script: echo server port 9
  ApplicationContainer apps = srv.Install(nodes.Get(1));
  apps.Start(Seconds(1.0)); apps.Stop(Seconds(10.0));         // act 1–10 s only
  UdpEchoClientHelper cli(ifs.GetAddress(1), 9);              // client dials node1:9
  cli.SetAttribute("MaxPackets", UintegerValue(100));
  cli.SetAttribute("Interval", TimeValue(Seconds(0.05)));     // 20 packets/s
  cli.Install(nodes.Get(0));
  p2p.EnablePcapAll("two-node");                              // record everything (Wireshark-ready)
  Simulator::Run(); Simulator::Destroy();                     // ACTION, then cleanup
}
```

- Helpers read top-down as stage directions: cast → stage → costumes → script → action (exam-friendly telling order).
- `EnablePcapAll` writes per-node pcaps — open node0's in Wireshark: your real-capture reading skills transfer exactly.
- Sweep: wrap loss via `RateErrorModel` on the device, loop rates in shell, parse FlowMonitor `rxPackets/txPackets` per run into one plot.

::: toggle What do NodeContainer, Helpers, `Install`, `EnablePcapAll`, and FlowMonitor each contribute?
NodeContainer = the cast (empty nodes awaiting roles). Helpers (`PointToPointHelper`, `InternetStackHelper`, address helper) = stage directions setting rates, delays, stacks, addresses (attributes like `DataRate`/`Delay` are the set design). `Install` = build the described objects onto nodes (nothing exists until installed). `EnablePcapAll` = record every interface to Wireshark-readable pcaps (evidence files). FlowMonitor = statistics collector (per-flow tx/rx/loss/delay numbers — graphs come from here, not from staring at packets).
:::

::: toggle What do "seed", "DataRate", and "calibration" mean for honest results?
Seed = RNG start (same seed = same "random" losses — repeatability; vary deliberately for confidence, fix for comparison). DataRate = link ceiling (results above it indict the measurement, never celebrate). Calibration = reproducing one real number (a ping, a loss rate) before scaling up (validity flows upward from reality, never down from ambition).
:::

## 4. Expected Output and How to Verify

100 packets requested; loss 0% ⇒ rx 100, delay ≈ 2 ms + queuing; loss 20% ⇒ rx ≈ 80 (UDP echo never repairs — matches M1.03 morals). Verify honesty: zero-loss throughput ≈ 5 Mbps ceiling (never above DataRate — models that beat physics are misconfigured); pcap opens in Wireshark with sane sequence behaviour.

::: callout-pitfall Uncalibrated Grandeur
Hundred-node swooping graphs from unvalidated models are fiction with axes. Calibrate small (reproduce a real ping/loss number first), then scale — validity flows upward from reality, never down from ambition.
:::

## 5. Common Errors and Viva Questions

| Error | Cause and cure |
|---|---|
| `rx 0` everything sent | Apps never started (Start/Stop times outside run) or addresses mismatched — check schedule vs `Simulator::Stop` |
| Throughput above DataRate | Summed both directions or counted headers wrongly — throughput ≤ bottleneck by definition |
| Identical runs differ wildly | Uncontrolled RNG seeds — set `SeedManager` / fixed seeds for repeatability |

**Viva:** helpers in telling order (cast→stage→costumes→script→action)? pcap vs FlowMonitor (packets vs statistics)? Why sweep one parameter (causality)?

**Exam/practical checklist:** script builds+runs clean ☐; 0%-loss baseline = 100/100 ☐; sweep plot monotonic-ish falling ☐; pcap dissected in Wireshark ☐; seed fixed, runs repeatable ☐.

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Simulated throughput reports 8 Mbps on a 5 Mbps link. What is wrong, and what is the correct reading discipline?
() The link overperforms — report the bonus
(*) Accounting error (both directions summed, headers miscounted, or time window wrong): throughput can never exceed the bottleneck rate — recheck parsing against DataRate as a physical ceiling, then fix the measurement
() ns-3 is optimistic by design; add 60% margin
() DataRate means something else in simulation
::: explanation
Physics caps models: the ceiling is a validity check, not a suggestion. Impossible numbers indict the measurement first — calibrate against the bottleneck before believing any graph.
:::

::: quiz Two sweeps change loss AND packet size together, showing collapse. Why is this graph inadmissible, and the correct rerun?
() Collapse graphs are always inadmissible
(*) Confounded causes: two knobs turned, blame unassignable — rerun sweeping one parameter with seeds fixed, holding the other constant. One knob per curve is the causality contract
() Bigger packets always fix loss anyway
() Seeds must vary per run for honesty
::: explanation
Sweeps are experiments: single variable, controlled rest, fixed randomness. Two-knob collapses prove nothing but enthusiasm — split the curves, pin the seeds, then conclude.
:::
