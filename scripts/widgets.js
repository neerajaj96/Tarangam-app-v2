/**
 * Shared custom Markdown widget preprocessing — the `:::` block syntaxes
 * (callouts, quizzes, step cards, toggles, manim video players, SVG motion
 * scenes) expanded to HTML before Markdown → HTML conversion, used by
 * scripts/build.js. ES module style like the rest of scripts/.
 *
 * Only widget preprocessing lives here. It reuses escapeHtml +
 * renderMarkdown from scripts/markdown.js and the scene registry from
 * scripts/scenes.js rather than duplicating them. No curriculum loading,
 * course/topic discovery, template generation, dashboard generation,
 * learner state, or UI logic.
 */
import { SCENES } from './scenes.js';
import { escapeHtml, renderMarkdown } from './markdown.js';
import { getLab, computeLab, formatOutput } from './viz-calcs.js';

// Strict structural validator for `::: viz trace` bodies, shared by the
// parser below and scripts/check.js so both enforce one identical grammar:
// alternating state → op → state … chains with exactly states.length − 1
// operations. Notes (`note | …`) ride outside the sequence and never affect
// it. Returns { ok:true, items:[{kind,md}] } or { ok:false, reason } —
// never throws, never coerces.
export function parseTraceBody(rawBody) {
  const items = [];
  for (const raw of String(rawBody).split('\n')) {
    const l = raw.trim();
    if (!l) continue;
    const low = l.toLowerCase();
    if (low.startsWith('state |')) items.push({ kind: 'state', md: l.slice(7).trim() });
    else if (low.startsWith('op |')) items.push({ kind: 'op', md: l.slice(4).trim() });
    else if (low.startsWith('note |')) items.push({ kind: 'note', md: l.slice(6).trim() });
    else return { ok: false, reason: `unknown trace line (expected "state |", "op |", or "note |") — actual: "${l.slice(0, 40)}"` };
  }
  for (const it of items) {
    if (!it.md) return { ok: false, reason: `empty ${it.kind} entry is invalid` };
  }
  const seq = items.filter((it) => it.kind !== 'note');
  const states = seq.filter((it) => it.kind === 'state');
  if (!seq.length || seq[0].kind !== 'state') return { ok: false, reason: 'trace must begin with a state line' };
  for (let k = 1; k < seq.length; k += 1) {
    const want = seq[k - 1].kind === 'state' ? 'op' : 'state';
    if (seq[k].kind !== want) return { ok: false, reason: `broken alternation at line ${k + 1}: expected ${want} after ${seq[k - 1].kind}` };
  }
  if (states.length < 2) return { ok: false, reason: `trace needs at least 2 states — actual: ${states.length}` };
  const ops = seq.length - states.length;
  if (ops !== states.length - 1) return { ok: false, reason: `operations must number states − 1 — actual: ${ops} ops for ${states.length} states` };
  return { ok: true, items };
}

// Strict structural validator for `::: viz tree` bodies, shared by the
// parser below and scripts/check.js so both enforce one identical grammar:
//   node | <id> | <label>            → root candidate (exactly one per tree)
//   node | <id> | <label> | <parent> → child of an existing node
// Direction labels are deliberately omitted: child order follows document
// order, which keeps the grammar minimal and the layout deterministic.
// Labels are plain text (escaped, never Markdown-rendered) so the SVG
// diagram and the static list always show identical strings. Returns
// { ok:true, nodes, root, children, depth, order } or { ok:false, reason }
// — never throws, never coerces, never guesses a parent.
export function parseTreeBody(rawBody) {
  const nodes = [];
  const seen = new Set();
  for (const raw of String(rawBody).split('\n')) {
    const l = raw.trim();
    if (!l) continue;
    if (!l.toLowerCase().startsWith('node |')) {
      return { ok: false, reason: `unknown tree line (expected "node | id | label [| parent]") — actual: "${l.slice(0, 40)}"` };
    }
    const parts = l.split('|').map((p) => p.trim());
    if (parts.length !== 3 && parts.length !== 4) {
      return { ok: false, reason: `malformed tree line (need "node | id | label" or "node | id | label | parent") — actual: "${l.slice(0, 40)}"` };
    }
    const id = parts[1];
    const label = parts[2];
    const parent = parts.length === 4 ? parts[3] : null;
    if (!id) return { ok: false, reason: 'empty tree node id is invalid' };
    if (!label) return { ok: false, reason: `empty tree node label is invalid (node "${id.slice(0, 20)}")` };
    if (parent !== null && !parent) return { ok: false, reason: `empty tree parent is invalid (node "${id.slice(0, 20)}")` };
    if (seen.has(id)) return { ok: false, reason: `duplicate tree node id "${id.slice(0, 20)}" — each node must be declared once` };
    seen.add(id);
    nodes.push({ id, label, parent });
  }
  if (!nodes.length) return { ok: false, reason: 'tree needs at least 1 node — actual: 0' };
  const roots = nodes.filter((n) => n.parent === null);
  if (roots.length !== 1) return { ok: false, reason: `tree needs exactly one root — actual: ${roots.length}` };
  const root = roots[0];
  const byId = new Map(nodes.map((n) => [n.id, n]));
  for (const n of nodes) {
    if (n.parent === null) continue;
    if (!byId.has(n.parent)) return { ok: false, reason: `unknown tree parent "${n.parent.slice(0, 20)}" for node "${n.id.slice(0, 20)}"` };
    if (n.parent === n.id) return { ok: false, reason: `tree node "${n.id.slice(0, 20)}" cannot be its own parent` };
  }
  // Children in document order; depth via BFS from the root. A parent
  // chain that loops is a cycle; a node the root can never reach is
  // disconnected — both are rejected rather than guessed. (With exactly one
  // root and all parents existing, any unreachable component necessarily
  // contains a loop, so the cycle check runs first for the sharper message
  // and reachability remains as the backstop.)
  const children = new Map(nodes.map((n) => [n.id, []]));
  for (const n of nodes) {
    if (n.parent !== null) children.get(n.parent).push(n.id);
  }
  for (const n of nodes) {
    const chain = new Set([n.id]);
    let cur = n.parent;
    while (cur !== null) {
      if (chain.has(cur)) return { ok: false, reason: `tree cycle detected at node "${cur.slice(0, 20)}"` };
      chain.add(cur);
      cur = byId.get(cur).parent;
    }
  }
  const depth = new Map([[root.id, 0]]);
  const queue = [root.id];
  while (queue.length) {
    const cur = queue.shift();
    for (const kid of children.get(cur)) {
      if (!depth.has(kid)) {
        depth.set(kid, depth.get(cur) + 1);
        queue.push(kid);
      }
    }
  }
  if (depth.size !== nodes.length) {
    const stray = nodes.map((n) => n.id).find((id) => !depth.has(id));
    return { ok: false, reason: `disconnected tree node "${String(stray).slice(0, 20)}" — every node must descend from the root` };
  }
  const order = nodes.map((n) => n.id);
  return { ok: true, nodes, root, children, depth, order };
}

