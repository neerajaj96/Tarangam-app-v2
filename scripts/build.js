import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { SCENES } from './scenes.js';
import { CURRICULUM_PATH, loadCurriculum } from './curriculum.js';
import {
  listContentCourses,
  resolveCoursePath,
  listTopicFiles,
  parseTopicFile,
  findTopicFilenameIssues,
} from './content.js';

const CONTENT_DIR = 'content';
const OUTPUT_DIR = 'dist';
const TEMPLATE_PATH = path.join('templates', 'base.html');

// Single source of truth: all curriculum metadata (course names, module
// names, dashboard ordering) comes from data/curriculum.json, loaded via
// the shared scripts/curriculum.js loader (fails loudly when the file is
// missing, malformed, or structurally invalid). Topic counts and topic
// lists always come from content/ — never from the JSON.
const CURRICULUM_DOC = loadCurriculum();

// Derived view over the canonical document (same shape the build
// previously hardcoded inline, so the rest of the pipeline is untouched).
const MODULE_NAMES = Object.fromEntries(
  Object.values(CURRICULUM_DOC.curriculum).map((c) => [
    c.code,
    Object.fromEntries((c.modules || []).map((m) => [m.number, m.name]))
  ])
);

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

const ACRONYMS = new Set(['AI', 'PEAS', 'OSI', 'TCP', 'IP', 'HTTP', 'FTP', 'DNS', 'SMTP', 'P2P', 'AVL', 'BFS', 'DFS', 'UCS', 'DLS', 'IDDFS', 'CSP', 'AC-3', 'RL', 'RAM', 'SNMP', 'VLAN', 'ARP', 'CRC', 'CSMA', 'CD', 'PCM', 'KTU', 'CSE', 'SCC', 'DP', 'TSP', 'NP', 'MLE', 'MAP', 'KNN', 'PCA', 'SVM', 'NA', 'SONAR', 'NDT', 'LED', 'CW', 'PIN', 'PMF', 'CDF', 'PDF', 'CLT', 'SLLN', 'RV', 'ADT', 'FIFO', 'LIFO', 'BST', 'AC', 'DC', 'RMS', 'EMF', 'MMF', 'BJT', 'FET', 'MOSFET', 'CE', 'CB', 'CC', 'AM', 'FM', 'GSM', 'CRO', 'DMM', 'KCL', 'KVL', 'RL', 'RC', 'RLC', 'TAC', 'IR', 'LR', 'LL', 'LVN', 'YACC', 'AST', 'HPC', 'HTC', 'VM', 'VMM', 'GPU', 'P2P', 'SSI', 'HA', 'IPC', 'API', 'IaaS', 'PaaS', 'SaaS', 'IoT', 'CPS', 'SQL', 'XSS', 'CSRF', 'DNS', 'DNSSEC', 'DOS', 'DDOS', 'ARP', 'NMAP', 'DVWA', 'ZAP', 'OWASP', 'PBL', 'VAPT', 'MLP', 'SGD', 'CNN', 'RNN', 'LSTM', 'GAN', 'RELU', 'RBM', 'BPTT', 'DES', 'AES', 'RSA', 'SHA', 'MD5', 'MAC', 'PKI', 'CRT', 'JUNIT', 'ECP', 'BVA', 'CFG', 'PEX', 'GENAI', 'QA', 'HCD', 'TRL', 'USP', 'SRD', 'SRS', 'DFM', 'DFMEA', 'POC', 'BMC', 'ML', 'MLE', 'MAP', 'MAE', 'RMSE', 'ROC', 'AUC', 'ID3', 'MDS', 'LASSO', 'RIDGE', 'SSE', 'AC3', 'FOL', 'POP3', 'IMAP', 'MX', 'TTL', 'DHT', 'QOS', 'RPF', 'IGMP', 'RSVP', 'DSCP', 'WFQ', 'PIM', 'DVMRP', 'FDM', 'TDM', 'WDM', 'BER', 'SMI', 'MIB', 'ASN1', 'DAG', 'IPV4', 'IPV6', 'CIDR', 'NAT', 'ICMP', 'OSPF', 'RIP', 'BGP']);

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

// Dashboard subject order comes from data/curriculum.json (matches the
// Year → Semester layout in index.html; unknown codes append
// alphabetically so new courses never silently vanish).
const DASHBOARD_ORDER = [...CURRICULUM_DOC.dashboardOrder];

