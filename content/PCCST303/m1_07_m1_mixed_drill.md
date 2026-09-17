# M1 Drill: Complexity, Stack/Queue & Expression Traces

**Timed mixed practice — growth ranking, pointer simulations, and full expression traces.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Three Reflexes
M1 exams test reflexes, not recall: rank growth instantly (ladder), simulate pointers without code (top/front/rear walk), and trace tokens showing every stack (conversion + evaluation). Drill until each takes under two minutes.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Speed table

Rank: $1<\log n<n<n\log n<n^2<n^3<2^n<n!$ · stack/queue ops $O(1)$ · false overflow → ring → `%MAX` · conversion: pop-$\ge$-push · evaluation: pop $b,a$.

::: callout-formula KTU Formula Vault: M1 Speed
Ladder + **$O(1)$** stack/queue · ring **full = next-rear meets front** · **$a\ op\ b$** order.
:::

::: callout-exam KTU Exam Focus
The 9-marker is one trace (conversion *or* evaluation with full stacks) plus one analysis (loops → $\Theta$). Show states per step — graders award per correct intermediate, not just the finale.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) Rank $n!$, $n\log n$, $2^n$, $n^3$. (b) Convert $(A+B)\times C$. (c) Loop `for i in 1..n: for j in 1..i` complexity?
:::

::: step [Step 2: Execution] Rank, Convert, Count
1. $n^3 < n\log n$? No: $n\log n < n^3 < 2^n < n!$ (exponentials beat polynomials; factorial beats all).
2. $A,B$ out; $+$ waits; $)$ flushes $+$; $\times$ waits; $C$ out; flush: $AB+C\times$.
3. Triangular $n(n+1)/2$ → $\Theta(n^2)$.
:::

::: step [Step 3: Conclusion] Final Result
Rank by ladder position, brackets by flush rule, triangles by $n^2/2$. Three reflexes, three lines.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Mixed Drill
Order by growth: $2^n$, $n^2$, $n\log n$, $n!$:
(A) $n! < 2^n < n^2 < n\log n$
(*B) $n\log n < n^2 < 2^n < n!$
(C) $n^2 < n\log n < n! < 2^n$
(D) All equal asymptotically
::: explanation
Near-linear $n\log n$ first, polynomial $n^2$, then exponential $2^n$, factorial last. Any adjacent swap fails ratio tests as $n\to\infty$ — walk the ladder verbatim.
:::

::: quiz Q2: Mixed Drill
Evaluate $6\,2\,3\,+\,-$:
(*A) $1$ — pushed $6,2,3$; $+$ pops $3,2$ giving $5$; $-$ pops $5,6$ giving $6-5 = 1$
(B) $5$
(C) $7$
(D) $-1$
::: explanation
Token walk: stack $[6,2,3]$ → $+$ gives $[6,5]$ → $-$ gives $[1]$. Final $1$. Verify each pop pair top-down ($b$ first, then $a$) — order is the whole exercise.
:::

::: quiz Q3: Mixed Drill
Circular queue MAX $= 6$ holds $5$ max. Front advances twice from a full queue, then two enqueues. Net state?
(A) Overflow on second enqueue
(*B) Full again, no error — two freed cells accept exactly two arrivals via wrap
(C) Empty
(D) Underflow
::: explanation
Full (5 held, 1 sacrificed) → 2 dequeues free 2 → 2 enqueues refill to full. Balanced traffic never errors — count net occupancy instead of fearing the wrap.
:::
