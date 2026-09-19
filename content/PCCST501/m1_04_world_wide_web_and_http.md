---
id: m1_04_world_wide_web_and_http
courseCode: PCCST501
module: 1
sequence: 4
title: The World Wide Web and HTTP
difficulty: beginner
estimatedMinutes: 7
learningObjectives:
  - Define HTTP statelessness and its consequences for sessions
  - Compare non-persistent and persistent connections with counts
  - Read HTTP request and response message structure
  - Explain how cookies restore state on a stateless protocol
concepts:
  - HTTP
  - statelessness
  - persistent connections
  - cookies
prerequisites:
  - m1_03_application_layer_paradigms
examRelevance: medium
tags:
  - http
  - world-wide-web
  - cookies
---
# The World Wide Web and HTTP

**HTTP request/response structure, non-persistent vs. persistent connections, statelessness, and cookies.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Amnesiac Waiter
Picture a waiter with total amnesia — every time you order, they treat you as a brand-new customer, with zero memory of anything you ordered a minute ago. This is exactly how **HTTP** behaves: it is **stateless**. Every request is handled in complete isolation from every previous one, even from the same browser, even seconds apart.

Now imagine fetching a webpage that has text plus ten embedded images. Should the waiter make a brand-new trip to the kitchen (open a brand-new connection) for *every single item*, or should they keep one open channel and bring everything back over it? Early HTTP (1.0) did the former — **non-persistent**, closing and reopening a TCP connection per object, wasting time on repeated handshakes. Modern HTTP (1.1) does the latter — **persistent**, reusing one open connection for many objects in a row.

But if the waiter forgets everything, how does a shopping cart or login session survive? The restaurant hands you a **cookie** — a small claim-check with a unique ID — the moment you first sit down. Every time you order again, you show that claim-check, and the amnesiac waiter looks up your ID in a notebook to instantly recall your entire history, without ever "remembering" anything on their own.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Web Terminology

* **Web Page:** a document, typically HTML, referencing several other **objects** (images, CSS, JS files).
* **Object:** any single file — an HTML file, a JPEG, a video clip.
* **URL:** the address of an object — a hostname (`www.example.com`) plus a path (`/images/pic.jpg`).

### 2.2 HTTP Fundamentals

* **Transport:** HTTP always runs over **TCP**, never UDP, to guarantee reliable, in-order delivery.
* **Statelessness:** the server retains **no memory** of past requests. Identical requests seconds apart are treated as entirely new.

### 2.3 Non-Persistent vs. Persistent Connections

```mermaid
sequenceDiagram
    participant B as Browser
    participant W as Web Server
    rect rgb(40,40,60)
    Note over B,W: Non-Persistent HTTP (HTTP/1.0)
    B->>W: Open TCP connection
    B->>W: GET index.html
    W->>B: index.html
    Note over B,W: Connection closes
    B->>W: Open NEW TCP connection
    B->>W: GET image1.jpg
    W->>B: image1.jpg
    Note over B,W: Connection closes (repeat per object!)
    end
```

```mermaid
sequenceDiagram
    participant B as Browser
    participant W as Web Server
    rect rgb(40,60,40)
    Note over B,W: Persistent HTTP (HTTP/1.1)
    B->>W: Open TCP connection (once)
    B->>W: GET index.html
    W->>B: index.html
    B->>W: GET image1.jpg
    W->>B: image1.jpg
    B->>W: GET image2.jpg
    W->>B: image2.jpg
    Note over B,W: Same connection reused for all objects
    end
```

| | Non-Persistent (HTTP/1.0) | Persistent (HTTP/1.1) |
|---|---|---|
| Connections needed | One per object | One, reused for many objects |
| Overhead | High — repeated TCP handshakes | Low — handshake paid once |
| Latency | Higher | Lower |

::: callout-formula KTU Formula Vault: Connection-Count Rule
For a page with $N$ objects (HTML + embedded): **non-persistent needs $N$ TCP connections** (one per object, each paying a handshake), **persistent needs 1** (reused). The worked example below is $N = 6 \to$ 6 vs. 1 — learn the pattern, not the instance.
:::

