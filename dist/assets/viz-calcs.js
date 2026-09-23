/**
 * Tarangam lab calculation registry — the single source of truth for
 * interactive numerical labs (`::: viz lab <id>`, see scripts/widgets.js).
 *
 * Canonical home is THIS file (assets/viz-calcs.js): the browser engine
 * (assets/viz.js) imports it relatively, and the Node build side imports
 * it through scripts/viz-calcs.js (re-export shim, following the
 * scripts/adaptive-learning.js precedent). One registry, two runtimes —
 * never two competing calculator architectures.
 *
 * Safety contract: specs are declarative data (inputs, outputs, formula
 * text). There is no eval, no expression parsing, no code generation —
 * each calculation is an explicitly registered pure function. Computing
 * never touches the DOM, so every family is unit-testable in Node.
 *
 * Spec shape:
 * - formula: Markdown string (MathJax `$` delimiters preserved) shown
 *   above every lab using this calculation.
 * - inputs[]: {key, label, unit, min, max, step, sliderStep, def, int,
 *   slider, desc}. `slider:false` means number-input only (precision).
 *   Paired sliders share the input's min/max but may step more coarsely;
 *   the number field is always the single source of truth, so the pair
 *   cannot drift — and an invalid number never rewrites the slider.
 * - outputs[]: {key, label, unit, fmt ('int' | 'num2'), meaning}.
 * - disclaimer: fixed textbook-model honesty line.
 * - validate(values) -> {errors, clean}: missing/non-numeric/range
 *   violations produce per-input messages; NOTHING is silently coerced.
 * - compute(clean) -> {key: number}: pure math, deterministic IEEE.
 * - explain(values, results): Markdown with substituted numbers for the
 *   static worked example (defaults) rendered at build time.
 */

