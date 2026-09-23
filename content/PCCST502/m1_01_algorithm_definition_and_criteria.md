---
id: m1_01_algorithm_definition_and_criteria
courseCode: PCCST502
module: 1
sequence: 1
title: 'Algorithms: Characteristics & Analysis Criteria'
difficulty: beginner
estimatedMinutes: 35
learningObjectives:
  - Define an algorithm word by word from first principles
  - Test any procedure against finiteness, definiteness, input, output and effectiveness
  - Separate "the algorithm terminates" from "the algorithm is correct"
  - Explain input and output contracts including the zero-input edge case
  - Read beginner pseudocode and explain every keyword used
  - Explain the RAM model and why stopwatch timing cannot compare algorithms
  - Separate time efficiency from space efficiency with a plain-number trade-off
  - State what M1T2 will measure next and why this topic prepares it
concepts:
  - algorithm definition
  - finiteness
  - definiteness
  - input
  - output
  - effectiveness
  - correctness
  - pseudocode
  - RAM model
  - basic operation
  - time efficiency
  - space efficiency
prerequisites: []
examRelevance: medium
tags:
  - foundations
  - algorithms
  - ram-model
  - pseudocode
---
# Algorithms: Characteristics & Analysis Criteria

**What an algorithm is, the five properties every algorithm must satisfy, how to tell an algorithm apart from vague advice, and the simple model we use to compare algorithms fairly.**

<a id="bridge-from-overview"></a>
## 1. Bridge — from the module map to the first real question

In the previous topic, we mapped the whole of Module 1: first define what an algorithm even is, then define how to count its work, then learn a compact notation for that work, then calculate it for loops and recursion, and finally apply it all to AVL trees. That map also gave us the module's standing rule: analysis always asks "how does the work grow as input size $n$ grows?" — never "how many seconds on my laptop?".

Here, $n$ simply means input size — for example, the number of elements in a list. If a list has 5 numbers, $n = 5$.

This topic answers the map's very first question: **what qualifies as an algorithm at all?** Before we can count any algorithm's work, we must agree on which sets of instructions deserve the name. Everything in this topic is assumed by every later topic, so read it as the foundation, not as trivia.

::: callout-intuition Core Mental Model
Think of an algorithm like a recipe for making tea. A real recipe must: (1) actually end — never "keep stirring forever", (2) make every instruction crystal clear — "add 2 teaspoons of sugar", not "add some sugar", (3) name its ingredients up front (input) — you cannot make tea from nothing without saying so, (4) produce tea at the end (output) — a recipe producing nothing is useless, and (5) use only steps you can actually perform with what you have (effectiveness) — "add a pinch of moon dust" fails because moon dust is not obtainable. Drop the food analogy now: the five technical criteria in §3 are the exact, testable version of this intuition.
:::

**Tiny toy example.** "To find the biggest of 3 numbers: compare the first two, keep the winner, compare it with the third, return the winner." It ends after 2 comparisons (finite), every step says exactly what to compare (definite), it starts from 3 given numbers (input), it returns the biggest (output), and every step is something you can actually do (effective). That is an algorithm. Replace "compare" with "stare at them until the biggest becomes obvious" and it stops being one — you will see exactly why in §3.

<a id="what-is-an-algorithm"></a>
## 2. The definition, one word at a time

**The definition.** An algorithm is a finite sequence of well-defined instructions for solving a problem.

That sentence is short, but every word carries weight. A beginner who memorises it without unpacking it will misuse it, so unpack it we must — word by word.

**Finite.** In ordinary language, "finite" means "it ends" — as opposed to "infinite", which goes on forever. For an algorithm, finite means: no matter which valid input you give it, the instructions run for some limited number of steps and then stop. Why does a computer need this? Because a procedure that might never stop can never hand you an answer — you would wait forever. Finite example: "compare two numbers, return the bigger, stop" — 1 comparison, then done. Non-finite example: "keep guessing numbers until one feels right" — there is no point at which stopping is guaranteed.

::: toggle What does `valid input` mean here?
`Valid input` = an input the problem statement allows. If the problem is "find the biggest of a list of numbers", a list of numbers is valid input; the instruction manual failing on a shopping list is not the algorithm's fault. Finiteness only promises termination for inputs the problem covers — every valid one, without exception.
:::

