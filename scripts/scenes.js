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
  }
};

export const SCENE_IDS = Object.keys(SCENES);
