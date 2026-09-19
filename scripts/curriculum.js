/**
 * Shared curriculum loader — one reusable implementation for loading and
 * basically validating data/curriculum.json, used by scripts/build.js and
 * scripts/check.js. Zero dependencies; ES module style like the rest of
 * scripts/.
 *
 * Only file loading + JSON parsing + required top-level structure
 * ("curriculum" object, "dashboardOrder" array) live here. Detailed
 * curriculum/content consistency checks stay in scripts/check.js.
 *
 * Throws a CurriculumError (Error with .code and .cause) on any problem so
 * callers can map failures to their own reporting: the build lets it fail
 * loudly, the checker converts it into a collected QA failure.
 */
import fs from 'fs';
import path from 'path';

export const CURRICULUM_PATH = path.join('data', 'curriculum.json');

export const CURRICULUM_READ_ERROR = 'CURRICULUM_READ_ERROR';
export const CURRICULUM_PARSE_ERROR = 'CURRICULUM_PARSE_ERROR';
export const CURRICULUM_SHAPE_ERROR = 'CURRICULUM_SHAPE_ERROR';

function curriculumError(code, message, cause) {
  const err = new Error(message);
  err.code = code;
  if (cause !== undefined) err.cause = cause;
  return err;
}

export function loadCurriculum(curriculumPath = CURRICULUM_PATH) {
  let raw;
  try {
    raw = fs.readFileSync(curriculumPath, 'utf-8');
  } catch (err) {
    throw curriculumError(
      CURRICULUM_READ_ERROR,
      `Cannot load curriculum metadata from ${curriculumPath}: ${err.message}. ` +
        `data/curriculum.json is the single source of truth; there is no hardcoded fallback.`,
      err
    );
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw curriculumError(
      CURRICULUM_PARSE_ERROR,
      `Cannot parse ${curriculumPath}: ${err.message}. ` +
        `Fix the JSON — there is no hardcoded fallback.`,
      err
    );
  }
  if (
    !parsed || typeof parsed !== 'object' ||
    !parsed.curriculum || typeof parsed.curriculum !== 'object' ||
    !Array.isArray(parsed.dashboardOrder)
  ) {
    throw curriculumError(
      CURRICULUM_SHAPE_ERROR,
      `${curriculumPath} must contain a top-level "curriculum" object and a ` +
        `"dashboardOrder" array. Fix the JSON — there is no hardcoded fallback.`
    );
  }
  return parsed;
}