**Sequence.** In ordinary language, a sequence is things in an order — first this, then that. For an algorithm, sequence means the instructions come in a fixed, followable order: step 1, then step 2, then step 3. Why it matters: order changes meaning. "Crack the egg, then heat the pan" and "heat the pan, then crack the egg into it" are different procedures with different outcomes. An algorithm's steps run in the stated order unless an instruction explicitly says to repeat or branch (more on the words for that in §7).

**Instruction.** In ordinary language, an instruction tells someone to do one thing. For an algorithm, an instruction is a single step the executor — a computer, or you with pencil and paper — can carry out without needing further invention. "Compare these two numbers" is an instruction. "Be clever about it" is not, because the executor must invent what "be clever" means.

**Well-defined.** In ordinary language, "well-defined" means "stated so precisely that nobody can misunderstand it". For an algorithm, it means each instruction has exactly one possible meaning — two people following it do exactly the same thing. "Add 2 teaspoons of sugar" is well-defined. "Add sugar" is not: one person adds a pinch, another adds a cup. A computer cannot ask you what you meant, so every step must survive without clarification.

**Problem.** In ordinary language, a problem is just something bothering you. For an algorithm, a problem is a precisely stated task with two parts: what may be given (the allowed inputs) and what counts as a solution (the required output condition — how you would check the answer is right). "Find the biggest number in a list" is a problem: input = a list of numbers, solution check = the answer is in the list and nothing in the list is bigger. "Make the numbers nice" is not a problem yet, because nobody can check whether "nice" was achieved.

**Solving.** In ordinary language, solving means producing the answer. For an algorithm, solving means producing an output that passes the problem's solution check — every time, for every valid input. Not "usually right". Not "right on the examples I tried". Always right, checkably right.

**Putting it back together.** An algorithm is a finite (it always stops) sequence (ordered steps) of well-defined (exactly one meaning each) instructions (executable steps) for solving (always producing a checkably correct answer to) a problem (a task with stated inputs and a solution check). If any one of those words fails, you have advice, a goal, or a broken procedure — not an algorithm.

| It says "algorithm" | It is actually | Why it fails the definition |
|---|---|---|
| "Keep guessing until it looks right." | Vague advice | Not finite (may never stop), not well-defined ("looks right" means different things to different people) |
| "Find the largest number." | A goal, not a method | No instructions at all — it states what is wanted, not how to get it |
| "Set max to the first element. Compare each remaining element with max; if larger, update max. Return max." | An algorithm | Finite, ordered, unambiguous, executable, and always returns the true maximum |

<a id="five-characteristics"></a>
## 3. The five classical characteristics

Textbooks test five properties. Each one below follows the same pattern: plain meaning, technical meaning, why it matters, a passing example, a failing example, and the trap beginners fall into.

**3.1. Finiteness — it must end.**

Plain meaning: the instructions come to a stop. Technical meaning: for every valid input, the algorithm terminates after some finite number of steps. Why it matters: a non-terminating procedure never delivers an answer, so nothing can be checked, compared, or used. Passing example: finding the maximum of $n$ numbers takes exactly $n - 1$ comparisons (for $n = 5$, that is 4 comparisons) and then stops. Failing example: "repeat step 2 forever, noting each result" — by construction it never stops. Trap: beginners confuse "runs for a long time" with "infinite". An algorithm that takes a million steps on a huge input is still finite — it stops. Finiteness is about *guaranteed stopping*, not speed.

::: toggle Is an operating system an algorithm, then?
Strictly speaking, no — and this is the classic exam trap. An operating system's main loop is *designed* never to terminate ("keep serving users until switched off"). Such never-ending procedures are called `computational procedures`: they satisfy every characteristic except finiteness. In this strict classical sense, "algorithm" requires termination; an OS main loop is a computational procedure, not an algorithm. Remember the one-word difference: terminates versus runs-forever-by-design.
:::

**3.2. Definiteness — every step has exactly one meaning.**

Plain meaning: nobody can read a step two ways. Technical meaning: each instruction is precisely and unambiguously specified; execution is deterministic — the same state always leads to the same next step. Why it matters: computers cannot resolve ambiguity. If a step can be read two ways, two machines (or two runs) do different things, and correctness becomes uncheckable. Passing example: "if the element is larger than max, set max to the element" — the condition and the action are both exact. Failing example: "repeat until the result looks good enough" — "good enough" has no checkable meaning. Trap: beginners think definiteness is about *detail* ("longer instructions are more definite"). It is about *uniqueness of meaning*: one short sentence with one meaning beats a paragraph with two meanings.

**3.3. Input — what is supplied from outside.**

