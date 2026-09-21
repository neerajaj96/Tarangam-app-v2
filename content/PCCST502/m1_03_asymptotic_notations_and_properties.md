---
id: m1_03_asymptotic_notations_and_properties
courseCode: PCCST502
module: 1
sequence: 3
title: 'Asymptotic Notations: Big-O, Omega, Theta, Little-o, Little-omega'
difficulty: beginner
estimatedMinutes: 10
learningObjectives:
  - Define all five notations with limits, constants and thresholds
  - Pick the tightest true statement among competing bounds
  - Apply transitivity, reflexivity and symmetry of growth relations
concepts:
  - asymptotic notation
  - tight bounds
  - notation properties
prerequisites:
  - m1_02_time_space_complexity_best_worst_average
examRelevance: high
tags:
  - complexity
  - asymptotics
---
# Asymptotic Notations: Big-O, Omega, Theta, Little-o, Little-omega

**Formal mathematical definitions via limits and constants (c, n0), transitivity, reflexivity, and symmetry.**

<a id="the-intuition"></a>
## 1. Start from zero — the problem first

**Problem first.** Saying "this algorithm takes exactly $3n^2 + 5n + 2$ operations" is overspecified: the $3$, $5$, $2$ depend on language, compiler, and machine — irrelevant details. What survives across all machines is the *shape* of growth: doubling $n$ roughly quadruples the work (quadratic shape), whatever the constants. Asymptotic notation keeps exactly that shape and throws away the rest.

::: callout-intuition Core Mental Model
Describing runners, you would say "A is roughly twice as fast as B over long races" rather than "A finishes in exactly 42.7 seconds" — the exact number depends on wind and shoes; the *relationship* is the durable fact. Big-O gives an *upper bound* ("never grows faster than this"), Big-Omega a *lower bound* ("never grows slower"), Big-Theta a *tight bound* ("exactly this rate, both sides"). Little-o and little-omega are the strict cousins: *strictly* slower / faster, never equal.
:::

**Tiny toy example.** $f(n) = 3n + 2$ vs $g(n) = n^2$: at $n = 3$, $f = 11 > g = 9$. At $n = 100$, $f = 302 \ll g = 10{,}000$. Asymptotics asks about large $n$ only — the crossover, not the small-$n$ skirmish.

---

<a id="the-math"></a>
## 2. Basic idea, then formal theory

**Meaning first, then variables.** Let $f(n)$ and $g(n)$ be functions from positive integers to positive reals: $f$ is usually the algorithm's true operation count, $g$ a simple reference ($n$, $n^2$, $\log n$). Symbols: $c$ = a positive constant multiplier we may choose; $n_0$ = a threshold beyond which the claim must hold.

**Big-O (upper bound, "at most this fast-growing"):**
$$f(n) = O(g(n)) \iff \exists\ c > 0,\ n_0 > 0 \text{ such that } 0 \le f(n) \le c\cdot g(n)\ \ \forall n \ge n_0$$
Beyond $n_0$, $f$ never exceeds a constant multiple of $g$. Used for worst-case guarantees: "$O(n^2)$" means grows *no faster than* $n^2$.

**Big-Omega (lower bound, "at least this fast-growing"):**
$$f(n) = \Omega(g(n)) \iff \exists\ c > 0,\ n_0 > 0 \text{ such that } 0 \le c\cdot g(n) \le f(n)\ \ \forall n \ge n_0$$
$f$ grows *at least as fast as* a multiple of $g$. Used for best-case guarantees and inherent-difficulty ("any correct algorithm needs at least this long").

**Big-Theta (tight bound, "exactly this rate"):**
$$f(n) = \Theta(g(n)) \iff f(n) = O(g(n)) \text{ and } f(n) = \Omega(g(n))$$
Equivalently, $c_1 g(n) \le f(n) \le c_2 g(n)$ for $n \ge n_0$ — sandwiched between two multiples of the *same* $g$. Strongest statement; reach for it whenever both bounds match.

**Little-o (strict upper bound):** $f(n) = o(g(n))$ means $f$ grows *strictly slower* — formally, $\lim_{n\to\infty} \frac{f(n)}{g(n)} = 0$. Rules out equal rates (so $n \ne o(n)$, but $n = o(n^2)$).

**Little-omega (strict lower bound):** $f(n) = \omega(g(n))$ means $f$ grows *strictly faster* — formally, $\lim_{n\to\infty} \frac{f(n)}{g(n)} = \infty$ (so $n^2 = \omega(n)$, but $n \ne \omega(n)$).

**Structural properties (manipulate bounds like algebra):**
- **Reflexivity:** $f = O(f)$, $\Omega(f)$, $\Theta(f)$ — everything weakly bounds itself. Little-o/little-omega are *not* reflexive (strictness forbids equality).
- **Symmetry:** $f = \Theta(g) \iff g = \Theta(f)$ — Theta is two-way. Big-O/Omega are *not* symmetric ($n = O(n^2)$, but $n^2 \ne O(n)$).
- **Transitivity:** $f = O(g)$, $g = O(h)$ $\Rightarrow$ $f = O(h)$ — same for $\Omega$, $\Theta$. Chain comparisons without re-deriving.