// Static subject-detail blocks for the dashboard Topics step
// (Years → Semesters → Subjects → Topics). Generated from the same
// coursesData as the topic pages, so lists can never drift from content.
// Links use the root-mode `dist/` prefix; the dist-copy rewrite below
// converts them to `./` for artifact mode, exactly like hand-written cards.
function renderSubjectDetails(coursesData) {
  const codes = [
    ...DASHBOARD_ORDER.filter((c) => coursesData[c]),
    ...Object.keys(coursesData).filter((c) => !DASHBOARD_ORDER.includes(c)).sort()
  ];
  return codes.map((code) => {
    const course = coursesData[code];
    const mods = Object.values(course.modules).sort((a, b) => a.num - b.num);
    const total = mods.reduce((n, m) => n + m.topics.length, 0);
    const modHtml = mods.map((mod, mi) => {
      const links = mod.topics.map((t) =>
        `          <a class="topic-btn" href="dist/${escapeHtml(code)}/${escapeHtml(t.filename)}"><span>${escapeHtml(t.title)}</span></a>`
      ).join('\n');
      return `      <details class="module-drop"${mi === 0 ? ' open' : ''}>\n` +
        `        <summary><span class="module-tag">Module ${escapeHtml(String(mod.num))}</span><span>${escapeHtml(mod.title)}</span><span class="module-count">${mod.topics.length} topics</span></summary>\n` +
        `        <div class="topic-links">\n${links}\n        </div>\n` +
        `      </details>`;
    }).join('\n');
    return `    <div class="subject-block" data-subject="${escapeHtml(code)}" hidden>\n` +
      `      <div class="subject-detail-head">\n` +
      `        <div class="subject-detail-title">${escapeHtml(course.name)}</div>\n` +
      `        <div class="subject-detail-sub">${escapeHtml(code)} · ${total} topics · ${mods.length} modules</div>\n` +
      `      </div>\n${modHtml}\n    </div>`;
  }).join('\n');
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

  // Course/topic discovery comes from the shared scripts/content.js
  // module (course dirs, sorted .md files, file-path resolution); topic
  // counts and lists always derive from content/ — never from the JSON.
  const courseCodes = listContentCourses(CONTENT_DIR);

  for (const courseCode of courseCodes) {
    const coursePath = resolveCoursePath(CONTENT_DIR, courseCode);

    const courseOutDir = path.join(OUTPUT_DIR, courseCode);
    if (!fs.existsSync(courseOutDir)) {
      fs.mkdirSync(courseOutDir, { recursive: true });
    }

    // The curriculum entry is mandatory: a content directory without a
    // data/curriculum.json entry fails the build (no silent fallback).
    const curriculumEntry = CURRICULUM_DOC.curriculum[courseCode];
    if (!curriculumEntry) {
      throw new Error(
        `Content course "${courseCode}" (content/${courseCode}/) has no entry in ` +
        `${CURRICULUM_PATH}. Add it to data/curriculum.json — the build has no hardcoded fallback.`
      );
    }
    const courseName = curriculumEntry.name;
    const modules = {};
    const pages = [];

    const files = listTopicFiles(coursePath);

    // Validate naming convention m{mod}_{seq}_{slug}.md: flag duplicate seq + gaps.
    for (const issue of findTopicFilenameIssues(courseCode, files)) warnings.push(issue);

    for (const filename of files) {
      const parsed = parseTopicFile(coursePath, filename);
      const modNum = parsed.modNum;
      const title = formatTopicTitle(filename);
      const htmlFilename = parsed.htmlFilename;

      if (!modules[modNum]) {
        const modTitle = MODULE_NAMES[courseCode]?.[modNum] || `Module ${modNum}`;
        modules[modNum] = { num: modNum, title: modTitle, topics: [] };
      }

      const pageData = {
        id: parsed.id,
        title: title,
        filename: htmlFilename,
        source_path: parsed.sourcePath
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

  // Dashboard subject-detail injection (Topics step of the flow).
  // Root index.html carries empty TARANGAM-SUBJECT-DETAILS markers; the
  // build fills them with per-course module/topic blocks so both Pages
  // modes (branch root + artifact) serve identical lists with zero fetching.
  // Replacement is deterministic (same content → same bytes), so diffs stay
  // reviewable; missing markers fail loudly instead of shipping empty screens.
  if (fs.existsSync('index.html')) {
    const START = '<!-- TARANGAM-SUBJECT-DETAILS:START -->';
    const END = '<!-- TARANGAM-SUBJECT-DETAILS:END -->';
    let rootIndex = fs.readFileSync('index.html', 'utf-8');
    const si = rootIndex.indexOf(START);
    const ei = rootIndex.indexOf(END);
    if (si === -1 || ei === -1 || ei < si) {
      throw new Error('index.html missing TARANGAM-SUBJECT-DETAILS markers — dashboard topics view cannot be built');
    }
    const detailsHtml = renderSubjectDetails(coursesData);
    rootIndex = rootIndex.slice(0, si + START.length) + '\n' + detailsHtml + '\n' + rootIndex.slice(ei);
    // Fill per-subject topic counts on the subject buttons (same determinism).
    rootIndex = rootIndex.replace(
      /<span class="subject-count" data-topic-count="([A-Za-z0-9]+)">.*?<\/span>/g,
      (m, code) => {
        const n = Object.values((coursesData[code] || {}).modules || {}).reduce((a, mod) => a + mod.topics.length, 0);
        return `<span class="subject-count" data-topic-count="${code}">${n} topics</span>`;
      }
    );
    fs.writeFileSync('index.html', rootIndex, 'utf-8');
  }

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