export function transformCustomWidgets(markdownText) {
  // Per-page counter for unique viz widget ids (aria wiring). Deterministic:
  // widgets transform in document order, so ids are stable across builds.
  let vizUid = 0;
  // 1. Admonition Callouts (Clickable Dropdowns with open default)
  const callouts = [
    { type: 'intuition', icon: '💡 The Intuition' },
    { type: 'pitfall', icon: '⚠️ Common Exam Trap' },
    { type: 'formula', icon: '📐 KTU Formula Vault' },
    { type: 'exam', icon: '🎯 KTU Exam Focus' }
  ];

  for (const { type, icon } of callouts) {
    const pattern = new RegExp(`::: callout-${type} (.*?)\\n([\\s\\S]*?)\\n:::`, 'g');
    markdownText = markdownText.replace(pattern, (match, title, rawBody) => {
      const trimmedTitle = title.trim();
      const renderedBody = renderMarkdown(rawBody.trim());
      const header = trimmedTitle ? `${icon}: ${escapeHtml(trimmedTitle)}` : icon;
      return `<details class="callout callout-${type}" open><summary class="callout-header"><span class="callout-title">${header}</span><span class="callout-chevron">&#9662;</span></summary><div class="callout-body">${renderedBody}</div></details>`;
    });
  }

  // 2. Interactive Quizzes with Clickable Dropdown Insight
  const quizPattern = /::: quiz ([\s\S]*?)\n([\s\S]*?)\n::: explanation\n([\s\S]*?)\n:::/g;
  markdownText = markdownText.replace(quizPattern, (match, qHeader, body, explanation) => {
    const lines = body.split('\n');
    let prompt = '';
    const options = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      if (line.startsWith('(*') && line.includes(')')) {
        const optText = line.substring(line.indexOf(')') + 1).trim();
        options.push({ text: optText, isCorrect: true });
      } else if (line.startsWith('(') && line.includes(')') && !line.startsWith('(*')) {
        const optText = line.substring(line.indexOf(')') + 1).trim();
        options.push({ text: optText, isCorrect: false });
      } else {
        prompt += line + ' ';
      }
    }

    let optionsHtml = '';
    for (const { text, isCorrect } of options) {
      const correctAttr = isCorrect ? 'data-correct="true"' : 'data-correct="false"';
      optionsHtml += `<button class="quiz-option-btn" ${correctAttr}><span>${escapeHtml(text)}</span></button>\n`;
    }

    return `<div class="quiz-widget">
  <div class="quiz-header">
    <span class="quiz-category">${escapeHtml(qHeader.trim())}</span>
    <span class="quiz-xp">+10 XP</span>
  </div>
  <div class="quiz-prompt">${renderMarkdown(prompt.trim())}</div>
  <div class="quiz-options">
    ${optionsHtml}
  </div>
  <details class="quiz-explanation-dropdown">
    <summary class="quiz-explanation-toggle">
      <div class="insight-badge-wrap">
        <span class="insight-badge">💡 Pedagogical Insight</span>
      </div>
      <div class="insight-action-text">
        <span class="insight-toggle-hint">Click to view/hide</span>
        <span class="insight-toggle-arrow">&#9662;</span>
      </div>
    </summary>
    <div class="quiz-explanation-content">
      ${renderMarkdown(explanation.trim())}
    </div>
  </details>
</div>`;
  });

  // 3. Stepped Numerical Solution Cards
  const stepPattern = /::: step \[(.*?)\] (.*?)\n([\s\S]*?)\n:::/g;
  markdownText = markdownText.replace(stepPattern, (match, badge, title, rawContent) => {
    const renderedContent = renderMarkdown(rawContent.trim());
    return `<div class="step-card"><div class="step-badge">${escapeHtml(badge.trim())}</div><div class="step-title">${escapeHtml(title.trim())}</div><div class="step-content">${renderedContent}</div></div>`;
  });

  // 4. Interactive Toggles
  const togglePattern = /::: toggle (.*?)\n([\s\S]*?)\n:::/g;
  markdownText = markdownText.replace(togglePattern, (match, summary, rawContent) => {
    const renderedContent = renderMarkdown(rawContent.trim());
    return `<details class="interactive-toggle"><summary>${escapeHtml(summary.trim())}</summary><div class="toggle-content">${renderedContent}</div></details>`;
  });

  // 5. Multi-line Manim Video Studio Player
  // NOTE: currently zero usages in content/ (all 8 mp4s orphaned) — path kept, output escaped.
  const manimMultiPattern = /::: manim (.*?) (.*?)\n([\s\S]*?)\n:::/g;
  markdownText = markdownText.replace(manimMultiPattern, (match, videoSrc, title, obs) => {
    const safeSrc = escapeHtml(videoSrc.trim());
    const safeTitle = escapeHtml(title.trim());
    return `<div class="video-studio">
  <div class="video-studio-header">
    <span class="video-tag">🎬 60FPS MANIM SIMULATION &middot; ${safeTitle}</span>
    <div class="video-speed-controls">
      <button class="speed-btn" data-speed="0.75">0.75x</button>
      <button class="speed-btn active" data-speed="1.0">1.0x</button>
      <button class="speed-btn" data-speed="1.25">1.25x</button>
      <button class="speed-btn" data-speed="1.5">1.5x</button>
    </div>
  </div>
  <div class="video-frame-wrap">
    <video controls preload="metadata">
      <source src="../${safeSrc}" type="video/mp4">
      Your browser does not support embedded video.
    </video>
  </div>
  <div class="video-studio-foot">
    <p class="video-caption"><strong>Key Insight:</strong> ${safeTitle}</p>
    <div class="video-observations"><strong>What to observe:</strong> ${escapeHtml(obs.trim())}</div>
  </div>
</div>`;
  });

  // Single-line manim fallback
  const singleManim = /::: manim (.*?) :::/g;
  markdownText = markdownText.replace(singleManim, (match, videoSrc) => {
    const safeSrc = escapeHtml(videoSrc.trim());
    return `<div class="video-studio">
  <div class="video-studio-header">
    <span class="video-tag">🎬 60FPS MANIM SIMULATION</span>
    <div class="video-speed-controls">
      <button class="speed-btn" data-speed="0.75">0.75x</button>
      <button class="speed-btn active" data-speed="1.0">1.0x</button>
      <button class="speed-btn" data-speed="1.25">1.25x</button>
      <button class="speed-btn" data-speed="1.5">1.5x</button>
    </div>
  </div>
  <div class="video-frame-wrap">
    <video controls preload="metadata">
      <source src="../${safeSrc}" type="video/mp4">
      Your browser does not support embedded video.
    </video>
  </div>
</div>`;
  });

  // 6. SVG motion scenes (dependency-free animations, see scripts/scenes.js).
  // Unknown ids are left raw and reported by check.js (scene registry check).
  const animPattern = /::: anim (\S+)(.*?)\n([\s\S]*?)\n:::/g;
  markdownText = markdownText.replace(animPattern, (match, sceneId, title, obs) => {
    const scene = SCENES[sceneId.trim()];
    if (!scene) return match;
    const safeTitle = escapeHtml(title.trim() || scene.title);
    return `<div class="video-studio">
  <div class="video-studio-header">
    <span class="video-tag">✨ ANIMATED DIAGRAM &middot; ${safeTitle}</span>
  </div>
  <div class="video-frame-wrap">
    ${scene.svg.replace('<svg ', '<svg class="anim-stage" ')}
  </div>
  <div class="video-studio-foot">
    <p class="video-caption"><strong>Key Insight:</strong> ${safeTitle}</p>
    <div class="video-observations"><strong>What to observe:</strong> ${escapeHtml(obs.trim())}</div>
  </div>
</div>`;
  });

  // 7. Interactive visualization shell (progressive enhancement engine in
  // assets/viz.js). Syntax: `::: viz <flow|stepper> [scene-id] <title>`
  // with one step per body line (`1. text` / `- text` markers stripped).
  // If the first head word names a scripts/scenes.js scene, its SVG is
  // embedded above the steps. Without JS the full step list (plus any
  // diagram) renders as static content; viz.js adds staged Prev/Next/Play
  // controls, keyboard support, and live step announcements. Unknown types
  // are left raw so scripts/check.js can fail them loudly.
  const vizPattern = /::: viz (flow|stepper)(.*?)\n([\s\S]*?)\n:::/g;
  markdownText = markdownText.replace(vizPattern, (match, type, head, rawBody) => {
    const words = head.trim().split(/\s+/).filter(Boolean);
    let sceneId = null;
    if (words.length && Object.prototype.hasOwnProperty.call(SCENES, words[0])) {
      sceneId = words.shift();
    }
    const title = words.join(' ') || (sceneId ? SCENES[sceneId].title : 'Visualization');
    const safeTitle = escapeHtml(title);
    const steps = rawBody.split('\n').map((l) => l.trim()).filter(Boolean)
      .map((l) => l.replace(/^(\d+[.)]|[-*])\s+/, ''));
    if (!steps.length) return match;
    const items = steps.map((s, i) =>
      `<li class="viz-step" data-i="${i}">${renderMarkdown(s)}</li>`).join('\n');
    const diagram = sceneId
      ? `<div class="viz-diagram"><div class="video-frame-wrap">${SCENES[sceneId].svg.replace('<svg ', '<svg class="anim-stage" ')}</div></div>`
      : '';
    return `<div class="viz viz-${type}" data-viz="${type}" data-steps="${steps.length}">
  <div class="viz-head"><span class="viz-tag">Interactive ${type} &middot; ${safeTitle}</span></div>
  ${diagram}
  <ol class="viz-steps">
    ${items}
  </ol>
  <div class="viz-controls" role="group" aria-label="${safeTitle}: step controls">
    <button type="button" class="viz-btn" data-act="prev">&larr; Prev</button>
    <button type="button" class="viz-btn" data-act="play">Play</button>
    <button type="button" class="viz-btn" data-act="next">Next &rarr;</button>
    <button type="button" class="viz-btn" data-act="reset">Reset</button>
  </div>
  <p class="viz-status" role="status">${steps.length} steps &mdash; use Prev and Next to walk through</p>
</div>`;
  });

  // 7b. Tabbed reveal panels (click/tap to explore; assets/viz.js adds
  // arrow-key support). Syntax: `::: viz tabs [scene-id] <title>` with one
  // `Label :: content` line per tab (markdown-rendered). First panel starts
  // selected; without JS the stylesheet reveals every panel stacked, so no
  // information hides: collapsing to one panel happens only once viz.js
  // marks the widget live. Unknown structures are left raw for check.js.
  const vizTabsPattern = /::: viz tabs(.*?)\n([\s\S]*?)\n:::/g;
  markdownText = markdownText.replace(vizTabsPattern, (match, head, rawBody) => {
    const words = head.trim().split(/\s+/).filter(Boolean);
    let sceneId = null;
    if (words.length && Object.prototype.hasOwnProperty.call(SCENES, words[0])) {
      sceneId = words.shift();
    }
    const title = words.join(' ') || (sceneId ? SCENES[sceneId].title : 'Explore');
    const safeTitle = escapeHtml(title);
    const tabs = rawBody.split('\n').map((l) => l.trim()).filter(Boolean)
      .map((l) => {
        const cut = l.indexOf(' :: ');
        return cut < 0 ? null : { label: l.slice(0, cut).trim(), md: l.slice(cut + 4).trim() };
      })
      .filter((t) => t && t.label && t.md);
    if (tabs.length < 2) return match;
    vizUid += 1;
    const uid = `vizt${vizUid}`;
    const buttons = tabs.map((t, i) =>
      `<button type="button" role="tab" id="${uid}-tab-${i}" aria-controls="${uid}-panel-${i}" aria-selected="${i === 0 ? 'true' : 'false'}" tabindex="${i === 0 ? '0' : '-1'}" class="viz-tab">${escapeHtml(t.label)}</button>`).join('\n');
    const panels = tabs.map((t, i) =>
      `<div id="${uid}-panel-${i}" role="tabpanel" aria-labelledby="${uid}-tab-${i}" class="viz-panel"${i === 0 ? '' : ' hidden'}>${renderMarkdown(t.md)}</div>`).join('\n');
    const diagram = sceneId
      ? `<div class="viz-diagram"><div class="video-frame-wrap">${SCENES[sceneId].svg.replace('<svg ', '<svg class="anim-stage" ')}</div></div>`
      : '';
    return `<div class="viz viz-tabs" data-viz="tabs" data-tabs="${tabs.length}">
  <div class="viz-head"><span class="viz-tag">Interactive tabs &middot; ${safeTitle}</span></div>
  ${diagram}
  <div class="viz-tablist" role="tablist" aria-label="${safeTitle}">${buttons}</div>
  ${panels}
</div>`;
  });

  // 7c. Side-by-side comparison with an author-controlled count reveal.
  // Syntax: `::: viz compare <title>` with two `## Heading` sections; lines
  // starting with `= ` inside a section become count badges. Badges carry
  // `hidden` but the stylesheet reveals them until viz.js marks the widget
  // live — without JS everything (columns and counts) renders statically.
  const vizComparePattern = /::: viz compare(.*?)\n([\s\S]*?)\n:::/g;
  markdownText = markdownText.replace(vizComparePattern, (match, head, rawBody) => {
    const title = head.trim() || 'Comparison';
    const sections = [];
    for (const chunk of rawBody.split(/^\s*##\s+/m).map((s) => s.trim()).filter(Boolean)) {
      const lines = chunk.split('\n');
      const heading = lines.shift().trim();
      const counts = [];
      const body = [];
      for (const l of lines) {
        const t = l.trim();
        if (!t) continue;
        if (t.startsWith('= ')) counts.push(t.slice(2).trim());
        else body.push(t);
      }
      if (heading && body.length) sections.push({ heading, body: body.join('\n'), counts });
    }
    if (sections.length < 2) return match;
    const cols = sections.slice(0, 2).map((s) => {
      const badges = s.counts.map((c) => `<p class="viz-count" hidden><strong>${escapeHtml(c)}</strong></p>`).join('\n');
      return `<section class="viz-col" aria-label="${escapeHtml(s.heading)}"><p class="viz-colhead"><strong>${escapeHtml(s.heading)}</strong></p><div class="viz-colbody">${renderMarkdown(s.body)}</div>${badges}</section>`;
    }).join('\n');
    return `<div class="viz viz-compare" data-viz="compare">
  <div class="viz-head"><span class="viz-tag">Interactive comparison &middot; ${escapeHtml(title)}</span></div>
  <div class="viz-cols">
    ${cols}
  </div>
  <label class="viz-toggle"><input type="checkbox" class="viz-count-toggle"> Show counts</label>
</div>`;
  });

  // 7d. Generalized interactive lab (calculation registry in
  // assets/viz-calcs.js, single source for build-time static output and
  // browser interactivity). Syntax: `::: viz lab <calc-id> <title>` with an
  // optional assumptions note as the body. The legacy `::: viz rtt <title>`
  // form maps to the `rtt` calculation, so existing content keeps working
  // with zero markdown changes. Static output always contains the formula,
  // every input's meaning and bounds, the worked example at defaults with
  // precomputed results, and the disclaimer; viz.js adds live inputs.
  // Unknown calculation ids stay raw for scripts/check.js.
  const vizLab = (calcId, title, rawBody) => {
    const spec = getLab(calcId);
    if (!spec) return null;
    const safeTitle = escapeHtml(title.trim() || 'Interactive lab');
    vizUid += 1;
    const uid = `vizl${vizUid}`;
    const defValues = {};
    spec.inputs.forEach((inp) => { defValues[inp.key] = inp.def; });
    const defResults = computeLab(calcId, defValues);
    const fields = spec.inputs.map((inp) => {
      const slider = inp.slider
        ? `<input id="${uid}-${inp.key}-range" data-range="${inp.key}" type="range" min="${inp.min}" max="${inp.max}" step="${inp.step}" value="${inp.def}" aria-label="${escapeHtml(inp.label)} slider">`
        : '';
      return `<div class="viz-control">`
        + `<label class="viz-flabel" for="${uid}-${inp.key}">${escapeHtml(inp.label)} <span class="viz-unit">(${escapeHtml(inp.unit)}, ${inp.min}–${inp.max})</span></label>`
        + `<p class="viz-desc" id="${uid}-${inp.key}-desc">${escapeHtml(inp.desc)}</p>`
        + `<div class="viz-inrow">`
        + `<input id="${uid}-${inp.key}" data-in="${inp.key}" type="number" min="${inp.min}" max="${inp.max}" step="${inp.step}" value="${inp.def}" inputmode="decimal" aria-describedby="${uid}-${inp.key}-desc ${uid}-${inp.key}-err">`
        + `${slider}</div>`
        + `<p class="viz-err" data-err="${inp.key}" id="${uid}-${inp.key}-err" hidden></p>`
        + `</div>`;
    }).join('\n');
    const rows = spec.outputs.map((o) =>
      `<div class="viz-result"><span>${escapeHtml(o.label)} <small class="viz-meaning">${escapeHtml(o.meaning)}</small></span><output data-out="${o.key}" for="${spec.inputs.map((i) => `${uid}-${i.key}`).join(' ')}">${escapeHtml(formatOutput(spec, o.key, defResults[o.key]))}</output></div>`).join('\n');
    const notes = rawBody.trim() ? `<div class="viz-notes">${renderMarkdown(rawBody.trim())}</div>` : '';
    return `<div class="viz viz-lab" data-viz="lab" data-lab="${calcId}">
  <div class="viz-head"><span class="viz-tag">Interactive lab &middot; ${safeTitle}</span></div>
  <div class="viz-formula">${renderMarkdown(spec.formula)}</div>
  <div class="viz-inputs">
    ${fields}
  </div>
  <div class="viz-results">
    ${rows}
  </div>
  <p class="viz-status" role="status">${escapeHtml(statusSummary(spec, defResults))}</p>
  <div class="viz-controls"><button type="button" class="viz-btn" data-act="reset">Reset</button></div>
  <div class="viz-worked"><p><strong>Worked example (defaults).</strong></p>${renderMarkdown(spec.explain(defValues, defResults))}</div>
  <p class="viz-disclaimer">${escapeHtml(spec.disclaimer)}</p>
  ${notes}
</div>`;
  };
  const statusSummary = (spec, results) => spec.outputs
    .map((o) => `${o.label} ${formatOutput(spec, o.key, results[o.key])}`).join(' · ');
  const vizLabPattern = /::: viz lab (\S+)(.*?)\n([\s\S]*?)\n:::/g;
  markdownText = markdownText.replace(vizLabPattern, (match, calcId, head, rawBody) => {
    const out = vizLab(calcId, head, rawBody);
    return out === null ? match : out;
  });
  // Body-less labs (`::: viz lab <id> <title>` closed immediately): the
  // assumptions note is optional, so these render with empty notes rather
  // than leaking raw syntax.
  const vizLabBarePattern = /::: viz lab (\S+)([^\n]*)\n:::/g;
  markdownText = markdownText.replace(vizLabBarePattern, (match, calcId, head) => {
    const out = vizLab(calcId, head, '');
    return out === null ? match : out;
  });
  const vizRttLegacyPattern = /::: viz rtt(.*?)\n([\s\S]*?)\n:::/g;
  markdownText = markdownText.replace(vizRttLegacyPattern, (match, head, rawBody) => {
    const out = vizLab('rtt', head, rawBody);
    return out === null ? match : out;
  });

  // 7e. Annotated structure viewer (fields with sizes and meanings).
  // Syntax: `::: viz structure <title>` with body lines
  // `field | Name | <bits> | explanation`, optional `group | Label` dividers
  // (each group starts a new visual row), and blank lines also break rows.
  // Any other non-empty line becomes a plain note below. Widths must be
  // positive integers (bits); proportional flex does the layout, so tiny
  // fields keep a readable minimum width via CSS. Without JS every field
  // shows name, size, and explanation inline; viz.js collapses to a
  // select-to-inspect panel. Malformed blocks stay raw for check.js.
  const vizStructPattern = /::: viz structure(.*?)\n([\s\S]*?)\n:::/g;
  markdownText = markdownText.replace(vizStructPattern, (match, head, rawBody) => {
    const title = head.trim() || 'Structure';
    const safeTitle = escapeHtml(title);
    const rows = [];
    let current = { group: null, fields: [] };
    const noteLines = [];
    let ok = true;
    const flush = () => {
      // Push row only when it has fields; a pending group label carries
      // forward across blank lines instead of vanishing silently.
      if (current.fields.length) {
        rows.push(current);
        current = { group: null, fields: [] };
      }
    };
    for (const raw of rawBody.split('\n')) {
      const l = raw.trim();
      if (!l) { flush(); noteLines.push(''); continue; }
      if (l.toLowerCase().startsWith('group |')) {
        flush();
        current.group = l.slice(7).trim() || null;
        continue;
      }
      if (l.toLowerCase().startsWith('field |')) {
        const parts = l.split('|').map((p) => p.trim());
        // Strict decimal integers only: Number("0x10") or Number("1e2")
        // would otherwise smuggle non-decimal widths past the gate.
        const bits = /^[0-9]+$/.test(parts[2] || '') ? parseInt(parts[2], 10) : NaN;
        if (parts.length < 4 || !parts[1] || !Number.isInteger(bits) || bits <= 0 || !parts[3]) {
          ok = false;
          break;
        }
        current.fields.push({ name: parts[1], bits, md: parts.slice(3).join(' | ') });
        continue;
      }
      noteLines.push(l);
    }
    flush();
    if (!ok || !rows.length) return match;
    let idx = 0;
    const rowHtml = rows.map((row, ri) => {
      const cells = row.fields.map((f) => {
        const n = idx++;
        return `<button type="button" class="viz-field" data-i="${n}" aria-pressed="false" style="flex:${f.bits} 1 0"><span class="viz-fname">${escapeHtml(f.name)}</span><span class="viz-fsize">${f.bits} bit${f.bits === 1 ? '' : 's'}</span><span class="viz-fexp">${renderMarkdown(f.md)}</span></button>`;
      }).join('\n');
      const label = row.group ? `<p class="viz-fgroup">${escapeHtml(row.group)}</p>` : '';
      const rowLabel = row.group || `Fields row ${ri + 1} of ${rows.length}`;
      return `${label}<div class="viz-srow" role="group" aria-label="${escapeHtml(rowLabel)}">${cells}</div>`;
    }).join('\n');
    const total = rows.reduce((a, r) => a + r.fields.length, 0);
    const notesHtml = noteLines.join('\n').trim() ? `<div class="viz-notes">${renderMarkdown(noteLines.join('\n').trim())}</div>` : '';
    return `<div class="viz viz-struct" data-viz="struct" data-fields="${total}">
  <div class="viz-head"><span class="viz-tag">Interactive structure &middot; ${safeTitle}</span></div>
  <div class="viz-srows">
    ${rowHtml}
  </div>
  <p class="viz-fpanel" role="status">Select a field to inspect its size and meaning.</p>
  ${notesHtml}
</div>`;
  });

  // 7f. State-trace viewer: the SAME state mutating across operations.
  // `flow`/`stepper` cover sequences of independent stages; trace covers
  // state → op → state chains where each state must be read against the
  // previous one. Syntax: `::: viz trace <title>` with alternating lines:
  //   state | <markdown: full state at this point>
  //   op    | <markdown: operation producing the NEXT state>
  //   note  | <markdown: aside below the widget, outside the sequence>
  // Strict grammar (see parseTraceBody): at least 2 states, exactly
  // states.length − 1 ops, must begin with a state, strict state/op
  // alternation, no empty entries, and no unknown non-empty lines.
  // `==...==` highlights changed portions (<mark>), applied outside code
  // `$` math spans so `a == b` in code or formulas is never corrupted.
  // Without JS the full ordered trace renders statically (only the first
  // state is unhidden, and CSS reveals the rest); viz.js stages it
  // cumulatively — states 0..k plus the ops producing them. Malformed
  // blocks stay raw for scripts/check.js.
  const markSpots = (s) => {
    const kept = [];
    const stash = (m) => { kept.push(m); return `\0${kept.length - 1}\0`; };
    const shielded = s
      .replace(/`[^`\n]*`/g, stash)
      .replace(/\$\$[^$]*\$\$|\$[^$\n]*\$/g, stash);
    return shielded
      .replace(/==([^=\n]+?)==/g, '<mark>$1</mark>')
      .replace(/\0(\d+)\0/g, (_, i) => kept[Number(i)]);
  };
  const vizTracePattern = /::: viz trace(.*?)\n([\s\S]*?)\n:::/g;
  markdownText = markdownText.replace(vizTracePattern, (match, head, rawBody) => {
    const title = head.trim() || 'State trace';
    const safeTitle = escapeHtml(title);
    const parsed = parseTraceBody(rawBody);
    if (!parsed.ok) return match;
    const items = parsed.items;
    const states = items.filter((it) => it.kind === 'state');
    let si = 0;
    let oi = 0;
    const lis = items.filter((it) => it.kind !== 'note').map((it) => {
      const body = renderMarkdown(markSpots(it.md));
      if (it.kind === 'state') {
        const li = `<li class="viz-tstate" data-i="${si}"${si === 0 ? '' : ' hidden'}><span class="viz-slabel">State ${si}</span><div class="viz-sbody">${body}</div></li>`;
        si += 1;
        return li;
      }
      const li = `<li class="viz-top" data-i="${oi}" hidden><span class="viz-olabel" aria-hidden="true">&darr;</span><div class="viz-obody">${body}</div></li>`;
      oi += 1;
      return li;
    }).join('\n');
    const notes = items.filter((it) => it.kind === 'note');
    const notesHtml = notes.length ? `<div class="viz-notes">${renderMarkdown(notes.map((n) => n.md).join('\n'))}</div>` : '';
    return `<div class="viz viz-trace" data-viz="trace" data-states="${states.length}">
  <div class="viz-head"><span class="viz-tag">Interactive trace &middot; ${safeTitle}</span></div>
  <ol class="viz-trace-list">
    ${lis}
  </ol>
  <div class="viz-controls" role="group" aria-label="${safeTitle}: trace controls">
    <button type="button" class="viz-btn" data-act="prev">&larr; Prev</button>
    <button type="button" class="viz-btn" data-act="play">Play</button>
    <button type="button" class="viz-btn" data-act="next">Next &rarr;</button>
    <button type="button" class="viz-btn" data-act="reset">Reset</button>
  </div>
  <p class="viz-status" role="status">State 1 of ${states.length}</p>
  ${notesHtml}
</div>`;
  });

  // 7g. Hierarchical tree viewer: parent → child branching (search trees,
  // BSTs, decision/expression/recursion trees). `flow`/`stepper` cover
  // linear sequences, `trace` covers one evolving state, `structure` covers
  // fixed-width fields — tree covers branching relationships. Syntax:
  // `::: viz tree <title>` with one line per node:
  //   node | <id> | <label>            (the single root)
  //   node | <id> | <label> | <parent> (every other node, parent by id)
  // Strict grammar (see parseTreeBody): at least 1 node, exactly one root,
  // unique non-empty ids, non-empty plain-text labels, existing parents, no
  // self-parents, no cycles, no disconnected nodes. Child order follows
  // document order, so rendering is deterministic for identical input.
  // Labels are plain text (escaped, no Markdown) so the SVG diagram and the
  // static list always agree. Long labels are truncated deterministically
  // to 12 characters in the SVG diagram only (fixed 22px nodes, 120px
  // spacing — full text would overlap neighbors); the complete label is
  // always preserved in the semantic list buttons and announced in full by
  // the selection status. Static fallback: the SVG diagram plus a nested
  // semantic list carrying parent/level/children facts per node — fully
  // readable without JS. viz.js adds select-to-inspect (native buttons,
  // aria-pressed, live status naming parent and children labels from
  // build-time data attributes, SVG highlight mirror). Malformed blocks stay
  // raw for scripts/check.js. Intentionally NOT supported: general graphs,
  // zoom/pan/drag, editing, search, animation.
  const vizTreePattern = /::: viz tree(.*?)\n([\s\S]*?)\n:::/g;
  markdownText = markdownText.replace(vizTreePattern, (match, head, rawBody) => {
    const title = head.trim() || 'Tree';
    const safeTitle = escapeHtml(title);
    const parsed = parseTreeBody(rawBody);
    if (!parsed.ok) return match;
    const { nodes, root, children, depth } = parsed;
    const byId = new Map(nodes.map((n) => [n.id, n]));
    // Deterministic tidy layout: leaves take sequential x slots in document
    // order; each parent centers over its children's span. y follows depth.
    const pos = new Map();
    let nextX = 0;
    const place = (id) => {
      const kids = children.get(id);
      if (!kids.length) {
        pos.set(id, nextX);
        nextX += 1;
      } else {
        kids.forEach(place);
        pos.set(id, (pos.get(kids[0]) + pos.get(kids[kids.length - 1])) / 2);
      }
    };
    place(root.id);
    const X_STEP = 120;
    const Y_STEP = 96;
    const MARGIN_X = 48;
    const TOP = 44;
    const BOTTOM = 40;
    const NODE_R = 22;
    const maxDepth = Math.max(...nodes.map((n) => depth.get(n.id)));
    const width = Math.max(1, nextX - 1) * X_STEP + MARGIN_X * 2;
    const height = maxDepth * Y_STEP + TOP + BOTTOM;
    const cx = (id) => MARGIN_X + pos.get(id) * X_STEP;
    const cy = (id) => TOP + depth.get(id) * Y_STEP;
    const edges = nodes.filter((n) => n.parent !== null).map((n) =>
      `<line class="viz-tedge" x1="${cx(n.parent)}" y1="${cy(n.parent) + NODE_R}" x2="${cx(n.id)}" y2="${cy(n.id) - NODE_R}"/>`).join('');
    // Fit-safe SVG labels: at 13px monospace a 12-character label spans
    // ~94px, inside the 120px node spacing, so neighbors never overlap.
    // Code-point-safe slice keeps surrogate pairs intact. Full labels live
    // in the list buttons and the selection status below.
    const fitSvgLabel = (label) => {
      const chars = Array.from(label);
      return chars.length > 12 ? `${chars.slice(0, 11).join('')}…` : label;
    };
    const dots = nodes.map((n) =>
      `<g class="viz-tnode" data-node="${escapeHtml(n.id)}"><circle cx="${cx(n.id)}" cy="${cy(n.id)}" r="${NODE_R}"/><text x="${cx(n.id)}" y="${cy(n.id) + 5}">${escapeHtml(fitSvgLabel(n.label))}</text></g>`).join('');
    const meta = (n) => {
      const kids = children.get(n.id);
      const tail = kids.length === 0 ? 'leaf' : `${kids.length} child${kids.length === 1 ? '' : 'ren'}`;
      const head = n.parent === null ? 'root' : `child of ${byId.get(n.parent).label}`;
      return `${head} · level ${depth.get(n.id)} · ${tail}`;
    };
    // Build-time relationship facts for the runtime status sentence
    // (scripts/viz.js reads these instead of reparsing DOM text).
    const facts = (n) => {
      const parentLabel = n.parent === null ? '' : byId.get(n.parent).label;
      const kidLabels = children.get(n.id).map((id) => byId.get(id).label).join(', ');
      return ` data-label="${escapeHtml(n.label)}" data-parent="${escapeHtml(parentLabel)}" data-kids="${escapeHtml(kidLabels)}"`;
    };
    const renderList = (id) => {
      const n = byId.get(id);
      const kids = children.get(id);
      const sub = kids.length ? `<ul>${kids.map(renderList).join('')}</ul>` : '';
      return `<li><button type="button" class="viz-treenode" data-node="${escapeHtml(n.id)}"${facts(n)} aria-pressed="false"><span class="viz-tnid">${escapeHtml(n.label)}</span><span class="viz-tnmeta">${escapeHtml(meta(n))}</span></button>${sub}</li>`;
    };
    return `<div class="viz viz-tree" data-viz="tree" data-nodes="${nodes.length}">
  <div class="viz-head"><span class="viz-tag">Interactive tree &middot; ${safeTitle}</span></div>
  <div class="viz-tree-diagram"><svg class="viz-tree-svg" viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false">${edges}${dots}</svg></div>
  <ul class="viz-tree-list">
    ${renderList(root.id)}
  </ul>
  <p class="viz-status" role="status">Select a node to inspect its parent and children.</p>
</div>`;
  });

  return markdownText;
}
