# Transport-Layer Services & Multiplexing

**Process-to-process delivery, connectionless vs. connection-oriented service, ports, sockets, and how one host sorts arriving segments to the right app.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Apartment Building
The network layer delivers mail to the right **building** (host, by IP address) — but a building holds many **apartments** (processes: browser, mail client, game). Somebody must read the apartment number on each envelope and slide it under the correct door. That somebody is the **transport layer**: it extends host-to-host delivery into **process-to-process** delivery. The "apartment numbers" are **port numbers**, and each door (socket) is watched by exactly one process.
:::

The transport layer offers application processes exactly two personalities to choose from — and every application you have met picks one:

* **Connectionless, unreliable (UDP):** "throw the envelope and hope." No setup, no guarantees — but fast and light. (DNS lookups, live streaming, online games.)
* **Connection-oriented, reliable (TCP):** "call first, then speak carefully." A handshake opens the channel then every byte is tracked, ordered, and re-sent if lost. (Web, email, file transfer.)

::: callout-pitfall Service Lives in the End Systems, Not the Network
Exam trap: multiplexing, reliability, and congestion control are implemented **only in hosts** (sender + receiver), never inside routers. The network core stays dumb and fast; all the cleverness sits at the edge. If an option places TCP logic "in the router," eliminate it instantly.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Multiplexing and Demultiplexing

* **Multiplexing (sender):** gathering data chunks from several sockets, wrapping each with transport headers, and handing the segments down to the network layer.
* **Demultiplexing (receiver):** inspecting each arriving segment's destination identifiers and steering its payload up to the correct socket.

How the receiver identifies the socket differs — and this difference is heavily examined:

| | UDP demultiplexing | TCP demultiplexing |
|---|---|---|
| Key used | (destination IP, destination **port**) | full **4-tuple**: (source IP, source port, destination IP, destination port) |
| Consequence | Two senders to the same port land in the **same** socket | Each client connection gets its **own** socket, even to the same server port |

::: callout-formula KTU Formula Vault: The Demux Keys
UDP = **2-tuple** (dst IP, dst port). TCP = **4-tuple** (+ src IP, src port). The standard 3-mark question: "two HTTP clients connect to one web server — how many sockets?" Answer: **three** — one welcoming socket plus one connection socket per client, distinguished by the clients' differing source ports.
:::

### 2.2 Sockets, Ports, and Well-Known Numbers

A **socket** is the programming interface between an application process and the transport layer, named by `(IP address, port number)`. Ports 0–1023 are **well-known** (HTTP 80, HTTPS 443, FTP-control 21, DNS 53, SMTP 25); servers listen on them while clients use ephemeral high ports.

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Host A runs a DNS client (ephemeral port 52001) and a browser tab fetching a page. Host B runs a DNS server (port 53) and a web server (port 80). A DNS reply and an HTTP segment both arrive at host A addressed to its IP. Which socket gets each segment, and why can't they be mixed up?
:::

::: step [Step 2: Execution] Applying Demultiplexing
The DNS reply carries destination port 52001 → steered to the DNS client's socket (UDP 2-tuple match). The HTTP segment carries destination port (browser's ephemeral port, e.g. 49152) → steered to the browser's TCP socket (4-tuple match). The port numbers in the headers make the decision unambiguous even though both segments arrived at the same IP in the same instant.
:::

::: step [Step 3: Conclusion] Final Result
Demultiplexing keys — not arrival order, not timing — decide ownership. UDP needs only the destination pair; TCP additionally separates connections by source, which is why one server port can serve thousands of simultaneous clients without confusion.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz What is the transport layer's core job, beyond what the network layer already provides?
() Routing packets across multiple networks
(*) Extending host-to-host delivery into process-to-process delivery via ports and sockets
() Converting domain names into IP addresses
() Encrypting all application data
::: explanation
The network layer moves datagrams between *hosts* (IP addresses). The transport layer adds the second half of the address — the *port* — so payloads reach the correct *process* (socket) on that host. Routing, DNS, and encryption belong to other layers/mechanisms.
:::

::: quiz Two different clients open HTTP connections to the same web server port 80. How does the server keep their data separate?
() It cannot — the second client is rejected until the first disconnects
(*) Each connection is demultiplexed by its full 4-tuple, and the clients' differing source IPs/ports give each its own connection socket
() The server assigns each client a different IP address
() HTTP is connectionless, so no separation is needed
::: explanation
TCP demultiplexing uses (source IP, source port, destination IP, destination port). Same destination port 80, but different source endpoints → different 4-tuples → separate connection sockets. This is exactly why one well-known port serves unlimited concurrent clients.
:::

::: quiz Where are transport-layer functions (reliability, multiplexing, congestion control) implemented?
() Inside core routers, which inspect every TCP header
(*) Only in the end systems (sender and receiver hosts)
() In DNS servers distributed across the network
() Equally in every device including switches and hubs
::: explanation
The end-to-end principle: transport intelligence lives at the edge. Routers forward IP datagrams without TCP/UDP connection state, which keeps the core fast and simple while hosts implement reliability and congestion control cooperatively.
:::
