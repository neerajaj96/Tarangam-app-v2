/**
 * Tarangam canonical Deterministic Study Planning Layer (browser + Node,
 * no dependencies).
 *
 * Pure planning math over the existing canonical modules:
 * - ./topic-intelligence.js (canonical recommendation order, prerequisite
 *   relationships, manifest order)
 * - ./exam-readiness.js (exam-relevant sets, weights)
 * - ./revision.js (review queues and priority order)
 * - ./learner-state.js progress via an injected getStatus reader plus
 *   timestamps via an injected getTimestamp reader (never read directly —
 *   no DOM, no storage here).
 * No DOM, no fetch, no Markdown, no AI/ML, no prediction of behaviour or
 * retention, no gamification. Nothing locks or gates the learner; a plan
 * only describes how an explicit target maps onto recorded facts.
 *
 * Plan configuration (explicit, local-only — see PLAN_CONFIG_KEY):
 * - targetType: "completion" | "exam" | "review" (anything else = no plan).
 * - targetValue: completion → topic count to complete (default: all
 *   remaining in scope); exam → readiness percent 1–100 (default 100);
 *   review → ignored (goal is always an empty due/overdue queue).
 * - minutesPerDay: available study minutes per day, must be a finite
 *   number > 0 for scheduling.
 * - courseScope / moduleScope: optional course code / module number that
 *   restrict the candidate set (moduleScope applies only with courseScope).
 * - targetDate: optional ISO date string or millisecond timestamp.
 *
 * Topic selection (documented priority, deterministic):
 * 1. Candidate set by target: unfinished in-scope topics (completion);
 *    unfinished exam-relevant in-scope prefix reaching the target percent
 *    (exam); due/overdue in-scope queue in revision priority order (review).
 * 2. Base order is the canonical recommendation order
 *    (getRecommendedNextTopics) — which already surfaces in-progress work,
 *    unfinished prerequisite blockers, then curriculum order — or the
 *    revision queue order for review targets. The planner consumes these
 *    orders; it never replaces them.
 * 3. A stable prerequisite-order repair (Kahn pass keyed on the base order)
 *    guarantees a topic never lands on an earlier day than its unfinished
 *    in-plan prerequisites. Relative base order is otherwise preserved.
 * 4. Curriculum (manifest) order is the final tie-break everywhere.
 *
 * Daily scheduling (deterministic buckets):
 * - Topics fill Day 1, Day 2, … in plan order; a topic whose known minutes
 *   would exceed the daily budget starts a new day (unless the day is
 *   empty — topics are never split, even when one topic exceeds the whole
 *   budget).
 * - Topics with unknown estimatedMinutes ride along on the current day
 *   without consuming budget (explicitly documented; they contribute 0 to
 *   minute sums and are counted in unknownMinutesCount).
 * - Same inputs always produce the same plan (no randomization).
 *
 * Target-date arithmetic (calendar days only, no success judgments):
 * - availableDays = ceil((targetDate − now) / DAY_MS), minimum 0.
 * - requiredMinutesPerDay = remainingMinutes / availableDays.
 * - dateFeasibility: "already_reached" (nothing remaining),
 *   "insufficient_data" (no usable budget/minutes or unparseable date),
 *   "feasible" (required ≤ available), "requires_more_time" (otherwise).
 *
 * Plan states (arithmetic states, not judgments):
 * - "no_plan" (no/invalid config), "target_reached" (nothing remaining),
 *   "insufficient_data" (cannot schedule: bad budget, unknown minutes with
 *   a deadline, or unparseable date), "on_track" (scheduled, no deadline
 *   pressure), "requires_more_time" (deadline needs a higher daily budget).
 */

import {
  STATUS_COMPLETED,
  topicKey,
  getTopic,
  getRecommendedNextTopics,
} from './topic-intelligence.js';
import {
  isExamRelevantTopic,
  weightForTopic,
  getRemainingExamTopics,
  buildExamReadiness,
} from './exam-readiness.js';
import { getReviewQueue, getReviewStateForTopic, getAssessmentAwareReviewQueue, getAssessmentAwareReviewState } from './revision.js';

export const PLAN_CONFIG_KEY = 'tarangam_study_plan_v1';

export const PLAN_TARGET_COMPLETION = 'completion';
export const PLAN_TARGET_EXAM = 'exam';
export const PLAN_TARGET_REVIEW = 'review';
export const PLAN_TARGET_TYPES = [PLAN_TARGET_COMPLETION, PLAN_TARGET_EXAM, PLAN_TARGET_REVIEW];

