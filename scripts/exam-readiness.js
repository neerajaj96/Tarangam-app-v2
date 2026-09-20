/**
 * Node-side entry point for the deterministic Exam Readiness Layer.
 *
 * The implementation lives in assets/exam-readiness.js so browsers and
 * Node share one dependency-free copy (the published static bundle only
 * ships assets/, never scripts/). This module re-exports it for repo-side
 * conventions (tests, QA) without duplicating any logic — the same pattern
 * as scripts/learning-journey.js over assets/learning-journey.js.
 */
export * from '../assets/exam-readiness.js';
