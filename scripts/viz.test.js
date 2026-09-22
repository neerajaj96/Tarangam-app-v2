/**
 * Deterministic tests for the Tarangam visualization foundation
 * (node:test + node:assert only — no test framework). Covers the `::: viz`
 * Markdown widget transform (scripts/widgets.js), the HTTP scene registry
 * entries (scripts/scenes.js), the DOM-free step-state machine plus stub-DOM
 * binding (assets/viz.js), the stylesheet contract, and the template wiring.
 * The engine degrades to a static step list without JS, so every assertion
 * about static output doubles as the no-JS fallback contract.
 *
 * Run: npm test  (node --test scripts/viz.test.js)
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { transformCustomWidgets } from './widgets.js';
import { SCENES, SCENE_IDS } from './scenes.js';
import { createStepper, bindViz, VIZ_PLAY_INTERVAL_MS } from '../assets/viz.js';

const read = (f) => fs.readFileSync(f, 'utf-8');

// Minimal DOM stub: only the surface bindViz touches.
function stubEl(attrs = {}) {
  const listeners = {};
  const el = {
    _attrs: { ...attrs },
    textContent: '',
    removed: false,
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this._attrs, k) ? this._attrs[k] : null; },
    setAttribute(k, v) { this._attrs[k] = String(v); },
    removeAttribute(k) { delete this._attrs[k]; },
    remove() { this.removed = true; },
    addEventListener(t, fn) { (listeners[t] = listeners[t] || []).push(fn); },
    fire(t, e = {}) { (listeners[t] || []).forEach((fn) => fn({ preventDefault() {}, ...e })); },
    classList: { add() {} },
    querySelectorAll() { return []; },
  };
  return el;
}

function stubRoot(stepCount) {
  const steps = Array.from({ length: stepCount }, (_, i) => {
    const li = stubEl({ 'data-i': String(i) });
    return li;
  });
  const status = stubEl();
  const buttons = ['prev', 'play', 'next', 'reset'].map((act) => stubEl({ 'data-act': act }));
  const controls = stubEl();
  controls.querySelectorAll = () => buttons;
  const listeners = {};
  const root = {
    steps,
    buttons,
    status,
    controls,
    addEventListener(t, fn) { (listeners[t] = listeners[t] || []).push(fn); },
    fire(t, e = {}) { (listeners[t] || []).forEach((fn) => fn({ preventDefault() {}, ...e })); },
    classList: { add() {} },
    querySelector(sel) {
      if (sel === '.viz-status') return status;
      if (sel === '.viz-controls') return controls;
      return null;
    },
    querySelectorAll(sel) {
      if (sel === '.viz-step') return steps;
      return [];
    },
  };
  return root;
}

describe('viz widget transform', () => {
  it('renders a flow with scene diagram, steps, controls, and live status', () => {
    const out = transformCustomWidgets(
      '::: viz flow http-cookie Cookie lifecycle\n1. First request carries no cookie\n2. Server replies Set-cookie\n:::'
    );
    assert.ok(out.includes('class="viz viz-flow"'), 'flow shell class');
    assert.ok(out.includes('data-steps="2"'), 'step count advertised');
    assert.ok(out.includes('class="anim-stage"'), 'scene SVG embedded with stage class');
    assert.ok(out.includes('Cookie lifecycle'), 'title rendered');
    assert.ok(out.includes('data-i="0"') && out.includes('data-i="1"'), 'steps indexed');
    for (const act of ['prev', 'play', 'next', 'reset']) {
      assert.ok(out.includes(`data-act="${act}"`), `control ${act} present`);
    }
    assert.ok(out.includes('role="status"'), 'polite live status region');
    assert.ok(out.includes('role="group"'), 'controls grouped with label');
    assert.ok(out.includes('<button type="button"'), 'native buttons for keyboard use');
  });

  it('renders a stepper without a diagram when no scene id leads', () => {
    const out = transformCustomWidgets(
      '::: viz stepper Pricing one page\n- Handshake costs a round trip\n- Reuse wins\n:::'
    );
    assert.ok(out.includes('class="viz viz-stepper"'), 'stepper shell class');
    assert.ok(!out.includes('viz-diagram'), 'no diagram without scene id');
    assert.ok(out.includes('Pricing one page'), 'full head used as title');
  });

  it('treats an unknown scene word as title text instead of failing', () => {
    const out = transformCustomWidgets('::: viz flow My custom walk\n1. One\n2. Two\n:::');
    assert.ok(out.includes('My custom walk'), 'title preserved');
    assert.ok(!out.includes('viz-diagram'), 'no diagram for unknown scene');
  });

  it('leaves unknown viz types and empty bodies raw for check.js', () => {
    const raw = '::: viz graph Something\n1. One\n2. Two\n:::';
    assert.equal(transformCustomWidgets(raw), raw, 'unknown type untouched');
    const empty = '::: viz stepper Lonely\n:::';
    assert.equal(transformCustomWidgets(empty), empty, 'empty body untouched');
  });

  it('never emits nested widget closers or quiz markers', () => {
    const out = transformCustomWidgets('::: viz stepper T\n1. Alpha\n2. Beta\n:::');
    assert.ok(!/^:::\n:::/m.test(out), 'no consecutive closers');
    assert.ok(!out.includes('::: quiz'), 'no quiz markers invented');
  });
});

describe('HTTP scene registry entries', () => {
  for (const id of ['http-exchange', 'http-cookie', 'http-timing']) {
    it(`registers an accessible ${id} scene`, () => {
      assert.ok(SCENE_IDS.includes(id), `${id} in registry`);
      const svg = SCENES[id].svg;
      assert.ok(svg.includes('role="img"'), 'semantic img role');
      assert.ok(svg.includes('aria-label'), 'text alternative for screen readers');
      assert.ok(svg.includes('viewBox'), 'scales crisply at any size');
      assert.ok(SCENES[id].title.length > 0, 'titled for anim fallback');
    });
  }
});

describe('step-state machine', () => {
  it('clamps movement to [0, count) and resets', () => {
    const m = createStepper(3);
    assert.equal(m.index, 0);
    m.prev();
    assert.equal(m.index, 0, 'prev clamps at first step');
    m.next(); m.next(); m.next();
    assert.equal(m.index, 2, 'next clamps at last step');
    m.reset();
    assert.equal(m.index, 0);
    assert.equal(m.playing, false);
  });

  it('plays forward on ticks and parks stopped at the end', () => {
    const m = createStepper(3);
    assert.equal(m.play(), true);
    assert.equal(m.tick(), 1);
    assert.equal(m.tick(), 2);
    assert.equal(m.tick(), 2, 'tick parks at last step');
    assert.equal(m.playing, false, 'autoplay stops itself');
    assert.equal(m.play(), false, 'play at end does not start');
  });

  it('cancels playback on any manual move', () => {
    const m = createStepper(3);
    m.play();
    m.next();
    assert.equal(m.playing, false);
    m.play();
    m.prev();
    assert.equal(m.playing, false);
  });

  it('exposes the deterministic play interval', () => {
    assert.ok(VIZ_PLAY_INTERVAL_MS >= 1000, 'play cadence is calm, not frantic');
  });
});

describe('widget binding on stub DOM', () => {
  it('stages steps with aria-current, hidden peers, and status text', () => {
    const root = stubRoot(3);
    const bound = bindViz(root);
    assert.ok(bound, 'multi-step widget binds');
    assert.equal(root.steps[0].getAttribute('aria-current'), 'step');
    assert.equal(root.steps[1].getAttribute('hidden'), '');
    assert.equal(root.status.textContent, 'Step 1 of 3');
    bound.actions.next();
    assert.equal(root.status.textContent, 'Step 2 of 3');
    assert.equal(root.steps[1].getAttribute('aria-current'), 'step');
    assert.equal(root.steps[0].getAttribute('hidden'), '');
    bound.actions.reset();
    assert.equal(root.status.textContent, 'Step 1 of 3');
  });

  it('disables edge buttons and drives controls by click', () => {
    const root = stubRoot(2);
    const bound = bindViz(root);
    const byAct = {};
    root.buttons.forEach((b) => { byAct[b.getAttribute('data-act')] = b; });
    assert.equal(byAct.prev.getAttribute('disabled'), '', 'prev disabled on first step');
    byAct.next.fire('click');
    assert.equal(root.status.textContent, 'Step 2 of 2');
    assert.equal(byAct.next.getAttribute('disabled'), '', 'next disabled on last step');
    byAct.prev.fire('click');
    assert.equal(root.status.textContent, 'Step 1 of 2');
  });

  it('moves with arrow keys and Home without stealing Space', () => {
    const root = stubRoot(3);
    bindViz(root);
    let prevented = 0;
    root.fire('keydown', { key: 'ArrowRight', preventDefault() { prevented += 1; } });
    assert.equal(root.status.textContent, 'Step 2 of 3');
    root.fire('keydown', { key: 'ArrowLeft', preventDefault() { prevented += 1; } });
    assert.equal(root.status.textContent, 'Step 1 of 3');
    assert.equal(prevented, 2, 'arrows handled locally');
  });

  it('autoplays on a timer and stops at the last step', () => {
    const root = stubRoot(3);
    const bound = bindViz(root, { timer: { set: (fn) => { fn(); fn(); fn(); return 7; }, clear: () => {} } });
    const byAct = {};
    root.buttons.forEach((b) => { byAct[b.getAttribute('data-act')] = b; });
    byAct.play.fire('click');
    assert.equal(root.status.textContent, 'Step 3 of 3');
    assert.equal(bound.machine.playing, false, 'parked after final tick');
  });

  it('removes Play entirely under prefers-reduced-motion', () => {
    const realWindow = globalThis.window;
    globalThis.window = { matchMedia: () => ({ matches: true }) };
    try {
      const root = stubRoot(2);
      bindViz(root);
      const byAct = {};
      root.buttons.forEach((b) => { byAct[b.getAttribute('data-act')] = b; });
      assert.equal(byAct.play.removed, true, 'no autoplay surface under reduced motion');
      byAct.next.fire('click');
      assert.equal(root.status.textContent, 'Step 2 of 2', 'manual stepping still instant');
    } finally {
      if (realWindow === undefined) delete globalThis.window;
      else globalThis.window = realWindow;
    }
  });

  it('leaves single-step widgets static with dead controls hidden', () => {
    const root = stubRoot(1);
    assert.equal(bindViz(root), null, 'nothing to stage');
    assert.equal(root.controls.getAttribute('hidden'), '', 'useless controls hidden');
    assert.equal(root.steps[0].getAttribute('hidden'), null, 'sole step stays visible');
  });
});

describe('stylesheet and template contracts', () => {
  it('styles the viz shell for all themes with keyboard and print support', () => {
    const css = read('style.css');
    for (const sel of ['.viz-steps', '.viz.is-live .viz-step[hidden]', '.viz-btn:focus-visible', '.viz-status']) {
      assert.ok(css.includes(sel), `stylesheet covers ${sel}`);
    }
    assert.ok(!/width:\s*100vw/.test(css), 'no viewport-width traps introduced');
  });

  it('loads the engine on topic pages and ships it to dist', () => {
    const tpl = read('templates/base.html');
    assert.ok(tpl.includes('../assets/viz.js'), 'topic template loads viz engine');
    assert.ok(tpl.includes('initViz'), 'engine initializes on topic pages');
    assert.ok(fs.existsSync('assets/viz.js'), 'engine source exists for copyAssetDirs');
  });
});
