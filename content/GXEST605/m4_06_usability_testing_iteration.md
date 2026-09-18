# Usability Testing & Iteration Discipline

**The Test phase as its own craft — five-user economics, think-aloud protocol, SUS scoring traced by hand, feedback triage, and knowing when to stop refining.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Dress Rehearsal With Microphones
A prototype without testing is a play never rehearsed before opening night. **Usability testing** invites five audience members, hands them real tasks, microphones their thoughts (think-aloud), and counts the stumbles — then the team triages every stumble into a design change and rehearses again. Alpha/beta (M4.3) asked "does it work?"; testing asks "can *they* work it?" — different question, different users, different data.
:::

Five users, not fifty: Nielsen's economics below is why student teams can afford rigour — testing is priced for studios, not corporations.

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Test economics and protocol

Nielsen's rule: with per-user discovery probability $p \approx 0.31$, $n = 5$ users uncover $1 - (1-p)^n \approx 84\%$ of usability problems — the 6th user mostly re-finds known issues (diminishing returns, test in waves of five). Protocol: representative users, realistic tasks (no leading hints), think-aloud narration, neutral facilitation, severity-graded observations. Metrics: task success rate, time-on-task, error count, SUS (System Usability Scale) score.

### 2.2 SUS scoring and triage

SUS: $10$ alternating-polarity statements (odd = positive, even = negative), $1$–$5$ each. Score $= 2.5 \times (\sum_{odd}(r-1) + \sum_{even}(5-r))$ → $0$–$100$ scale; $68$ is the average benchmark. Triage every finding: must-fix (blocks tasks), should-fix (slows users), could-fix (polish) — each mapped back to its phase (wording → define, flow → ideate, control → prototype) for the next loop. Stop rule: successive waves surface only could-fixes — ship it.

::: callout-formula KTU Formula Vault: Testing
$5$ users $\approx 84\%$ issues ($1-(1-p)^n$) · think-aloud + neutral tasks · SUS $= 2.5 \times$ adjusted sum, $68 =$ average · triage must/should/could → re-enter phase · stop at could-only waves.
:::

SUS alternates polarity to defeat straight-line answering — scoring even items backwards is load-bearing, and the commonest SUS arithmetic fault.

::: callout-pitfall Leading the Witness
"Click the big green checkout button" is not a task, it is the answer wearing a costume. Tasks must state *goals* ("buy the cheapest headphones") with silent facilitators — every hint inflates success rates and voids the wave's verdict.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
One respondent rates your prototype SUS items $[4, 2, 5, 1, 4, 2, 5, 1, 3, 2]$ (items $1$–$10$). Compute the SUS score and interpret it against the $68$ benchmark.
:::

::: step [Step 2: Execution] Odd Up, Even Down
Odd items (positive, score $r-1$): positions $1,3,5,7,9$ hold $4,5,4,5,3$ → $(3) + (4) + (3) + (4) + (2) = 16$. Even items (negative, score $5-r$): positions $2,4,6,8,10$ hold $2,1,2,1,2$ → $(3) + (4) + (3) + (4) + (3) = 17$. Adjusted sum $= 16 + 17 = 33$. SUS $= 33 \times 2.5 = 82.5$.
:::

::: step [Step 3: Conclusion] Final Result
$82.5$ — comfortably above the $68$ average (roughly top-quartile territory): ship-condition on usability, pending must-fix triage. Sanity: max possible is $40 \times 2.5 = 100$ (all $5$s on odd, all $1$s on even); straight-$3$s give $20 \times 2.5 = 50$ — this respondent clearly favoured the design on both polarities.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Five-User Math
$p = 0.31$ per user. Share of issues found by $5$ users?
(A) $5 \times 31\% = 155\%$, everything twice
(*B) $1 - 0.69^5 = 1 - 0.1564 \approx 84\%$ — overlap discounts the naive sum ($0.69^2 \approx 0.476$, $0.69^4 \approx 0.227$, $\times 0.69 \approx 0.156$); the 6th user buys $\approx 5\%$ more, wave economics made exact
(C) $31\%$, users don't stack
(D) $100\%$ guaranteed
::: explanation
Independent discovery multiplies *miss* rates ($0.69^5$), and one minus that is coverage. Linear addition double-counts shared finds — the $84\%$ figure prices waves of five as the sweet spot, fifteen as luxury.
:::

::: quiz Q2: Polarity Trap
A respondent answers $5$ to all $10$ SUS items. Score?
(A) $100$, perfect love
(*B) $2.5 \times ((5 \times 4) + (5 \times 0)) = 2.5 \times 20 = 50$ — straight-lining contradicts itself on even (negative) items, landing exactly mid-scale: the polarity alternation doing its watchdog job, rewarding attention and punishing autopilot
(C) $0$, total rejection
(D) $68$, always average
::: explanation
Odd items contribute $5-1 = 4$ each ($20$), evens $5-5 = 0$ ($0$). All-$5$s is self-cancelling by design — genuine praise scores high-odd *and* low-even; flat lines of any value collapse toward the middle.
:::

::: quiz Q3: Stop Rule
Wave $3$ surfaces two could-fixes, zero must/should. Ship or loop?
(A) Loop until zero findings ever
(*B) Ship (after logging the coulds) — successive could-only waves mean the design harvest is gathered; further loops burn calendar for polish while pilot feedback (M4.4's real users) would teach more per week
(C) Skip triage, ship silently
(D) Restart at empathize regardless
::: explanation
Testing has diminishing returns by construction ($84\%$-per-wave math cuts both ways: late waves find little). Could-only findings plus a logged backlog is the professional stop signal — perfection loops are procrastination with clipboards.
:::