export const PLAN_STATUS_NO_PLAN = 'no_plan';
export const PLAN_STATUS_ON_TRACK = 'on_track';
export const PLAN_STATUS_REQUIRES_MORE_TIME = 'requires_more_time';
export const PLAN_STATUS_TARGET_REACHED = 'target_reached';
export const PLAN_STATUS_INSUFFICIENT_DATA = 'insufficient_data';

export const PLAN_FEASIBLE = 'feasible';
export const PLAN_FEASIBLE_REQUIRES_MORE_TIME = 'requires_more_time';
export const PLAN_FEASIBLE_ALREADY_REACHED = 'already_reached';
export const PLAN_FEASIBLE_INSUFFICIENT_DATA = 'insufficient_data';

export const DAY_MS = 24 * 3600 * 1000;

// --- Internal guards --------------------------------------------------------

function manifestTopics(manifest) {
  return manifest && Array.isArray(manifest.topics) ? manifest.topics : [];
}

function readStatus(getStatus, courseCode, topicId) {
  try {
    const s = getStatus(courseCode, topicId);
    if (s === STATUS_COMPLETED) return STATUS_COMPLETED;
    if (s === 'in_progress') return 'in_progress';
    return 'not_started';
  } catch {
    return 'not_started';
  }
}

function resolveNow(now) {
  return typeof now === 'number' && Number.isFinite(now) ? now : Date.now();
}

function prereqIds(topic) {
  return topic && Array.isArray(topic.prerequisites) ? topic.prerequisites : [];
}

function knownMinutes(topic) {
  return typeof topic.estimatedMinutes === 'number' && Number.isFinite(topic.estimatedMinutes)
    ? topic.estimatedMinutes
    : null;
}

function manifestIndex(manifest) {
  return new Map(manifestTopics(manifest).map((t, i) => [topicKey(t.courseCode, t.id), i]));
}

// --- Plan configuration ---------------------------------------------------------

function sanitizeConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) return null;
  if (!PLAN_TARGET_TYPES.includes(config.targetType)) return null;
  const out = { targetType: config.targetType };
  if (config.targetValue !== undefined && config.targetValue !== null) {
    const v = Number(config.targetValue);
    if (Number.isFinite(v)) out.targetValue = v;
  }
  if (config.minutesPerDay !== undefined && config.minutesPerDay !== null) {
    const m = Number(config.minutesPerDay);
    if (Number.isFinite(m)) out.minutesPerDay = m;
  }
  if (typeof config.courseScope === 'string' && config.courseScope.trim()) {
    out.courseScope = config.courseScope.trim();
  }
  if (config.moduleScope !== undefined && config.moduleScope !== null && out.courseScope) {
    const mod = Number(config.moduleScope);
    if (Number.isFinite(mod)) out.moduleScope = mod;
  }
  if (config.targetDate !== undefined && config.targetDate !== null && config.targetDate !== '') {
    out.targetDate = typeof config.targetDate === 'number' ? config.targetDate : String(config.targetDate);
  }
  return out;
}

export function normalizePlanConfig(config) {
  return sanitizeConfig(config);
}

function defaultStorage() {
  try {
    if (typeof globalThis.localStorage !== 'undefined') {
      globalThis.localStorage.getItem('__tarangam_probe__');
      return globalThis.localStorage;
    }
  } catch {
    // fall through to null (callers treat null as unavailable)
  }
  return null;
}

