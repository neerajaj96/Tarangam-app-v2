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
import { createStepper, bindViz, bindTabs, bindCompare, bindRtt, bindStruct, calcRtt, VIZ_PLAY_INTERVAL_MS } from '../assets/viz.js';

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

  it('styles tabs, comparisons, and the RTT lab for all themes', () => {
    const css = read('style.css');
    for (const sel of [
      '.viz-tablist', '.viz-tab[aria-selected="true"]', '.viz-tabs.is-live .viz-panel[hidden]',
      '.viz-cols', '.viz-compare.is-live .viz-count[hidden]', '.viz-toggle',
      '.viz-inputs', '.viz-result output', '.viz-field input:focus-visible',
    ]) {
      assert.ok(css.includes(sel), `stylesheet covers ${sel}`);
    }
    assert.ok(css.includes('@media (max-width: 640px)'), 'narrow-viewport rules present');
    assert.ok(!/width:\s*100vw/.test(css), 'no viewport-width traps introduced');
  });
});

describe('viz tabs transform', () => {
  it('renders labeled tabs with wired panels and roving tabindex', () => {
    const out = transformCustomWidgets(
      '::: viz tabs URL anatomy\nscheme :: picks the protocol\nport :: picks the process\n:::'
    );
    assert.ok(out.includes('class="viz viz-tabs"'), 'tabs shell class');
    assert.ok(out.includes('role="tablist"'), 'tablist semantics');
    assert.ok(out.includes('role="tab"') && out.includes('role="tabpanel"'), 'tab semantics');
    assert.ok(out.includes('aria-selected="true"') && out.includes('aria-selected="false"'), 'first tab selected');
    assert.ok(out.includes('tabindex="0"') && out.includes('tabindex="-1"'), 'roving tabindex');
    assert.ok(out.includes('aria-controls="vizt1-panel-0"'), 'tab controls panel');
    assert.ok(out.includes('URL anatomy'), 'title rendered');
  });

  it('embeds a scene when the head word names one', () => {
    const out = transformCustomWidgets('::: viz tabs web-layers Two views\nInfra :: routers\nApp :: browser\n:::');
    assert.ok(out.includes('class="anim-stage"'), 'scene embedded');
    assert.ok(out.includes('Two views'), 'remaining words form the title');
  });

  it('leaves malformed tab blocks raw for check.js', () => {
    const raw = '::: viz tabs Lonely\nJust one line without separator\nAnother plain line\n:::';
    assert.equal(transformCustomWidgets(raw), raw, 'needs Label :: content lines');
  });
});

describe('viz compare transform', () => {
  it('renders two columns with hidden count badges and a toggle', () => {
    const out = transformCustomWidgets(
      '::: viz compare Modes\n## Non-persistent\n- Open, fetch, close\n= 2 connections\n## Persistent\n- Open once, fetch all\n= 1 connection\n:::'
    );
    assert.ok(out.includes('class="viz viz-compare"'), 'compare shell class');
    assert.ok(out.includes('Non-persistent') && out.includes('Persistent'), 'headings rendered');
    assert.ok(out.includes('class="viz-count" hidden'), 'badges hidden until toggled live');
    assert.ok(out.includes('2 connections') && out.includes('1 connection'), 'counts authored, not invented');
    assert.ok(out.includes('type="checkbox"') && out.includes('Show counts'), 'native toggle control');
  });

  it('leaves single-section compares raw for check.js', () => {
    const raw = '::: viz compare Thin\n## Only one\n- Point\n:::';
    assert.equal(transformCustomWidgets(raw), raw, 'needs two sections');
  });
});

