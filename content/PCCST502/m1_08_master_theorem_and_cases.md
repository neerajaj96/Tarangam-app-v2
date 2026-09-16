# The Master Theorem for Divide-and-Conquer Recurrences

**Master Theorem formula T(n) = aT(n/b) + f(n), Case 1, Case 2, and Case 3.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model
You've now solved recurrences the hard way twice — once by unrolling them level by level (iteration method) and once by drawing them out as a tree and summing level totals (recursion tree method). Both times, you probably noticed the same underlying question kept deciding the answer: "does the work happening *at the root* (splitting the problem, combining sub-results) dominate, or does the work happening *at the leaves* (the sheer number of base-case calls) dominate, or are they perfectly balanced?"

The Master Theorem is exactly this observation, turned into a plug-and-chug formula, so that for the huge and extremely common family of recurrences shaped like $T(n) = aT(n/b) + f(n)$, you no longer need to draw a tree or unroll anything by hand — you compare $f(n)$ against a specific reference quantity ($n^{\log_b a}$), see which of three cases you land in, and read off the answer directly. It's the "cheat sheet" version of everything the recursion tree method taught you — powerful precisely *because* you now understand why it works, rather than just memorising it blindly.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

**Setup.** The Master Theorem applies to recurrences of the exact form:
$$T(n) = a\,T(n/b) + f(n), \qquad a \ge 1,\ b > 1$$
where $a$ = number of sub-problems per call, $b$ = factor by which the problem size shrinks, and $f(n)$ = the cost of the work done *outside* the recursive calls (splitting the problem and combining results).

The theorem compares $f(n)$ against the reference function $n^{\log_b a}$ (this is exactly the leaf-level cost derived in the recursion tree method):

**Case 1 — leaves dominate.** If $f(n) = O(n^{\log_b a - \epsilon})$ for some constant $\epsilon > 0$ (i.e. $f(n)$ grows *polynomially slower* than $n^{\log_b a}$), then:
$$T(n) = \Theta(n^{\log_b a})$$

**Case 2 — balanced (every level contributes equally).** If $f(n) = \Theta(n^{\log_b a})$ (i.e. $f(n)$ grows at *the same rate* as $n^{\log_b a}$), then:
$$T(n) = \Theta(n^{\log_b a} \log n)$$

**Case 3 — root dominates.** If $f(n) = \Omega(n^{\log_b a + \epsilon})$ for some constant $\epsilon > 0$ (i.e. $f(n)$ grows *polynomially faster* than $n^{\log_b a}$), **and** the regularity condition $a\,f(n/b) \le c\,f(n)$ holds for some constant $c<1$ and large enough $n$ (a technical condition almost always satisfied for typical polynomial/logarithmic $f(n)$), then:
$$T(n) = \Theta(f(n))$$

**Important caveat — the "gap" between cases.** The three cases don't cover *every possible* $f(n)$ — there's a gap between "polynomially slower" and "polynomially faster" (e.g. $f(n)$ that differs from $n^{\log_b a}$ only by a logarithmic factor, like $f(n) = n^{\log_b a}\log^2 n$, technically doesn't satisfy Case 2's exact-match requirement nor either polynomial-difference requirement in the classic three-case statement above). When a recurrence falls in this gap, the Master Theorem (in this basic form) simply doesn't apply, and you must fall back to the iteration or recursion-tree method (or a more advanced version of the theorem) to solve it directly.

::: callout-formula KTU Formula Vault: Master Theorem in 30 Seconds
Compute $n^{\log_b a}$ first. $f$ polynomially *slower* → **Case 1**: $\Theta(n^{\log_b a})$. $f$ *equal* → **Case 2**: $\Theta(n^{\log_b a}\log n)$. $f$ polynomially *faster* (+ regularity) → **Case 3**: $\Theta(f(n))$. Differs only by a $\log$ factor → **gap**: theorem silent, unroll by hand.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
Apply the Master Theorem to Binary Search's recurrence, $T(n) = T(n/2) + O(1)$ (here $a=1$, $b=2$, $f(n)=O(1)=\Theta(n^0)$), and separately to Merge Sort's recurrence, $T(n) = 2T(n/2) + \Theta(n)$ (here $a=2$, $b=2$, $f(n)=\Theta(n)$).
:::

