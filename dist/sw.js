/**
 * Tarangam static offline layer (Service Worker, no dependencies).
 *
 * Static-first PWA support for local development and GitHub Pages:
 * caches the application shell, serves generated topic/course pages
 * offline, keeps curriculum data fresh with a network-first data lane,
 * and falls back to offline.html for uncached navigations.
 *
 * Deterministic cache-version strategy: TARANGAM_CACHE_VERSION names
 * every cache this worker owns. At build time scripts/output.js replaces
 * tarangam-f34e84ac65bf with `tarangam-<12 hex chars>`, a content hash over
 * the shell file list below plus curriculum data, templates, entry pages,
 * and topic content (see computeServiceWorkerVersion). Any deploy that
 * changes what the user sees therefore mints a new version, activates it
 * immediately via skipWaiting/clients.claim, and purges the previous
 * generation on activate — obsolete shell or curriculum data can never be
 * served indefinitely. There is no manual bump step and none is needed:
 * the version is a pure function of the shipped bytes. Unbuilt checkouts
 * keep the placeholder (development only; file:// cannot run workers).
 *
 * Learner state is NEVER cached here: progress lives in browser storage,
 * which service workers cannot observe; this worker only stores HTTP
 * responses. No IndexedDB, no backend, no sync, no polling.
 */

const TARANGAM_CACHE_VERSION = 'tarangam-f34e84ac65bf';
const SHELL_CACHE = `${TARANGAM_CACHE_VERSION}::shell`;
const CONTENT_CACHE = `${TARANGAM_CACHE_VERSION}::content`;
const DATA_CACHE = `${TARANGAM_CACHE_VERSION}::data`;
const OFFLINE_URL = 'offline.html';

// Application shell pinned at install time: every local runtime module
// reachable from the entry surfaces (dashboard, explorer, course,
// assessment, topic study context), so an offline first visit after
// install never faults on a sub-import. Same-directory relative URLs so
// the worker installs identically at the domain root (local dev) and
// under a Pages project subpath. The list is the transitive local-import
// closure of the entry modules; scripts/pwa-offline.test.js enforces that
// no reachable module is missing here.
const SHELL_URLS = [
  './',
  'index.html',
  'dashboard.html',
  'explorer.html',
  'course.html',
  'assessment.html',
  'offline.html',
  'manifest.webmanifest',
  'style.css',
  'assets/adaptive-learning.js',
  'assets/assessment-page.js',
  'assets/assessment.js',
  'assets/course-overview.js',
  'assets/course-page.js',
  'assets/curriculum-data.js',
  'assets/dashboard.js',
  'assets/exam-readiness.js',
  'assets/explorer.js',
  'assets/learner-path.js',
  'assets/learner-state.js',
  'assets/learner-state-schema.js',
  'assets/learner-state-backup.js',
  'assets/learning-analytics.js',
  'assets/learning-journey.js',
  'assets/pwa-register.js',
  'assets/revision.js',
  'assets/study-planner.js',
  'assets/topic-intelligence.js',
  'assets/topic-study-context.js',
  'assets/weak-topic-analysis.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

function staleOwnCache(name) {
  // Only caches minted by a previous Tarangam worker generation are ever
  // removed; foreign caches on the same origin are left untouched.
  return typeof name === 'string'
    && name.startsWith('tarangam-')
    && name !== SHELL_CACHE
    && name !== CONTENT_CACHE
    && name !== DATA_CACHE;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter(staleOwnCache).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
      .catch(() => self.clients.claim())
  );
});

function isSameOrigin(url) {
  try {
    return new URL(url).origin === self.location.origin;
  } catch {
    return false;
  }
}

function isDataRequest(url, accept) {
  if (url.pathname.endsWith('data/topic-manifest.json')
    || url.pathname.endsWith('data/assessments.json')) {
    return true;
  }
  return typeof accept === 'string' && accept.includes('application/json');
}

// Curriculum data lane: network first (fresh syllabus when online),
// cache fallback (usable offline). Responses are stored for later.
function serveData(event, cacheName) {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(cacheName).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((hit) => {
        if (hit) return hit;
        return Response.json({ error: 'offline' }, { status: 503 });
      }))
  );
}

// Shell/content lane: cache first (instant static pages), network
// fallback with runtime caching, offline page as the last resort for
// navigations.
function serveStatic(event, cacheName, isNavigation) {
  event.respondWith(
    caches.match(event.request).then((hit) => {
      if (hit) return hit;
      return fetch(event.request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(cacheName).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      }).catch(() => {
        if (isNavigation) {
          return caches.match(OFFLINE_URL).then((fallback) => {
            if (fallback) return fallback;
            return Response.json({ error: 'offline' }, { status: 503 });
          });
        }
        return Response.json({ error: 'offline' }, { status: 503 });
      });
    })
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  let url = null;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  // Cross-origin (fonts, CDNs) passes through untouched: never cached,
  // never blocked — the app degrades to system fallbacks offline.
  if (!isSameOrigin(request.url)) return;
  const accept = request.headers.get('accept') || '';
  if (isDataRequest(url, accept)) {
    serveData(event, DATA_CACHE);
    return;
  }
  const isNavigation = request.mode === 'navigate'
    || (accept.includes('text/html') && request.destination === 'document');
  serveStatic(event, request.destination === 'document' ? CONTENT_CACHE : SHELL_CACHE, isNavigation);
});
