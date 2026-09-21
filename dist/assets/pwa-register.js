/**
 * Tarangam service worker registration (classic script, no dependencies,
 * no modules). Included with `defer` on the entry pages (index,
 * dashboard, explorer, course, assessment) so any visit registers the
 * offline layer once per scope. Fails gracefully everywhere service
 * workers are unavailable (private modes, old browsers, file://): the
 * app runs exactly as before, online only. Never throws, never blocks
 * rendering, never touches learner state.
 *
 * Offline indication (no polling, no state): listens for the browser's
 * native `online`/`offline` events and toggles a small non-intrusive
 * banner plus a `data-network` hook on <html> for styling. The banner
 * element is created once, only when first needed, and hidden again on
 * reconnect. Online operation is never interfered with.
 */
(function () {
  function wireOfflineIndicator() {
    try {
      if (typeof window === 'undefined' || typeof document === 'undefined') return;
      if (typeof window.addEventListener !== 'function') return;
      var banner = null;
      var setOffline = function (offline) {
        try {
          if (document.documentElement && document.documentElement.dataset) {
            if (offline) document.documentElement.dataset.network = 'offline';
            else delete document.documentElement.dataset.network;
          }
          if (offline && !banner && document.body) {
            banner = document.createElement('div');
            banner.className = 'net-status';
            banner.setAttribute('role', 'status');
            banner.textContent = 'Offline — showing cached pages. Progress stays on this device.';
            document.body.appendChild(banner);
          }
          if (banner) {
            if (offline) banner.removeAttribute('hidden');
            else banner.setAttribute('hidden', '');
          }
        } catch (err) { /* indicator is best-effort */ }
      };
      window.addEventListener('online', function () { setOffline(false); });
      window.addEventListener('offline', function () { setOffline(true); });
      if (typeof navigator !== 'undefined' && navigator.onLine === false) setOffline(true);
    } catch (err) { /* never break the page */ }
  }

  try {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) { wireOfflineIndicator(); return; }
    // Same-directory relative URL: correct at the domain root (local dev)
    // and under a GitHub Pages project subpath alike.
    const register = function () {
      try {
        const result = navigator.serviceWorker.register('sw.js');
        if (result && typeof result.catch === 'function') {
          result.catch(function () { /* offline layer optional */ });
        }
      } catch (err) { /* registration unavailable */ }
    };
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      register();
    } else if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('DOMContentLoaded', register);
    } else {
      register();
    }
    wireOfflineIndicator();
  } catch (err) { /* never break the page */ }
})();