Plain meaning: the ingredients handed to the procedure. Technical meaning: zero or more quantities supplied externally, before or during execution. Why it matters: the input contract fixes what the algorithm may assume exists — without it, there is nothing to work on and nothing the correctness promise ranges over. Passing example: the list of numbers handed to a maximum-finding algorithm. Failing example (a broken contract, not a broken rule): running maximum-finding with no list supplied when the problem requires one — the algorithm is fine, the caller broke the contract. Trap: "zero or more" surprises beginners — an algorithm may take *no* input at all (see §5). Zero input is allowed; zero output is not.

**3.4. Output — what is produced, and it must solve the problem.**

Plain meaning: the dish that comes out. Technical meaning: at least one quantity is produced, and it must stand in the specified relationship to the inputs — it must actually satisfy the problem's solution check. Why it matters: an algorithm exists to solve the problem. Output that is unrelated to the input (or wrong) means the problem is unsolved however elegantly the steps ran. Passing example: returning the largest element of the list — checkable: it is in the list, nothing exceeds it. Failing example: a "sorting" procedure that returns the numbers in whatever order they arrived — it produces something, but the output violates the sortedness the problem demands. Trap: beginners think any output counts. It does not: output must satisfy the specification (§4 works this out fully).

**3.5. Effectiveness — every step must be actually doable.**

Plain meaning: each step is something you could really carry out. Technical meaning: every operation is basic enough to be performed exactly, in finite time, by the executor — classically, "with pencil and paper in finite time". Why it matters: a step can be perfectly clear yet impossible, and an impossible step can never run. Passing example: "add these two numbers", "compare these two numbers", "store this value". Failing example: "guess the password", "divide by zero to obtain the answer", "teleport the data to the server". Trap: confusing effectiveness with definiteness — handled head-on in §6, because this is the single most examined confusion in this topic.

**Compact table — all five at a glance.**

| Characteristic | One-line test | Passes | Fails |
|---|---|---|---|
| Finiteness | Does it always stop? | Max of $n$ numbers: $n - 1$ comparisons, then stop | "Keep improving the guess forever" |
| Definiteness | Does each step mean exactly one thing? | "Add 2 teaspoons" | "Add sugar" / "until it looks good" |
| Input | Is the outside supply stated (possibly zero)? | "Given a list of $n$ numbers …" | Caller supplies nothing when a list is required |
| Output | Is at least one result produced that solves the problem? | Returns the true maximum | Returns numbers unsorted from a "sort" |
| Effectiveness | Can each step actually be executed? | Add, compare, store | "Guess", "divide by zero", "teleport" |

<a id="correctness"></a>
## 4. Correctness — stopping is not the same as succeeding

Two different promises are easy to blur:

- "The algorithm terminates" = it stops. That is finiteness (§3.1). It says nothing about the answer.
- "The algorithm is correct" = whenever it stops, the output satisfies the problem's specification — for *every* valid input. It says the answer is right.

An algorithm can keep the first promise and break the second: it finishes, hands you an answer, and the answer is wrong. That is the whole point of correctness as a separate idea.

**Concrete case.** Problem: "find the largest number in a list". Algorithm: "set max to 0; compare each element with max; if larger, update max; return max." It always terminates — finite, definite, effective steps. Now run it on the list $[-5, -2, -9]$: no element exceeds 0, so it returns 0. But 0 is not even in the list, and $-2$ (the true maximum) is larger than nothing here — the output violates the specification. Terminating: yes. Correct: no. The fix (set max to the *first element* instead of 0) is a one-word change with a correctness-sized consequence — which is exactly why correctness is checked against the specification, not against "it ran without crashing".

::: toggle What does `specification` mean, precisely?
The `specification` is the problem's contract: the allowed inputs plus the exact condition the output must satisfy. For maximum-finding: input = a non-empty list of numbers; output condition = the answer belongs to the list AND no list element exceeds it. Correctness means: for every allowed input, the output meets that condition. "Usually works" or "works on my examples" is not correctness — proof over all valid inputs is.
:::

**Where this leads (and where it stops).** Full correctness *proofs* — formal arguments covering all inputs — belong to later study, not to this topic. Here you need only the distinction and the habit: after "does it stop?", always ask "is the answer right on every input, including hostile ones like all-negative lists and single-element lists?". Those hostile inputs have a name you will meet in M1T2: they are the beginning of worst-case thinking.

<a id="input-output"></a>
## 5. Input and output contracts, including zero input

