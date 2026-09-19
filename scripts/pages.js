/**
 * Shared HTML page/template generation — navigation tree HTML,
 * dashboard subject-detail blocks, base-template variable replacement
 * (including previous/next page rendering), topic-title helpers, and
 * topic-page HTML assembly, used by scripts/build.js. ES module style
 * like the rest of scripts/.
 *
 * Only pure page/template rendering lives here. It reuses escapeHtml
 * from scripts/markdown.js rather than duplicating it. No curriculum
 * loading, content discovery, Markdown parsing, widget preprocessing,
 * filesystem cleanup/copying, validation/check logic, learner state,
 * or UI logic.
 */
import { escapeHtml } from './markdown.js';

const ACRONYMS = new Set(['AI', 'PEAS', 'OSI', 'TCP', 'IP', 'HTTP', 'FTP', 'DNS', 'SMTP', 'P2P', 'AVL', 'BFS', 'DFS', 'UCS', 'DLS', 'IDDFS', 'CSP', 'AC-3', 'RL', 'RAM', 'SNMP', 'VLAN', 'ARP', 'CRC', 'CSMA', 'CD', 'PCM', 'KTU', 'CSE', 'SCC', 'DP', 'TSP', 'NP', 'MLE', 'MAP', 'KNN', 'PCA', 'SVM', 'NA', 'SONAR', 'NDT', 'LED', 'CW', 'PIN', 'PMF', 'CDF', 'PDF', 'CLT', 'SLLN', 'RV', 'ADT', 'FIFO', 'LIFO', 'BST', 'AC', 'DC', 'RMS', 'EMF', 'MMF', 'BJT', 'FET', 'MOSFET', 'CE', 'CB', 'CC', 'AM', 'FM', 'GSM', 'CRO', 'DMM', 'KCL', 'KVL', 'RL', 'RC', 'RLC', 'TAC', 'IR', 'LR', 'LL', 'LVN', 'YACC', 'AST', 'HPC', 'HTC', 'VM', 'VMM', 'GPU', 'P2P', 'SSI', 'HA', 'IPC', 'API', 'IaaS', 'PaaS', 'SaaS', 'IoT', 'CPS', 'SQL', 'XSS', 'CSRF', 'DNS', 'DNSSEC', 'DOS', 'DDOS', 'ARP', 'NMAP', 'DVWA', 'ZAP', 'OWASP', 'PBL', 'VAPT', 'MLP', 'SGD', 'CNN', 'RNN', 'LSTM', 'GAN', 'RELU', 'RBM', 'BPTT', 'DES', 'AES', 'RSA', 'SHA', 'MD5', 'MAC', 'PKI', 'CRT', 'JUNIT', 'ECP', 'BVA', 'CFG', 'PEX', 'GENAI', 'QA', 'HCD', 'TRL', 'USP', 'SRD', 'SRS', 'DFM', 'DFMEA', 'POC', 'BMC', 'ML', 'MLE', 'MAP', 'MAE', 'RMSE', 'ROC', 'AUC', 'ID3', 'MDS', 'LASSO', 'RIDGE', 'SSE', 'AC3', 'FOL', 'POP3', 'IMAP', 'MX', 'TTL', 'DHT', 'QOS', 'RPF', 'IGMP', 'RSVP', 'DSCP', 'WFQ', 'PIM', 'DVMRP', 'FDM', 'TDM', 'WDM', 'BER', 'SMI', 'MIB', 'ASN1', 'DAG', 'IPV4', 'IPV6', 'CIDR', 'NAT', 'ICMP', 'OSPF', 'RIP', 'BGP']);

export function titleCaseSlug(slug) {
  return slug.replace(/_/g, ' ').split(' ').map(w => {
    const up = w.toUpperCase();
    if (ACRONYMS.has(up)) return up;
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}

// Topic titles derive display titles from file names
// (discovery-adjacent naming convention m{mod}_{seq}_{slug}.md).
export function formatTopicTitle(filename) {
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

export function renderNavTree(modules, currentMod, currentId) {
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

// Static subject-detail blocks for the dashboard Topics step
// (Years → Semesters → Subjects → Topics). Generated from the same
// coursesData as the topic pages, so lists can never drift from content.
// Links use the root-mode `dist/` prefix; the dist-copy rewrite in the
// build converts them to `./` for artifact mode, exactly like
// hand-written cards.
// dashboardOrder comes from data/curriculum.json (matches the Year →
// Semester layout in index.html; unknown codes append alphabetically so
// new courses never silently vanish) and is passed in by the caller.
export function renderSubjectDetails(coursesData, dashboardOrder = []) {
  const codes = [
    ...dashboardOrder.filter((c) => coursesData[c]),
    ...Object.keys(coursesData).filter((c) => !dashboardOrder.includes(c)).sort()
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

export function renderTemplate(templateStr, data) {
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

// Topic-page header (badges + quick-jump bar) prepended to every topic body.
export function renderTopicHeader({ modNum, readTime, jumpBar }) {
  return `<div class="topic-header">
  <div class="topic-badges">
    <span class="badge badge-accent">MODULE ${escapeHtml(String(modNum))}</span>
    <span class="badge">⏱️ ${escapeHtml(String(readTime))} MIN READ</span>
    <span class="badge badge-gold">🟢 BEGINNER FRIENDLY</span>
    <span class="badge">🎯 KTU 2024 SCHEME</span>
  </div>
  ${jumpBar}
</div>\n`;
}

// Full topic-page HTML assembly: header + rendered body through the base
// template. Markdown/widget parsing happens before this call; filenames,
// URLs, escaping, and template behavior are preserved exactly.
export function renderTopicDocument({
  templateStr,
  page,
  modNum,
  modules,
  prevPage,
  nextPage,
  totalTopics,
  courseCode,
  courseName,
  renderedHtmlBody,
  jumpBar,
  readTime,
}) {
  const headerPrefix = renderTopicHeader({ modNum, readTime, jumpBar });
  const fullContent = headerPrefix + renderedHtmlBody;
  return renderTemplate(templateStr, {
    content: fullContent,
    title: page.title,
    current_id: page.id,
    current_mod: modNum,
    modules,
    prev_page: prevPage,
    next_page: nextPage,
    total_topics: totalTopics,
    course_code: courseCode,
    course_name: courseName,
  });
}
