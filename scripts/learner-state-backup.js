/**
 * Node-side entry point for the canonical Learner-State Backup & Restore.
 *
 * The implementation lives in assets/learner-state-backup.js so browsers
 * and Node share one dependency-free copy (the published static bundle
 * only ships assets/, never scripts/). This module re-exports it for
 * repo-side conventions (tests, QA) without duplicating any logic — the
 * same pattern as scripts/learner-state-schema.js over
 * assets/learner-state-schema.js.
 */
export * from '../assets/learner-state-backup.js';
