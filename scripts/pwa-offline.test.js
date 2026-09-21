/**
 * Deterministic static tests for the offline/PWA foundation (node:test +
 * node:assert only — no test framework). Verifies the web manifest, the
 * versioned service worker, the offline fallback, build publishing to
 * dist/, Pages-relative paths, graceful registration, absence of any
 * backend learner-state mechanism, shell-closure completeness, content-
 * hash version determinism, the event-driven offline indicator, the
 * developer doc, and that the accessibility and responsive suites remain
 * wired. Static contract checks only — no live service-worker execution
 * and no manual browser walkthrough are claimed.
 *
 * Run: npm test  (node --test scripts/pwa-offline.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { computeServiceWorkerVersion, SERVICE_WORKER_VERSION_TOKEN } from './output.js';

const read = (f) => fs.readFileSync(f, 'utf-8');

function pngSize(path) {
  const d = fs.readFileSync(path);
  assert.deepEqual(d.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), `${path} must be a PNG`);
  return { width: d.readUInt32BE(16), height: d.readUInt32BE(20) };
}

// Transitive local JS imports reachable from a browser entry module.
function localImports(entry) {
  const seen = new Set();
  const walk = (file) => {
    if (seen.has(file) || !fs.existsSync(file)) return;
    seen.add(file);
    for (const m of read(file).matchAll(/from\s+['"](\.\.?\/[^'"]+\.js)['"]/g)) {
      walk(path.normalize(path.join(path.dirname(file), m[1])));
    }
  };
  walk(entry);
  return seen;
}

describe('web app manifest', () => {
  it('exists, parses, and carries installable metadata with relative paths', () => {
    assert.ok(fs.existsSync('manifest.webmanifest'));
    const manifest = JSON.parse(read('manifest.webmanifest'));
    for (const key of ['name', 'short_name', 'description', 'start_url', 'display', 'theme_color', 'background_color', 'icons']) {
      assert.ok(manifest[key], `manifest needs "${key}"`);
    }
    assert.ok(manifest.start_url.startsWith('./') || manifest.start_url.startsWith('index.html'));
    assert.ok(!manifest.start_url.startsWith('/') && !manifest.start_url.startsWith('http'));
    assert.ok(!manifest.scope || (!manifest.scope.startsWith('/') && !manifest.scope.startsWith('http')));
    assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2);
    for (const icon of manifest.icons) {
      assert.ok(icon.src && icon.sizes, 'each icon needs src and sizes');
      assert.ok(!icon.src.startsWith('/') && !icon.src.startsWith('http'), 'icon paths must stay Pages-relative');
      assert.ok(fs.existsSync(icon.src), `icon file ${icon.src} must exist`);
    }
  });

  it('ships real raster icons at installable sizes', () => {
    assert.deepEqual(pngSize('icons/icon-192.png'), { width: 192, height: 192 });
    assert.deepEqual(pngSize('icons/icon-512.png'), { width: 512, height: 512 });
    assert.deepEqual(pngSize('icons/icon-maskable-512.png'), { width: 512, height: 512 });
  });
});

describe('versioned service worker', () => {
  it('exists with a deterministic cache-version strategy', () => {
    assert.ok(fs.existsSync('sw.js'));
    const sw = read('sw.js');
    assert.ok(/const TARANGAM_CACHE_VERSION = '[^']+'/.test(sw));
    assert.ok(sw.includes('SHELL_CACHE') && sw.includes('CONTENT_CACHE') && sw.includes('DATA_CACHE'));
    assert.ok(sw.includes('self.skipWaiting()'));
    assert.ok(sw.includes('self.clients.claim()'));
    // Stale generations are purged on activate (no indefinite obsolete data).
    assert.ok(sw.includes('caches.delete'));
    assert.ok(sw.includes('staleOwnCache') || sw.includes('ownedCache'));
  });

  it('wires install, fetch, data freshness, and the offline fallback', () => {
    const sw = read('sw.js');
    assert.ok(sw.includes("addEventListener('install'"));
    assert.ok(sw.includes("addEventListener('activate'"));
    assert.ok(sw.includes("addEventListener('fetch'"));
    assert.ok(sw.includes('SHELL_URLS'));
    for (const shell of ['index.html', 'dashboard.html', 'explorer.html', 'course.html', 'assessment.html', 'offline.html', 'manifest.webmanifest', 'style.css']) {
      assert.ok(sw.includes(`'${shell}'`), `shell must pin ${shell}`);
    }
    assert.ok(sw.includes('OFFLINE_URL'));
    assert.ok(sw.includes('offline.html'));
    assert.ok(sw.includes('caches.match(OFFLINE_URL)'));
  });

  it('uses Pages-relative URLs and never touches learner state', () => {
    const sw = read('sw.js');
    assert.ok(!/['"]\/(?!\/)[^'"]*['"]/.test(sw), 'no root-absolute URLs in the worker');
    for (const banned of ['localStorage', 'indexedDB', 'tarangam_topic_state_v1', 'tarangam_visited_', 'openai', 'anthropic', 'setInterval']) {
      assert.ok(!sw.includes(banned), `worker must not contain ${banned}`);
    }
  });
});

describe('offline fallback page', () => {
  it('renders a self-contained honest fallback with working links', () => {
    assert.ok(fs.existsSync('offline.html'));
    const html = read('offline.html');
    assert.ok(html.includes('name="viewport"'));
    assert.ok(html.includes('<main'));
    assert.ok(html.includes('./index.html'));
    assert.ok(html.includes('./dashboard.html'));
    assert.ok(html.includes('progress is stored only on this device') || html.includes('stored only on this device'));
    assert.ok(html.includes('<style>'), 'fallback must render with zero cached assets');
  });
});

describe('graceful registration on entry pages', () => {
  it('registers from a shared script on every entry point without blocking', () => {
    assert.ok(fs.existsSync('assets/pwa-register.js'));
    const reg = read('assets/pwa-register.js');
    assert.ok(reg.includes("'serviceWorker' in navigator"));
    assert.ok(reg.includes("register('sw.js')"));
    assert.ok(reg.includes('try'));
    for (const f of ['index.html', 'dashboard.html', 'explorer.html', 'course.html', 'assessment.html']) {
      const html = read(f);
      assert.ok(html.includes('assets/pwa-register.js'), `${f} must include registration`);
      assert.ok(html.includes('rel="manifest"'), `${f} must link the manifest`);
      assert.ok(html.includes('name="theme-color"'), `${f} must declare a theme color`);
    }
  });
});

describe('build publishes PWA files to dist/', () => {
  it('ships byte-identical worker, manifest, fallback, and icons', () => {
    for (const f of ['dist/manifest.webmanifest', 'dist/sw.js', 'dist/offline.html', 'dist/icons/icon-192.png', 'dist/icons/icon-512.png', 'dist/icons/icon-maskable-512.png']) {
      assert.ok(fs.existsSync(f), `${f} must ship to Pages (run npm run build:notes)`);
    }
    assert.equal(read('dist/manifest.webmanifest'), read('manifest.webmanifest'));
    assert.equal(read('dist/offline.html'), read('offline.html'));
    assert.ok(read('scripts/output.js').includes('copyPwaAssets'));
    assert.ok(read('scripts/build.js').includes('copyPwaAssets'));
    assert.ok(read('scripts/build.js').includes('injectServiceWorkerVersion'));
  });

  it('stamps a deterministic content-hash version into the published worker', () => {
    const source = read('sw.js');
    assert.ok(source.includes(SERVICE_WORKER_VERSION_TOKEN), 'source keeps the injection token');
    const dist = read('dist/sw.js');
    assert.ok(!dist.includes(SERVICE_WORKER_VERSION_TOKEN), 'published worker must carry a minted version');
    const expected = computeServiceWorkerVersion();
    assert.match(expected, /^tarangam-[0-9a-f]{12}$/);
    assert.ok(dist.includes(`'${expected}'`), 'published version must equal the recomputed content hash');
    assert.equal(dist, source.split(SERVICE_WORKER_VERSION_TOKEN).join(expected));
    assert.equal(computeServiceWorkerVersion(), computeServiceWorkerVersion());
  });
});

describe('shell closure completeness', () => {
  it('precaches every local runtime module reachable from entry surfaces', () => {
    const sw = read('sw.js');
    const shellBlock = sw.split('SHELL_URLS')[1] || '';
    const pinned = new Set(
      [...shellBlock.matchAll(/'([^']+)'/g)]
        .map((m) => (m[1].startsWith('./') ? m[1].slice(2) : m[1]))
        .filter((p) => p.endsWith('.js') && fs.existsSync(p))
    );
    const entries = [
      'assets/dashboard.js', 'assets/explorer.js', 'assets/course-page.js',
      'assets/assessment-page.js', 'assets/topic-study-context.js',
    ];
    const reachable = new Set();
    for (const entry of entries) {
      for (const file of localImports(entry)) {
        if (file.endsWith('.js')) reachable.add(file);
      }
    }
    const missing = [...reachable].filter((f) => !pinned.has(f));
    assert.deepEqual(missing, [], `shell must pin every reachable module (missing: ${missing.join(', ')})`);
    // Representative generated topic pages resolve through cached lanes.
    assert.ok(sw.includes('CONTENT_CACHE'));
    assert.ok(sw.includes("request.destination === 'document'"));
  });
});

describe('event-driven offline indicator', () => {
  it('announces offline status without polling or state', () => {
    const reg = read('assets/pwa-register.js');
    assert.ok(reg.includes("addEventListener('online'"));
    assert.ok(reg.includes("addEventListener('offline'"));
    assert.ok(reg.includes('net-status'));
    assert.ok(reg.includes("setAttribute('role', 'status')"));
    assert.ok(!reg.includes('setInterval'));
    assert.ok(!reg.includes('localStorage'));
    const css = read('style.css');
    assert.ok(css.includes('.net-status'));
    assert.ok(css.includes('.net-status[hidden]'));
  });
});

describe('offline reliability documentation', () => {
  it('documents layers, behavior, versioning, and the manual walkthrough', () => {
    assert.ok(fs.existsSync('docs/offline-reliability.md'));
    const doc = read('docs/offline-reliability.md');
    for (const token of ['cache-first', 'Network-first', 'computeServiceWorkerVersion', 'never cached', 'GitHub Pages', 'walkthrough', 'skipWaiting']) {
      assert.ok(doc.toLowerCase().includes(token.toLowerCase()), `doc must cover ${token}`);
    }
  });
});

describe('no backend learner-state mechanism', () => {
  it('keeps learner state in localStorage with no network dependency', () => {
    const state = read('assets/learner-state.js');
    assert.ok(!state.includes('fetch('));
    assert.ok(!state.includes('XMLHttpRequest'));
    assert.ok(!state.includes('indexedDB'));
    assert.ok(state.includes('tarangam_topic_state_v1'));
  });
});

describe('existing suites remain wired', () => {
  it('keeps accessibility, responsive, and assessment coverage in the suite', () => {
    const pkg = JSON.parse(read('package.json'));
    for (const name of ['accessibility.test.js', 'responsive-ux.test.js', 'assessment.test.js', 'course-overview.test.js', 'topic-navigation.test.js', 'pwa-offline.test.js']) {
      assert.ok(pkg.scripts.test.includes(name), `suite must keep ${name}`);
    }
    assert.ok(fs.existsSync('docs/assessment-coverage.md'));
  });
});
