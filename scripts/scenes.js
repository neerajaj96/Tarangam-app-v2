/**
 * Tarangam SVG motion scenes — dependency-free animated diagrams.
 * Each scene is an inline-SVG string animated with page CSS classes
 * (.anim-stage .a1..a8 staggered actors). All motion is CSS-only so the
 * global prefers-reduced-motion guard collapses every scene to its
 * final static state automatically. No JavaScript, no video files.
 */

function node(x, y, label, cls) {
  return `<g class="nd ${cls}"><circle cx="${x}" cy="${y}" r="22"/><text x="${x}" y="${y + 6}">${label}</text></g>`;
}

function edge(x1, y1, x2, y2, cls) {
  return `<line class="eg ${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
}

function msg(x1, y1, x2, y2, label, ly, cls) {
  const left = x2 < x1;
  return `<g class="msg ${cls}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#ah)"/>` +
    `<text x="${(x1 + x2) / 2}" y="${ly}" text-anchor="middle">${label}</text></g>`;
}

const defs = `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs>`;

export const SCENES = {
  'tcp-handshake': {
    title: 'TCP 3-Way Handshake',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated TCP three-way handshake: SYN, SYNACK, ACK">
${defs}
<rect class="host" x="40" y="30" width="140" height="240" rx="10"/><text class="hostlbl" x="110" y="55">Client</text>
<rect class="host" x="460" y="30" width="140" height="240" rx="10"/><text class="hostlbl" x="530" y="55">Server</text>
${msg(180, 110, 460, 110, '1 · SYN (Seq=x)', 100, 'a1')}
${msg(460, 165, 180, 165, '2 · SYNACK (Seq=y, ACK=x+1)', 155, 'a2')}
${msg(180, 220, 460, 220, '3 · ACK (ACK=y+1) — ESTABLISHED', 210, 'a3')}
<text class="animnote a4" x="320" y="262" text-anchor="middle">both sequence numbers confirmed before any data flows</text>
</svg>`
  },

  'avl-ll': {
    title: 'LL Rotation: Before and After',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated LL rotation: right rotation at 30 rebalances to 20">
${defs}
<text class="animcap a1" x="140" y="30" text-anchor="middle">BEFORE · BF(30)=+2</text>
${edge(140, 100, 80, 170, 'a1')}${node(140, 78, '30', 'a1')}${node(80, 192, '20', 'a1')}${node(40, 262, '10', 'a1')}
<text class="bigarrow a2" x="320" y="180" text-anchor="middle">right rotation ⟳</text>
<text class="animcap a3" x="500" y="30" text-anchor="middle">AFTER · all BF=0</text>
${edge(500, 100, 440, 170, 'a3')}${edge(500, 100, 560, 170, 'a3')}${node(500, 78, '20', 'a3')}${node(440, 192, '10', 'a3')}${node(560, 192, '30', 'a3')}
<text class="animnote a4" x="320" y="282" text-anchor="middle">straight-line lean fixed by one rotation against it</text>
</svg>`
  },

  'bfs-layers': {
    title: 'BFS Layer Expansion',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated breadth-first expansion lighting nodes layer by layer">
${defs}
${edge(110, 150, 250, 80, 'e1')}${edge(110, 150, 250, 220, 'e1')}
${edge(250, 80, 400, 60, 'e2')}${edge(250, 80, 400, 140, 'e2')}${edge(250, 220, 400, 240, 'e2')}
${edge(400, 60, 540, 110, 'e3')}${edge(400, 240, 540, 190, 'e3')}
${node(110, 150, 's', 'a1')}
${node(250, 80, 'a', 'a2')}${node(250, 220, 'b', 'a2')}
${node(400, 60, 'c', 'a3')}${node(400, 140, 'd', 'a3')}${node(400, 240, 'e', 'a3')}
${node(540, 110, 'f', 'a4')}${node(540, 190, 'g', 'a4')}
<text class="animnote a5" x="320" y="282" text-anchor="middle">layers finish in order: s → a,b → c,d,e → f,g (nondecreasing distance)</text>
</svg>`
  },

  'aimd-sawtooth': {
    title: 'AIMD Sawtooth and Fairness',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated congestion window sawtooth: additive rise, multiplicative halving">
${defs}
<line class="axis" x1="60" y1="20" x2="60" y2="260"/><line class="axis" x1="60" y1="260" x2="610" y2="260"/>
<text class="axislbl" x="30" y="150">cwnd</text><text class="axislbl" x="340" y="285">time →</text>
<path class="sawdraw" pathLength="1000" d="M60,220 L60,120 L220,220 L220,170 L380,240 L380,190 L540,250" fill="none"/>
<circle class="sawdot" cx="0" cy="0" r="7"/>
<text class="animnote a4" x="340" y="40" text-anchor="middle">+1 MSS per RTT up · halve on loss · fairness emerges</text>
</svg>`
  },

  'gbn-window': {
    title: 'Go-Back-N Sliding Window',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated Go-Back-N window sliding as acknowledgments arrive">
${defs}
<text class="animcap" x="320" y="30" text-anchor="middle">sender window N=4 slides on cumulative ACKs</text>
<g class="pkt p0"><rect x="70" y="120" width="52" height="52" rx="8"/><text x="96" y="152">0</text></g>
<g class="pkt p1"><rect x="140" y="120" width="52" height="52" rx="8"/><text x="166" y="152">1</text></g>
<g class="pkt p2"><rect x="210" y="120" width="52" height="52" rx="8"/><text x="236" y="152">2</text></g>
<g class="pkt p3"><rect x="280" y="120" width="52" height="52" rx="8"/><text x="306" y="152">3</text></g>
<g class="pkt p4"><rect x="350" y="120" width="52" height="52" rx="8"/><text x="376" y="152">4</text></g>
<g class="pkt p5"><rect x="420" y="120" width="52" height="52" rx="8"/><text x="446" y="152">5</text></g>
<g class="pkt p6"><rect x="490" y="120" width="52" height="52" rx="8"/><text x="516" y="152">6</text></g>
<rect class="winbox" x="62" y="104" width="258" height="84" rx="12"/>
<text class="animnote a4" x="320" y="240" text-anchor="middle">ACK 1 arrives → window slides → packets 2–5 in flight</text>
</svg>`
  },

  'recursion-tree': {
    title: 'Recursion Tree Growth (3T(n/4) + n²)',
    svg: `<svg viewBox="0 0 640 320" role="img" aria-label="Animated recursion tree: root cost shrinking geometrically per level">
${defs}
${node(320, 50, 'n²', 'a1')}
${edge(320, 72, 180, 120, 'e2')}${edge(320, 72, 320, 120, 'e2')}${edge(320, 72, 460, 120, 'e2')}
<g class="nd big a2"><circle cx="180" cy="154" r="34"/><text x="180" y="160">n²/16</text></g>
<g class="nd big a2"><circle cx="320" cy="154" r="34"/><text x="320" y="160">n²/16</text></g>
<g class="nd big a2"><circle cx="460" cy="154" r="34"/><text x="460" y="160">n²/16</text></g>
${edge(180, 188, 140, 231, 'e3')}${edge(180, 188, 180, 231, 'e3')}${edge(180, 188, 220, 231, 'e3')}
${edge(320, 188, 280, 231, 'e3')}${edge(320, 188, 320, 231, 'e3')}${edge(320, 188, 360, 231, 'e3')}
${edge(460, 188, 420, 231, 'e3')}${edge(460, 188, 460, 231, 'e3')}${edge(460, 188, 500, 231, 'e3')}
<g class="nd a3"><circle cx="140" cy="244" r="13"/><circle cx="180" cy="244" r="13"/><circle cx="220" cy="244" r="13"/><circle cx="280" cy="244" r="13"/><circle cx="320" cy="244" r="13"/><circle cx="360" cy="244" r="13"/><circle cx="420" cy="244" r="13"/><circle cx="460" cy="244" r="13"/><circle cx="500" cy="244" r="13"/></g>
<text class="animnote a4" x="320" y="292" text-anchor="middle">level totals ×(3/16) each row down — root dominates</text>
</svg>`
  },

  'kosaraju-passes': {
    title: "Kosaraju: Finish Order, Then Transpose",
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated Kosaraju passes: finish order badges then transpose SCC peel">
${defs}
<text class="animcap a1" x="160" y="30" text-anchor="middle">pass 1 · DFS on G</text>
${edge(100, 100, 200, 100, 'a1')}${edge(200, 100, 200, 200, 'a1')}${edge(200, 200, 100, 200, 'a1')}${edge(200, 200, 280, 150, 'a1')}
${node(100, 100, '1', 'a1')}${node(200, 100, '2', 'a1')}${node(200, 200, '3', 'a1')}${node(280, 150, '4', 'a1')}
<text class="badge1 a2" x="100" y="140">finishes last</text>
<text class="animcap a3" x="480" y="30" text-anchor="middle">pass 2 · DFS on transpose</text>
<ellipse class="scc a4" cx="440" cy="150" rx="75" ry="80"/>
<ellipse class="scc solo a4" cx="560" cy="150" rx="32" ry="32"/>
${node(410, 100, '1', 'a3')}${node(470, 100, '2', 'a3')}${node(440, 200, '3', 'a3')}${node(560, 150, '4', 'a3')}
<text class="animnote a5" x="320" y="282" text-anchor="middle">decreasing finish order peels exactly one SCC per search</text>
</svg>`
  },

  'wumpus-deduce': {
    title: 'Wumpus Deduction: Stench to Disjunction',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated Wumpus deduction from stench to candidate squares">
${defs}
<g class="cell a1"><rect x="30" y="90" width="110" height="110" rx="8"/><text x="85" y="135">1,1</text><text x="85" y="160">visited ✓</text></g>
<g class="cell a2"><rect x="160" y="90" width="110" height="110" rx="8"/><text x="215" y="135">1,2</text><text x="215" y="160">stench!</text></g>
<g class="cell cand a3"><rect x="290" y="90" width="110" height="110" rx="8"/><text x="345" y="135">1,3 ?</text><text x="345" y="160">candidate</text></g>
<g class="cell cand a3"><rect x="420" y="90" width="110" height="110" rx="8"/><text x="475" y="135">2,2 ?</text><text x="475" y="160">candidate</text></g>
<text class="animnote a5" x="320" y="262" text-anchor="middle">one percept, two candidates — knowledge as disjunction, never a guess</text>
</svg>`
  },

  'union-find': {
    title: 'Union by Rank, Then Compression',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated union of two trees followed by path compression">
${defs}
<text class="animcap a1" x="160" y="30" text-anchor="middle">two rank-1 trees</text>
${edge(110, 100, 70, 170, 'a1')}${edge(210, 100, 250, 170, 'a1')}
${node(110, 78, 'a', 'a1')}${node(70, 192, 'b', 'a1')}${node(210, 78, 'c', 'a1')}${node(250, 192, 'd', 'a1')}
<text class="bigarrow a2" x="320" y="150" text-anchor="middle">UNION(a,c) ⟶</text>
<text class="animcap a3" x="500" y="30" text-anchor="middle">merged + compressed · rank(a)=2</text>
${edge(500, 100, 430, 168, 'a3')}${edge(500, 100, 570, 168, 'a3')}${edge(500, 100, 500, 228, 'a3')}
${node(500, 78, 'a', 'a3')}${node(430, 190, 'b', 'a3')}${node(570, 190, 'c', 'a3')}${node(500, 250, 'd', 'a3')}
<text class="animnote a4" x="320" y="282" text-anchor="middle">FIND(d) rewires d straight under a — future queries: one hop</text>
</svg>`
  },

  'substitution-pipeline': {
    title: 'Substitution: Guess to Proof',
    svg: `<svg viewBox="0 0 640 260" role="img" aria-label="Animated substitution method pipeline: guess, assume, substitute, verify">
${defs}
<g class="stagebox a1"><rect x="20" y="100" width="128" height="64" rx="10"/><text x="84" y="126">1 · Guess</text><text x="84" y="146" class="sub">T(n) ≤ cn²</text></g>
<g class="stagebox a2"><rect x="172" y="100" width="128" height="64" rx="10"/><text x="236" y="126">2 · Assume</text><text x="236" y="146" class="sub">holds below n</text></g>
<g class="stagebox a3"><rect x="324" y="100" width="128" height="64" rx="10"/><text x="388" y="126">3 · Substitute</text><text x="388" y="146" class="sub">into RHS</text></g>
<g class="stagebox a4"><rect x="476" y="100" width="144" height="64" rx="10"/><text x="548" y="126">4 · Verify</text><text x="548" y="146" class="sub">fits for n ✓</text></g>
<text class="flowarrow a2" x="160" y="140" text-anchor="middle">→</text>
<text class="flowarrow a3" x="312" y="140" text-anchor="middle">→</text>
<text class="flowarrow a4" x="464" y="140" text-anchor="middle">→</text>
<text class="animnote a5" x="320" y="220" text-anchor="middle">miss? loop back with a weaker guess (often minus a lower-order term)</text>
</svg>`
  },

  'bfs-dfs-race': {
    title: 'BFS Layers vs. DFS Plunge',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated race: breadth-first layers against depth-first plunge on one tree">
${defs}
<text class="animcap a1" x="160" y="30" text-anchor="middle">BFS: level order</text>
${node(160, 80, 's', 'a1')}
${edge(160, 102, 100, 160, 'e2')}${edge(160, 102, 220, 160, 'e2')}
${node(100, 182, 'a', 'a2')}${node(220, 182, 'b', 'a2')}
${edge(100, 204, 70, 250, 'e3')}${edge(100, 204, 130, 250, 'e3')}
${node(70, 266, 'c', 'a3')}${node(130, 266, 'd', 'a3')}
<text class="animcap a1" x="480" y="30" text-anchor="middle">DFS: plunge order</text>
${node(480, 80, 's', 'a1')}
${edge(480, 102, 480, 160, 'e2')}
${node(480, 182, 'a', 'a2')}
${edge(480, 204, 480, 250, 'e2')}
${node(480, 266, 'c', 'a3')}
<text class="animnote a4" x="320" y="292" text-anchor="middle">same tree, same cost — ripples find nearest, string finds deepest</text>
</svg>`
  },

  'crc-divide': {
    title: 'CRC Division, Alignment by Alignment',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated CRC long division: six XOR alignments yielding remainder 01110">
${defs}
<text class="crcrow a1" x="60" y="70">101000 XOR 110101 = 011101</text>
<text class="crcrow a2" x="60" y="115">111011 XOR 110101 = 001110</text>
<text class="crcrow a3" x="60" y="160">111010 XOR 110101 = 001111</text>
<text class="crcrow a3" x="60" y="205">111110 XOR 110101 = 001011</text>
<text class="crcrow a4" x="60" y="250">101100 XOR 110101 = 011001 → 110010 XOR 110101 = 000111</text>
<text class="crcres a5" x="320" y="285" text-anchor="middle">remainder R = 01110 · receiver re-divides → 00000 ✓</text>
</svg>`
  },

  'dijkstra-settle': {
    title: 'Dijkstra Settling Order 1-3-2-4-5-6',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated Dijkstra settling order with final distances">
${defs}
${edge(90, 150, 240, 80, '')}${edge(90, 150, 240, 220, '')}${edge(240, 80, 240, 220, '')}${edge(240, 220, 390, 150, '')}${edge(240, 80, 390, 150, '')}${edge(390, 150, 500, 220, '')}${edge(390, 150, 570, 150, '')}${edge(500, 220, 570, 150, '')}
${node(90, 150, '1', 'a1')}<text class="ordbadge a1" x="90" y="196">[1] d=0</text>
${node(240, 80, '3', 'a2')}<text class="ordbadge a2" x="240" y="40">[2] d=2</text>
${node(240, 220, '2', 'a3')}<text class="ordbadge a3" x="240" y="266">[3] d=3</text>
${node(390, 150, '4', 'a4')}<text class="ordbadge a4" x="390" y="110">[4] d=8</text>
${node(500, 220, '5', 'a5')}<text class="ordbadge a5" x="500" y="266">[5] d=10</text>
${node(570, 150, '6', 'a5')}<text class="ordbadge a5" x="570" y="110">[6] d=13</text>
</svg>`
  },

  'sine-phasor': {
    title: 'Phasor Rotation Generates the Sine Wave',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated phasor rotating on a circle projecting a sine wave point by point">
${defs}
<text class="animcap" x="140" y="30" text-anchor="middle">phasor · ωt</text>
<circle class="eg" cx="140" cy="160" r="70" style="fill:none"/>
<line class="axis" x1="140" y1="160" x2="560" y2="160"/>
<line class="axis" x1="330" y1="60" x2="330" y2="260"/>
<g class="msg a1"><line x1="140" y1="160" x2="210" y2="160" marker-end="url(#ah)"/><text x="140" y="250" text-anchor="middle">0° → 0</text></g>
<g class="msg a2"><line x1="140" y1="160" x2="140" y2="90" marker-end="url(#ah)"/><text x="140" y="250" text-anchor="middle">90° → +Vm</text></g>
<g class="msg a3"><line x1="140" y1="160" x2="70" y2="160" marker-end="url(#ah)"/><text x="140" y="250" text-anchor="middle">180° → 0</text></g>
<path class="eg" d="M330,160 Q382,90 435,160 T540,160" style="fill:none"/>
<text class="animcap" x="445" y="30" text-anchor="middle">v = Vm·sin ωt</text>
<text class="badge1 a2" x="435" y="70">peak at 90°</text>
<text class="animnote a4" x="320" y="285" text-anchor="middle">vertical projection of the tip traces the sine, one angle at a time</text>
</svg>`
  },

  'rlc-triangle': {
    title: 'RLC Voltage Triangle and Power Factor',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated voltage triangle: VR along x, net reactive up, VS hypotenuse at angle phi">
${defs}
<line class="axis" x1="80" y1="230" x2="560" y2="230"/><line class="axis" x1="80" y1="230" x2="80" y2="40"/>
<g class="msg a1"><line x1="80" y1="230" x2="400" y2="230" marker-end="url(#ah)"/><text x="240" y="255" text-anchor="middle">VR (in phase)</text></g>
<g class="msg a2"><line x1="400" y1="230" x2="400" y2="110" marker-end="url(#ah)"/><text x="470" y="180" text-anchor="middle">VL−VC</text></g>
<g class="msg a3"><line x1="80" y1="230" x2="400" y2="110" marker-end="url(#ah)"/><text x="200" y="140" text-anchor="middle">VS</text></g>
<text class="ordbadge a4" x="150" y="220">φ · cosφ = P/S</text>
<text class="animnote a5" x="320" y="285" text-anchor="middle">resistive foot, reactive rise, supply hypotenuse — power factor is geometry</text>
</svg>`
  },

  'star-delta': {
    title: 'Star–Delta Resistor Networks',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated star network on the left converting to delta on the right">
${defs}
<text class="animcap a1" x="160" y="30" text-anchor="middle">STAR (Y) · 3 + neutral</text>
${node(160, 160, 'N', 'a1')}
${node(70, 90, '1', 'a1')}${node(250, 90, '2', 'a1')}${node(160, 250, '3', 'a1')}
${edge(160, 160, 70, 90, 'a1')}${edge(160, 160, 250, 90, 'a1')}${edge(160, 160, 160, 250, 'a1')}
<text class="bigarrow a2" x="320" y="165" text-anchor="middle">⟷ Ra=(R1R2+R2R3+R3R1)/Ropp</text>
<text class="animcap a3" x="490" y="30" text-anchor="middle">DELTA (Δ) · mesh</text>
${node(420, 100, '1', 'a3')}${node(560, 100, '2', 'a3')}${node(490, 230, '3', 'a3')}
${edge(420, 100, 560, 100, 'a3')}${edge(560, 100, 490, 230, 'a3')}${edge(490, 230, 420, 100, 'a3')}
<text class="animnote a4" x="320" y="285" text-anchor="middle">same three terminals, friendlier topology — convert, then series/parallel</text>
</svg>`
  },

  'diode-iv': {
    title: 'PN Diode V–I Characteristic',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated diode curve: flat reverse leakage, sharp forward knee, zener breakdown tail">
${defs}
<line class="axis" x1="320" y1="20" x2="320" y2="270"/><line class="axis" x1="40" y1="170" x2="600" y2="170"/>
<text class="axislbl" x="590" y="195">V →</text><text class="axislbl" x="330" y="35">I ↑</text>
<path class="eg a2" d="M60,165 L300,165" style="fill:none"/>
<path class="eg a1" d="M320,170 Q360,168 380,140 Q400,100 430,60" style="fill:none"/>
<path class="eg a3" d="M300,175 L180,178 L150,240" style="fill:none"/>
<text class="badge1 a1" x="440" y="120">knee ≈0.7V Si</text>
<text class="badge1 a3" x="120" y="220">zener breakdown</text>
<text class="animnote a4" x="320" y="290" text-anchor="middle">blocks reverse, conducts past the knee, avalanches in breakdown</text>
</svg>`
  },

  'bridge-flow': {
    title: 'Bridge Rectifier Conduction Paths',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated bridge: one diode pair conducts each half cycle, load current never reverses">
${defs}
<text class="animcap" x="320" y="30" text-anchor="middle">diamond D1–D4 · load RL centre-right</text>
${node(320, 80, 'AC', 'a1')}${node(320, 230, 'AC', 'a1')}
${node(200, 155, 'D1·D3', 'a1')}${node(440, 155, 'D2·D4', 'a1')}
${edge(320, 80, 200, 155, 'a1')}${edge(200, 155, 320, 230, 'a1')}
${edge(320, 80, 440, 155, 'a1')}${edge(440, 155, 320, 230, 'a1')}
<g class="msg a2"><line x1="200" y1="155" x2="440" y2="155" marker-end="url(#ah)"/><text x="320" y="140" text-anchor="middle">+ve half: D1,D2 on</text></g>
<g class="msg a3"><line x1="440" y1="185" x2="200" y2="185" marker-end="url(#ah)"/><text x="320" y="210" text-anchor="middle">−ve half: D3,D4 on</text></g>
<text class="animnote a4" x="320" y="282" text-anchor="middle">pairs alternate, load current flows one way — full-wave pulsating DC</text>
</svg>`
  },

  'compiler-pipeline': {
    title: 'Compiler Structure: Front, Optimizer, Back',
    svg: `<svg viewBox="0 0 640 260" role="img" aria-label="Animated compiler pipeline: front end, optimizer, back end passing IR">
${defs}
<g class="stagebox a1"><rect x="20" y="100" width="170" height="64" rx="10"/><text x="105" y="126">FRONT END</text><text x="105" y="146" class="sub">scan · parse · check</text></g>
<g class="stagebox a2"><rect x="235" y="100" width="170" height="64" rx="10"/><text x="320" y="126">OPTIMIZER</text><text x="320" y="146" class="sub">IR → better IR</text></g>
<g class="stagebox a3"><rect x="450" y="100" width="170" height="64" rx="10"/><text x="535" y="126">BACK END</text><text x="535" y="146" class="sub">codegen · target</text></g>
<text class="flowarrow a2" x="212" y="140" text-anchor="middle">→</text>
<text class="flowarrow a3" x="427" y="140" text-anchor="middle">→</text>
<text class="animnote a4" x="320" y="220" text-anchor="middle">IR is the handshake — analysis up front, synthesis at the back</text>
</svg>`
  },

  'sr-parse': {
    title: 'Shift-Reduce Parsing: Stack Grows, Handle Falls',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated shift-reduce: terminals shift on, then a handle reduces to a nonterminal">
${defs}
<text class="animcap" x="320" y="30" text-anchor="middle">stack ← shifts · handle → reduce</text>
<g class="pkt p0 a1"><rect x="90" y="120" width="52" height="52" rx="8"/><text x="116" y="152">id</text></g>
<g class="pkt p1 a1"><rect x="160" y="120" width="52" height="52" rx="8"/><text x="186" y="152">+</text></g>
<g class="pkt p2 a2"><rect x="230" y="120" width="52" height="52" rx="8"/><text x="256" y="152">id</text></g>
<g class="pkt p3 a3"><rect x="300" y="120" width="52" height="52" rx="8"/><text x="326" y="152">E</text></g>
<rect class="winbox" x="82" y="104" width="200" height="84" rx="12"/>
<text class="badge1 a2" x="320" y="152">shift id, shift +, shift id…</text>
<text class="badge1 a3" x="320" y="185">handle 〈id〉 → reduce E!</text>
<text class="animnote a4" x="320" y="250" text-anchor="middle">shift until the top spells a right-hand side, then collapse it</text>
</svg>`
  },

  'tac-gen': {
    title: 'Three-Address Code for a+b*c',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated TAC generation: multiply first into t1, then add into t2">
${defs}
<text class="animcap a1" x="320" y="30" text-anchor="middle">a + b * c · one operator per line</text>
<text class="crcrow a1" x="60" y="100">source:  a + b * c</text>
<text class="crcrow a2" x="60" y="150">t1 = b * c      ← * binds first</text>
<text class="crcrow a3" x="60" y="200">t2 = a + t1     ← then +</text>
<text class="crcres a4" x="320" y="260" text-anchor="middle">temporaries name every intermediate — quads the back end loves</text>
</svg>`
  },

  'cluster-arch': {
    title: 'Cluster Architecture: Head Node and Workers',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated cluster: head node fans jobs out to worker nodes over fast interconnect">
${defs}
${node(320, 70, 'HEAD', 'a1')}
${node(120, 200, 'W1', 'a2')}${node(260, 200, 'W2', 'a2')}${node(380, 200, 'W3', 'a2')}${node(520, 200, 'W4', 'a2')}
${edge(320, 70, 120, 200, 'a2')}${edge(320, 70, 260, 200, 'a2')}${edge(320, 70, 380, 200, 'a2')}${edge(320, 70, 520, 200, 'a2')}
<text class="animcap a1" x="320" y="30" text-anchor="middle">scheduler + single system image</text>
<text class="badge1 a3" x="320" y="140">jobs fan out · results gather</text>
<text class="animnote a4" x="320" y="282" text-anchor="middle">one login, many machines — interconnect speed is the ceiling</text>
</svg>`
  },

  'virt-levels': {
    title: 'Virtualization Levels: ISA to Application',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated stack of virtualization levels from hardware up to libraries">
${defs}
<g class="stagebox a1"><rect x="170" y="30" width="300" height="44" rx="8"/><text x="320" y="57">application / library level</text></g>
<g class="stagebox a2"><rect x="170" y="84" width="300" height="44" rx="8"/><text x="320" y="111">OS level · containers</text></g>
<g class="stagebox a3"><rect x="170" y="138" width="300" height="44" rx="8"/><text x="320" y="165">ISA / ABI level · VMM</text></g>
<g class="stagebox a4"><rect x="170" y="192" width="300" height="44" rx="8"/><text x="320" y="219">hardware abstraction layer</text></g>
<text class="animnote a5" x="320" y="272" text-anchor="middle">higher = lighter + weaker isolation · lower = heavier + full guests</text>
</svg>`
  },

  'docker-arch': {
    title: 'Docker: Engine, Images, Containers',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated docker: one engine running three isolated containers from layered images">
${defs}
<rect class="host" x="90" y="60" width="460" height="190" rx="10"/><text class="hostlbl" x="320" y="85">host OS + Docker engine</text>
<g class="cell a1"><rect x="120" y="110" width="120" height="110" rx="8"/><text x="180" y="155">web</text><text x="180" y="180">image layers</text></g>
<g class="cell a2"><rect x="260" y="110" width="120" height="110" rx="8"/><text x="320" y="155">api</text><text x="320" y="180">image layers</text></g>
<g class="cell a3"><rect x="400" y="110" width="120" height="110" rx="8"/><text x="460" y="155">db</text><text x="460" y="180">image layers</text></g>
<text class="animnote a4" x="320" y="282" text-anchor="middle">shared kernel, separate filesystems — VMs' weight without their hunger</text>
</svg>`
  },

  'attack-chain': {
    title: 'Attack Chain: Recon to Covering Tracks',
    svg: `<svg viewBox="0 0 640 260" role="img" aria-label="Animated kill chain: recon, scan, exploit, persist, cover tracks">
${defs}
<g class="stagebox a1"><rect x="10" y="100" width="112" height="64" rx="10"/><text x="66" y="126">1 · RECON</text><text x="66" y="146" class="sub">whois · DNS</text></g>
<g class="stagebox a2"><rect x="142" y="100" width="112" height="64" rx="10"/><text x="198" y="126">2 · SCAN</text><text x="198" y="146" class="sub">nmap · ports</text></g>
<g class="stagebox a3"><rect x="274" y="100" width="112" height="64" rx="10"/><text x="330" y="126">3 · EXPLOIT</text><text x="330" y="146" class="sub">metasploit</text></g>
<g class="stagebox a4"><rect x="406" y="100" width="112" height="64" rx="10"/><text x="462" y="126">4 · PERSIST</text><text x="462" y="146" class="sub">escalate · stay</text></g>
<g class="stagebox a5"><rect x="528" y="100" width="102" height="64" rx="10"/><text x="579" y="126">5 · COVER</text><text x="579" y="146" class="sub">wipe logs</text></g>
<text class="animnote a5" x="320" y="220" text-anchor="middle">defenders break any link — recon traces, closed ports, patched holes, watched logs</text>
</svg>`
  },

  'xss-flow': {
    title: 'Stored XSS: Attacker Poisons, Victim Executes',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated stored XSS: attacker stores script, victim loads page, browser runs it">
${defs}
${node(110, 150, 'ATK', 'a1')}
${node(320, 150, 'SITE', 'a2')}
${node(530, 150, 'YOU', 'a3')}
<g class="msg a1"><line x1="110" y1="150" x2="320" y2="150" marker-end="url(#ah)"/><text x="215" y="130" text-anchor="middle">1 · plants script</text></g>
<g class="msg a2"><line x1="320" y1="150" x2="530" y2="150" marker-end="url(#ah)"/><text x="425" y="130" text-anchor="middle">2 · serves page</text></g>
<g class="msg a3"><line x1="530" y1="180" x2="320" y2="200" marker-end="url(#ah)"/><text x="425" y="225" text-anchor="middle">3 · cookie leaks back</text></g>
<text class="animnote a4" x="320" y="270" text-anchor="middle">server parrots input unescaped — browser can't tell data from code</text>
</svg>`
  },

  'ddos-flood': {
    title: 'DDoS: Botnet Flood vs Lone DoS',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated DDoS: many bots flood one server while a lone attacker is filterable">
${defs}
${node(520, 150, 'SRV', 'a3')}
${node(90, 70, 'B1', 'a1')}${node(90, 150, 'B2', 'a1')}${node(90, 230, 'B3', 'a1')}
${node(260, 150, '1', 'a2')}
${edge(90, 70, 260, 150, 'a1')}${edge(90, 150, 260, 150, 'a1')}${edge(90, 230, 260, 150, 'a1')}
${edge(260, 150, 520, 150, 'a2')}
<text class="animcap a1" x="90" y="30" text-anchor="middle">botnet ×1000s</text>
<text class="badge1 a2" x="260" y="110">one IP? block it.</text>
<text class="badge1 a3" x="390" y="120">1000 IPs? drown.</text>
<text class="animnote a4" x="320" y="282" text-anchor="middle">distribution defeats address-blocking — absorb, scrub, anycast</text>
</svg>`
  },

  'mlp-layers': {
    title: 'MLP Forward Pass: Layers of Weighted Votes',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated MLP: inputs fan into hidden units then to output, layer by layer">
${defs}
${node(90, 100, 'x1', 'a1')}${node(90, 200, 'x2', 'a1')}
${node(280, 75, 'h1', 'a2')}${node(280, 150, 'h2', 'a2')}${node(280, 225, 'h3', 'a2')}
${node(480, 150, 'y', 'a3')}
${edge(90, 100, 280, 75, 'a2')}${edge(90, 100, 280, 150, 'a2')}${edge(90, 100, 280, 225, 'a2')}
${edge(90, 200, 280, 75, 'a2')}${edge(90, 200, 280, 150, 'a2')}${edge(90, 200, 280, 225, 'a2')}
${edge(280, 75, 480, 150, 'a3')}${edge(280, 150, 480, 150, 'a3')}${edge(280, 225, 480, 150, 'a3')}
<text class="animnote a4" x="320" y="282" text-anchor="middle">each layer votes with weights — depth stacks the electorates</text>
</svg>`
  },

  'conv-slide': {
    title: 'Convolution: Filter Slides, Feature Map Grows',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated convolution: a small filter window slides across an input grid producing one map cell per stop">
${defs}
<text class="animcap a1" x="160" y="30" text-anchor="middle">input 5×5</text>
<g class="cell a1"><rect x="80" y="60" width="160" height="160" rx="8"/></g>
<g class="cell cand a2"><rect x="80" y="60" width="64" height="64" rx="6"/><text x="112" y="97">3×3</text></g>
<g class="msg a3"><line x1="260" y1="140" x2="340" y2="140" marker-end="url(#ah)"/><text x="300" y="125" text-anchor="middle">dot</text></g>
<g class="cell a3"><rect x="360" y="60" width="160" height="160" rx="8"/><text x="440" y="140">map</text></g>
<text class="animnote a4" x="320" y="272" text-anchor="middle">one window stop = one dot product = one map cell — weights shared everywhere</text>
</svg>`
  },

  'lstm-cell': {
    title: 'LSTM Cell: Gates Guard the Conveyor',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated LSTM: forget, input and output gates guarding a running cell state">
${defs}
<line class="axis" x1="40" y1="150" x2="600" y2="150"/>
<g class="stagebox a1"><rect x="90" y="120" width="110" height="60" rx="10"/><text x="145" y="144">FORGET</text><text x="145" y="162" class="sub">keep?</text></g>
<g class="stagebox a2"><rect x="265" y="120" width="110" height="60" rx="10"/><text x="320" y="144">INPUT</text><text x="320" y="162" class="sub">write?</text></g>
<g class="stagebox a3"><rect x="440" y="120" width="110" height="60" rx="10"/><text x="495" y="144">OUTPUT</text><text x="495" y="162" class="sub">reveal?</text></g>
<text class="animcap" x="320" y="60" text-anchor="middle">cell state runs the straight rail above the gates</text>
<text class="animnote a4" x="320" y="250" text-anchor="middle">sigmoid bouncers (0/1-ish) × tanh candidates — gradients ride the rail, not the gates</text>
</svg>`
  },

  'dh-exchange': {
    title: 'Diffie–Hellman: Public Swap, Private Secret',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated Diffie-Hellman: Alice and Bob swap public values and derive the same secret">
${defs}
${node(110, 150, 'A', 'a1')}
${node(530, 150, 'B', 'a1')}
<g class="msg a2"><line x1="110" y1="150" x2="530" y2="150" marker-end="url(#ah)"/><text x="320" y="130" text-anchor="middle">swap g^a, g^b (public!)</text></g>
<g class="msg a3"><line x1="530" y1="180" x2="110" y2="180" marker-end="url(#ah)"/><text x="320" y="205" text-anchor="middle">shared: g^ab (private!)</text></g>
<text class="animcap a1" x="320" y="40" text-anchor="middle">secrets a, b never travel</text>
<text class="badge1 a3" x="320" y="250">eavesdropper sees g^a, g^b — discrete log stands guard</text>
<text class="animnote a4" x="320" y="282" text-anchor="middle">public arithmetic in transit, private exponents at home</text>
</svg>`
  },

  'feistel-round': {
    title: 'Feistel Round: Split, Mix, Swap',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated Feistel round: left half mixes through F with the key then halves swap">
${defs}
${node(200, 80, 'L', 'a1')}${node(440, 80, 'R', 'a1')}
<g class="msg a2"><line x1="440" y1="80" x2="440" y2="170" marker-end="url(#ah)"/><text x="510" y="130" text-anchor="middle">F(R,K)</text></g>
<g class="msg a3"><line x1="200" y1="80" x2="440" y2="220" marker-end="url(#ah)"/><text x="270" y="180" text-anchor="middle">L⊕F → new R</text></g>
${node(200, 230, 'R', 'a3')}${node(440, 230, 'L’', 'a3')}
<text class="animnote a4" x="320" y="282" text-anchor="middle">F needn't invert — decryption runs rounds backwards</text>
</svg>`
  },

  'hash-chain': {
    title: 'Hash Chain: Blocks Linked by Digests',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated hash chain: each block embeds the previous digest so edits cascade">
${defs}
<g class="cell a1"><rect x="40" y="100" width="150" height="100" rx="8"/><text x="115" y="145">blk 1</text><text x="115" y="170">h0 inside</text></g>
<g class="cell a2"><rect x="245" y="100" width="150" height="100" rx="8"/><text x="320" y="145">blk 2</text><text x="320" y="170">h1 inside</text></g>
<g class="cell a3"><rect x="450" y="100" width="150" height="100" rx="8"/><text x="525" y="145">blk 3</text><text x="525" y="170">h2 inside</text></g>
<g class="msg a2"><line x1="190" y1="150" x2="245" y2="150" marker-end="url(#ah)"/></g>
<g class="msg a3"><line x1="395" y1="150" x2="450" y2="150" marker-end="url(#ah)"/></g>
<text class="animnote a4" x="320" y="262" text-anchor="middle">edit blk 1 → every downstream digest breaks — tampering glows</text>
</svg>`
  },

  'test-pyramid': {
    title: 'Test Pyramid: Many Unit, Few E2E',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated test pyramid: broad unit base, service middle, thin UI and exploratory peak">
${defs}
<g class="stagebox a3"><rect x="270" y="40" width="100" height="44" rx="8"/><text x="320" y="67">UI / E2E</text></g>
<g class="stagebox a2"><rect x="210" y="100" width="220" height="44" rx="8"/><text x="320" y="127">service / API</text></g>
<g class="stagebox a1"><rect x="140" y="160" width="360" height="44" rx="8"/><text x="320" y="187">unit (broad base!)</text></g>
<text class="badge1 a2" x="320" y="232">cost+speed rise upward — bulk lives at the base</text>
<text class="animnote a4" x="320" y="272" text-anchor="middle">inverted pyramid (E2E-heavy) is slow, flaky, expensive — flip it</text>
</svg>`
  },

  'cfg-cover': {
    title: 'CFG Coverage: Node, Edge, Path',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated control-flow graph: node coverage first, then edges, then paths">
${defs}
${node(320, 60, 'S', 'a1')}
${node(200, 150, 'A', 'a1')}${node(440, 150, 'B', 'a1')}
${node(320, 240, 'E', 'a1')}
${edge(320, 60, 200, 150, 'a2')}${edge(320, 60, 440, 150, 'a2')}
${edge(200, 150, 320, 240, 'a2')}${edge(440, 150, 320, 240, 'a2')}
<text class="animcap a1" x="320" y="30" text-anchor="middle">nodes: visit all four</text>
<text class="badge1 a2" x="100" y="270">edges: ride all four</text>
<text class="badge1 a3" x="540" y="270">paths: S-A-E, S-B-E…</text>
<text class="animnote a4" x="320" y="292" text-anchor="middle">each rung subsumes below — paths imply edges imply nodes</text>
</svg>`
  },

  'mutant-score': {
    title: 'Mutation Score: Killed vs Survived',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated mutation score: seeded mutants killed by tests raise the score, survivors indict the suite">
${defs}
<g class="cell a1"><rect x="60" y="110" width="130" height="80" rx="8"/><text x="125" y="145">mutants: 20</text><text x="125" y="168">seeded faults</text></g>
<g class="cell a2"><rect x="255" y="110" width="130" height="80" rx="8"/><text x="320" y="145">killed: 17</text><text x="320" y="168">tests caught</text></g>
<g class="cell cand a3"><rect x="450" y="110" width="130" height="80" rx="8"/><text x="515" y="145">lived: 3</text><text x="515" y="168">suite blind!</text></g>
<text class="crcres a4" x="320" y="250" text-anchor="middle">score = 17/20 = 85% — survivors name the missing tests</text>
</svg>`
  },

  'dt-loop': {
    title: 'Design Thinking Loop: Five Phases, Infinite Laps',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated design thinking loop: empathize, define, ideate, prototype, test cycling">
${defs}
${node(320, 60, 'EMP', 'a1')}
${node(500, 150, 'DEF', 'a1')}${node(140, 150, 'TEST', 'a5')}
${node(430, 250, 'PROTO', 'a4')}${node(210, 250, 'IDEA', 'a3')}
${edge(320, 60, 500, 150, 'a1')}${edge(500, 150, 430, 250, 'a2')}
${edge(430, 250, 210, 250, 'a3')}${edge(210, 250, 140, 150, 'a4')}${edge(140, 150, 320, 60, 'a5')}
<text class="animnote a5" x="320" y="292" text-anchor="middle">test results re-enter empathize — laps, not lines</text>
</svg>`
  },

  'empathy-map': {
    title: 'Empathy Map: Four Quadrants, One User',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated empathy map quadrants: says, thinks, does, feels around a user">
${defs}
${node(320, 150, 'USER', 'a1')}
<g class="cell a2"><rect x="60" y="40" width="140" height="70" rx="8"/><text x="130" y="70">SAYS</text><text x="130" y="92">quotes</text></g>
<g class="cell a2"><rect x="440" y="40" width="140" height="70" rx="8"/><text x="510" y="70">THINKS</text><text x="510" y="92">beliefs</text></g>
<g class="cell a3"><rect x="60" y="190" width="140" height="70" rx="8"/><text x="130" y="220">DOES</text><text x="130" y="242">actions</text></g>
<g class="cell a3"><rect x="440" y="190" width="140" height="70" rx="8"/><text x="510" y="220">FEELS</text><text x="510" y="242">emotions</text></g>
<text class="animnote a4" x="320" y="290" text-anchor="middle">says+does are observed, thinks+feels inferred — label which is which</text>
</svg>`
  },

  'pilot-ladder': {
    title: 'PoC to Production: The Maturity Ladder',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated ladder: PoC, design, alpha, beta, pilot, production climbing in fidelity and cost">
${defs}
<g class="stagebox a1"><rect x="20" y="180" width="90" height="60" rx="8"/><text x="65" y="204">PoC</text><text x="65" y="222" class="sub">risk?</text></g>
<g class="stagebox a2"><rect x="140" y="150" width="90" height="60" rx="8"/><text x="185" y="174">ALPHA</text><text x="185" y="192" class="sub">works?</text></g>
<g class="stagebox a3"><rect x="260" y="120" width="90" height="60" rx="8"/><text x="305" y="144">BETA</text><text x="305" y="162" class="sub">users?</text></g>
<g class="stagebox a4"><rect x="380" y="90" width="90" height="60" rx="8"/><text x="425" y="114">PILOT</text><text x="425" y="132" class="sub">scale?</text></g>
<g class="stagebox a5"><rect x="500" y="60" width="110" height="60" rx="8"/><text x="555" y="84">PROD</text><text x="555" y="102" class="sub">sustain?</text></g>
<text class="animnote a5" x="320" y="272" text-anchor="middle">fidelity and cost climb together — kill cheap ideas at the bottom</text>
</svg>`
  }
};

export const SCENE_IDS = Object.keys(SCENES);
