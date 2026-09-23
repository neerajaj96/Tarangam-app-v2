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
import { createStepper, bindViz, bindTabs, bindCompare, bindRtt, bindLab, bindStruct, calcRtt, VIZ_PLAY_INTERVAL_MS } from '../assets/viz.js';
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
