/**
 * Shared topic metadata loading + validation — reusable implementation for
 * loading data/topic-schema.json and topic metadata JSON objects and
 * validating metadata against the schema, used by scripts/check.js.
 * Zero dependencies; ES module style like the rest of scripts/.
 *
 * Only schema/metadata loading + schema-driven checks (required fields,
 * types, enums, patterns, ranges, array structure, blank values),
 * Markdown front-matter parsing, and curriculum/content cross-checks
 * (courseCode, module, sequence, id) live here. Detailed
 * curriculum/content consistency checks stay in scripts/check.js, which
 * converts loader failures and returned error strings into collected QA
 * failures, while scripts/build.js attaches validated metadata to its
 * internal topic representation via parseAndValidateTopicFrontMatter.
 * Markdown migration, HTML generation, learner state, and UI logic live
 * elsewhere.
 *
 * Throws a TopicMetadataError (Error with .code and .cause) on load
 * problems so callers can map failures to their own reporting;
 * validateTopicMetadata returns an array of error strings (empty = valid).
 */
import fs from 'fs';
import path from 'path';
import { CURRICULUM_PATH } from './curriculum.js';

export const TOPIC_SCHEMA_PATH = path.join('data', 'topic-schema.json');
export const TOPIC_METADATA_EXAMPLE_PATH = path.join('data', 'topic-metadata.example.json');

export const TOPIC_SCHEMA_READ_ERROR = 'TOPIC_SCHEMA_READ_ERROR';
export const TOPIC_SCHEMA_PARSE_ERROR = 'TOPIC_SCHEMA_PARSE_ERROR';
export const TOPIC_METADATA_READ_ERROR = 'TOPIC_METADATA_READ_ERROR';
export const TOPIC_METADATA_PARSE_ERROR = 'TOPIC_METADATA_PARSE_ERROR';
export const TOPIC_METADATA_VALIDATION_ERROR = 'TOPIC_METADATA_VALIDATION_ERROR';

function topicMetadataError(code, message, cause) {
  const err = new Error(message);
  err.code = code;
  if (cause !== undefined) err.cause = cause;
  return err;
}

function loadJsonFile(filePath, readCode, parseCode, describe) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    throw topicMetadataError(
      readCode,
      `Cannot read ${describe} from ${filePath}: ${err.message}.`,
      err
    );
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw topicMetadataError(
      parseCode,
      `Cannot parse ${describe} in ${filePath}: ${err.message}.`,
      err
    );
  }
}

// Load and parse the canonical topic metadata schema
// (data/topic-schema.json). No structural validation of the schema
// itself — it is the shared contract, interpreted by
// validateTopicMetadata below.
export function loadTopicSchema(schemaPath = TOPIC_SCHEMA_PATH) {
  return loadJsonFile(schemaPath, TOPIC_SCHEMA_READ_ERROR, TOPIC_SCHEMA_PARSE_ERROR, 'topic metadata schema');
}

// Load and parse one topic metadata JSON object (e.g.
// data/topic-metadata.example.json). Structural checks belong to
// validateTopicMetadata, not here.
export function loadTopicMetadata(metadataPath = TOPIC_METADATA_EXAMPLE_PATH) {
  return loadJsonFile(metadataPath, TOPIC_METADATA_READ_ERROR, TOPIC_METADATA_PARSE_ERROR, 'topic metadata');
}