::: callout-formula KTU Formula Vault: The Five Notations
$O$ = upper ($\le$, "at most") · $\Omega$ = lower ($\ge$, "at least") · $\Theta$ = both at once ("exactly", needs the *same* $g$) · $o$ = *strictly* slower (limit ratio $0$) · $\omega$ = *strictly* faster (limit ratio $\infty$). Reflexive: $O, \Omega, \Theta$ only. Symmetric: $\Theta$ only. Transitive: $O, \Omega, \Theta$. Exam asks "which notation is symmetric?" — always $\Theta$.
:::

---

<a id="worked-example"></a>
## 3. Worked example — proving $3n^2 + 5n + 2 = O(n^2)$

::: step [Step 1: Setup] Formulating the Problem
Prove $f(n) = 3n^2 + 5n + 2$ is $O(n^2)$ — find explicit constants $c$ and $n_0$ satisfying the Big-O definition.
:::

::: step [Step 2: Execution] Applying Core Algorithm
Need $3n^2 + 5n + 2 \le c n^2$ for $n \ge n_0$. For $n \ge 1$: $5n \le 5n^2$ and $2 \le 2n^2$, so $3n^2 + 5n + 2 \le 3n^2 + 5n^2 + 2n^2 = 10n^2$. Holds with $c = 10$, $n_0 = 1$.
:::

::: step [Step 3: Conclusion] Final Result
$(c, n_0) = (10, 1)$ witnesses the definition, so $f(n) = O(n^2)$ is proven, not guessed. (Tighter pairs exist — $c = 4$, $n_0 = 6$, since $5n + 2 \le n^2$ for $n \ge 6$ — but the definition needs only *some* valid pair.)
:::

---

<a id="watch-out"></a>
## 4. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- "$f = O(g)$" does *not* mean "$f$ and $g$ grow equally" — it is one-directional. $n = O(n^{100})$ is true but uselessly loose.
- Little-o vs Big-O: $n = O(n)$ is true; $n = o(n)$ is false. The little version forbids equality.
- $n_0$ can be large and $c$ ugly — the definition only asks that *some* pair exists.

| Similar pair | Distinction that earns marks |
|---|---|
| $O$ vs $\Theta$ | Upper only vs both bounds with the same $g$ |
| $o$ vs $O$ (and $\omega$ vs $\Omega$) | Strict (limit $0$/$\infty$) vs weak (allows equality) |
| Symmetry holders | Only $\Theta$ is symmetric; $O$, $\Omega$ are one-way |

**Exam recap (facts an examiner rewards):** write any definition with its $(c, n_0)$ quantifiers; symmetric = $\Theta$ only; reflexive = $O, \Omega, \Theta$ (never little-o/omega); transitive chains $O(n \log n) \Rightarrow O(n^2)$.

---

<a id="self-check"></a>
## 5. Active Recall Quizzes

::: quiz Which asymptotic notation gives the *tightest* possible statement about a function's growth — both an upper and a lower bound simultaneously?
() Big-O
() Big-Omega
(*) Big-Theta
() Little-o
::: explanation
Big-Theta requires proving both $f(n) = O(g(n))$ (upper bound) and $f(n) = \Omega(g(n))$ (lower bound) hold with the *same* $g(n)$, sandwiching $f(n)$ between two constant multiples of $g(n)$. Big-O alone only gives an upper bound, and Big-Omega alone only gives a lower bound.
:::

::: quiz If $f(n) = O(g(n))$, is it necessarily true that $g(n) = O(f(n))$?
() Yes, Big-O is always symmetric
(*) No — Big-O is not symmetric in general; only Big-Theta guarantees this two-way relationship
() Yes, but only when $n_0 = 0$
() No relationship can ever be inferred
::: explanation
Big-O is a one-directional upper-bound statement. For example, $n = O(n^2)$ is true, but $n^2 = O(n)$ is false — $n^2$ grows strictly faster than $n$. Only Big-Theta ($f=\Theta(g)$) is guaranteed symmetric, because it requires bounds in both directions by definition.
:::

::: quiz Using transitivity, if you know Algorithm A is $O(n \log n)$ and $n \log n$ is $O(n^2)$, what can you immediately conclude about Algorithm A?
() Nothing further can be concluded
(*) Algorithm A is also $O(n^2)$
() Algorithm A must be exactly $\Theta(n^2)$
() Algorithm A is $O(\log n)$
::: explanation
Transitivity of Big-O states: if $f(n)=O(g(n))$ and $g(n)=O(h(n))$, then $f(n)=O(h(n))$. Here $f = $ Algorithm A's cost, $g = n\log n$, $h = n^2$, so Algorithm A is $O(n^2)$ — though note this is a weaker (looser) statement than the original, tighter $O(n\log n)$ bound.
:::
