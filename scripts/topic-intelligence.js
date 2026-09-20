/**
 * Node-side entry point for the canonical Topic Intelligence Layer.
 *
 * The implementation lives in assets/topic-intelligence.js so browsers and
 * Node share one dependency-free copy (the published static bundle only
 * ships assets/, never scripts/). This module re-exports it for repo-side
 * conventions (tests, QA) without duplicating any logic — the same pattern
 * as scripts/learner-path.js over assets/learner-path.js.
 */
export * from '../assets/topic-intelligence.js';
