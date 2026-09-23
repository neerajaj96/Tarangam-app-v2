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
  const bound = [];
  base.querySelectorAll('.viz[data-viz]').forEach((root) => {
    const kind = root.getAttribute('data-viz');
    if (kind === 'flow' || kind === 'stepper') bound.push(bindViz(root));
    else if (kind === 'tabs') bound.push(bindTabs(root));
    else if (kind === 'compare') bound.push(bindCompare(root));
    else if (kind === 'rtt') bound.push(bindRtt(root));
    else if (kind === 'struct') bound.push(bindStruct(root));
  });
  return bound.filter(Boolean);
}

// Textbook RTT comparison model (HTTP showcase): n objects, rtt ms per
// round trip, t ms transfer per object. Returns totals in ms. Pure and
// unit-tested; the numbers compare connection disciplines, never real
// browser performance.
export function calcRtt(n, rtt, t) {
  const objs = Math.max(0, Math.floor(Number(n) || 0));
  const round = Math.max(0, Number(rtt) || 0);
  const xfer = Math.max(0, Number(t) || 0);
  const base = 2 * round + xfer;
  return {
    nonpersistent: base + objs * (2 * round + xfer),
    persistent: base + objs * (round + xfer),
    pipelined: base + (round + objs * xfer),
  };
}

// Tabbed panels: click/tap to select; arrows/Home/End move; roving
// tabindex keeps one tab stop. No animation, so reduced motion is moot.
export function bindTabs(root) {
  if (!root || typeof root.querySelectorAll !== 'function') return null;
  const tabs = Array.from(root.querySelectorAll('.viz-tab'));
  const panels = Array.from(root.querySelectorAll('.viz-panel'));
  if (tabs.length < 2 || panels.length !== tabs.length) return null;
  const select = (i) => {
    const k = Math.max(0, Math.min(tabs.length - 1, i));
    tabs.forEach((tab, j) => {
      const on = j === k;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.setAttribute('tabindex', on ? '0' : '-1');
      if (panels[j]) { if (on) panels[j].removeAttribute('hidden'); else panels[j].setAttribute('hidden', ''); }
    });
    return k;
  };
  let current = 0;
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => { current = select(i); });
  });
  if (typeof root.addEventListener === 'function') {
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); current = select(current + 1); tabs[current].focus(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); current = select(current - 1); tabs[current].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); current = select(0); tabs[current].focus(); }
      else if (e.key === 'End') { e.preventDefault(); current = select(tabs.length - 1); tabs[current].focus(); }
    });
  }
  root.classList.add('is-live');
  select(0);
  return { root, select, get current() { return current; } };
}

// Comparison count reveal: one checkbox toggles author-written badges.
export function bindCompare(root) {
  if (!root || typeof root.querySelector !== 'function') return null;
  const toggle = root.querySelector('.viz-count-toggle');
  const badges = root.querySelectorAll ? Array.from(root.querySelectorAll('.viz-count')) : [];
  if (!toggle || !badges.length) return null;
  const apply = () => {
    const show = !!(toggle.checked !== undefined ? toggle.checked : toggle.getAttribute('checked'));
    badges.forEach((b) => { if (show) b.removeAttribute('hidden'); else b.setAttribute('hidden', ''); });
  };
  toggle.addEventListener('change', apply);
  root.classList.add('is-live');
  apply();
  return { root, apply };
}

// RTT lab: number inputs recompute the three textbook totals instantly.
export function bindRtt(root) {
  if (!root || typeof root.querySelector !== 'function') return null;
  const get = (key) => root.querySelector(`[data-in="${key}"]`);
  const nEl = get('n');
  const rttEl = get('rtt');
  const tEl = get('t');
  const outs = root.querySelectorAll ? Array.from(root.querySelectorAll('[data-out]')) : [];
  if (!nEl || !rttEl || !tEl || !outs.length) return null;
  const recompute = () => {
    const r = calcRtt(nEl.value, rttEl.value, tEl.value);
    outs.forEach((o) => {
      const v = r[o.getAttribute('data-out')];
      o.textContent = typeof v === 'number' ? `${v} ms` : '—';
    });
    return r;
  };
  [nEl, rttEl, tEl].forEach((el) => el.addEventListener('input', recompute));
  root.classList.add('is-live');
  recompute();
  return { root, recompute };
}

// Annotated structure viewer: exactly one field selected at a time (or
// none after Escape). Click/Enter/Space select via native buttons; arrows
// move; selection is announced through the live panel. No timers, no
// animation — reduced motion is inherently satisfied.
export function bindStruct(root) {
  if (!root || typeof root.querySelectorAll !== 'function') return null;
  const fields = Array.from(root.querySelectorAll('.viz-field'));
  const panel = root.querySelector ? root.querySelector('.viz-fpanel') : null;
  if (fields.length < 1 || !panel) return null;
  const prompt = panel.textContent;
  const describe = (btn) => {
    const name = btn.querySelector ? btn.querySelector('.viz-fname') : null;
    const size = btn.querySelector ? btn.querySelector('.viz-fsize') : null;
    const exp = btn.querySelector ? btn.querySelector('.viz-fexp') : null;
    const parts = [name && name.textContent, size && size.textContent, exp && exp.textContent]
      .map((s) => (s || '').trim()).filter(Boolean);
    return parts.join(' — ');
  };
  const select = (i) => {
    const k = i === null ? -1 : Math.max(0, Math.min(fields.length - 1, i));
    fields.forEach((btn, j) => {
      const on = j === k;
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    panel.textContent = k < 0 ? prompt : describe(fields[k]);
    return k;
  };
  let current = -1;
  fields.forEach((btn, i) => {
    btn.addEventListener('click', () => { current = select(i); });
  });
  if (typeof root.addEventListener === 'function') {
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); current = select(current + 1 > fields.length - 1 ? 0 : current + 1); fields[current].focus(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); current = select(current - 1 < 0 ? fields.length - 1 : current - 1); fields[current].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); current = select(0); fields[current].focus(); }
      else if (e.key === 'End') { e.preventDefault(); current = select(fields.length - 1); fields[current].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); current = select(null); }
    });
  }
  root.classList.add('is-live');
  select(null);
  return { root, select, get current() { return current; } };
}
