/**
 * Node-side entry point for the learner path engine.
 *
 * The implementation lives in assets/learner-path.js so browsers and
 * Node share one dependency-free copy (the published static bundle only
 * ships assets/, never scripts/). This module re-exports it for
 * repo-side conventions (tests, QA) without duplicating any logic.
 */
export * from '../assets/learner-path.js';
