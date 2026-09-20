/**
 * Node-side entry point for the deterministic Revision & Review Layer.
 *
 * The implementation lives in assets/revision.js so browsers and
 * Node share one dependency-free copy (the published static bundle only
 * ships assets/, never scripts/). This module re-exports it for repo-side
 * conventions (tests, QA) without duplicating any logic — the same pattern
 * as scripts/exam-readiness.js over assets/exam-readiness.js.
 */
export * from '../assets/revision.js';