**Input.** Zero or more quantities from outside. Most algorithms take input: a list to search, numbers to add. But "zero" is genuinely allowed: an algorithm that prints the first 100 prime numbers takes no outside supply — the task is fully self-contained. What zero-input does *not* mean is "nothing to work with": the problem statement itself supplies the task ("first 100 primes"), and constants written inside the instructions (100, the number 2 to start testing from) are part of the procedure, not external input.

**Output.** At least one quantity, satisfying the specification. This is mandatory — unlike input. A procedure that takes a list, does arithmetic, and returns nothing has no checkable result; no examiner, user, or later algorithm can verify or use it. Even "print the first 100 primes" has output: the printed numbers, checkable against primality.

**INPUT is not OUTPUT, and "no input" is not "no result".** Read both halves carefully, because exams probe exactly this sentence: an algorithm *can* have no input (self-contained task, e.g. generate primes) but *cannot* have no useful result. "No input" describes where material comes from (nowhere outside); "no result" would describe a procedure that achieves nothing. A prime-generator has the first property and must never have the second.

| Edge case | Verdict | Reason |
|---|---|---|
| Prime-generator with no external input | Valid input contract | Zero inputs are allowed when the task is self-contained |
| Sorting routine that returns nothing | Invalid output contract | At least one output satisfying the specification is mandatory |
| Max-finder called with no list | Caller error, not algorithm error | The problem requires a list; the contract was broken by the caller |

<a id="effectiveness-deep"></a>
## 6. Effectiveness, and why it is not definiteness

Effectiveness asks: *can this step actually be executed?* Definiteness asks: *does this step mean exactly one thing?* Different questions — and a step can pass one while failing the other in both directions:

- Clear but impossible (passes definiteness, fails effectiveness): "add a pinch of moon dust" — one exact meaning, unobtainable ingredient. "Teleport the sorted array to the server" — unambiguous, physically unexecutable as a computational step.
- Executable but ambiguous (passes effectiveness, fails definiteness): "sort the numbers somehow and return them" — every candidate action (compare, swap) is doable, but *which* actions in *which* order is unspecified, so two executors do different things.

Only "compare these two numbers and keep the larger" passes both: one meaning, really doable. In an exam, when asked to distinguish the two, use exactly this two-direction table — one example each way earns full marks; a single vague sentence does not.

<a id="vague-vs-algorithm"></a>
## 7. Goal versus procedure — "find the largest" is not an algorithm

Consider two texts side by side:

- Text A: "Find the largest number."
- Text B: "Set max to the first element. For each remaining element in turn: compare it with max; if it is larger, set max to it. After the last element, return max."

Text A is a goal: it names the desired result and gives no method. Nothing in it can be executed, counted, or checked step by step. Text B is an algorithm: finite (stops after the last element), definite (each action exact), with input (the list), output (max, checkable), and effective steps (compare, assign, return). This is why the course counts Text B's work in M1T2 and has nothing to count in Text A — "find the largest" contains no operations.

Every keyword in Text B is ordinary words doing precise jobs — full pseudocode reading follows in §8, but preview the pattern here: state is held in a named place (`max`), repetition is explicit (`for each remaining element`), choice is explicit (`if it is larger`), and delivery is explicit (`return max`).

<a id="pseudocode"></a>
## 8. Pseudocode — just enough to read every example in this course

**What it is.** Pseudocode is a half-formal notation between plain English and real code: loops and choices written plainly, no compiler, no language to install. You read it; nothing runs it.

**Why it exists.** Tying an algorithm to one programming language would drag in that language's quirks — and stopwatch-style machine dependence the module overview already rejected. Pseudocode describes the *idea* once, readably, so analysis (starting M1T2) counts the idea's operations instead of one laptop's seconds.

**The notation used in this topic's examples.** Only five keyword shapes appear, and each means exactly what it says:

- `name = value` — store a value under a name. `max = first element` means "remember the first element under the name max". Note: `=` here means *store*, not the mathematical equality test — read it as "becomes".
- `for each X in <collection>:` — do the following indented steps once per item, in order. `for each remaining element in the list:` visits element 2, then 3, and so on to the end.
- `if <condition>, <action>` — do the action only when the condition holds. `if it is larger than max, set max to it` compares first, updates only on success.
- `return X` — stop the algorithm and deliver X as the output. Nothing after `return` runs.
- Indentation (the extra spaces at line starts) shows which steps belong inside the `for each` or the `if`. Same rule as an outline: indented lines are sub-steps.

