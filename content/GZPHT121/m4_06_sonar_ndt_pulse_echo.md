# SONAR & NDT Pulse-Echo: Depth and Flaws

**Echo-ranging at sea and inside steel — one equation ($d = vt/2$), two industries, all numerical twists.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Shout and Stopwatch
Shout at a cliff, time the echo, halve the round trip — that is SONAR vertically (seabed) and NDT internally (crack). The pulse is a flash-bang of ultrasound; each interface (water–steel, steel–crack–air) echoes a fraction back. Delay gives depth; size of the echo gives the flaw's seriousness. Halving is the whole game because the sound travels down *and* back.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 SONAR (sound navigation and ranging)

Ship transducer fires ultrasonic pulses downward/sideways; seabed/submarine echo returns after $t$; with $v \approx 1500$ m/s in seawater:

$$d = \frac{v\,t}{2}$$

Active SONAR sends and listens; passive only listens (submarine stealth). Scanning + Doppler gives maps and speeds.

### 2.2 NDT pulse-echo method

Probe on steel with couplant gel; pulse races in ($v \approx 5900$ m/s longitudinal in steel), reflects off back wall *and* any crack/void. Oscilloscope shows emission pip, flaw echo, back-wall echo. Flaw depth $d = vt_{flaw}/2$; missing/delayed back echo confirms shadowing. No cutting, no damage — hence *non-destructive*.

### 2.3 Why ultrasound (not audible)

MHz $\lambda \sim$ mm resolves mm flaws/ships' details, beams stay narrow ($D \gg \lambda$), and audible noise ignores it. Audible $\lambda \sim$ metres would wash over cracks.

::: callout-formula KTU Formula Vault: Echo Ranging
**$d = vt/2$** always (round trip!) · sea $v\approx1500$ m/s · steel $v\approx5900$ m/s · flaw echo early + weak back echo = defect.
:::

::: callout-pitfall The Forgotten Half
Using $d = vt$ doubles every depth — the commonest NDT numerical error. Sound pays the distance twice; the stopwatch measures both. Write "/2 (go + return)" on every line.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
(a) SONAR echo returns $2.0$ s after firing ($v = 1500$ m/s). Depth? (b) Steel block: flaw echo at $8\,\mu$s, back echo at $20\,\mu$s ($v = 5900$ m/s). Block thickness and flaw depth?
:::

::: step [Step 2: Execution] Halve Everything
1. $d = 1500\times2.0/2 = 1500$ m.
2. Thickness $= 5900\times20\,\mu\text{s}/2 = 5900\times10\times10^{-6} = 59$ mm. Flaw $= 5900\times8\,\mu\text{s}/2 = 23.6$ mm deep from the probe face.
:::

::: step [Step 3: Conclusion] Final Result
One halved product rules both industries. Present thickness *and* flaw depth together — the pair is the standard NDT answer format.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
SONAR pulse returns after $0.5$ s in seawater ($1500$ m/s). Seabed depth?
(A) 1500 m
(*B) $1500\times0.5/2 = 375$ m
(C) 750 m
(D) 3000 m
::: explanation
$d = vt/2 = 750/2 = 375$ m. Forgetting the half gives $750$ m — double the truth and the standard distractor sitting in the options.
:::

::: quiz Q2: Numerical Drill
Steel rail: back-wall echo at $34\,\mu$s ($v = 5900$ m/s). Thickness?
(A) 200 mm
(*B) $5900\times34\times10^{-6}/2 \approx 100$ mm
(C) 50 mm
(D) 400 mm
::: explanation
$5900\times34 = 200{,}600$; times $10^{-6}$ = $0.2006$; halved $\approx 0.100$ m $= 100$ mm. Microsecond timing resolves millimetres because steel is fast — quote both scales.
:::

::: quiz Q3: Foundational Concept
A flaw echo appears *and* the back-wall echo shrinks. Interpretation?
(A) Equipment failure always
(*B) A reflector (crack/void) partway intercepts energy, casting an acoustic shadow on the back wall
(C) The block grew thicker
(D) Sound changed frequency
::: explanation
The flaw steals energy that would have reached the back wall — early pip plus weakened back echo is the textbook defect signature. No flaw: single clean back echo only.
:::