// Minimal YAML-subset parser for topic front-matter blocks (dependency-
// free by design — no JSON-schema/YAML package). Supports exactly the
// shapes data/topic-schema.json needs: `key: scalar` pairs (integers or
// plain strings, optional surrounding quotes), `key: []` empty arrays,
// `key:` followed by `- item` block-list lines, `#` comments, and blank
// lines. Anything else throws a TopicMetadataError.
function parseYamlSubset(source) {
  const result = {};
  const lines = source.split(/\r?\n/);
  let listKey = null;
  const parseScalar = (text) => {
    const t = text.trim();
    if (/^-?\d+$/.test(t)) return parseInt(t, 10);
    const quoted = t.match(/^(['"])(.*)\1$/);
    return quoted ? quoted[2] : t;
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item) {
      if (listKey === null) {
        throw topicMetadataError(
          TOPIC_METADATA_PARSE_ERROR,
          `Invalid front-matter YAML at line ${i + 1}: list item without a preceding "key:".`
        );
      }
      result[listKey].push(parseScalar(item[1]));
      continue;
    }
    const pair = line.match(/^([A-Za-z0-9_]+):(?:\s+(.*))?\s*$/);
    if (!pair) {
      throw topicMetadataError(
        TOPIC_METADATA_PARSE_ERROR,
        `Invalid front-matter YAML at line ${i + 1}: expected "key: value" — actual: ${JSON.stringify(line.trim().slice(0, 60))}.`
      );
    }
    const key = pair[1];
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      throw topicMetadataError(
        TOPIC_METADATA_PARSE_ERROR,
        `Invalid front-matter YAML at line ${i + 1}: duplicate key "${key}".`
      );
    }
    const value = (pair[2] ?? '').trim();
    if (value === '') {
      result[key] = [];
      listKey = key;
    } else if (value === '[]') {
      result[key] = [];
      listKey = null;
    } else {
      result[key] = parseScalar(value);
      listKey = null;
    }
  }
  return result;
}

// Split one Markdown topic into front-matter metadata + renderable body.
// Only a `---` block at the very beginning of the file counts; every
// other topic passes through with metadata null and body unchanged, so
// metadata stays optional during the migration phase. Malformed blocks
// throw a TopicMetadataError (callers fail loudly, like the rest of the
// pipeline).
export function parseTopicFrontMatter(markdownText) {
  const match = markdownText.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    if (markdownText.startsWith('---')) {
      throw topicMetadataError(
        TOPIC_METADATA_PARSE_ERROR,
        'Invalid topic front-matter: file starts with `---` but has no closing `---` delimiter.'
      );
    }
    return { metadata: null, body: markdownText };
  }
  return { metadata: parseYamlSubset(match[1]), body: markdownText.slice(match[0].length) };
}

// Parse front-matter and validate it in one step for build-pipeline use.
// Returns { metadata, body }; metadata is null for topics without front
// matter, so metadata stays optional. Throws a TopicMetadataError when
// present metadata fails validation (fails loudly, like the rest of the
// build) — validation itself is never duplicated by callers.
export function parseAndValidateTopicFrontMatter(
  markdownText,
  { schema, curriculumDoc = null, contentDir = 'content', label = 'topic-metadata' } = {}
) {
  const { metadata, body } = parseTopicFrontMatter(markdownText);
  if (metadata === null) return { metadata: null, body };
  const errors = validateTopicMetadata(metadata, { schema, curriculumDoc, contentDir, label });
  if (errors.length) {
    throw topicMetadataError(
      TOPIC_METADATA_VALIDATION_ERROR,
      `${label} has invalid topic metadata:\n- ${errors.join('\n- ')}`
    );
  }
  return { metadata, body };
}

function typeMatches(value, type) {
  if (type === 'integer') return typeof value === 'number' && Number.isInteger(value);
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (type === 'array') return Array.isArray(value);
  return typeof value === type;
}