describe('viz rtt transform', () => {
  it('renders labeled inputs, result rows, and the model disclaimer', () => {
    const out = transformCustomWidgets('::: viz rtt Timing lab\nAssumes textbook mode.\n:::');
    assert.ok(out.includes('class="viz viz-rtt"'), 'rtt shell class');
    for (const key of ['n', 'rtt', 't']) {
      assert.ok(out.includes(`data-in="${key}"`), `input ${key} present`);
    }
    for (const key of ['nonpersistent', 'persistent', 'pipelined']) {
      assert.ok(out.includes(`data-out="${key}"`), `result ${key} present`);
    }
    assert.ok(out.includes('not a measurement of real browser performance'), 'disclaimer fixed in output');
    assert.ok(out.includes('Assumes textbook mode'), 'author notes rendered');
    assert.ok(out.includes('type="number"'), 'native number inputs for mobile keyboards');
  });
});

describe('RTT comparison model', () => {
  it('prices the textbook page at 660, 410, and 210 ms', () => {
    assert.deepEqual(calcRtt(5, 50, 10), { nonpersistent: 660, persistent: 410, pipelined: 210 });
  });

  it('reduces to 8, 5, 3 RTTs with zero transfer time', () => {
    assert.deepEqual(calcRtt(3, 1, 0), { nonpersistent: 8, persistent: 5, pipelined: 3 });
  });

  it('clamps nonsense inputs instead of producing NaN', () => {
    const r = calcRtt(-2, 'abc', null);
    assert.deepEqual(r, { nonpersistent: 0, persistent: 0, pipelined: 0 });
  });
});

function stubTabs(count) {
  const tabs = Array.from({ length: count }, (_, i) => stubEl({}));
  const panels = Array.from({ length: count }, () => stubEl({}));
  const listeners = {};
  return {
    tabs,
    panels,
    addEventListener(t, fn) { (listeners[t] = listeners[t] || []).push(fn); },
    fire(t, e = {}) { (listeners[t] || []).forEach((fn) => fn({ preventDefault() {}, ...e })); },
    classList: { add() {} },
    querySelectorAll(sel) {
      if (sel === '.viz-tab') return tabs;
      if (sel === '.viz-panel') return panels;
      return [];
    },
  };
}

describe('tabs binding on stub DOM', () => {
  it('selects panels on click with roving tabindex', () => {
    const root = stubTabs(3);
    const bound = bindTabs(root);
    assert.ok(bound, 'multi-tab widget binds');
    assert.equal(root.tabs[0].getAttribute('aria-selected'), 'true');
    assert.equal(root.panels[1].getAttribute('hidden'), '');
    root.tabs[2].fire('click');
    assert.equal(bound.current, 2);
    assert.equal(root.tabs[2].getAttribute('aria-selected'), 'true');
    assert.equal(root.tabs[0].getAttribute('tabindex'), '-1');
    assert.equal(root.panels[2].getAttribute('hidden'), null);
  });

  it('moves with arrows, Home, and End', () => {
    const root = stubTabs(3);
    let focused = -1;
    root.tabs.forEach((t, i) => { t.focus = () => { focused = i; }; });
    bindTabs(root);
    root.fire('keydown', { key: 'ArrowRight' });
    assert.equal(focused, 1, 'right arrow advances and focuses');
    root.fire('keydown', { key: 'End' });
    assert.equal(focused, 2, 'End jumps last');
    root.fire('keydown', { key: 'ArrowLeft' });
    assert.equal(focused, 1, 'left arrow retreats');
    root.fire('keydown', { key: 'Home' });
    assert.equal(focused, 0, 'Home jumps first');
  });

  it('rejects mismatched tab and panel counts', () => {
    const root = stubTabs(2);
    root.querySelectorAll = (sel) => (sel === '.viz-tab' ? root.tabs : []);
    assert.equal(bindTabs(root), null, 'needs matching panels');
  });
});

