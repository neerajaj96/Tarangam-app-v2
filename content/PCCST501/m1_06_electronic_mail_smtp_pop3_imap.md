# Electronic Mail: SMTP, Message Format & Access Protocols

**Pushing mail across the Internet — SMTP handshakes on port 25, header anatomy, and why reading mail needs different protocols than sending it.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Post Office vs Mailbox Key
**SMTP** is the postal service: it only *pushes* letters toward the recipient's post office (port 25, always the sender speaking first). **POP3/IMAP** are mailbox keys: they *pull* letters out for reading (ports 110/143). Asking SMTP to fetch your inbox is like asking the postman for a spare key — wrong counter entirely, and the exam's favourite category error.
:::

Same client-server paradigm as HTTP/FTP (M1.3–M1.5), but store-and-forward through intermediate relays instead of end-to-end sessions.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 SMTP dialogue and message shape

Sender opens TCP to port 25 and speaks first: `HELO`, `MAIL FROM`, `RCPT TO`, `DATA` (headers + body, ends with `\r\n.\r\n`), `QUIT` — server replies in 3-digit codes ($250$ OK, $550$ no such user). Message anatomy: envelope (SMTP commands, discarded after delivery) vs header (`From:`, `To:`, `Subject:` — *part* of the DATA payload, hence spoofable) vs body (MIME extends to attachments).

### 2.2 Pull side: POP3 vs IMAP

POP3 (110): download-and-(usually)-delete, offline-simple, multi-device-hostile. IMAP (143): server-side folders, flags, partial fetch — the multi-phone default. HTTP webmail is a third skin over the same mailbox.

::: callout-formula KTU Formula Vault: Email
SMTP $= 25$, push only, 7-bit ASCII + MIME · `HELO → MAIL → RCPT → DATA → QUIT` · envelope $\ne$ header · POP3 $= 110$ (download-delete) · IMAP $= 143$ (server folders).
:::

SMTP's trust-everyone heritage (no authentication in the original) is *why* spam and spoofing exist — later bolt-ons (SPF/DKIM/DMARC) patch the trust the base protocol never had.

::: callout-pitfall Header vs Envelope
`From:` in the header is sender-asserted text inside DATA; the envelope `MAIL FROM` is what servers actually route (and bounce to). Spoofing forges the letterhead, not the postmark — any option equating displayed From with authenticated sender is wrong.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Alice (`alice@a.com`) mails Bob (`bob@b.com`) one 2-line body with subject "Hi". List the SMTP command sequence and state which protocol Bob's phone uses to read it (and its port).
:::

::: step [Step 2: Execution] Push Then Pull
Push (Alice's server → `b.com` MX, port 25): `HELO a.com` ($250$), `MAIL FROM:<alice@a.com>` ($250$), `RCPT TO:<bob@b.com>` ($250$), `DATA` ($354$), headers (`From:`, `To:`, `Subject: Hi`) + 2 body lines + `.` ($250$ queued), `QUIT` ($221$). That's $5$ command rounds before DATA. Pull: Bob's phone uses IMAP on port $143$ (server folders, read-flags sync across devices) — POP3/110 would strand his laptop's copy.
:::

::: step [Step 3: Conclusion] Final Result
$5$ command rounds + DATA + QUIT on port $25$; reading via IMAP/$143$. The push/pull split is the whole design: SMTP never touches Bob's mailbox, IMAP never touches the wire between servers.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

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
