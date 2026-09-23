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

  // 7d. RTT timing lab (HTTP showcase; pure textbook model). Syntax:
  // `::: viz rtt <title>` with an optional assumptions note as the body.
  // Fixed inputs (objects N, RTT ms, transfer ms) feed calcRtt() in
  // assets/viz.js; a fixed disclaimer states the model is comparative,
  // never a measurement of real browser performance.
  const vizRttPattern = /::: viz rtt(.*?)\n([\s\S]*?)\n:::/g;
  markdownText = markdownText.replace(vizRttPattern, (match, head, rawBody) => {
    const title = head.trim() || 'RTT timing lab';
    const safeTitle = escapeHtml(title);
    vizUid += 1;
    const uid = `vizr${vizUid}`;
    const notes = rawBody.trim() ? `<div class="viz-notes">${renderMarkdown(rawBody.trim())}</div>` : '';
    const field = (key, label, value, min) =>
      `<label class="viz-field" for="${uid}-${key}">${label}<input id="${uid}-${key}" data-in="${key}" type="number" min="${min}" step="1" value="${value}" inputmode="numeric"></label>`;
    const row = (key, label) =>
      `<div class="viz-result"><span>${label}</span><output data-out="${key}" for="${uid}-n ${uid}-rtt ${uid}-t">—</output></div>`;
    return `<div class="viz viz-rtt" data-viz="rtt">
  <div class="viz-head"><span class="viz-tag">Interactive lab &middot; ${safeTitle}</span></div>
  <div class="viz-inputs">
    ${field('n', 'Objects N', 5, 0)}
    ${field('rtt', 'RTT (ms)', 50, 0)}
    ${field('t', 'Transfer per object (ms)', 10, 0)}
  </div>
  <div class="viz-results">
    ${row('nonpersistent', 'Non-persistent')}
    ${row('persistent', 'Persistent')}
    ${row('pipelined', 'Pipelined')}
  </div>
  <p class="viz-status" role="status">Textbook comparison model — not a measurement of real browser performance.</p>
  ${notes}
</div>`;
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
    const notes = [];
    let ok = true;
    const flush = () => {
      if (current.fields.length) rows.push(current);
      current = { group: null, fields: [] };
    };
    for (const raw of rawBody.split('\n')) {
      const l = raw.trim();
      if (!l) { flush(); continue; }
      if (l.toLowerCase().startsWith('group |')) {
        flush();
        current.group = l.slice(7).trim() || null;
        continue;
      }
      if (l.toLowerCase().startsWith('field |')) {
        const parts = l.split('|').map((p) => p.trim());
        const bits = Number(parts[2]);
        if (parts.length < 4 || !parts[1] || !Number.isInteger(bits) || bits <= 0 || !parts[3]) {
          ok = false;
          break;
        }
        current.fields.push({ name: parts[1], bits, md: parts.slice(3).join(' | ') });
        continue;
      }
      notes.push(l);
    }
    flush();
    if (!ok || !rows.length) return match;
    let idx = 0;
    const rowHtml = rows.map((row) => {
      const cells = row.fields.map((f) => {
        const n = idx++;
        return `<button type="button" class="viz-field" data-i="${n}" aria-pressed="false" style="flex:${f.bits} 1 0"><span class="viz-fname">${escapeHtml(f.name)}</span><span class="viz-fsize">${f.bits} bit${f.bits === 1 ? '' : 's'}</span><span class="viz-fexp">${renderMarkdown(f.md)}</span></button>`;
      }).join('\n');
      const label = row.group ? `<p class="viz-fgroup">${escapeHtml(row.group)}</p>` : '';
      return `${label}<div class="viz-srow" role="group" aria-label="${escapeHtml(row.group || `Fields row`)}">${cells}</div>`;
    }).join('\n');
    const total = rows.reduce((a, r) => a + r.fields.length, 0);
    const notesHtml = notes.length ? `<div class="viz-notes">${renderMarkdown(notes.join('\n'))}</div>` : '';
    return `<div class="viz viz-struct" data-viz="struct" data-fields="${total}">
  <div class="viz-head"><span class="viz-tag">Interactive structure &middot; ${safeTitle}</span></div>
  <div class="viz-srows">
    ${rowHtml}
  </div>
  <p class="viz-fpanel" role="status">Select a field to inspect its size and meaning.</p>
  ${notesHtml}
</div>`;
  });

  return markdownText;
}