::: step [Step 2: Execution] Applying Core Algorithm
**Binary Search:** compute the reference exponent $\log_b a = \log_2 1 = 0$, so $n^{\log_b a} = n^0 = 1$. Compare to $f(n) = \Theta(1) = \Theta(n^0)$ — this exactly matches the reference function, so we're in **Case 2**.
**Merge Sort:** compute $\log_b a = \log_2 2 = 1$, so $n^{\log_b a} = n^1 = n$. Compare to $f(n) = \Theta(n) = \Theta(n^1)$ — again an exact match with the reference function, so this is also **Case 2**.
:::

::: step [Step 3: Conclusion] Final Result
**Binary Search:** Case 2 gives $T(n) = \Theta(n^{\log_b a}\log n) = \Theta(n^0 \log n) = \Theta(\log n)$ — matching the earlier intuitive derivation in the Module 1 overview.
**Merge Sort:** Case 2 gives $T(n) = \Theta(n^1 \log n) = \Theta(n\log n)$ — matching exactly the result derived earlier, the hard way, by the iteration method. This confirms the Master Theorem is simply a formalised shortcut for the same reasoning we already worked through by hand.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz In the Master Theorem for $T(n) = aT(n/b)+f(n)$, which case applies when $f(n)$ grows at *exactly* the same rate as $n^{\log_b a}$?
() Case 1
(*) Case 2
() Case 3
() None of the cases apply
::: explanation
Case 2 is defined precisely by $f(n) = \Theta(n^{\log_b a})$ — the extra work per call matches the reference function's growth rate exactly, meaning every level of the recursion tree contributes roughly equal total work, giving the extra $\log n$ factor: $T(n) = \Theta(n^{\log_b a}\log n)$.
:::

::: quiz For the recurrence $T(n) = 4T(n/2) + n$, what is $n^{\log_b a}$, and which Master Theorem case applies?
() $n^{\log_2 4} = n$; since $f(n)=n$ matches the reference exactly, this is Case 2, giving $T(n)=\Theta(n\log n)$
(*) $n^{\log_2 4} = n^2$; since $f(n)=n$ grows polynomially slower, this is Case 1, giving $T(n)=\Theta(n^2)$
() $n^{\log_2 4} = n^2$; this is Case 3, giving $T(n)=\Theta(n)$
() $n^{\log_2 4} = n^2$; this is Case 2, giving $T(n)=\Theta(n^2\log n)$
::: explanation
Here $a=4, b=2$, so $\log_b a = \log_2 4 = 2$ (not 1 — a common slip is reading $\log_2 4$ as 1), giving reference function $n^2$. Since $f(n)=n=n^1$ grows polynomially slower than $n^2$ (i.e. $f(n) = O(n^{2-\epsilon})$ for $\epsilon=1$), this satisfies Case 1, and the leaves dominate: $T(n) = \Theta(n^{\log_b a}) = \Theta(n^2)$.
:::

::: quiz Which of the following recurrences falls *outside* the basic three-case Master Theorem (i.e., is in the "gap" where none of the three cases cleanly apply)?
() $T(n) = 2T(n/2) + n$
() $T(n) = T(n/2) + 1$
(*) $T(n) = 2T(n/2) + n\log n$
() $T(n) = 3T(n/2) + n^3$
::: explanation
Here $\log_b a = \log_2 2 = 1$, so the reference function is $n$. $f(n) = n\log n$ is asymptotically larger than $n$ but not by a full polynomial factor $n^\epsilon$ for any constant $\epsilon>0$ — it only differs by a logarithmic factor. This sits in the gap between Case 2 (exact match) and Case 3 (polynomially larger), so the basic Master Theorem doesn't directly apply; the actual answer, $\Theta(n\log^2 n)$, requires the iteration or recursion-tree method (or an extended version of the theorem) to derive.
:::
