/**
 * Tarangam static offline layer (Service Worker, no dependencies).
 *
 * Static-first PWA support for local development and GitHub Pages:
 * caches the application shell, serves generated topic/course pages
 * offline, keeps curriculum data fresh with a network-first data lane,
 * and falls back to offline.html for uncached navigations.
 *
 * Deterministic cache-version strategy: TARANGAM_CACHE_VERSION names
 * every cache this worker owns. On activate, any cache NOT carrying the
 * current version is deleted, so obsolete curriculum data can never be
 * served indefinitely — a deploy ships a bumped version and old entries
 * disappear on the next activation. Bump the version whenever the shell
 * file list or the fetch strategy below changes.
 *
 * Learner state is NEVER cached here: progress lives in browser storage,
 * which service workers cannot observe; this worker only stores HTTP
 * responses. No IndexedDB, no backend, no sync, no polling.
 */

const TARANGAM_CACHE_VERSION = 'tarangam-v1';
const SHELL_CACHE = `${TARANGAM_CACHE_VERSION}::shell`;
const CONTENT_CACHE = `${TARANGAM_CACHE_VERSION}::content`;
const DATA_CACHE = `${TARANGAM_CACHE_VERSION}::data`;
const OFFLINE_URL = 'offline.html';

// Application shell pinned at install time. Same-directory relative URLs
// so the worker installs identically at the domain root (local dev) and
// under a Pages project subpath.
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
  'assets/curriculum-data.js',
  'assets/learner-state.js',
  'assets/topic-intelligence.js',
  'assets/learning-journey.js',
  'assets/dashboard.js',
  'assets/explorer.js',
  'assets/course-page.js',
  'assets/course-overview.js',
  'assets/assessment.js',
  'assets/assessment-page.js',
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