```
Set max to the first element of the list.
For each remaining element in the list, in order:
    If the element is larger than max:
        Set max to the element.
Return max.
```

Read it aloud: "remember the first; walk the rest one by one; whenever you see a bigger one, remember it instead; at the end, hand back what you remember." Trace it on $[4, 1, 7, 3]$: max $= 4$; 1 is not larger; 7 is larger, max $= 7$; 3 is not larger; return 7. Four elements, three comparisons — and that count, $n - 1$ for $n$ elements, is the seed of everything M1T2 will teach.

<a id="ram-model"></a>
## 9. The RAM model — a fair ruler for comparing algorithms

**Why we need a model at all.** Recall the module overview's verdict: stopwatch timing is unfair — a slow algorithm on a fast laptop beats a fast algorithm on a tired phone, saying nothing about the ideas. To compare *algorithms* instead of *machines*, analysis imagines one standard, simplified computer and counts operations on it. That imaginary computer is the RAM model.

::: toggle What does `RAM` stand for, and what does `random access` mean?
`RAM` = Random Access Machine. `Random` here does not mean "haphazard" — it means "any cell immediately": memory is imagined as numbered cells $1, 2, 3, \ldots$, and reading *any* cell costs the same single unit of time, whether it is cell 2 or cell 2,000,000. Real machines approximate this (caches and disks blur it), but the model deliberately assumes it exactly, so that position in memory never distorts the comparison.
:::

**What the model represents.** Three assumptions, each a deliberate simplification:

1. **Numbered memory cells, each readable in one unit.** Storage is a row of cells; reaching any cell costs 1.
2. **Basic operations cost one unit each.** A basic operation is one indivisible step the model counts: add, subtract, compare two values, store (assign) a value, read one array element. Each costs exactly 1 unit — regardless of number sizes. Why unit cost? Because the model's job is comparing *growth* (how work scales with $n$), not predicting seconds; giving every basic step price 1 keeps the ruler identical for every algorithm.
3. **Steps run one at a time, in order.** No parallelism, no overlapping — one operation completes before the next begins, so "total work" is just the count.

**Tiny concrete example.** Maximum-finding on $n$ numbers under this ruler: each element-vs-max test is one comparison costing 1 unit; there are $n - 1$ of them (every element except the first is compared once). Total comparison-work: $n - 1$ units. For $n = 5$: 4 units. For $n = 1{,}000{,}000$: 999,999 units. No seconds, no laptop, no language — just counts, comparable across all machines. Counting carefully case by case (lucky inputs, unlucky inputs, typical inputs) is M1T2's entire job; this topic only establishes the ruler.

**What the model is not.** It is an analytical simplification, not a photograph of hardware: real machines have caches, pipelines, and memory hierarchies the model ignores. Never convert "5 units" into milliseconds, and never claim the model describes every real machine perfectly. Its promise is narrower and exactly what analysis needs: the *same* ruler for every algorithm.

<a id="time-vs-space"></a>
## 10. Time efficiency versus space efficiency — the first look

**Ordinary language first.** Time efficiency asks "how much *work* does it do?" — the number of basic operations. Space efficiency asks "how much *room* does it need while working?" — the number of extra memory cells beyond the input itself. The input must exist regardless (the list is given), so space analysis counts only the *extra* working room: named values like `max`, temporary copies, and similar.

**Connected to analysis.** Both are measured as functions of $n$: "for bigger inputs, how do work and room grow?" Maximum-finding's one-pass version does $n - 1$ comparisons (work grows with $n$) and keeps one extra value, `max` (room stays constant no matter how big $n$ gets). That pairing — work-growing, room-constant — is the kind of statement M1T2 will make precise for every algorithm.

**A first trade-off.** Work and room can pull in opposite directions. Compare two maximum-finding strategies on $n$ numbers:

