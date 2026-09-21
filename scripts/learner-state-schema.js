/**
 * Node-side entry point for the canonical Learner-State Schema Registry.
 *
 * The implementation lives in assets/learner-state-schema.js so browsers
 * and Node share one dependency-free copy (the published static bundle
 * only ships assets/, never scripts/). This module re-exports it for
 * repo-side conventions (tests, QA) without duplicating any logic — the
 * same pattern as scripts/weak-topic-analysis.js over
 * assets/weak-topic-analysis.js.
 */
export * from '../assets/learner-state-schema.js';
