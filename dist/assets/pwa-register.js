/**
 * Tarangam service worker registration (classic script, no dependencies,
 * no modules). Included with `defer` on the entry pages (index,
 * dashboard, explorer, course, assessment) so any visit registers the
 * offline layer once per scope. Fails gracefully everywhere service
 * workers are unavailable (private modes, old browsers, file://): the
 * app runs exactly as before, online only. Never throws, never blocks
 * rendering, never touches learner state.
 */
(function () {
  try {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
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
  } catch (err) { /* never break the page */ }
})();