- One-pass (remember the winner): $n - 1$ comparisons, 1 extra cell (`max`). For $n = 100$: 99 comparisons, 1 cell.
- All-pairs (compare every pair, count each element's wins): no extra cell at all, but every pair is compared — that is $n \times (n - 1) / 2$ comparisons, where $n \times (n - 1) / 2$ counts the pairs ($n$ choices for the first element, $n - 1$ for the second, divided by 2 because pair $(a, b)$ is the same as pair $(b, a)$). For $n = 100$: $100 \times 99 / 2 = 4{,}950$ comparisons, 0 cells.

Fewer cells, far more work — or slightly more cells, far less work. Neither strategy is "better" in the abstract; it depends on which resource is scarcer. Storing previously computed results to save recomputation has a general name — memoization — which later topics use heavily; for now, keep only the intuition: **time and space trade off, and choosing means deciding which resource matters more here.** Turning these plain counts into a compact mathematical language is the job of the asymptotics topic (M1T3); splitting counts into lucky, unlucky, and typical cases is the job of the very next topic, M1T2.

<a id="worked-examples"></a>
## 11. Worked examples — four tests of the foundation

::: step [Step 1: Setup] Formulating the Problem
Example 1 — qualification test. Consider: "To find the largest number in a list, keep guessing numbers until you feel confident you have found the biggest one." What is asked: does this qualify as an algorithm? Given: the instruction text, and the five criteria from §3. Concept tested: qualification against all five characteristics — and why it is relevant: this is the single most examined skill of this topic, and the exact shape of a KTU short answer.
:::

::: step [Step 2: Execution] Applying the five criteria
Why criterion-by-criterion: the definition demands all five (§2's table), so one failure each is enough to disqualify, and naming each failure precisely is what earns marks. Finiteness — "until you feel confident" sets no guaranteed stopping point; a guesser may stop early or never stop, so termination is unpromised. Definiteness — "feel confident" is not checkable: two people following it stop at different points on the same list. Input — the list is supplied, so this criterion passes. Output — a number is produced, so this criterion passes. Effectiveness — "guessing" names no executable rule; there is no mechanical step to perform.
:::

::: step [Step 3: Conclusion] Final Result
Fails finiteness, definiteness, and effectiveness — not a valid algorithm, though input and output pass. Valid replacement: "Set max to the first element. For each remaining element, if it exceeds max, set max to it. Return max." — terminates after exactly $n - 1$ comparisons, unambiguous at every step, executable throughout. Beginner mistake: answering "it fails effectiveness" alone — true but incomplete; examiners award one mark per correctly tested criterion, so test all five every time.
:::

::: step [Step 1: Setup] Formulating the Problem
Example 2 — vague goal into algorithm. Consider the instruction "find the largest number". What is asked: transform it into a well-defined algorithm. Given: nothing but the goal sentence. Concept tested: goal versus procedure (§7) — relevant because it practices definiteness and effectiveness constructively instead of just spotting violations.
:::

::: step [Step 2: Execution] Building the procedure
Why each addition: every gap in the goal must be closed with an explicit mechanism. First, name the input the goal omitted: "given a non-empty list of numbers". Second, create state to track progress: "set max to the first element" — without stored state, comparisons leave no trace. Third, cover every candidate exactly once: "for each remaining element in order" — "each" guarantees none skipped, "in order" removes traversal ambiguity. Fourth, make the update rule exact: "if the element is larger than max, set max to it". Fifth, deliver: "return max after the last element". Each step answers a question the goal left open: what do we start from, what do we repeat, when do we change our answer, when do we stop, what do we hand back.
:::

::: step [Step 3: Conclusion] Final Result
The five-line pseudocode of §8 — finite (ends at the last element), definite (one reading), effective (compare-and-store only), with stated input and checkable output. Beginner mistake: writing "compare all numbers and pick the biggest" and calling it done — that restates the goal with the word "all"; it still says nothing about tracking, order, or stopping.
:::

::: step [Step 1: Setup] Formulating the Problem
Example 3 — terminates but wrong. Consider: "Set max to 0. For each element in the list, if it is larger than max, set max to it. Return max." What is asked: is this algorithm correct? Given: the procedure plus the specification (input: non-empty list; output: an element of the list no element exceeds). Concept tested: correctness versus termination (§4) — relevant because "it runs fine" is the most dangerous false evidence in programming.
:::

::: step [Step 2: Execution] Testing against hostile inputs
Why hostile inputs: correctness ranges over *every* valid input, so friendly examples prove nothing — one counterexample disproves. Run $[4, 1, 7, 3]$: max goes $0 \to 4 \to 7$, returns 7 — correct here. Run $[-5, -2, -9]$: no element exceeds 0, returns 0 — but 0 is not in the list, violating the output condition. One counterexample suffices: the algorithm terminates on all inputs yet is incorrect. Diagnosis: the initial value 0 smuggles in the assumption "inputs are non-negative", which the specification never states.
:::

::: step [Step 3: Conclusion] Final Result
Terminating but incorrect — the §4 distinction in the flesh. Fix: initialise max to the first element, which carries no hidden assumption. Beginner mistake: testing only friendly inputs and declaring correctness — always test boundaries: negatives, single-element lists ($[7]$ must return 7), and all-equal lists ($[5, 5, 5]$ must return 5).
:::

::: step [Step 1: Setup] Formulating the Problem
Example 4 — counting basic operations. Consider the §8 maximum algorithm on a list of $n$ numbers. What is asked: identify its basic operations conceptually (no asymptotics — that language arrives in M1T3). Given: the pseudocode and the RAM model's unit costs (§9). Concept tested: basic-operation counting intuition — relevant because M1T2's entire case analysis counts exactly these.
:::

::: step [Step 2: Execution] Counting under the RAM ruler
Why per-line: the RAM model prices each basic step at 1 unit, so walk the lines. "Set max to the first element": one store — 1 unit, once. The loop visits each of the remaining $n - 1$ elements once. Per visit: one comparison (element versus max) — 1 unit each, so $n - 1$ units total; plus at most one store per visit when a new larger value appears (at most $n - 1$ stores, fewer on friendly inputs — note this input-dependence without analysing cases; cases are M1T2's job). "Return max": delivery, 1 unit. Total comparison-work: exactly $n - 1$ units regardless of input values. Tiny numbers: $n = 4$ ($[4, 1, 7, 3]$) → 3 comparisons; $n = 100$ → 99 comparisons.
:::

::: step [Step 3: Conclusion] Final Result
Comparison count $n - 1$ always; store count varies with the input (at most $n - 1$ extra). Interpretation: the algorithm's work grows with $n$ in a way we can state exactly — and "varies with the input" is precisely the observation M1T2 splits into best, worst, and average cases. Beginner mistake: counting the loop header or `return` as free in one line and costly in another — under the RAM ruler every basic operation costs 1; consistency beats cleverness.
:::

<a id="watch-out"></a>
## 12. Watch out, distinctions, exam recap

**Common confusions (watch out):**

- "Runs long" is not "infinite": a million steps that stop is finite. Finiteness is guaranteed stopping, not speed.
- Definiteness is uniqueness of meaning, not amount of detail: one short unambiguous sentence beats a long two-ways-readable paragraph.
- Zero input is allowed; zero output is not: "no input" means self-contained task, never "no result".
- "It ran without crashing" is not correctness: Example 3 terminates on every input and is still wrong on negatives.
- RAM units are not seconds: never convert operation counts into milliseconds.
- The RAM model is a ruler, not a photograph: caches and pipelines exist; the model ignores them on purpose.

| Similar pair | Distinction that earns marks (with example) |
|---|---|
| Finiteness vs definiteness | Always-stops vs exactly-one-meaning: "keep guessing forever" fails the first; "until it looks good" (stops, but subjectively) fails the second |
| Definiteness vs effectiveness | One meaning vs really doable: "teleport the data" is clear but unexecutable (fails effectiveness); "sort somehow" is doable-step-wise but unspecified (fails definiteness) |
| Algorithm vs vague instruction | Executable ordered steps vs stated goal: Text B (§7) vs Text A (§7) |
| Algorithm vs computational procedure | Must terminate vs runs forever by design: max-finder vs OS main loop |
| Input vs output | Outside supply (possibly zero) vs mandatory checkable result: prime-generator's empty input vs its 100 primes |
| Terminates vs correct | Stops vs stops-with-the-right-answer: Example 3 on $[-5, -2, -9]$ |
| Time vs space efficiency | Operation count vs extra working memory, both as functions of $n$: 99 comparisons + 1 cell vs 4,950 comparisons + 0 cells (§10) |

**Exam recap (facts an examiner rewards):** state the definition with all six words unpacked (finite, sequence, well-defined, instructions, solving, problem); name all five characteristics with one passing and one failing example each; the OS-main-loop trap (computational procedure, not algorithm); terminates-versus-correct with the all-negative-list counterexample; zero-input allowed, zero-output forbidden; RAM = numbered cells, unit-cost basic operations, sequential execution, random access meaning any-cell-same-cost; time/space trade-off in plain numbers; honest scope note — no asymptotic notation, no case analysis, no recurrences in this topic's answers; those are M1T2/M1T3 territory, and naming them as "next" shows course awareness.

<a id="self-check"></a>
## 13. Active Recall Quizzes

::: quiz An operating system's main loop ("keep serving users until switched off") satisfies every algorithm characteristic except one. Which one, and what is such a procedure called?
() Definiteness — it is called a heuristic
(*) Finiteness — it is called a computational procedure
() Effectiveness — it is called an approximation
() Input — it is called a service routine
::: explanation
The loop is perfectly precise and executable, but it is designed never to terminate, so it fails finiteness — the always-stops requirement. The technical name for a would-be algorithm that never ends by design is a computational procedure. "Heuristic" (a practical rule of thumb, not studied here) and "approximation" (a near-answer method from Module 4) are different ideas entirely.
:::

::: quiz The step "sort the numbers somehow and return them" fails definiteness, while "teleport the sorted array to the server" fails effectiveness. What is the exact difference being tested?
() The first step is longer than the second
(*) The first step can be read many ways (which sort, in which order) while the second has one clear meaning but cannot actually be executed
() Both steps fail for the same reason and the labels are interchangeable
() The first step fails because sorting is impossible
::: explanation
Definiteness = exactly one meaning: "sort somehow" leaves the method and order unspecified, so two executors differ. Effectiveness = really executable: teleportation has a single clear meaning but no executable computational step. The labels are not interchangeable — each names a different broken promise, and the exam awards marks for placing the failure correctly.
:::

::: quiz A maximum-finding procedure initialised with max = 0 returns 0 on the input [-5, -2, -9]. It always terminates. What is the correct verdict?
() It is correct because it terminates on every input
(*) It terminates but is incorrect, because 0 is not in the list and violates the output specification
() It fails finiteness because negative numbers take longer
() It fails input because negative numbers are invalid inputs
::: explanation
Termination (finiteness) and correctness are separate promises: correctness requires the output to satisfy the specification for every valid input. Here the output 0 is not even a list member, so the specification is violated — one counterexample disproves correctness. Negative numbers are perfectly valid inputs, and speed has nothing to do with finiteness.
:::

::: quiz A prime-generating algorithm takes no external input but prints the first 100 primes. Which statement is right?
() It is invalid because every algorithm needs input
(*) It is valid: zero inputs are allowed, and the printed primes are the mandatory output
() It is valid but has no output since nothing was supplied
() It is invalid because constants like 100 count as external input
::: explanation
The input contract allows zero or more external quantities — a self-contained task needs none. But the output contract is mandatory: the printed primes are checkable results. Constants written inside the instructions belong to the procedure, not to external input, and "no input" never excuses "no result".
:::

::: quiz In the RAM model, reading memory cell 2 and reading memory cell 2,000,000:
() Cost different amounts because higher cells are farther away
(*) Each cost exactly one unit — any cell costs the same (random access)
() Cannot be compared without knowing the laptop's clock speed
() Cost zero because reads are not basic operations
::: explanation
Random access means any-cell-same-cost: the model assumes every cell read costs 1 unit regardless of address, and memory reads are basic operations. Clock speed is exactly the machine-dependence the model exists to exclude, and distance-based costing describes real hardware quirks the ruler deliberately ignores.
:::

::: quiz One-pass maximum-finding uses 99 comparisons and 1 extra cell on 100 numbers; all-pairs comparison uses 4,950 comparisons and 0 extra cells. What does this show?
() Time efficiency and space efficiency always improve together
(*) A time-space trade-off: spending one cell saves thousands of operations, and vice versa
() Space efficiency is irrelevant so the second version is strictly better
() The comparison counts prove the first version is incorrect
::: explanation
The two versions trade resources: one extra cell of room buys ~50x fewer operations (4,950 down to 99). Neither dominates — the right choice depends on which resource is scarcer. Correctness is untouched (both return the true maximum), and space is never irrelevant: it is half of the efficiency question M1T2 will measure.
:::

<a id="bridge-to-m1t2"></a>
## 14. Where next — the bridge to M1T2

You now own the vocabulary every later topic speaks: what an algorithm is, the five tests anything must pass to bear the name, why "it stopped" never implies "it is right", how to read the pseudocode examples, the RAM ruler that makes comparisons fair, and the two resources — work and room — whose growth is worth measuring.

The next topic, M1T2 (Time & Space Complexity: Best, Worst, and Average Cases), takes the counts you met here and asks the question Example 4 left hanging: the store-count *varied with the input* — so which input do we report? The luckiest (best case), the unluckiest (worst case), or the typical one (average case)? Go there knowing what an algorithm is, how its steps are counted, and what its contracts promise — M1T2 will do the measuring.
