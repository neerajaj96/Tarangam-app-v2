/**
 * Node-side entry point for the unified Learning Journey model.
 *
 * The implementation lives in assets/learning-journey.js so browsers and
 * Node share one dependency-free copy (the published static bundle only
 * ships assets/, never scripts/). This module re-exports it for repo-side
 * conventions (tests, QA) without duplicating any logic — the same pattern
 * as scripts/topic-intelligence.js over assets/topic-intelligence.js.
 */
export * from '../assets/learning-journey.js';
