import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

const CONTENT_DIR = 'content';
const OUTPUT_DIR = 'dist';
const TEMPLATE_PATH = path.join('templates', 'base.html');

const COURSE_METADATA = {
  PCCST503: 'Machine Learning',
  PCCST501: 'Computer Networks',
  PCCST502: 'Design and Analysis of Algorithms',
  PECST522: 'Artificial Intelligence'
};

const MODULE_NAMES = {
  PECST522: {
    1: 'Agents & Problem Solving',
    2: 'Search & Game Playing',
    3: 'Knowledge & Logic',
    4: 'Reinforcement Learning'
  },
  PCCST502: {
    1: 'Analysis & Recurrences',
    2: 'Graphs & Divide/Conquer',
    3: 'Greedy, DP & Backtracking',
    4: 'Branch/Bound & Complexity'
  },
  PCCST501: {
    1: 'Application Layer',
    2: 'Transport & Network Layer',
    3: 'Data Link Layer',
    4: 'Physical Layer & SNMP'
  },
  PCCST503: {
    1: 'Foundations & Regression',
    2: 'Classification & Trees',
    3: 'Neural Nets & SVMs',
    4: 'PCA & Ensembles'
  }
};

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: false
});

// Escape raw author text before injecting into HTML templates.
// Preserves `$` math delimiters for MathJax; neutralises <>&"'.
function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const ACRONYMS = new Set(['AI', 'PEAS', 'OSI', 'TCP', 'IP', 'HTTP', 'FTP', 'DNS', 'SMTP', 'P2P', 'AVL', 'BFS', 'DFS', 'UCS', 'DLS', 'IDDFS', 'CSP', 'AC-3', 'RL', 'RAM', 'SNMP', 'VLAN', 'ARP', 'CRC', 'CSMA', 'CD', 'PCM', 'KTU', 'CSE', 'SCC', 'DP', 'TSP', 'NP', 'MLE', 'MAP', 'KNN', 'PCA', 'SVM']);