### 2.4 HTTP Message Structure

**Request Message:**
* **Request Line:** method (`GET`, `POST`, `HEAD`, `PUT`, `DELETE`) + URL path + version, e.g. `GET /index.html HTTP/1.1`
* **Header Lines:** `Host:`, `User-Agent:`, `Accept-Language:`, etc.
* **Entity Body:** used mainly by `POST` to carry form data/payloads.

**Response Message:**
* **Status Line:** version + status code + status message, e.g. `HTTP/1.1 200 OK` or `HTTP/1.1 404 Not Found`
* **Header Lines:** `Date:`, `Server:`, `Content-Length:`, `Content-Type:`
* **Data (Body):** the actual requested object.

### 2.5 Cookies: Faking Statefulness on Top of a Stateless Protocol

```mermaid
sequenceDiagram
    participant Br as Browser
    participant Sv as Server
    Br->>Sv: First-ever request (no cookie)
    Sv->>Sv: Create unique ID (e.g. 1678), save in DB
    Sv->>Br: Response + Set-cookie: 1678
    Note over Br: Browser stores cookie locally
    Br->>Sv: Next request + Cookie: 1678
    Sv->>Sv: Look up 1678 in DB → retrieve state
    Sv->>Br: Personalized response
```

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
An HTML page references 5 embedded images. Compute the total number of TCP connections required to fully load this page under (a) Non-Persistent HTTP and (b) Persistent HTTP.
:::

::: step [Step 2: Execution] Counting Connections
**Non-Persistent:** the HTML file itself requires 1 connection. Each of the 5 images then requires its *own* new connection (opened and closed individually) = 5 more connections. Total = 1 + 5 = **6 separate TCP connections**.
**Persistent:** a single TCP connection is opened once, and the HTML file plus all 5 images are transferred sequentially over that same connection before it closes. Total = **1 TCP connection**.
:::

::: step [Step 3: Conclusion] Final Result
Non-Persistent HTTP needs 6× as many TCP connections as Persistent HTTP for this page — each extra connection costs a full TCP three-way handshake's worth of round-trip latency. This is precisely why HTTP/1.1's persistent connections became the default: dramatically less overhead for pages with many embedded objects, which describes nearly every modern web page.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
Why is HTTP referred to as a "stateless" protocol?
(A) Because it does not use TCP as its transport protocol
(*B) Because the server retains no information about any previous client requests, treating every request as entirely new
(C) Because HTTP messages cannot contain any headers
(D) Because HTTP can only transfer static HTML files
::: explanation
Statelessness means the server has no built-in memory of past interactions — two identical requests from the same client are handled completely independently, with no server-side history unless something external (like a cookie) supplies that context.
:::

::: quiz Q2: Foundational Concept
An HTML page contains text and 5 image references. How many total TCP connections are established to fetch the entire page under Non-Persistent HTTP vs. Persistent HTTP?
(A) 1 connection in both cases
(*B) 6 connections under Non-Persistent HTTP (1 per object); 1 connection under Persistent HTTP (reused for all objects)
(C) 5 connections under Non-Persistent HTTP; 6 under Persistent HTTP
(D) Persistent HTTP always requires more connections than Non-Persistent HTTP
::: explanation
Non-Persistent HTTP opens and closes a fresh TCP connection for every single object (the HTML file plus each of the 5 images = 6 total), while Persistent HTTP keeps one TCP connection open and reuses it to fetch every object sequentially.
:::

::: quiz Q3: Foundational Concept
What role does the `Set-cookie` header play in maintaining state?
(A) It permanently changes the HTTP protocol from stateless to stateful
(*B) It gives the browser a unique identifier to store and resend on future requests, letting the server look up prior state associated with that ID
(C) It forces the browser to close its TCP connection
(D) It encrypts all future requests from that browser
::: explanation
`Set-cookie` doesn't change HTTP's fundamentally stateless nature — it works *around* it. The server issues a unique ID, the browser stores and automatically resends it, and the server uses that ID as a lookup key into its own database to reconstruct "memory" of that specific client.
:::
