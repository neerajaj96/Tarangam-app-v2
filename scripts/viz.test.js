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
import { transformCustomWidgets, parseTraceBody, parseTreeBody, parseGraphBody, parseGraphMode } from './widgets.js';
import { SCENES, SCENE_IDS } from './scenes.js';
import { createStepper, bindViz, bindTrace, bindTree, bindGraph, bindTabs, bindCompare, bindRtt, bindLab, bindStruct, calcRtt, VIZ_PLAY_INTERVAL_MS } from '../assets/viz.js';
import { LABS, LAB_IDS, getLab, validateLab, computeLab, formatInt, formatNum2 } from './viz-calcs.js';

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

describe('viz lab transform (generic registry + legacy rtt)', () => {
  it('renders the legacy rtt form through the generic lab', () => {
    const out = transformCustomWidgets('::: viz rtt Timing lab\nAssumes textbook mode.\n:::');
    assert.ok(out.includes('class="viz viz-lab"'), 'generic lab shell class');
    assert.ok(out.includes('data-lab="rtt"'), 'legacy form maps to the rtt calculation');
    for (const key of ['n', 'rtt', 't']) {
      assert.ok(out.includes(`data-in="${key}"`), `input ${key} present`);
    }
    for (const key of ['nonpersistent', 'persistent', 'pipelined']) {
      assert.ok(out.includes(`data-out="${key}"`), `result ${key} present`);
    }
    assert.ok(out.includes('not a measurement of real browser performance'), 'disclaimer fixed in output');
    assert.ok(out.includes('Assumes textbook mode'), 'author notes rendered');
    assert.ok(out.includes('type="number"'), 'native number inputs for mobile keyboards');
    assert.ok(out.includes('660 ms') && out.includes('410 ms') && out.includes('210 ms'), 'defaults precomputed at build');
    assert.ok(out.includes('Worked example (defaults)'), 'static worked example present');
    assert.ok(out.includes('data-act="reset"'), 'reset control present');
  });

  it('renders any registered calculation with formula and paired sliders', () => {
    const out = transformCustomWidgets('::: viz lab shannon Shannon lab\nAssume ideal coding.\n:::');
    assert.ok(out.includes('data-lab="shannon"'), 'lab id wired');
    assert.ok(out.includes('data-in="b"') && out.includes('data-in="db"') && out.includes('data-in="levels"'), 'inputs present');
    assert.ok(out.includes('type="range"'), 'sliders paired where the spec asks');
    assert.ok(out.includes('29,902 bps'), 'Shannon default precomputed');
    assert.ok(out.includes('aria-describedby'), 'inputs describe themselves for screen readers');
  });

  it('leaves unknown calculation ids raw for check.js', () => {
    const raw = '::: viz lab quark Lab\n1. One\n2. Two\n:::';
    assert.equal(transformCustomWidgets(raw), raw, 'unknown id untouched');
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
      getAttribute: () => null,
      querySelector: (sel) => {
        const m = /^\[data-in="([a-z]+)"\]$/.exec(sel);
        return m && inputs[m[1]] ? inputs[m[1]] : null;
      },
      querySelectorAll: (sel) => (sel === '[data-out]' ? outs : []),
    };
    const bound = bindLab(root, 'rtt');
    assert.ok(bound, 'generic lab binds legacy rtt markup');
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
    assert.equal(bindLab({ getAttribute: () => null, querySelector: () => null, querySelectorAll: () => [] }), null);
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

function fieldsOf(courseFile) {
  const t = read(`content/PCCST501/${courseFile}`);
  return t.split('\n').map((l) => l.trim()).filter((l) => l.toLowerCase().startsWith('field |'))
    .map((l) => l.split('|').map((p) => p.trim()));
}

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

describe('structure hardening: strict widths, groups, notes, labels', () => {
  const build = (body) => transformCustomWidgets(`::: viz structure T\n${body}\n:::`);

  it('rejects non-decimal widths that Number() would accept', () => {
    for (const bad of ['field | X | 0x10 | y', 'field | X | 1e2 | y', 'field | X | +16 | y', 'field | X | 16.5 | y', 'field | X |  | y']) {
      assert.ok(build(bad).startsWith('::: viz structure'), `rejected: ${bad}`);
    }
    const ok = build('field | X | 16 | y');
    assert.ok(ok.includes('data-fields="1"'), 'plain decimal accepted');
  });

  it('carries a group label across a blank line instead of dropping it', () => {
    const out = build('group | Control\n\nfield | Flags | 9 | signals');
    assert.ok(out.includes('Control'), 'group label preserved');
    assert.ok(out.includes('data-fields="1"'), 'field parsed');
  });

  it('preserves multi-paragraph notes instead of merging them', () => {
    const out = build('field | A | 8 | x\n\nFirst paragraph.\n\nSecond paragraph.\n:::'.replace(/\n:::$/, ''));
    const notes = out.split('<div class="viz-notes">')[1] || '';
    assert.ok(notes.includes('First paragraph') && notes.includes('Second paragraph'), 'both paragraphs kept');
  });

  it('numbers row aria-labels distinctly', () => {
    const out = build('field | A | 8 | x\n\nfield | B | 8 | y');
    assert.ok(out.includes('Fields row 1 of 2') && out.includes('Fields row 2 of 2'), 'distinct row labels');
  });

  it('keeps every field explanation in static output (no-JS contract)', () => {
    const out = build('field | Checksum | 16 | Error detection here');
    assert.ok(out.includes('Error detection here'), 'meaning present without JS');
    assert.ok(out.includes('role="status"'), 'live panel present for enhancement');
  });
});

describe('reference header accuracy (UDP 64 bits, TCP 160 bits)', () => {
  it('UDP header is exactly four 16-bit fields', () => {
    const fields = fieldsOf('m2_02_udp_segment_structure_and_checksum.md');
    assert.deepEqual(fields.map((p) => p[1]), ['Source Port', 'Destination Port', 'Length', 'Checksum']);
    const bits = fields.map((p) => parseInt(p[2], 10));
    assert.ok(bits.every((b) => b === 16), 'all fields 16 bits');
    assert.equal(bits.reduce((a, b) => a + b, 0), 64, 'total 64 bits = 8 bytes');
  });

  it('TCP header is the ten standard minimum fields totaling 160 bits', () => {
    const fields = fieldsOf('m2_03_tcp_segment_structure_and_rtt.md');
    assert.deepEqual(
      fields.map((p) => p[1]),
      ['Source Port', 'Destination Port', 'Sequence Number', 'Acknowledgment Number',
        'Data Offset', 'Reserved', 'Flags', 'Window', 'Checksum', 'Urgent Pointer']);
    assert.deepEqual(fields.map((p) => parseInt(p[2], 10)), [16, 16, 32, 32, 4, 3, 9, 16, 16, 16]);
    assert.equal(fields.reduce((a, p) => a + parseInt(p[2], 10), 0), 160, 'total 160 bits = 20 bytes');
  });

  it('TCP control region names real flags without inventing fields', () => {
    const t = read('content/PCCST501/m2_03_tcp_segment_structure_and_rtt.md');
    assert.ok(t.includes('SYN') && t.includes('FIN'), 'flag names present');
    assert.ok(!/NS, CWR, ECE/i.test(t.split('::: viz structure')[1].split(':::')[0] || ''), 'no invented flag claims in widget');
  });
});

describe('structure stylesheet hardening', () => {
  it('stacks rows on narrow screens without viewport traps or hex colors', () => {
    const css = read('style.css');
    const block = css.slice(css.indexOf('Annotated structure viewer'));
    assert.ok(block.includes('.viz-srow { flex-direction: column; }'), 'stacked mobile rows');
    assert.ok(!/width:\s*100vw/.test(block), 'no viewport-width traps');
    assert.ok(!/#[0-9a-fA-F]{3,8}/.test(block), 'theme variables only, all modes inherit');
    assert.ok(block.includes('.viz-field:focus-visible'), 'visible keyboard focus');
    assert.ok(block.includes('.viz-struct.is-live .viz-fexp'), 'live collapse rule present');
  });
});

describe('lab calculation registry', () => {
  it('registers exactly the rtt and shannon families with complete specs', () => {
    assert.deepEqual(LAB_IDS, ['rtt', 'shannon']);
    assert.equal(getLab('quark'), null, 'unknown id resolves to null');
    for (const id of LAB_IDS) {
      const spec = getLab(id);
      assert.ok(typeof spec.formula === 'string' && spec.formula.length > 0, `${id} shows its formula`);
      assert.ok(typeof spec.disclaimer === 'string' && spec.disclaimer.length > 0, `${id} states its limits`);
      assert.ok(spec.inputs.length > 0 && spec.outputs.length > 0, `${id} declares inputs and outputs`);
      for (const inp of spec.inputs) {
        for (const k of ['key', 'label', 'unit', 'min', 'max', 'step', 'def', 'desc']) {
          assert.ok(inp[k] !== undefined, `${id}.${inp.key} declares ${k}`);
        }
        assert.ok(inp.min <= inp.def && inp.def <= inp.max, `${id}.${inp.key} default inside bounds`);
      }
      for (const o of spec.outputs) {
        for (const k of ['key', 'label', 'unit', 'meaning']) {
          assert.ok(o[k] !== undefined, `${id} output ${o.key} declares ${k}`);
        }
      }
      assert.ok(typeof spec.validate === 'function' && typeof spec.compute === 'function', `${id} separates validation from math`);
      assert.ok(typeof spec.explain === 'function', `${id} explains worked numbers`);
    }
  });

  it('contains no eval or generated-code execution', () => {
    for (const f of ['assets/viz-calcs.js', 'assets/viz.js']) {
      const src = read(f);
      assert.ok(!/eval\s*\(/.test(src), `${f} has no eval`);
      assert.ok(!/new\s+Function\s*\(/.test(src), `${f} has no Function constructor`);
    }
  });
});

describe('Shannon calculation correctness', () => {
  it('matches the lesson worked example: 29,902 vs 18,000, Nyquist binds', () => {
    const { errors, clean } = validateLab('shannon', { b: '3000', db: '30', levels: '8' });
    assert.deepEqual(errors, {}, 'lesson defaults validate clean');
    const r = computeLab('shannon', clean);
    assert.equal(r.snr, 1000, '30 dB converts to a linear ratio of 1000');
    assert.equal(Math.round(r.shannon), 29902, 'Shannon capacity rounds to the lesson value');
    assert.equal(r.nyquist, 18000, 'Nyquist ceiling exact');
    assert.equal(r.verdict, 18000, 'lower ceiling governs');
  });

  it('scales linearly with bandwidth and logarithmically with SNR', () => {
    const base = computeLab('shannon', { b: 3000, db: 30, levels: 1024 });
    const doubled = computeLab('shannon', { b: 6000, db: 30, levels: 1024 });
    assert.ok(Math.abs(doubled.shannon - 2 * base.shannon) < 1, 'doubling B doubles capacity');
    const low = computeLab('shannon', { b: 3000, db: 20, levels: 1024 });
    assert.ok(low.shannon < base.shannon && low.shannon > base.shannon / 2, 'tenfold SNR power costs a fraction of capacity');
  });
});

describe('lab input validation', () => {
  it('rejects missing, non-numeric, fractional, and out-of-range inputs', () => {
    assert.ok(validateLab('rtt', { n: '', rtt: '50', t: '10' }).errors.n.includes('Enter'), 'missing flagged');
    assert.ok(validateLab('rtt', { n: 'abc', rtt: '50', t: '10' }).errors.n.includes('number'), 'non-numeric flagged');
    assert.ok(validateLab('rtt', { n: '2.5', rtt: '50', t: '10' }).errors.n.includes('whole'), 'fractional integer flagged');
    assert.ok(validateLab('rtt', { n: '-1', rtt: '50', t: '10' }).errors.n.includes('between'), 'negative flagged');
    assert.ok(validateLab('shannon', { b: '0', db: '30', levels: '8' }).errors.b, 'zero bandwidth invalid');
    assert.ok(validateLab('shannon', { b: '3000', db: '30', levels: '1' }).errors.levels, 'single level invalid');
    assert.ok(validateLab('shannon', { b: '3000', db: '200', levels: '8' }).errors.db, 'absurd SNR invalid');
  });

  it('never coerces: invalid inputs produce no numbers', () => {
    const { errors, clean } = validateLab('shannon', { b: 'nope', db: '30', levels: '8' });
    assert.ok(errors.b && !('b' in clean), 'bad input excluded from clean values');
  });
});

describe('deterministic formatting', () => {
  it('groups thousands without locale dependence', () => {
    assert.equal(formatInt(29902), '29,902');
    assert.equal(formatInt(8), '8');
    assert.equal(formatNum2(1000), '1000');
    assert.equal(formatNum2(6.658), '6.66');
  });
});

function stubLabRoot(specId, values) {
  const spec = getLab(specId);
  const listeners = {};
  const inputs = {};
  const ranges = {};
  const errs = {};
  for (const inp of spec.inputs) {
    const num = stubEl({});
    num.value = String(values[inp.key]);
    num.addEventListener = (t, fn) => { (listeners[`in:${inp.key}:${t}`] = listeners[`in:${inp.key}:${t}`] || []).push(fn); };
    inputs[inp.key] = num;
    const range = stubEl({});
    range.value = String(values[inp.key]);
    range.addEventListener = (t, fn) => { (listeners[`range:${inp.key}:${t}`] = listeners[`range:${inp.key}:${t}`] || []).push(fn); };
    ranges[inp.key] = range;
    errs[inp.key] = stubEl({});
    errs[inp.key].setAttribute('hidden', '');
  }
  const outs = spec.outputs.map((o) => {
    const el = stubEl({});
    el.getAttribute = (a) => (a === 'data-out' ? o.key : null);
    return el;
  });
  const status = stubEl({});
  const reset = stubEl({});
  reset.addEventListener = (t, fn) => { (listeners[`reset:${t}`] = listeners[`reset:${t}`] || []).push(fn); };
  return {
    spec, inputs, ranges, errs, outs, status, reset, listeners,
    classList: { add() {} },
    getAttribute: (a) => (a === 'data-lab' ? specId : null),
    querySelector: (sel) => {
      let m = /^\[data-in="([a-z]+)"\]$/.exec(sel);
      if (m && inputs[m[1]]) return inputs[m[1]];
      m = /^\[data-range="([a-z]+)"\]$/.exec(sel);
      if (m && ranges[m[1]]) return ranges[m[1]];
      m = /^\[data-err="([a-z]+)"\]$/.exec(sel);
      if (m && errs[m[1]]) return errs[m[1]];
      if (sel === '.viz-status') return status;
      if (sel === '[data-act="reset"]') return reset;
      return null;
    },
    querySelectorAll: (sel) => (sel === '[data-out]' ? outs : []),
    fireIn: (key) => { (listeners[`in:${key}:input`] || []).forEach((fn) => fn()); },
    fireRange: (key) => { (listeners[`range:${key}:input`] || []).forEach((fn) => fn()); },
    fireReset: () => { (listeners['reset:click'] || []).forEach((fn) => fn()); },
  };
}

describe('generic lab binding', () => {
  it('shows validation errors instead of misleading numbers', () => {
    const root = stubLabRoot('rtt', { n: '5', rtt: '50', t: '10' });
    const bound = bindLab(root);
    assert.ok(bound, 'lab binds');
    root.inputs.n.value = '-3';
    root.fireIn('n');
    assert.equal(root.errs.n.getAttribute('hidden'), null, 'error revealed');
    assert.ok(root.errs.n.textContent.includes('between'), 'message states the bounds');
    assert.equal(root.inputs.n.getAttribute('aria-invalid'), 'true', 'input flagged invalid');
    assert.equal(root.outs[0].textContent, '—', 'no misleading output');
    assert.ok(root.status.textContent.includes('Fix 1'), 'status counts the problem');
  });

  it('keeps paired number and range controls in sync both ways', () => {
    const root = stubLabRoot('rtt', { n: '5', rtt: '50', t: '10' });
    bindLab(root);
    root.ranges.rtt.value = '100';
    root.fireRange('rtt');
    assert.equal(root.inputs.rtt.value, '100', 'slider writes the number field');
    assert.equal(root.outs[0].textContent, '1,260 ms', 'outputs follow the slider');
    root.inputs.rtt.value = '50';
    root.fireIn('rtt');
    assert.equal(root.ranges.rtt.value, '50', 'number field writes the slider back');
  });

  it('reset restores spec defaults and clears errors', () => {
    const root = stubLabRoot('shannon', { b: '3000', db: '30', levels: '8' });
    bindLab(root);
    root.inputs.db.value = '9999';
    root.fireIn('db');
    assert.equal(root.outs[1].textContent, '—', 'invalid blanks outputs');
    root.fireReset();
    assert.equal(root.inputs.db.value, '30', 'default restored');
    assert.equal(root.outs[1].textContent, '29,902 bps', 'defaults recomputed');
    assert.equal(root.errs.db.getAttribute('hidden'), '', 'errors cleared');
  });

  it('labels every control and wires accessible output', () => {
    const out = transformCustomWidgets('::: viz lab shannon Lab\n:::');
    assert.ok(out.includes('aria-describedby'), 'inputs reference descriptions and errors');
    assert.ok(out.includes('role="status"'), 'summary announced politely');
    assert.ok(out.includes('for="vizl'), 'labels target their inputs');
    assert.ok(out.includes('<button type="button"'), 'reset is a native button');
  });

  it('static output carries formula, meanings, worked numbers, and defaults', () => {
    const out = transformCustomWidgets('::: viz lab shannon Lab\nAssume ideal coding.\n:::');
    assert.ok(out.includes('log_2'), 'governing formula present without JS');
    assert.ok(out.includes('Channel bandwidth'), 'input meanings present without JS');
    assert.ok(out.includes('Worked example (defaults)'), 'worked example present without JS');
    assert.ok(out.includes('29,902 bps'), 'default result precomputed without JS');
    assert.ok(out.includes('Assume ideal coding'), 'author notes rendered');
  });
});

describe('lab registry structural guarantees', () => {
  it('keeps every default valid and every bound coherent', () => {
    for (const id of LAB_IDS) {
      const spec = getLab(id);
      for (const inp of spec.inputs) {
        assert.ok(inp.min <= inp.def && inp.def <= inp.max, `${id}.${inp.key} default inside [min, max]`);
        assert.ok(inp.step > 0 && inp.sliderStep > 0, `${id}.${inp.key} positive steps`);
        assert.ok(inp.desc && inp.desc.length > 0, `${id}.${inp.key} explains itself`);
        assert.ok(inp.unit && inp.unit.length > 0, `${id}.${inp.key} declares a unit`);
      }
      for (const o of spec.outputs) {
        assert.ok(o.unit !== undefined && o.meaning, `${id} output ${o.key} has unit and meaning`);
        assert.ok(o.fmt === 'int' || o.fmt === 'num2', `${id} output ${o.key} declares a formatter`);
      }
      const { errors } = validateLab(id, Object.fromEntries(spec.inputs.map((i) => [i.key, String(i.def)])));
      assert.deepEqual(errors, {}, `${id} defaults validate clean`);
      assert.ok(spec.disclaimer.length > 0 && spec.formula.length > 0, `${id} shows formula and limits`);
    }
  });

  it('issues distinct ids for repeated labs on one page', () => {
    const out = transformCustomWidgets('::: viz lab rtt One\nN defaults.\n:::\n\n::: viz lab rtt Two\nN defaults.\n:::');
    const ids = [...out.matchAll(/for="vizl(\d+)-n"/g)].map((m) => m[1]);
    assert.deepEqual(ids, ['1', '2'], 'per-widget id counter keeps aria wiring distinct');
  });
});

describe('lab hardening: formatting, sync, fallback', () => {
  it('keeps small-but-nonzero ratios readable', () => {
    assert.equal(formatNum2(0.001), '0.001', 'vanishing SNR still prints');
    assert.equal(formatNum2(6.658), '6.66', 'mid-range stays short');
    assert.equal(formatNum2(1000), '1000', 'integers stay plain');
    assert.equal(formatNum2(0), '0', 'true zero prints as zero');
  });

  it('never parks the slider on an invalid number', () => {
    const root = stubLabRoot('rtt', { n: '5', rtt: '50', t: '10' });
    bindLab(root);
    root.ranges.rtt.value = '50';
    root.inputs.rtt.value = '-20';
    root.fireIn('rtt');
    assert.equal(root.ranges.rtt.value, '50', 'slider keeps last good value');
    assert.equal(root.inputs.rtt.getAttribute('aria-invalid'), 'true', 'number flagged instead');
    root.inputs.rtt.value = '60';
    root.fireIn('rtt');
    assert.equal(root.ranges.rtt.value, '60', 'valid numbers still sync');
  });
});

function stubTraceDOM(stateCount, opCount) {
  const states = Array.from({ length: stateCount }, (_, i) => stubEl({ 'data-i': String(i) }));
  const ops = Array.from({ length: opCount }, (_, i) => stubEl({ 'data-i': String(i) }));
  const status = stubEl();
  const buttons = ['prev', 'play', 'next', 'reset'].map((act) => stubEl({ 'data-act': act }));
  const controls = stubEl();
  controls.querySelectorAll = () => buttons;
  const listeners = {};
  return {
    states,
    ops,
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
      if (sel === '.viz-tstate') return states;
      if (sel === '.viz-top') return ops;
      return [];
    },
  };
}

function stubTraceRoot(stateCount) {
  return stubTraceDOM(stateCount, Math.max(0, stateCount - 1));
}

const BUBBLE_TRACE = '::: viz trace Bubble pass on [5, 2, 4]\n'
  + 'state | `[5, 2, 4]` — start of pass\n'
  + 'op | Compare indices 0 and 1: 5 > 2, so swap\n'
  + 'state | [==2==, ==5==, 4] — exchanged\n'
  + 'op | Compare indices 1 and 2: 5 > 4, so swap\n'
  + 'state | [2, ==4==, ==5==] — exchanged\n:::';

describe('viz trace transform', () => {
  it('renders states, ops, highlights, controls, and live status', () => {
    const out = transformCustomWidgets(BUBBLE_TRACE);
    assert.ok(out.includes('class="viz viz-trace"'), 'trace shell class');
    assert.ok(out.includes('data-states="3"'), 'state count advertised');
    assert.ok(out.includes('Bubble pass on [5, 2, 4]'), 'title rendered');
    assert.ok(out.includes('State 0') && out.includes('State 2'), 'states labeled in order');
    assert.ok(out.includes('<mark>2</mark>') && out.includes('<mark>5</mark>'), 'changed portions emphasized');
    assert.ok(out.includes('class="viz-top"'), 'operation rows rendered');
    assert.ok(out.includes('State 1 of 3'), 'initial status names the first state');
    for (const act of ['prev', 'play', 'next', 'reset']) {
      assert.ok(out.includes(`data-act="${act}"`), `control ${act} present`);
    }
    assert.ok(out.includes('role="status"'), 'polite live status region');
    assert.ok(!/^:::\n:::/m.test(out), 'no consecutive closers');
  });

  it('never corrupts == inside code spans or math', () => {
    const out = transformCustomWidgets(
      '::: viz trace Guards\nstate | Start `if (a == b)` here\nop | Check `$x == y$` next\nstate | End `if (a == b)` done\n:::'
    );
    assert.ok(out.includes('<code>if (a == b)</code>'), 'code span intact');
    assert.ok(!out.includes('<mark>'), 'no highlight invented inside code or math');
    assert.ok(out.includes('$x == y$'), 'math intact');
  });

  it('leaves structurally invalid traces raw for check.js', () => {
    const cases = {
      'single state': '::: viz trace Solo\nstate | Only one\n:::',
      'two states plus zero ops': '::: viz trace NoOps\nstate | A\nstate | B\n:::',
      'two states plus two ops': '::: viz trace ExtraOp\nstate | A\nop | One\nstate | B\nop | Two\n:::',
      'three states plus one op': '::: viz trace ShortOps\nstate | A\nop | One\nstate | B\nstate | C\n:::',
      'three states plus three ops': '::: viz trace ManyOps\nstate | A\nop | One\nstate | B\nop | Two\nstate | C\nop | Three\n:::',
      'starts with op': '::: viz trace OpFirst\nop | Before anything\nstate | A\nop | Go\nstate | B\n:::',
      'ends with op': '::: viz trace OpLast\nstate | A\nop | One\nstate | B\nop | Trailing\n:::',
      'consecutive states': '::: viz trace TwoStates\nstate | A\nop | One\nstate | B\nstate | C\nop | Two\nstate | D\n:::',
      'consecutive ops': '::: viz trace TwoOps\nstate | A\nop | One\nop | Two\nstate | B\n:::',
      'empty state': '::: viz trace EmptyState\nstate | \nop | x\nstate | B\n:::',
      'empty operation': '::: viz trace EmptyOp\nstate | A\nop | \nstate | B\n:::',
      'unknown line': '::: viz trace Mystery\nstate | A\nRemember this step\nop | Go\nstate | B\n:::',
      'unknown prefix': '::: viz trace Weird\nstate | A\nfoo | bar\nop | Go\nstate | B\n:::',
    };
    for (const [label, raw] of Object.entries(cases)) {
      const out = transformCustomWidgets(raw);
      assert.equal(out, raw, `${label} stays raw: ${raw.slice(0, 60)}`);
      assert.ok(!out.includes('viz-trace'), `${label} receives no live trace shell`);
      assert.ok(!out.includes('data-act='), `${label} receives no live trace controls`);
    }
  });

  it('accepts the minimal valid trace: 2 states plus 1 operation', () => {
    const out = transformCustomWidgets('::: viz trace Minimal\nstate | A\nop | Go\nstate | B\n:::');
    assert.ok(out.includes('class="viz viz-trace"'), 'trace shell class');
    assert.ok(out.includes('data-states="2"'), 'state count advertised');
    assert.ok(out.includes('State 0') && out.includes('State 1'), 'both states labeled');
    assert.ok(out.includes('class="viz-top"'), 'single operation row rendered');
    assert.ok(out.includes('State 1 of 2'), 'status names the first of two states');
  });

  it('accepts 3 states plus 2 operations', () => {
    const out = transformCustomWidgets(
      '::: viz trace Three\nstate | A\nop | First\nstate | B\nop | Second\nstate | C\n:::'
    );
    assert.ok(out.includes('data-states="3"'), 'state count advertised');
    assert.ok(out.includes('State 0') && out.includes('State 2'), 'states labeled in order');
    assert.equal((out.match(/class="viz-top"/g) || []).length, 2, 'exactly two operation rows');
    assert.ok(out.includes('State 1 of 3'), 'status names the first of three states');
  });

  it('renders multiple independent traces on one page', () => {
    const out = transformCustomWidgets(
      '::: viz trace First\nstate | A\nop | Go\nstate | B\n:::\n\n::: viz trace Second\nstate | C\nop | Run\nstate | D\n:::'
    );
    assert.ok(out.includes('First') && out.includes('Second'), 'both titles rendered');
    assert.equal((out.match(/class="viz viz-trace"/g) || []).length, 2, 'two live trace shells');
    assert.equal((out.match(/data-states="2"/g) || []).length, 2, 'each trace advertises its own count');
  });

  it('renders explicit notes below the widget without affecting the sequence', () => {
    const out = transformCustomWidgets(
      '::: viz trace T\nstate | A\nop | Go\nstate | B\nnote | Read this after.\n:::'
    );
    assert.ok(out.includes('viz-notes') && out.includes('Read this after'), 'explicit note rendered below');
    assert.ok(out.includes('data-states="2"'), 'notes do not inflate the state count');
    assert.equal((out.match(/class="viz-top"/g) || []).length, 1, 'notes do not become ops');
  });

  it('keeps interleaved notes outside the state/op alternation', () => {
    const out = transformCustomWidgets(
      '::: viz trace T\nnote | Setup context\nstate | A\nnote | Mid context\nop | Go\nnote | Between\nstate | B\nnote | Closing\n:::'
    );
    assert.ok(out.includes('data-states="2"'), 'notes anywhere keep the trace valid');
    assert.ok(out.includes('Setup context') && out.includes('Closing'), 'all notes rendered');
  });
});

describe('trace binding on stub DOM', () => {
  it('reveals cumulatively with aria-current only on the newest state', () => {
    const root = stubTraceRoot(3);
    const bound = bindTrace(root);
    assert.ok(bound, 'multi-state trace binds');
    assert.equal(root.status.textContent, 'State 1 of 3');
    assert.equal(root.states[0].getAttribute('aria-current'), 'step');
    assert.equal(root.states[1].getAttribute('hidden'), '');
    assert.equal(root.ops[0].getAttribute('hidden'), '');
    bound.actions.next();
    assert.equal(root.status.textContent, 'State 2 of 3');
    assert.equal(root.states[0].getAttribute('hidden'), null, 'earlier states stay visible');
    assert.equal(root.states[0].getAttribute('aria-current'), null, 'only newest state is current');
    assert.equal(root.states[1].getAttribute('aria-current'), 'step');
    assert.equal(root.ops[0].getAttribute('hidden'), null, 'producing op revealed');
    assert.equal(root.ops[1].getAttribute('hidden'), '', 'future op hidden');
    bound.actions.reset();
    assert.equal(root.status.textContent, 'State 1 of 3');
    assert.equal(root.ops[0].getAttribute('hidden'), '', 'reset hides ops again');
  });

  it('clamps at both ends and disables edge buttons', () => {
    const root = stubTraceRoot(2);
    const bound = bindTrace(root);
    const byAct = {};
    root.buttons.forEach((b) => { byAct[b.getAttribute('data-act')] = b; });
    assert.equal(byAct.prev.getAttribute('disabled'), '', 'prev disabled at first state');
    bound.actions.prev();
    assert.equal(root.status.textContent, 'State 1 of 2', 'prev clamps');
    byAct.next.fire('click');
    assert.equal(root.status.textContent, 'State 2 of 2');
    assert.equal(byAct.next.getAttribute('disabled'), '', 'next disabled at last state');
    byAct.next.fire('click');
    assert.equal(root.status.textContent, 'State 2 of 2', 'next clamps');
  });

  it('moves with arrows, Home, and End without stealing Space', () => {
    const root = stubTraceRoot(3);
    bindTrace(root);
    let prevented = 0;
    const key = (k) => root.fire('keydown', { key: k, preventDefault() { prevented += 1; } });
    key('ArrowRight');
    assert.equal(root.status.textContent, 'State 2 of 3');
    key('End');
    assert.equal(root.status.textContent, 'State 3 of 3', 'End jumps to last state');
    key('ArrowRight');
    assert.equal(root.status.textContent, 'State 3 of 3', 'End clamps, not wraps');
    key('Home');
    assert.equal(root.status.textContent, 'State 1 of 3');
    key('ArrowLeft');
    assert.equal(root.status.textContent, 'State 1 of 3', 'Home clamps, not wraps');
    assert.equal(prevented, 5, 'handled keys stay local');
  });

  it('autoplays through states and stops at the last one', () => {
    const root = stubTraceRoot(3);
    const bound = bindTrace(root, { timer: { set: (fn) => { fn(); fn(); fn(); return 7; }, clear: () => {} } });
    const byAct = {};
    root.buttons.forEach((b) => { byAct[b.getAttribute('data-act')] = b; });
    byAct.play.fire('click');
    assert.equal(root.status.textContent, 'State 3 of 3');
    assert.equal(bound.machine.playing, false, 'parked after final tick');
  });

  it('removes Play entirely under prefers-reduced-motion', () => {
    const realWindow = globalThis.window;
    globalThis.window = { matchMedia: () => ({ matches: true }) };
    try {
      const root = stubTraceRoot(2);
      bindTrace(root);
      const byAct = {};
      root.buttons.forEach((b) => { byAct[b.getAttribute('data-act')] = b; });
      assert.equal(byAct.play.removed, true, 'no autoplay surface under reduced motion');
      byAct.next.fire('click');
      assert.equal(root.status.textContent, 'State 2 of 2', 'manual stepping still instant');
    } finally {
      if (realWindow === undefined) delete globalThis.window;
      else globalThis.window = realWindow;
    }
  });

  it('leaves single-state traces static with dead controls hidden', () => {
    const root = stubTraceRoot(1);
    assert.equal(bindTrace(root), null, 'nothing to stage');
    assert.equal(root.controls.getAttribute('hidden'), '', 'useless controls hidden');
    assert.equal(root.states[0].getAttribute('hidden'), null, 'sole state stays visible');
  });

  it('keeps widgets independent on one page', () => {
    const first = stubTraceRoot(3);
    const second = stubTraceRoot(2);
    const a = bindTrace(first);
    const b = bindTrace(second);
    a.actions.next();
    a.actions.next();
    assert.equal(first.status.textContent, 'State 3 of 3');
    assert.equal(second.status.textContent, 'State 1 of 2', 'second widget untouched');
    b.actions.next();
    assert.equal(first.status.textContent, 'State 3 of 3', 'first widget untouched');
  });

  it('fails safely when op counts mismatch the state invariant', () => {
    const mismatched = [[2, 0], [2, 2], [3, 1], [3, 3]];
    for (const [s, o] of mismatched) {
      const root = stubTraceDOM(s, o);
      assert.equal(bindTrace(root), null, `${s} states plus ${o} ops does not bind`);
      assert.equal(root.controls.getAttribute('hidden'), '', `${s}/${o}: dead controls hidden`);
      assert.equal(root.states[0].getAttribute('hidden'), null, `${s}/${o}: first state stays readable`);
    }
  });

  it('leaves existing flow, stepper, lab, and structure widgets unaffected', () => {
    const flow = transformCustomWidgets('::: viz flow Tour\n1. One\n2. Two\n:::');
    assert.ok(flow.includes('class="viz viz-flow"') && flow.includes('data-steps="2"'), 'flow still enhances');
    const stepper = transformCustomWidgets('::: viz stepper Tour\n- One\n- Two\n:::');
    assert.ok(stepper.includes('class="viz viz-stepper"'), 'stepper still enhances');
    const lab = transformCustomWidgets('::: viz lab rtt Lab\nNotes.\n:::');
    assert.ok(lab.includes('class="viz viz-lab"') && lab.includes('data-lab="rtt"'), 'lab still enhances');
    const struct = transformCustomWidgets('::: viz structure T\nfield | A | 8 | meaning\n:::');
    assert.ok(struct.includes('class="viz viz-struct"'), 'structure still enhances');
  });
});

describe('trace machine and stylesheet contract', () => {
  it('parks the machine on last() without wrapping', () => {
    const m = createStepper(3);
    assert.equal(m.last(), 2, 'last jumps to final index');
    assert.equal(m.playing, false, 'last never starts playback');
    assert.equal(m.play(), false, 'play at end stays off');
  });

  it('styles trace states, ops, marks, and print fallback', () => {
    const css = read('style.css');
    for (const sel of [
      '.viz-trace-list', '.viz-tstate[aria-current="step"]', '.viz-top',
      '.viz-slabel', '.viz-trace mark', '.viz-trace.is-live li[hidden]',
    ]) {
      assert.ok(css.includes(sel), `stylesheet covers ${sel}`);
    }
    assert.ok(!/width:\s*100vw/.test(css), 'no viewport-width traps introduced');
  });
});

const SEARCH_TREE = '::: viz tree Tiny search tree\n'
  + 'node | start | Start\n'
  + 'node | a | A | start\n'
  + 'node | b | B | start\n'
  + 'node | c | C | a\n'
  + 'node | d | D | a\n'
  + 'node | e | E | b\n:::';

describe('viz tree transform (valid)', () => {
  it('renders a one-node tree with no edges', () => {
    const out = transformCustomWidgets('::: viz tree Solo\nnode | s | Only\n:::');
    assert.ok(out.includes('class="viz viz-tree"'), 'tree shell class');
    assert.ok(out.includes('data-nodes="1"'), 'node count advertised');
    assert.ok(out.includes('Only'), 'label rendered');
    assert.ok(!out.includes('viz-tedge'), 'no edges without children');
    assert.ok(out.includes('role="status"'), 'polite live status region');
    assert.ok(out.includes('<button type="button" class="viz-treenode"'), 'native button for keyboard use');
  });

  it('renders root plus children with parent-child edges', () => {
    const out = transformCustomWidgets('::: viz tree T\nnode | r | Root\nnode | a | A | r\nnode | b | B | r\n:::');
    assert.ok(out.includes('data-nodes="3"'), 'node count advertised');
    assert.equal((out.match(/class="viz-tedge"/g) || []).length, 2, 'one edge per non-root node');
    assert.equal((out.match(/class="viz-treenode"/g) || []).length, 3, 'one button per node');
    assert.ok(out.includes('child of Root'), 'parent relationship stated in the static list');
    assert.ok(out.includes('2 children'), 'branching stated in the static list');
  });

  it('renders multiple levels with depth facts', () => {
    const out = transformCustomWidgets(SEARCH_TREE);
    assert.ok(out.includes('data-nodes="6"'), 'node count advertised');
    assert.equal((out.match(/class="viz-tedge"/g) || []).length, 5, 'edges number nodes minus one');
    assert.ok(out.includes('level 0') && out.includes('level 2'), 'depth levels stated');
    assert.ok(out.includes('leaf'), 'leaves identified');
    for (const label of ['Start', '>A<', '>B<', '>C<', '>D<', '>E<']) {
      assert.ok(out.includes(label), `node value ${label} present`);
    }
  });

  it('renders deterministically with document-order siblings', () => {
    const a = transformCustomWidgets(SEARCH_TREE);
    const b = transformCustomWidgets(SEARCH_TREE);
    assert.equal(a, b, 'identical input renders identically');
    const swapped = transformCustomWidgets(SEARCH_TREE.replace('node | a | A | start\nnode | b | B | start', 'node | b | B | start\nnode | a | A | start'));
    assert.ok(swapped.indexOf('data-node="b"') < swapped.indexOf('data-node="a"'), 'sibling order follows document order');
  });

  it('escapes labels instead of injecting markup', () => {
    const out = transformCustomWidgets('::: viz tree T\nnode | r | <b>Root</b>\nnode | a | A & B | r\n:::');
    assert.ok(!out.includes('<b>Root</b>'), 'no raw markup injected');
    assert.ok(out.includes('&lt;b&gt;Root&lt;/b&gt;') && out.includes('A &amp; B'), 'labels escaped in diagram and list');
  });

  it('uses the tiny AI search-tree reference shape', () => {
    const t = read('content/PECST522/m2_01_uninformed_search_dfs_bfs_ucs.md');
    const block = t.match(/::: viz tree([\s\S]*?)\n:::/);
    assert.ok(block, 'reference block present in the uninformed-search note');
    const out = transformCustomWidgets(block[0]);
    assert.ok(out.includes('class="viz viz-tree"'), 'reference renders live');
    assert.ok(out.includes('data-nodes="6"'), 'reference has six nodes');
    assert.equal((out.match(/class="viz-tedge"/g) || []).length, 5, 'reference edges number nodes minus one');
  });
});

describe('viz tree transform (invalid stays raw)', () => {
  it('rejects every non-tree shape without guessing', () => {
    const cases = {
      'zero nodes': '::: viz tree Empty\n\n\n:::',
      'duplicate ids': '::: viz tree Dup\nnode | r | R\nnode | a | A | r\nnode | a | Again | r\n:::',
      'duplicate parent relationship': '::: viz tree Reparent\nnode | r | R\nnode | a | A | r\nnode | b | B | r\nnode | a | A | b\n:::',
      'missing parent': '::: viz tree Orphan\nnode | r | R\nnode | a | A | ghost\n:::',
      'multiple roots': '::: viz tree Forest\nnode | a | A\nnode | b | B\n:::',
      'cycle': '::: viz tree Loop\nnode | r | R\nnode | a | A | r\nnode | x | X | y\nnode | y | Y | x\n:::',
      'disconnected component': '::: viz tree Stray\nnode | r | R\nnode | a | A | r\nnode | x | X | y\nnode | y | Y | z\nnode | z | Z | y\n:::',
      'empty id': '::: viz tree NoId\nnode |  | Nameless\nnode | r | R\n:::',
      'empty label': '::: viz tree NoLabel\nnode | r | \n:::',
      'empty parent': '::: viz tree NoParent\nnode | r | R\nnode | a | A | \n:::',
      'self-parent': '::: viz tree Self\nnode | r | R\nnode | x | X | x\n:::',
      'unknown line': '::: viz tree Mystery\nnode | r | R\nremember this\nnode | a | A | r\n:::',
      'two columns': '::: viz tree Short\nnode | r\n:::',
      'five columns': '::: viz tree Long\nnode | r | R | x | extra\n:::',
    };
    for (const [label, raw] of Object.entries(cases)) {
      const out = transformCustomWidgets(raw);
      assert.equal(out, raw, `${label} stays raw`);
      assert.ok(!out.includes('viz-tree'), `${label} receives no live tree shell`);
      assert.ok(!out.includes('viz-treenode'), `${label} receives no node controls`);
    }
  });

  it('exposes precise reasons through the shared validator', () => {
    assert.match(parseTreeBody('').reason, /at least 1 node/, 'zero nodes');
    assert.match(parseTreeBody('node | a | A\nnode | a | B').reason, /duplicate/, 'duplicate ids');
    assert.match(parseTreeBody('node | r | R\nnode | a | A | ghost').reason, /unknown tree parent/, 'missing parent');
    assert.match(parseTreeBody('node | a | A\nnode | b | B').reason, /exactly one root/, 'multiple roots');
    assert.match(parseTreeBody('node | r | R\nnode | x | X | y\nnode | y | Y | x').reason, /cycle/, 'cycle');
    assert.match(parseTreeBody('node |  | X').reason, /empty tree node id/, 'empty id');
    assert.match(parseTreeBody('node | a | ').reason, /empty tree node label/, 'empty label');
    assert.match(parseTreeBody('node | r | R\nnode | x | X | x').reason, /own parent/, 'self-parent');
    assert.match(parseTreeBody('node | r | R\nplain words').reason, /unknown tree line/, 'unknown line');
  });
});

function stubTreeNode(spec) {
  const attrs = { 'data-node': spec.id };
  if (spec.label !== undefined) attrs['data-label'] = spec.label;
  if (spec.parent !== undefined) attrs['data-parent'] = spec.parent;
  if (spec.kids !== undefined) attrs['data-kids'] = spec.kids;
  const btn = stubEl(attrs);
  btn.querySelector = (sel) => {
    if (sel === '.viz-tnid') return { textContent: spec.label ?? '' };
    if (sel === '.viz-tnmeta') return { textContent: spec.meta ?? '' };
    return null;
  };
  let focused = false;
  btn.focus = () => { focused = true; };
  btn.isFocused = () => focused;
  return btn;
}

function stubTreeDot(id) {
  const dot = stubEl({ 'data-node': id });
  const classes = new Set();
  dot.classList = {
    add: (c) => classes.add(c),
    remove: (c) => classes.delete(c),
    has: (c) => classes.has(c),
  };
  return dot;
}

function stubTreeRoot(specs) {
  const nodes = specs.map((s) => stubTreeNode(s));
  const dots = specs.map((s) => stubTreeDot(s.id));
  const panel = stubEl({});
  panel.textContent = 'Select a node to inspect its parent and children.';
  const listeners = {};
  return {
    nodes,
    dots,
    panel,
    addEventListener(t, fn) { (listeners[t] = listeners[t] || []).push(fn); },
    fire(t, e = {}) { (listeners[t] || []).forEach((fn) => fn({ preventDefault() {}, ...e })); },
    classList: { add() {} },
    querySelector(sel) {
      if (sel === '.viz-status') return panel;
      return null;
    },
    querySelectorAll(sel) {
      if (sel === '.viz-treenode') return nodes;
      if (sel === '.viz-tnode') return dots;
      return [];
    },
  };
}

const TREE_SPECS = [
  { id: 'start', label: 'Start', parent: '', kids: 'A, B' },
  { id: 'a', label: 'A', parent: 'Start', kids: 'C, D' },
  { id: 'b', label: 'B', parent: 'Start', kids: '' },
];

describe('tree binding on stub DOM', () => {
  it('selects on click with single pressed state, mirror, and status', () => {
    const root = stubTreeRoot(TREE_SPECS);
    const bound = bindTree(root);
    assert.ok(bound, 'tree binds');
    assert.equal(bound.current, -1, 'nothing selected initially');
    assert.ok(root.nodes.every((n) => n.getAttribute('aria-pressed') === 'false'), 'all unpressed initially');
    root.nodes[1].fire('click');
    assert.equal(bound.current, 1);
    assert.equal(root.nodes[1].getAttribute('aria-pressed'), 'true', 'clicked node pressed');
    assert.equal(root.nodes[0].getAttribute('aria-pressed'), 'false', 'single selection only');
    assert.ok(root.dots[1].classList.has('is-selected'), 'diagram mirror highlights');
    assert.ok(!root.dots[0].classList.has('is-selected'), 'mirror is single too');
    assert.ok(root.panel.textContent.includes('Selected'), 'status announces selection');
    assert.ok(root.panel.textContent.includes('A'), 'status names the node value');
    assert.ok(root.panel.textContent.includes('child of Start'), 'status states the parent relationship');
  });

  it('moves selection with arrows, Home, End, and clears with Escape', () => {
    const root = stubTreeRoot(TREE_SPECS);
    const bound = bindTree(root);
    root.fire('keydown', { key: 'ArrowDown' });
    assert.equal(bound.current, 0, 'arrow selects from empty');
    assert.ok(root.nodes[0].isFocused(), 'focus follows selection');
    root.fire('keydown', { key: 'ArrowDown' });
    assert.equal(bound.current, 1);
    root.fire('keydown', { key: 'ArrowUp' });
    assert.equal(bound.current, 0);
    root.fire('keydown', { key: 'End' });
    assert.equal(bound.current, 2, 'End jumps last');
    root.fire('keydown', { key: 'Home' });
    assert.equal(bound.current, 0, 'Home jumps first');
    root.fire('keydown', { key: 'Escape' });
    assert.equal(bound.current, -1, 'Escape clears');
    assert.ok(root.panel.textContent.includes('Select a node'), 'prompt restored');
    assert.ok(root.nodes.every((n) => n.getAttribute('aria-pressed') === 'false'), 'all unpressed after clear');
  });

  it('keeps multiple tree widgets independent', () => {
    const first = stubTreeRoot(TREE_SPECS);
    const second = stubTreeRoot(TREE_SPECS);
    const a = bindTree(first);
    const b = bindTree(second);
    a.select(2);
    assert.ok(first.panel.textContent.includes('B'), 'first selects B');
    assert.ok(second.panel.textContent.includes('Select a node'), 'second untouched');
    b.select(0);
    assert.ok(first.panel.textContent.includes('B'), 'first untouched by second');
  });

  it('selects under prefers-reduced-motion with no autoplay surface', () => {
    const realWindow = globalThis.window;
    globalThis.window = { matchMedia: () => ({ matches: true }) };
    try {
      const root = stubTreeRoot(TREE_SPECS);
      const bound = bindTree(root);
      assert.ok(bound, 'tree binds under reduced motion');
      root.nodes[0].fire('click');
      assert.equal(bound.current, 0, 'selection still instant');
      assert.ok(root.panel.textContent.includes('Start'), 'status still announces');
    } finally {
      if (realWindow === undefined) delete globalThis.window;
      else globalThis.window = realWindow;
    }
  });

  it('fails safely on malformed DOM with the static list untouched', () => {
    assert.equal(bindTree({ querySelectorAll: () => [], querySelector: () => stubEl({}) }), null, 'no nodes does not bind');
    assert.equal(bindTree({ querySelectorAll: () => [stubEl({})], querySelector: () => null }), null, 'no status does not bind');
    assert.equal(bindTree(null), null, 'null root does not bind');
  });
});

describe('tree stylesheet and regression contract', () => {
  it('covers diagram, nodes, selection, focus, list, and print', () => {
    const css = read('style.css');
    for (const sel of [
      '.viz-tree-diagram', '.viz-tree-svg', '.viz-tnode.is-selected',
      '.viz-tree-list', '.viz-treenode', '.viz-treenode[aria-pressed="true"]',
      '.viz-treenode:focus-visible', '.viz-tnid', '.viz-tnmeta',
    ]) {
      assert.ok(css.includes(sel), `stylesheet covers ${sel}`);
    }
    assert.ok(!/width:\s*100vw/.test(css), 'no viewport-width traps introduced');
  });

  it('uses theme variables without hardcoded colors or animation', () => {
    const css = read('style.css');
    const block = css.slice(css.indexOf('Hierarchical tree viewer'));
    assert.ok(block.length > 200, 'tree block present');
    assert.ok(!/#[0-9a-fA-F]{3,8}/.test(block), 'theme variables only, all modes inherit');
    assert.ok(!/transition\s*:|animation\s*:|@keyframes/.test(block), 'no animation declarations to reduce');
    assert.ok(block.includes('@media print'), 'print behavior declared');
    assert.ok(block.includes('.viz-treenode:focus-visible'), 'visible keyboard focus');
  });

  it('keeps static output understandable without JS', () => {
    const out = transformCustomWidgets(SEARCH_TREE);
    assert.ok(out.includes('<ul class="viz-tree-list">'), 'nested semantic list present');
    assert.ok(out.includes('aria-hidden="true"'), 'diagram marked visual-only');
    assert.ok(!out.includes('is-live'), 'no live marker without JS');
    assert.ok(out.includes('Select a node to inspect'), 'prompt visible statically');
  });

  it('leaves flow, stepper, trace, lab, and structure unaffected', () => {
    assert.ok(transformCustomWidgets('::: viz flow Tour\n1. One\n2. Two\n:::').includes('class="viz viz-flow"'), 'flow still enhances');
    assert.ok(transformCustomWidgets('::: viz stepper Tour\n- One\n- Two\n:::').includes('class="viz viz-stepper"'), 'stepper still enhances');
    assert.ok(transformCustomWidgets('::: viz trace T\nstate | A\nop | Go\nstate | B\n:::').includes('class="viz viz-trace"'), 'trace still enhances');
    assert.ok(transformCustomWidgets('::: viz lab rtt Lab\nNotes.\n:::').includes('class="viz viz-lab"'), 'lab still enhances');
    assert.ok(transformCustomWidgets('::: viz structure T\nfield | A | 8 | meaning\n:::').includes('class="viz viz-struct"'), 'structure still enhances');
    const mixed = transformCustomWidgets('::: viz tree T\nnode | r | R\nnode | a | A | r\n:::\n\n::: viz trace U\nstate | A\nop | Go\nstate | B\n:::');
    assert.ok(mixed.includes('viz-tree') && mixed.includes('viz-trace'), 'tree and trace coexist on one page');
  });
});

const LONG_TREE = '::: viz tree Long labels\n'
  + 'node | root | Initial State Of Search\n'
  + 'node | a | Very Long Search State | root\n'
  + 'node | b | Goal State Reached | root\n'
  + 'node | c | Another Extremely Long Sibling Label | root\n:::';

const svgTexts = (out) => [...out.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
const viewBoxOf = (out) => /viewBox="([^"]+)"/.exec(out)?.[1];

describe('tree long-label hardening', () => {
  it('truncates SVG labels deterministically while keeping full labels in the list', () => {
    const out = transformCustomWidgets(LONG_TREE);
    assert.ok(out.includes('class="viz viz-tree"'), 'long-label tree still renders');
    for (const full of ['Initial State Of Search', 'Very Long Search State', 'Goal State Reached', 'Another Extremely Long Sibling Label']) {
      assert.ok(out.includes(full), `complete label preserved in semantic list: ${full.slice(0, 20)}`);
    }
    const texts = svgTexts(out);
    assert.equal(texts.length, 4, 'one SVG label per node');
    assert.ok(texts.every((t) => Array.from(t).length <= 12), 'every SVG label fits the node spacing');
    assert.ok(texts.some((t) => t.endsWith('…')), 'overlong labels truncated with ellipsis');
    assert.ok(texts.includes('Initial Sta…'), 'truncation is an exact 11-char prefix plus ellipsis');
  });

  it('leaves 12-character labels intact and truncates at 13', () => {
    const out = transformCustomWidgets('::: viz tree Bounds\nnode | r | ABCDEFGHIJKL\nnode | a | ABCDEFGHIJKLM | r\n:::');
    const texts = svgTexts(out);
    assert.ok(texts.includes('ABCDEFGHIJKL'), 'exactly-12 label untouched');
    assert.ok(texts.includes('ABCDEFGHIJK…'), '13-char label truncated');
  });

  it('keeps geometry label-independent and deterministic', () => {
    const short = transformCustomWidgets('::: viz tree S\nnode | root | R\nnode | a | A | root\nnode | b | B | root\nnode | c | C | root\n:::');
    assert.equal(viewBoxOf(transformCustomWidgets(LONG_TREE)), viewBoxOf(short), 'same shape renders same viewBox regardless of label length');
    assert.equal(viewBoxOf(short), '0 0 336 180', 'three-leaf geometry is exact');
    assert.equal(transformCustomWidgets(LONG_TREE), transformCustomWidgets(LONG_TREE), 'long-label rendering deterministic');
  });

  it('handles long labels across multiple levels without edge loss', () => {
    const out = transformCustomWidgets('::: viz tree Deep\nnode | r | Root Node With Words\nnode | a | Left Branch State | r\nnode | b | Right Branch State | r\nnode | c | Deep Leaf State Here | a\n:::');
    assert.equal((out.match(/class="viz-tedge"/g) || []).length, 3, 'edges number nodes minus one');
    assert.ok(svgTexts(out).every((t) => Array.from(t).length <= 12), 'deep labels bounded too');
    assert.ok(out.includes('Deep Leaf State Here'), 'deep full label in list');
  });

  it('locks the tiny search-tree reference geometry', () => {
    const out = transformCustomWidgets(SEARCH_TREE);
    assert.equal(viewBoxOf(out), '0 0 336 276', 'reference positions unchanged');
    assert.equal((out.match(/class="viz-tedge"/g) || []).length, 5, 'reference edges unchanged');
  });
});

describe('tree selection status', () => {
  it('names children for the root', () => {
    const root = stubTreeRoot(TREE_SPECS);
    const bound = bindTree(root);
    bound.select(0);
    assert.equal(root.panel.textContent, 'Selected Start — root — children: A, B.', 'root status names children');
  });

  it('names parent and children for internal nodes', () => {
    const root = stubTreeRoot(TREE_SPECS);
    const bound = bindTree(root);
    bound.select(1);
    assert.equal(root.panel.textContent, 'Selected A — child of Start — children: C, D.', 'internal status names parent and children');
  });

  it('identifies leaves without inventing children', () => {
    const root = stubTreeRoot(TREE_SPECS);
    const bound = bindTree(root);
    bound.select(2);
    assert.equal(root.panel.textContent, 'Selected B — child of Start — leaf.', 'leaf status identifies leaf');
  });

  it('announces long labels in full, never truncated', () => {
    const root = stubTreeRoot([
      { id: 'root', label: 'Initial State Of Search', parent: '', kids: 'Very Long Search State, Goal State Reached' },
      { id: 'a', label: 'Very Long Search State', parent: 'Initial State Of Search', kids: '' },
    ]);
    const bound = bindTree(root);
    bound.select(0);
    assert.ok(root.panel.textContent.includes('Initial State Of Search'), 'full root label in status');
    assert.ok(root.panel.textContent.includes('Very Long Search State, Goal State Reached'), 'full children labels in status');
    bound.select(1);
    assert.ok(root.panel.textContent.includes('Very Long Search State — child of Initial State Of Search — leaf'), 'full labels for leaf selection');
  });

  it('falls back to span text for markup without build-time facts', () => {
    const root = stubTreeRoot([{ id: 'x', meta: 'Xtra · leaf' }]);
    const bound = bindTree(root);
    assert.ok(bound, 'hand-written markup still binds');
    bound.select(0);
    assert.ok(root.panel.textContent.includes('Xtra'), 'fallback status reads span text');
  });
});

describe('tree accessibility hardening', () => {
  it('keeps node buttons natively keyboard-reachable with full labels', () => {
    const out = transformCustomWidgets(LONG_TREE);
    assert.ok(!out.includes('tabindex'), 'no tabindex manipulation — native tab order');
    assert.ok(out.includes('aria-pressed="false"'), 'selection state exposed');
    assert.ok(out.includes('role="status"'), 'status region present');
    for (const full of ['Initial State Of Search', 'Very Long Search State']) {
      const btn = out.match(new RegExp(`<button[^>]*data-label="${full}"[^>]*>`));
      assert.ok(btn, `button carries full label for assistive tech: ${full.slice(0, 20)}`);
    }
  });

  it('holds exactly one selection with Escape clearing', () => {
    const root = stubTreeRoot(TREE_SPECS);
    const bound = bindTree(root);
    bound.select(0);
    bound.select(1);
    assert.deepEqual(
      root.nodes.map((n) => n.getAttribute('aria-pressed')),
      ['false', 'true', 'false'],
      'exactly one node pressed'
    );
    root.fire('keydown', { key: 'Escape' });
    assert.ok(root.nodes.every((n) => n.getAttribute('aria-pressed') === 'false'), 'Escape clears all');
  });
});

const TRIANGLE_GRAPH = '::: viz graph Tiny triangle network\n'
  + 'node | a | A\n'
  + 'node | b | B\n'
  + 'node | c | C\n'
  + 'edge | a | b\n'
  + 'edge | b | c\n'
  + 'edge | c | a\n:::';

const ARROW_GRAPH = '::: viz graph directed Tiny directed graph\n'
  + 'node | a | A\n'
  + 'node | b | B\n'
  + 'edge | a | b\n:::';

describe('viz graph parser', () => {
  it('accepts a valid undirected graph with a cycle', () => {
    const parsed = parseGraphBody('node | a | A\nnode | b | B\nnode | c | C\nedge | a | b\nedge | b | c\nedge | c | a', false);
    assert.ok(parsed.ok, 'triangle cycle is valid for graphs');
    assert.deepEqual(parsed.order, ['a', 'b', 'c'], 'document order preserved');
  });

  it('accepts a valid directed graph with reversed edges as distinct', () => {
    assert.ok(parseGraphBody('node | a | A\nnode | b | B\nedge | a | b\nedge | b | a', true).ok, 'opposite directed edges coexist');
    assert.ok(parseGraphBody('node | s | Only', true).ok, 'isolated directed node valid');
  });

  it('accepts disconnected components and isolated nodes', () => {
    assert.ok(parseGraphBody('node | a | A\nnode | z | Z', false).ok, 'disconnected nodes valid');
    assert.ok(parseGraphBody('node | s | Only', false).ok, 'single isolated node valid');
  });

  it('parses the directed mode word off the head', () => {
    assert.deepEqual(parseGraphMode('directed Tiny directed graph'), { directed: true, title: 'Tiny directed graph' });
    assert.deepEqual(parseGraphMode('Tiny network'), { directed: false, title: 'Tiny network' });
    assert.deepEqual(parseGraphMode('DIRECTED X'), { directed: true, title: 'X' });
    assert.deepEqual(parseGraphMode(''), { directed: false, title: '' });
  });

  it('rejects every non-graph shape without guessing', () => {
    const cases = [
      ['duplicate ids', 'node | a | A\nnode | a | B', false, /duplicate/],
      ['empty id', 'node |  | X', false, /empty graph node id/],
      ['empty label', 'node | a | ', false, /empty graph node label/],
      ['unknown edge endpoint', 'node | a | A\nedge | a | z', false, /unknown graph edge endpoint/],
      ['duplicate edge', 'node | a | A\nnode | b | B\nedge | a | b\nedge | a | b', false, /duplicate graph edge/],
      ['reversed duplicate undirected', 'node | a | A\nnode | b | B\nedge | a | b\nedge | b | a', false, /duplicate graph edge/],
      ['self-loop undirected', 'node | a | A\nedge | a | a', false, /self-loop/],
      ['self-loop directed', 'node | a | A\nedge | a | a', true, /self-loop/],
      ['zero nodes', 'edge | a | b', false, /at least 1 node/],
      ['malformed node columns', 'node | a', false, /malformed graph node/],
      ['malformed edge columns', 'node | a | A\nedge | a', false, /malformed graph edge/],
      ['empty edge endpoint', 'node | a | A\nnode | b | B\nedge | a | ', false, /empty graph edge endpoint/],
      ['unknown line', 'node | a | A\nremember this', false, /unknown graph line/],
      ['unknown prefix', 'node | a | A\nlink | a | b', false, /unknown graph line/],
    ];
    for (const [label, body, directed, reason] of cases) {
      const parsed = parseGraphBody(body, directed);
      assert.equal(parsed.ok, false, `${label} rejected`);
      assert.match(parsed.reason, reason, `${label} reason precise`);
    }
  });

  it('leaves malformed graph blocks raw with no live shell', () => {
    const raws = [
      '::: viz graph Dup\nnode | a | A\nnode | a | B\n:::',
      '::: viz graph Loop\nnode | a | A\nedge | a | a\n:::',
      '::: viz graph Lost\nnode | a | A\nedge | a | z\n:::',
      '::: viz graph Empty\n\n\n:::',
      '::: viz graph directed Dup\nnode | a | A\nnode | b | B\nedge | a | b\nedge | a | b\n:::',
    ];
    for (const raw of raws) {
      const out = transformCustomWidgets(raw);
      assert.equal(out, raw, `stays raw: ${raw.slice(0, 40)}`);
      assert.ok(!out.includes('viz-graph'), 'no live graph shell');
      assert.ok(!out.includes('viz-graphnode'), 'no node controls');
    }
  });
});

describe('viz graph rendering', () => {
  it('renders undirected nodes, plain edges, and static fallback', () => {
    const out = transformCustomWidgets(TRIANGLE_GRAPH);
    assert.ok(out.includes('class="viz viz-graph"'), 'graph shell class');
    assert.ok(out.includes('data-nodes="3"') && out.includes('data-edges="3"'), 'counts advertised');
    assert.ok(out.includes('data-mode="undirected"'), 'mode advertised');
    assert.equal((out.match(/class="viz-gedge"/g) || []).length, 3, 'one line per edge');
    assert.ok(!out.includes('viz-garrow'), 'no arrows when undirected');
    assert.equal((out.match(/class="viz-graphnode"/g) || []).length, 3, 'one button per node');
    assert.ok(out.includes('connected to B, C') || out.includes('connected to'), 'relationships readable statically');
    assert.ok(out.includes('<ul class="viz-graph-list">'), 'flat semantic list present');
    assert.ok(out.includes('aria-hidden="true"'), 'diagram marked visual-only');
    assert.ok(!out.includes('is-live'), 'no live marker without JS');
    assert.ok(out.includes('role="status"'), 'polite live status region');
    assert.ok(out.includes('<button type="button" class="viz-graphnode"'), 'native buttons for keyboard use');
  });

  it('renders directed arrows with incoming/outgoing facts', () => {
    const out = transformCustomWidgets(ARROW_GRAPH);
    assert.ok(out.includes('data-mode="directed"'), 'directed mode advertised');
    assert.equal((out.match(/class="viz-garrow"/g) || []).length, 1, 'one arrowhead per directed edge');
    assert.ok(out.includes('outgoing: B'), 'outgoing fact rendered');
    assert.ok(out.includes('incoming: A'), 'incoming fact rendered');
  });

  it('renders isolated nodes with honest facts', () => {
    const out = transformCustomWidgets('::: viz graph Solo\nnode | s | Only\n:::');
    assert.ok(out.includes('data-nodes="1"') && out.includes('data-edges="0"'), 'counts advertised');
    assert.ok(!out.includes('viz-gedge'), 'no edges drawn');
    assert.ok(out.includes('isolated node'), 'isolation stated');
  });

  it('uses deterministic circle coordinates', () => {
    const a = transformCustomWidgets(TRIANGLE_GRAPH);
    assert.equal(a, transformCustomWidgets(TRIANGLE_GRAPH), 'identical input renders identically');
    assert.ok(a.includes('viewBox="0 0 360 260"'), 'fixed deterministic frame');
    assert.ok(a.includes('<circle cx="180" cy="48" r="22"/>'), 'first node at top of circle');
  });

  it('renders multiple graph widgets on one page', () => {
    const out = transformCustomWidgets(`${TRIANGLE_GRAPH}\n\n${ARROW_GRAPH}`);
    assert.equal((out.match(/class="viz viz-graph"/g) || []).length, 2, 'two live graph shells');
    assert.ok(out.includes('data-mode="undirected"') && out.includes('data-mode="directed"'), 'modes independent');
  });

  it('truncates long SVG labels but keeps full labels in list and buttons', () => {
    const long = transformCustomWidgets('::: viz graph Long\nnode | a | Initial State Of Search\nnode | b | Goal State Reached\nedge | a | b\n:::');
    assert.ok(long.includes('Initial State Of Search') && long.includes('Goal State Reached'), 'full labels in list');
    const texts = [...long.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
    assert.ok(texts.every((t) => Array.from(t).length <= 12), 'SVG labels bounded');
    assert.ok(texts.includes('Initial Sta…'), 'deterministic truncation');
  });

  it('preserves Unicode labels end to end', () => {
    const out = transformCustomWidgets('::: viz graph Uni\nnode | s | αβγ Start\nnode | g | Goal 🎯\nedge | s | g\n:::');
    assert.ok(out.includes('αβγ Start') && out.includes('Goal 🎯'), 'Unicode labels in list');
    assert.ok(out.includes('>αβγ Start<'), 'short Unicode label intact in diagram');
  });

  it('uses the tiny triangle reference shape', () => {
    const t = read('content/PCCST303/m3_06_bfs_dfs_shortest_paths.md');
    const block = t.match(/::: viz graph([\s\S]*?)\n:::/);
    assert.ok(block, 'reference block present in the BFS/DFS note');
    const out = transformCustomWidgets(block[0]);
    assert.ok(out.includes('class="viz viz-graph"'), 'reference renders live');
    assert.ok(out.includes('data-nodes="3"') && out.includes('data-edges="3"'), 'reference has three nodes and edges');
    assert.ok(!out.includes('viz-garrow'), 'reference is undirected');
  });
});

function stubGraphNode(spec) {
  const attrs = { 'data-node': spec.id };
  if (spec.label !== undefined) attrs['data-label'] = spec.label;
  if (spec.peers !== undefined) attrs['data-peers'] = spec.peers;
  if (spec.out !== undefined) attrs['data-out'] = spec.out;
  if (spec.inn !== undefined) attrs['data-in'] = spec.inn;
  const btn = stubEl(attrs);
  btn.querySelector = (sel) => {
    if (sel === '.viz-gnid') return { textContent: spec.label ?? '' };
    if (sel === '.viz-gnmeta') return { textContent: spec.meta ?? '' };
    return null;
  };
  let focused = false;
  btn.focus = () => { focused = true; };
  btn.isFocused = () => focused;
  return btn;
}

function stubGraphDot(id) {
  const dot = stubEl({ 'data-node': id });
  const classes = new Set();
  dot.classList = {
    add: (c) => classes.add(c),
    remove: (c) => classes.delete(c),
    has: (c) => classes.has(c),
  };
  return dot;
}

function stubGraphRoot(specs) {
  const nodes = specs.map((s) => stubGraphNode(s));
  const dots = specs.map((s) => stubGraphDot(s.id));
  const panel = stubEl({});
  panel.textContent = 'Select a node to inspect its connections.';
  const listeners = {};
  return {
    nodes,
    dots,
    panel,
    addEventListener(t, fn) { (listeners[t] = listeners[t] || []).push(fn); },
    fire(t, e = {}) { (listeners[t] || []).forEach((fn) => fn({ preventDefault() {}, ...e })); },
    classList: { add() {} },
    querySelector(sel) {
      if (sel === '.viz-status') return panel;
      return null;
    },
    querySelectorAll(sel) {
      if (sel === '.viz-graphnode') return nodes;
      if (sel === '.viz-gnode') return dots;
      return [];
    },
  };
}

const GRAPH_SPECS = [
  { id: 'a', label: 'A', peers: 'B, C' },
  { id: 'b', label: 'B', peers: 'A, C' },
  { id: 'c', label: 'C', peers: 'A, B' },
];

const DIGRAPH_SPECS = [
  { id: 'a', label: 'A', out: 'B', inn: '' },
  { id: 'b', label: 'B', out: '', inn: 'A' },
];

describe('graph binding on stub DOM', () => {
  it('selects on click with single pressed state, mirror, and peer status', () => {
    const root = stubGraphRoot(GRAPH_SPECS);
    const bound = bindGraph(root);
    assert.ok(bound, 'graph binds');
    assert.equal(bound.current, -1, 'nothing selected initially');
    root.nodes[0].fire('click');
    assert.equal(bound.current, 0);
    assert.equal(root.nodes[0].getAttribute('aria-pressed'), 'true', 'clicked node pressed');
    assert.equal(root.nodes[1].getAttribute('aria-pressed'), 'false', 'single selection only');
    assert.ok(root.dots[0].classList.has('is-selected'), 'diagram mirror highlights');
    assert.ok(!root.dots[1].classList.has('is-selected'), 'mirror is single too');
    assert.equal(root.panel.textContent, 'Selected A — connected to: B, C.', 'peer status names neighbors');
  });

  it('distinguishes outgoing and incoming for directed graphs', () => {
    const root = stubGraphRoot(DIGRAPH_SPECS);
    const bound = bindGraph(root);
    bound.select(0);
    assert.equal(root.panel.textContent, 'Selected A — outgoing: B.', 'source status');
    bound.select(1);
    assert.equal(root.panel.textContent, 'Selected B — incoming: A.', 'target status');
  });

  it('identifies isolated nodes without inventing connections', () => {
    const root = stubGraphRoot([{ id: 's', label: 'Only', peers: '' }]);
    bindGraph(root).select(0);
    assert.equal(root.panel.textContent, 'Selected Only — isolated node.', 'isolation stated');
    const diroot = stubGraphRoot([{ id: 's', label: 'Only', out: '', inn: '' }]);
    bindGraph(diroot).select(0);
    assert.equal(diroot.panel.textContent, 'Selected Only — isolated node.', 'directed isolation stated');
  });

  it('announces long labels in full, never truncated', () => {
    const root = stubGraphRoot([{ id: 'a', label: 'Initial State Of Search', peers: 'Goal State Reached' }]);
    bindGraph(root).select(0);
    assert.ok(root.panel.textContent.includes('Initial State Of Search'), 'full label in status');
    assert.ok(root.panel.textContent.includes('Goal State Reached'), 'full neighbor in status');
  });

  it('moves selection with arrows, Home, End, and clears with Escape', () => {
    const root = stubGraphRoot(GRAPH_SPECS);
    const bound = bindGraph(root);
    root.fire('keydown', { key: 'ArrowRight' });
    assert.equal(bound.current, 0, 'arrow selects from empty');
    assert.ok(root.nodes[0].isFocused(), 'focus follows selection');
    root.fire('keydown', { key: 'ArrowDown' });
    assert.equal(bound.current, 1);
    root.fire('keydown', { key: 'End' });
    assert.equal(bound.current, 2, 'End jumps last');
    root.fire('keydown', { key: 'Home' });
    assert.equal(bound.current, 0, 'Home jumps first');
    root.fire('keydown', { key: 'Escape' });
    assert.equal(bound.current, -1, 'Escape clears');
    assert.ok(root.panel.textContent.includes('Select a node'), 'prompt restored');
    assert.ok(root.nodes.every((n) => n.getAttribute('aria-pressed') === 'false'), 'all unpressed after clear');
  });

  it('keeps multiple graph widgets independent', () => {
    const first = stubGraphRoot(GRAPH_SPECS);
    const second = stubGraphRoot(GRAPH_SPECS);
    const a = bindGraph(first);
    const b = bindGraph(second);
    a.select(2);
    assert.ok(first.panel.textContent.includes('C'), 'first selects C');
    assert.ok(second.panel.textContent.includes('Select a node'), 'second untouched');
    b.select(0);
    assert.ok(first.panel.textContent.includes('C'), 'first untouched by second');
  });

  it('selects under prefers-reduced-motion with no autoplay surface', () => {
    const realWindow = globalThis.window;
    globalThis.window = { matchMedia: () => ({ matches: true }) };
    try {
      const root = stubGraphRoot(GRAPH_SPECS);
      const bound = bindGraph(root);
      assert.ok(bound, 'graph binds under reduced motion');
      root.nodes[0].fire('click');
      assert.equal(bound.current, 0, 'selection still instant');
    } finally {
      if (realWindow === undefined) delete globalThis.window;
      else globalThis.window = realWindow;
    }
  });

  it('fails safely on malformed DOM with the static list untouched', () => {
    assert.equal(bindGraph({ querySelectorAll: () => [], querySelector: () => stubEl({}) }), null, 'no nodes does not bind');
    assert.equal(bindGraph({ querySelectorAll: () => [stubEl({})], querySelector: () => null }), null, 'no status does not bind');
    assert.equal(bindGraph(null), null, 'null root does not bind');
  });

  it('falls back to span text for markup without build-time facts', () => {
    const root = stubGraphRoot([{ id: 'x', meta: 'Xtra · connected to Y' }]);
    const bound = bindGraph(root);
    assert.ok(bound, 'hand-written markup still binds');
    bound.select(0);
    assert.ok(root.panel.textContent.includes('Xtra'), 'fallback status reads span text');
  });
});

describe('graph stylesheet and regression contract', () => {
  it('covers diagram, edges, arrows, nodes, selection, focus, list, and print', () => {
    const css = read('style.css');
    for (const sel of [
      '.viz-graph-diagram', '.viz-graph-svg', '.viz-gedge', '.viz-garrow',
      '.viz-gnode.is-selected', '.viz-graph-list', '.viz-graphnode',
      '.viz-graphnode[aria-pressed="true"]', '.viz-graphnode:focus-visible',
      '.viz-gnid', '.viz-gnmeta',
    ]) {
      assert.ok(css.includes(sel), `stylesheet covers ${sel}`);
    }
    assert.ok(!/width:\s*100vw/.test(css), 'no viewport-width traps introduced');
  });

  it('uses theme variables without hardcoded colors or animation', () => {
    const css = read('style.css');
    const block = css.slice(css.indexOf('General graph viewer'));
    assert.ok(block.length > 200, 'graph block present');
    assert.ok(!/#[0-9a-fA-F]{3,8}/.test(block), 'theme variables only, all modes inherit');
    assert.ok(!/transition\s*:|animation\s*:|@keyframes/.test(block), 'no animation declarations to reduce');
    assert.ok(block.includes('@media print'), 'print behavior declared');
    assert.ok(block.includes('.viz-graphnode:focus-visible'), 'visible keyboard focus');
  });

  it('leaves flow, stepper, trace, lab, structure, and tree unaffected', () => {
    assert.ok(transformCustomWidgets('::: viz flow Tour\n1. One\n2. Two\n:::').includes('class="viz viz-flow"'), 'flow still enhances');
    assert.ok(transformCustomWidgets('::: viz stepper Tour\n- One\n- Two\n:::').includes('class="viz viz-stepper"'), 'stepper still enhances');
    assert.ok(transformCustomWidgets('::: viz trace T\nstate | A\nop | Go\nstate | B\n:::').includes('class="viz viz-trace"'), 'trace still enhances');
    assert.ok(transformCustomWidgets('::: viz lab rtt Lab\nNotes.\n:::').includes('class="viz viz-lab"'), 'lab still enhances');
    assert.ok(transformCustomWidgets('::: viz structure T\nfield | A | 8 | meaning\n:::').includes('class="viz viz-struct"'), 'structure still enhances');
    assert.ok(transformCustomWidgets('::: viz tree T\nnode | r | R\nnode | a | A | r\n:::').includes('class="viz viz-tree"'), 'tree still enhances');
    const mixed = transformCustomWidgets(`${TRIANGLE_GRAPH}\n\n::: viz tree T\nnode | r | R\nnode | a | A | r\n:::`);
    assert.ok(mixed.includes('viz-graph') && mixed.includes('viz-tree'), 'graph and tree coexist on one page');
  });
});