export function formatInt(n) {
  const r = Math.round(Number(n));
  if (!Number.isFinite(r)) return '—';
  const sign = r < 0 ? '-' : '';
  const digits = String(Math.abs(r)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return sign + digits;
}

export function formatNum2(n) {
  // Three significant figures: keeps mid-range values readable (6.66)
  // without collapsing small-but-nonzero ratios (0.001) to a bare "0".
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  if (v === 0) return '0';
  return String(Number(v.toPrecision(3)));
}

function checkInput(spec, raw, errors, clean) {
  const v = raw === undefined || raw === null ? '' : String(raw).trim();
  if (v === '') {
    errors[spec.key] = 'Enter a value.';
    return;
  }
  const n = Number(v);
  if (!Number.isFinite(n)) {
    errors[spec.key] = 'Must be a number.';
    return;
  }
  if (spec.int && !Number.isInteger(n)) {
    errors[spec.key] = 'Must be a whole number.';
    return;
  }
  if (n < spec.min || n > spec.max) {
    errors[spec.key] = `Must be between ${spec.min} and ${spec.max}${spec.unit ? ` ${spec.unit}` : ''}.`;
    return;
  }
  clean[spec.key] = n;
}

export function validateInputs(spec, values) {
  const errors = {};
  const clean = {};
  for (const inp of spec.inputs) checkInput(inp, values[inp.key], errors, clean);
  return { errors, clean };
}

export const LABS = {
  rtt: {
    formula: 'Non-persistent $= (2\\cdot RTT + T) + N\\cdot(2\\cdot RTT + T)$ · Persistent $= (2\\cdot RTT + T) + N\\cdot(RTT + T)$ · Pipelined $= (2\\cdot RTT + T) + (RTT + N\\cdot T)$',
    inputs: [
      { key: 'n', label: 'Objects N', unit: 'objects', min: 0, max: 32, step: 1, sliderStep: 1, def: 5, int: true, slider: true, desc: 'Embedded objects on the page (the base HTML is counted by the formulas).' },
      { key: 'rtt', label: 'RTT', unit: 'ms', min: 0, max: 1000, step: 1, sliderStep: 5, def: 50, int: false, slider: true, desc: 'One small-packet round trip between client and server.' },
      { key: 't', label: 'Transfer per object', unit: 'ms', min: 0, max: 1000, step: 1, sliderStep: 5, def: 10, int: false, slider: true, desc: 'Transmission time of a single object.' },
    ],
    outputs: [
      { key: 'nonpersistent', label: 'Non-persistent', unit: 'ms', fmt: 'int', meaning: 'Fresh handshake per object.' },
      { key: 'persistent', label: 'Persistent', unit: 'ms', fmt: 'int', meaning: 'One handshake, reused connection.' },
      { key: 'pipelined', label: 'Pipelined', unit: 'ms', fmt: 'int', meaning: 'Batched exchanges share one round trip.' },
    ],
    disclaimer: 'Textbook comparison model — not a measurement of real browser performance.',
    validate(values) {
      return validateInputs(LABS.rtt, values);
    },
    compute(v) {
      const base = 2 * v.rtt + v.t;
      return {
        nonpersistent: base + v.n * (2 * v.rtt + v.t),
        persistent: base + v.n * (v.rtt + v.t),
        pipelined: base + (v.rtt + v.n * v.t),
      };
    },
    explain(v, r) {
      return `With N=${formatInt(v.n)}, RTT=${formatInt(v.rtt)} ms, T=${formatInt(v.t)} ms: Non-persistent ${formatInt(r.nonpersistent)} ms · Persistent ${formatInt(r.persistent)} ms · Pipelined ${formatInt(r.pipelined)} ms.`;
    },
  },

  shannon: {
    formula: 'Shannon $C = B\\log_2(1 + SNR)$, $SNR = 10^{dB/10}$ · Nyquist $C = 2B\\log_2 L$ · binding limit $= \\min(\\text{Shannon}, \\text{Nyquist})$',
    inputs: [
      { key: 'b', label: 'Bandwidth B', unit: 'Hz', min: 1, max: 20000, step: 1, sliderStep: 100, def: 3000, int: false, slider: true, desc: 'Channel bandwidth in hertz.' },
      { key: 'db', label: 'SNR', unit: 'dB', min: -30, max: 100, step: 1, sliderStep: 1, def: 30, int: false, slider: true, desc: 'Signal-to-noise ratio in decibels (converted before use).' },
      { key: 'levels', label: 'Signal levels L', unit: 'levels', min: 2, max: 1024, step: 1, sliderStep: 1, def: 8, int: true, slider: false, desc: 'Discrete signaling levels for the Nyquist ceiling.' },
    ],
    outputs: [
      { key: 'snr', label: 'SNR (linear)', unit: 'ratio', fmt: 'num2', meaning: 'Converted from decibels for the formula.' },
      { key: 'shannon', label: 'Shannon capacity', unit: 'bps', fmt: 'int', meaning: 'Noisy-channel law: nothing exceeds it error-free.' },
      { key: 'nyquist', label: 'Nyquist ceiling', unit: 'bps', fmt: 'int', meaning: 'Noiseless ideal for these levels.' },
      { key: 'verdict', label: 'Binding limit', unit: 'bps', fmt: 'int', meaning: 'The lower ceiling governs.' },
    ],
    disclaimer: 'Textbook laws with ideal assumptions — not measured modem throughput.',
    validate(values) {
      return validateInputs(LABS.shannon, values);
    },
    compute(v) {
      const snr = 10 ** (v.db / 10);
      const shannon = v.b * Math.log2(1 + snr);
      const nyquist = 2 * v.b * Math.log2(v.levels);
      return { snr, shannon, nyquist, verdict: Math.min(shannon, nyquist) };
    },
    explain(v, r) {
      const which = r.shannon <= r.nyquist ? 'Shannon binds' : 'Nyquist binds';
      return `With B=${formatInt(v.b)} Hz, SNR=${formatInt(v.db)} dB (linear ${formatNum2(r.snr)}), L=${formatInt(v.levels)}: Shannon ${formatInt(r.shannon)} bps vs Nyquist ${formatInt(r.nyquist)} bps — ${which} at ${formatInt(r.verdict)} bps.`;
    },
  },
};

export const LAB_IDS = Object.keys(LABS);

export function getLab(id) {
  return Object.prototype.hasOwnProperty.call(LABS, id) ? LABS[id] : null;
}

export function validateLab(id, values) {
  const spec = getLab(id);
  if (!spec) return { errors: { _lab: `Unknown calculation "${id}".` }, clean: {} };
  return spec.validate(values);
}

export function computeLab(id, cleanValues) {
  const spec = getLab(id);
  if (!spec) return null;
  return spec.compute(cleanValues);
}

export function formatOutput(spec, key, value) {
  const out = spec.outputs.find((o) => o.key === key);
  const fmt = out ? out.fmt : 'int';
  const unit = out && out.unit ? ` ${out.unit}` : '';
  const text = fmt === 'num2' ? formatNum2(value) : formatInt(value);
  return text === '—' ? '—' : `${text}${unit}`;
}
