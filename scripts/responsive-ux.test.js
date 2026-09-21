/**
 * Deterministic static tests for responsive learning UX (node:test +
 * node:assert only — no test framework). Verifies narrow-screen hardening
 * across every learner-facing surface without rendering anything: viewport
 * declarations, responsive rules per surface, overflow guards, wrapping
 * titles/breadcrumbs, touch-sized controls, navigation controls, and
 * representative generated pages (many-topic course, few-topic course,
 * longest title, assessment, dashboard, explorer). CSS-only changes —
 * behavior covered by the existing suites, which must stay green.
 *
 * Run: npm test  (node --test scripts/responsive-ux.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildTopicManifest } from './topic-manifest.js';
import { loadTopicSchema } from './topic-metadata.js';
import { loadCurriculum } from './curriculum.js';

const read = (f) => fs.readFileSync(f, 'utf-8');

function styleBlocks(html) {
  const out = [];
  const re = /<style>([\s\S]*?)<\/style>/g;
  let m;
  while ((m = re.exec(html)) !== null) out.push(m[1]);
  return out.join('\n');
}

describe('viewport declarations', () => {
  it('declares responsive viewports on every learner surface', () => {
    for (const f of ['dashboard.html', 'explorer.html', 'course.html', 'assessment.html', 'index.html']) {
      assert.ok(read(f).includes('name="viewport"'), `${f} needs a viewport`);
      assert.ok(read(f).includes('width=device-width'), `${f} viewport must track device width`);
    }
    assert.ok(read('templates/base.html').includes('name="viewport"'));
  });
});

describe('responsive rules per surface', () => {
  it('collapses multi-column layouts at narrow widths', () => {
    assert.ok(read('explorer.html').includes('@media (max-width: 900px)'));
    assert.ok(read('explorer.html').includes('@media (max-width: 640px)'));
    assert.ok(read('course.html').includes('@media (max-width: 900px)'));
    assert.ok(read('course.html').includes('@media (max-width: 640px)'));
    assert.ok(read('dashboard.html').includes('@media (max-width: 640px)'));
    assert.ok(read('assessment.html').includes('@media (max-width: 640px)'));
    assert.ok(read('style.css').includes('@media (max-width: 860px)'));
    // Explorer cards and dashboard rows stack instead of squeezing.
    const xp = styleBlocks(read('explorer.html'));
    assert.ok(xp.includes('.xp-card { grid-template-columns: 1fr; }'));
    assert.ok(styleBlocks(read('dashboard.html')).includes('.db-course-head { flex-wrap: wrap; }'));
  });

  it('uses max-width shells instead of fixed page widths', () => {
    for (const f of ['dashboard.html', 'explorer.html', 'course.html', 'assessment.html']) {
      assert.ok(styleBlocks(read(f)).includes('.xp-shell { max-width: 1120px'), `${f} shell must be max-width`);
    }
    const css = read('style.css');
    assert.ok(!/width:\s*100vw/.test(css), 'no viewport-width traps in shared styles');
    for (const f of ['dashboard.html', 'explorer.html', 'course.html', 'assessment.html']) {
      assert.ok(!/width:\s*100vw/.test(styleBlocks(read(f))), `no viewport-width traps in ${f}`);
    }
  });
});

describe('overflow guards', () => {
  it('keeps media, tables, and code inside narrow viewports', () => {
    const css = read('style.css');
    assert.ok(/img,\s*video,\s*svg,\s*canvas\s*\{\s*max-width:\s*100%/.test(css));
    assert.ok(css.includes('.content table') && css.includes('overflow-x: auto'));
    assert.ok(css.includes('mjx-container'));
    const assessment = styleBlocks(read('assessment.html'));
    assert.ok(assessment.includes('.as-opt') && assessment.includes('width: 100%'));
  });

  it('wraps long titles, navigation labels, and breadcrumbs', () => {
    const css = read('style.css');
    assert.ok(css.includes('.topic-title') && css.includes('overflow-wrap: break-word'));
    assert.ok(css.includes('.nav-card .ttl') && css.includes('overflow-wrap: break-word'));
    assert.ok(/\.crumb\s*\{[^}]*flex-wrap:\s*wrap/.test(css));
    assert.ok(styleBlocks(read('explorer.html')).includes('.xp-card-title'));
    assert.ok(styleBlocks(read('course.html')).includes('.co-topic-title'));
    assert.ok(styleBlocks(read('assessment.html')).includes('.as-q-title'));
  });
});

describe('touch usability without hover dependence', () => {
  it('sizes essential controls for touch and keeps them semantic', () => {
    for (const f of ['dashboard.html', 'explorer.html', 'course.html', 'assessment.html']) {
      assert.ok(styleBlocks(read(f)).includes('min-height: 44px'), `${f} needs touch-sized controls`);
    }
    const css = read('style.css');
    assert.ok(css.includes('.ts-complete') && css.includes('min-height: 44px'));
    assert.ok(css.includes('.quiz-option-btn') && css.includes('min-height: 44px'));
    // Assessment controls are real buttons/inputs (keyboard and touch
    // operable), never hover-only divs.
    const assessment = read('assessment.html');
    assert.ok(assessment.includes('id="as-start"'));
    assert.ok(assessment.includes('id="as-questions"'));
    assert.ok(read('assets/assessment-page.js').includes('class="as-opt"'));
    assert.ok(read('assets/assessment-page.js').includes('as-text'));
  });
});

describe('navigation controls remain present', () => {
  it('keeps Previous/Next, breadcrumb, filter, and section hooks', () => {
    const template = read('templates/base.html');
    assert.ok(template.includes('id="prevTopicLink"'));
    assert.ok(template.includes('id="nextTopicLink"'));
    assert.ok(template.includes('id="crumb"'));
    assert.ok(template.includes('course.html?course='));
    const explorer = read('explorer.html');
    for (const id of ['xp-search', 'xp-course', 'xp-module', 'xp-difficulty', 'xp-exam', 'xp-journey', 'xp-examview', 'xp-review', 'xp-assessment', 'xp-attention', 'xp-topics', 'xp-detail']) {
      assert.ok(explorer.includes(`id="${id}"`), `explorer missing ${id}`);
    }
    assert.ok(read('dashboard.html').includes('id="db-courses"'));
    assert.ok(read('course.html').includes('id="co-course"'));
    assert.ok(read('course.html').includes('id="co-modules"'));
  });
});

describe('representative generated pages', () => {
  const schema = loadTopicSchema();
  const curriculumDoc = loadCurriculum();
  const manifest = buildTopicManifest({ curriculumDoc, schema });

  it('links every topic of a many-topic and a few-topic course to built pages', () => {
    for (const courseCode of ['PCCST501', 'PCCST503']) {
      const topics = manifest.topics.filter((t) => t.courseCode === courseCode);
      assert.ok(topics.length >= 20, `${courseCode} is a representative sample`);
      for (const t of topics) {
        assert.ok(fs.existsSync(`dist/${t.courseCode}/${t.id}.html`), `built page for ${t.courseCode}/${t.id}`);
      }
    }
  });

  it('renders the longest title with breadcrumb and boundary navigation', () => {
    const longest = [...manifest.topics].sort((a, b) => b.title.length - a.title.length)[0];
    assert.equal(longest.courseCode, 'PECST522');
    const html = read(`dist/${longest.courseCode}/${longest.id}.html`);
    assert.ok(html.includes('id="crumb"'));
    assert.ok(html.includes(`course.html?course=${longest.courseCode}`));
    assert.ok(html.includes('id="prevTopicLink"') || html.includes('id="nextTopicLink"'));
    assert.ok(html.includes('name="viewport"'));
  });

  it('ships dashboard, explorer, assessment, and course entry points', () => {
    for (const f of ['dist/dashboard.html', 'dist/explorer.html', 'dist/assessment.html', 'dist/course.html']) {
      assert.ok(fs.existsSync(f), `${f} must ship to Pages`);
      assert.ok(read(f).includes('name="viewport"'), `${f} must stay responsive`);
    }
  });
});