function titleCaseSlug(slug) {
  return slug.replace(/_/g, ' ').split(' ').map(w => {
    const up = w.toUpperCase();
    if (ACRONYMS.has(up)) return up;
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}

// Build quick-jump pills from the page's actual <a id="..."> anchors,
// so pills never point at non-existent sections (was hardcoded).
const JUMP_LABELS = {
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

function plainText(html) {
  return html.replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function slugifyHeading(inner) {
  const slug = plainText(inner).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  return slug || 'section';
}

function shortTitle(inner) {
  const clean = plainText(inner).trim();
  return clean.length > 34 ? clean.slice(0, 34) + '…' : clean;
}

// Bidirectional theory<->practice section chaining: every H2 gets a stable
// id and a prev/next section nav row, so framework, worked examples, and
// quizzes link to each other on every page with zero author effort.
function linkSections(renderedHtml) {
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
function buildJumpPills(rawMarkdown) {
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

function transformCustomWidgets(markdownText) {
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
      const renderedBody = marked.parse(rawBody.trim());
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
  <div class="quiz-prompt">${marked.parse(prompt.trim())}</div>
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
      ${marked.parse(explanation.trim())}
    </div>
  </details>
</div>`;
  });

  // 3. Stepped Numerical Solution Cards
  const stepPattern = /::: step \[(.*?)\] (.*?)\n([\s\S]*?)\n:::/g;
  markdownText = markdownText.replace(stepPattern, (match, badge, title, rawContent) => {
    const renderedContent = marked.parse(rawContent.trim());
    return `<div class="step-card"><div class="step-badge">${escapeHtml(badge.trim())}</div><div class="step-title">${escapeHtml(title.trim())}</div><div class="step-content">${renderedContent}</div></div>`;
  });

  // 4. Interactive Toggles
  const togglePattern = /::: toggle (.*?)\n([\s\S]*?)\n:::/g;
  markdownText = markdownText.replace(togglePattern, (match, summary, rawContent) => {
    const renderedContent = marked.parse(rawContent.trim());
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

  return markdownText;
}

function renderNavTree(modules, currentMod, currentId) {
  let html = '';
  for (const [modNum, mod] of Object.entries(modules)) {
    const isOpen = parseInt(modNum, 10) === parseInt(currentMod, 10);
    const safeMod = escapeHtml(String(modNum));
    const safeModTitle = escapeHtml(mod.title);
    html += `
      <div class="module-block ${isOpen ? 'open' : ''}" data-mod="${safeMod}">
        <button class="module-head" aria-expanded="${isOpen ? 'true' : 'false'}" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open') ? 'true' : 'false');">
          <span class="module-num">M${safeMod}</span>
          <span>${safeModTitle}</span>
          <span class="chev">&#9656;</span>
        </button>
        <div class="topic-list">`;
    for (const topic of mod.topics) {
      const isActive = topic.id === currentId;
      const safeFile = escapeHtml(topic.filename);
      const safeId = escapeHtml(topic.id);
      const safeTitle = escapeHtml(topic.title);
      html += `
          <a href="./${safeFile}" class="topic-link ${isActive ? 'active' : ''}" id="topic-${safeId}">
            <span class="topic-dot"></span>
            <span>${safeTitle}</span>
          </a>`;
    }
    html += `
        </div>
      </div>`;
  }
  return html;
}

function renderTemplate(templateStr, data) {
  let result = templateStr;

  // NOTE: replacer functions (not strings) throughout — content contains
  // `$1`, `$$`, `$'` math that String.replace would otherwise expand/corrupt.
  const safe = (v) => () => String(v ?? '');
  result = result.replace(/\{\{\s*title\s*\}\}/g, safe(escapeHtml(data.title)));
  result = result.replace(/\{\{\s*course_name\s*\}\}/g, safe(escapeHtml(data.course_name)));
  result = result.replace(/\{\{\s*course_code\s*\}\}/g, safe(escapeHtml(data.course_code)));
  result = result.replace(/\{\{\s*current_mod\s*\}\}/g, safe(escapeHtml(data.current_mod)));
  result = result.replace(/\{\{\s*current_id\s*\}\}/g, safe(escapeHtml(data.current_id)));
  result = result.replace(/\{\{\s*total_topics\s*\|\s*default\(0\)\s*\}\}/g, safe(escapeHtml(data.total_topics ?? '0')));
  result = result.replace(/\{\{\s*total_topics\s*\}\}/g, safe(escapeHtml(data.total_topics ?? '0')));
  result = result.replace(/\{\{\s*content\s*\|\s*safe\s*\}\}/g, safe(data.content));

  // Render navigation module tree
  const navTreeHtml = renderNavTree(data.modules || {}, data.current_mod, data.current_id);
  result = result.replace(/\{\{\s*nav_tree\s*\|\s*safe\s*\}\}/g, safe(navTreeHtml));
  // Also replace legacy template loop if present
  result = result.replace(/\{%\s*for mod_num, mod in modules\.items\(\)\s*%\}[\s\S]*?\{%\s*endfor\s*%\}\s*(?=<\/nav>)/g, safe(navTreeHtml));

  // Render previous page link
  const prevPattern = /\{%\s*if prev_page\s*%\}([\s\S]*?)\{%\s*else\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/;
  result = result.replace(prevPattern, (match, hasPrev, noPrev) => {
    if (data.prev_page) {
      const safeFile = String(escapeHtml(data.prev_page.filename));
      const safeTitle = String(escapeHtml(data.prev_page.title));
      return hasPrev
        .replace(/\{\{\s*prev_page\.filename\s*\}\}/g, () => safeFile)
        .replace(/\{\{\s*prev_page\.title\s*\}\}/g, () => safeTitle);
    }
    return noPrev;
  });

  // Render next page link
  const nextPattern = /\{%\s*if next_page\s*%\}([\s\S]*?)\{%\s*else\s*%\}([\s\S]*?)\{%\s*endif\s*%\}/;
  result = result.replace(nextPattern, (match, hasNext, noNext) => {
    if (data.next_page) {
      const safeFile = String(escapeHtml(data.next_page.filename));
      const safeTitle = String(escapeHtml(data.next_page.title));
      return hasNext
        .replace(/\{\{\s*next_page\.filename\s*\}\}/g, () => safeFile)
        .replace(/\{\{\s*next_page\.title\s*\}\}/g, () => safeTitle);
    }
    return noNext;
  });

  return result;
}

function formatTopicTitle(filename) {
  const cleanName = filename.replace(/\.md$/, '');
  const labMatch = cleanName.match(/^m(\d+)_99_practice_lab_(.*)$/i);
  if (labMatch) {
    const modNum = labMatch[1];
    return `🧪 Practice Lab: M${modNum} ${titleCaseSlug(labMatch[2])}`;
  }

  // seq 00 = module overview (sorts first by convention)
  const overviewMatch = cleanName.match(/^m(\d+)_00_(.*)$/i);
  if (overviewMatch) {
    return `Module ${parseInt(overviewMatch[1], 10)} Overview: ${titleCaseSlug(overviewMatch[2])}`;
  }

  const topicMatch = cleanName.match(/^m(\d+)_(\d+)_(.*)$/i);
  if (topicMatch) {
    const modNum = parseInt(topicMatch[1], 10);
    const topNum = parseInt(topicMatch[2], 10);
    return `${modNum}.${topNum} ${titleCaseSlug(topicMatch[3])}`;
  }

  return titleCaseSlug(cleanName);
}

export function buildSite() {
  const templateStr = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const coursesData = {};
  const warnings = [];

  // Clean output first so renamed/deleted .md files don't leave stale .html behind.
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const courseDirs = fs.readdirSync(CONTENT_DIR);

  for (const courseCode of courseDirs) {
    const coursePath = path.join(CONTENT_DIR, courseCode);
    if (!fs.statSync(coursePath).isDirectory()) continue;

    const courseOutDir = path.join(OUTPUT_DIR, courseCode);
    if (!fs.existsSync(courseOutDir)) {
      fs.mkdirSync(courseOutDir, { recursive: true });
    }

    const courseName = COURSE_METADATA[courseCode] || courseCode;
    const modules = {};
    const pages = [];

    const files = fs.readdirSync(coursePath).filter(f => f.endsWith('.md')).sort();

    // Validate naming convention m{mod}_{seq}_{slug}.md: flag duplicate seq + gaps.
    const seenSeq = new Map();
    for (const f of files) {
      const m = f.match(/^m(\d+)_(\d+)_/);
      if (!m) { warnings.push(`${courseCode}/${f}: filename breaks m{mod}_{seq}_{slug}.md convention`); continue; }
      const key = `${m[1]}_${m[2]}`;
      if (seenSeq.has(key)) warnings.push(`${courseCode}: duplicate seq ${key} in ${seenSeq.get(key)} and ${f}`);
      else seenSeq.set(key, f);
    }

    for (const filename of files) {
      const modMatch = filename.match(/^m(\d+)_/);
      const modNum = modMatch ? parseInt(modMatch[1], 10) : 0;
      const title = formatTopicTitle(filename);
      const htmlFilename = filename.replace(/\.md$/, '.html');

      if (!modules[modNum]) {
        const modTitle = MODULE_NAMES[courseCode]?.[modNum] || `Module ${modNum}`;
        modules[modNum] = { num: modNum, title: modTitle, topics: [] };
      }

      const pageData = {
        id: filename.replace(/\.md$/, ''),
        title: title,
        filename: htmlFilename,
        source_path: path.join(coursePath, filename)
      };

      modules[modNum].topics.push(pageData);
      pages.push({ modNum, pageData });
    }

    // Render pages
    for (let idx = 0; idx < pages.length; idx++) {
      const { modNum, pageData: page } = pages[idx];
      const rawMarkdown = fs.readFileSync(page.source_path, 'utf-8');

      const wordCount = rawMarkdown.split(/\s+/).length;
      const readTime = Math.max(2, Math.round(wordCount / 180));

      const preprocessedMarkdown = transformCustomWidgets(rawMarkdown);

      // Warn on manim refs pointing at missing files (all 8 mp4s currently orphaned).
      for (const m of preprocessedMarkdown.matchAll(/<source src="\.\.\/(.*?)" type="video\/mp4">/g)) {
        const rel = m[1].replace(/^\//, '');
        if (!fs.existsSync(rel)) warnings.push(`${courseCode}/${page.filename}: video missing ${rel}`);
      }

      const renderedHtmlBody = linkSections(marked.parse(preprocessedMarkdown));

      const prevPage = idx > 0 ? pages[idx - 1].pageData : null;
      const nextPage = idx < pages.length - 1 ? pages[idx + 1].pageData : null;

      const jumpBar = buildJumpPills(rawMarkdown);
      const headerPrefix = `<div class="topic-header">
  <div class="topic-badges">
    <span class="badge badge-accent">MODULE ${escapeHtml(String(modNum))}</span>
    <span class="badge">⏱️ ${escapeHtml(String(readTime))} MIN READ</span>
    <span class="badge badge-gold">🟢 BEGINNER FRIENDLY</span>
    <span class="badge">🎯 KTU 2024 SCHEME</span>
  </div>
  ${jumpBar}
</div>\n`;

      const fullContent = headerPrefix + renderedHtmlBody;

      const fullHtmlDoc = renderTemplate(templateStr, {
        content: fullContent,
        title: page.title,
        current_id: page.id,
        current_mod: modNum,
        modules: modules,
        prev_page: prevPage,
        next_page: nextPage,
        total_topics: pages.length,
        course_code: courseCode,
        course_name: courseName
      });

      const targetPath = path.join(courseOutDir, page.filename);
      fs.writeFileSync(targetPath, fullHtmlDoc, 'utf-8');
    }

    coursesData[courseCode] = {
      name: courseName,
      modules: modules
    };
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'navigation_index.json'), JSON.stringify(coursesData, null, 2), 'utf-8');

  // Sitemap for SEO (relative URLs; Pages serves dist/ as root).
  {
    const urls = ['index.html'];
    for (const [courseCode, course] of Object.entries(coursesData)) {
      for (const mod of Object.values(course.modules)) {
        for (const topic of mod.topics) urls.push(`${courseCode}/${topic.filename}`);
      }
    }
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map(u => `  <url><loc>${escapeHtml(u)}</loc></url>`).join('\n') + `\n</urlset>\n`;
    fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), sitemap, 'utf-8');
  }

  // Copy style.css to dist
  if (fs.existsSync('style.css')) {
    fs.copyFileSync('style.css', path.join(OUTPUT_DIR, 'style.css'));
  }

  // Create .nojekyll in dist
  fs.writeFileSync(path.join(OUTPUT_DIR, '.nojekyll'), '', 'utf-8');

  // Copy root index.html to dist/index.html with adjusted paths for standalone hosting.
  // Root uses dist/<COURSE>/... links (branch-root mode); inside dist/ the
  // same cards must be explicitly relative (./<COURSE>/...) for artifact mode.
  // NOTE: a hardcoded /Tarangam-app-v2/ base is deliberately NOT used — it
  // would break one of the two modes (branch root needs dist/ prefix,
  // artifact root must not have it). Explicit relative paths serve both.
  if (fs.existsSync('index.html')) {
    let rootIndex = fs.readFileSync('index.html', 'utf-8');
    // Replace "dist/" prefix for links inside dist/
    const standaloneIndex = rootIndex.replace(/href="dist\//g, 'href="./');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), standaloneIndex, 'utf-8');
  }

  // Copy assets and media if they exist
  if (fs.existsSync('assets')) {
    fs.cpSync('assets', path.join(OUTPUT_DIR, 'assets'), { recursive: true });
  }
  if (fs.existsSync('media')) {
    fs.cpSync('media', path.join(OUTPUT_DIR, 'media'), { recursive: true });
  }

  console.log('✅ Tarangam curriculum compilation completed successfully.');
  if (warnings.length) {
    console.warn(`⚠️ ${warnings.length} build warning(s):`);
    for (const w of warnings.slice(0, 50)) console.warn('  - ' + w);
  }
}

const isMain = process.argv[1] && process.argv[1].endsWith('build.js');
if (isMain) buildSite();