// Persist only the explicit plan configuration — never learner progress.
export function savePlanConfig(config, storage) {
  const clean = sanitizeConfig(config);
  const store = storage || defaultStorage();
  if (!store) return false;
  try {
    if (!clean) store.removeItem(PLAN_CONFIG_KEY);
    else store.setItem(PLAN_CONFIG_KEY, JSON.stringify({ ...clean, savedAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

export function loadPlanConfig(storage) {
  const store = storage || defaultStorage();
  if (!store) return null;
  try {
    const raw = store.getItem(PLAN_CONFIG_KEY);
    if (typeof raw !== 'string' || !raw) return null;
    const parsed = JSON.parse(raw);
    return sanitizeConfig(parsed);
  } catch {
    return null;
  }
}

export function clearPlanConfig(storage) {
  const store = storage || defaultStorage();
  if (!store) return false;
  try {
    store.removeItem(PLAN_CONFIG_KEY);
    return true;
  } catch {
    return false;
  }
}

// --- Scope --------------------------------------------------------------------------

function inScope(topic, config) {
  if (config.courseScope && topic.courseCode !== config.courseScope) return false;
  if (config.moduleScope !== undefined && topic.module !== config.moduleScope) return false;
  return true;
}

// --- Candidate selection ---------------------------------------------------------------

function unfinishedInScope(manifest, safeStatus, config) {
  return manifestTopics(manifest).filter((t) =>
    inScope(t, config) && safeStatus(t.courseCode, t.id) !== STATUS_COMPLETED);
}

// Exam candidates: unfinished exam-relevant in-scope topics, walked in plan
// order, accumulating weight until the target percent is reached.
function examCandidates(manifest, safeStatus, orderedUnfinished, config, targetPercent) {
  const exam = buildExamReadiness(manifest, safeStatus);
  const total = exam.weightedTotal;
  const earned = exam.weightedCompleted;
  const need = Math.ceil((targetPercent / 100) * total) - earned;
  if (need <= 0) return [];
  const picked = [];
  let acc = 0;
  for (const t of orderedUnfinished) {
    if (!isExamRelevantTopic(t)) continue;
    picked.push(t);
    acc += weightForTopic(t);
    if (acc >= need) break;
  }
  return picked;
}

// Stable prerequisite-order repair (Kahn pass keyed on base order):
// a topic is emitted only after its unfinished in-plan prerequisites;
// ties always resolve to the earliest base-order position. Cycle-safe:
// leftovers append in base order. Deterministic.
function repairPrerequisiteOrder(manifest, safeStatus, candidates, rankOf) {
  const keys = new Set(candidates.map((t) => topicKey(t.courseCode, t.id)));
  const byKey = new Map(candidates.map((t) => [topicKey(t.courseCode, t.id), t]));
  const inPlanPrereqs = new Map();
  for (const t of candidates) {
    const deps = prereqIds(t).filter((p) => {
      const key = topicKey(t.courseCode, p);
      return keys.has(key) && safeStatus(t.courseCode, p) !== STATUS_COMPLETED;
    });
    inPlanPrereqs.set(topicKey(t.courseCode, t.id), new Set(deps));
  }
  const ordered = [...candidates].sort((a, b) => rankOf(a) - rankOf(b));
  const emitted = new Set();
  const result = [];
  let progressed = true;
  while (result.length < candidates.length && progressed) {
    progressed = false;
    for (const t of ordered) {
      const key = topicKey(t.courseCode, t.id);
      if (emitted.has(key)) continue;
      const deps = inPlanPrereqs.get(key);
      let ready = true;
      for (const d of deps) {
        if (!emitted.has(d)) { ready = false; break; }
      }
      if (ready) {
        emitted.add(key);
        result.push(byKey.get(key));
        progressed = true;
      }
    }
  }
  for (const t of ordered) {
    const key = topicKey(t.courseCode, t.id);
    if (!emitted.has(key)) result.push(byKey.get(key));
  }
  return result;
}

// Unfinished prerequisite blockers in scope: unfinished topics that are a
// direct prerequisite of another unfinished in-scope topic.
function blockerKeys(manifest, safeStatus, config) {
  const unfinished = new Set(
    unfinishedInScope(manifest, safeStatus, config).map((t) => topicKey(t.courseCode, t.id))
  );
  const blockers = new Set();
  for (const t of manifestTopics(manifest)) {
    if (!inScope(t, config)) continue;
    if (safeStatus(t.courseCode, t.id) === STATUS_COMPLETED) continue;
    for (const p of prereqIds(t)) {
      const key = topicKey(t.courseCode, p);
      if (unfinished.has(key)) blockers.add(key);
    }
  }
  return blockers;
}

export function explainPlanReason(manifest, safeStatus, topic, context) {
  const title = topic.title || topic.id;
  const parts = [];
  if (context.isBlocker) parts.push(`prerequisite blocker for ${context.blockedCount} unfinished ${context.blockedCount === 1 ? 'topic' : 'topics'}`);
  if (context.isReviewOverdue) parts.push(`review-overdue (${context.daysSince} days)`);
  else if (context.isReviewDue) parts.push(`due for review (${context.daysSince} days)`);
  else if (context.isAssessmentNeedsReview) parts.push('assessment needs review');
  if (context.isExamRelevant) parts.push(`exam-relevant (${topic.examRelevance})`);
  if (context.recommendationRank !== null && context.recommendationRank !== undefined) {
    parts.push(`canonical recommendation #${context.recommendationRank + 1}`);
  }
  if (!parts.length) parts.push('next in curriculum order');
  return `“${title}” is in the plan: ${parts.join('; ')}.`;
}

// --- Daily scheduling ----------------------------------------------------------------------

function scheduleDays(orderedTopics, minutesPerDay) {
  const days = [];
  let current = { day: 1, topics: [], minutes: 0 };
  const pushDay = () => {
    if (current.topics.length) days.push(current);
  };
  for (const t of orderedTopics) {
    const mins = knownMinutes(t);
    if (mins === null) {
      if (!current.topics.length && days.length === 0) {
        // fall through: first topic rides on day 1 even without minutes
      }
      current.topics.push(t);
      continue;
    }
    if (current.topics.length && current.minutes + mins > minutesPerDay) {
      pushDay();
      current = { day: days.length + 1, topics: [], minutes: 0 };
    }
    current.topics.push(t);
    current.minutes += mins;
  }
  pushDay();
  return days.map((d, i) => ({ day: i + 1, topics: d.topics, minutes: d.minutes }));
}

// --- Target-date arithmetic ---------------------------------------------------------------------

function parseTargetDate(targetDate) {
  if (targetDate === undefined || targetDate === null || targetDate === '') return { present: false, ms: null };
  const ms = typeof targetDate === 'number' ? targetDate : Date.parse(targetDate);
  if (!Number.isFinite(ms)) return { present: true, ms: null };
  return { present: true, ms };
}

// --- Plan builder ----------------------------------------------------------------------------------

export function buildStudyPlan(manifest, getStatus, getTimestamp, config, now, assessment) {
  const current = resolveNow(now);
  const clean = sanitizeConfig(config);
  const topics = manifestTopics(manifest);
  const safeStatus = (c, id) => readStatus(getStatus, c, id);
  const indexOf = manifestIndex(manifest);
  const hasAssessment = assessment && typeof assessment === 'object' && assessment.bank;

  if (!clean || !topics.length) {
    return {
      status: PLAN_STATUS_NO_PLAN,
      targetType: (clean && clean.targetType) || null,
      explanation: clean
        ? 'No plan: the curriculum manifest holds no topics.'
        : 'No plan: configure an explicit study target first — nothing is fabricated.',
      currentState: null,
      targetState: null,
      remainingTopics: [],
      excludedTopics: [],
      reviewIncluded: [],
      remainingMinutes: 0,
      unknownMinutesCount: 0,
      availableMinutesPerDay: null,
      requiredMinutesPerDay: null,
      estimatedDays: 0,
      dailyPlan: [],
      todayTopics: [],
      upcomingDays: [],
      dateFeasibility: null,
      availableDays: null,
      planNextTopics: [],
      config: clean,
      now: current,
    };
  }

  const scopeLabel = clean.courseScope
    ? (clean.moduleScope !== undefined ? `${clean.courseScope} module ${clean.moduleScope}` : clean.courseScope)
    : 'whole curriculum';

  // Candidate set + current/target state per target type.
  // Base order: canonical recommendation order first (in-progress, blockers,
  // ready), then any remaining unfinished topics in manifest order — so the
  // planner consumes the recommendation without dropping not-yet-ready work.
  const inScopeUnfinished = unfinishedInScope(manifest, safeStatus, clean);
  const inScopeUnfinishedKeys = new Set(inScopeUnfinished.map((t) => topicKey(t.courseCode, t.id)));
  const recommendedKeys = new Set(
    getRecommendedNextTopics(manifest, safeStatus).map((t) => topicKey(t.courseCode, t.id))
  );
  const fullBaseOrder = [
    ...getRecommendedNextTopics(manifest, safeStatus).filter((t) => inScopeUnfinishedKeys.has(topicKey(t.courseCode, t.id))),
    ...manifestTopics(manifest).filter((t) => {
      const key = topicKey(t.courseCode, t.id);
      return inScopeUnfinishedKeys.has(key) && !recommendedKeys.has(key);
    }),
  ];
  let candidates = [];
  let currentState = null;
  let targetState = null;
  let reviewIncluded = [];
  let baseOrder = [];
  if (clean.targetType === PLAN_TARGET_COMPLETION) {
    const completedInScope = manifestTopics(manifest).filter((t) =>
      inScope(t, clean) && safeStatus(t.courseCode, t.id) === STATUS_COMPLETED).length;
    const totalInScope = manifestTopics(manifest).filter((t) => inScope(t, clean)).length;
    let goal = totalInScope;
    if (clean.targetValue !== undefined) {
      goal = Math.max(completedInScope, Math.min(totalInScope, Math.floor(clean.targetValue)));
    }
    const need = Math.max(0, goal - completedInScope);
    currentState = { completed: completedInScope, total: totalInScope };
    targetState = { goal, unit: 'topics' };
    baseOrder = fullBaseOrder;
    candidates = baseOrder.slice(0, need);
    reviewIncluded = reviewBacklogInScope(manifest, safeStatus, getTimestamp, clean, current);
  } else if (clean.targetType === PLAN_TARGET_EXAM) {
    const exam = buildExamReadiness(manifest, safeStatus);
    let pct = 100;
    if (clean.targetValue !== undefined) {
      pct = Math.max(1, Math.min(100, clean.targetValue));
    }
    currentState = { readinessPercent: exam.readinessPercent, weightedCompleted: exam.weightedCompleted, weightedTotal: exam.weightedTotal };
    targetState = { goalPercent: pct, unit: 'readiness percent' };
    baseOrder = fullBaseOrder;
    if (exam.readinessPercent < pct) {
      candidates = examCandidates(manifest, safeStatus, baseOrder, clean, pct);
    }
    reviewIncluded = reviewBacklogInScope(manifest, safeStatus, getTimestamp, clean, current);
  } else {
    // review target: due/overdue in-scope queue in revision priority order.
    // With assessment evidence, needs_review topics join the same queue
    // after overdue/due (existing overdue priority stays stronger);
    // prerequisite-order repair below is unchanged.
    const queue = hasAssessment
      ? getAssessmentAwareReviewQueue(manifest, safeStatus, getTimestamp, current, assessment).filter((e) => inScope(e, clean))
      : getReviewQueue(manifest, safeStatus, getTimestamp, current).filter((e) => inScope(e, clean));
    const assessmentDriven = hasAssessment ? queue.filter((e) => e.isAssessmentDriven).length : 0;
    currentState = { dueAndOverdue: queue.length, assessmentDriven };
    targetState = { goal: 0, unit: 'remaining due topics' };
    baseOrder = queue.map((e) => e.topic);
    candidates = [...baseOrder];
    reviewIncluded = queue;
  }

  // Prerequisite-order repair over the base order.
  const rankOf = (t) => {
    const i = baseOrder.findIndex((b) => topicKey(b.courseCode, b.id) === topicKey(t.courseCode, t.id));
    if (i >= 0) return i;
    return indexOf.get(topicKey(t.courseCode, t.id)) ?? 0;
  };
  const ordered = repairPrerequisiteOrder(manifest, safeStatus, candidates, rankOf);

  // Excluded by scope: same need-set outside the scope, manifest order.
  const excludedTopics = excludedByScope(manifest, safeStatus, getTimestamp, clean, current);

  // Minutes.
  let remainingMinutes = 0;
  let unknownMinutesCount = 0;
  for (const t of ordered) {
    const mins = knownMinutes(t);
    if (mins === null) unknownMinutesCount += 1;
    else remainingMinutes += mins;
  }

  // Reasons per planned topic.
  const blockers = blockerKeys(manifest, safeStatus, clean);
  const reviewStateOf = (t) => {
    try {
      return getReviewStateForTopic(manifest, safeStatus, getTimestamp, t.courseCode, t.id, current);
    } catch {
      return { state: 'fresh', daysSince: null };
    }
  };
  const assessmentDrivenOf = (t) => {
    if (!hasAssessment) return false;
    try {
      const aware = getAssessmentAwareReviewState(manifest, safeStatus, getTimestamp, t.courseCode, t.id, current, assessment);
      return Boolean(aware.isAssessmentDriven);
    } catch {
      return false;
    }
  };
  const plannedTopics = ordered.map((t) => {
    const key = topicKey(t.courseCode, t.id);
    const blockedCount = countBlockedBy(manifest, safeStatus, clean, t);
    const rs = reviewStateOf(t);
    const recRank = baseOrder.findIndex((b) => topicKey(b.courseCode, b.id) === key);
    return {
      courseCode: t.courseCode,
      id: t.id,
      title: t.title,
      module: t.module,
      examRelevance: t.examRelevance ?? null,
      estimatedMinutes: knownMinutes(t),
      isAssessmentDriven: assessmentDrivenOf(t),
      reason: explainPlanReason(manifest, safeStatus, t, {
        isBlocker: blockers.has(key),
        blockedCount,
        isReviewOverdue: rs.state === 'review_overdue',
        isReviewDue: rs.state === 'review_due',
        daysSince: rs.daysSince,
        isAssessmentNeedsReview: assessmentDrivenOf(t),
        isExamRelevant: isExamRelevantTopic(t),
        recommendationRank: recRank >= 0 ? recRank : null,
      }),
    };
  });

  const reached = ordered.length === 0;
  const budget = clean.minutesPerDay;
  const budgetValid = typeof budget === 'number' && Number.isFinite(budget) && budget > 0;
  const date = parseTargetDate(clean.targetDate);

  // Scheduling.
  let dailyPlan = [];
  let estimatedDays = 0;
  if (!reached && budgetValid) {
    dailyPlan = scheduleDays(ordered, budget).map((d) => ({
      day: d.day,
      topics: d.topics.map((t) => {
        const found = plannedTopics.find((p) => p.courseCode === t.courseCode && p.id === t.id);
        return found || { courseCode: t.courseCode, id: t.id, title: t.title, estimatedMinutes: knownMinutes(t) };
      }),
      minutes: d.minutes,
    }));
    estimatedDays = dailyPlan.length;
  }

  // Required minutes/day + status + date feasibility (arithmetic only).
  let requiredMinutesPerDay = null;
  let status = PLAN_STATUS_NO_PLAN;
  let dateFeasibility = null;
  let availableDays = null;
  if (reached) {
    status = PLAN_STATUS_TARGET_REACHED;
    if (date.present) dateFeasibility = date.ms === null ? PLAN_FEASIBLE_INSUFFICIENT_DATA : PLAN_FEASIBLE_ALREADY_REACHED;
  } else if (!budgetValid) {
    status = PLAN_STATUS_INSUFFICIENT_DATA;
    if (date.present) dateFeasibility = PLAN_FEASIBLE_INSUFFICIENT_DATA;
  } else if (date.present && date.ms === null) {
    status = PLAN_STATUS_INSUFFICIENT_DATA;
    dateFeasibility = PLAN_FEASIBLE_INSUFFICIENT_DATA;
  } else if (date.present) {
    availableDays = Math.max(0, Math.ceil((date.ms - current) / DAY_MS));
    if (availableDays <= 0) {
      status = PLAN_STATUS_REQUIRES_MORE_TIME;
      dateFeasibility = PLAN_FEASIBLE_REQUIRES_MORE_TIME;
    } else {
      requiredMinutesPerDay = remainingMinutes / availableDays;
      if (requiredMinutesPerDay <= budget) {
        status = PLAN_STATUS_ON_TRACK;
        dateFeasibility = PLAN_FEASIBLE;
      } else {
        status = PLAN_STATUS_REQUIRES_MORE_TIME;
        dateFeasibility = PLAN_FEASIBLE_REQUIRES_MORE_TIME;
      }
    }
  } else {
    status = PLAN_STATUS_ON_TRACK;
    requiredMinutesPerDay = estimatedDays > 0 ? remainingMinutes / estimatedDays : null;
  }

  // All-unknown-minutes with a deadline cannot yield a daily requirement.
  if (!reached && date.present && date.ms !== null && availableDays > 0 && remainingMinutes === 0 && ordered.length > 0) {
    requiredMinutesPerDay = 0;
  }

  const todayTopics = dailyPlan.length ? dailyPlan[0].topics : [];
  const upcomingDays = dailyPlan.slice(1);
  const planNextTopics = plannedTopics.slice(0, 5);

  const explanation = explainPlan(manifest, clean, scopeLabel, ordered.length, remainingMinutes, unknownMinutesCount, budget, estimatedDays, requiredMinutesPerDay, status);

  return {
    status,
    targetType: clean.targetType,
    explanation,
    currentState,
    targetState,
    remainingTopics: plannedTopics,
    excludedTopics,
    reviewIncluded: reviewIncluded.map((e) => ({
      courseCode: e.courseCode, id: e.id, title: e.title || e.topic?.title,
      reviewState: e.reviewState, daysSince: e.daysSince,
    })),
    remainingMinutes,
    unknownMinutesCount,
    availableMinutesPerDay: budgetValid ? budget : null,
    requiredMinutesPerDay,
    estimatedDays,
    dailyPlan,
    todayTopics,
    upcomingDays,
    dateFeasibility,
    availableDays,
    planNextTopics,
    config: clean,
    now: current,
  };
}

function inScopeUnfinishedSet(list, topic) {
  return list.some((t) => t.courseCode === topic.courseCode && t.id === topic.id);
}

function reviewBacklogInScope(manifest, safeStatus, getTimestamp, config, now) {
  return getReviewQueue(manifest, safeStatus, getTimestamp, now).filter((e) => inScope(e, config));
}

function excludedByScope(manifest, safeStatus, getTimestamp, config, now) {
  if (!config.courseScope && config.moduleScope === undefined) return [];
  const out = [];
  if (config.targetType === PLAN_TARGET_REVIEW) {
    for (const e of getReviewQueue(manifest, safeStatus, getTimestamp, now)) {
      if (!inScope(e, config)) out.push({ courseCode: e.courseCode, id: e.id, title: e.title || e.topic?.title });
    }
    return out;
  }
  const examOnly = config.targetType === PLAN_TARGET_EXAM;
  for (const t of manifestTopics(manifest)) {
    if (inScope(t, config)) continue;
    if (safeStatus(t.courseCode, t.id) === STATUS_COMPLETED) continue;
    if (examOnly && !isExamRelevantTopic(t)) continue;
    out.push({ courseCode: t.courseCode, id: t.id, title: t.title });
  }
  return out;
}

function countBlockedBy(manifest, safeStatus, config, topic) {
  const key = topicKey(topic.courseCode, topic.id);
  let n = 0;
  for (const t of manifestTopics(manifest)) {
    if (t.courseCode !== topic.courseCode) continue;
    if (safeStatus(t.courseCode, t.id) === STATUS_COMPLETED) continue;
    if (prereqIds(t).includes(topic.id) && topicKey(t.courseCode, t.id) !== key) n += 1;
  }
  void config;
  return n;
}

function explainPlan(manifest, config, scopeLabel, count, minutes, unknownCount, budget, days, required, status) {
  void manifest;
  const unknownPart = unknownCount > 0
    ? ` ${unknownCount} ${unknownCount === 1 ? 'topic rides' : 'topics ride'} along without consuming budget (unknown estimatedMinutes).`
    : '';
  const budgetPart = budget ? ` Daily budget ${budget} min over ${days} ${days === 1 ? 'day' : 'days'}.` : ' No daily budget set.';
  const requiredPart = required !== null && required !== undefined
    ? ` Required pace ${required} min/day (exact arithmetic: ${minutes} remaining min).`
    : '';
  return `Plan for ${config.targetType} over ${scopeLabel}: ${count} ${count === 1 ? 'topic' : 'topics'}, ${minutes} known remaining minutes, prerequisite order preserved, canonical recommendation order otherwise kept.${unknownPart}${budgetPart}${requiredPart} Status ${status} is arithmetic only.`;
}

// --- Per-topic plan membership ----------------------------------------------------------------------

export function getTopicPlanDay(plan, courseCode, topicId) {
  if (!plan || !Array.isArray(plan.dailyPlan)) return null;
  for (const day of plan.dailyPlan) {
    if (day.topics.some((t) => t.courseCode === courseCode && t.id === topicId)) return day.day;
  }
  return null;
}

export function isTopicPlanned(plan, courseCode, topicId) {
  return getTopicPlanDay(plan, courseCode, topicId) !== null;
}

export function explainTopicPlanMembership(plan, courseCode, topicId) {
  const day = getTopicPlanDay(plan, courseCode, topicId);
  if (day === null) return null;
  const entry = plan.dailyPlan[day - 1].topics.find((t) => t.courseCode === courseCode && t.id === topicId);
  const mins = entry && entry.estimatedMinutes !== null && entry.estimatedMinutes !== undefined
    ? `${entry.estimatedMinutes} min`
    : 'unknown minutes (rides along)';
  const reason = entry && entry.reason ? ` ${entry.reason}` : '';
  return `Planned for day ${day} (${mins}).${reason}`;
}
