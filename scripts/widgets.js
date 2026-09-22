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

  return markdownText;
}