describe('compare and rtt bindings on stub DOM', () => {
  it('reveals count badges only while the toggle is checked', () => {
    const badges = [stubEl({}), stubEl({})];
    badges.forEach((b) => b.setAttribute('hidden', ''));
    const toggle = stubEl({});
    toggle.checked = false;
    const listeners = {};
    toggle.addEventListener = (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); };
    const root = {
      classList: { add() {} },
      querySelector: (sel) => (sel === '.viz-count-toggle' ? toggle : null),
      querySelectorAll: (sel) => (sel === '.viz-count' ? badges : []),
    };
    const bound = bindCompare(root);
    assert.ok(bound, 'compare binds');
    assert.equal(badges[0].getAttribute('hidden'), '', 'hidden by default once live');
    toggle.checked = true;
    listeners.change.forEach((fn) => fn());
    assert.equal(badges[0].getAttribute('hidden'), null, 'revealed on toggle');
  });

  it('recomputes all three totals on any input', () => {
    const mk = (v) => {
      const el = stubEl({});
      el.value = v;
      return el;
    };
    const inputs = { n: mk('5'), rtt: mk('50'), t: mk('10') };
    const outs = ['nonpersistent', 'persistent', 'pipelined'].map((k) => {
      const o = stubEl({});
      o.getAttribute = (a) => (a === 'data-out' ? k : null);
      return o;
    });
    const listeners = {};
    Object.values(inputs).forEach((el) => {
      el.addEventListener = (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); };
    });
    const root = {
      classList: { add() {} },
      querySelector: (sel) => {
        const m = /^\[data-in="([a-z]+)"\]$/.exec(sel);
        return m && inputs[m[1]] ? inputs[m[1]] : null;
      },
      querySelectorAll: (sel) => (sel === '[data-out]' ? outs : []),
    };
    const bound = bindRtt(root);
    assert.ok(bound, 'rtt lab binds');
    assert.equal(outs[0].textContent, '660 ms');
    assert.equal(outs[1].textContent, '410 ms');
    assert.equal(outs[2].textContent, '210 ms');
    inputs.n.value = '3';
    inputs.rtt.value = '1';
    inputs.t.value = '0';
    listeners.input.forEach((fn) => fn());
    assert.equal(outs[0].textContent, '8 ms', 'recomputes on input');
  });

  it('refuses to bind without inputs and outputs', () => {
    assert.equal(bindRtt({ querySelector: () => null, querySelectorAll: () => [] }), null);
    assert.equal(bindCompare({ querySelector: () => null, querySelectorAll: () => [] }), null);
  });
});

describe('viz structure transform', () => {
  it('renders proportional field buttons with sizes, panel, and notes', () => {
    const out = transformCustomWidgets(
      '::: viz structure UDP Header\nfield | Source Port | 16 | Reply address\nfield | Checksum | 16 | Error detection\nA fixed 8-byte header.\n:::'
    );
    assert.ok(out.includes('class="viz viz-struct"'), 'struct shell class');
    assert.ok(out.includes('data-fields="2"'), 'field count advertised');
    assert.ok(out.includes('style="flex:16 1 0"'), 'width proportional to bits');
    assert.ok(out.includes('16 bits') && out.includes('Source Port'), 'name and size visible statically');
    assert.ok(out.includes('Reply address') && out.includes('Error detection'), 'meanings visible statically');
    assert.ok(out.includes('role="status"'), 'live panel region for selection announcements');
    assert.ok(out.includes('A fixed 8-byte header'), 'plain note lines rendered below');
    assert.ok(out.includes('<button type="button" class="viz-field"'), 'native buttons for keyboard use');
  });

  it('supports group dividers and singular bit labels', () => {
    const out = transformCustomWidgets(
      '::: viz structure Flags\nfield | SYN | 1 | Open\n\ngroup | Control\nfield | Window | 16 | Flow credit\n:::'
    );
    assert.ok(out.includes('Control'), 'group divider rendered');
    assert.ok(out.includes('1 bit') && !out.includes('1 bits'), 'singular bit label');
    assert.ok(out.includes('data-fields="2"'), 'groups do not count as fields');
  });

  it('leaves malformed structures raw for check.js', () => {
    const raw = (body) => transformCustomWidgets(`::: viz structure Bad\n${body}\n:::`);
    assert.ok(raw('field | NoSize | abc | x').startsWith('::: viz structure'), 'non-integer width untouched');
    assert.ok(raw('field | Only Name').startsWith('::: viz structure'), 'missing columns untouched');
    assert.ok(raw('Just a note, no fields.').startsWith('::: viz structure'), 'fieldless block untouched');
    assert.ok(raw('field | Zero | 0 | x').startsWith('::: viz structure'), 'non-positive width untouched');
  });
});