// Validate one metadata object against the schema plus curriculum/content
// cross-checks. Returns an array of error strings (empty when valid).
// - schema: parsed data/topic-schema.json (required)
// - curriculumDoc: parsed data/curriculum.json or null (course/module
//   cross-checks are skipped when null)
// - contentDir: content root for the id→.md existence check
// - label: prefix for every error string (callers pass the file path so
//   messages name the offending file)
export function validateTopicMetadata(
  metadata,
  { schema, curriculumDoc = null, contentDir = 'content', label = 'topic-metadata' } = {}
) {
  const errors = [];
  const where = label;
  const props = (schema && schema.properties && typeof schema.properties === 'object') ? schema.properties : {};

  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    errors.push(`${where} must be a JSON object — actual: ${Array.isArray(metadata) ? 'array' : typeof metadata}`);
    return errors;
  }

  for (const key of (schema.required || [])) {
    if (!Object.prototype.hasOwnProperty.call(metadata, key)) errors.push(`${where} is missing required field "${key}"`);
  }
  if (schema.additionalProperties === false) {
    for (const key of Object.keys(metadata)) {
      if (!Object.prototype.hasOwnProperty.call(props, key)) errors.push(`${where} has unexpected field "${key}" (schema allows no additional properties)`);
    }
  }

  const checkValue = (v, def, fieldLabel) => {
    if (!def || typeof def !== 'object') return;
    if (def.type && !typeMatches(v, def.type)) {
      errors.push(`${where} field "${fieldLabel}" must be ${def.type} — actual: ${Array.isArray(v) ? 'array' : typeof v}`);
      return;
    }
    if (def.enum && !def.enum.includes(v)) {
      errors.push(`${where} field "${fieldLabel}" must be one of [${def.enum.join(', ')}] — actual: ${JSON.stringify(v)}`);
    }
    if (typeof v === 'string') {
      if (def.minLength !== undefined && v.length < def.minLength) errors.push(`${where} field "${fieldLabel}" must be at least ${def.minLength} character(s) — actual: empty`);
      if (def.maxLength !== undefined && v.length > def.maxLength) errors.push(`${where} field "${fieldLabel}" must be at most ${def.maxLength} characters — actual: ${v.length}`);
      if (def.pattern && !(new RegExp(def.pattern).test(v))) errors.push(`${where} field "${fieldLabel}" must match ${def.pattern} — actual: ${JSON.stringify(v)}`);
      if (def.minLength && !v.trim()) errors.push(`${where} field "${fieldLabel}" must not be blank/whitespace-only`);
    }
    if (typeof v === 'number') {
      if (def.minimum !== undefined && v < def.minimum) errors.push(`${where} field "${fieldLabel}" must be >= ${def.minimum} — actual: ${v}`);
      if (def.maximum !== undefined && v > def.maximum) errors.push(`${where} field "${fieldLabel}" must be <= ${def.maximum} — actual: ${v}`);
    }
    if (Array.isArray(v)) {
      if (def.minItems !== undefined && v.length < def.minItems) errors.push(`${where} field "${fieldLabel}" must have at least ${def.minItems} item(s) — actual: ${v.length}`);
      if (def.items) v.forEach((item, i) => checkValue(item, def.items, `${fieldLabel}[${i}]`));
    }
  };
  for (const [key, def] of Object.entries(props)) {
    if (Object.prototype.hasOwnProperty.call(metadata, key)) checkValue(metadata[key], def, key);
  }

  // Cross-checks against the repo (only when values are well-formed).
  const modNum = metadata.module;
  const seqNum = metadata.sequence;
  if (typeof metadata.courseCode === 'string' && curriculumDoc) {
    if (!Object.prototype.hasOwnProperty.call(curriculumDoc.curriculum, metadata.courseCode)) {
      errors.push(`${where} courseCode "${metadata.courseCode}" is not a course in ${CURRICULUM_PATH} — expected an existing course`);
    } else if (Number.isInteger(modNum)) {
      const nums = curriculumDoc.curriculum[metadata.courseCode].modules.map((m) => m.number);
      if (!nums.includes(modNum)) errors.push(`${where} module ${modNum} is not a module of "${metadata.courseCode}" in ${CURRICULUM_PATH} — expected one of [${nums.join(', ')}]`);
    }
  }
  if (typeof metadata.id === 'string' && Number.isInteger(modNum) && Number.isInteger(seqNum)) {
    const prefix = `m${modNum}_${String(seqNum).padStart(2, '0')}_`;
    if (!metadata.id.startsWith(prefix)) errors.push(`${where} id "${metadata.id}" does not match the m{module}_{sequence}_ filename convention — expected prefix "${prefix}"`);
  }
  if (typeof metadata.id === 'string' && typeof metadata.courseCode === 'string') {
    const md = path.join(contentDir, metadata.courseCode, `${metadata.id}.md`);
    if (!fs.existsSync(md)) errors.push(`${where} id "${metadata.id}" has no content file ${md} — expected the fixture to describe a real topic`);
  }
  return errors;
}
