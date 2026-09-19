/**
 * Shared Markdown processing — topic file reading, Markdown → HTML
 * conversion with the existing marked configuration, and the pure
 * text/HTML + heading/slug helpers used by the render pipeline.
 * Used by scripts/build.js. Uses the existing marked dependency;
 * no new dependencies. ES module style like the rest of scripts/.
 *
 * Only Markdown rendering preparation lives here. No curriculum loading,
 * course/topic discovery, curriculum validation, template generation,
 * dashboard generation, scenes, widget-specific behavior, learner state,
 * or UI logic.
 */
import fs from 'fs';
import { marked } from 'marked';

// Configure marked (same options the build previously set inline).
marked.setOptions({
  gfm: true,
  breaks: false
});

// Read a topic Markdown file as text.
export function readTopicMarkdown(sourcePath) {
  return fs.readFileSync(sourcePath, 'utf-8');
}

// Markdown → HTML conversion using the configured marked above.
export function renderMarkdown(markdownText) {
  return marked.parse(markdownText);
}

// Escape raw author text before injecting into HTML templates.
// Preserves `$` math delimiters for MathJax; neutralises <>&"'.
export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function plainText(html) {
  return html.replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

export function slugifyHeading(inner) {
  const slug = plainText(inner).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  return slug || 'section';
}

export function shortTitle(inner) {
  const clean = plainText(inner).trim();
  return clean.length > 34 ? clean.slice(0, 34) + '…' : clean;
}

// Bidirectional theory<->practice section chaining: every H2 gets a stable
// id and a prev/next section nav row, so framework, worked examples, and
// quizzes link to each other on every page with zero author effort.
export function linkSections(renderedHtml) {
  const existing = new Set([...renderedHtml.matchAll(/<a id="([^"]+)">/g)].map(m => m[1]));
  const heads = [...renderedHtml.matchAll(/<h2>(.*?)<\/h2>/gs)];
  if (heads.length < 2) return renderedHtml;
  const used = new Set(existing);
  const secs = heads.map(m => {
    let slug = slugifyHeading(m[1]);
    let n = 2;
    while (used.has(slug)) slug = `${slugifyHeading(m[1])}-${n++}`;
    used.add(slug);
    return { slug, title: shortTitle(m[1]) };
  });
  let i = 0;
  return renderedHtml.replace(/<h2>(.*?)<\/h2>/gs, (match, inner) => {
    const s = secs[i];
    const prev = i > 0
      ? `<a href="#${secs[i - 1].slug}">← ${escapeHtml(secs[i - 1].title)}</a>`
      : `<a href="#content">↑ Top</a>`;
    const next = i < secs.length - 1
      ? `<a href="#${secs[i + 1].slug}">${escapeHtml(secs[i + 1].title)} →</a>`
      : `<a href="#pagefoot">↓ Next topic</a>`;
    i++;
    return `<h2 id="${s.slug}">${inner}</h2>\n<p class="secnav">${prev}<span class="secnav-sep">·</span>${next}</p>`;
  });
}

// Build quick-jump pills from the page's actual <a id="..."> anchors,
// so pills never point at non-existent sections (was hardcoded).
export const JUMP_LABELS = {
  'the-intuition': '💡 Intuition',
  'the-math': '📐 Framework',
  'worked-example': '🧪 Worked Example',
  'self-check': '⚡ Self Check',
  'the-dimensions': '📐 Dimensions',
  'terminology': '📖 Terms',
  'foundations': '🏛️ Foundations',
  'history': '📜 History',
  'modern-engineering': '⚙️ Modern View',
  'exam-focus': '🎯 Exam Focus',
  'the-matrix': '🧮 Matrix'
};

export function buildJumpPills(rawMarkdown) {
  const ids = [];
  const seen = new Set();
  for (const m of rawMarkdown.matchAll(/<a id="([^"]+)">/g)) {
    if (!seen.has(m[1])) { seen.add(m[1]); ids.push(m[1]); }
  }
  const pills = ids.slice(0, 6).map(id =>
    `<a href="#${escapeHtml(id)}" class="jump-pill">${JUMP_LABELS[id] || escapeHtml(id)}</a>`
  ).join('\n    ');
  if (!pills) return '';
  return `<div class="quick-jump-bar">\n    ${pills}\n  </div>`;
}
