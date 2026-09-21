---
id: m1_06_electronic_mail_smtp_pop3_imap
courseCode: PCCST501
module: 1
sequence: 6
title: 'Electronic Mail: SMTP, Message Format & Access Protocols'
difficulty: beginner
estimatedMinutes: 9
learningObjectives:
  - Trace the SMTP push dialogue and its port-25 command sequence
  - Separate envelope, header, and body in a mail message
  - Choose between POP3 and IMAP for single versus multi-device reading
  - Explain why spoofing follows from the header-envelope split
  - Self-test with the exam recap and active-recall checklist
concepts:
  - SMTP
  - POP3
  - IMAP
  - message envelope
  - spoofing
prerequisites:
  - m1_03_application_layer_paradigms
  - m1_04_world_wide_web_and_http
  - m1_05_file_transfer_protocol_ftp
examRelevance: high
tags:
  - email
  - smtp
  - imap
---
# Electronic Mail: SMTP, Message Format & Access Protocols

**Pushing mail across the Internet — SMTP handshakes on port 25, header anatomy, and why reading mail needs different protocols than sending it.**

<a id="the-intuition"></a>
## 1. The Real-World Situation — Start From Zero

You press "send" on an email. It does not fly straight to your friend's phone. Instead it is *pushed* from your provider to your friend's provider (possibly through relay machines in between), stored in a mailbox there — and only later *pulled* down when your friend opens their mail app.

The problem before the solution: sending mail (worldwide, store-and-forward, sender-driven) and reading mail (personal, multi-device, reader-driven) are different jobs. One protocol cannot serve both well — so email splits them: SMTP (Simple Mail Transfer Protocol) pushes, POP3 (Post Office Protocol v3) and IMAP (Internet Message Access Protocol) pull.

::: callout-intuition Core Mental Model: Post Office vs Mailbox Key
**SMTP** is the postal service: it only *pushes* letters toward the recipient's post office (port 25, always the sender speaking first). **POP3/IMAP** are mailbox keys: they *pull* letters out for reading (ports 110/143). Asking SMTP to fetch your inbox is like asking the postman for a spare key — wrong counter entirely, and the exam's favourite category error.

Dropping the post office now: push = SMTP on port 25 between servers; pull = POP3 (port 110) or IMAP (port 143) between your device and your mailbox.
:::

Same client-server paradigm as HTTP/FTP (M1.3–M1.5), but store-and-forward through intermediate relays instead of end-to-end sessions.

<a id="key-terms"></a>
## 2. Words First — Every Term Defined

| Term (abbreviation expanded on first use) | Plain meaning |
|---|---|
| **SMTP (Simple Mail Transfer Protocol)** | The push protocol: transfers mail from sender toward the recipient's mail server over TCP port 25. |
| **POP3 (Post Office Protocol, version 3)** | A pull protocol (port 110): downloads mail to one device, usually deleting the server copy — offline-simple, multi-device-hostile. |
| **IMAP (Internet Message Access Protocol)** | A pull protocol (port 143): manipulates server-side folders/flags so phone + laptop stay in sync. |
| **Message envelope** | The SMTP routing commands (`MAIL FROM`, `RCPT TO`) — used by servers, then discarded. Distinct from the visible header. |
| **Message header / body** | Header lines (`From:`, `To:`, `Subject:`) plus the body text — both travel inside the `DATA` payload. |
| **MIME (Multipurpose Internet Mail Extensions)** | The extension that lets bodies carry non-text content (attachments, images) beyond SMTP's original 7-bit text. |
| **MX (Mail Exchanger) record** | The DNS (Domain Name System) record naming which server accepts mail for a domain. |
| **Spoofing** | Forging the visible `From:` header — possible because headers are sender-written text, not authenticated routing. |
| **SPF/DKIM/DMARC (Sender Policy Framework / DomainKeys Identified Mail / Domain-based Message Authentication)** | Later bolt-on standards that let receivers verify a sender's legitimacy — patches over SMTP's trusting origins. |
| **HELO** | The SMTP greeting command opening the dialogue ("hello, I am …"). |

<a id="the-math"></a>
## 3. Purpose — Push Dialogue, Message Shape, Pull Choice

### 3.1 Operation Flow: SMTP Dialogue and Message Shape

The sender opens TCP to port 25 and speaks first. Command sequence, symbol by symbol:

1. `HELO sender-domain` — greeting ("I am this machine").
2. `MAIL FROM:<sender>` — envelope sender (routing/bounce address).
3. `RCPT TO:<recipient>` — envelope recipient (delivery address).
4. `DATA` — "here comes headers + body, ending with a line containing only `.`".
5. `QUIT` — close the session.

The server answers each step with 3-digit codes: `250` = OK/action completed, `354` = start mail input (after DATA), `550` = no such user, `221` = closing.

Message anatomy has three layers — never confuse the first two:

* **Envelope** (SMTP commands, discarded after delivery) — decides routing and bounces.
* **Header** (`From:`, `To:`, `Subject:` — *part* of the DATA payload, hence spoofable) — what humans read.
* **Body** (MIME extends it to attachments) — the content.

### 3.2 Pull Side: POP3 vs IMAP

| | POP3 (110) | IMAP (143) |
|---|---|---|
| Model | Download-and-(usually)-delete | Server-side folders, flags, partial fetch |
| Multi-device | Hostile (mail lives on one device) | Native (all devices see the same mailbox) |
| Modern default | Rare | Standard for phones + laptops |

HTTP webmail is a third skin over the same mailbox (browser → web server → mailbox via HTTP on port 80).

