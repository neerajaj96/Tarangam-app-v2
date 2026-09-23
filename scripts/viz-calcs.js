/**
 * Node-side entry to the canonical lab calculation registry.
 *
 * The registry itself lives in assets/viz-calcs.js (shipped to browsers);
 * this module only re-exports it for the build pipeline (widgets.js,
 * check.js) and the test suite — the same pattern as
 * scripts/adaptive-learning.js re-exporting its assets twin. One
 * registry, two runtimes; never two competing calculator architectures.
 */
export * from '../assets/viz-calcs.js';
