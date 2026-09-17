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
  }
};

export const SCENE_IDS = Object.keys(SCENES);
