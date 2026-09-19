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

  'traversal-orders': {
    title: 'In, Pre, Post on the Worked Tree',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated traversals on root 1 with left 2 holding 4 and 5 and right 3: inorder 4 2 5 1 3, preorder 1 2 4 5 3, postorder 4 5 2 3 1">
${defs}
<text class="animcap a1" x="150" y="24" text-anchor="middle">worked tree</text>
${edge(170, 52, 100, 140, 'a1')}${edge(170, 52, 240, 140, 'a1')}${edge(100, 140, 62, 228, 'a1')}${edge(100, 140, 138, 228, 'a1')}
${node(170, 52, '1', 'a1')}${node(100, 140, '2', 'a1')}${node(240, 140, '3', 'a1')}${node(62, 228, '4', 'a1')}${node(138, 228, '5', 'a1')}
<text class="crcrow a2" x="330" y="95">In: 4 2 5 1 3</text>
<text class="crcrow a3" x="330" y="145">Pre: 1 2 4 5 3</text>
<text class="crcrow a4" x="330" y="195">Post: 4 5 2 3 1</text>
<text class="animnote a5" x="320" y="262" text-anchor="middle">level 1 2 3 4 5 · pre+in rebuilds — pre+post cannot</text>
</svg>`
  },

  'bst-successor-swap': {
    title: 'Deleting 30 via Successor 40',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated BST deletion: node 30 with children 20 and 40 is replaced by inorder successor 40">
${defs}
<text class="animcap a1" x="160" y="24" text-anchor="middle">before: delete 30?</text>
<text class="animcap a4" x="480" y="24" text-anchor="middle">after</text>
${edge(160, 62, 100, 142, 'a1')}${edge(160, 62, 220, 142, 'a1')}${edge(100, 142, 66, 224, 'a1')}${edge(100, 142, 134, 224, 'a1')}
${node(160, 62, '50', 'a1')}${node(100, 142, '30', 'a1')}${node(220, 142, '70', 'a1')}${node(66, 224, '20', 'a1')}${node(134, 224, '40', 'a1')}
<text class="ordbadge a2" x="100" y="108" text-anchor="middle">✕ delete (2 children)</text>
<text class="ordbadge a2" x="134" y="272" text-anchor="middle">successor 40 ↑</text>
<text class="bigarrow a3" x="320" y="150" text-anchor="middle">⟶</text>
${edge(480, 62, 420, 142, 'a4')}${edge(480, 62, 540, 142, 'a4')}${edge(420, 142, 386, 224, 'a4')}
${node(480, 62, '50', 'a4')}${node(420, 142, '40', 'a4')}${node(540, 142, '70', 'a4')}${node(386, 224, '20', 'a4')}
<text class="ordbadge a4" x="480" y="272" text-anchor="middle">40 copied up, origin removed</text>
<text class="animnote a5" x="320" y="292" text-anchor="middle">successor fits the vacated bounds exactly — invariant holds</text>
</svg>`
  },

  'heap-siftup': {
    title: '1 Bubbles 6 to 3 to 1',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated min-heap insert: appended 1 swaps past 3 then 2 giving 1 5 2 9 6 3">
${defs}
<text class="animcap a1" x="320" y="22" text-anchor="middle">min-heap [2,5,3,9,6] + insert 1</text>
<text class="crcrow a1" x="24" y="94">1 @ i=6</text>
<g class="cell a1"><rect x="180" y="60" width="62" height="52" rx="8"/><text x="211" y="94" text-anchor="middle">2</text></g>
<g class="cell a1"><rect x="250" y="60" width="62" height="52" rx="8"/><text x="281" y="94" text-anchor="middle">5</text></g>
<g class="cell a1"><rect x="320" y="60" width="62" height="52" rx="8"/><text x="351" y="94" text-anchor="middle">3</text></g>
<g class="cell a1"><rect x="390" y="60" width="62" height="52" rx="8"/><text x="421" y="94" text-anchor="middle">9</text></g>
<g class="cell a1"><rect x="460" y="60" width="62" height="52" rx="8"/><text x="491" y="94" text-anchor="middle">6</text></g>
<g class="cell cand a1"><rect x="530" y="60" width="62" height="52" rx="8"/><text x="561" y="94" text-anchor="middle">1</text></g>
<text class="crcrow a2" x="24" y="166">1 @ i=3</text>
<g class="cell a2"><rect x="180" y="132" width="62" height="52" rx="8"/><text x="211" y="166" text-anchor="middle">2</text></g>
<g class="cell a2"><rect x="250" y="132" width="62" height="52" rx="8"/><text x="281" y="166" text-anchor="middle">5</text></g>
<g class="cell cand a2"><rect x="320" y="132" width="62" height="52" rx="8"/><text x="351" y="166" text-anchor="middle">1</text></g>
<g class="cell a2"><rect x="390" y="132" width="62" height="52" rx="8"/><text x="421" y="166" text-anchor="middle">9</text></g>
<g class="cell a2"><rect x="460" y="132" width="62" height="52" rx="8"/><text x="491" y="166" text-anchor="middle">6</text></g>
<g class="cell a2"><rect x="530" y="132" width="62" height="52" rx="8"/><text x="561" y="166" text-anchor="middle">3</text></g>
<text class="crcrow a3" x="24" y="238">1 @ i=1 ✓</text>
<g class="cell cand a3"><rect x="180" y="204" width="62" height="52" rx="8"/><text x="211" y="238" text-anchor="middle">1</text></g>
<g class="cell a3"><rect x="250" y="204" width="62" height="52" rx="8"/><text x="281" y="238" text-anchor="middle">5</text></g>
<g class="cell a3"><rect x="320" y="204" width="62" height="52" rx="8"/><text x="351" y="238" text-anchor="middle">2</text></g>
<g class="cell a3"><rect x="390" y="204" width="62" height="52" rx="8"/><text x="421" y="238" text-anchor="middle">9</text></g>
<g class="cell a3"><rect x="460" y="204" width="62" height="52" rx="8"/><text x="491" y="238" text-anchor="middle">6</text></g>
<g class="cell a3"><rect x="530" y="204" width="62" height="52" rx="8"/><text x="561" y="238" text-anchor="middle">3</text></g>
<text class="animnote a4" x="320" y="284" text-anchor="middle">each swap halves the index — O(log n) hops, array stays gap-free</text>
</svg>`
  },

  'adjlist-vs-matrix': {
    title: 'Path 1-2-3-4 in Three Formats',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated graph representations of path 1-2-3-4 as drawing, adjacency lists and matrix">
${defs}
<text class="animcap a1" x="120" y="24" text-anchor="middle">path 1–2–3–4</text>
${edge(120, 60, 120, 125, 'a1')}${edge(120, 125, 120, 190, 'a1')}${edge(120, 190, 120, 255, 'a1')}
${node(120, 60, '1', 'a1')}${node(120, 125, '2', 'a1')}${node(120, 190, '3', 'a1')}${node(120, 255, '4', 'a1')}
<text class="animcap a2" x="300" y="60">adj lists:</text>
<text class="crcrow a2" x="300" y="95">1 : [2]</text>
<text class="crcrow a2" x="300" y="125">2 : [1, 3]</text>
<text class="crcrow a2" x="300" y="155">3 : [2, 4]</text>
<text class="crcrow a2" x="300" y="185">4 : [3]</text>
<text class="animcap a3" x="480" y="60">matrix 4×4:</text>
<text class="crcrow a3" x="480" y="95">0 1 0 0</text>
<text class="crcrow a3" x="480" y="125">1 0 1 0</text>
<text class="crcrow a3" x="480" y="155">0 1 0 1</text>
<text class="crcrow a3" x="480" y="185">0 0 1 0</text>
<text class="animnote a4" x="320" y="282" text-anchor="middle">10⁶ cities, 3·10⁶ roads → lists Θ(V+E); matrix needs 10¹² cells</text>
</svg>`
  },

  'lomuto-partition': {
    title: 'Pivot 24 Goes Home to Slot 2',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated Lomuto partition of 24 10 36 15 28 placing pivot 24 at index 2">
${defs}
<text class="animcap a1" x="320" y="30" text-anchor="middle">partition [24,10,36,15,28] — pivot 24</text>
<g class="cell a1"><rect x="150" y="52" width="66" height="52" rx="8"/><text x="183" y="86" text-anchor="middle">24</text></g>
<g class="cell a1"><rect x="228" y="52" width="66" height="52" rx="8"/><text x="261" y="86" text-anchor="middle">10</text></g>
<g class="cell a1"><rect x="306" y="52" width="66" height="52" rx="8"/><text x="339" y="86" text-anchor="middle">36</text></g>
<g class="cell a1"><rect x="384" y="52" width="66" height="52" rx="8"/><text x="417" y="86" text-anchor="middle">15</text></g>
<g class="cell a1"><rect x="462" y="52" width="66" height="52" rx="8"/><text x="495" y="86" text-anchor="middle">28</text></g>
<text class="crcrow a2" x="24" y="170">scan: {10,15} left</text>
<g class="cell a2"><rect x="150" y="136" width="66" height="52" rx="8"/><text x="183" y="170" text-anchor="middle">10</text></g>
<g class="cell a2"><rect x="228" y="136" width="66" height="52" rx="8"/><text x="261" y="170" text-anchor="middle">15</text></g>
<g class="cell cand a2"><rect x="306" y="136" width="66" height="52" rx="8"/><text x="339" y="170" text-anchor="middle">24</text></g>
<g class="cell a2"><rect x="384" y="136" width="66" height="52" rx="8"/><text x="417" y="170" text-anchor="middle">36</text></g>
<g class="cell a2"><rect x="462" y="136" width="66" height="52" rx="8"/><text x="495" y="170" text-anchor="middle">28</text></g>
<text class="crcrow a3" x="320" y="226" text-anchor="middle">24 home @ slot 2 → recurse [10,15] · [36,28]</text>
<text class="animnote a4" x="320" y="264" text-anchor="middle">each partition places its pivot — depth mirrors split quality</text>
</svg>`
  },

  'merge-zip': {
    title: 'Merge-Sort [38,27,43,3], Level by Level',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated merge sort splits and zips of 38 27 43 3 ending 3 27 38 43">
${defs}
<text class="animcap a1" x="320" y="40" text-anchor="middle">merge-sort [38, 27, 43, 3]</text>
<text class="crcrow a1" x="320" y="85" text-anchor="middle">[38, 27, 43, 3]</text>
<text class="crcrow a2" x="320" y="130" text-anchor="middle">[38, 27] · [43, 3] → [38][27] · [43][3]</text>
<text class="crcrow a3" x="320" y="175" text-anchor="middle">zip → [27, 38] · [3, 43]</text>
<text class="crcres a4" x="320" y="220" text-anchor="middle">zip → [3, 27, 38, 43] ✓</text>
<text class="animnote a5" x="320" y="264" text-anchor="middle">log n levels × linear zips — halves, not pivots: the guarantee</text>
</svg>`
  },

  'binary-halving': {
    title: '23 Found in Two Halvings',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated binary search for 23: mid 3 is 12 so go right, mid 5 hits 23">
${defs}
<text class="animcap a1" x="320" y="28" text-anchor="middle">search 23 in [2,5,8,12,16,23,38,56]</text>
<text class="animcap a1" x="92" y="58" text-anchor="middle">0</text><text class="animcap a1" x="156" y="58" text-anchor="middle">1</text><text class="animcap a1" x="220" y="58" text-anchor="middle">2</text><text class="animcap a1" x="284" y="58" text-anchor="middle">3</text><text class="animcap a1" x="348" y="58" text-anchor="middle">4</text><text class="animcap a1" x="412" y="58" text-anchor="middle">5</text><text class="animcap a1" x="476" y="58" text-anchor="middle">6</text><text class="animcap a1" x="540" y="58" text-anchor="middle">7</text>
<g class="cell a1"><rect x="64" y="68" width="56" height="48" rx="8"/><text x="92" y="99" text-anchor="middle">2</text></g>
<g class="cell a1"><rect x="128" y="68" width="56" height="48" rx="8"/><text x="156" y="99" text-anchor="middle">5</text></g>
<g class="cell a1"><rect x="192" y="68" width="56" height="48" rx="8"/><text x="220" y="99" text-anchor="middle">8</text></g>
<g class="cell cand a1"><rect x="256" y="68" width="56" height="48" rx="8"/><text x="284" y="99" text-anchor="middle">12</text></g>
<g class="cell a1"><rect x="320" y="68" width="56" height="48" rx="8"/><text x="348" y="99" text-anchor="middle">16</text></g>
<g class="cell a1"><rect x="384" y="68" width="56" height="48" rx="8"/><text x="412" y="99" text-anchor="middle">23</text></g>
<g class="cell a1"><rect x="448" y="68" width="56" height="48" rx="8"/><text x="476" y="99" text-anchor="middle">38</text></g>
<g class="cell a1"><rect x="512" y="68" width="56" height="48" rx="8"/><text x="540" y="99" text-anchor="middle">56</text></g>
<text class="crcrow a2" x="320" y="150" text-anchor="middle">lo0 hi7 mid3 = 12 &lt; 23 → lo = 4 (left half discarded)</text>
<g class="cell a3"><rect x="192" y="166" width="56" height="48" rx="8"/><text x="220" y="197" text-anchor="middle">16</text></g>
<g class="cell cand a3"><rect x="256" y="166" width="56" height="48" rx="8"/><text x="284" y="197" text-anchor="middle">23</text></g>
<g class="cell a3"><rect x="320" y="166" width="56" height="48" rx="8"/><text x="348" y="197" text-anchor="middle">38</text></g>
<g class="cell a3"><rect x="384" y="166" width="56" height="48" rx="8"/><text x="412" y="197" text-anchor="middle">56</text></g>
<text class="crcres a3" x="500" y="197">mid5 ✓ 2 iters</text>
<text class="animnote a4" x="320" y="262" text-anchor="middle">worst case ⌈log₂n⌉ probes: n=1000 → 10 · n=10⁶ → 20</text>
</svg>`
  },

  'probe-walk': {
    title: '14 Walks 0 to 1 to 2',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated linear probing: key 14 hashes to 0, finds 0 and 1 busy, lands in 2">
${defs}
<text class="animcap a1" x="320" y="30" text-anchor="middle">m = 7: 700@0 · 50@1 · 76@6 — insert 14, h = 0</text>
<text class="animcap a1" x="99" y="62" text-anchor="middle">0</text><text class="animcap a1" x="171" y="62" text-anchor="middle">1</text><text class="animcap a1" x="243" y="62" text-anchor="middle">2</text><text class="animcap a1" x="315" y="62" text-anchor="middle">3</text><text class="animcap a1" x="387" y="62" text-anchor="middle">4</text><text class="animcap a1" x="459" y="62" text-anchor="middle">5</text><text class="animcap a1" x="531" y="62" text-anchor="middle">6</text>
<g class="cell a1"><rect x="68" y="72" width="62" height="52" rx="8"/><text x="99" y="106" text-anchor="middle">700</text></g>
<g class="cell a1"><rect x="140" y="72" width="62" height="52" rx="8"/><text x="171" y="106" text-anchor="middle">50</text></g>
<g class="cell a1"><rect x="212" y="72" width="62" height="52" rx="8"/><text x="243" y="106" text-anchor="middle">·</text></g>
<g class="cell a1"><rect x="284" y="72" width="62" height="52" rx="8"/><text x="315" y="106" text-anchor="middle">·</text></g>
<g class="cell a1"><rect x="356" y="72" width="62" height="52" rx="8"/><text x="387" y="106" text-anchor="middle">·</text></g>
<g class="cell a1"><rect x="428" y="72" width="62" height="52" rx="8"/><text x="459" y="106" text-anchor="middle">·</text></g>
<g class="cell a1"><rect x="500" y="72" width="62" height="52" rx="8"/><text x="531" y="106" text-anchor="middle">76</text></g>
${msg(99, 160, 171, 160, 'busy', 150, 'a2')}
${msg(171, 195, 243, 195, 'busy', 185, 'a3')}
<text class="crcres a4" x="320" y="240" text-anchor="middle">slot 2 free — 14 lands · chain [0→1→2] ✓</text>
<text class="animnote a5" x="320" y="274" text-anchor="middle">probe walks narrate clustering's birth — the graded content</text>
</svg>`
  },

  'selection-passes': {
    title: 'Selection Drafts 10, 13, Then 29',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated selection sort passes on 29 10 14 37 13 placing 10 then 13 then 29">
${defs}
<text class="animcap a1" x="320" y="26" text-anchor="middle">selection on [29,10,14,37,13]</text>
<text class="crcrow a1" x="24" y="80">start</text>
<g class="cell a1"><rect x="170" y="48" width="64" height="48" rx="8"/><text x="202" y="80" text-anchor="middle">29</text></g>
<g class="cell a1"><rect x="242" y="48" width="64" height="48" rx="8"/><text x="274" y="80" text-anchor="middle">10</text></g>
<g class="cell a1"><rect x="314" y="48" width="64" height="48" rx="8"/><text x="346" y="80" text-anchor="middle">14</text></g>
<g class="cell a1"><rect x="386" y="48" width="64" height="48" rx="8"/><text x="418" y="80" text-anchor="middle">37</text></g>
<g class="cell a1"><rect x="458" y="48" width="64" height="48" rx="8"/><text x="490" y="80" text-anchor="middle">13</text></g>
<text class="crcrow a2" x="24" y="148">pass1: min 10</text>
<g class="cell cand a2"><rect x="170" y="116" width="64" height="48" rx="8"/><text x="202" y="148" text-anchor="middle">10</text></g>
<g class="cell a2"><rect x="242" y="116" width="64" height="48" rx="8"/><text x="274" y="148" text-anchor="middle">29</text></g>
<g class="cell a2"><rect x="314" y="116" width="64" height="48" rx="8"/><text x="346" y="148" text-anchor="middle">14</text></g>
<g class="cell a2"><rect x="386" y="116" width="64" height="48" rx="8"/><text x="418" y="148" text-anchor="middle">37</text></g>
<g class="cell a2"><rect x="458" y="116" width="64" height="48" rx="8"/><text x="490" y="148" text-anchor="middle">13</text></g>
<text class="crcrow a3" x="24" y="216">pass2: min 13</text>
<g class="cell a3"><rect x="170" y="184" width="64" height="48" rx="8"/><text x="202" y="216" text-anchor="middle">10</text></g>
<g class="cell cand a3"><rect x="242" y="184" width="64" height="48" rx="8"/><text x="274" y="216" text-anchor="middle">13</text></g>
<g class="cell a3"><rect x="314" y="184" width="64" height="48" rx="8"/><text x="346" y="216" text-anchor="middle">14</text></g>
<g class="cell a3"><rect x="386" y="184" width="64" height="48" rx="8"/><text x="418" y="216" text-anchor="middle">37</text></g>
<g class="cell a3"><rect x="458" y="184" width="64" height="48" rx="8"/><text x="490" y="216" text-anchor="middle">29</text></g>
<text class="crcrow a4" x="24" y="276">pass3 holds, pass4: min 29</text>
<g class="cell a4"><rect x="170" y="244" width="64" height="48" rx="8"/><text x="202" y="276" text-anchor="middle">10</text></g>
<g class="cell a4"><rect x="242" y="244" width="64" height="48" rx="8"/><text x="274" y="276" text-anchor="middle">13</text></g>
<g class="cell a4"><rect x="314" y="244" width="64" height="48" rx="8"/><text x="346" y="276" text-anchor="middle">14</text></g>
<g class="cell cand a4"><rect x="386" y="244" width="64" height="48" rx="8"/><text x="418" y="276" text-anchor="middle">29</text></g>
<g class="cell a4"><rect x="458" y="244" width="64" height="48" rx="8"/><text x="490" y="276" text-anchor="middle">37</text></g>
</svg>`
  },

  'radix-buckets': {
    title: 'Radix Pigeonholes, Ones to Hundreds',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated radix sort passes: ones buckets gather, tens gather, hundreds finish sorted">
${defs}
<text class="animcap a1" x="320" y="36" text-anchor="middle">radix LSD on [170,45,75,90,802,24,2,66]</text>
<text class="crcrow a2" x="320" y="80" text-anchor="middle">ones → 0:{170,90} 2:{802,2} 4:{24} 5:{45,75} 6:{66}</text>
<text class="crcrow a3" x="320" y="122" text-anchor="middle">gather → [170,90,802,2,24,45,75,66]</text>
<text class="crcrow a3" x="320" y="164" text-anchor="middle">tens → 0:{802,2} 2:{24} 4:{45} 6:{66} 7:{170,75} 9:{90}</text>
<text class="crcrow a4" x="320" y="206" text-anchor="middle">gather → [802,2,24,45,66,170,75,90]</text>
<text class="crcres a5" x="320" y="248" text-anchor="middle">hundreds → [2,24,45,66,75,90,170,802] ✓ stable throughout</text>
</svg>`
  },

  'mle-map-tug': {
    title: 'Data Pulls to 5, Prior Anchors 0',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated precision tug of war: data pulls to 5.0, prior anchors 0, MAP splits at 2.5, then n equals 400 drags MAP to 4.95">
${defs}
<text class="animcap a1" x="320" y="36" text-anchor="middle">sensor: x̄ = 5.0 (n = 4, σ² = 4) · prior μ₀ = 0 (τ² = 1)</text>
<line class="axis" x1="60" y1="130" x2="580" y2="130"/>
<text class="animcap a1" x="80" y="160" text-anchor="middle">prior 0</text>
<text class="animcap a1" x="560" y="160" text-anchor="middle">MLE 5.0</text>
<circle class="a1" cx="80" cy="130" r="7" fill="var(--accent)"/>
<circle class="a1" cx="560" cy="130" r="7" fill="var(--accent)"/>
${msg(300, 200, 120, 200, 'prior w = 1/τ² = 1', 190, 'a2')}
${msg(340, 200, 520, 200, 'data w = n/σ² = 1', 190, 'a2')}
<text class="crcrow a2" x="320" y="248" text-anchor="middle">dead tie → MAP = (5.0 + 0)/2 = 2.5</text>
<circle class="a2" cx="320" cy="130" r="9" fill="var(--accent-warm)"/>
<text class="crcres a3" x="320" y="278" text-anchor="middle">n = 400: data w = 100 → MAP ≈ 4.95 ≈ MLE ✓</text>
</svg>`
  },

  'ruler-fit': {
    title: 'Three Points, One Ruler',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated least squares fit through points 1 1, 2 2 and 3 2 with ruler y equals two thirds plus x over two">
${defs}
<line class="axis" x1="80" y1="40" x2="80" y2="270"/>
<line class="axis" x1="80" y1="270" x2="580" y2="270"/>
<g class="a1"><circle cx="160" cy="205" r="7" fill="var(--accent)"/><circle cx="320" cy="95" r="7" fill="var(--accent)"/><circle cx="480" cy="40" r="7" fill="var(--accent)"/></g>
<line class="eg a2" x1="100" y1="207" x2="540" y2="56" stroke-width="3"/>
<text class="crcrow a2" x="320" y="30" text-anchor="middle">ŷ = 2/3 + x/2 · pts (1,1) (2,2) (3,2)</text>
<line class="eg a3" x1="160" y1="205" x2="160" y2="187" stroke-dasharray="5 4"/>
<line class="eg a3" x1="320" y1="95" x2="320" y2="132" stroke-dasharray="5 4"/>
<line class="eg a3" x1="480" y1="40" x2="480" y2="77" stroke-dasharray="5 4"/>
<text class="ordbadge a3" x="160" y="228" text-anchor="middle">+1/6</text>
<text class="ordbadge a3" x="320" y="152" text-anchor="middle">−1/3</text>
<text class="ordbadge a3" x="480" y="97" text-anchor="middle">+1/6</text>
<text class="animnote a4" x="320" y="292" text-anchor="middle">residuals sum to zero, ⊥ both columns — projection on real numbers</text>
</svg>`
  },

  'ucurve-overfit': {
    title: 'Train Falls, Test U-Turns',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated bias variance tradeoff: train error falls with complexity while test error U-turns at the sweet spot">
${defs}
<line class="axis" x1="80" y1="30" x2="80" y2="260"/>
<line class="axis" x1="80" y1="260" x2="580" y2="260"/>
<text class="animcap a1" x="545" y="250" text-anchor="middle">complexity →</text>
<text class="animcap a1" x="40" y="150" text-anchor="middle">err</text>
<path class="eg a2" d="M100,220 L200,180 L300,150 L400,130 L500,118" fill="none" stroke-width="3"/>
<text class="crcrow a2" x="520" y="110">train: falls</text>
<path class="eg a3" d="M100,210 L200,170 L300,150 L400,165 L500,200" fill="none" stroke-width="3" stroke-dasharray="8 5"/>
<text class="crcrow a3" x="520" y="210">test: U-turns</text>
<circle class="a4" cx="300" cy="150" r="8" fill="none" stroke="var(--correct)" stroke-width="3"/>
<text class="crcres a4" x="300" y="130" text-anchor="middle">sweet spot</text>
<text class="animnote a4" x="320" y="286" text-anchor="middle">R² 0.997 + LOO ≈ 0 agree → genuine; divergence = overfitting</text>
</svg>`
  },

  'harden-ladder': {
    title: 'Five Rungs, Each Defeats a Vector',
    svg: `<svg viewBox="0 0 640 260" role="img" aria-label="Animated Windows hardening ladder: vetted media, least privilege accounts, patch rings, guards on, tested backups">
${defs}
<g class="stagebox a1"><rect x="10" y="100" width="112" height="64" rx="10"/><text x="66" y="126">1 · MEDIA</text><text x="66" y="146" class="sub">hash-check</text></g>
<g class="stagebox a2"><rect x="134" y="100" width="112" height="64" rx="10"/><text x="190" y="126">2 · ACCOUNTS</text><text x="190" y="146" class="sub">std + UAC max</text></g>
<g class="stagebox a3"><rect x="258" y="100" width="112" height="64" rx="10"/><text x="314" y="126">3 · PATCHES</text><text x="314" y="146" class="sub">test → broad</text></g>
<g class="stagebox a4"><rect x="382" y="100" width="112" height="64" rx="10"/><text x="438" y="126">4 · GUARDS</text><text x="438" y="146" class="sub">AV + deny-in</text></g>
<g class="stagebox a5"><rect x="506" y="100" width="112" height="64" rx="10"/><text x="562" y="126">5 · BACKUPS</text><text x="562" y="146" class="sub">3-2-1 + drill</text></g>
<text class="flowarrow a2" x="128" y="140" text-anchor="middle">→</text>
<text class="flowarrow a3" x="252" y="140" text-anchor="middle">→</text>
<text class="flowarrow a4" x="376" y="140" text-anchor="middle">→</text>
<text class="flowarrow a5" x="500" y="140" text-anchor="middle">→</text>
<text class="animcap a1" x="320" y="50" text-anchor="middle">sequence is the methodology — vector mapped per rung</text>
</svg>`
  },

  'fw-profiles': {
    title: 'Profiles Are Threat Models of the Wire',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated firewall profiles: domain most open, private moderate, public fortress">
${defs}
<text class="animcap a1" x="320" y="36" text-anchor="middle">set by network, not wish</text>
<g class="stagebox a1"><rect x="60" y="80" width="150" height="80" rx="10"/><text x="135" y="110">DOMAIN</text><text x="135" y="132" class="sub">managed · most open</text></g>
<g class="stagebox a2"><rect x="245" y="80" width="150" height="80" rx="10"/><text x="320" y="110">PRIVATE</text><text x="320" y="132" class="sub">home · moderate</text></g>
<g class="stagebox a3"><rect x="430" y="80" width="150" height="80" rx="10"/><text x="505" y="110">PUBLIC</text><text x="505" y="132" class="sub">hostile · fortress</text></g>
<text class="bigarrow a2" x="227" y="128" text-anchor="middle">→</text>
<text class="bigarrow a3" x="412" y="128" text-anchor="middle">→</text>
<text class="crcrow a3" x="320" y="200" text-anchor="middle">public: discovery off · inbound denied hardest</text>
<text class="animnote a4" x="320" y="246" text-anchor="middle">café air marked private silently opens gates — profile hygiene is step zero</text>
</svg>`
  },

  'maid-ladder': {
    title: 'Each Rung Answers the Last Bypass',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated evil maid ladder: boot USB answered by LUKS, bootkit by Secure Boot and TPM">
${defs}
<text class="animcap a1" x="320" y="36" text-anchor="middle">physical access = skeleton key — answer in rungs</text>
<text class="crcrow a1" x="320" y="90" text-anchor="middle">boot-USB resets passwords → LUKS brick</text>
<text class="crcrow a2" x="320" y="140" text-anchor="middle">bootkit reinstalls loader → Secure Boot + TPM-sealed keys</text>
<text class="crcrow a3" x="320" y="190" text-anchor="middle">CMOS reset kills BIOS PINs → tamper-evidence + custody</text>
<text class="animnote a4" x="320" y="244" text-anchor="middle">ladder, not wall — never one-wall claims; BIOS PINs alone are single-pin lies</text>
</svg>`
  },

  'mac-vs-dac': {
    title: 'Policy Beats Ownership, Even Roots',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated DAC versus MAC: root identity reads shadow under DAC but httpd type is denied under SELinux">
${defs}
<text class="animcap a1" x="160" y="36" text-anchor="middle">DAC: who-are-you</text>
<text class="animcap a3" x="480" y="36" text-anchor="middle">MAC: what-type-are-you</text>
<g class="stagebox a1"><rect x="40" y="70" width="240" height="90" rx="10"/><text x="160" y="102">root → /etc/shadow</text><text x="160" y="130" class="sub">owner powers: ALLOWED ✗</text></g>
<text class="bigarrow a2" x="320" y="122" text-anchor="middle">→</text>
<g class="stagebox a3"><rect x="360" y="70" width="240" height="90" rx="10"/><text x="480" y="102">httpd_t → shadow</text><text x="480" y="130" class="sub">type policy: DENIED ✓</text></g>
<text class="crcrow a3" x="320" y="205" text-anchor="middle">compromised user ≠ compromised domain</text>
<text class="animnote a4" x="320" y="248" text-anchor="middle">setenforce 0 forever trades the vest for quiet logs — permissive, then policy</text>
</svg>`
  },

  'knn-vote': {
    title: 'Three Neighbors Vote 2 to 1 for Plus',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated k nearest neighbors vote: query Q at 2 2 with neighbors B and C at distance 1.0 and A at 1.414 voting plus">
${defs}
<line class="axis" x1="60" y1="40" x2="60" y2="260"/>
<line class="axis" x1="60" y1="260" x2="500" y2="260"/>
${msg(180, 160, 180, 100, '1.0', 122, 'a2')}
${msg(180, 160, 240, 160, '1.0', 150, 'a2')}
${msg(180, 160, 120, 220, '1.414', 200, 'a2')}
${node(120, 220, 'A+', 'a1')}${node(180, 100, 'B+', 'a1')}${node(240, 160, 'C-', 'a1')}${node(360, 40, 'D-', 'a1')}
${node(180, 160, 'Q?', 'a1')}
<text class="ordbadge a2" x="360" y="82" text-anchor="middle">D: 3.606 — too far</text>
<text class="crcrow a3" x="320" y="286" text-anchor="middle">k = 3: B+, C−, A+ → plus wins 2–1</text>
<text class="animnote a4" x="500" y="240" text-anchor="middle">k = 2 ties 1–1 · k = 1 hair-triggers</text>
</svg>`
  },

  'nb-scores': {
    title: 'Ham Wins 5 to 1 on Free Lunch',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated Naive Bayes scores: spam 0.020 versus ham 0.098 for free lunch">
${defs}
<text class="animcap a1" x="320" y="40" text-anchor="middle">classify "free lunch" · Laplace α = 1, |V| = 3</text>
<text class="crcrow a2" x="40" y="120">S: 0.4 × 0.5 × 0.1 = 0.020</text>
<rect class="a2" x="430" y="102" width="40" height="20" rx="4" fill="var(--accent)"/>
<text class="crcrow a3" x="40" y="180">H: 0.6 × 0.286 × 0.571 ≈ 0.098</text>
<rect class="a3" x="430" y="162" width="196" height="20" rx="4" fill="var(--accent-warm)"/>
<text class="crcres a4" x="320" y="240" text-anchor="middle">ham wins ~5:1 — unseen "lunch" rescued from zero-veto by +1</text>
</svg>`
  },

  'gain-bars': {
    title: 'Outlook Outbids Wind Five to One',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated information gain ranking: Outlook 0.247 beats humidity, wind and temperature for the root split">
${defs}
<text class="animcap a1" x="320" y="34" text-anchor="middle">H(S) = 0.940 bits · 9 Play-Yes / 5 No</text>
<text class="crcrow a2" x="40" y="90">Outlook 0.247</text>
<rect class="a2" x="230" y="72" width="321" height="20" rx="4" fill="var(--accent-warm)"/>
<text class="ordbadge a2" x="570" y="90">ROOT</text>
<text class="crcrow a3" x="40" y="140">Humidity 0.151</text>
<rect class="a3" x="230" y="122" width="196" height="20" rx="4" fill="var(--accent)"/>
<text class="crcrow a3" x="40" y="190">Wind 0.048</text>
<rect class="a3" x="230" y="172" width="62" height="20" rx="4" fill="var(--accent)"/>
<text class="crcrow a4" x="40" y="240">Temp 0.029</text>
<rect class="a4" x="230" y="222" width="38" height="20" rx="4" fill="var(--accent)"/>
<text class="animnote a4" x="420" y="268" text-anchor="middle">Overcast 4+/0 → instant Yes-leaf</text>
</svg>`
  },

  'perceptron-trace': {
    title: 'Four Mistakes, Then Silence at x1 = 2',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated perceptron trace converging to boundary x1 equals 2 after four mistakes">
${defs}
<line class="axis" x1="60" y1="30" x2="60" y2="270"/>
<line class="axis" x1="60" y1="270" x2="420" y2="270"/>
${node(200, 140, 'A+', 'a1')}${node(255, 85, 'B+', 'a1')}${node(90, 195, 'C-', 'a1')}${node(145, 250, 'D-', 'a1')}
<line class="eg a2" x1="200" y1="30" x2="200" y2="270" stroke-width="3"/>
<text class="crcrow a2" x="330" y="90">w = [1,0], b = −2</text>
<text class="crcrow a2" x="330" y="120">boundary: x1 = 2</text>
<text class="crcres a3" x="330" y="170">4 mistakes → clean pass ✓</text>
<text class="animnote a4" x="330" y="215" text-anchor="middle">XOR points through this loop cycle forever — the wall</text>
</svg>`
  },

  'kernel-lift': {
    title: 'Squaring Turns Impossible Into Trivial',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated kernel lift: alternating 1D points become separable clusters under phi of x equals x squared">
${defs}
<text class="animcap a1" x="320" y="36" text-anchor="middle">1D: − at ±2 · + at ±0.5 — every threshold mislabels ≥ 1</text>
${node(120, 90, '−', 'a1')}${node(255, 90, '+', 'a1')}${node(385, 90, '+', 'a1')}${node(520, 90, '−', 'a1')}
<text class="animcap a1" x="120" y="132" text-anchor="middle">−2</text>
<text class="animcap a1" x="255" y="132" text-anchor="middle">−0.5</text>
<text class="animcap a1" x="385" y="132" text-anchor="middle">+0.5</text>
<text class="animcap a1" x="520" y="132" text-anchor="middle">+2</text>
${edge(120, 112, 200, 178, 'a2')}${edge(255, 112, 200, 178, 'a2')}${edge(385, 112, 440, 178, 'a2')}${edge(520, 112, 440, 178, 'a2')}
${node(200, 200, '++', 'a2')}${node(440, 200, '−−', 'a2')}
<text class="animcap a2" x="200" y="242" text-anchor="middle">φ = 0.25</text>
<text class="animcap a2" x="440" y="242" text-anchor="middle">φ = 4</text>
<line class="eg a3" x1="320" y1="160" x2="320" y2="250" stroke-width="3" stroke-dasharray="8 5"/>
<text class="crcres a3" x="320" y="152" text-anchor="middle">t = 1 separates ✓</text>
<text class="animnote a4" x="320" y="278" text-anchor="middle">RBF lifts every finite set — γ, not existence, is the decision</text>
</svg>`
  },

  'dendro-merge': {
    title: 'Merge at 1, Then Everything at 4',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated single linkage dendrogram on points 1 2 6 7 merging pairs at height 1 then all at height 4">
${defs}
<line class="axis" x1="60" y1="230" x2="580" y2="230"/>
${node(125, 230, '1', 'a1')}${node(190, 230, '2', 'a1')}${node(450, 230, '6', 'a1')}${node(515, 230, '7', 'a1')}
<line class="eg a2" x1="125" y1="208" x2="125" y2="150"/>
<line class="eg a2" x1="190" y1="208" x2="190" y2="150"/>
<line class="eg a2" x1="125" y1="150" x2="190" y2="150"/>
<line class="eg a2" x1="450" y1="208" x2="450" y2="150"/>
<line class="eg a2" x1="515" y1="208" x2="515" y2="150"/>
<line class="eg a2" x1="450" y1="150" x2="515" y2="150"/>
<text class="ordbadge a2" x="157" y="140" text-anchor="middle">h = 1</text>
<text class="ordbadge a2" x="482" y="140" text-anchor="middle">h = 1</text>
<line class="eg a3" x1="157" y1="150" x2="157" y2="90"/>
<line class="eg a3" x1="483" y1="150" x2="483" y2="90"/>
<line class="eg a3" x1="157" y1="90" x2="483" y2="90"/>
<text class="crcres a3" x="320" y="76" text-anchor="middle">merge all at h = 4 ✓</text>
<text class="animnote a4" x="320" y="278" text-anchor="middle">complete linkage: final merge at 6 · k = 2 cut between heights 1 and 4</text>
</svg>`
  },

  'variance-floor': {
    title: 'Bagging Hits the Correlated Floor',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated variance bars: single tree 4.0, bagged ensemble 1.214, correlated floor 1.2">
${defs}
<text class="animcap a1" x="320" y="36" text-anchor="middle">σ² = 4 · ρ = 0.3 · B = 200</text>
<text class="crcrow a1" x="40" y="110">single tree: 4.0</text>
<rect class="a1" x="300" y="92" width="270" height="20" rx="4" fill="var(--accent)"/>
<text class="crcrow a2" x="40" y="170">bagged: 1.214</text>
<rect class="a2" x="300" y="152" width="82" height="20" rx="4" fill="var(--accent-warm)"/>
<text class="crcrow a3" x="40" y="230">floor ρσ² = 1.2</text>
<rect class="a3" x="300" y="212" width="81" height="20" rx="4" fill="var(--accent)"/>
<text class="animnote a4" x="320" y="272" text-anchor="middle">3.3× cut — and no B breaches 1.2: only decorrelation (forests) lowers ρ</text>
</svg>`
  },

  'adaboost-d2': {
    title: 'Half the Mass Moves to One Point',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated AdaBoost reweighting: three correct points shrink to one sixth each, the miss grows to one half">
${defs}
<text class="animcap a1" x="320" y="32" text-anchor="middle">D₁: four × 0.25 · ε₁ = 0.25 · α₁ ≈ 0.549</text>
<g class="cell a1"><rect x="100" y="52" width="90" height="48" rx="8"/><text x="145" y="84" text-anchor="middle">0.25 ✓</text></g>
<g class="cell a1"><rect x="210" y="52" width="90" height="48" rx="8"/><text x="255" y="84" text-anchor="middle">0.25 ✓</text></g>
<g class="cell a1"><rect x="320" y="52" width="90" height="48" rx="8"/><text x="365" y="84" text-anchor="middle">0.25 ✓</text></g>
<g class="cell a1"><rect x="430" y="52" width="90" height="48" rx="8"/><text x="475" y="84" text-anchor="middle">0.25 ✗</text></g>
<text class="ordbadge a2" x="145" y="132" text-anchor="middle">×0.577</text>
<text class="ordbadge a2" x="255" y="132" text-anchor="middle">×0.577</text>
<text class="ordbadge a2" x="365" y="132" text-anchor="middle">×0.577</text>
<text class="ordbadge a2" x="475" y="132" text-anchor="middle">×1.732</text>
<g class="cell a3"><rect x="100" y="148" width="90" height="48" rx="8"/><text x="145" y="180" text-anchor="middle">1/6</text></g>
<g class="cell a3"><rect x="210" y="148" width="90" height="48" rx="8"/><text x="255" y="180" text-anchor="middle">1/6</text></g>
<g class="cell a3"><rect x="320" y="148" width="90" height="48" rx="8"/><text x="365" y="180" text-anchor="middle">1/6</text></g>
<g class="cell cand a3"><rect x="430" y="148" width="90" height="48" rx="8"/><text x="475" y="180" text-anchor="middle">1/2</text></g>
<text class="crcres a3" x="320" y="232" text-anchor="middle">÷ Z = 0.866 → D₂ ✓</text>
<text class="animnote a4" x="320" y="268" text-anchor="middle">missed point = half the mass — round 2 fixes it or perishes</text>
</svg>`
  },

  'mds-ledger': {
    title: 'Eigenvalues Ledger the Triangle',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated eigenvalue ledger: 12.965 plus 3.702 plus 0 sums to trace 16.667">
${defs}
<text class="animcap a1" x="320" y="36" text-anchor="middle">3-4-5 triangle · B rows sum to 0 · trace 16.667</text>
<text class="crcrow a1" x="40" y="110">λ₁ ≈ 12.965</text>
<rect class="a1" x="250" y="92" width="311" height="20" rx="4" fill="var(--accent-warm)"/>
<text class="crcrow a2" x="40" y="170">λ₂ ≈ 3.702</text>
<rect class="a2" x="250" y="152" width="89" height="20" rx="4" fill="var(--accent)"/>
<text class="crcrow a3" x="40" y="230">λ₃ = 0</text>
<rect class="a3" x="250" y="212" width="2" height="20" rx="4" fill="var(--accent)"/>
<text class="ordbadge a3" x="280" y="230">centering's signature</text>
<text class="animnote a4" x="320" y="272" text-anchor="middle">dim-1 keeps 77.8% · dim-2 exact (rank 2) — ledger balances</text>
</svg>`
  },

  'nb-posterior': {
    title: 'Prior Plus Two Clues Outvote One Scream',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated Naive Bayes posterior: spam score 0.012 versus ham 0.0175 normalizing to 0.4068 versus 0.5932">
${defs}
<text class="animcap a1" x="320" y="36" text-anchor="middle">P(spam) = 0.3 · mail has "offer" + "meeting"</text>
<text class="crcrow a2" x="40" y="110">S: 0.3×0.4×0.1 = 0.012</text>
<rect class="a2" x="400" y="92" width="96" height="20" rx="4" fill="var(--accent)"/>
<text class="crcrow a2" x="40" y="150">H: 0.7×0.05×0.5 = 0.0175</text>
<rect class="a2" x="400" y="132" width="140" height="20" rx="4" fill="var(--accent)"/>
<text class="crcrow a3" x="40" y="210">posterior: 0.4068 vs 0.5932</text>
<rect class="a3" x="400" y="192" width="163" height="20" rx="4" fill="var(--accent)" stroke="var(--accent-warm)" stroke-width="2"/>
<text class="animnote a4" x="320" y="262" text-anchor="middle">"offer" screams spam — prior plus "meeting" outvote it</text>
</svg>`
  },

  'knn-tiebreak': {
    title: 'A and C Tie, B Breaks It',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated kNN tie: query equidistant 2.828 to A and C with B nearest at 1.414 voting plus">
${defs}
<line class="axis" x1="60" y1="40" x2="60" y2="260"/>
<line class="axis" x1="60" y1="260" x2="500" y2="260"/>
${msg(255, 144, 200, 182, '1.414', 190, 'a2')}
${msg(255, 144, 145, 220, '2.828', 215, 'a2')}
${msg(255, 144, 365, 68, '2.828', 100, 'a2')}
${msg(255, 144, 420, 30, '4.243', 75, 'a2')}
${node(145, 220, 'A+', 'a1')}${node(200, 182, 'B+', 'a1')}${node(255, 144, 'Q?', 'a1')}${node(365, 68, 'C-', 'a1')}${node(420, 30, 'D-', 'a1')}
<text class="crcrow a3" x="320" y="286" text-anchor="middle">k = 3: B+, A+, C− → + wins 2–1</text>
<text class="ordbadge a4" x="515" y="95" text-anchor="middle">A–C tie: sort fully</text>
</svg>`
  },

  'penalty-price': {
    title: 'Squaring Punishes 3.0 Ninefold',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated penalty comparison: LASSO 5.1 versus RIDGE 13.01 on weights 3.0, minus 2.0, 0.1">
${defs}
<text class="animcap a1" x="320" y="36" text-anchor="middle">w = [3.0, −2.0, 0.1] · λ = 1</text>
<text class="crcrow a2" x="40" y="120">LASSO |·|: 5.1</text>
<rect class="a2" x="330" y="102" width="153" height="20" rx="4" fill="var(--accent)"/>
<text class="crcrow a3" x="40" y="180">RIDGE (·)²: 13.01</text>
<rect class="a3" x="330" y="162" width="390" height="20" rx="4" fill="var(--accent-warm}"/>
<text class="animnote a4" x="320" y="240" text-anchor="middle">squaring charges 3.0 ninefold, barely sees 0.1 — temper, not just total</text>
</svg>`
  },

  'split-buckets': {
    title: 'Stratify or the Minority Vanishes',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated stratified split: train 700 with 70 faulty, validation and test 150 each with 15 faulty">
${defs}
<text class="animcap a1" x="320" y="40" text-anchor="middle">1000 motors · 10% faulty · split 70/15/15</text>
<g class="stagebox a1"><rect x="75" y="90" width="150" height="80" rx="10"/><text x="150" y="120">TRAIN 700</text><text x="150" y="142" class="sub">70 faulty</text></g>
<g class="stagebox a2"><rect x="245" y="90" width="150" height="80" rx="10"/><text x="320" y="120">VAL 150</text><text x="320" y="142" class="sub">15 faulty</text></g>
<g class="stagebox a3"><rect x="415" y="90" width="150" height="80" rx="10"/><text x="490" y="120">TEST 150</text><text x="490" y="142" class="sub">15 faulty</text></g>
<text class="animnote a4" x="320" y="220" text-anchor="middle">reuse test for tuning = leak · unstratified rare classes vanish by chance</text>
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
  },

  'gradient-descent': {
    title: 'Gradient Descent: Downhill Steps to the Minimum',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated gradient descent: a ball takes shrinking steps down a cost bowl to the minimum">
${defs}
<line class="axis" x1="80" y1="40" x2="80" y2="260"/><line class="axis" x1="80" y1="260" x2="600" y2="260"/>
<text class="axislbl" x="45" y="150">J</text><text class="axislbl" x="340" y="285">w →</text>
<path class="eg" d="M100,80 Q320,100 340,230 Q360,100 560,90" style="fill:none"/>
<g class="nd a1"><circle cx="160" cy="105" r="10"/><text x="160" y="80">α big</text></g>
<g class="nd a2"><circle cx="250" cy="140" r="10"/><text x="250" y="115">step</text></g>
<g class="nd a3"><circle cx="310" cy="200" r="10"/><text x="310" y="175">step</text></g>
<g class="nd a4"><circle cx="340" cy="230" r="12"/><text x="340" y="258">min ✓</text></g>
<text class="animnote a5" x="340" y="35" text-anchor="middle">big steps rush, small steps crawl — overshoot vs creep is the rate bargain</text>
</svg>`
  },

  'roc-tradeoff': {
    title: 'ROC Curve: TPR vs FPR Tradeoff',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated ROC: curve climbs above the diagonal, higher AUC means better ranking">
${defs}
<line class="axis" x1="100" y1="30" x2="100" y2="250"/><line class="axis" x1="100" y1="250" x2="540" y2="250"/>
<text class="axislbl" x="40" y="140">TPR</text><text class="axislbl" x="320" y="278">FPR →</text>
<line class="eg" x1="100" y1="250" x2="540" y2="30"/>
<path class="eg a2" d="M100,250 Q200,120 300,90 Q420,60 540,40" style="fill:none"/>
<g class="nd a1"><circle cx="100" cy="250" r="10"/><text x="100" y="272">0,0</text></g>
<g class="nd a3"><circle cx="300" cy="90" r="10"/><text x="300" y="70">knee</text></g>
<g class="nd a4"><circle cx="540" cy="40" r="10"/><text x="540" y="62">1,1</text></g>
<text class="badge1 a3" x="430" y="150">AUC = area above diagonal</text>
<text class="animnote a5" x="320" y="15" text-anchor="middle">threshold slides along the curve — recall bought with false alarms</text>
</svg>`
  },

  'kmeans-loop': {
    title: 'K-Means: Assign, Move, Repeat',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated k-means: points assigned to nearest centroid, centroids move to means, repeat">
${defs}
<text class="animcap a1" x="160" y="30" text-anchor="middle">ASSIGN · nearest wins</text>
${node(120, 110, '●', 'a1')}${node(180, 140, '●', 'a1')}${node(450, 110, '▲', 'a1')}${node(510, 140, '▲', 'a1')}
<text class="bigarrow a2" x="320" y="150" text-anchor="middle">assign ⟷ update</text>
<text class="animcap a3" x="480" y="30" text-anchor="middle">UPDATE · mean moves ✚</text>
${node(150, 220, '✚', 'a3')}${node(480, 220, '✚', 'a3')}
<text class="animnote a4" x="320" y="282" text-anchor="middle">labels fix → centres move → labels re-fix until nobody switches</text>
</svg>`
  },

  'minimax-backup': {
    title: 'Minimax Backup: MIN Floors, MAX Picks',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated minimax: MIN nodes take the smallest leaf below them, MAX root takes the largest">
${defs}
${node(320, 60, 'MAX', 'a1')}
${node(170, 160, 'MIN', 'a2')}${node(470, 160, 'MIN', 'a2')}
${edge(320, 60, 170, 160, 'a1')}${edge(320, 60, 470, 160, 'a1')}
${node(100, 250, '3', 'a3')}${node(170, 250, '12', 'a3')}${node(240, 250, '8', 'a3')}
${node(400, 250, '2', 'a4')}${node(470, 250, '4', 'a4')}${node(540, 250, '6', 'a4')}
${edge(170, 160, 100, 250, 'a3')}${edge(170, 160, 170, 250, 'a3')}${edge(170, 160, 240, 250, 'a3')}
${edge(470, 160, 400, 250, 'a4')}${edge(470, 160, 470, 250, 'a4')}${edge(470, 160, 540, 250, 'a4')}
<text class="badge1 a3" x="170" y="205">min → 3</text>
<text class="badge1 a4" x="470" y="205">min → 2</text>
<text class="crcres a5" x="320" y="292" text-anchor="middle">root = max(3, 2) = 3 · move left</text>
</svg>`
  },

  'alphabeta-cut': {
    title: 'Alpha-Beta Cutoff: Bounds That Prune',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated alpha-beta: after the left branch returns 3, the right branch is abandoned once it proves worse">
${defs}
${node(320, 60, 'MAX', 'a1')}
${node(170, 160, 'MIN', 'a2')}${node(470, 160, 'MIN', 'a2')}
${edge(320, 60, 170, 160, 'a1')}${edge(320, 60, 470, 160, 'a1')}
${node(100, 250, '3', 'a3')}${node(170, 250, '12', 'a3')}${node(240, 250, '8', 'a3')}
${node(400, 250, '2', 'a4')}
<g class="cell cand a5"><rect x="448" y="228" width="44" height="44" rx="8"/><text x="470" y="256">?</text></g>
<g class="cell cand a5"><rect x="518" y="228" width="44" height="44" rx="8"/><text x="540" y="256">?</text></g>
${edge(170, 160, 100, 250, 'a3')}${edge(170, 160, 170, 250, 'a3')}${edge(170, 160, 240, 250, 'a3')}
${edge(470, 160, 400, 250, 'a4')}
<text class="badge1 a3" x="170" y="205">α = 3 set</text>
<text class="badge1 a4" x="470" y="205">2 ≤ α ✂ cut!</text>
<text class="animnote a5" x="320" y="292" text-anchor="middle">4 leaves evaluated, 2 never born — same move, less work</text>
</svg>`
  },

  'dns-resolve': {
    title: 'DNS Resolution: Climbing Down the Hierarchy',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated DNS: client asks local server, which climbs root, TLD, authoritative in turn">
${defs}
${node(90, 150, 'YOU', 'a1')}
${node(250, 150, 'LOCAL', 'a2')}
${node(410, 80, 'ROOT', 'a3')}${node(410, 220, 'TLD', 'a3')}
${node(560, 150, 'AUTH', 'a4')}
${edge(90, 150, 250, 150, 'a1')}
${edge(250, 150, 410, 80, 'a3')}${edge(250, 150, 410, 220, 'a3')}${edge(250, 150, 560, 150, 'a4')}
<text class="badge1 a2" x="250" y="195">caches first!</text>
<text class="badge1 a4" x="560" y="195">IP at last</text>
<text class="animnote a5" x="320" y="282" text-anchor="middle">8 messages worst case — every cache hit deletes a round trip</text>
</svg>`
  },

  'multicast-rpf': {
    title: 'RPF Check: Forward on Tree, Drop the Loop',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated multicast: packet arriving on the shortest-path interface forwards to members, looped copy fails RPF and drops">
${defs}
${node(90, 150, 'S', 'a1')}
${node(270, 150, 'R1', 'a2')}
${node(450, 80, 'H1 ✓', 'a3')}${node(450, 220, 'R2', 'a3')}
${node(570, 220, 'H3 ✓', 'a4')}
${edge(90, 150, 270, 150, 'a1')}
${edge(270, 150, 450, 80, 'a3')}${edge(270, 150, 450, 220, 'a3')}
${edge(450, 220, 570, 220, 'a4')}
<text class="badge1 a2" x="270" y="195">RPF: eth0 ✓ fwd ×2</text>
<text class="badge1 a5" x="270" y="115">loop on eth1 ✂ drop</text>
<text class="animnote a5" x="320" y="282" text-anchor="middle">on-tree arrival copies once per member link — off-tree arrival dies silently</text>
</svg>`
  },

  'leaky-bucket': {
    title: 'Token Bucket: Burst Capped, Rate Metered',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated token bucket: tokens accrue at fixed rate up to depth, each packet spends one">
${defs}
<g class="cell a1"><rect x="60" y="90" width="170" height="120" rx="10"/><text x="145" y="120">bucket C=6</text><text x="145" y="145">tokens +1/s… r=3</text></g>
<g class="msg a2"><line x1="230" y1="150" x2="330" y2="150" marker-end="url(#ah)"/><text x="280" y="130" text-anchor="middle">burst 10</text></g>
<g class="cell a3"><rect x="330" y="90" width="120" height="120" rx="10"/><text x="390" y="130">6 pass ✓</text><text x="390" y="155">4 wait/drop</text></g>
<g class="msg a4"><line x1="450" y1="150" x2="550" y2="150" marker-end="url(#ah)"/><text x="500" y="130" text-anchor="middle">steady 3/s</text></g>
<text class="animnote a5" x="320" y="262" text-anchor="middle">depth absorbs bursts, rate meters the flow — conform ≤ C + rT always</text>
</svg>`
  },

  'mobile-ip-tunnel': {
    title: 'Mobile IP: Triangle Routing via Home Agent',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated Mobile IP: correspondent sends to home agent, which tunnels to foreign agent, which delivers to mobile node">
${defs}
${node(90, 80, 'YOU', 'a1')}
${node(320, 60, 'HA', 'a2')}
${node(320, 220, 'FA', 'a3')}
${node(550, 220, 'MN', 'a4')}
${edge(90, 80, 320, 60, 'a1')}
${edge(320, 60, 320, 220, 'a2')}
${edge(320, 220, 550, 220, 'a3')}
<text class="badge1 a2" x="205" y="50">leg 1: to home</text>
<text class="badge1 a3" x="240" y="160">leg 2: tunnel IP-in-IP</text>
<text class="badge1 a4" x="460" y="260">leg 3: deliver</text>
<text class="animnote a5" x="320" y="292" text-anchor="middle">3 legs by default, 1 after route optimization — bindings trade messages for shortcuts</text>
</svg>`
  },

  'fiber-tir': {
    title: 'Fibre TIR: Zigzag Trapped by Critical Angle',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated fibre: light ray zigzags down the core, each wall hit above critical angle reflects fully">
${defs}
<line class="axis" x1="60" y1="90" x2="580" y2="90"/><line class="axis" x1="60" y1="210" x2="580" y2="210"/>
<text class="axislbl" x="320" y="75">cladding n=1.46</text><text class="axislbl" x="320" y="235">cladding n=1.46</text>
<text class="animcap a1" x="320" y="150" text-anchor="middle">core n=1.48</text>
<path class="eg a2" d="M70,200 L200,100 L330,200 L460,100 L570,180" style="fill:none"/>
<text class="badge1 a3" x="200" y="85">hit &gt; 80.6°? reflect!</text>
<text class="badge1 a4" x="460" y="240">leak &lt; 80.6°? escape…</text>
<text class="animnote a5" x="320" y="275" text-anchor="middle">dense-to-rare past critical angle: zero loss per bounce, gigahertz per second</text>
</svg>`
  },

  'floyd-via-k': {
    title: 'Floyd-Warshall: Detour via k Beats Direct',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated Floyd-Warshall: direct edge 1 to 3 costs 8, detour via 2 costs 5, matrix updates">
${defs}
${node(120, 150, '1', 'a1')}
${node(320, 80, '2', 'a2')}
${node(520, 150, '3', 'a3')}
${edge(120, 150, 320, 80, 'a1')}${edge(320, 80, 520, 150, 'a2')}${edge(120, 150, 520, 150, 'a3')}
<text class="animcap a1" x="220" y="90">3</text>
<text class="animcap a2" x="420" y="90">2</text>
<text class="badge1 a3" x="320" y="200">direct 8 → via-2: 5 ✓</text>
<text class="crcres a4" x="320" y="240" text-anchor="middle">D[1][3] = min(8, 3+2) = 5</text>
<text class="animnote a5" x="320" y="275" text-anchor="middle">k = 2 unlocks vertex 2 as midpoint — every pair re-asks each round</text>
</svg>`
  },

  'dv-count': {
    title: 'Distance Vector: Stale News Counts to Infinity',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated count to infinity: broken link costs climb round by round until poisoned reverse stops the rumour">
${defs}
${node(120, 150, 'A', 'a1')}
${node(320, 150, 'B', 'a2')}
${node(520, 150, 'C', 'a3')}
${edge(120, 150, 320, 150, 'a1')}
<line class="eg a3" x1="320" y1="150" x2="520" y2="150" stroke-dasharray="6 5"/>
<text class="animcap a1" x="220" y="125">cost 1 ✓</text>
<text class="badge1 a3" x="420" y="125">link dead ✗</text>
<text class="crcrow a2" x="120" y="220">B hears A=3 → B=4</text>
<text class="crcrow a3" x="120" y="250">A hears B=4 → A=5 …</text>
<text class="crcres a4" x="480" y="250" text-anchor="middle">poison ✂ stops it</text>
<text class="animnote a5" x="320" y="285" text-anchor="middle">rumours loop upward — never advertise a route back to its source</text>
</svg>`
  },

  'stimulated-emission': {
    title: 'Stimulated Emission: One Photon In, Two Clones Out',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated stimulated emission: a photon strikes an excited atom and two identical photons leave">
${defs}
<line class="axis" x1="180" y1="110" x2="460" y2="110"/><text class="axislbl" x="470" y="114">E2 excited</text>
<line class="axis" x1="180" y1="210" x2="460" y2="210"/><text class="axislbl" x="470" y="214">E1 ground</text>
${node(320, 110, 'e-', 'a1')}
<g class="msg a2"><line x1="40" y1="110" x2="170" y2="110" marker-end="url(#ah)"/><text x="105" y="90" text-anchor="middle">hν in</text></g>
<g class="msg a3"><line x1="470" y1="100" x2="600" y2="100" marker-end="url(#ah)"/><text x="535" y="85" text-anchor="middle">clone 1</text></g>
<g class="msg a3"><line x1="470" y1="120" x2="600" y2="120" marker-end="url(#ah)"/><text x="535" y="145" text-anchor="middle">clone 2</text></g>
${node(320, 210, 'e-', 'a4')}
<text class="animnote a5" x="320" y="272" text-anchor="middle">same energy, phase and direction — cloning is the entire laser</text>
</svg>`
  },

  'laser-cavity': {
    title: 'Laser Cavity: Mirrors Multiply Light to Threshold',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated laser cavity: photons bounce between full and partial mirrors, amplifying until a beam escapes">
${defs}
<g class="cell a1"><rect x="50" y="90" width="26" height="120" rx="6"/><text x="63" y="155">100%</text></g>
<g class="cell a1"><rect x="564" y="90" width="26" height="120" rx="6"/><text x="577" y="155">~99%</text></g>
<text class="animcap a1" x="320" y="60" text-anchor="middle">active medium (inverted!)</text>
<path class="eg a2" d="M80,150 Q200,110 320,150 T560,150" style="fill:none"/>
<g class="msg a3"><line x1="200" y1="190" x2="440" y2="190" marker-end="url(#ah)"/><text x="320" y="212" text-anchor="middle">round-trip gain ×2, ×4…</text></g>
<g class="msg a4"><line x1="590" y1="150" x2="635" y2="150" marker-end="url(#ah)"/><text x="612" y="135" text-anchor="middle">beam</text></g>
<text class="animnote a5" x="320" y="272" text-anchor="middle">gain per pass must beat mirror + scattering losses — threshold decides lasing</text>
</svg>`
  },

  'fiber-cone': {
    title: 'Acceptance Cone: Only Head-On Rays Get Trapped',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Animated acceptance cone: rays inside theta-a refract in and trap, steeper rays escape">
${defs}
<line class="axis" x1="230" y1="110" x2="600" y2="110"/><line class="axis" x1="230" y1="190" x2="600" y2="190"/>
<text class="axislbl" x="415" y="95">cladding</text>
<text class="animcap a1" x="415" y="155" text-anchor="middle">core n1</text>
<g class="msg a2"><line x1="60" y1="130" x2="230" y2="145" marker-end="url(#ah)"/><text x="120" y="115" text-anchor="middle">θa ✓ in</text></g>
<g class="msg a3"><line x1="60" y1="80" x2="230" y2="130" marker-end="url(#ah)"/><text x="120" y="65" text-anchor="middle">too steep ✗ out</text></g>
<path class="eg a4" d="M230,145 L350,175 L470,125 L590,175" style="fill:none"/>
<text class="badge1 a4" x="415" y="230">NA = sinθa = √(n1²−n2²)</text>
<text class="animnote a5" x="320" y="272" text-anchor="middle">funnel mouth set by the index step — wider step, fatter cone, more modes</text>
</svg>`
  },

  'fringe-profile': {
    title: 'Two-Slit Fringes: Equal Peaks, Equal Spacing',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Graphed fringe profile: equal cos-squared peaks separated by dark zeros">
${defs}
<line class="axis" x1="40" y1="250" x2="610" y2="250"/><line class="axis" x1="40" y1="250" x2="40" y2="40"/>
<text class="axislbl" x="600" y="272">position →</text><text class="axislbl" x="8" y="60">I</text>
<path class="eg a1" d="M40,250 Q70,110 100,250 Q130,110 160,250 Q190,110 220,250 Q250,110 280,250 Q310,110 340,250 Q370,110 400,250 Q430,110 460,250 Q490,110 520,250 Q550,110 580,250 L610,250" style="fill:none"/>
<text class="badge1 a2" x="340" y="130">bright: path diff = nλ</text>
<text class="badge1 a3" x="160" y="265">dark: (2n+1)λ/2</text>
<text class="animnote a4" x="320" y="292" text-anchor="middle">equal spacing, equal height — the two-slit signature (envelope comes with finite slits)</text>
</svg>`
  },

  'slit-envelope': {
    title: 'Single-Slit Envelope: One Wide Hump, Dark Ladders',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Graphed single-slit pattern: broad central maximum with dark minima ladders each side">
${defs}
<line class="axis" x1="30" y1="250" x2="610" y2="250"/><line class="axis" x1="30" y1="250" x2="30" y2="40"/>
<text class="axislbl" x="600" y="272">θ →</text><text class="axislbl" x="8" y="60">I</text>
<path class="eg a2" d="M40,250 Q55,215 70,250" style="fill:none"/>
<path class="eg a1" d="M140,250 C220,250 220,80 320,80 C420,80 420,250 500,250" style="fill:none"/>
<path class="eg a2" d="M570,250 Q585,215 600,250" style="fill:none"/>
<text class="badge1 a3" x="140" y="272">−1st min</text>
<text class="badge1 a3" x="470" y="272">+1st min</text>
<text class="badge1 a4" x="320" y="60">central max (a·sinθ = 0)</text>
<text class="animnote a5" x="320" y="292" text-anchor="middle">narrower slit, wider fan — dark ladders at a·sinθ = nλ</text>
</svg>`
  },

  'newton-rings': {
    title: "Newton's Rings: Contours of Equal Thickness",
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Diagram of Newton rings: concentric circles crowding outward with radii proportional to root-n">
${defs}
<circle class="eg a1" cx="200" cy="150" r="30" style="fill:none"/>
<circle class="eg a2" cx="200" cy="150" r="42" style="fill:none"/>
<circle class="eg a3" cx="200" cy="150" r="52" style="fill:none"/>
<circle class="eg a4" cx="200" cy="150" r="60" style="fill:none"/>
<circle class="eg a1" cx="200" cy="150" r="4"/>
<text class="animcap a2" x="200" y="40" text-anchor="middle">n = 1 · 2 · 3 · 4</text>
<text class="badge1 a3" x="470" y="110" text-anchor="middle">r_n ∝ √n — crowd outward</text>
<text class="crcres a4" x="470" y="150" text-anchor="middle">D_n² = 4nλR</text>
<text class="badge1 a5" x="470" y="190" text-anchor="middle">centre dark (flip!)</text>
<text class="animnote a5" x="320" y="272" text-anchor="middle">each ring a thickness contour — diameters squared run 1:2:3:4…</text>
</svg>`
  },

  'grating-fan': {
    title: 'Grating Orders: Staircase Echo Fans Into Spectra',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Diagram of grating orders: zero order straight, higher orders fanning wider with red outermost">
${defs}
<line class="axis" x1="220" y1="30" x2="220" y2="270"/>
<text class="axislbl" x="220" y="290" text-anchor="middle">grating (N lines)</text>
<g class="msg a1"><line x1="40" y1="150" x2="210" y2="150" marker-end="url(#ah)"/><text x="120" y="130" text-anchor="middle">white in</text></g>
<g class="msg a2"><line x1="230" y1="150" x2="600" y2="150" marker-end="url(#ah)"/><text x="420" y="135" text-anchor="middle">n = 0 (white!)</text></g>
<g class="msg a3"><line x1="230" y1="150" x2="560" y2="90" marker-end="url(#ah)"/><text x="430" y="95" text-anchor="middle">n = +1</text></g>
<g class="msg a3"><line x1="230" y1="150" x2="560" y2="210" marker-end="url(#ah)"/><text x="430" y="220" text-anchor="middle">n = −1</text></g>
<g class="msg a4"><line x1="230" y1="150" x2="500" y2="50" marker-end="url(#ah)"/><text x="400" y="45" text-anchor="middle">n = +2</text></g>
<text class="badge1 a4" x="420" y="260">red fans widest · violet hugs zero</text>
<text class="animnote a5" x="150" y="260" text-anchor="middle">(a+b)·sinθ = nλ per colour</text>
</svg>`
  },

  'uncertainty-tradeoff': {
    title: 'Uncertainty Tradeoff: Squeeze x, p Bulges',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Graphed tradeoff: momentum spread falls hyperbolically as position spread grows, forbidden zone below">
${defs}
<line class="axis" x1="70" y1="30" x2="70" y2="260"/><line class="axis" x1="70" y1="260" x2="610" y2="260"/>
<text class="axislbl" x="600" y="282">Δx →</text><text class="axislbl" x="30" y="50">Δp</text>
<path class="eg a1" d="M90,80 C220,95 260,140 590,240" style="fill:none"/>
<text class="animcap a2" x="420" y="120" text-anchor="middle">allowed (Δx·Δp ≥ ℏ/2)</text>
<text class="badge1 a3" x="180" y="250">forbidden!</text>
<text class="badge1 a4" x="480" y="80">pin x → p explodes</text>
<text class="animnote a5" x="320" y="292" text-anchor="middle">waterbed rule drawn: flatten one side, the other bulges past ℏ/2</text>
</svg>`
  },

  'box-states': {
    title: 'Box States: Humps Multiply, Energies Square',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Graphed box states: one, two and three hump wavefunctions with energies E1, 4E1, 9E1">
${defs}
<line class="axis" x1="60" y1="250" x2="360" y2="250"/>
<text class="axislbl" x="350" y="272">x: 0 → L</text>
<path class="eg a1" d="M100,230 C160,230 160,160 210,160 C260,160 260,230 320,230" style="fill:none"/>
<path class="eg a2" d="M100,180 Q155,105 210,180 Q265,105 320,180" style="fill:none"/>
<path class="eg a3" d="M100,120 Q137,60 173,120 Q210,60 247,120 Q283,60 320,120" style="fill:none"/>
<text class="animcap a1" x="90" y="235">n=1</text>
<text class="animcap a2" x="90" y="185">n=2</text>
<text class="animcap a3" x="90" y="125">n=3</text>
<text class="crcres a4" x="480" y="130" text-anchor="middle">E1 · 4E1 · 9E1</text>
<text class="badge1 a4" x="480" y="160" text-anchor="middle">nodes: 0 · 1 · 2</text>
<text class="animnote a5" x="320" y="292" text-anchor="middle">humps count n, energies square n² — the guitar-string ladder drawn</text>
</svg>`
  },

  'tunnel-tail': {
    title: 'Tunnelling Tail: Seep In, Trickle Out',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Diagram of tunnelling: incoming wave, exponential tail inside the barrier, small transmitted wave">
${defs}
<path class="eg a1" d="M30,150 Q60,110 90,150 Q120,190 150,150 Q180,110 210,150" style="fill:none"/>
<g class="cell a2"><rect x="230" y="60" width="180" height="180" rx="8"/><text x="320" y="140">V0 &gt; E</text><text x="320" y="165">width a</text></g>
<path class="eg a3" d="M230,150 C280,150 300,170 350,196 C380,212 395,218 410,220" style="fill:none"/>
<path class="eg a4" d="M430,220 Q450,200 470,220 Q490,240 510,220 Q530,200 550,220 Q570,240 590,220" style="fill:none"/>
<text class="badge1 a3" x="320" y="250">tail e^(−κx) inside</text>
<text class="badge1 a4" x="520" y="255">sliver out: T ∝ e^(−2κa)</text>
<text class="animnote a5" x="320" y="285" text-anchor="middle">classically zero beyond the wall — quantumly an exponential whisper survives</text>
</svg>`
  },

  'string-modes': {
    title: 'String Modes: Halves Fit, Frequencies Multiply',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Graphed string modes: fundamental and two overtones with nodes marked and frequencies f, 2f, 3f">
${defs}
<line class="axis" x1="100" y1="30" x2="100" y2="260"/><line class="axis" x1="320" y1="30" x2="320" y2="260"/>
<path class="eg a1" d="M100,230 Q210,140 320,230" style="fill:none"/>
<path class="eg a2" d="M100,160 Q155,95 210,160 Q265,95 320,160" style="fill:none"/>
<path class="eg a3" d="M100,90 Q128,40 155,90 Q182,40 210,90 Q237,40 265,90 Q292,40 320,90" style="fill:none"/>
<text class="animcap a1" x="420" y="230">n=1 · f</text>
<text class="animcap a2" x="420" y="160">n=2 · 2f</text>
<text class="animcap a3" x="420" y="90">n=3 · 3f</text>
<text class="badge1 a4" x="210" y="285">nodes pinned at walls — only half-waves fit</text>
<text class="animnote a5" x="420" y="285" text-anchor="middle">same quantising as the box, audible</text>
</svg>`
  },

  'sabine-decay': {
    title: 'Sabine Decay: Live Halls Linger, Dead Rooms Drop',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Graphed reverberation decay: slow live-hall curve and fast dead-room curve to the minus-60dB line">
${defs}
<line class="axis" x1="70" y1="30" x2="70" y2="260"/><line class="axis" x1="70" y1="260" x2="610" y2="260"/>
<text class="axislbl" x="600" y="282">time →</text><text class="axislbl" x="25" y="60">level dB</text>
<line class="eg" x1="70" y1="240" x2="610" y2="240" stroke-dasharray="8 6"/>
<text class="axislbl" x="560" y="232">−60 dB</text>
<path class="eg a1" d="M80,70 C250,90 400,150 540,240" style="fill:none"/>
<path class="eg a2" d="M80,70 C150,150 200,220 270,248" style="fill:none"/>
<text class="badge1 a3" x="430" y="180">live hall: long TR</text>
<text class="badge1 a4" x="200" y="130">dead room: short TR</text>
<text class="animnote a5" x="320" y="292" text-anchor="middle">TR = seconds to the −60 dB line — drain size sets the tail</text>
</svg>`
  },

  'pulse-echo': {
    title: 'Pulse-Echo A-Scan: Fire, Flaw, Back Wall',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="A-scan trace: tall fire pip, medium flaw pip, tall back-wall pip with depth labels">
${defs}
<line class="axis" x1="50" y1="230" x2="610" y2="230"/><line class="axis" x1="50" y1="230" x2="50" y2="40"/>
<text class="axislbl" x="600" y="252">time →</text><text class="axislbl" x="20" y="60">echo</text>
<line class="eg a1" x1="110" y1="230" x2="110" y2="80"/>
<line class="eg a2" x1="300" y1="230" x2="300" y2="150"/>
<line class="eg a3" x1="490" y1="230" x2="490" y2="100"/>
<text class="animcap a1" x="110" y="65">fire</text>
<text class="animcap a2" x="300" y="135">flaw d=vt₁/2</text>
<text class="animcap a3" x="490" y="85">wall d=vt₂/2</text>
<text class="badge1 a4" x="320" y="272">early small pip + late weak wall = defect signature</text>
<text class="animnote a5" x="320" y="292" text-anchor="middle">delay gives depth, pip size gives seriousness — halve always</text>
</svg>`
  },

  'pmf-cdf-bars': {
    title: 'pmf Bars With cdf Steps (Two Coins)',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Graphed pmf bars for two coins with cdf step line climbing to one">
${defs}
<line class="axis" x1="70" y1="30" x2="70" y2="250"/><line class="axis" x1="70" y1="250" x2="610" y2="250"/>
<text class="axislbl" x="600" y="272">x (heads)</text><text class="axislbl" x="25" y="50">p</text>
<g class="cell a1"><rect x="140" y="200" width="60" height="50" rx="4"/><text x="170" y="228">1/4</text></g>
<g class="cell a1"><rect x="290" y="150" width="60" height="100" rx="4"/><text x="320" y="205">1/2</text></g>
<g class="cell a1"><rect x="440" y="200" width="60" height="50" rx="4"/><text x="470" y="228">1/4</text></g>
<path class="eg a2" d="M70,250 L140,250 L140,200 L290,200 L290,100 L440,100 L440,50 L610,50" style="fill:none"/>
<text class="animcap a2" x="215" y="185">F=0.25</text><text class="animcap a2" x="365" y="85">F=0.75</text><text class="animcap a2" x="525" y="35">F=1.0</text>
<text class="badge1 a3" x="470" y="30">bars = exactly · steps = up-to</text>
<text class="animnote a4" x="320" y="292" text-anchor="middle">cdf steps at each value by its bar height — running total drawn</text>
</svg>`
  },

  'seesaw-mean': {
    title: 'Seesaw Mean: Probability Mass Balances at μ',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Diagram of expectation as a seesaw balancing probability weights at the mean">
${defs}
<line class="eg a1" x1="90" y1="180" x2="550" y2="180"/>
<path class="eg a2" d="M294,180 L270,250 L318,250 Z" style="fill:none"/>
<g class="cell a1"><rect x="118" y="156" width="44" height="24" rx="4"/><text x="140" y="150">−1·.2</text></g>
<g class="cell a1"><rect x="228" y="120" width="44" height="60" rx="4"/><text x="250" y="112">0·.5</text></g>
<g class="cell a1"><rect x="448" y="144" width="44" height="36" rx="4"/><text x="470" y="136">2·.3</text></g>
<g class="msg a3"><line x1="294" y1="180" x2="294" y2="262" marker-end="url(#ah)"/><text x="294" y="282" text-anchor="middle">μ = 0.4 pivot</text></g>
<text class="animnote a4" x="320" y="35" text-anchor="middle">far values pull harder per unit mass — balance point is the mean</text>
</svg>`
  },

  'binomial-shapes': {
    title: 'Binomial Shapes: Symmetric at p=1/2, Skewed Elsewhere',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Graphed binomial bars: symmetric at p one-half, right-skewed at p two-tenths">
${defs}
<text class="animcap a1" x="170" y="30" text-anchor="middle">n=4, p=1/2</text>
<g class="cell a1"><rect x="80" y="230" width="28" height="20" rx="3"/><rect x="112" y="170" width="28" height="80" rx="3"/><rect x="144" y="130" width="28" height="120" rx="3"/><rect x="176" y="170" width="28" height="80" rx="3"/><rect x="208" y="230" width="28" height="20" rx="3"/></g>
<text class="animcap a2" x="470" y="30" text-anchor="middle">n=4, p=0.2</text>
<g class="cell a2"><rect x="380" y="152" width="28" height="98" rx="3"/><rect x="412" y="152" width="28" height="98" rx="3"/><rect x="444" y="213" width="28" height="37" rx="3"/><rect x="476" y="244" width="28" height="6" rx="3"/><rect x="508" y="248" width="28" height="2" rx="3"/></g>
<text class="badge1 a3" x="170" y="272">pile centre</text>
<text class="badge1 a3" x="470" y="272">pile left (np=0.8!)</text>
<text class="animnote a4" x="320" y="292" text-anchor="middle">same n, moved p — symmetry only at one-half, mean np drags the pile</text>
</svg>`
  },

  'pdf-cdf-area': {
    title: 'pdf Area With cdf Sweep (Two Panels)',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Graphed density with shaded interval beside its rising cdf curve">
${defs}
<text class="animcap a1" x="200" y="30" text-anchor="middle">pdf: area = probability</text>
<path class="eg a1" d="M90,230 C160,230 170,120 240,120 C310,120 320,230 390,230" style="fill:none"/>
<g class="cell a2"><rect x="210" y="170" width="70" height="60" rx="4"/><text x="245" y="205">P(a,b)</text></g>
<text class="animcap a3" x="500" y="30" text-anchor="middle">cdf: swept sand</text>
<path class="eg a3" d="M400,230 C470,230 450,120 520,100 C560,90 580,85 600,84" style="fill:none"/>
<text class="badge1 a4" x="470" y="200">F(a)</text>
<text class="badge1 a4" x="550" y="70">F(b)</text>
<text class="animnote a5" x="320" y="292" text-anchor="middle">shade between a,b on the left; read the rise between F(a),F(b) on the right</text>
</svg>`
  },

  'normal-bell': {
    title: 'Normal Bell: σ Bands With 68-95-99.7',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Graphed normal bell with one-two-three sigma bands and empirical percentages">
${defs}
<line class="axis" x1="40" y1="250" x2="610" y2="250"/>
<path class="eg a1" d="M80,250 C180,250 190,70 320,70 C450,70 460,250 560,250" style="fill:none"/>
<g class="cell a2"><rect x="255" y="150" width="130" height="100" rx="4"/></g>
<text class="animcap a3" x="320" y="40" text-anchor="middle">μ</text>
<text class="badge1 a3" x="320" y="272">±1σ: 68% · ±2σ: 95% · ±3σ: 99.7%</text>
<text class="badge1 a4" x="150" y="130">tails thin fast</text>
<text class="animnote a5" x="320" y="292" text-anchor="middle">standardise to Z, then read one table for every bell ever</text>
</svg>`
  },

  'exp-decay': {
    title: 'Exponential Tail: Same Shape After Any s',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Graphed exponential decay with restarted same-shape tail from survival point s">
${defs}
<line class="axis" x1="60" y1="30" x2="60" y2="260"/><line class="axis" x1="60" y1="260" x2="610" y2="260"/>
<text class="axislbl" x="600" y="282">t →</text><text class="axislbl" x="25" y="50">f</text>
<path class="eg a1" d="M60,70 C200,80 320,150 590,250" style="fill:none"/>
<path class="eg a2" d="M300,140 C400,150 480,200 590,250" style="fill:none" stroke-dasharray="8 6"/>
<text class="animcap a3" x="300" y="125">survived to s…</text>
<text class="badge1 a4" x="450" y="170">…same decay ahead</text>
<text class="animnote a5" x="320" y="292" text-anchor="middle">dashed restart retraces the solid — memorylessness drawn</text>
</svg>`
  },

  'joint-region': {
    title: 'Joint Region: Volume Above the Patch',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Diagram of unit square with shaded triangle region and marginal squash arrows">
${defs}
<g class="cell a1"><rect x="140" y="60" width="200" height="200" rx="8"/></g>
<path class="eg a2" d="M140,60 L340,260 L140,260 Z" style="fill:none"/>
<text class="animcap a2" x="200" y="220">x+y&lt;1</text>
<g class="msg a3"><line x1="340" y1="160" x2="470" y2="160" marker-end="url(#ah)"/><text x="410" y="145" text-anchor="middle">squash → fX</text></g>
<g class="msg a3"><line x1="240" y1="260" x2="240" y2="290" marker-end="url(#ah)"/></g>
<text class="animcap a3" x="330" y="285">squash → fY</text>
<text class="badge1 a4" x="470" y="220">P = volume above patch</text>
<text class="animnote a5" x="320" y="35" text-anchor="middle">integrate the patch for probability, squash an axis for margins</text>
</svg>`
  },

  'tail-bounds': {
    title: 'Tail Bounds Hover Above Truth',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Graphed tail probability with Markov bound hyperbola floating above the true curve">
${defs}
<line class="axis" x1="60" y1="30" x2="60" y2="260"/><line class="axis" x1="60" y1="260" x2="610" y2="260"/>
<text class="axislbl" x="600" y="282">a →</text><text class="axislbl" x="20" y="50">P(X≥a)</text>
<path class="eg a1" d="M80,230 C200,220 300,150 580,110" style="fill:none"/>
<path class="eg a2" d="M80,60 C250,80 400,130 580,175" style="fill:none" stroke-dasharray="8 6"/>
<text class="badge1 a1" x="450" y="140">truth (exact tail)</text>
<text class="badge1 a2" x="420" y="75">Markov μ/a (ceiling!)</text>
<text class="animnote a3" x="320" y="292" text-anchor="middle">bounds never dip below truth — looseness is the price of knowing only μ</text>
</svg>`
  },

  'clt-narrow': {
    title: 'CLT Narrowing: Means Huddle as n Grows',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Graphed sampling bells narrowing around mu as sample size grows">
${defs}
<line class="axis" x1="40" y1="250" x2="610" y2="250"/>
<text class="axislbl" x="600" y="272">x̄</text>
<path class="eg a1" d="M60,250 C150,250 160,140 320,140 C480,140 490,250 580,250" style="fill:none"/>
<path class="eg a2" d="M140,250 C220,250 230,105 320,105 C410,105 420,250 500,250" style="fill:none"/>
<path class="eg a3" d="M240,250 C280,250 285,55 320,55 C355,55 360,250 400,250" style="fill:none"/>
<text class="animcap a1" x="90" y="230">n=1</text>
<text class="animcap a2" x="170" y="200">n=16</text>
<text class="animcap a3" x="410" y="120">n=100</text>
<text class="badge1 a4" x="320" y="30" text-anchor="middle">width σ/√n · centre μ — SLLN+CLT drawn</text>
<text class="animnote a5" x="320" y="292" text-anchor="middle">destination μ, landing pattern bell — sample more, huddle tighter</text>
</svg>`
  },

  'poisson-rain': {
    title: 'Poisson Rain: Ticks, Gaps, Counts',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Timeline with irregular arrival ticks, gap brackets and count labels">
${defs}
<line class="axis" x1="40" y1="200" x2="610" y2="200"/>
<text class="axislbl" x="600" y="222">time →</text>
<line class="eg a1" x1="110" y1="200" x2="110" y2="120"/>
<line class="eg a1" x1="175" y1="200" x2="175" y2="120"/>
<line class="eg a1" x1="195" y1="200" x2="195" y2="120"/>
<line class="eg a1" x1="290" y1="200" x2="290" y2="120"/>
<line class="eg a1" x1="420" y1="200" x2="420" y2="120"/>
<line class="eg a1" x1="445" y1="200" x2="445" y2="120"/>
<line class="eg a1" x1="560" y1="200" x2="560" y2="120"/>
<text class="badge1 a2" x="230" y="100">gaps ~ Exp(λ) — short common!</text>
<text class="badge1 a3" x="420" y="260">counts in window ~ Poisson(λt)</text>
<text class="animnote a4" x="320" y="35" text-anchor="middle">same rain, two cameras: gaps between ticks, totals per window</text>
</svg>`
  },

  'process-grid': {
    title: 'Process Grid: Time Type × State Type',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Two-by-two grid sorting processes by discrete or continuous time and state">
${defs}
<g class="stagebox a1"><rect x="60" y="60" width="240" height="90" rx="10"/><text x="180" y="95">discrete t · discrete X</text><text x="180" y="120" class="sub">Markov chains (M4!)</text></g>
<g class="stagebox a2"><rect x="340" y="60" width="240" height="90" rx="10"/><text x="460" y="95">discrete t · continuous X</text><text x="460" y="120" class="sub">prices, AR models</text></g>
<g class="stagebox a3"><rect x="60" y="170" width="240" height="90" rx="10"/><text x="180" y="205">continuous t · discrete X</text><text x="180" y="230" class="sub">Poisson process!</text></g>
<g class="stagebox a4"><rect x="340" y="170" width="240" height="90" rx="10"/><text x="460" y="205">continuous t · continuous X</text><text x="460" y="230" class="sub">Brownian (horizon!)</text></g>
<text class="animnote a5" x="320" y="292" text-anchor="middle">two axes, four families — classify first, model second</text>
</svg>`
  },

  'chain-graph': {
    title: 'Sunny–Rainy Chain: Dice in Each City',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Two-state chain diagram with self-loops and crossing probabilities from the worked example">
${defs}
${node(170, 150, 'SUN', 'a1')}
${node(470, 150, 'RAIN', 'a1')}
<path class="eg a2" d="M140,128 C110,88 200,88 185,126" style="fill:none"/>
<text class="animcap a2" x="120" y="80">0.8</text>
<path class="eg a2" d="M500,128 C530,88 440,88 455,126" style="fill:none"/>
<text class="animcap a2" x="520" y="80">0.6</text>
<g class="msg a3"><line x1="192" y1="150" x2="448" y2="150" marker-end="url(#ah)"/><text x="320" y="130" text-anchor="middle">0.2</text></g>
<g class="msg a4"><line x1="448" y1="180" x2="192" y2="180" marker-end="url(#ah)"/><text x="320" y="205" text-anchor="middle">0.4</text></g>
<text class="animnote a5" x="320" y="272" text-anchor="middle">rows sum to 1 — two hops out is P², crowd spreads as πPⁿ</text>
</svg>`
  },

  'ruin-walk': {
    title: "Gambler's Walk: Wiggle Between Two Walls",
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Fortune path wiggling from stake k to an absorbing wall at ruin or goal">
${defs}
<line class="axis" x1="80" y1="230" x2="560" y2="230"/>
<text class="axislbl" x="590" y="252">steps →</text>
<line class="eg a1" x1="120" y1="60" x2="120" y2="230"/>
<line class="eg a1" x1="520" y1="60" x2="520" y2="230"/>
<text class="animcap a1" x="120" y="45" text-anchor="middle">ruin 0</text>
<text class="animcap a1" x="520" y="45" text-anchor="middle">goal N</text>
<path class="eg a2" d="M200,200 L240,160 L280,190 L320,150 L360,180 L400,140 L440,170 L470,200 L500,230" style="fill:none"/>
<text class="badge1 a3" x="200" y="225">stake k</text>
<text class="badge1 a4" x="500" y="255">absorbed!</text>
<text class="animnote a5" x="320" y="292" text-anchor="middle">fate = formula in k, p, N — walls decide, wiggles merely travel</text>
</svg>`
  },

  'balance-flows': {
    title: 'Stationary Balance: Inflow Equals Outflow',
    svg: `<svg viewBox="0 0 640 300" role="img" aria-label="Two districts exchanging equal flows at stationary shares">
${defs}
${node(170, 150, 'DRY', 'a1')}
${node(470, 150, 'WET', 'a1')}
<text class="animcap a1" x="170" y="210">π=0.43</text>
<text class="animcap a1" x="470" y="210">π=0.57</text>
<g class="msg a2"><line x1="192" y1="130" x2="448" y2="130" marker-end="url(#ah)"/><text x="320" y="110" text-anchor="middle">0.171 out</text></g>
<g class="msg a3"><line x1="448" y1="170" x2="192" y2="170" marker-end="url(#ah)"/><text x="320" y="195" text-anchor="middle">0.171 in</text></g>
<text class="crcres a4" x="320" y="262" text-anchor="middle">0.43×0.4 = 0.57×0.3 ✓ balanced</text>
<text class="animnote a5" x="320" y="285" text-anchor="middle">arrivals refill departures nightly — crowd converges to these shares</text>
</svg>`
  }
};

export const SCENE_IDS = Object.keys(SCENES);
