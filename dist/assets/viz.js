/**
 * Tarangam visualization engine — progressive enhancement for the
 * `::: viz flow|stepper` Markdown widgets (see scripts/widgets.js).
 *
 * Static-first contract: without JavaScript every step stays visible as a
 * plain numbered list with its diagram, so no information is ever locked
 * behind interaction. When this module runs, each widget gains staged
 * Prev/Next/Play/Reset controls, arrow-key support, and polite live
 * announcements of the current step. No dependencies, no framework, no
 * global animation loops; one interval per playing widget at most, always
 * cleared at the last step.
 *
 * Accessibility + motion contract:
 * - Controls are native <button> elements (keyboard usable by default);
 *   Left/Right arrows on the widget move steps without stealing Space.
 * - The current step keeps aria-current; others use `hidden`; a
 *   role="status" line announces "Step k of n" politely.
 * - Under prefers-reduced-motion the Play control is removed entirely —
 *   stepping stays instant (there are no transitions to disable) and no
 *   autoplay can start.
 *
 * Loaded by templates/base.html on topic pages; copyAssetDirs() ships it
 * to dist/ untouched. Safe to import anywhere: zero side effects until
 * initViz() runs, and initViz() is a no-op without .viz nodes or DOM.
 */

export const VIZ_PLAY_INTERVAL_MS = 2400;

// Pure step-state machine (DOM-free; unit-tested in scripts/viz.test.js).
// Index always stays inside [0, count). Any manual move stops playback;
// tick() advances only while playing and parks (stopped) at the last step.
export function createStepper(count) {
  const n = Math.max(1, Math.floor(Number(count)) || 1);
  let i = 0;
  let playing = false;
  return {
    get index() { return i; },
    get count() { return n; },
    get playing() { return playing; },
    next() { i = Math.min(n - 1, i + 1); playing = false; return i; },
    prev() { i = Math.max(0, i - 1); playing = false; return i; },
    reset() { i = 0; playing = false; return i; },
    play() { playing = i < n - 1; return playing; },
    pause() { playing = false; return playing; },
    tick() {
      if (!playing) return i;
      if (i < n - 1) i += 1;
      else playing = false;
      return i;
    },
  };
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Bind one widget root. Exported for tests that supply a stub root.
export function bindViz(root, { timer = { set: (fn, ms) => setInterval(fn, ms), clear: (id) => clearInterval(id) } } = {}) {
  if (!root || typeof root.querySelectorAll !== 'function') return null;
  const steps = Array.from(root.querySelectorAll('.viz-step'));
  const status = root.querySelector('.viz-status');
  const controls = root.querySelector('.viz-controls');
  if (steps.length < 2 || !status || !controls) {
    // Single-step (or malformed) widget: leave fully static, hide dead controls.
    if (controls) controls.setAttribute('hidden', '');
    return null;
  }
  const machine = createStepper(steps.length);
  const btns = {};
  controls.querySelectorAll('.viz-btn').forEach((b) => { btns[b.getAttribute('data-act')] = b; });
  let timerId = null;
  const stop = () => {
    if (timerId !== null) { timer.clear(timerId); timerId = null; }
    machine.pause();
    if (btns.play) btns.play.textContent = 'Play';
  };
  const apply = () => {
    const i = machine.index;
    steps.forEach((li, k) => {
      if (k === i) { li.removeAttribute('hidden'); li.setAttribute('aria-current', 'step'); }
      else { li.setAttribute('hidden', ''); li.removeAttribute('aria-current'); }
    });
    status.textContent = `Step ${i + 1} of ${machine.count}`;
    if (btns.prev) { if (machine.index === 0) btns.prev.setAttribute('disabled', ''); else btns.prev.removeAttribute('disabled'); }
    if (btns.next) { if (machine.index === machine.count - 1) btns.next.setAttribute('disabled', ''); else btns.next.removeAttribute('disabled'); }
  };
  // Reduced motion: no autoplay surface at all; manual stepping stays instant.
  if (prefersReducedMotion() && btns.play) btns.play.remove();
  const actions = {
    prev: () => { stop(); machine.prev(); apply(); },
    next: () => { stop(); machine.next(); apply(); },
    reset: () => { stop(); machine.reset(); apply(); },
    play: () => {
      if (!btns.play || btns.play.isConnected === false) return;
      if (machine.playing) { stop(); apply(); return; }
      if (machine.play()) {
        btns.play.textContent = 'Pause';
        timerId = timer.set(() => {
          machine.tick();
          apply();
          if (!machine.playing) stop();
        }, VIZ_PLAY_INTERVAL_MS);
      } else {
        apply();
      }
    },
  };
  Object.keys(actions).forEach((act) => {
    if (btns[act]) btns[act].addEventListener('click', actions[act]);
  });
  if (typeof root.addEventListener === 'function') {
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); actions.next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); actions.prev(); }
      else if (e.key === 'Home') { e.preventDefault(); actions.reset(); }
    });
  }
  root.classList.add('is-live');
  apply();
  return { root, machine, actions, stop };
}

export function initViz(scope) {
  if (typeof document === 'undefined') return [];
  const base = scope && typeof scope.querySelectorAll === 'function' ? scope : document;
  return Array.from(base.querySelectorAll('.viz[data-viz]'))
    .map((root) => bindViz(root))
    .filter(Boolean);
}
