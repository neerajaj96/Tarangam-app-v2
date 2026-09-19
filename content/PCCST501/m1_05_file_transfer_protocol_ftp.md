---
id: m1_05_file_transfer_protocol_ftp
courseCode: PCCST501
module: 1
sequence: 5
title: File Transfer Protocol (FTP)
difficulty: beginner
estimatedMinutes: 7
learningObjectives:
  - Separate out-of-band control from in-band data connections
  - Trace an FTP session lifecycle across control and data channels
  - Contrast active and passive modes under firewalls
  - Explain why stateful FTP scales worse than stateless HTTP
concepts:
  - FTP
  - out-of-band control
  - active mode
  - passive mode
  - stateful sessions
prerequisites:
  - m1_04_world_wide_web_and_http
examRelevance: medium
tags:
  - ftp
  - file-transfer
---
# File Transfer Protocol (FTP)

**Out-of-band control vs. data connections, the FTP session lifecycle, Active vs. Passive mode, and stateful session tracking.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Ordering a Refrigerator
Imagine ordering a refrigerator from a store. You call the store on the telephone to place the order, confirm your identity, and specify what you want — this phone conversation is entirely separate from what happens next: the store dispatches a large delivery truck carrying the actual refrigerator to your house. The conversation and the heavy lifting travel over two completely different channels.

This is exactly how **FTP** works. The **telephone call** is the **Control Connection (Port 21)** — used for login, browsing directories, and issuing commands like "send me this file." The **delivery truck** is the **Data Connection (Port 20)** — used strictly to carry the actual file bytes. Because control information travels on a separate channel from the data, FTP is said to use **out-of-band** control — in sharp contrast to HTTP, which mixes its request headers and payload data into the very same connection (**in-band** control).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The Dual-Connection Architecture

```mermaid
flowchart LR
    subgraph Client
        C[FTP Client]
    end
    subgraph Server
        S[FTP Server]
    end
    C <-->|"Control Connection<br/>Port 21 — stays open<br/>entire session"| S
    C <-->|"Data Connection<br/>Port 20 — opened/closed<br/>per file transfer"| S
```

* **Control Connection (Port 21):** carries login credentials, directory-navigation commands (`CWD`), and transfer commands (`STOR` to upload, `RETR` to download). Remains open for the **entire session**.
* **Data Connection (Port 20):** carries only raw file bytes. A **new** data connection is opened and closed for **every individual file**.

::: callout-pitfall Two Numbers, Two Rules
**Port 20 is the *active-mode* data port** — in passive mode the server instead opens a random high port (see §2.3), so never write "data = always 20" without the active-mode qualifier. And the counting rule is fixed: **1 control connection per session, 1 fresh data connection per file** — a 3-file download means 1 + 3, never 3 + 3.
:::

### 2.2 The FTP Session Lifecycle

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: Open Control Connection (Port 21)
    C->>S: Username + Password
    S->>C: Authenticated
    C->>S: CWD /videos (change directory)
    S->>C: Directory changed
    C->>S: RETR movie.mp4
    Note over C,S: Server opens Data Connection (Port 20)
    S->>C: [file bytes over Data Connection]
    Note over C,S: Data Connection closes after transfer
    C->>S: RETR song.mp3
    Note over C,S: A brand-new Data Connection is opened
    S->>C: [file bytes over new Data Connection]
    C->>S: QUIT
    Note over C,S: Control Connection finally closes
```

### 2.3 Active vs. Passive FTP

Firewalls, by design, block unsolicited incoming connections — which causes trouble for FTP's original design:

| Mode | Behavior | Firewall Compatibility |
|---|---|---|
| **Active Mode** | Client opens a random port and tells the server to connect *back* to it | Often **blocked** — client's own firewall rejects the server's inbound connection attempt |
| **Passive Mode (`PASV`)** | Client asks the server to open a random high port; client then connects *outbound* to that port | Works well — the client always initiates outbound, which firewalls typically allow |

### 2.4 FTP is Stateful

Unlike HTTP, the FTP server **remembers** things about each connected user throughout the session:

* The user's current working directory (so relative paths like `CWD ../reports` make sense).
* The user's authentication/authorization state.

*Trade-off:* maintaining this per-user state limits how many simultaneous sessions a single FTP server can sustain, compared to a stateless HTTP server that can serve far more clients with the same resources.

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
A user connects to an FTP server, changes into a `/videos` directory, downloads two files (`movie.mp4` and `trailer.mp4`), then disconnects. Count how many Control Connections and how many Data Connections are used in total.
:::

::: step [Step 2: Execution] Tracing Connections
1. **Control Connection opened** (Port 21) — used for login and the `CWD /videos` command. **1 control connection total**, and it stays open the whole time.
2. `RETR movie.mp4` is issued over the control connection → the server opens a **new Data Connection**, transfers the file, then closes that data connection.
3. `RETR trailer.mp4` is issued over the *same* control connection → the server opens **another new Data Connection** (a second one), transfers the file, then closes it.
4. `QUIT` is sent over the control connection, which finally closes.
:::

::: step [Step 3: Conclusion] Final Result
The session uses exactly **1 Control Connection** (open for the whole session) and **2 separate Data Connections** (one per file transferred). This demonstrates FTP's defining rule: the control channel is long-lived and shared across the whole session, while a fresh data channel is created and torn down for every single file.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
What does it mean when we say FTP uses "out-of-band" control?
(A) FTP does not use TCP for either connection
(*B) Control information (commands, login) travels over a separate connection (Port 21) from the actual file data (Port 20), unlike HTTP which mixes both into one connection
(C) FTP control messages are encrypted while data is not
(D) FTP has no concept of a control connection at all
::: explanation
"Out-of-band" specifically means the signaling/control channel is physically separate from the data channel — FTP's Port 21 (control) and Port 20 (data) are two entirely distinct TCP connections, whereas HTTP sends both requests and data "in-band" over the same single connection.
:::

::: quiz Q2: Foundational Concept
Why did FTP introduce "Passive Mode"?
(A) To make file transfers faster by compressing data
(*B) Because in Active Mode, client-side firewalls typically block the server's unsolicited inbound connection attempt; Passive Mode has the client always initiate outbound connections instead
(C) To eliminate the need for a control connection entirely
(D) To allow multiple users to share the same data connection simultaneously
::: explanation
Active Mode requires the *server* to open a new connection back to the client, which most client firewalls block by default (since it looks like unsolicited incoming traffic). Passive Mode flips this: the client always initiates the data connection outbound to a port the server opens, which firewalls generally permit.
:::

::: quiz Q3: Foundational Concept
Why does maintaining FTP's stateful session information limit server scalability compared to stateless HTTP?
(A) FTP servers use more expensive hardware than HTTP servers
(*B) The server must keep dedicated per-user state (current directory, authentication) in memory for the duration of each session, consuming resources that scale with the number of simultaneously connected users
(C) FTP cannot support more than one user at a time
(D) FTP requires more physical cabling than HTTP
::: explanation
Because FTP tracks per-session context (like the current working directory) rather than treating each request independently, a busy FTP server must dedicate ongoing resources to every connected user — unlike a stateless HTTP server, which can process each request without holding onto any long-lived per-client memory.
:::