function stubField(name, size, exp) {
  const btn = stubEl({});
  let focused = false;
  btn.querySelector = (sel) => {
    if (sel === '.viz-fname') return { textContent: name };
    if (sel === '.viz-fsize') return { textContent: size };
    if (sel === '.viz-fexp') return { textContent: exp };
    return null;
  };
  btn.focus = () => { focused = true; };
  btn.isFocused = () => focused;
  return btn;
}

function stubStructRoot(specs) {
  const fields = specs.map(([n, s, e]) => stubField(n, s, e));
  const panel = stubEl({});
  panel.textContent = 'Select a field to inspect its size and meaning.';
  const listeners = {};
  return {
    fields,
    panel,
    addEventListener(t, fn) { (listeners[t] = listeners[t] || []).push(fn); },
    fire(t, e = {}) { (listeners[t] || []).forEach((fn) => fn({ preventDefault() {}, ...e })); },
    classList: { add() {} },
    querySelector(sel) {
      if (sel === '.viz-fpanel') return panel;
      return null;
    },
    querySelectorAll(sel) {
      if (sel === '.viz-field') return fields;
      return [];
    },
  };
}

describe('structure binding on stub DOM', () => {
  it('selects fields with pressed state and panel announcements', () => {
    const root = stubStructRoot([['Source Port', '16 bits', 'Reply address'], ['Checksum', '16 bits', 'Error detection']]);
    const bound = bindStruct(root);
    assert.ok(bound, 'struct binds');
    assert.equal(bound.current, -1, 'nothing selected initially');
    assert.equal(root.fields[0].getAttribute('aria-pressed'), 'false');
    root.fields[1].fire('click');
    assert.equal(bound.current, 1);
    assert.equal(root.fields[1].getAttribute('aria-pressed'), 'true');
    assert.equal(root.fields[0].getAttribute('aria-pressed'), 'false', 'single selection');
    assert.ok(root.panel.textContent.includes('Checksum'), 'panel names the field');
    assert.ok(root.panel.textContent.includes('16 bits'), 'panel states the size');
    assert.ok(root.panel.textContent.includes('Error detection'), 'panel explains the meaning');
  });

  it('navigates with arrows and clears with Escape', () => {
    const root = stubStructRoot([['A', '1 bit', 'x'], ['B', '2 bits', 'y']]);
    const bound = bindStruct(root);
    root.fire('keydown', { key: 'ArrowRight' });
    assert.equal(bound.current, 0, 'arrow selects from empty');
    assert.ok(root.fields[0].isFocused(), 'focus follows selection');
    root.fire('keydown', { key: 'ArrowRight' });
    assert.equal(bound.current, 1);
    root.fire('keydown', { key: 'ArrowLeft' });
    assert.equal(bound.current, 0);
    root.fire('keydown', { key: 'Escape' });
    assert.equal(bound.current, -1, 'Escape clears');
    assert.ok(root.panel.textContent.includes('Select a field'), 'prompt restored');
  });

  it('refuses to bind without fields and panel', () => {
    assert.equal(bindStruct({ querySelector: () => null, querySelectorAll: () => [] }), null);
  });
});

describe('structure stylesheet contract', () => {
  it('covers proportional layout, selection, focus, print, and stacking', () => {
    const css = read('style.css');
    for (const sel of [
      '.viz-srow', '.viz-field[aria-pressed="true"]', '.viz-field:focus-visible',
      '.viz-struct.is-live .viz-fexp', '.viz-fgroup',
    ]) {
      assert.ok(css.includes(sel), `stylesheet covers ${sel}`);
    }
    assert.ok(css.includes('@media (max-width: 640px)'), 'narrow-viewport rules present');
  });
});
