/**
 * Node-side entry point for the canonical Course & Module Overview Layer.
 *
 * The implementation lives in assets/course-overview.js so browsers and
 * Node share one dependency-free copy (the published static bundle only
 * ships assets/, never scripts/). This module re-exports it for repo-side
 * conventions (tests, QA) without duplicating any logic — the same pattern
 * as scripts/adaptive-learning.js over assets/adaptive-learning.js.
 */
export * from '../assets/course-overview.js';