::: callout-formula KTU Formula Vault: Email
SMTP $= 25$, push only, 7-bit ASCII + MIME · `HELO → MAIL → RCPT → DATA → QUIT` · envelope $\ne$ header · POP3 $= 110$ (download-delete) · IMAP $= 143$ (server folders).
:::

SMTP's trust-everyone heritage (no authentication in the original) is *why* spam and spoofing exist — later bolt-ons (SPF/DKIM/DMARC) patch the trust the base protocol never had.

::: callout-pitfall Header vs Envelope
`From:` in the header is sender-asserted text inside DATA; the envelope `MAIL FROM` is what servers actually route (and bounce to). Spoofing forges the letterhead, not the postmark — any option equating displayed From with authenticated sender is wrong.
:::

<a id="worked-example"></a>
## 4. Examples — Tiny First, Then Exam-Level

### 4.1 Toy Example (30 seconds)

Ana sends one line ("Hi!") to Bo. Push: Ana's server opens TCP to Bo's domain MX on port 25, says `HELO`, `MAIL FROM:<ana>`, `RCPT TO:<bo>`, `DATA` (headers + "Hi!" + `.`), `QUIT`. Pull: Bo's phone uses IMAP/143 and sees the message; his laptop, also IMAP, shows it read the moment he opens it on the phone.

### 4.2 KTU-Style Worked Example

::: step [Step 1: Setup] Formulating the Problem
Alice (`alice@a.com`) mails Bob (`bob@b.com`) one 2-line body with subject "Hi". List the SMTP command sequence and state which protocol Bob's phone uses to read it (and its port).
:::

::: step [Step 2: Execution] Push Then Pull
Push (Alice's server → `b.com` MX, port 25): `HELO a.com` ($250$), `MAIL FROM:<alice@a.com>` ($250$), `RCPT TO:<bob@b.com>` ($250$), `DATA` ($354$), headers (`From:`, `To:`, `Subject: Hi`) + 2 body lines + `.` ($250$ queued), `QUIT` ($221$). That's $5$ command rounds before DATA. Pull: Bob's phone uses IMAP on port $143$ (server folders, read-flags sync across devices) — POP3/110 would strand his laptop's copy.
:::

::: step [Step 3: Conclusion] Final Result
$5$ command rounds + DATA + QUIT on port $25$; reading via IMAP/$143$. The push/pull split is the whole design: SMTP never touches Bob's mailbox, IMAP never touches the wire between servers.
:::

<a id="exam-recap"></a>
## 5. Distinctions, Watch-Outs, and Exam Recap

| Pair students confuse | Distinction that earns marks |
|---|---|
| SMTP vs. POP3/IMAP | Push between servers (25) vs. pull by readers (110/143). |
| Envelope vs. header | Routing commands (server truth) vs. displayed text (spoofable). |
| POP3 vs. IMAP | One-device download-delete vs. synced server folders. |
| Port numbers | 25 = push, 110 = POP3, 143 = IMAP, 80 = webmail skin. |

**Watch out:** (1) Assigning SMTP any reading role — it only pushes. (2) Treating displayed `From:` as authenticated — it is sender-written header text. (3) Recommending POP3 for multi-device users.

::: callout-exam KTU Exam Focus: One-Paragraph Recap
SMTP/25 pushes via `HELO → MAIL → RCPT → DATA → QUIT` (codes 250/354/550/221); envelope decides routing, header is displayed (spoofable — hence SPF/DKIM/DMARC). Reading: POP3/110 (single-device) vs. IMAP/143 (synced folders, modern default); webmail = HTTP skin on port 80.
:::

**Active-recall checklist:** Recite the five SMTP commands with their reply codes. Who reads the envelope vs. the header? Which pull protocol keeps two devices in sync, and why? Where does forgery live?

<a id="self-check"></a>
## 6. Active Recall Quizzes

::: quiz Q1: Port Drill
SMTP send, IMAP read, POP3 read, HTTP webmail. Ports?
(A) $80$, $25$, $110$, $143$ in that order
(*B) $25$, $143$, $110$, $80$ — push-mail, folder-sync, download-delete, web-skin, each number nailed to its job
(C) All on $25$
(D) $21$, $22$, $23$, $25$ running down
::: explanation
$25$ = SMTP push, $143$ = IMAP folders, $110$ = POP3 fetch, $80$ = HTTP skin. Port-number discipline is pure recall — anchor each to push/pull/skin and the set never scrambles.
:::

::: quiz Q2: Spoofing Logic
A phish shows `From: dean@ktu.edu` but the envelope said `MAIL FROM:<x@evil.ru>`. Which decided delivery, and what does Bob's client display?
(A) Header decided, envelope displayed
(*B) Envelope decided routing (bounces go to evil.ru), client displays the header — forgery lives exactly in this split, which authentication bolt-ons verify
(C) Both are always identical
(D) SMTP encrypts both
::: explanation
Servers route and bounce by envelope; humans read the header. The gap is the spoofing surface — SPF/DKIM/DMARC exist to staple the two together after the fact.
:::

::: quiz Q3: Protocol Choice
User reads mail on phone + laptop, wants read-flags synced. Verdict?
(A) POP3 with delete-after-fetch
(*B) IMAP — server-side state (folders, seen-flags, partial fetch) is its entire raison d'être, while POP3's download-delete model fights multi-device sync by design
(C) SMTP with long polling
(D) FTP to the mail spool
::: explanation
State location decides: POP3 keeps state on one client, IMAP on the server both clients share. Synced flags need shared state — IMAP, no contest, and the standard modern default for exactly this reason.
:::
