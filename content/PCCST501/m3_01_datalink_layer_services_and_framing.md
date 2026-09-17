# Data Link Layer: Services & Framing

**Node-to-node delivery, framing with byte/bit stuffing, link access, reliable delivery on noisy links, and error control placement.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: The Pony Express Relay
The network layer plans the *route* across the country (which stations to pass through). But between any *two adjacent stations*, someone must actually ride the segment: package the letters into a saddlebag (**framing**), shout over the canyon to claim the trail (**link access**), check the bag wasn't gnawed en route (**error detection**), and demand a re-ride if it was (**reliable delivery**). The data link layer is that rider — responsible for exactly **one hop**, knowing nothing of the full journey.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 The Four Link-Layer Services

* **Framing:** wrapping each network datagram in a frame (header + payload + trailer) so the receiver knows where it starts and ends.
* **Link access:** arbitrating a *shared* medium (who talks now?) via a MAC protocol — the heart of §3 next topic.
* **Reliable delivery:** ACKs + retransmissions across *one* link (used on error-prone links like Wi-Fi; usually skipped on fiber, where TCP's end-to-end recovery suffices).
* **Error detection/correction:** parity, checksums, CRC (entire next topic) — implemented in adapter hardware at line speed.

### 2.2 Framing: Finding the Edges

The receiver must locate frame boundaries in a raw bit stream. Three classic methods:

* **Character count:** header states the frame length — simple, but one corrupted count desynchronizes *everything* after it.
* **Byte stuffing:** flag bytes (e.g. `FLAG`) delimit frames; any `FLAG` byte *inside* data is escaped (`ESC FLAG`). Overhead grows with unlucky payloads.
* **Bit stuffing:** flag `01111110` delimits; the sender inserts a `0` after any five consecutive data `1`s, the receiver strips it — the standard HDLC/USB approach, self-synchronizing after any error burst.

::: callout-formula KTU Formula Vault: Framing Methods
Count (fragile) · **byte stuffing** (escape FLAG/ESC bytes) · **bit stuffing** (0 after five 1s, flag 01111110). Exam pattern: "stuff this bitstream" — scan left to right, insert 0 after every run of five 1s *in the data*, then wrap with flags.
:::

::: callout-pitfall Reliable per Hop ≠ Reliable End to End
Link-layer ACKs protect *one hop*; a frame correctly delivered across link 3 of 5 can still die at link 4's router queue. End-to-end correctness always remains TCP's job — link reliability is a *performance* optimization (fast local recovery on lossy media), never a substitute.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Apply bit stuffing to the data bits `0110111111111100` and frame the result with HDLC flags. Then show the receiver's destuffing.
:::

::: step [Step 2: Execution] Stuffing the Run
Scan for five consecutive `1`s: positions 4–13 hold a run of ten `1`s. Insert `0` after the first five (position 8), which breaks the run; positions 9–13 form five more `1`s, so insert `0` after position 13. Transmitted payload: `011011111` + `0` + `11111` + `0` + `00` = `011011111011111000` (18 bits). Wrap: `01111110 011011111011111000 01111110`. Receiver strips flags, then deletes the `0` following every five-`1` run, recovering the original 16 bits exactly.
:::

::: step [Step 3: Conclusion] Final Result
One stuffed bit immunizes the whole frame against false flag detection — overhead paid only where long 1-runs occur, and any error burst resynchronizes at the next genuine flag. That self-healing property is why bit stuffing outlived byte counting.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Why does the character-count framing method fall out of favor despite its simplicity?
() It requires flags larger than the payload itself
(*) A single corrupted count field misaligns every subsequent frame boundary — one error cascades instead of staying local
() It cannot represent binary data, only text
() Receivers cannot count that fast in hardware
::: explanation
With no resynchronization markers, the receiver's frame boundaries derive entirely from each header's count — corrupt one count and all downstream parsing shifts. Flag-based methods re-acquire sync at every flag, containing damage to one frame.
:::

::: quiz Link-layer reliable delivery (ACKs/retransmissions per hop) is standard on Wi-Fi but usually omitted on fiber links. Why the difference?
() Fiber adapters lack the memory for ACK state
(*) Wireless links lose frames so often that fast local recovery pays off; fiber is clean enough that TCP's end-to-end recovery suffices and per-hop machinery would add pure overhead
() The IEEE forbids reliability on wired media
() Fiber frames are too small to acknowledge
::: explanation
Per-hop reliability is a *loss-rate* decision: high-error media (wireless) benefit from quick local retransmission before TCP's coarse timer fires; low-error fiber gains nothing measurable. Layering principle: pay for mechanisms only where the medium demands them.
:::

::: quiz After bit stuffing, the receiver sees `01111110 01101111101111100 01111110`. How does it recover data and resynchronize after errors?
() It deletes all zeros from the stream
(*) It strips the flags, then removes the 0 following every run of five 1s; any error burst ends at the next genuine flag, which cannot occur inside stuffed data
() It asks the sender to retransmit the flags
() Destuffing is impossible — stuffing is one-way
::: explanation
The stuffed 0 is uniquely identifiable (only place a 0 directly follows five 1s), so removal is exact. And since stuffed payload can never contain the flag pattern, the next flag is guaranteed genuine — errors self-heal within one frame.
:::
