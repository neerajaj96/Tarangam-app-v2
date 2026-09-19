# Joint pdf, Marginals & Independence (Continuous)

**Joint density surfaces, volume-under-surface probabilities, and the product test — the continuous twin of M1's table.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Terrain Map
The joint pdf $f(x,y)$ is terrain height over the $xy$-plain; probability over a region is the *earth volume* above it. **Marginals** are the silhouettes — squash the terrain flat along $y$ (integrate it out) to see $X$'s profile. **Independence** means the terrain is a multiplied landscape $g(x)h(y)$ — every cross-section a scaled copy, no diagonal ridges.
:::

::: anim joint-region Patch, Volume, Squash
Shade $x+y<1$ for probability; squash an axis for margins — the two joint operations drawn once.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Joint, marginals, conditionals

$$f(x,y) \ge 0, \quad \iint f = 1, \quad P((X,Y) \in A) = \iint_A f\,dx\,dy$$

$$f_X(x) = \int_{-\infty}^{\infty} f(x,y)\,dy, \qquad f_Y(y) = \int_{-\infty}^{\infty} f(x,y)\,dx$$

### 2.2 Independence

$$f(x,y) = f_X(x)\,f_Y(y) \;\; \forall x,y \quad \Longleftrightarrow \quad \text{independent}$$

Watch the support: a triangular/constrained region (e.g. $x+y \le 1$) already breaks factorisation even if the formula splits — region shape counts.

::: callout-formula KTU Formula Vault: Joint Continuous
Volume = probability · margins by **integrating out** · independent iff **product everywhere on a product rectangle**.
:::

::: callout-pitfall Support Shape Betrays Dependence
$f(x,y) = 2$ on $x\ge0, y\ge0, x+y\le1$: formula constant, but the triangle isn't a rectangle — $X$ large forces $Y$ small. Always sketch the region before testing the formula.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
$f(x,y) = 6xy^2$ on $[0,1]\times[0,1]$ (0 else). Find marginals, test independence, compute $P(X+Y < 1)$.
:::

::: step [Step 2: Execution] Integrate Out, Then Under
1. $f_X(x) = \int_0^1 6xy^2 dy = 2x$; $f_Y(y) = \int_0^1 6xy^2 dx = 3y^2$. Product $2x\cdot3y^2 = 6xy^2 = f$ on the unit square (a rectangle) → independent.
2. $P = \int_0^1\int_0^{1-x} 6xy^2\,dy\,dx = \int_0^1 2x(1-x)^3 dx$. With $u = 1-x$: $2\int_0^1 (1-u)u^3 du = 2(1/4-1/5) = 2/20 = 0.1$.
:::

::: step [Step 3: Conclusion] Final Result
Margins by integrating out, independence by product-on-rectangle, region probability by iterated integral with $y$-limit $1-x$. One example, all three skills.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Numerical Drill
$f(x,y) = 2$ on $0<x<1$, $0<y<x$ (0 else). $f_X(x)$?
(A) $2$
(*B) $\int_0^x 2\,dy = 2x$ on $(0,1)$ — $y$ runs only to $x$
(C) $2x^2$
(D) $1$
::: explanation
For fixed $x$, $y$ lives on $(0,x)$ — the upper limit is $x$, not $1$. Integrating gives $2x$ (check: $\int_0^1 2x\,dx = 1$). Limits carry the region's shape; copying $0$–$1$ blindly is the standard error.
:::

::: quiz Q2: Foundational Concept
$X, Y$ independent standard normals. What is the joint pdf?
(A) $\frac{1}{2\pi}e^{-(x+y)^2/2}$
(*B) $\frac{1}{2\pi}e^{-(x^2+y^2)/2}$ — product of the two $N(0,1)$ densities
(C) $\frac{1}{\sqrt{2\pi}}e^{-xy}$
(D) Uniform on the square
::: explanation
Independence multiplies: $\frac{1}{\sqrt{2\pi}}e^{-x^2/2}\times\frac{1}{\sqrt{2\pi}}e^{-y^2/2}$. Circular contours ($x^2+y^2$) betray the product structure — elliptical contours would signal correlation.
:::

::: quiz Q3: Foundational Concept
$P(X > Y)$ for i.i.d. continuous $X, Y$ equals?
(A) $0$
(*B) $1/2$ — symmetry: $(X,Y)$ and $(Y,X)$ are equiprobable, ties have probability $0$
(C) $1$
(D) Depends on the distribution
::: explanation
Continuity kills ties ($P(X=Y)=0$), and symmetry splits the rest evenly. Distribution-free $1/2$ — a one-line answer whenever "i.i.d. continuous" appears.
:::
