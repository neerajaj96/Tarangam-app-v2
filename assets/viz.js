/**
 * Tarangam visualization engine — progressive enhancement for the
 * `::: viz flow|stepper|trace` Markdown widgets (see scripts/widgets.js).
 *
 * Static-first contract: without JavaScript every step stays visible as a
 * plain numbered list with its diagram, so no information is ever locked
 * behind interaction. When this module runs, each widget gains staged
 * Prev/Next/Play/Reset controls, arrow-key support, and polite live
 * announcements of the current position. No dependencies, no framework, no
 * global animation loops; one interval per playing widget at most, always
 * cleared at the last step.
 *
 * Accessibility + motion contract:
 * - Controls are native <button> elements (keyboard usable by default);
 *   Left/Right arrows on the widget move without stealing Space.
 * - The current item keeps aria-current; others use `hidden`; a
 *   role="status" line announces position politely.
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
    last() { i = n - 1; playing = false; return i; },
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
  if (steps.length < 2) {
    // Single-step (or malformed) widget: leave fully static, hide dead controls.
    const controls = root.querySelector ? root.querySelector('.viz-controls') : null;
    if (controls) controls.setAttribute('hidden', '');
    return null;
  }
  const machine = createStepper(steps.length);
  const apply = (i) => {
    steps.forEach((li, k) => {
      if (k === i) { li.removeAttribute('hidden'); li.setAttribute('aria-current', 'step'); }
      else { li.setAttribute('hidden', ''); li.removeAttribute('aria-current'); }
    });
  };
  return wireStaged(root, machine, apply, 'Step', timer);
}

// Shared staged-controls wiring for step-like widgets: Prev/Next/Play/
// Reset buttons, arrow/Home/End keys, polite position announcements, and
// reduced-motion handling live here once — bindViz (single visible item)
// and bindTrace (cumulative states) differ only in their apply() painter.
function wireStaged(root, machine, apply, label, timer) {
  const clock = timer || { set: (fn, ms) => setInterval(fn, ms), clear: (id) => clearInterval(id) };
  const status = root.querySelector('.viz-status');
  const controls = root.querySelector('.viz-controls');
  if (!status || !controls) {
    if (controls) controls.setAttribute('hidden', '');
    return null;
  }
  const btns = {};
  controls.querySelectorAll('.viz-btn').forEach((b) => { btns[b.getAttribute('data-act')] = b; });
  let timerId = null;
  const stop = () => {
    if (timerId !== null) { clock.clear(timerId); timerId = null; }
    machine.pause();
    if (btns.play) btns.play.textContent = 'Play';
  };
  const paint = () => {
    apply(machine.index);
    status.textContent = `${label} ${machine.index + 1} of ${machine.count}`;
    if (btns.prev) { if (machine.index === 0) btns.prev.setAttribute('disabled', ''); else btns.prev.removeAttribute('disabled'); }
    if (btns.next) { if (machine.index === machine.count - 1) btns.next.setAttribute('disabled', ''); else btns.next.removeAttribute('disabled'); }
  };
  // Reduced motion: no autoplay surface at all; manual stepping stays instant.
  if (prefersReducedMotion() && btns.play) btns.play.remove();
  const actions = {
    prev: () => { stop(); machine.prev(); paint(); },
    next: () => { stop(); machine.next(); paint(); },
    reset: () => { stop(); machine.reset(); paint(); },
    play: () => {
      if (!btns.play || btns.play.isConnected === false) return;
      if (machine.playing) { stop(); paint(); return; }
      if (machine.play()) {
        btns.play.textContent = 'Pause';
        timerId = clock.set(() => {
          machine.tick();
          paint();
          if (!machine.playing) stop();
        }, VIZ_PLAY_INTERVAL_MS);
      } else {
        paint();
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
      else if (e.key === 'End') { e.preventDefault(); stop(); machine.last(); paint(); }
    });
  }
  root.classList.add('is-live');
  paint();
  return { root, machine, actions, stop };
}

// State-trace binding: cumulative reveal — states 0..k plus the ops that
// produced them stay visible, so each state reads against its history.
// Only the newest state carries aria-current; ops never take it.
export function bindTrace(root, { timer } = {}) {
  if (!root || typeof root.querySelectorAll !== 'function') return null;
  const states = Array.from(root.querySelectorAll('.viz-tstate'));
  const ops = Array.from(root.querySelectorAll('.viz-top'));
  if (states.length < 2) {
    const controls = root.querySelector ? root.querySelector('.viz-controls') : null;
    if (controls) controls.setAttribute('hidden', '');
    return null;
  }
  const machine = createStepper(states.length);
  const apply = (i) => {
    states.forEach((li, k) => {
      if (k <= i) {
        li.removeAttribute('hidden');
        if (k === i) li.setAttribute('aria-current', 'step');
        else li.removeAttribute('aria-current');
      } else {
        li.setAttribute('hidden', '');
        li.removeAttribute('aria-current');
      }
    });
    ops.forEach((li, j) => {
      if (j < i) li.removeAttribute('hidden');
      else li.setAttribute('hidden', '');
    });
  };
  return wireStaged(root, machine, apply, 'State', timer);
}

export function initViz(scope) {
  if (typeof document === 'undefined') return [];
  const base = scope && typeof scope.querySelectorAll === 'function' ? scope : document;
  const bound = [];
  base.querySelectorAll('.viz[data-viz]').forEach((root) => {
    const kind = root.getAttribute('data-viz');
    if (kind === 'flow' || kind === 'stepper') bound.push(bindViz(root));
    else if (kind === 'trace') bound.push(bindTrace(root));
    else if (kind === 'tabs') bound.push(bindTabs(root));
    else if (kind === 'compare') bound.push(bindCompare(root));
    else if (kind === 'rtt') bound.push(bindLab(root, 'rtt'));
    else if (kind === 'lab') bound.push(bindLab(root));
    else if (kind === 'struct') bound.push(bindStruct(root));
  });
  return bound.filter(Boolean);
}

import { getLab, validateLab, computeLab, formatOutput } from './viz-calcs.js';

// Legacy RTT entry kept for compatibility: the generic lab owns the math
// now (see viz-calcs.js); this wrapper preserves the old clamping
// semantics exactly, so long-standing callers and tests keep passing.
export function calcRtt(n, rtt, t) {
  const coerce = (v) => Math.max(0, Number(v) || 0);
  const c = computeLab('rtt', { n: Math.floor(coerce(n)), rtt: coerce(rtt), t: coerce(t) });
  return { nonpersistent: c.nonpersistent, persistent: c.persistent, pipelined: c.pipelined };
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

// Generalized lab binder: one engine for every registered calculation.
// Reads validated inputs (number + optional paired range sharing min/max/
// step, so the pair cannot drift), shows per-input error messages instead
// of silently coercing, recomputes instantly, announces a compact summary,
// and resets to the spec defaults. No timers, no animation.
export function bindLab(root, labId) {
  if (!root || typeof root.querySelector !== 'function') return null;
  const id = labId || (root.getAttribute ? root.getAttribute('data-lab') : null);
  const spec = getLab(id);
  if (!spec) return null;
  const byKey = (attr, key) => root.querySelector(`[${attr}="${key}"]`);
  const numbers = {};
  const ranges = {};
  const errors = {};
  for (const inp of spec.inputs) {
    const num = byKey('data-in', inp.key);
    if (!num) return null;
    numbers[inp.key] = num;
    const range = byKey('data-range', inp.key);
    if (range) ranges[inp.key] = range;
    const err = root.querySelector(`[data-err="${inp.key}"]`);
    if (err) errors[inp.key] = err;
  }
  const outs = root.querySelectorAll ? Array.from(root.querySelectorAll('[data-out]')) : [];
  if (!outs.length) return null;
  const status = root.querySelector ? root.querySelector('.viz-status') : null;
  const resetBtn = root.querySelector ? root.querySelector('[data-act="reset"]') : null;
  const summary = (results) => spec.outputs
    .map((o) => `${o.label} ${formatOutput(spec, o.key, results[o.key])}`).join(' · ');
  const readValues = () => {
    const values = {};
    spec.inputs.forEach((inp) => { values[inp.key] = numbers[inp.key].value; });
    return values;
  };
  const recompute = () => {
    const { errors: bad, clean } = validateLab(id, readValues());
    let failed = 0;
    spec.inputs.forEach((inp) => {
      const msg = bad[inp.key];
      const num = numbers[inp.key];
      if (msg) {
        failed += 1;
        num.setAttribute('aria-invalid', 'true');
        if (errors[inp.key]) {
          errors[inp.key].textContent = msg;
          errors[inp.key].removeAttribute('hidden');
        }
      } else {
        num.removeAttribute('aria-invalid');
        if (errors[inp.key]) {
          errors[inp.key].textContent = '';
          errors[inp.key].setAttribute('hidden', '');
        }
      }
    });
    if (failed) {
      outs.forEach((o) => { o.textContent = '—'; });
      if (status) status.textContent = `Fix ${failed} highlighted field${failed === 1 ? '' : 's'}.`;
      return null;
    }
    const results = computeLab(id, clean);
    outs.forEach((o) => { o.textContent = formatOutput(spec, o.getAttribute('data-out'), results[o.getAttribute('data-out')]); });
    if (status) status.textContent = summary(results);
    return results;
  };
  const syncFromNumber = (key) => {
    if (ranges[key]) ranges[key].value = numbers[key].value;
  };
  const syncFromRange = (key) => {
    numbers[key].value = ranges[key].value;
  };
  spec.inputs.forEach((inp) => {
    // Slider follows only valid numbers: an invalid entry keeps its error
    // state while the slider stays parked at the last good value — the two
    // controls never silently disagree.
    numbers[inp.key].addEventListener('input', () => {
      if (!validateLab(id, readValues()).errors[inp.key]) syncFromNumber(inp.key);
      recompute();
    });
    if (ranges[inp.key]) ranges[inp.key].addEventListener('input', () => { syncFromRange(inp.key); recompute(); });
  });
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      spec.inputs.forEach((inp) => {
        numbers[inp.key].value = String(inp.def);
        syncFromNumber(inp.key);
      });
      recompute();
    });
  }
  root.classList.add('is-live');
  recompute();
  return { root, spec, recompute };
}

// Legacy RTT binder: the generic lab supersedes it (same registry math,
// plus validation, reset, and paired sliders). Kept routing so any stale
// markup still binds instead of failing silently.
export function bindRtt(root) {
  return bindLab(root, 'rtt');
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
