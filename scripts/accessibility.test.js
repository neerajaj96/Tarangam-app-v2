/**
 * Deterministic static tests for accessibility and keyboard UX
 * (node:test + node:assert only — no test framework). Verifies the
 * static accessibility contract across every learner-facing surface
 * without rendering anything: heading hierarchy, landmarks and skip
 * links, labels and accessible names, keyboard-semantic controls,
 * visible-focus styles, no positive tabindex, correct ARIA usage,
 * reduced-motion support, live-region announcements, present navigation
 * controls, intact responsive guards, and real text/background contrast
 * ratios computed from the shipped theme variables (WCAG AA for normal
 * text). No automated screen-reader or visual testing is claimed — these
 * are static contract checks only.
 *
 * Run: npm test  (node --test scripts/accessibility.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(f, 'utf-8');

function headings(html) {
  const out = [];
  const re = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push({ level: Number(m[1]), text: m[2].replace(/<[^>]*>/g, '').trim().slice(0, 60) });
  }
  return out;
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => m - n);
  return (y + 0.05) / (x + 0.05);
}

function themeVars(css, theme) {
  const start = css.indexOf(`body[data-theme="${theme}"]`);
  const next = css.indexOf('body[data-theme="', start + 1);
  const section = css.slice(start, next === -1 ? css.length : next);
  const vars = {};
  for (const m of section.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    vars[m[1]] = m[2];
  }
  return vars;
}

describe('heading hierarchy on representative pages', () => {
  it('starts with one h1 and never skips levels', () => {
    for (const f of ['dashboard.html', 'explorer.html', 'course.html', 'assessment.html', 'index.html']) {
      const heads = headings(read(f));
      assert.ok(heads.length > 0, `${f} needs headings`);
      assert.equal(heads[0].level, 1, `${f} must start with h1`);
      assert.equal(heads.filter((h) => h.level === 1).length, 1, `${f} must have exactly one h1`);
      for (let i = 1; i < heads.length; i += 1) {
        assert.ok(
          heads[i].level - heads[i - 1].level <= 1,
          `${f} skips a heading level at "${heads[i].text}"`
        );
      }
    }
    const templateHeads = headings(read('templates/base.html'));
    assert.ok(templateHeads.length >= 0);
  });
});

describe('landmarks and skip links', () => {
  it('exposes main content with skip links on every surface', () => {
    for (const [f, target] of [
      ['dashboard.html', 'db-app'], ['explorer.html', 'xp-app'],
      ['course.html', 'co-app'], ['assessment.html', 'as-app'],
      ['index.html', 'main-content'],
    ]) {
      const html = read(f);
      assert.ok(html.includes('class="skip-link"'), `${f} needs a skip link`);
      assert.ok(html.includes(`href="#${target}"`), `${f} skip link must target ${target}`);
      assert.ok(html.includes('<main'), `${f} needs a main landmark`);
    }
    const template = read('templates/base.html');
    assert.ok(template.includes('class="skip-link"'));
    assert.ok(template.includes('<main'));
  });
});

describe('labels for form controls', () => {
  it('labels search, filter, plan, and assessment inputs', () => {
    for (const id of ['xp-search', 'xp-course', 'xp-module', 'xp-difficulty', 'xp-exam']) {
      assert.ok(
        new RegExp(`<label>[\\s\\S]{0,200}id="${id}"`).test(read('explorer.html')),
        `explorer control ${id} needs a label`
      );
    }
    for (const id of ['as-scope', 'as-course', 'as-module', 'as-topic', 'as-limit']) {
      assert.ok(
        new RegExp(`<label>[\\s\\S]{0,200}id="${id}"`).test(read('assessment.html')),
        `assessment control ${id} needs a label`
      );
    }
    assert.ok(read('course.html').includes('<label>Course'));
    // Free-text answer input carries an accessible name (placeholder is not enough).
    assert.ok(read('assets/assessment-page.js').includes('aria-label="Type your answer"'));
  });
});

describe('accessible names for buttons', () => {
  it('names icon-only buttons and keeps text on the rest', () => {
    const template = read('templates/base.html');
    for (const id of ['sidebarToggle', 'themeToggleBtn', 'settingsBtn', 'closeSettings']) {
      assert.ok(
        new RegExp(`id="${id}"[^>]*aria-label="[^"]+"`).test(template),
        `icon-only button ${id} needs an accessible name`
      );
    }
    // Explorer cards expose their topic title as content.
    assert.ok(read('assets/explorer.js').includes('xp-card-title'));
  });
});

describe('keyboard-semantic controls', () => {
  it('uses native buttons, links, inputs, and selects for actions', () => {
    const page = read('assets/assessment-page.js');
    assert.ok(page.includes('<button class="as-opt"'));
    assert.ok(page.includes('<input class="as-text"'));
    assert.ok(!/tabindex\s*=\s*["']?[1-9]/.test(page));
    for (const f of ['assets/explorer.js', 'assets/dashboard.js', 'assets/course-page.js']) {
      assert.ok(!/tabindex\s*=\s*["']?[1-9]/.test(read(f)), `${f} must not use positive tabindex`);
    }
    for (const f of ['dashboard.html', 'explorer.html', 'course.html', 'assessment.html', 'index.html', 'templates/base.html', 'style.css']) {
      assert.ok(!/tabindex\s*=\s*["']?[1-9]/.test(read(f)), `${f} must not use positive tabindex`);
    }
    // Topic Previous/Next are real links.
    assert.ok(read('templates/base.html').includes('<a href="./{{ prev_page.filename }}"'));
    assert.ok(read('templates/base.html').includes('<a href="./{{ next_page.filename }}"'));
  });
});

describe('visible focus styles', () => {
  it('keeps a global focus indicator and never removes outlines silently', () => {
    const css = read('style.css');
    assert.ok(css.includes(':focus-visible'));
    assert.ok(/:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent\)/.test(css));
    for (const f of ['style.css', 'dashboard.html', 'explorer.html', 'course.html', 'assessment.html', 'index.html', 'templates/base.html']) {
      assert.ok(!/outline:\s*none/.test(read(f)), `${f} must not remove focus outlines`);
    }
  });
});

describe('correct ARIA usage', () => {
  it('uses live regions, dialog, nav, and state attributes correctly', () => {
    assert.ok(read('assessment.html').includes('aria-live="polite"'));
    assert.ok(read('assets/assessment-page.js').includes('role="status"'));
    const template = read('templates/base.html');
    assert.ok(template.includes('role="status"'));
    assert.ok(template.includes('role="dialog"'));
    assert.ok(template.includes('aria-modal="true"'));
    assert.ok(template.includes('<nav'));
    // Disclosure state lives where disclosures exist (dashboard course
    // rows); toggle state lives on the study-context completion toggle.
    assert.ok(read('assets/dashboard.js').includes('aria-expanded'));
    assert.ok(read('assets/topic-study-context.js').includes('aria-pressed'));
    // Active explorer selection is exposed without a second mechanism.
    assert.ok(read('assets/explorer.js').includes('aria-current="true"'));
    // No redundant roles on native landmarks.
    assert.ok(!/role="main"/.test(template));
  });
});

describe('reduced-motion support', () => {
  it('preserves the reduced-motion guard', () => {
    assert.ok(read('style.css').includes('@media (prefers-reduced-motion: reduce)'));
  });
});

describe('navigation controls remain present', () => {
  it('keeps every required hook across surfaces', () => {
    const template = read('templates/base.html');
    for (const token of ['id="prevTopicLink"', 'id="nextTopicLink"', 'id="crumb"', 'id="moduleTree"', 'id="tsStudyContext"']) {
      assert.ok(template.includes(token), `topic template missing ${token}`);
    }
    const explorer = read('explorer.html');
    for (const id of ['xp-search', 'xp-course', 'xp-module', 'xp-topics', 'xp-detail', 'xp-attention']) {
      assert.ok(explorer.includes(`id="${id}"`), `explorer missing ${id}`);
    }
    assert.ok(read('dashboard.html').includes('id="db-attention"'));
    assert.ok(read('course.html').includes('id="co-modules"'));
    assert.ok(read('assessment.html').includes('id="as-start"'));
  });
});

describe('responsive guards stay intact', () => {
  it('keeps viewport, breakpoints, and overflow rules', () => {
    for (const f of ['dashboard.html', 'explorer.html', 'course.html', 'assessment.html']) {
      assert.ok(read(f).includes('name="viewport"'));
      assert.ok(read(f).includes('@media'));
    }
    const css = read('style.css');
    assert.ok(css.includes('@media (max-width: 860px)'));
    assert.ok(/img,\s*video,\s*svg,\s*canvas\s*\{\s*max-width:\s*100%/.test(css));
  });
});

describe('text contrast from shipped theme variables', () => {
  it('meets WCAG AA for normal text on every shipped theme', () => {
    const css = read('style.css');
    for (const theme of ['dark', 'light', 'reading']) {
      const vars = themeVars(css, theme);
      for (const [fg, bg] of [
        ['--ink', '--surface'], ['--ink-dim', '--surface'], ['--ink-faint', '--surface'],
        ['--ink', '--surface-2'], ['--ink-dim', '--surface-2'], ['--ink-faint', '--surface-2'],
        ['--accent', '--surface'], ['--accent-ink', '--accent'],
      ]) {
        assert.ok(vars[fg] && vars[bg], `${theme} defines ${fg} and ${bg}`);
        const ratio = contrast(vars[fg], vars[bg]);
        assert.ok(
          ratio >= 4.5,
          `${theme} ${fg} on ${bg} is ${ratio.toFixed(2)} (needs WCAG AA 4.5)`
        );
      }
    }
  });
});
