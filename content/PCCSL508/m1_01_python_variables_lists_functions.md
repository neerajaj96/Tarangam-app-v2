---
id: m1_01_python_variables_lists_functions
courseCode: PCCSL508
module: 1
sequence: 1
title: 'Python: Variables, Lists & Functions'
difficulty: beginner
estimatedMinutes: 11
learningObjectives:
  - State what each construct holds in plain words first
  - Run variables, lists, loops, and functions today
  - Read tracebacks as directions, not verdicts
concepts:
  - Python variables
  - lists and loops
  - functions
prerequisites: []
examRelevance: high
tags:
  - python-basics
  - ml-setup
---
# Python: Variables, Lists & Functions

**Aim:** write and run your first ML-useful Python — variables, lists, loops, functions — with zero assumed background.

**Theory (one paragraph):** Python is the lab's glue: readable, interpreted (runs line by line, no compile step), and the mother tongue of NumPy/Pandas/sklearn. Variables name values; lists order them; loops repeat; functions package reusable work. Indentation (4 spaces) marks blocks — the compiler reads your alignment.

**Dataset meaning:** none yet — today numbers are hand-made listsalt (`[2, 4, 6]`), standing in for future columns.

## 1. Procedure Step by Step

1. Install Python 3 (`python3 --version` proves it) and open any editor/terminal.
2. Run each block below in order (file or REPL — REPL echoes results instantly).
3. Break one thing per block deliberately (wrong indent, typo) and read the traceback last line first.

```python
# variables: names for values (types ride along, never declared)
x = 7                 # int: whole count
price = 12.5          # float: measured quantity
name = "sensor-A"     # str: label text
is_ready = True       # bool: flag for decisions

# lists: ordered, indexed from 0, mixed types tolerated (columns shouldn't mix)
temps = [21.5, 22.0, 20.8, 23.1]
print(temps[0], temps[-1])   # first and last: 21.5 23.1
temps.append(22.4)           # grow at the end only

# loops: repeat with a name per item
for t in temps:
    print("high" if t > 22 else "ok")   # one-line decision per item

# functions: packaged work with inputs and one output
def mean(values):
    return sum(values) / len(values)    # caller guarantees non-empty!
print(mean(temps))
```

Line-by-line honesty: `temps[-1]` counts from the end (Python idiom #1); `append` mutates in place (returns nothing — `x = temps.append(v)` stores `None`, classic bug); `mean` divides by `len` (empty list ⇒ crash, guard at call sites).

**Input/features/target:** no dataset yet — but notice the shape forming: `temps` is one *feature column* in waiting; `mean` is the first *statistic* of many.

## 2. Expected Output and Result

Prints: `21.5 23.1`, four ok/high lines, then the mean (≈22.16 with the appended value). Result: you can name, order, repeat, and package — the four moves every later experiment composes.

**How to verify:** change one temperature, predict the new mean by hand, rerun — agreement proves understanding, not typing.

::: callout-pitfall Indentation Is Syntax
One stray space ends the block (or crashes): align loop bodies and function bodies exactly 4 spaces. Tracebacks name the line — read the *last* line first (the actual complaint), then look at the *named* line.
:::

## 3. Common Mistakes and Viva Questions

| Mistake | Cure |
|---|---|
| `x = temps.append(22.4)` then using `x` | `append` returns `None` — mutate, don't assign |
| `mean([])` crash | `ZeroDivisionError` — guard empties before dividing, always |
| Tab/space mixing | One style (4 spaces) per file — configure the editor once |

**Viva:** list vs variable (many ordered vs one named)? What does a function return with no `return` (`None`)? Why does ML code live in functions (reuse + testability)?

**Checklist:** version prints ☐; indexing both ends ☐; loop decides per item ☐; function returns correct mean ☐; one deliberate traceback read ☐.

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz `x = temps.append(22.4)` then `mean(x)` crashes with TypeError. What exactly is x, and the one-line fix?
() append is broken for floats
(*) `append` mutates and returns `None`, so x is None — fix: `temps.append(22.4)` alone, then `mean(temps)`. Mutators act, they don't answer
() mean cannot handle 5 items
() Reinstall Python to fix append
::: explanation
In-place methods return nothing by contract: the list is the answer. Assigning their silence breaks the next call — separate acting from answering, always.
:::

::: quiz Why must ML code live in functions rather than flat scripts, in one exam sentence?
() Functions run faster than scripts
(*) Functions package named, reusable, testable units — experiments rerun with new data by calling, not by retyping, and bugs localise to one body
() Scripts cannot use lists
() Examiners fear long files aesthetically
::: explanation
Reuse plus localisation: call with new inputs, test one body, break one place. Flat scripts retype and scatter — functions are the lab's unit of honesty.
:::
