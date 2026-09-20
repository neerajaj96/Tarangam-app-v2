/**
 * Node-side entry point for the canonical Deterministic Learning Analytics
 * Layer.
 *
 * The implementation lives in assets/learning-analytics.js so browsers and
 * Node share one dependency-free copy (the published static bundle only
 * ships assets/, never scripts/). This module re-exports it for repo-side
 * conventions (tests, QA) without duplicating any logic — the same pattern
 * as scripts/revision.js over assets/revision.js.
 */
export * from '../assets/learning-analytics.js';
